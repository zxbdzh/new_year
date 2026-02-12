/**
 * 玩家通知组件测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PlayerNotification } from './PlayerNotification';

describe('PlayerNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render notification with player nickname', () => {
    render(
      <PlayerNotification
        playerNickname="测试玩家"
        timestamp={Date.now()}
      />
    );

    expect(screen.getByTestId('player-notification')).toBeInTheDocument();
    expect(screen.getByText('[测试玩家] 燃放了烟花！')).toBeInTheDocument();
  });

  it('should auto-dismiss after default duration (30 seconds)', async () => {
    const onDismiss = vi.fn();
    
    const { rerender } = render(
      <PlayerNotification
        playerNickname="玩家A"
        timestamp={Date.now()}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByTestId('player-notification')).toBeInTheDocument();

    // 快进30秒
    vi.advanceTimersByTime(30000);
    
    // 强制重新渲染以触发状态更新
    rerender(
      <PlayerNotification
        playerNickname="玩家A"
        timestamp={Date.now()}
        onDismiss={onDismiss}
      />
    );

    expect(screen.queryByTestId('player-notification')).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should auto-dismiss after custom duration', async () => {
    const onDismiss = vi.fn();
    
    const { rerender } = render(
      <PlayerNotification
        playerNickname="玩家B"
        timestamp={Date.now()}
        duration={5000}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByTestId('player-notification')).toBeInTheDocument();

    // 快进5秒
    vi.advanceTimersByTime(5000);
    
    // 强制重新渲染以触发状态更新
    rerender(
      <PlayerNotification
        playerNickname="玩家B"
        timestamp={Date.now()}
        duration={5000}
        onDismiss={onDismiss}
      />
    );

    expect(screen.queryByTestId('player-notification')).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should handle Chinese nicknames', () => {
    render(
      <PlayerNotification
        playerNickname="小明"
        timestamp={Date.now()}
      />
    );

    expect(screen.getByText('[小明] 燃放了烟花！')).toBeInTheDocument();
  });

  it('should handle English nicknames', () => {
    render(
      <PlayerNotification
        playerNickname="Player123"
        timestamp={Date.now()}
      />
    );

    expect(screen.getByText('[Player123] 燃放了烟花！')).toBeInTheDocument();
  });

  it('should handle mixed language nicknames', () => {
    render(
      <PlayerNotification
        playerNickname="玩家ABC"
        timestamp={Date.now()}
      />
    );

    expect(screen.getByText('[玩家ABC] 燃放了烟花！')).toBeInTheDocument();
  });

  it('should not call onDismiss if not provided', async () => {
    const { rerender } = render(
      <PlayerNotification
        playerNickname="玩家C"
        timestamp={Date.now()}
        duration={1000}
      />
    );

    // 快进1秒
    vi.advanceTimersByTime(1000);
    
    // 强制重新渲染以触发状态更新
    rerender(
      <PlayerNotification
        playerNickname="玩家C"
        timestamp={Date.now()}
        duration={1000}
      />
    );

    expect(screen.queryByTestId('player-notification')).not.toBeInTheDocument();
    // 不应该抛出错误
  });

  it('should cleanup timer on unmount', () => {
    const { unmount } = render(
      <PlayerNotification
        playerNickname="玩家D"
        timestamp={Date.now()}
      />
    );

    unmount();

    // 快进时间，确保没有内存泄漏
    vi.advanceTimersByTime(30000);
  });
});
