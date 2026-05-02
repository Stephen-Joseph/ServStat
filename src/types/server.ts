export type ServerType = 'minecraft' | 'mtasa' | 'samp';

export interface GameServer {
  id: string;
  name: string;
  address: string;
  port: number;
  type: ServerType;
  status?: ServerStatus;
  lastUpdated?: Date;
}

export interface ServerStatus {
  online: boolean;
  players?: {
    online: number;
    max: number;
    list?: string[];
  };
  version?: string;
  motd?: string;
  description?: string;
  gamemode?: string;
  map?: string;
  icon?: string;
  latency?: number;
  rules?: Record<string, string>;
}

export interface ServerFormData {
  name: string;
  address: string;
  port: number;
  type: ServerType;
}

export const SERVER_TYPE_CONFIG: Record<ServerType, { label: string; defaultPort: number; color: string }> = {
  minecraft: { label: 'Minecraft', defaultPort: 25565, color: 'green' },
  mtasa: { label: 'MTA:SA', defaultPort: 22003, color: 'blue' },
  samp: { label: 'SA-MP', defaultPort: 7777, color: 'orange' },
};
