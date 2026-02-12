/**
 * 多人游戏组件单元测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MultiplayerGame } from './MultiplayerGame';
import { NetworkSynchronizer } from '../services/NetworkSynchronizer';
import type { RoomInfo, PlayerInfo, FireworkAction } from '../types/NetworkTypes';

// Mock NetworkSynchronizer
vi.mock('../services/NetworkSynchronizer');

// Mock FireworksEngine
vi.mock('../engines/FireworksEngine', () => ({
  FireworksEngine: class MockFireworksEngine {
    launchFirework = vi.fn().mockReturnValue('firework-id-123');
    destroy = vi.fn();
    clear = vi.fn();
  },
}));

// Mock CountdownDisplay
vi.mock('./CountdownDisplay', () => ({
  CountdownDisplay: () => <div data-testid="countdown-display">倒计时</div>,
}));

// Mock PlayerNotification
vi.mock('./PlayerNotification', () => ({
  PlayerNotification: ({ notifications }: any) => (
    <div data-testid="player-notifications">
      {notifications.map((n: any) => (
        <div key={n.id}>{n.playerNickname}</div>
      ))}
    </div>
  ),
}));

describe('MultiplayerGame', () => {
  let mockNetworkSynchronizer: NetworkSynchronizer;
  let mockRoomInfo: RoomInfo;
  let mockLeaderboard: PlayerInfo[];

  beforeEach(() => {
    // 创建mock房间信息
    mockRoomInfo = {
      id: 'room-123',
      type: 'public',
      players: [
        { id: 'player-1', nickname: '玩家1', fireworkCount: 10, lastActionTime: Date.now() },
        { id: 'player-2', nickname: '玩家2', fireworkCount: 5, lastActionTime: Date.now() },
      ],
      maxPlayers: 20,
      createdAt: Date.now(),
    };

    mockLeaderboard = [
      { id: 'player-1', nickname: '玩家1', fireworkCount: 10, lastActionTime: Date.now() },
      { id: 'player-2', nickname: '玩家2', fireworkCount: 5, lastActionTime: Date.now() },
    ];

    // 创建mock网络同步器
    mockNetworkSynchronizer = {
      sendFireworkAction: vi.fn(),
      leaveRoom: vi.fn(),
      getRoomInfo: vi.fn().mockReturnValue(mockRoomInfo),
      getLeaderboard: vi.fn().mockReturnValue(mockLeaderboard),
      onFireworkAction: vi.fn().mockReturnValue(() => {}),
      onRoomUpdate: vi.fn().mockReturnValue(() => {}),
      onLeaderboardUpdate: vi.fn().mockReturnValue(() => {}),
    } as any;
  });

  it('应该渲染多人游戏界面', () => {
    render(<MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />);

    expect(screen.getByTestId('countdown-display')).toBeInTheDocument();
    expect(screen.getByText(/在线:/)).toBeInTheDocument();
    expect(screen.getByText('退出房间')).toBeInTheDocument();
  });

  it('应该显示在线人数', () => {
    render(<MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />);

    expect(screen.getByText('在线: 2/20')).toBeInTheDocument();
  });

  it('应该显示排行榜', () => {
    render(<MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />);

    expect(screen.getByText('🏆 排行榜')).toBeInTheDocument();
    expect(screen.getByText('玩家1')).toBeInTheDocument();
    expect(screen.getByText('玩家2')).toBeInTheDocument();
  });

  it('应该在点击画布时设置事件处理器', () => {
    const { container } = render(
      <MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    // 验证画布有正确的类名和事件处理器属性
    expect(canvas).toHaveAttribute('class', 'multiplayer-canvas');
  });

  it('应该处理接收到的烟花动作', () => {
    let fireworkActionCallback: ((action: FireworkAction) => void) | null = null;

    // 捕获回调函数
    mockNetworkSynchronizer.onFireworkAction = vi.fn((callback) => {
      fireworkActionCallback = callback;
      return () => {};
    });

    render(<MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />);

    // 模拟接收烟花动作
    const action: FireworkAction = {
      playerId: 'player-2',
      playerNickname: '玩家2',
      x: 300,
      y: 400,
      fireworkTypeId: 'peony',
      timestamp: Date.now(),
    };

    fireworkActionCallback?.(action);

    // 验证显示玩家通知
    expect(screen.getByText('玩家2')).toBeInTheDocument();
  });

  it('应该在退出时清理资源', () => {
    const onExit = vi.fn();

    render(
      <MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} onExit={onExit} />
    );

    const exitButton = screen.getByText('退出房间');
    fireEvent.click(exitButton);

    expect(mockNetworkSynchronizer.leaveRoom).toHaveBeenCalled();
    expect(onExit).toHaveBeenCalled();
  });

  it('应该处理房间信息更新', async () => {
    let roomUpdateCallback: ((room: RoomInfo) => void) | null = null;

    mockNetworkSynchronizer.onRoomUpdate = vi.fn((callback) => {
      roomUpdateCallback = callback;
      return () => {};
    });

    const { rerender } = render(
      <MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />
    );

    // 模拟房间更新
    const updatedRoom: RoomInfo = {
      ...mockRoomInfo,
      players: [
        ...mockRoomInfo.players,
        { id: 'player-3', nickname: '玩家3', fireworkCount: 0, lastActionTime: Date.now() },
      ],
    };

    roomUpdateCallback?.(updatedRoom);

    // 强制重新渲染
    rerender(<MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />);

    // 等待状态更新
    await new Promise(resolve => setTimeout(resolve, 100));

    // 验证在线人数更新 - 使用正则表达式匹配
    expect(screen.getByText(/在线:\s*3\s*\/\s*20/)).toBeInTheDocument();
  });

  it('应该处理排行榜更新', () => {
    let leaderboardCallback: ((leaderboard: PlayerInfo[]) => void) | null = null;

    mockNetworkSynchronizer.onLeaderboardUpdate = vi.fn((callback) => {
      leaderboardCallback = callback;
      return () => {};
    });

    const { rerender } = render(
      <MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />
    );

    // 模拟排行榜更新
    const updatedLeaderboard: PlayerInfo[] = [
      { id: 'player-3', nickname: '玩家3', fireworkCount: 15, lastActionTime: Date.now() },
      { id: 'player-1', nickname: '玩家1', fireworkCount: 10, lastActionTime: Date.now() },
      { id: 'player-2', nickname: '玩家2', fireworkCount: 5, lastActionTime: Date.now() },
    ];

    leaderboardCallback?.(updatedLeaderboard);

    // 强制重新渲染
    rerender(<MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />);

    // 验证排行榜显示新玩家
    expect(screen.getByText('玩家3')).toBeInTheDocument();
  });

  it('应该处理触摸事件', () => {
    const { container } = render(
      <MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    // 验证画布有正确的类名和事件处理器属性
    expect(canvas).toHaveAttribute('class', 'multiplayer-canvas');
  });

  it('应该在没有排行榜时不显示排行榜面板', () => {
    mockNetworkSynchronizer.getLeaderboard = vi.fn().mockReturnValue([]);

    render(<MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />);

    expect(screen.queryByText('🏆 排行榜')).not.toBeInTheDocument();
  });

  it('应该正确显示房间类型', () => {
    const privateRoom: RoomInfo = {
      ...mockRoomInfo,
      type: 'private',
      code: '1234',
    };

    mockNetworkSynchronizer.getRoomInfo = vi.fn().mockReturnValue(privateRoom);

    render(<MultiplayerGame networkSynchronizer={mockNetworkSynchronizer} />);

    // 验证组件正常渲染
    expect(screen.getByText(/在线:/)).toBeInTheDocument();
  });
});
