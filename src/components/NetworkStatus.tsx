/**
 * 网络状态指示器组件 (NetworkStatus)
 * Feature: new-year-fireworks-game
 * 
 * 显示网络连接状态和延迟信息
 * 
 * 验证需求：5.8, 11.5
 */

import React, { useEffect, useState } from 'react';
import type { NetworkSynchronizer } from '../services/NetworkSynchronizer';
import './NetworkStatus.css';

/**
 * 连接状态类型
 */
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

/**
 * 延迟等级
 */
type LatencyLevel = 'good' | 'medium' | 'bad';

/**
 * 组件属性
 */
interface NetworkStatusProps {
  /** 网络同步器实例 */
  networkSynchronizer: NetworkSynchronizer;
}

/**
 * 网络状态指示器组件
 * 显示连接状态、网络延迟和高延迟警告
 */
export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  networkSynchronizer,
}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [latency, setLatency] = useState<number>(0);
  const [latencyLevel, setLatencyLevel] = useState<LatencyLevel>('good');

  useEffect(() => {
    // 监听连接状态变化
    const unsubscribeState = networkSynchronizer.onConnectionStateChange((state) => {
      setConnectionState(state);
    });

    // 监听延迟更新
    const unsubscribeLatency = networkSynchronizer.onLatencyUpdate((latencyInfo) => {
      const currentLatency = latencyInfo.current;
      setLatency(currentLatency);

      // 根据延迟设置等级
      if (currentLatency < 1000) {
        setLatencyLevel('good');
      } else if (currentLatency < 3000) {
        setLatencyLevel('medium');
      } else {
        setLatencyLevel('bad');
      }
    });

    // 初始化状态
    setConnectionState(networkSynchronizer.getConnectionState());
    const initialLatency = networkSynchronizer.getLatencyInfo();
    const initialLatencyValue = initialLatency.current;
    setLatency(initialLatencyValue);
    
    // 初始化延迟等级
    if (initialLatencyValue < 1000) {
      setLatencyLevel('good');
    } else if (initialLatencyValue < 3000) {
      setLatencyLevel('medium');
    } else {
      setLatencyLevel('bad');
    }

    return () => {
      unsubscribeState();
      unsubscribeLatency();
    };
  }, [networkSynchronizer]);

  /**
   * 获取连接状态文本
   */
  const getConnectionText = (): string => {
    switch (connectionState) {
      case 'connected':
        return '已连接';
      case 'connecting':
        return '连接中...';
      case 'reconnecting':
        return '重连中...';
      case 'disconnected':
        return '已断开';
      case 'failed':
        return '连接失败';
      default:
        return '未知';
    }
  };

  /**
   * 获取连接状态图标
   */
  const getConnectionIcon = (): string => {
    switch (connectionState) {
      case 'connected':
        return '✓';
      case 'connecting':
      case 'reconnecting':
        return '⟳';
      case 'disconnected':
      case 'failed':
        return '✗';
      default:
        return '?';
    }
  };

  /**
   * 格式化延迟显示
   */
  const formatLatency = (): string => {
    if (latency < 1000) {
      return `${latency}ms`;
    } else {
      return `${(latency / 1000).toFixed(1)}s`;
    }
  };

  return (
    <div className="network-status" data-testid="network-status">
      {/* 连接状态 */}
      <div
        className={`network-status-connection network-status-connection--${connectionState}`}
        data-testid="connection-state"
      >
        <span className="network-status-icon">{getConnectionIcon()}</span>
        <span className="network-status-text">{getConnectionText()}</span>
      </div>

      {/* 网络延迟 */}
      {connectionState === 'connected' && (
        <div
          className={`network-status-latency network-status-latency--${latencyLevel}`}
          data-testid="latency-indicator"
        >
          <span className="network-status-latency-value">{formatLatency()}</span>
          {latencyLevel === 'bad' && (
            <span
              className="network-status-warning"
              data-testid="latency-warning"
              title="网络延迟较高"
            >
              ⚠
            </span>
          )}
        </div>
      )}
    </div>
  );
};
