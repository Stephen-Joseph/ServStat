import { useState } from 'react';
import { X, Plus, Server, Gamepad2, Car } from 'lucide-react';
import type { ServerType } from '../types/server';
import { SERVER_TYPE_CONFIG } from '../types/server';

interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, address: string, port: number, type: ServerType) => void;
}

const typeIcons: Record<ServerType, React.ReactNode> = {
  minecraft: <Server className="w-4 h-4" />,
  mtasa: <Gamepad2 className="w-4 h-4" />,
  samp: <Car className="w-4 h-4" />,
};

export function AddServerModal({ isOpen, onClose, onAdd }: AddServerModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<ServerType>('minecraft');
  const [port, setPort] = useState(25565);
  const [error, setError] = useState('');
  
  const handleTypeChange = (newType: ServerType) => {
    setType(newType);
    setPort(SERVER_TYPE_CONFIG[newType].defaultPort);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Server name is required');
      return;
    }
    if (!address.trim()) {
      setError('Server address is required');
      return;
    }
    if (port < 1 || port > 65535) {
      setError('Port must be between 1 and 65535');
      return;
    }

    onAdd(name.trim(), address.trim(), port, type);
    setName('');
    setAddress('');
    setType('minecraft');
    setPort(25565);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">Add New Server</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Server Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(SERVER_TYPE_CONFIG) as ServerType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    type === t
                      ? `bg-${SERVER_TYPE_CONFIG[t].color}-600 border-${SERVER_TYPE_CONFIG[t].color}-500 text-white`
                      : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {typeIcons[t]}
                  <span className="text-sm font-medium">{SERVER_TYPE_CONFIG[t].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Server Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`My ${SERVER_TYPE_CONFIG[type].label} Server`}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Server Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="mc.example.com or 192.168.1.100"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Port
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value) || 25565)}
              min="1"
              max="65535"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default {SERVER_TYPE_CONFIG[type].label} port is {SERVER_TYPE_CONFIG[type].defaultPort}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {SERVER_TYPE_CONFIG[type].label} Server
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
