/**
 * GameEndScreen 组件测试
 * Feature: new-year-fireworks-game
 * 需求：8.2, 8.3, 8.4, 8.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { GameEndScreen } from './GameEndScreen';
import gameReducer from '../store/gameSlice';

// Mock FireworksEngine
vi.mock('../engines/FireworksEngine', () => {
  const MockFireworksEngine = vi.fn(function(this: any) {
    this.launchFirework = vi.fn();
    this.launchFireworkRain = vi.fn();
    this.destroy = vi.fn();
  });
  return { FireworksEngine: MockFireworksEngine };
});

describe('GameEndScreen', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        game: gameReducer,
      },
    });

    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
    });
  });

  /**
   * 需求 8.2: 当游戏结束流程开始时，游戏系统应显示全屏新年祝福动画
   */
  it('should display full-screen blessing animation when shown', () => {
    render(
      <Provider store={store}>
        <GameEndScreen show={true} />
      </Provider>
    );

    // 验证祝福文字显示（使用 getAllByText 因为有主文字和阴影）
    const blessingTexts = screen.getAllByText('新年快乐');
    expect(blessingTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('Happy Lunar New Year!')).toBeInTheDocument();

    // 验证画布存在
    const canvas = document.querySelector('.fireworks-canvas');
    expect(canvas).toBeInTheDocument();

    // 验证全屏容器
    const container = document.querySelector('.game-end-screen');
    expect(container).toBeInTheDocument();
  });

  /**
   * 需求 8.3: 当祝福动画播放完毕时，游戏系统应显示"再玩一次"和"退出"两个选项按钮
   */
  it('should display action buttons after animation delay', async () => {
    vi.useFakeTimers();

    render(
      <Provider store={store}>
        <GameEndScreen show={true} />
      </Provider>
    );

    // 初始时按钮容器不应该有 show 类
    const actionsContainer = document.querySelector('.end-screen-actions');
    expect(actionsContainer).not.toHaveClass('show');

    // 快进2秒并等待状态更新
    await vi.advanceTimersByTimeAsync(2000);

    // 验证按钮显示
    expect(actionsContainer).toHaveClass('show');

    // 验证按钮存在
    expect(screen.getByLabelText('再玩一次')).toBeInTheDocument();
    expect(screen.getByLabelText('退出游戏')).toBeInTheDocument();

    vi.useRealTimers();
  });

  /**
   * 需求 8.4: 当玩家点击"再玩一次"时，游戏系统应重置倒计时并返回游戏界面
   */
  it('should reset game and return to menu when play again button is clicked', () => {
    render(
      <Provider store={store}>
        <GameEndScreen show={true} />
      </Provider>
    );

    const playAgainButton = screen.getByLabelText('再玩一次');
    fireEvent.click(playAgainButton);

    // 验证返回到菜单模式
    const state = store.getState();
    expect(state.game.mode).toBe('menu');
  });

  /**
   * 需求 8.5: 当玩家点击"退出"时，游戏系统应保存所有数据并返回启动界面
   */
  it('should save data and return to launch screen when exit button is clicked', () => {
    render(
      <Provider store={store}>
        <GameEndScreen show={true} />
      </Provider>
    );

    const exitButton = screen.getByLabelText('退出游戏');
    fireEvent.click(exitButton);

    // 验证返回到菜单模式
    const state = store.getState();
    expect(state.game.mode).toBe('menu');
  });

  it('should not render when show is false', () => {
    const { container } = render(
      <Provider store={store}>
        <GameEndScreen show={false} />
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Provider store={store}>
        <GameEndScreen show={true} />
      </Provider>
    );

    const canvas = document.querySelector('.fireworks-canvas');
    expect(canvas).toHaveAttribute('aria-hidden', 'true');

    const playAgainButton = screen.getByLabelText('再玩一次');
    expect(playAgainButton).toHaveAttribute('aria-label', '再玩一次');

    const exitButton = screen.getByLabelText('退出游戏');
    expect(exitButton).toHaveAttribute('aria-label', '退出游戏');
  });

  it('should display blessing decorations', () => {
    render(
      <Provider store={store}>
        <GameEndScreen show={true} />
      </Provider>
    );

    const decorations = document.querySelector('.blessing-decorations');
    expect(decorations).toBeInTheDocument();
    
    const emojis = document.querySelectorAll('.decoration-emoji');
    expect(emojis.length).toBe(5);
  });

  it('should have proper button structure', () => {
    render(
      <Provider store={store}>
        <GameEndScreen show={true} />
      </Provider>
    );

    const playAgainButton = screen.getByLabelText('再玩一次');
    expect(playAgainButton.querySelector('.button-icon')).toBeInTheDocument();
    expect(playAgainButton.querySelector('.button-text')).toBeInTheDocument();

    const exitButton = screen.getByLabelText('退出游戏');
    expect(exitButton.querySelector('.button-icon')).toBeInTheDocument();
    expect(exitButton.querySelector('.button-text')).toBeInTheDocument();
  });
});
