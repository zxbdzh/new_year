/**
 * 统计面板组件
 * Feature: statistics-visualization
 * 
 * 展示游戏统计数据和可视化图表
 */

import React from 'react';
import { Button } from './Button';
import './StatisticsPanel.css';

interface StatisticsPanelProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 统计数据 */
  statistics: {
    totalClicks: number;
    maxCombo: number;
    totalPlayTime: number;
    fireworksLaunched: number;
    gamesPlayed: number;
  };
}

/**
 * 格式化游戏时长
 */
function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟 ${secs}秒`;
  } else {
    return `${secs}秒`;
  }
}

/**
 * 统计面板组件
 */
export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  isOpen,
  onClose,
  statistics
}) => {
  if (!isOpen) {
    return null;
  }

  const avgClicksPerGame = statistics.gamesPlayed > 0 
    ? Math.round(statistics.totalClicks / statistics.gamesPlayed)
    : 0;

  return (
    <div className="statistics-overlay" onClick={onClose}>
      <div className="statistics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="statistics-header">
          <h2>📊 游戏统计</h2>
          <button className="close-button" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        <div className="statistics-content">
          {/* 主要统计卡片 */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👆</div>
              <div className="stat-info">
                <div className="stat-value">{statistics.totalClicks.toLocaleString()}</div>
                <div className="stat-label">总点击次数</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-info">
                <div className="stat-value">{statistics.maxCombo}</div>
                <div className="stat-label">最高连击</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎆</div>
              <div className="stat-info">
                <div className="stat-value">{statistics.fireworksLaunched.toLocaleString()}</div>
                <div className="stat-label">烟花发射数</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-value">{formatPlayTime(statistics.totalPlayTime)}</div>
                <div className="stat-label">总游戏时长</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎮</div>
              <div className="stat-info">
                <div className="stat-value">{statistics.gamesPlayed}</div>
                <div className="stat-label">游戏场次</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-info">
                <div className="stat-value">{avgClicksPerGame}</div>
                <div className="stat-label">场均点击</div>
              </div>
            </div>
          </div>

          {/* 个人最佳记录 */}
          <div className="personal-best">
            <h3>🏆 个人最佳</h3>
            <div className="best-records">
              <div className="record-item">
                <span className="record-label">最高连击:</span>
                <span className="record-value">{statistics.maxCombo}x</span>
              </div>
              <div className="record-item">
                <span className="record-label">单局最多点击:</span>
                <span className="record-value">{avgClicksPerGame}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="statistics-footer">
          <Button variant="primary" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
};
