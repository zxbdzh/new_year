/**
 * 玩家通知组件 (PlayerNotification)
 * Feature: new-year-fireworks-game
 * 
 * 显示玩家烟花动作通知，例如 "[昵称] 燃放了烟花！"
 * 通知持续30秒后自动消失
 * 
 * 验证需求：5.4
 */

import React, { useEffect, useState } from 'react';
import './PlayerNotification.css';

/**
 * 通知项接口
 */
export interface NotificationItem {
  id: string;
  playerNickname: string;
  timestamp: number;
}

/**
 * 组件属性
 */
interface PlayerNotificationProps {
  /** 通知列表 */
  notifications: NotificationItem[];
  /** 通知持续时间（毫秒），默认30秒 */
  duration?: number;
  /** 最大显示数量，默认5条 */
  maxVisible?: number;
}

/**
 * 玩家通知组件
 */
export const PlayerNotification: React.FC<PlayerNotificationProps> = ({
  notifications,
  duration = 30000,
  maxVisible = 5,
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // 过滤掉过期的通知
    const now = Date.now();
    const activeNotifications = notifications.filter(
      (notification) => now - notification.timestamp < duration
    );

    // 只显示最新的几条
    const recentNotifications = activeNotifications.slice(-maxVisible);
    setVisibleNotifications(recentNotifications);

    // 设置定时器清理过期通知
    const timers = recentNotifications.map((notification) => {
      const remainingTime = duration - (now - notification.timestamp);
      if (remainingTime > 0) {
        return setTimeout(() => {
          setVisibleNotifications((prev) =>
            prev.filter((n) => n.id !== notification.id)
          );
        }, remainingTime);
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => timer && clearTimeout(timer));
    };
  }, [notifications, duration, maxVisible]);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="player-notification-container">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className="player-notification-item"
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <span className="player-notification-text">
            [{notification.playerNickname}] 燃放了烟花！
          </span>
        </div>
      ))}
    </div>
  );
};
