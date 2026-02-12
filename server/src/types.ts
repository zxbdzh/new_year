/**
 * 客户端信息接口
 */
export interface ClientInfo {
  socketId: string;
  connectedAt: number;
  lastPingAt: number;
  nickname?: string;
  roomId?: string;
}

/**
 * 服务器配置接口
 */
export interface ServerConfig {
  port: number;
  corsOrigin: string;
  heartbeatInterval: number;
  heartbeatTimeout: number;
}

/**
 * 连接确认消息
 */
export interface ConnectedMessage {
  socketId: string;
  timestamp: number;
}

/**
 * 心跳响应消息
 */
export interface PongMessage {
  timestamp: number;
}

/**
 * 玩家离开消息
 */
export interface PlayerLeftMessage {
  socketId: string;
  nickname?: string;
  timestamp: number;
}

/**
 * 健康检查响应
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: number;
  uptime: number;
}

/**
 * 玩家信息接口
 */
export interface PlayerInfo {
  id: string;
  nickname: string;
  fireworkCount: number;
  lastActionTime: number;
}

/**
 * 房间数据接口
 */
export interface RoomData {
  id: string;
  type: 'public' | 'private';
  code?: string;
  players: Map<string, PlayerInfo>;
  maxPlayers: number;
  createdAt: number;
  lastActivityAt: number;
}

/**
 * 房间信息接口（用于客户端传输，使用数组而非Map）
 */
export interface RoomInfo {
  id: string;
  type: 'public' | 'private';
  code?: string;
  players: PlayerInfo[];
  maxPlayers: number;
  createdAt: number;
}
