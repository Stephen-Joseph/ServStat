import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameServer, ServerStatus, ServerType } from '../types/server';

const STORAGE_KEY = 'game-servers';

// Fetch Minecraft server status
async function fetchMinecraftStatus(address: string, port: number): Promise<ServerStatus> {
  try {
    const response = await fetch(`https://api.mcsrvstat.us/2/${address}:${port}`);
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return {
      online: data.online || false,
      players: data.players ? {
        online: data.players.online || 0,
        max: data.players.max || 0,
        list: data.players.list || [],
      } : undefined,
      version: data.version,
      motd: data.motd?.clean?.[0] || data.motd?.raw?.[0],
      icon: data.icon,
      latency: data.debug?.ping,
    };
  } catch {
    return { online: false };
  }
}

// Fetch MTA:SA server status (using legacy browser API)
async function fetchMTAStatus(address: string, port: number): Promise<ServerStatus> {
  try {
    // Try to use GameState API or similar public MTA API
    const response = await fetch(`https://api.game-state.com/MTASA/${address}/${port}/`, {
      mode: 'cors',
    }).catch(() => null);
    
    if (!response || !response.ok) {
      // Fallback: try to at least ping the server
      return { 
        online: false,
        motd: 'MTA:SA server - status check not available via browser CORS',
      };
    }
    
    const data = await response.json();
    return {
      online: data.online || false,
      players: data.players ? {
        online: data.players.online || 0,
        max: data.players.max || 0,
        list: data.players.list || [],
      } : undefined,
      version: data.version,
      motd: data.name || data.hostname,
      gamemode: data.gamemode,
      map: data.map,
      latency: data.ping,
    };
  } catch {
    return { 
      online: false,
      motd: 'MTA:SA server - status check not available via browser CORS',
    };
  }
}

// Fetch SA-MP server status using samp-api.com
async function fetchSAMPStatus(address: string, port: number): Promise<ServerStatus> {
  try {
    // Try samp-api.com which supports CORS
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(`https://samp-api.com/api/v1/server/${address}/${port}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeout);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    console.log(`[SA-MP] ${address}:${port} response:`, data);
    
    // Check if server is actually online based on response
    if (data.error || data.players === undefined) {
      console.log(`[SA-MP] ${address}:${port} appears offline:`, data.error || 'No player data');
      return { online: false };
    }
    
    // Server is online - build proper status
    const playerList = data.playerlist || data.players_list || [];
    const playerCount = typeof data.players === 'number' ? data.players : 0;
    const maxPlayers = typeof data.maxplayers === 'number' ? data.maxplayers : 0;
    
    return {
      online: true,
      players: {
        online: playerCount,
        max: maxPlayers,
        list: playerList,
      },
      motd: data.hostname || data.name || `${address}:${port}`,
      gamemode: data.gamemode || data.game_mode || 'Unknown',
      map: data.map || data.mapname || 'Unknown',
      rules: data.rules,
    };
  } catch (err) {
    console.error(`[SA-MP] Primary API failed for ${address}:${port}:`, err);
    
    // Fallback: try alternative API
    try {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 8000);
      
      const response2 = await fetch(`https://api.basterserver.com/samp-query?ip=${address}&port=${port}`, {
        signal: controller2.signal,
      });
      clearTimeout(timeout2);
      
      if (response2.ok) {
        const data2 = await response2.json();
        console.log(`[SA-MP] Fallback API ${address}:${port} response:`, data2);
        
        if (data2.online === false) {
          return { online: false };
        }
        
        return {
          online: true,
          players: data2.players ? {
            online: data2.players.online || 0,
            max: data2.players.max || 0,
            list: data2.players.list || [],
          } : undefined,
          motd: data2.hostname || data2.name || `${address}:${port}`,
          gamemode: data2.gamemode,
          map: data2.map,
        };
      }
    } catch (err2) {
      console.error(`[SA-MP] Both APIs failed for ${address}:${port}:`, err2);
    }
    return { online: false };
  }
}

// Fetch status based on server type
async function fetchServerStatus(type: ServerType, address: string, port: number): Promise<ServerStatus> {
  switch (type) {
    case 'minecraft':
      return fetchMinecraftStatus(address, port);
    case 'mtasa':
      return fetchMTAStatus(address, port);
    case 'samp':
      return fetchSAMPStatus(address, port);
    default:
      return { online: false };
  }
}

export function useServers() {
  const [servers, setServers] = useState<GameServer[]>([]);
  const [loading, setLoading] = useState(true);
  const serversRef = useRef<GameServer[]>([]);
  
  // Keep ref in sync with state
  serversRef.current = servers;

  // Load servers from localStorage on mount (keeping last known status)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Restore servers with their last known status (convert date strings back to Date objects)
        setServers(parsed.map((s: GameServer) => ({
          ...s,
          lastUpdated: s.lastUpdated ? new Date(s.lastUpdated) : undefined,
        })));
      } catch {
        setServers([]);
      }
    }
    setLoading(false);
  }, []);

  // Save servers to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
    }
  }, [servers, loading]);

  // Auto-refresh all servers every 60 seconds
  useEffect(() => {
    if (servers.length === 0) return;
    
    const refreshAll = async () => {
      const currentServers = serversRef.current;
      for (const server of currentServers) {
        const status = await fetchServerStatus(server.type, server.address, server.port);
        setServers(prev => prev.map((s: GameServer) => 
          s.id === server.id 
            ? { ...s, status, lastUpdated: new Date() }
            : s
        ));
      }
    };
    
    // Initial refresh on load
    refreshAll();
    
    const interval = setInterval(() => {
      refreshAll();
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [servers.length]); // Only re-run when server count changes

  const addServer = useCallback((name: string, address: string, port: number, type: ServerType) => {
    const newServer: GameServer = {
      id: crypto.randomUUID(),
      name,
      address,
      port,
      type,
    };
    setServers(prev => [...prev, newServer]);
  }, []);

  const removeServer = useCallback((id: string) => {
    setServers(prev => prev.filter((s: GameServer) => s.id !== id));
  }, []);

  const updateServerStatus = useCallback(async (id: string) => {
    const server = serversRef.current.find((s: GameServer) => s.id === id);
    if (!server) return;

    const status = await fetchServerStatus(server.type, server.address, server.port);
    
    setServers(prev => prev.map((s: GameServer) => 
      s.id === id 
        ? { ...s, status, lastUpdated: new Date() }
        : s
    ));
  }, []);

  const refreshAllServers = useCallback(async () => {
    const currentServers = serversRef.current;
    for (const server of currentServers) {
      const status = await fetchServerStatus(server.type, server.address, server.port);
      setServers(prev => prev.map((s: GameServer) => 
        s.id === server.id 
          ? { ...s, status, lastUpdated: new Date() }
          : s
      ));
    }
  }, []);

  const getServerById = useCallback((id: string) => {
    return servers.find((s: GameServer) => s.id === id);
  }, [servers]);

  return {
    servers,
    loading,
    addServer,
    removeServer,
    updateServerStatus,
    refreshAllServers,
    getServerById,
  };
}
