/**
 * 启动界面组件
 * Feature: ui-ux-redesign
 * 需求：3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './Button';
import './LaunchScreen.css';

interface LaunchScreenProps {
  /** 点击开始的回调 */
  onStart: () => void;
  /** 音频控制器引用（用于用户交互后播放音乐） */
  onAudioUnlock?: () => void;
}

/**
 * 启动界面组件
 * 显示新年主题背景、飘雪动画
 * 内部维护网络状态检测（不显示UI）
 */
export function LaunchScreen({ onStart, onAudioUnlock }: LaunchScreenProps) {
  const [snowflakes] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 5 + Math.random() * 5,
    }))
  );

  const handleStart = () => {
    // 解锁音频（处理浏览器自动播放限制）
    if (onAudioUnlock) {
      onAudioUnlock();
    }
    onStart();
  };

  return (
    <div className="launch-screen">
      {/* 新年主题背景 */}
      <div className="launch-background">
        {/* 红灯笼装饰 */}
        <div className="lantern lantern-left" aria-hidden="true"></div>
        <div className="lantern lantern-right" aria-hidden="true"></div>

        {/* 对联装饰 */}
        <div className="couplet couplet-left" aria-hidden="true">
          <span>爆竹声中辞旧岁</span>
        </div>
        <div className="couplet couplet-right" aria-hidden="true">
          <span>烟花绽放迎新春</span>
        </div>
      </div>

      {/* 飘雪动画 */}
      <div className="snowflakes" aria-hidden="true">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="snowflake"
            style={{
              left: `${flake.left}%`,
              animationDelay: `${flake.animationDelay}s`,
              animationDuration: `${flake.animationDuration}s`,
            }}
          >
            <Sparkles size={16} />
          </div>
        ))}
      </div>

      {/* 主要内容 */}
      <div className="launch-content">
        <h1 className="launch-title">新年烟花游戏</h1>
        <p className="launch-subtitle">点燃烟花，迎接新年</p>

        {/* 点击开始按钮 - 使用新的Button组件 */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleStart}
          className="launch-button"
          ariaLabel="开始游戏"
        >
          点击开始
        </Button>
      </div>
    </div>
  );
}
