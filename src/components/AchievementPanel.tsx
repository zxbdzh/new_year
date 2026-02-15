/**
 * 成就面板组件
 * Feature: achievement-system
 * 
 * 展示成就列表和解锁进度
 */

import React, { useState } from 'react';
import type { Achievement, AchievementType } from '../types/AchievementTypes';
import { Button } from './Button';
import './AchievementPanel.css';

interface AchievementPanelProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 成就列表 */
  achievements: Achievement[];
}

/**
 * 成就等级颜色映射
 */
const tierColors: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2'
};

/**
 * 成就等级名称映射
 */
const tierNames: Record<string, string> = {
  bronze: '青铜',
  silver: '白银',
  gold: '黄金',
  platinum: '铂金'
};

/**
 * 成就类型名称映射
 */
const typeNames: Record<AchievementType, string> = {
  clicks: '点击',
  combo: '连击',
  collection: '收藏',
  playtime: '时长',
  special: '特殊'
};

/**
 * 成就面板组件
 */
export const AchievementPanel: React.FC<AchievementPanelProps> = ({
  isOpen,
  onClose,
  achievements
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  if (!isOpen) {
    return null;
  }

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div className="achievement-overlay" onClick={onClose}>
      <div className="achievement-modal" onClick={(e) => e.stopPropagation()}>
        <div className="achievement-header">
          <h2>🏆 成就系统</h2>
          <button className="close-button" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        <div className="achievement-progress">
          <div className="progress-info">
            <span>解锁进度</span>
            <span className="progress-count">{unlockedCount} / {totalCount}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="achievement-filters">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部 ({totalCount})
          </button>
          <button
            className={`filter-button ${filter === 'unlocked' ? 'active' : ''}`}
            onClick={() => setFilter('unlocked')}
          >
            已解锁 ({unlockedCount})
          </button>
          <button
            className={`filter-button ${filter === 'locked' ? 'active' : ''}`}
            onClick={() => setFilter('locked')}
          >
            未解锁 ({totalCount - unlockedCount})
          </button>
        </div>

        <div className="achievement-content">
          <div className="achievement-list">
            {filteredAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon" style={{
                  borderColor: achievement.unlocked ? tierColors[achievement.tier] : undefined
                }}>
                  {achievement.icon}
                </div>
                
                <div className="achievement-info">
                  <div className="achievement-title">
                    <h3>{achievement.name}</h3>
                    <span 
                      className="achievement-tier"
                      style={{ 
                        backgroundColor: tierColors[achievement.tier],
                        opacity: achievement.unlocked ? 1 : 0.5
                      }}
                    >
                      {tierNames[achievement.tier]}
                    </span>
                  </div>
                  
                  <p className="achievement-description">
                    {achievement.description}
                  </p>
                  
                  <div className="achievement-progress-bar">
                    <div 
                      className="achievement-progress-fill"
                      style={{ 
                        width: `${(achievement.progress / achievement.target) * 100}%`,
                        backgroundColor: tierColors[achievement.tier]
                      }}
                    />
                  </div>
                  
                  <div className="achievement-stats">
                    <span className="achievement-type">
                      {typeNames[achievement.type]}
                    </span>
                    <span className="achievement-progress-text">
                      {achievement.progress} / {achievement.target}
                    </span>
                  </div>
                  
                  {achievement.reward && achievement.unlocked && (
                    <div className="achievement-reward">
                      🎁 {achievement.reward}
                    </div>
                  )}
                  
                  {achievement.unlockedAt && (
                    <div className="achievement-unlock-time">
                      解锁于: {new Date(achievement.unlockedAt).toLocaleString('zh-CN')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="achievement-footer">
          <Button variant="primary" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
};
