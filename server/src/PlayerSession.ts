/**
 * 玩家会话管理器
 * 负责管理玩家会话、昵称冲突处理和会话超时
 */

import type { PlayerInfo } from './RoomManager.js';

/**
 * 玩家会话接口
 */
export interface PlayerSession {
  id: string;
  socketId: string;
  nickname: string;
  originalNickname: string; // 原始昵称（未处理重复前）
  roomId: string | null;
  connectedAt: number;
  lastActionAt: number;
}

/**
 * 玩家会话管理器类
 */
export class PlayerSessionManager {
  private sessions: Map<string, PlayerSession> = new Map();
  private nicknameCounters: Map<string, number> = new Map(); // 昵称计数器
  private timeoutCheckInterval: NodeJS.Timeout | null = null;
  private readonly SESSION_TIMEOUT = 5 * 60 * 1000; // 5分钟无活动超时

  constructor() {
    // 启动会话超时检查定时器
    this.startTimeoutChecker();
  }

  /**
   * 创建玩家会话
   * @param socketId Socket ID
   * @param nickname 玩家昵称
   * @returns 创建的会话
   */
  createSession(socketId: string, nickname: string): PlayerSession {
    // 处理昵称重复
    const uniqueNickname = this.generateUniqueNickname(nickname);

    const session: PlayerSession = {
      id: socketId,
      socketId,
      nickname: uniqueNickname,
      originalNickname: nickname,
      roomId: null,
      connectedAt: Date.now(),
      lastActionAt: Date.now(),
    };

    this.sessions.set(socketId, session);

    console.log(
      `[会话管理] 创建会话: ${socketId}, 昵称: ${uniqueNickname}${
        uniqueNickname !== nickname ? ` (原始: ${nickname})` : ''
      }`
    );

    return session;
  }

  /**
   * 生成唯一昵称（处理重复）
   * @param nickname 原始昵称
   * @returns 唯一昵称
   */
  private generateUniqueNickname(nickname: string): string {
    // 检查昵称是否已存在
    const existingNicknames = new Set<string>();
    for (const session of this.sessions.values()) {
      existingNicknames.add(session.nickname);
    }

    // 如果昵称不存在，直接返回
    if (!existingNicknames.has(nickname)) {
      return nickname;
    }

    // 昵称已存在，添加数字后缀
    let counter = this.nicknameCounters.get(nickname) || 2;
    let uniqueNickname = `${nickname}${counter}`;

    // 循环直到找到唯一昵称
    while (existingNicknames.has(uniqueNickname)) {
      counter++;
      uniqueNickname = `${nickname}${counter}`;
    }

    // 更新计数器
    this.nicknameCounters.set(nickname, counter + 1);

    return uniqueNickname;
  }

  /**
   * 获取会话
   * @param socketId Socket ID
   * @returns 会话或null
   */
  getSession(socketId: string): PlayerSession | null {
    return this.sessions.get(socketId) || null;
  }

  /**
   * 更新会话房间
   * @param socketId Socket ID
   * @param roomId 房间ID
   */
  updateSessionRoom(socketId: string, roomId: string | null): void {
    const session = this.sessions.get(socketId);
    if (session) {
      session.roomId = roomId;
      session.lastActionAt = Date.now();
      console.log(`[会话管理] 更新会话房间: ${socketId} -> ${roomId}`);
    }
  }

  /**
   * 更新会话活动时间
   * @param socketId Socket ID
   */
  updateSessionActivity(socketId: string): void {
    const session = this.sessions.get(socketId);
    if (session) {
      session.lastActionAt = Date.now();
    }
  }

  /**
   * 删除会话
   * @param socketId Socket ID
   * @returns 是否成功删除
   */
  deleteSession(socketId: string): boolean {
    const session = this.sessions.get(socketId);
    if (!session) {
      return false;
    }

    // 清理昵称计数器（如果没有其他会话使用相同原始昵称）
    const sameNicknameCount = Array.from(this.sessions.values()).filter(
      (s) => s.originalNickname === session.originalNickname && s.id !== session.id
    ).length;

    if (sameNicknameCount === 0) {
      this.nicknameCounters.delete(session.originalNickname);
    }

    this.sessions.delete(socketId);
    console.log(`[会话管理] 删除会话: ${socketId}, 昵称: ${session.nickname}`);

    return true;
  }

  /**
   * 获取所有会话
   * @returns 会话数组
   */
  getAllSessions(): PlayerSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * 获取房间内的会话
   * @param roomId 房间ID
   * @returns 会话数组
   */
  getSessionsByRoom(roomId: string): PlayerSession[] {
    return Array.from(this.sessions.values()).filter((session) => session.roomId === roomId);
  }

  /**
   * 检查并清理超时会话
   * @returns 被清理的会话ID数组
   */
  checkAndCleanupTimeoutSessions(): string[] {
    const now = Date.now();
    const timeoutSessions: string[] = [];

    for (const [socketId, session] of this.sessions) {
      if (now - session.lastActionAt > this.SESSION_TIMEOUT) {
        timeoutSessions.push(socketId);
        console.log(
          `[会话管理] 会话超时: ${socketId}, 昵称: ${session.nickname}, 最后活动: ${new Date(
            session.lastActionAt
          ).toISOString()}`
        );
      }
    }

    // 删除超时会话
    for (const socketId of timeoutSessions) {
      this.deleteSession(socketId);
    }

    if (timeoutSessions.length > 0) {
      console.log(`[会话管理] 清理了 ${timeoutSessions.length} 个超时会话`);
    }

    return timeoutSessions;
  }

  /**
   * 启动会话超时检查定时器
   */
  private startTimeoutChecker(): void {
    // 每分钟检查一次
    this.timeoutCheckInterval = setInterval(() => {
      this.checkAndCleanupTimeoutSessions();
    }, 60 * 1000);

    console.log('[会话管理] 会话超时检查定时器已启动（每分钟检查一次）');
  }

  /**
   * 停止会话超时检查定时器
   */
  stopTimeoutChecker(): void {
    if (this.timeoutCheckInterval) {
      clearInterval(this.timeoutCheckInterval);
      this.timeoutCheckInterval = null;
      console.log('[会话管理] 会话超时检查定时器已停止');
    }
  }

  /**
   * 获取统计信息
   * @returns 统计信息对象
   */
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    sessionsInRooms: number;
  } {
    const now = Date.now();
    let activeSessions = 0;
    let sessionsInRooms = 0;

    for (const session of this.sessions.values()) {
      if (now - session.lastActionAt < this.SESSION_TIMEOUT) {
        activeSessions++;
      }
      if (session.roomId) {
        sessionsInRooms++;
      }
    }

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      sessionsInRooms,
    };
  }

  /**
   * 销毁会话管理器
   */
  destroy(): void {
    this.stopTimeoutChecker();
    this.sessions.clear();
    this.nicknameCounters.clear();
    console.log('[会话管理] 会话管理器已销毁');
  }
}
