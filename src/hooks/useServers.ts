import { useState, useEffect, useCallback } from 'react';
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
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`https://samp-api.com/api/v1/server/${address}/${port}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    
    if (data.error) {
      return { online: false };
    }
    
    return {
      online: true,
      players: {
        online: data.players || 0,
        max: data.maxplayers || 0,
        list: data.playerlist || [],
      },
      motd: data.hostname || data.name || data.address,
      gamemode: data.gamemode,
      map: data.map,
      rules: data.rules,
    };
  } catch {
    // Fallback: try alternative API
    try {
      const response2 = await fetch(`https://api.basterserver.com/samp-query?ip=${address}&port=${port}`);
      if (response2.ok) {
        const data2 = await response2.json();
        return {
          online: data2.online !== false,
          players: data2.players ? {
            online: data2.players.online || 0,
            max: data2.players.max || 0,
            list: data2.players.list || [],
          } : undefined,
          motd: data2.hostname || data2.name,
          gamemode: data2.gamemode,
          map: data2.map,
        };
      }
    } catch {
      // Both APIs failed
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
    const server = servers.find((s: GameServer) => s.id === id);
    if (!server) return;

    const status = await fetchServerStatus(server.type, server.address, server.port);
    
    setServers(prev => prev.map((s: GameServer) => 
      s.id === id 
        ? { ...s, status, lastUpdated: new Date() }
        : s
    ));
  }, [servers]);

  const refreshAllServers = useCallback(async () => {
    for (const server of servers) {
      await updateServerStatus(server.id);
    }
  }, [servers, updateServerStatus]);

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
