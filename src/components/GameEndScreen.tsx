/**
 * 游戏结束界面组件
 * Feature: new-year-fireworks-game
 * 需求：8.2, 8.3, 8.4, 8.5
 * 
 * 完整的新年祝福动画实现，包含：
 * - 全屏新年祝福动画（"新年快乐"文字 + 烟花效果）
 * - "再玩一次"按钮（重置倒计时，返回游戏界面）
 * - "退出"按钮（保存数据，返回启动界面）
 */

import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setMode, resetGame } from '../store/gameSlice';
import { FireworksEngine } from '../engines/FireworksEngine';
import './GameEndScreen.css';

interface GameEndScreenProps {
  /** 是否显示 */
  show: boolean;
}

/**
 * 游戏结束界面组件
 * 显示新年祝福并提供"再玩一次"和"退出"选项
 */
export function GameEndScreen({ show }: GameEndScreenProps) {
  const dispatch = useAppDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FireworksEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [showButtons, setShowButtons] = useState(false);

  // 初始化烟花引擎和动画
  useEffect(() => {
    if (!show || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const engine = new FireworksEngine(canvas);
    engineRef.current = engine;

    // 调整canvas大小
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 延迟显示按钮，让祝福动画先播放
    const buttonTimer = setTimeout(() => {
      setShowButtons(true);
    }, 2000);

    // 启动自动烟花效果
    const fireworkInterval = setInterval(() => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.6; // 上半部分
      engine.launchFirework(x, y);
    }, 500); // 每500ms发射一个烟花

    // 初始烟花雨效果
    setTimeout(() => {
      engine.launchFireworkRain(canvas.width / 2, canvas.height / 3);
    }, 300);

    // 清理函数
    return () => {
      clearTimeout(buttonTimer);
      clearInterval(fireworkInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      engine.destroy();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [show]);

  // 重置状态当组件隐藏时
  useEffect(() => {
    if (!show) {
      setShowButtons(false);
    }
  }, [show]);

  if (!show) {
    return null;
  }

  // 处理"再玩一次"按钮
  const handlePlayAgain = () => {
    // 重置游戏状态但保留统计数据
    dispatch(resetGame());
    // 返回模式选择界面
    dispatch(setMode('menu'));
  };

  // 处理"退出"按钮
  const handleExit = () => {
    // 保存数据并返回启动界面
    dispatch(resetGame());
    dispatch(setMode('menu'));
  };

  return (
    <div className="game-end-screen">
      {/* 烟花效果画布 */}
      <canvas 
        ref={canvasRef} 
        className="fireworks-canvas"
        aria-hidden="true"
      />

      {/* 新年祝福动画容器 */}
      <div className="blessing-animation">
        <div className="blessing-text-container">
          <h1 className="blessing-text blessing-text-main">新年快乐</h1>
          <div className="blessing-text-shadow">新年快乐</div>
        </div>
        <p className="blessing-subtitle">Happy Lunar New Year!</p>
        <div className="blessing-decorations">
          <span className="decoration-emoji">🎊</span>
          <span className="decoration-emoji">🎆</span>
          <span className="decoration-emoji">🧧</span>
          <span className="decoration-emoji">🎇</span>
          <span className="decoration-emoji">🎉</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className={`end-screen-actions ${showButtons ? 'show' : ''}`}>
        <button 
          className="end-screen-button play-again-button"
          onClick={handlePlayAgain}
          aria-label="再玩一次"
        >
          <span className="button-icon">🎆</span>
          <span className="button-text">再玩一次</span>
        </button>
        <button 
          className="end-screen-button exit-button"
          onClick={handleExit}
          aria-label="退出游戏"
        >
          <span className="button-icon">🚪</span>
          <span className="button-text">退出</span>
        </button>
      </div>
    </div>
  );
}
