import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Signal, MapPin, Gamepad, Clock, Server, Gamepad2, Car } from 'lucide-react';
import type { GameServer, ServerType } from '../types/server';
import { SERVER_TYPE_CONFIG } from '../types/server';

interface ServerDetailProps {
  getServerById: (id: string) => GameServer | undefined;
  onRefresh: (id: string) => void;
}

const typeIcons: Record<ServerType, typeof Server> = {
  minecraft: Server,
  mtasa: Gamepad2,
  samp: Car,
};

const typeColors: Record<ServerType, { bg: string; text: string; border: string; shadow: string }> = {
  minecraft: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50', shadow: 'shadow-green-500/10' },
  mtasa: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', shadow: 'shadow-blue-500/10' },
  samp: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50', shadow: 'shadow-orange-500/10' },
};

export function ServerDetail({ getServerById, onRefresh }: ServerDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [server, setServer] = useState<GameServer | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      const s = getServerById(id);
      setServer(s);
    }
  }, [id, getServerById]);

  const handleRefresh = async () => {
    if (!id) return;
    setIsRefreshing(true);
    await onRefresh(id);
    const updated = getServerById(id);
    setServer(updated);
    setIsRefreshing(false);
  };

  if (!server) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-gray-400 text-xl mb-4">Server not found</div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  const status = server.status;
  const isOnline = status?.online;
  const players = status?.players;
  const TypeIcon = typeIcons[server.type];
  const colors = typeColors[server.type];

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Servers
        </button>

        {/* Main Card */}
        <div className={`bg-gray-800/80 backdrop-blur rounded-2xl border ${isOnline ? colors.border : 'border-red-500/50'} overflow-hidden shadow-lg ${isOnline ? colors.shadow : ''}`}>
          {/* Header */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isOnline ? colors.bg : 'bg-red-500/20'}`}>
                  {status?.icon ? (
                    <img src={status.icon} alt="" className="w-12 h-12 rounded-lg" />
                  ) : (
                    <TypeIcon className={`w-8 h-8 ${isOnline ? colors.text : 'text-red-400'}`} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{server.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                      {SERVER_TYPE_CONFIG[server.type].label}
                    </span>
                  </div>
                  <p className="text-gray-400">{server.address}:{server.port}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`flex items-center gap-2 px-4 py-2 ${colors.bg} ${colors.text} hover:opacity-80 rounded-lg transition-all disabled:opacity-50`}
                >
                  <Clock className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Status Grid */}
            {isOnline && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className={`flex items-center gap-2 ${colors.text} mb-2`}>
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Players</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {players?.online || 0} <span className="text-gray-500 text-lg">/ {players?.max || 0}</span>
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Signal className="w-5 h-5" />
                    <span className="text-sm font-medium">Ping</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {status.latency ? `${status.latency}ms` : '–'}
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <Gamepad className="w-5 h-5" />
                    <span className="text-sm font-medium">Version</span>
                  </div>
                  <div className="text-2xl font-bold text-white truncate">
                    {status.version || '–'}
                  </div>
                </div>

                <div className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-purple-400 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm font-medium">Map</span>
                  </div>
                  <div className="text-2xl font-bold text-white truncate">
                    {status.map || status.gamemode || '–'}
                  </div>
                </div>
              </div>
            )}

            {/* MOTD / Description */}
            {status?.motd && (
              <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Message of the Day</h3>
                <p className="text-white font-mono text-lg">{status.motd}</p>
              </div>
            )}

            {status?.description && (
              <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                <p className="text-white">{status.description}</p>
              </div>
            )}

            {/* Rules (SA-MP/MTA) */}
            {status?.rules && Object.keys(status.rules).length > 0 && (
              <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Server Rules</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(status.rules).map(([key, value]) => (
                    <div key={key} className="bg-gray-800/50 rounded-lg p-2">
                      <span className="text-xs text-gray-500 block">{key}</span>
                      <span className="text-sm text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Player List */}
            {players?.list && players.list.length > 0 && (
              <div className="bg-gray-900/50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  Online Players ({players.list.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {players.list.map((player, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 ${colors.bg} ${colors.text} rounded-lg text-sm font-medium`}
                    >
                      {player}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            {server.lastUpdated && (
              <p className="text-sm text-gray-500 mt-6">
                Last updated: {new Date(server.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
