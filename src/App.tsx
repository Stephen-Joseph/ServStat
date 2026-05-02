import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useServers } from './hooks/useServers';
import { Header } from './components/Header';
import { ServerCard } from './components/ServerCard';
import { AddServerModal } from './components/AddServerModal';
import { ServerDetail } from './pages/ServerDetail';
import { ServerOff, Plus } from 'lucide-react';
import type { GameServer } from './types/server';

function HomePage() {
  const navigate = useNavigate();
  const { 
    servers, 
    loading, 
    addServer, 
    removeServer, 
    updateServerStatus, 
    refreshAllServers 
  } = useServers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh servers on mount and every 60 seconds
  useEffect(() => {
    if (servers.length > 0) {
      refreshAllServers();
    }
    
    const interval = setInterval(() => {
      if (servers.length > 0) {
        refreshAllServers();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [servers.length]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await refreshAllServers();
    setIsRefreshing(false);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/server/${id}`);
  };

  const onlineCount = servers.filter((s: GameServer) => s.status?.online).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        serverCount={servers.length}
        onlineCount={onlineCount}
        onRefreshAll={handleRefreshAll}
        onAddClick={() => setIsModalOpen(true)}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {servers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <ServerOff className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No servers added yet</h2>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Add Minecraft, MTA:SA, or SA-MP servers to track their status, player count, and online players in real-time.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Server
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {servers.map((server: GameServer) => (
              <ServerCard
                key={server.id}
                server={server}
                onRemove={removeServer}
                onRefresh={updateServerStatus}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>

      <AddServerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addServer}
      />
    </div>
  );
}

function DetailPage() {
  const { getServerById, updateServerStatus } = useServers();
  return <ServerDetail getServerById={getServerById} onRefresh={updateServerStatus} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/server/:id" element={<DetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
