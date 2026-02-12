/**
 * 玩家会话管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PlayerSessionManager } from './PlayerSession.js';

describe('PlayerSessionManager', () => {
  let sessionManager: PlayerSessionManager;

  beforeEach(() => {
    sessionManager = new PlayerSessionManager();
    vi.useFakeTimers();
  });

  afterEach(() => {
    sessionManager.destroy();
    vi.useRealTimers();
  });

  describe('createSession', () => {
    it('应该创建新会话', () => {
      const session = sessionManager.createSession('socket1', 'Player');

      expect(session).toBeDefined();
      expect(session.id).toBe('socket1');
      expect(session.socketId).toBe('socket1');
      expect(session.nickname).toBe('Player');
      expect(session.originalNickname).toBe('Player');
      expect(session.roomId).toBeNull();
      expect(session.connectedAt).toBeGreaterThan(0);
      expect(session.lastActionAt).toBeGreaterThan(0);
    });

    it('应该处理昵称重复（添加数字后缀）', () => {
      const session1 = sessionManager.createSession('socket1', 'Player');
      const session2 = sessionManager.createSession('socket2', 'Player');
      const session3 = sessionManager.createSession('socket3', 'Player');

      expect(session1.nickname).toBe('Player');
      expect(session2.nickname).toBe('Player2');
      expect(session3.nickname).toBe('Player3');

      // 原始昵称应该保持不变
      expect(session1.originalNickname).toBe('Player');
      expect(session2.originalNickname).toBe('Player');
      expect(session3.originalNickname).toBe('Player');
    });

    it('应该处理中文昵称重复', () => {
      const session1 = sessionManager.createSession('socket1', '玩家');
      const session2 = sessionManager.createSession('socket2', '玩家');

      expect(session1.nickname).toBe('玩家');
      expect(session2.nickname).toBe('玩家2');
    });

    it('应该处理混合昵称重复', () => {
      const session1 = sessionManager.createSession('socket1', 'Player123');
      const session2 = sessionManager.createSession('socket2', 'Player123');

      expect(session1.nickname).toBe('Player123');
      expect(session2.nickname).toBe('Player1232');
    });
  });

  describe('getSession', () => {
    it('应该返回存在的会话', () => {
      sessionManager.createSession('socket1', 'Player');
      const session = sessionManager.getSession('socket1');

      expect(session).toBeDefined();
      expect(session?.nickname).toBe('Player');
    });

    it('应该返回null如果会话不存在', () => {
      const session = sessionManager.getSession('nonexistent');
      expect(session).toBeNull();
    });
  });

  describe('updateSessionRoom', () => {
    it('应该更新会话房间', () => {
      sessionManager.createSession('socket1', 'Player');
      sessionManager.updateSessionRoom('socket1', 'room1');

      const session = sessionManager.getSession('socket1');
      expect(session?.roomId).toBe('room1');
    });

    it('应该更新最后活动时间', () => {
      sessionManager.createSession('socket1', 'Player');
      const initialTime = sessionManager.getSession('socket1')?.lastActionAt || 0;

      vi.advanceTimersByTime(1000);
      sessionManager.updateSessionRoom('socket1', 'room1');

      const updatedTime = sessionManager.getSession('socket1')?.lastActionAt || 0;
      expect(updatedTime).toBeGreaterThan(initialTime);
    });

    it('应该允许清除房间（设置为null）', () => {
      sessionManager.createSession('socket1', 'Player');
      sessionManager.updateSessionRoom('socket1', 'room1');
      sessionManager.updateSessionRoom('socket1', null);

      const session = sessionManager.getSession('socket1');
      expect(session?.roomId).toBeNull();
    });
  });

  describe('updateSessionActivity', () => {
    it('应该更新最后活动时间', () => {
      sessionManager.createSession('socket1', 'Player');
      const initialTime = sessionManager.getSession('socket1')?.lastActionAt || 0;

      vi.advanceTimersByTime(1000);
      sessionManager.updateSessionActivity('socket1');

      const updatedTime = sessionManager.getSession('socket1')?.lastActionAt || 0;
      expect(updatedTime).toBeGreaterThan(initialTime);
    });

    it('应该忽略不存在的会话', () => {
      expect(() => {
        sessionManager.updateSessionActivity('nonexistent');
      }).not.toThrow();
    });
  });

  describe('deleteSession', () => {
    it('应该删除会话', () => {
      sessionManager.createSession('socket1', 'Player');
      const deleted = sessionManager.deleteSession('socket1');

      expect(deleted).toBe(true);
      expect(sessionManager.getSession('socket1')).toBeNull();
    });

    it('应该返回false如果会话不存在', () => {
      const deleted = sessionManager.deleteSession('nonexistent');
      expect(deleted).toBe(false);
    });

    it('应该清理昵称计数器（如果没有其他相同昵称）', () => {
      sessionManager.createSession('socket1', 'Player');
      sessionManager.createSession('socket2', 'Player');
      sessionManager.deleteSession('socket2');

      // 创建新会话应该使用原始昵称（因为socket1还在使用Player）
      const session3 = sessionManager.createSession('socket3', 'Player');
      expect(session3.nickname).toBe('Player3');
    });

    it('应该重置昵称计数器（如果删除所有相同昵称）', () => {
      sessionManager.createSession('socket1', 'Player');
      sessionManager.createSession('socket2', 'Player');
      sessionManager.deleteSession('socket1');
      sessionManager.deleteSession('socket2');

      // 创建新会话应该从头开始
      const session3 = sessionManager.createSession('socket3', 'Player');
      expect(session3.nickname).toBe('Player');
    });
  });

  describe('getAllSessions', () => {
    it('应该返回所有会话', () => {
      sessionManager.createSession('socket1', 'Player1');
      sessionManager.createSession('socket2', 'Player2');
      sessionManager.createSession('socket3', 'Player3');

      const sessions = sessionManager.getAllSessions();
      expect(sessions).toHaveLength(3);
      expect(sessions.map((s) => s.nickname)).toEqual(['Player1', 'Player2', 'Player3']);
    });

    it('应该返回空数组如果没有会话', () => {
      const sessions = sessionManager.getAllSessions();
      expect(sessions).toEqual([]);
    });
  });

  describe('getSessionsByRoom', () => {
    it('应该返回指定房间的会话', () => {
      sessionManager.createSession('socket1', 'Player1');
      sessionManager.createSession('socket2', 'Player2');
      sessionManager.createSession('socket3', 'Player3');

      sessionManager.updateSessionRoom('socket1', 'room1');
      sessionManager.updateSessionRoom('socket2', 'room1');
      sessionManager.updateSessionRoom('socket3', 'room2');

      const room1Sessions = sessionManager.getSessionsByRoom('room1');
      expect(room1Sessions).toHaveLength(2);
      expect(room1Sessions.map((s) => s.nickname)).toEqual(['Player1', 'Player2']);
    });

    it('应该返回空数组如果房间没有会话', () => {
      const sessions = sessionManager.getSessionsByRoom('nonexistent');
      expect(sessions).toEqual([]);
    });
  });

  describe('checkAndCleanupTimeoutSessions', () => {
    it('应该清理超时会话（5分钟无活动）', () => {
      sessionManager.createSession('socket1', 'Player1');
      sessionManager.createSession('socket2', 'Player2');

      // 推进时间超过5分钟
      vi.advanceTimersByTime(6 * 60 * 1000);

      const timeoutSessions = sessionManager.checkAndCleanupTimeoutSessions();

      expect(timeoutSessions).toHaveLength(2);
      expect(timeoutSessions).toContain('socket1');
      expect(timeoutSessions).toContain('socket2');
      expect(sessionManager.getAllSessions()).toHaveLength(0);
    });

    it('应该保留活跃会话', () => {
      sessionManager.createSession('socket1', 'Player1');
      sessionManager.createSession('socket2', 'Player2');

      // 推进时间3分钟
      vi.advanceTimersByTime(3 * 60 * 1000);

      // 更新socket1的活动时间
      sessionManager.updateSessionActivity('socket1');

      // 再推进3分钟（socket1总共3分钟，socket2总共6分钟）
      vi.advanceTimersByTime(3 * 60 * 1000);

      const timeoutSessions = sessionManager.checkAndCleanupTimeoutSessions();

      expect(timeoutSessions).toHaveLength(1);
      expect(timeoutSessions).toContain('socket2');
      expect(sessionManager.getSession('socket1')).toBeDefined();
      expect(sessionManager.getSession('socket2')).toBeNull();
    });

    it('应该返回空数组如果没有超时会话', () => {
      sessionManager.createSession('socket1', 'Player1');

      const timeoutSessions = sessionManager.checkAndCleanupTimeoutSessions();
      expect(timeoutSessions).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('应该返回正确的统计信息', () => {
      sessionManager.createSession('socket1', 'Player1');
      sessionManager.createSession('socket2', 'Player2');
      sessionManager.createSession('socket3', 'Player3');

      sessionManager.updateSessionRoom('socket1', 'room1');
      sessionManager.updateSessionRoom('socket2', 'room1');

      const stats = sessionManager.getStats();

      expect(stats.totalSessions).toBe(3);
      expect(stats.activeSessions).toBe(3);
      expect(stats.sessionsInRooms).toBe(2);
    });

    it('应该正确计算活跃会话（排除超时）', () => {
      sessionManager.createSession('socket1', 'Player1');
      sessionManager.createSession('socket2', 'Player2');

      // 推进时间超过5分钟
      vi.advanceTimersByTime(6 * 60 * 1000);

      const stats = sessionManager.getStats();

      expect(stats.totalSessions).toBe(2);
      expect(stats.activeSessions).toBe(0); // 都超时了
    });
  });

  describe('自动超时检查', () => {
    it('应该每分钟自动检查超时会话', () => {
      // 创建新的管理器来测试定时器
      const testManager = new PlayerSessionManager();
      const spy = vi.spyOn(testManager, 'checkAndCleanupTimeoutSessions');

      testManager.createSession('socket1', 'Player1');

      // 推进时间6分钟
      vi.advanceTimersByTime(6 * 60 * 1000);

      // 应该调用了6次（每分钟一次）
      expect(spy).toHaveBeenCalledTimes(6);

      testManager.destroy();
    });
  });

  describe('destroy', () => {
    it('应该清理所有资源', () => {
      sessionManager.createSession('socket1', 'Player1');
      sessionManager.createSession('socket2', 'Player2');

      sessionManager.destroy();

      expect(sessionManager.getAllSessions()).toHaveLength(0);
      expect(sessionManager.getStats().totalSessions).toBe(0);
    });

    it('应该停止超时检查定时器', () => {
      const spy = vi.spyOn(sessionManager, 'checkAndCleanupTimeoutSessions');

      sessionManager.destroy();

      // 推进时间
      vi.advanceTimersByTime(2 * 60 * 1000);

      // 不应该再调用
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
