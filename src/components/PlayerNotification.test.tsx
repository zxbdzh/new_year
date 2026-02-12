/**
 * 玩家通知组件单元测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PlayerNotification, NotificationItem } from './PlayerNotification';

describe('PlayerNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该渲染通知列表', () => {
    const notifications: NotificationItem[] = [
      { id: '1', playerNickname: '玩家A', timestamp: Date.now() },
      { id: '2', playerNickname: '玩家B', timestamp: Date.now() },
    ];

    render(<PlayerNotification notifications={notifications} />);

    expect(screen.getByText('[玩家A] 燃放了烟花！')).toBeInTheDocument();
    expect(screen.getByText('[玩家B] 燃放了烟花！')).toBeInTheDocument();
  });

  it('应该在没有通知时不渲染任何内容', () => {
    const { container } = render(<PlayerNotification notifications={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('应该过滤掉过期的通知', () => {
    const now = Date.now();
    const notifications: NotificationItem[] = [
      { id: '1', playerNickname: '玩家A', timestamp: now - 31000 }, // 31秒前，已过期
      { id: '2', playerNickname: '玩家B', timestamp: now }, // 刚刚，未过期
    ];

    render(<PlayerNotification notifications={notifications} duration={30000} />);

    expect(screen.queryByText('[玩家A] 燃放了烟花！')).not.toBeInTheDocument();
    expect(screen.getByText('[玩家B] 燃放了烟花！')).toBeInTheDocument();
  });

  it('应该只显示最新的maxVisible条通知', () => {
    const now = Date.now();
    const notifications: NotificationItem[] = [
      { id: '1', playerNickname: '玩家1', timestamp: now - 1000 },
      { id: '2', playerNickname: '玩家2', timestamp: now - 800 },
      { id: '3', playerNickname: '玩家3', timestamp: now - 600 },
      { id: '4', playerNickname: '玩家4', timestamp: now - 400 },
      { id: '5', playerNickname: '玩家5', timestamp: now - 200 },
      { id: '6', playerNickname: '玩家6', timestamp: now },
    ];

    render(<PlayerNotification notifications={notifications} maxVisible={3} />);

    // 应该只显示最新的3条
    expect(screen.queryByText('[玩家1] 燃放了烟花！')).not.toBeInTheDocument();
    expect(screen.queryByText('[玩家2] 燃放了烟花！')).not.toBeInTheDocument();
    expect(screen.queryByText('[玩家3] 燃放了烟花！')).not.toBeInTheDocument();
    expect(screen.getByText('[玩家4] 燃放了烟花！')).toBeInTheDocument();
    expect(screen.getByText('[玩家5] 燃放了烟花！')).toBeInTheDocument();
    expect(screen.getByText('[玩家6] 燃放了烟花！')).toBeInTheDocument();
  });

  it('应该在持续时间后自动移除通知', async () => {
    // 使用真实时间而不是fake timers来避免复杂的时间控制
    vi.useRealTimers();
    
    const pastTime = Date.now() - 2000; // 2秒前
    const notifications: NotificationItem[] = [
      { id: '1', playerNickname: '玩家A', timestamp: pastTime },
    ];

    render(
      <PlayerNotification notifications={notifications} duration={1000} />
    );

    // 通知已经过期（2秒前创建，持续时间1秒），应该不显示
    expect(screen.queryByText('[玩家A] 燃放了烟花！')).not.toBeInTheDocument();
    
    vi.useFakeTimers();
  });

  it('应该支持自定义持续时间', () => {
    const now = Date.now();
    const notifications: NotificationItem[] = [
      { id: '1', playerNickname: '玩家A', timestamp: now - 11000 }, // 11秒前
    ];

    // 使用10秒持续时间，应该过期
    render(<PlayerNotification notifications={notifications} duration={10000} />);

    expect(screen.queryByText('[玩家A] 燃放了烟花！')).not.toBeInTheDocument();
  });

  it('应该正确显示中文昵称', () => {
    const notifications: NotificationItem[] = [
      { id: '1', playerNickname: '张三', timestamp: Date.now() },
      { id: '2', playerNickname: '李四', timestamp: Date.now() },
    ];

    render(<PlayerNotification notifications={notifications} />);

    expect(screen.getByText('[张三] 燃放了烟花！')).toBeInTheDocument();
    expect(screen.getByText('[李四] 燃放了烟花！')).toBeInTheDocument();
  });

  it('应该正确显示英文昵称', () => {
    const notifications: NotificationItem[] = [
      { id: '1', playerNickname: 'Alice', timestamp: Date.now() },
      { id: '2', playerNickname: 'Bob123', timestamp: Date.now() },
    ];

    render(<PlayerNotification notifications={notifications} />);

    expect(screen.getByText('[Alice] 燃放了烟花！')).toBeInTheDocument();
    expect(screen.getByText('[Bob123] 燃放了烟花！')).toBeInTheDocument();
  });

  it('应该处理通知列表更新', () => {
    const initialNotifications: NotificationItem[] = [
      { id: '1', playerNickname: '玩家A', timestamp: Date.now() },
    ];

    const { rerender } = render(
      <PlayerNotification notifications={initialNotifications} />
    );

    expect(screen.getByText('[玩家A] 燃放了烟花！')).toBeInTheDocument();

    // 添加新通知
    const updatedNotifications: NotificationItem[] = [
      ...initialNotifications,
      { id: '2', playerNickname: '玩家B', timestamp: Date.now() },
    ];

    rerender(<PlayerNotification notifications={updatedNotifications} />);

    expect(screen.getByText('[玩家A] 燃放了烟花！')).toBeInTheDocument();
    expect(screen.getByText('[玩家B] 燃放了烟花！')).toBeInTheDocument();
  });
});
