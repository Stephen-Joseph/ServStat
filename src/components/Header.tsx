import { Server, RefreshCw, Plus } from 'lucide-react';

interface HeaderProps {
  serverCount: number;
  onlineCount: number;
  onRefreshAll: () => void;
  onAddClick: () => void;
  isRefreshing: boolean;
}

export function Header({ serverCount, onlineCount, onRefreshAll, onAddClick, isRefreshing }: HeaderProps) {
  return (
    <header className="bg-gray-800/80 backdrop-blur border-b border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Game Server Tracker</h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">{serverCount} server{serverCount !== 1 ? 's' : ''}</span>
                <span className="text-gray-600">•</span>
                <span className="text-green-400">{onlineCount} online</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshAll}
              disabled={isRefreshing || serverCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh All</span>
            </button>
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors shadow-lg shadow-green-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Server
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
