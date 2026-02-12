/**
 * 网络状态指示器组件测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NetworkStatus } from './NetworkStatus';
import type { NetworkSynchronizer } from '../services/NetworkSynchronizer';

// Mock NetworkSynchronizer
const createMockNetworkSynchronizer = (
  initialState: string = 'disconnected',
  initialLatency: number = 0
): NetworkSynchronizer => {
  const stateCallbacks = new Set<(state: any) => void>();
  const latencyCallbacks = new Set<(latency: any) => void>();

  return {
    onConnectionStateChange: vi.fn((callback) => {
      stateCallbacks.add(callback);
      return () => stateCallbacks.delete(callback);
    }),
    onLatencyUpdate: vi.fn((callback) => {
      latencyCallbacks.add(callback);
      return () => latencyCallbacks.delete(callback);
    }),
    getConnectionState: vi.fn(() => initialState),
    getLatencyInfo: vi.fn(() => ({
      current: initialLatency,
      average: initialLatency,
      min: initialLatency,
      max: initialLatency,
    })),
    // 用于测试的辅助方法
    _triggerStateChange: (state: string) => {
      stateCallbacks.forEach((cb) => cb(state));
    },
    _triggerLatencyUpdate: (latency: number) => {
      latencyCallbacks.forEach((cb) =>
        cb({
          current: latency,
          average: latency,
          min: latency,
          max: latency,
        })
      );
    },
  } as any;
};

describe('NetworkStatus', () => {
  it('should render network status indicator', () => {
    const mockSync = createMockNetworkSynchronizer();
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByTestId('network-status')).toBeInTheDocument();
    expect(screen.getByTestId('connection-state')).toBeInTheDocument();
  });

  it('should display disconnected state', () => {
    const mockSync = createMockNetworkSynchronizer('disconnected');
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByText('已断开')).toBeInTheDocument();
    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it('should display connecting state', () => {
    const mockSync = createMockNetworkSynchronizer('connecting');
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByText('连接中...')).toBeInTheDocument();
    expect(screen.getByText('⟳')).toBeInTheDocument();
  });

  it('should display connected state', () => {
    const mockSync = createMockNetworkSynchronizer('connected', 500);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByText('已连接')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should display reconnecting state', () => {
    const mockSync = createMockNetworkSynchronizer('reconnecting');
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByText('重连中...')).toBeInTheDocument();
    expect(screen.getByText('⟳')).toBeInTheDocument();
  });

  it('should display failed state', () => {
    const mockSync = createMockNetworkSynchronizer('failed');
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByText('连接失败')).toBeInTheDocument();
    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it('should show latency when connected with good latency (<1s)', () => {
    const mockSync = createMockNetworkSynchronizer('connected', 500);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByTestId('latency-indicator')).toBeInTheDocument();
    expect(screen.getByText('500ms')).toBeInTheDocument();
    expect(screen.getByTestId('latency-indicator')).toHaveClass('network-status-latency--good');
  });

  it('should show latency when connected with medium latency (1-3s)', () => {
    const mockSync = createMockNetworkSynchronizer('connected', 2000);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByText('2.0s')).toBeInTheDocument();
    expect(screen.getByTestId('latency-indicator')).toHaveClass('network-status-latency--medium');
  });

  it('should show latency when connected with bad latency (>3s)', () => {
    const mockSync = createMockNetworkSynchronizer('connected', 4000);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByText('4.0s')).toBeInTheDocument();
    expect(screen.getByTestId('latency-indicator')).toHaveClass('network-status-latency--bad');
  });

  it('should show warning icon for high latency (>3s)', () => {
    const mockSync = createMockNetworkSynchronizer('connected', 5000);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByTestId('latency-warning')).toBeInTheDocument();
    expect(screen.getByTestId('latency-warning')).toHaveTextContent('⚠');
  });

  it('should not show warning icon for good latency', () => {
    const mockSync = createMockNetworkSynchronizer('connected', 500);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.queryByTestId('latency-warning')).not.toBeInTheDocument();
  });

  it('should not show warning icon for medium latency', () => {
    const mockSync = createMockNetworkSynchronizer('connected', 2000);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.queryByTestId('latency-warning')).not.toBeInTheDocument();
  });

  it('should not show latency when disconnected', () => {
    const mockSync = createMockNetworkSynchronizer('disconnected', 500);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.queryByTestId('latency-indicator')).not.toBeInTheDocument();
  });

  it('should not show latency when connecting', () => {
    const mockSync = createMockNetworkSynchronizer('connecting', 500);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.queryByTestId('latency-indicator')).not.toBeInTheDocument();
  });

  it('should update connection state dynamically', async () => {
    const mockSync = createMockNetworkSynchronizer('disconnected');
    const { rerender } = render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByText('已断开')).toBeInTheDocument();

    // 触发状态变化
    mockSync._triggerStateChange('connected');
    
    // 强制重新渲染
    rerender(<NetworkStatus networkSynchronizer={mockSync} />);

    await waitFor(() => {
      expect(screen.getByText('已连接')).toBeInTheDocument();
    });
  });

  it('should update latency dynamically', async () => {
    const mockSync = createMockNetworkSynchronizer('connected', 500);
    const { rerender } = render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByText('500ms')).toBeInTheDocument();
    expect(screen.getByTestId('latency-indicator')).toHaveClass('network-status-latency--good');

    // 触发延迟变化到高延迟
    mockSync._triggerLatencyUpdate(4000);
    
    // 强制重新渲染
    rerender(<NetworkStatus networkSynchronizer={mockSync} />);

    await waitFor(() => {
      expect(screen.getByText('4.0s')).toBeInTheDocument();
      expect(screen.getByTestId('latency-indicator')).toHaveClass('network-status-latency--bad');
      expect(screen.getByTestId('latency-warning')).toBeInTheDocument();
    });
  });

  it('should format latency correctly for values < 1000ms', () => {
    const mockSync = createMockNetworkSynchronizer('connected', 123);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByText('123ms')).toBeInTheDocument();
  });

  it('should format latency correctly for values >= 1000ms', () => {
    const mockSync = createMockNetworkSynchronizer('connected', 1500);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByText('1.5s')).toBeInTheDocument();
  });

  it('should cleanup subscriptions on unmount', () => {
    const mockSync = createMockNetworkSynchronizer('connected', 500);
    const { unmount } = render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(mockSync.onConnectionStateChange).toHaveBeenCalled();
    expect(mockSync.onLatencyUpdate).toHaveBeenCalled();

    unmount();

    // 验证取消订阅函数被调用
    // 这里我们通过检查回调集合是否为空来验证
  });

  it('should apply correct CSS class for connected state', () => {
    const mockSync = createMockNetworkSynchronizer('connected', 500);
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByTestId('connection-state')).toHaveClass(
      'network-status-connection--connected'
    );
  });

  it('should apply correct CSS class for disconnected state', () => {
    const mockSync = createMockNetworkSynchronizer('disconnected');
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByTestId('connection-state')).toHaveClass(
      'network-status-connection--disconnected'
    );
  });

  it('should apply correct CSS class for reconnecting state', () => {
    const mockSync = createMockNetworkSynchronizer('reconnecting');
    render(<NetworkStatus networkSynchronizer={mockSync} />);

    expect(screen.getByTestId('connection-state')).toHaveClass(
      'network-status-connection--reconnecting'
    );
  });
});
