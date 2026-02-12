/**
 * NetworkSynchronizer 测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NetworkSynchronizer } from './NetworkSynchronizer';
import type { RoomInfo, PlayerInfo, FireworkAction } from '../types/NetworkTypes';

// Mock Socket.io-client
vi.mock('socket.io-client', () => {
  const mockSocket = {
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(),
  };

  return {
    io: vi.fn(() => mockSocket),
  };
});

describe('NetworkSynchronizer', () => {
  let synchronizer: NetworkSynchronizer;
  let mockSocket: any;

  beforeEach(async () => {
    // 重置所有mock
    vi.clearAllMocks();

    // 获取mock socket
    const { io } = await import('socket.io-client');
    synchronizer = new NetworkSynchronizer('http://localhost:3001');
    mockSocket = (io as any)();
  });

  afterEach(() => {
    if (synchronizer) {
      synchronizer.disconnect();
    }
  });

  describe('连接管理', () => {
    it('应该成功连接到服务器', async () => {
      const connectPromise = synchronizer.connect();

      // 模拟服务器响应
      const connectedHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connected'
      )?.[1];
      
      if (connectedHandler) {
        connectedHandler({ socketId: 'test-socket-id', timestamp: Date.now() });
      }

      await connectPromise;

      expect(synchronizer.getConnectionState()).toBe('connected');
      expect(synchronizer.getLocalPlayerId()).toBe('test-socket-id');
    });

    it('应该在连接失败时抛出错误', async () => {
      const connectPromise = synchronizer.connect();

      // 模拟连接错误
      const errorHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connect_error'
      )?.[1];

      if (errorHandler) {
        errorHandler(new Error('连接失败'));
      }

      await expect(connectPromise).rejects.toThrow('连接失败');
      expect(synchronizer.getConnectionState()).toBe('disconnected');
    });

    it('应该正确断开连接', async () => {
      // 先连接
      const connectPromise = synchronizer.connect();
      const connectedHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connected'
      )?.[1];
      if (connectedHandler) {
        connectedHandler({ socketId: 'test-socket-id', timestamp: Date.now() });
      }
      await connectPromise;

      // 断开连接
      synchronizer.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(synchronizer.getConnectionState()).toBe('disconnected');
      expect(synchronizer.getRoomInfo()).toBeNull();
      expect(synchronizer.getLocalPlayerId()).toBeNull();
    });

    it('应该在已连接时不重复连接', async () => {
      // 第一次连接
      const connectPromise1 = synchronizer.connect();
      const connectedHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connected'
      )?.[1];
      if (connectedHandler) {
        connectedHandler({ socketId: 'test-socket-id', timestamp: Date.now() });
      }
      await connectPromise1;

      // 清除mock调用记录
      vi.clearAllMocks();

      // 第二次连接
      await synchronizer.connect();

      // 不应该创建新的socket连接
      const { io } = await import('socket.io-client');
      expect(io).not.toHaveBeenCalled();
    });
  });

  describe('房间管理', () => {
    beforeEach(async () => {
      // 建立连接
      const connectPromise = synchronizer.connect();
      const connectedHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connected'
      )?.[1];
      if (connectedHandler) {
        connectedHandler({ socketId: 'test-socket-id', timestamp: Date.now() });
      }
      await connectPromise;
    });

    it('应该成功加入公共房间', async () => {
      const joinPromise = synchronizer.joinRoom('测试玩家', 'public');

      // 模拟服务器响应
      const roomJoinedHandler = mockSocket.once.mock.calls.find(
        (call: any[]) => call[0] === 'room_joined'
      )?.[1];

      const mockRoomInfo: RoomInfo = {
        id: 'room-123',
        type: 'public',
        players: [
          {
            id: 'test-socket-id',
            nickname: '测试玩家',
            fireworkCount: 0,
            lastActionTime: Date.now(),
          },
        ],
        maxPlayers: 20,
        createdAt: Date.now(),
      };

      if (roomJoinedHandler) {
        roomJoinedHandler({
          roomInfo: mockRoomInfo,
          playerId: 'test-socket-id',
        });
      }

      const roomInfo = await joinPromise;

      expect(roomInfo.id).toBe('room-123');
      expect(roomInfo.type).toBe('public');
      expect(synchronizer.getRoomInfo()).toEqual(mockRoomInfo);
      expect(mockSocket.emit).toHaveBeenCalledWith('join_room', {
        nickname: '测试玩家',
        roomType: 'public',
        code: undefined,
      });
    });

    it('应该成功加入私人房间', async () => {
      const joinPromise = synchronizer.joinRoom('测试玩家', 'private', '1234');

      const roomJoinedHandler = mockSocket.once.mock.calls.find(
        (call: any[]) => call[0] === 'room_joined'
      )?.[1];

      const mockRoomInfo: RoomInfo = {
        id: 'room-456',
        type: 'private',
        code: '1234',
        players: [
          {
            id: 'test-socket-id',
            nickname: '测试玩家',
            fireworkCount: 0,
            lastActionTime: Date.now(),
          },
        ],
        maxPlayers: 20,
        createdAt: Date.now(),
      };

      if (roomJoinedHandler) {
        roomJoinedHandler({
          roomInfo: mockRoomInfo,
          playerId: 'test-socket-id',
        });
      }

      const roomInfo = await joinPromise;

      expect(roomInfo.code).toBe('1234');
      expect(mockSocket.emit).toHaveBeenCalledWith('join_room', {
        nickname: '测试玩家',
        roomType: 'private',
        code: '1234',
      });
    });

    it('应该在加入房间失败时抛出错误', async () => {
      const joinPromise = synchronizer.joinRoom('测试玩家', 'public');

      const joinErrorHandler = mockSocket.once.mock.calls.find(
        (call: any[]) => call[0] === 'join_room_error'
      )?.[1];

      if (joinErrorHandler) {
        joinErrorHandler({
          error: 'room_full',
          message: '房间已满',
        });
      }

      await expect(joinPromise).rejects.toThrow('房间已满');
    });

    it('应该正确离开房间', async () => {
      // 先加入房间
      const joinPromise = synchronizer.joinRoom('测试玩家', 'public');
      const roomJoinedHandler = mockSocket.once.mock.calls.find(
        (call: any[]) => call[0] === 'room_joined'
      )?.[1];
      if (roomJoinedHandler) {
        roomJoinedHandler({
          roomInfo: {
            id: 'room-123',
            type: 'public',
            players: [],
            maxPlayers: 20,
            createdAt: Date.now(),
          },
          playerId: 'test-socket-id',
        });
      }
      await joinPromise;

      // 离开房间
      synchronizer.leaveRoom();

      expect(mockSocket.emit).toHaveBeenCalledWith('leave_room');
      expect(synchronizer.getRoomInfo()).toBeNull();
    });
  });

  describe('消息发送', () => {
    beforeEach(async () => {
      // 建立连接
      const connectPromise = synchronizer.connect();
      const connectedHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connected'
      )?.[1];
      if (connectedHandler) {
        connectedHandler({ socketId: 'test-socket-id', timestamp: Date.now() });
      }
      await connectPromise;
    });

    it('应该在连接时发送烟花动作', () => {
      synchronizer.sendFireworkAction(100, 200, 'peony');

      expect(mockSocket.emit).toHaveBeenCalledWith('firework_action', {
        x: 100,
        y: 200,
        fireworkTypeId: 'peony',
      });
    });

    it('应该在连接时发送聊天消息', () => {
      synchronizer.sendChatMessage('新年快乐！');

      expect(mockSocket.emit).toHaveBeenCalledWith('chat_message', {
        message: '新年快乐！',
      });
    });

    it('应该在离线时将消息加入队列', () => {
      // 断开连接
      synchronizer.disconnect();

      // 发送消息
      synchronizer.sendFireworkAction(100, 200, 'peony');
      synchronizer.sendChatMessage('测试消息');

      // 消息应该被加入队列，不会立即发送
      expect(mockSocket.emit).not.toHaveBeenCalledWith('firework_action', expect.anything());
      expect(mockSocket.emit).not.toHaveBeenCalledWith('chat_message', expect.anything());
    });
  });

  describe('事件回调', () => {
    beforeEach(async () => {
      // 建立连接
      const connectPromise = synchronizer.connect();
      const connectedHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connected'
      )?.[1];
      if (connectedHandler) {
        connectedHandler({ socketId: 'test-socket-id', timestamp: Date.now() });
      }
      await connectPromise;
    });

    it('应该触发烟花动作回调', () => {
      const callback = vi.fn();
      synchronizer.onFireworkAction(callback);

      // 模拟服务器广播烟花动作
      const fireworkHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'firework_broadcast'
      )?.[1];

      const mockAction: FireworkAction = {
        playerId: 'other-player',
        playerNickname: '其他玩家',
        x: 150,
        y: 250,
        fireworkTypeId: 'heart',
        timestamp: Date.now(),
      };

      if (fireworkHandler) {
        fireworkHandler(mockAction);
      }

      expect(callback).toHaveBeenCalledWith(mockAction);
    });

    it('应该触发玩家加入回调', () => {
      const callback = vi.fn();
      synchronizer.onPlayerJoin(callback);

      // 模拟玩家加入
      const playerJoinedHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'player_joined'
      )?.[1];

      const mockPlayer: PlayerInfo = {
        id: 'new-player',
        nickname: '新玩家',
        fireworkCount: 0,
        lastActionTime: Date.now(),
      };

      if (playerJoinedHandler) {
        playerJoinedHandler({ player: mockPlayer, timestamp: Date.now() });
      }

      expect(callback).toHaveBeenCalledWith(mockPlayer);
    });

    it('应该触发玩家离开回调', () => {
      const callback = vi.fn();
      synchronizer.onPlayerLeave(callback);

      // 模拟玩家离开
      const playerLeftHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'player_left'
      )?.[1];

      if (playerLeftHandler) {
        playerLeftHandler({
          socketId: 'leaving-player',
          nickname: '离开的玩家',
          timestamp: Date.now(),
        });
      }

      expect(callback).toHaveBeenCalledWith('leaving-player');
    });

    it('应该触发房间更新回调', async () => {
      // 先加入房间
      const joinPromise = synchronizer.joinRoom('测试玩家', 'public');
      const roomJoinedHandler = mockSocket.once.mock.calls.find(
        (call: any[]) => call[0] === 'room_joined'
      )?.[1];

      const mockRoomInfo: RoomInfo = {
        id: 'room-123',
        type: 'public',
        players: [
          {
            id: 'test-socket-id',
            nickname: '测试玩家',
            fireworkCount: 0,
            lastActionTime: Date.now(),
          },
        ],
        maxPlayers: 20,
        createdAt: Date.now(),
      };

      if (roomJoinedHandler) {
        roomJoinedHandler({
          roomInfo: mockRoomInfo,
          playerId: 'test-socket-id',
        });
      }
      await joinPromise;

      // 注册房间更新回调
      const callback = vi.fn();
      synchronizer.onRoomUpdate(callback);

      // 模拟玩家列表更新
      const playerUpdateHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'player_update'
      )?.[1];

      const updatedPlayers: PlayerInfo[] = [
        {
          id: 'test-socket-id',
          nickname: '测试玩家',
          fireworkCount: 5,
          lastActionTime: Date.now(),
        },
        {
          id: 'new-player',
          nickname: '新玩家',
          fireworkCount: 0,
          lastActionTime: Date.now(),
        },
      ];

      if (playerUpdateHandler) {
        playerUpdateHandler({ players: updatedPlayers });
      }

      // 验证回调被触发，且房间信息已更新
      expect(callback).toHaveBeenCalled();
      const updatedRoomInfo = callback.mock.calls[0][0];
      expect(updatedRoomInfo.players).toHaveLength(2);
      expect(updatedRoomInfo.players[0].fireworkCount).toBe(5);
      expect(updatedRoomInfo.players[1].nickname).toBe('新玩家');
    });

    it('应该触发连接状态变化回调', async () => {
      const callback = vi.fn();
      synchronizer.onConnectionStateChange(callback);

      // 断开连接会触发状态变化
      synchronizer.disconnect();

      expect(callback).toHaveBeenCalledWith('disconnected');
    });

    it('应该正确注销回调', () => {
      const callback = vi.fn();
      const unsubscribe = synchronizer.onFireworkAction(callback);

      // 注销回调
      unsubscribe();

      // 模拟服务器广播
      const fireworkHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'firework_broadcast'
      )?.[1];

      if (fireworkHandler) {
        fireworkHandler({
          playerId: 'test',
          playerNickname: 'test',
          x: 0,
          y: 0,
          fireworkTypeId: 'peony',
          timestamp: Date.now(),
        });
      }

      // 回调不应该被触发
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('延迟监测', () => {
    beforeEach(async () => {
      // 建立连接
      const connectPromise = synchronizer.connect();
      const connectedHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connected'
      )?.[1];
      if (connectedHandler) {
        connectedHandler({ socketId: 'test-socket-id', timestamp: Date.now() });
      }
      await connectPromise;
    });

    it('应该正确计算网络延迟', () => {
      const callback = vi.fn();
      synchronizer.onLatencyUpdate(callback);

      // 模拟ping/pong
      const pongHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'pong'
      )?.[1];

      if (pongHandler) {
        // 模拟50ms延迟
        vi.useFakeTimers();
        const startTime = Date.now();
        vi.advanceTimersByTime(50);
        pongHandler({ timestamp: Date.now() });
        vi.useRealTimers();
      }

      expect(callback).toHaveBeenCalled();
      const latencyInfo = synchronizer.getLatencyInfo();
      expect(latencyInfo.current).toBeGreaterThan(0);
    });

    it('应该在延迟过高时触发错误回调', () => {
      const errorCallback = vi.fn();
      synchronizer.onError(errorCallback);

      // 模拟高延迟pong
      const pongHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'pong'
      )?.[1];

      if (pongHandler) {
        vi.useFakeTimers();
        vi.advanceTimersByTime(3500); // 3.5秒延迟
        pongHandler({ timestamp: Date.now() });
        vi.useRealTimers();
      }

      expect(errorCallback).toHaveBeenCalledWith(expect.stringContaining('网络延迟过高'));
    });
  });

  describe('排行榜', () => {
    it('应该正确返回排行榜前3名', async () => {
      // 建立连接
      const connectPromise = synchronizer.connect();
      const connectedHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connected'
      )?.[1];
      if (connectedHandler) {
        connectedHandler({ socketId: 'test-socket-id', timestamp: Date.now() });
      }
      await connectPromise;

      // 加入房间
      const joinPromise = synchronizer.joinRoom('测试玩家', 'public');
      const roomJoinedHandler = mockSocket.once.mock.calls.find(
        (call: any[]) => call[0] === 'room_joined'
      )?.[1];

      const mockPlayers: PlayerInfo[] = [
        { id: '1', nickname: '玩家1', fireworkCount: 10, lastActionTime: Date.now() },
        { id: '2', nickname: '玩家2', fireworkCount: 50, lastActionTime: Date.now() },
        { id: '3', nickname: '玩家3', fireworkCount: 30, lastActionTime: Date.now() },
        { id: '4', nickname: '玩家4', fireworkCount: 20, lastActionTime: Date.now() },
      ];

      if (roomJoinedHandler) {
        roomJoinedHandler({
          roomInfo: {
            id: 'room-123',
            type: 'public',
            players: mockPlayers,
            maxPlayers: 20,
            createdAt: Date.now(),
          },
          playerId: 'test-socket-id',
        });
      }
      await joinPromise;

      const leaderboard = synchronizer.getLeaderboard();

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].nickname).toBe('玩家2'); // 50个烟花
      expect(leaderboard[1].nickname).toBe('玩家3'); // 30个烟花
      expect(leaderboard[2].nickname).toBe('玩家4'); // 20个烟花
    });

    it('应该在没有房间时返回空排行榜', () => {
      const leaderboard = synchronizer.getLeaderboard();
      expect(leaderboard).toEqual([]);
    });
  });

  describe('边缘情况', () => {
    it('应该在未连接时拒绝加入房间', async () => {
      await expect(
        synchronizer.joinRoom('测试玩家', 'public')
      ).rejects.toThrow('未连接到服务器');
    });

    it('应该在没有房间时安全地离开房间', () => {
      expect(() => synchronizer.leaveRoom()).not.toThrow();
    });

    it('应该正确处理空的延迟历史', () => {
      const latencyInfo = synchronizer.getLatencyInfo();
      expect(latencyInfo).toEqual({
        current: 0,
        average: 0,
        min: 0,
        max: 0,
      });
    });
  });
});
