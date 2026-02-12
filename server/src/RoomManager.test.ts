/**
 * RoomManager单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RoomManager, PlayerInfo } from './RoomManager';

describe('RoomManager', () => {
  let roomManager: RoomManager;

  beforeEach(() => {
    roomManager = new RoomManager();
  });

  afterEach(() => {
    roomManager.destroy();
  });

  describe('房间创建', () => {
    it('应该创建公共房间', () => {
      const room = roomManager.createRoom('public');

      expect(room).toBeDefined();
      expect(room.type).toBe('public');
      expect(room.code).toBeUndefined();
      expect(room.players.size).toBe(0);
      expect(room.maxPlayers).toBe(20);
    });

    it('应该创建私人房间并生成4位数字房间码', () => {
      const room = roomManager.createRoom('private');

      expect(room).toBeDefined();
      expect(room.type).toBe('private');
      expect(room.code).toBeDefined();
      expect(room.code).toMatch(/^\d{4}$/);
      expect(room.players.size).toBe(0);
      expect(room.maxPlayers).toBe(20);
    });

    it('应该生成唯一的房间码', () => {
      const room1 = roomManager.createRoom('private');
      const room2 = roomManager.createRoom('private');

      expect(room1.code).not.toBe(room2.code);
    });
  });

  describe('房间查找', () => {
    it('应该通过房间码找到私人房间', () => {
      const room = roomManager.createRoom('private');
      const foundRoom = roomManager.findRoomByCode(room.code!);

      expect(foundRoom).toBeDefined();
      expect(foundRoom?.id).toBe(room.id);
    });

    it('应该在房间码不存在时返回null', () => {
      const foundRoom = roomManager.findRoomByCode('9999');

      expect(foundRoom).toBeNull();
    });

    it('应该找到可用的公共房间', () => {
      const room = roomManager.createRoom('public');
      const foundRoom = roomManager.findAvailablePublicRoom();

      expect(foundRoom).toBeDefined();
      expect(foundRoom?.id).toBe(room.id);
    });

    it('应该在没有可用公共房间时返回null', () => {
      const foundRoom = roomManager.findAvailablePublicRoom();

      expect(foundRoom).toBeNull();
    });

    it('应该不返回已满的公共房间', () => {
      const room = roomManager.createRoom('public');

      // 添加20个玩家填满房间
      for (let i = 0; i < 20; i++) {
        const player: PlayerInfo = {
          id: `player_${i}`,
          nickname: `Player${i}`,
          fireworkCount: 0,
          lastActionTime: Date.now(),
        };
        roomManager.addPlayerToRoom(room.id, player);
      }

      const foundRoom = roomManager.findAvailablePublicRoom();
      expect(foundRoom).toBeNull();
    });
  });

  describe('玩家管理', () => {
    it('应该成功添加玩家到房间', () => {
      const room = roomManager.createRoom('public');
      const player: PlayerInfo = {
        id: 'player1',
        nickname: 'TestPlayer',
        fireworkCount: 0,
        lastActionTime: Date.now(),
      };

      const success = roomManager.addPlayerToRoom(room.id, player);

      expect(success).toBe(true);
      expect(room.players.size).toBe(1);
      expect(room.players.get('player1')).toEqual(player);
    });

    it('应该拒绝添加玩家到已满房间', () => {
      const room = roomManager.createRoom('public');

      // 添加20个玩家填满房间
      for (let i = 0; i < 20; i++) {
        const player: PlayerInfo = {
          id: `player_${i}`,
          nickname: `Player${i}`,
          fireworkCount: 0,
          lastActionTime: Date.now(),
        };
        roomManager.addPlayerToRoom(room.id, player);
      }

      // 尝试添加第21个玩家
      const extraPlayer: PlayerInfo = {
        id: 'player_21',
        nickname: 'ExtraPlayer',
        fireworkCount: 0,
        lastActionTime: Date.now(),
      };
      const success = roomManager.addPlayerToRoom(room.id, extraPlayer);

      expect(success).toBe(false);
      expect(room.players.size).toBe(20);
    });

    it('应该成功从房间移除玩家', () => {
      const room = roomManager.createRoom('public');
      const player: PlayerInfo = {
        id: 'player1',
        nickname: 'TestPlayer',
        fireworkCount: 0,
        lastActionTime: Date.now(),
      };

      roomManager.addPlayerToRoom(room.id, player);
      const removed = roomManager.removePlayerFromRoom(room.id, 'player1');

      expect(removed).toBe(true);
      expect(room.players.size).toBe(0);
    });

    it('应该正确检查房间是否已满', () => {
      const room = roomManager.createRoom('public');

      expect(roomManager.isRoomFull(room.id)).toBe(false);

      // 添加20个玩家
      for (let i = 0; i < 20; i++) {
        const player: PlayerInfo = {
          id: `player_${i}`,
          nickname: `Player${i}`,
          fireworkCount: 0,
          lastActionTime: Date.now(),
        };
        roomManager.addPlayerToRoom(room.id, player);
      }

      expect(roomManager.isRoomFull(room.id)).toBe(true);
    });

    it('应该返回房间玩家列表', () => {
      const room = roomManager.createRoom('public');
      const player1: PlayerInfo = {
        id: 'player1',
        nickname: 'Player1',
        fireworkCount: 0,
        lastActionTime: Date.now(),
      };
      const player2: PlayerInfo = {
        id: 'player2',
        nickname: 'Player2',
        fireworkCount: 0,
        lastActionTime: Date.now(),
      };

      roomManager.addPlayerToRoom(room.id, player1);
      roomManager.addPlayerToRoom(room.id, player2);

      const players = roomManager.getRoomPlayers(room.id);

      expect(players).toHaveLength(2);
      expect(players).toContainEqual(player1);
      expect(players).toContainEqual(player2);
    });
  });

  describe('房间清理', () => {
    it('应该清理30分钟无活动的空房间', () => {
      const room = roomManager.createRoom('public');

      // 模拟30分钟前的活动时间
      room.lastActivityAt = Date.now() - 31 * 60 * 1000;

      roomManager.cleanupEmptyRooms();

      const foundRoom = roomManager.getRoom(room.id);
      expect(foundRoom).toBeNull();
    });

    it('应该不清理有玩家的房间', () => {
      const room = roomManager.createRoom('public');
      const player: PlayerInfo = {
        id: 'player1',
        nickname: 'TestPlayer',
        fireworkCount: 0,
        lastActionTime: Date.now(),
      };

      roomManager.addPlayerToRoom(room.id, player);

      // 模拟30分钟前的活动时间
      room.lastActivityAt = Date.now() - 31 * 60 * 1000;

      roomManager.cleanupEmptyRooms();

      const foundRoom = roomManager.getRoom(room.id);
      expect(foundRoom).toBeDefined();
    });

    it('应该不清理活动时间在30分钟内的空房间', () => {
      const room = roomManager.createRoom('public');

      // 活动时间在29分钟前
      room.lastActivityAt = Date.now() - 29 * 60 * 1000;

      roomManager.cleanupEmptyRooms();

      const foundRoom = roomManager.getRoom(room.id);
      expect(foundRoom).toBeDefined();
    });
  });

  describe('房间活动更新', () => {
    it('应该更新房间活动时间', () => {
      const room = roomManager.createRoom('public');
      const oldActivityTime = room.lastActivityAt;

      // 等待一小段时间
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      roomManager.updateRoomActivity(room.id);

      expect(room.lastActivityAt).toBeGreaterThan(oldActivityTime);

      vi.useRealTimers();
    });
  });

  describe('统计信息', () => {
    it('应该返回正确的统计信息', () => {
      const publicRoom1 = roomManager.createRoom('public');
      const publicRoom2 = roomManager.createRoom('public');
      const privateRoom = roomManager.createRoom('private');

      const player1: PlayerInfo = {
        id: 'player1',
        nickname: 'Player1',
        fireworkCount: 0,
        lastActionTime: Date.now(),
      };
      const player2: PlayerInfo = {
        id: 'player2',
        nickname: 'Player2',
        fireworkCount: 0,
        lastActionTime: Date.now(),
      };

      roomManager.addPlayerToRoom(publicRoom1.id, player1);
      roomManager.addPlayerToRoom(privateRoom.id, player2);

      const stats = roomManager.getStats();

      expect(stats.totalRooms).toBe(3);
      expect(stats.publicRooms).toBe(2);
      expect(stats.privateRooms).toBe(1);
      expect(stats.totalPlayers).toBe(2);
    });
  });

  describe('房间删除', () => {
    it('应该删除房间并清理房间码映射', () => {
      const room = roomManager.createRoom('private');
      const code = room.code!;

      roomManager.deleteRoom(room.id);

      expect(roomManager.getRoom(room.id)).toBeNull();
      expect(roomManager.findRoomByCode(code)).toBeNull();
    });
  });

  describe('房间码生成', () => {
    it('应该生成1000-9999之间的房间码', () => {
      const room = roomManager.createRoom('private');
      const code = parseInt(room.code!, 10);

      expect(code).toBeGreaterThanOrEqual(1000);
      expect(code).toBeLessThanOrEqual(9999);
    });
  });

  describe('排行榜', () => {
    it('应该返回按烟花数量降序排列的TOP3玩家', () => {
      const room = roomManager.createRoom('public');

      // 添加5个玩家，烟花数量不同
      const players: PlayerInfo[] = [
        { id: 'player1', nickname: 'Player1', fireworkCount: 10, lastActionTime: Date.now() },
        { id: 'player2', nickname: 'Player2', fireworkCount: 25, lastActionTime: Date.now() },
        { id: 'player3', nickname: 'Player3', fireworkCount: 5, lastActionTime: Date.now() },
        { id: 'player4', nickname: 'Player4', fireworkCount: 30, lastActionTime: Date.now() },
        { id: 'player5', nickname: 'Player5', fireworkCount: 15, lastActionTime: Date.now() },
      ];

      players.forEach((player) => roomManager.addPlayerToRoom(room.id, player));

      const leaderboard = roomManager.getLeaderboard(room.id);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].id).toBe('player4'); // 30烟花
      expect(leaderboard[0].fireworkCount).toBe(30);
      expect(leaderboard[1].id).toBe('player2'); // 25烟花
      expect(leaderboard[1].fireworkCount).toBe(25);
      expect(leaderboard[2].id).toBe('player5'); // 15烟花
      expect(leaderboard[2].fireworkCount).toBe(15);
    });

    it('应该在玩家少于3人时返回所有玩家', () => {
      const room = roomManager.createRoom('public');

      const players: PlayerInfo[] = [
        { id: 'player1', nickname: 'Player1', fireworkCount: 10, lastActionTime: Date.now() },
        { id: 'player2', nickname: 'Player2', fireworkCount: 5, lastActionTime: Date.now() },
      ];

      players.forEach((player) => roomManager.addPlayerToRoom(room.id, player));

      const leaderboard = roomManager.getLeaderboard(room.id);

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].fireworkCount).toBe(10);
      expect(leaderboard[1].fireworkCount).toBe(5);
    });

    it('应该在房间为空时返回空数组', () => {
      const room = roomManager.createRoom('public');
      const leaderboard = roomManager.getLeaderboard(room.id);

      expect(leaderboard).toHaveLength(0);
    });

    it('应该在房间不存在时返回空数组', () => {
      const leaderboard = roomManager.getLeaderboard('nonexistent_room');

      expect(leaderboard).toHaveLength(0);
    });

    it('应该正确处理烟花数量相同的玩家', () => {
      const room = roomManager.createRoom('public');

      const players: PlayerInfo[] = [
        { id: 'player1', nickname: 'Player1', fireworkCount: 10, lastActionTime: Date.now() },
        { id: 'player2', nickname: 'Player2', fireworkCount: 10, lastActionTime: Date.now() },
        { id: 'player3', nickname: 'Player3', fireworkCount: 10, lastActionTime: Date.now() },
      ];

      players.forEach((player) => roomManager.addPlayerToRoom(room.id, player));

      const leaderboard = roomManager.getLeaderboard(room.id);

      expect(leaderboard).toHaveLength(3);
      // 所有玩家烟花数量相同，应该都在排行榜中
      expect(leaderboard.every((p) => p.fireworkCount === 10)).toBe(true);
    });
  });
});
