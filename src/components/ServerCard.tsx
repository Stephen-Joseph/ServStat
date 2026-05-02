import { useState } from 'react';
import { Users, Signal, Trash2, RefreshCw, ChevronDown, ChevronUp, Server, Gamepad2, Car, ExternalLink } from 'lucide-react';
import type { GameServer, ServerType, PlayerInfo } from '../types/server';
import { SERVER_TYPE_CONFIG } from '../types/server';

interface ServerCardProps {
  server: GameServer;
  onRemove: (id: string) => void;
  onRefresh: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const typeIcons: Record<ServerType, typeof Server> = {
  minecraft: Server,
  mtasa: Gamepad2,
  samp: Car,
};

const typeColors: Record<ServerType, string> = {
  minecraft: 'green',
  mtasa: 'blue',
  samp: 'orange',
};

export function ServerCard({ server, onRemove, onRefresh, onViewDetails }: ServerCardProps) {
  const [showPlayers, setShowPlayers] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh(server.id);
    setIsRefreshing(false);
  };

  const status = server.status;
  const isOnline = status?.online;
  const players = status?.players;
  const TypeIcon = typeIcons[server.type];
  const color = typeColors[server.type];

  return (
    <div className={`bg-gray-800/80 backdrop-blur rounded-xl border ${isOnline ? `border-${color}-500/50` : 'border-red-500/50'} overflow-hidden transition-all hover:shadow-lg hover:shadow-${color}-500/10`}>
      {/* Header */}
      <div className="p-4 cursor-pointer" onClick={() => onViewDetails(server.id)}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isOnline ? `bg-${color}-500/20` : 'bg-red-500/20'}`}>
              {status?.icon ? (
                <img src={status.icon} alt="" className="w-10 h-10 rounded" />
              ) : (
                <TypeIcon className={`w-6 h-6 ${isOnline ? `text-${color}-400` : 'text-red-400'}`} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-lg">{server.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${color}-500/20 text-${color}-400`}>
                  {SERVER_TYPE_CONFIG[server.type].label}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{server.address}:{server.port}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isOnline ? `bg-${color}-500/20 text-${color}-400` : 'bg-red-500/20 text-red-400'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Status Info */}
        {isOnline && players && (
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-gray-700/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-lg font-bold">{players.online}</span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-400">{players.max}</span>
              </div>
              <p className="text-xs text-gray-500">Players</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                <Signal className="w-4 h-4" />
                <span className="text-lg font-bold">{status.latency || '–'}</span>
              </div>
              <p className="text-xs text-gray-500">ms ping</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-2 text-center">
              <div className="text-yellow-400 text-lg font-bold truncate px-1">
                {status.version || '–'}
              </div>
              <p className="text-xs text-gray-500">Version</p>
            </div>
          </div>
        )}

        {/* SA-MP/MTA Specific Info - Gamemode & Map */}
        {isOnline && (status.gamemode || status.map) && (
          <div className="grid grid-cols-2 gap-3 mb-3">
            {status.gamemode && (
              <div className="bg-gray-700/50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">🎮 Gamemode</p>
                <p className="text-sm text-white font-medium truncate">{status.gamemode}</p>
              </div>
            )}
            {status.map && (
              <div className="bg-gray-700/50 rounded-lg p-2">
                <p className="text-xs text-gray-500 mb-1">🗺️ Map</p>
                <p className="text-sm text-white font-medium truncate">{status.map}</p>
              </div>
            )}
          </div>
        )}

        {/* Load Bar for SA-MP/MTA */}
        {isOnline && players && players.max > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Server Load</span>
              <span>{Math.round((players.online / players.max) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  players.online / players.max > 0.8 ? 'bg-red-500' : 
                  players.online / players.max > 0.5 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(players.online / players.max) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* MOTD */}
        {isOnline && status.motd && (
          <div className="bg-gray-900/50 rounded-lg p-3 mb-3">
            <p className="text-gray-300 text-sm font-mono">{status.motd}</p>
          </div>
        )}

        {/* Player List Toggle */}
        {isOnline && players && players.list && players.list.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowPlayers(!showPlayers); }}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-sm"
          >
            <span className="text-gray-300">👥 View {players.list.length} online players</span>
            {showPlayers ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
        )}

        {/* No Players Message */}
        {isOnline && players && players.list && players.list.length === 0 && (
          <div className="px-3 py-2 bg-gray-700/30 rounded-lg text-sm text-gray-400 italic">
            No players online
          </div>
        )}

        {/* Player List */}
        {showPlayers && players?.list && (
          <div className="mt-2 bg-gray-900/50 rounded-lg p-3 max-h-40 overflow-y-auto">
            <div className="space-y-1">
              {players.list.map((player, idx) => {
                const playerName = typeof player === 'string' ? player : (player?.name || 'Unknown');
                const playerScore = typeof player === 'object' && player !== null ? player.score : undefined;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2 py-1.5 bg-gray-800/50 rounded text-sm"
                  >
                    <span className="text-gray-300">{idx + 1}. {playerName}</span>
                    {playerScore !== undefined && (
                      <span className="text-xs text-gray-500">Score: {playerScore}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Last Updated */}
        {server.lastUpdated && (
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {server.lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-700 p-3 flex items-center justify-between bg-gray-800/50">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm text-${color}-400 hover:bg-${color}-500/10 rounded-lg transition-colors disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => onViewDetails(server.id)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm text-${color}-400 hover:bg-${color}-500/10 rounded-lg transition-colors`}
          >
            <ExternalLink className="w-4 h-4" />
            Details
          </button>
        </div>
        <button
          onClick={() => onRemove(server.id)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  );
}
