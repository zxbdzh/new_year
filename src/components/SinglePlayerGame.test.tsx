/**
 * 单人游戏组件测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SinglePlayerGame } from './SinglePlayerGame';
import gameReducer from '../store/gameSlice';
import audioReducer from '../store/audioSlice';
import statisticsReducer from '../store/statisticsSlice';
import themeReducer from '../store/themeSlice';
import multiplayerReducer from '../store/multiplayerSlice';

// Mock Canvas API
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  globalAlpha: 1,
  lineWidth: 1,
})) as any;

// Mock AudioContext
global.AudioContext = vi.fn().mockImplementation(() => ({
  createGain: vi.fn(() => ({
    gain: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  })),
  createOscillator: vi.fn(() => ({
    type: 'sine',
    frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
  })),
  createBuffer: vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(100)),
  })),
  createBufferSource: vi.fn(() => ({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createBiquadFilter: vi.fn(() => ({
    type: 'lowpass',
    frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  })),
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
})) as any;

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    result: {
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          get: vi.fn(() => ({ onsuccess: null, onerror: null })),
          put: vi.fn(() => ({ onsuccess: null, onerror: null })),
        })),
      })),
    },
  })),
};

global.indexedDB = mockIndexedDB as any;

describe('SinglePlayerGame', () => {
  let store: ReturnType<typeof configureStore>;
  let mockOnExit: ReturnType<typeof vi.fn>;
  let mockOnGameEnd: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // 创建测试store
    store = configureStore({
      reducer: {
        game: gameReducer,
        audio: audioReducer,
        statistics: statisticsReducer,
        theme: themeReducer,
        multiplayer: multiplayerReducer,
      },
    });

    mockOnExit = vi.fn();
    mockOnGameEnd = vi.fn();

    // 清除所有mock调用
    vi.clearAllMocks();
  });

  it('应该渲染单人游戏组件', () => {
    render(
      <Provider store={store}>
        <SinglePlayerGame onExit={mockOnExit} onGameEnd={mockOnGameEnd} />
      </Provider>
    );

    // 检查Canvas是否存在
    const canvas = screen.getByLabelText('点击屏幕燃放烟花');
    expect(canvas).toBeInTheDocument();
  });

  it('应该显示控制按钮', () => {
    render(
      <Provider store={store}>
        <SinglePlayerGame onExit={mockOnExit} onGameEnd={mockOnGameEnd} />
      </Provider>
    );

    // 检查静音按钮
    const muteButton = screen.getByLabelText(/静音/);
    expect(muteButton).toBeInTheDocument();

    // 检查设置按钮
    const settingsButton = screen.getByLabelText('设置');
    expect(settingsButton).toBeInTheDocument();
  });

  it('应该显示底部按钮', () => {
    render(
      <Provider store={store}>
        <SinglePlayerGame onExit={mockOnExit} onGameEnd={mockOnGameEnd} />
      </Provider>
    );

    // 检查重新开始按钮
    const restartButton = screen.getByLabelText('重新开始');
    expect(restartButton).toBeInTheDocument();

    // 检查退出按钮
    const exitButton = screen.getByLabelText('退出游戏');
    expect(exitButton).toBeInTheDocument();
  });

  it('应该在点击退出按钮时调用onExit回调', () => {
    render(
      <Provider store={store}>
        <SinglePlayerGame onExit={mockOnExit} onGameEnd={mockOnGameEnd} />
      </Provider>
    );

    const exitButton = screen.getByLabelText('退出游戏');
    fireEvent.click(exitButton);

    expect(mockOnExit).toHaveBeenCalledTimes(1);
  });

  it('应该在点击设置按钮时显示设置对话框', () => {
    render(
      <Provider store={store}>
        <SinglePlayerGame onExit={mockOnExit} onGameEnd={mockOnGameEnd} />
      </Provider>
    );

    const settingsButton = screen.getByLabelText('设置');
    fireEvent.click(settingsButton);

    // 检查设置对话框是否显示
    const settingsTitle = screen.getByText('游戏设置');
    expect(settingsTitle).toBeInTheDocument();
  });

  it('应该在点击关闭按钮时隐藏设置对话框', () => {
    render(
      <Provider store={store}>
        <SinglePlayerGame onExit={mockOnExit} onGameEnd={mockOnGameEnd} />
      </Provider>
    );

    // 打开设置
    const settingsButton = screen.getByLabelText('设置');
    fireEvent.click(settingsButton);

    // 关闭设置 (使用aria-label)
    const closeButton = screen.getByLabelText('关闭');
    fireEvent.click(closeButton);

    // 检查设置对话框是否隐藏
    const settingsTitle = screen.queryByText('游戏设置');
    expect(settingsTitle).not.toBeInTheDocument();
  });

  it('应该在点击Canvas时不抛出错误', () => {
    render(
      <Provider store={store}>
        <SinglePlayerGame onExit={mockOnExit} onGameEnd={mockOnGameEnd} />
      </Provider>
    );

    const canvas = screen.getByLabelText('点击屏幕燃放烟花');
    
    // 点击Canvas不应该抛出错误
    expect(() => {
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
    }).not.toThrow();
  });

  it('应该在触摸Canvas时不抛出错误', () => {
    render(
      <Provider store={store}>
        <SinglePlayerGame onExit={mockOnExit} onGameEnd={mockOnGameEnd} />
      </Provider>
    );

    const canvas = screen.getByLabelText('点击屏幕燃放烟花');
    
    // 触摸Canvas不应该抛出错误
    expect(() => {
      fireEvent.touchStart(canvas, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
    }).not.toThrow();
  });
});
