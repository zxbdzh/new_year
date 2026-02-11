/**
 * 单人游戏组件
 * Feature: new-year-fireworks-game
 * 需求：3.1, 3.6, 4.2
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { CountdownDisplay } from './CountdownDisplay';
import { CountdownEngine } from '../engines/CountdownEngine';
import { FireworksEngine } from '../engines/FireworksEngine';
import { ComboSystem } from '../engines/ComboSystem';
import { AudioController } from '../services/AudioController';
import { StatisticsTracker } from '../services/StatisticsTracker';
import { StorageService } from '../services/StorageService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateCombo, resetCombo } from '../store/gameSlice';
import { recordClick, recordCombo } from '../store/statisticsSlice';
import { toggleMusicMute } from '../store/audioSlice';
import type { ComboState } from '../types';
import './SinglePlayerGame.css';

interface SinglePlayerGameProps {
  /** 退出游戏回调 */
  onExit: () => void;
  /** 游戏结束回调 */
  onGameEnd?: () => void;
}

/**
 * 单人游戏组件
 * 整合倒计时、烟花引擎、连击系统和统计追踪
 */
export function SinglePlayerGame({ onExit, onGameEnd }: SinglePlayerGameProps) {
  const dispatch = useAppDispatch();
  const audioConfig = useAppSelector((state) => state.audio.config);
  
  // Canvas引用
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 引擎实例引用
  const countdownEngineRef = useRef<CountdownEngine | null>(null);
  const fireworksEngineRef = useRef<FireworksEngine | null>(null);
  const comboSystemRef = useRef<ComboSystem | null>(null);
  const audioControllerRef = useRef<AudioController | null>(null);
  const statisticsTrackerRef = useRef<StatisticsTracker | null>(null);
  
  // 游戏时间追踪
  const gameStartTimeRef = useRef<number>(Date.now());
  
  // 连击状态
  const [comboState, setComboState] = useState<ComboState>({
    count: 0,
    lastClickTime: 0,
    isActive: false,
    multiplier: 1,
  });
  
  // 设置按钮状态
  const [showSettings, setShowSettings] = useState(false);

  // 初始化所有引擎和服务
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // 创建存储服务
        const storageService = new StorageService();
        
        // 创建音频控制器
        const audioController = new AudioController(storageService);
        await audioController.initialize();
        await audioController.resumeContext();
        audioControllerRef.current = audioController;
        
        // 创建统计追踪器
        const statisticsTracker = new StatisticsTracker(storageService);
        await statisticsTracker.load();
        statisticsTrackerRef.current = statisticsTracker;
        
        // 创建倒计时引擎
        const countdownEngine = new CountdownEngine({
          targetDate: new Date(), // 将由引擎自动计算农历新年
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          manualOffset: 0,
        });
        countdownEngineRef.current = countdownEngine;
        
        // 创建烟花引擎
        if (canvasRef.current) {
          const fireworksEngine = new FireworksEngine(canvasRef.current, audioController);
          fireworksEngineRef.current = fireworksEngine;
        }
        
        // 创建连击系统
        const comboSystem = new ComboSystem({
          timeWindow: 3000, // 3秒时间窗口
          minClicks: 2, // 最少2次点击触发连击
          comboMultipliers: new Map([
            [2, 2], // 2-3次：2倍
            [4, 3], // 4-5次：3倍
            [6, 5], // 6次以上：5倍（烟花雨）
          ]),
        });
        
        // 注册连击回调
        comboSystem.onCombo((state) => {
          setComboState(state);
          dispatch(updateCombo(state));
          
          // 记录最高连击
          if (statisticsTrackerRef.current) {
            statisticsTrackerRef.current.recordCombo(state.count);
          }
          dispatch(recordCombo(state.count));
        });
        
        comboSystemRef.current = comboSystem;
        
        // 播放背景音乐
        if (!audioConfig.musicMuted) {
          audioController.playMusic();
        }
        
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    initializeGame();

    // 清理函数
    return () => {
      // 保存游戏时间
      const playTime = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      if (statisticsTrackerRef.current) {
        statisticsTrackerRef.current.recordPlayTime(playTime);
        statisticsTrackerRef.current.save().catch(console.error);
      }
      
      // 清理引擎
      if (countdownEngineRef.current) {
        countdownEngineRef.current.stop();
      }
      if (fireworksEngineRef.current) {
        fireworksEngineRef.current.destroy();
      }
      if (audioControllerRef.current) {
        audioControllerRef.current.stopMusic();
        audioControllerRef.current.destroy();
      }
      if (comboSystemRef.current) {
        comboSystemRef.current.clearCallbacks();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 处理Canvas尺寸调整
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 处理点击/触摸事件
  const handleCanvasInteraction = useCallback((x: number, y: number) => {
    if (!fireworksEngineRef.current || !comboSystemRef.current) {
      return;
    }

    const now = Date.now();
    
    // 注册点击到连击系统
    const newComboState = comboSystemRef.current.registerClick(now);
    setComboState(newComboState);
    dispatch(updateCombo(newComboState));
    
    // 记录点击到统计
    if (statisticsTrackerRef.current) {
      statisticsTrackerRef.current.recordClick();
    }
    dispatch(recordClick());
    
    // 根据连击状态发射烟花
    if (newComboState.isActive && newComboState.multiplier >= 2) {
      // 连击增强烟花
      fireworksEngineRef.current.launchComboFireworks(x, y, newComboState.multiplier);
    } else {
      // 普通烟花
      fireworksEngineRef.current.launchFirework(x, y);
    }
  }, [dispatch]);

  // 鼠标点击事件
  const handleMouseClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleCanvasInteraction(x, y);
  }, [handleCanvasInteraction]);

  // 触摸事件
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleCanvasInteraction(x, y);
  }, [handleCanvasInteraction]);

  // 倒计时归零处理
  const handleCountdownZero = useCallback(() => {
    if (onGameEnd) {
      onGameEnd();
    }
  }, [onGameEnd]);

  // 切换静音
  const handleToggleMute = useCallback(() => {
    dispatch(toggleMusicMute());
    
    if (audioControllerRef.current) {
      audioControllerRef.current.toggleMusicMute();
      
      // 如果取消静音，播放音乐
      if (audioConfig.musicMuted) {
        audioControllerRef.current.playMusic();
      } else {
        audioControllerRef.current.stopMusic();
      }
    }
  }, [dispatch, audioConfig.musicMuted]);

  // 打开设置
  const handleOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  // 关闭设置
  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  // 重新开始游戏
  const handleRestart = useCallback(() => {
    // 清除烟花
    if (fireworksEngineRef.current) {
      fireworksEngineRef.current.clear();
    }
    
    // 重置连击
    if (comboSystemRef.current) {
      comboSystemRef.current.reset();
    }
    dispatch(resetCombo());
    
    setComboState({
      count: 0,
      lastClickTime: 0,
      isActive: false,
      multiplier: 1,
    });
    
    // 重置游戏开始时间
    gameStartTimeRef.current = Date.now();
  }, [dispatch]);

  // 退出游戏
  const handleExit = useCallback(() => {
    // 保存统计数据
    const playTime = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
    if (statisticsTrackerRef.current) {
      statisticsTrackerRef.current.recordPlayTime(playTime);
      statisticsTrackerRef.current.save().catch(console.error);
    }
    
    onExit();
  }, [onExit]);

  return (
    <div className="single-player-game">
      {/* 烟花Canvas - 全屏背景 */}
      <canvas
        ref={canvasRef}
        className="fireworks-canvas"
        onClick={handleMouseClick}
        onTouchStart={handleTouchStart}
        aria-label="点击屏幕燃放烟花"
      />

      {/* 顶部控制栏 */}
      <div className="top-control-bar">
        {/* 倒计时显示 */}
        <div className="countdown-wrapper">
          {countdownEngineRef.current && (
            <CountdownDisplay
              engine={countdownEngineRef.current}
              onCountdownZero={handleCountdownZero}
            />
          )}
        </div>

        {/* 控制按钮 */}
        <div className="control-buttons">
          <button
            className="control-button mute-button"
            onClick={handleToggleMute}
            aria-label={audioConfig.musicMuted ? '取消静音' : '静音'}
            title={audioConfig.musicMuted ? '取消静音' : '静音'}
          >
            {audioConfig.musicMuted ? '🔇' : '🔊'}
          </button>
          
          <button
            className="control-button settings-button"
            onClick={handleOpenSettings}
            aria-label="设置"
            title="设置"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 连击显示 */}
      {comboState.isActive && (
        <div className="combo-display">
          <div className="combo-count">{comboState.count}x</div>
          <div className="combo-label">连击!</div>
        </div>
      )}

      {/* 底部按钮 */}
      <div className="bottom-buttons">
        <button
          className="game-button restart-button"
          onClick={handleRestart}
          aria-label="重新开始"
        >
          🔄 重新开始
        </button>
        
        <button
          className="game-button exit-button"
          onClick={handleExit}
          aria-label="退出游戏"
        >
          🚪 退出
        </button>
      </div>

      {/* 设置对话框 */}
      {showSettings && (
        <div className="settings-overlay" onClick={handleCloseSettings}>
          <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="settings-title">游戏设置</h3>
            
            <div className="settings-content">
              <p className="settings-info">
                音频和其他设置功能即将推出
              </p>
            </div>
            
            <div className="settings-actions">
              <button
                className="settings-button settings-button-close"
                onClick={handleCloseSettings}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
