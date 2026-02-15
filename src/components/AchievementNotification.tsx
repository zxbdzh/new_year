/**
 * 成就解锁通知组件
 * Feature: achievement-system
 * 
 * 显示成就解锁的弹出通知
 */

import React, { useEffect, useState } from 'react';
import type { Achievement } from '../types/AchievementTypes';
import './AchievementNotification.css';

interface AchievementNotificationProps {
  /** 成就数据 */
  achievement: Achievement | null;
  /** 关闭回调 */
  onClose: () => void;
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
 * 成就解锁通知组件
 */
export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      
      // 5秒后自动关闭
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // 等待动画完成
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) {
    return null;
  }

  return (
    <div className={`achievement-notification ${isVisible ? 'visible' : ''}`}>
      <div className="notification-content">
        <div className="notification-header">
          <span className="notification-title">🎉 成就解锁!</span>
        </div>
        
        <div className="notification-body">
          <div 
            className="notification-icon"
            style={{ borderColor: tierColors[achievement.tier] }}
          >
            {achievement.icon}
          </div>
          
          <div className="notification-info">
            <h3 className="achievement-name">{achievement.name}</h3>
            <p className="achievement-desc">{achievement.description}</p>
            {achievement.reward && (
              <div className="achievement-reward-badge">
                🎁 {achievement.reward}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <button 
        className="notification-close"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        aria-label="关闭"
      >
        ×
      </button>
    </div>
  );
};
