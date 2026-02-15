/**
 * 设置界面组件
 * Feature: new-year-fireworks-game
 * 
 * 提供音频、主题、性能等设置选项
 * 需求：2.5, 6.3, 6.5, 6.6
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Volume2, VolumeX, X } from 'lucide-react';
import type { RootState } from '../store';
import {
  setMusicVolume,
  setSFXVolume,
  setMusicMuted,
  setSFXMuted,
} from '../store/audioSlice';
import { setTheme, setSkin } from '../store/themeSlice';
import type { AudioController } from '../services/AudioController';
import { Button } from './Button';
import './SettingsScreen.css';

interface SettingsScreenProps {
  /** 是否显示设置界面 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 保存回调 */
  onSave: (settings: SettingsData) => void;
  /** 音频控制器引用 */
  audioController?: AudioController | null;
  /** 烟花引擎引用 */
  fireworksEngine?: any | null;
}

export interface SettingsData {
  musicVolume: number;
  sfxVolume: number;
  musicMuted: boolean;
  sfxMuted: boolean;
  themeId: string;
  skinId: string;
  performanceLevel: 'low' | 'medium' | 'high';
  manualOffset: number;
}

/**
 * 设置界面组件
 */
export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isOpen,
  onClose,
  onSave,
  audioController,
  fireworksEngine,
}) => {
  const dispatch = useDispatch();
  
  // 从Redux获取当前配置
  const audioConfig = useSelector((state: RootState) => state.audio.config);
  const currentTheme = useSelector((state: RootState) => state.theme.currentTheme);
  const currentSkin = useSelector((state: RootState) => state.theme.currentSkin);
  const availableThemes = useSelector((state: RootState) => state.theme.availableThemes);
  const availableSkins = useSelector((state: RootState) => state.theme.availableSkins);

  // 本地状态（用于实时预览）
  const [localMusicVolume, setLocalMusicVolume] = useState(audioConfig.musicVolume);
  const [localSFXVolume, setLocalSFXVolume] = useState(audioConfig.sfxVolume);
  const [localMusicMuted, setLocalMusicMuted] = useState(audioConfig.musicMuted);
  const [localSFXMuted, setLocalSFXMuted] = useState(audioConfig.sfxMuted);
  const [localThemeId, setLocalThemeId] = useState(currentTheme.id);
  const [localSkinId, setLocalSkinId] = useState(currentSkin.id);
  const [localPerformanceLevel, setLocalPerformanceLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [localManualOffset, setLocalManualOffset] = useState(0);
  const [offsetError, setOffsetError] = useState('');

  // 当设置界面打开时，同步当前配置到本地状态
  useEffect(() => {
    if (isOpen) {
      setLocalMusicVolume(audioConfig.musicVolume);
      setLocalSFXVolume(audioConfig.sfxVolume);
      setLocalMusicMuted(audioConfig.musicMuted);
      setLocalSFXMuted(audioConfig.sfxMuted);
      setLocalThemeId(currentTheme.id);
      setLocalSkinId(currentSkin.id);
    }
  }, [isOpen, audioConfig, currentTheme, currentSkin]);

  // 处理音乐音量变化（实时预览）
  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setLocalMusicVolume(volume);
    dispatch(setMusicVolume(volume));
  };

  // 处理音效音量变化（实时预览）
  const handleSFXVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setLocalSFXVolume(volume);
    dispatch(setSFXVolume(volume));
  };

  // 处理音乐静音切换
  const handleMusicMuteToggle = () => {
    const newMuted = !localMusicMuted;
    setLocalMusicMuted(newMuted);
    dispatch(setMusicMuted(newMuted));
    
    // 同步到 AudioController
    if (audioController) {
      audioController.setMusicMuted(newMuted);
      
      // 如果取消静音，播放音乐
      if (!newMuted) {
        audioController.playMusic();
      }
    }
  };

  // 处理音效静音切换
  const handleSFXMuteToggle = () => {
    const newMuted = !localSFXMuted;
    setLocalSFXMuted(newMuted);
    dispatch(setSFXMuted(newMuted));
    
    // 同步到 AudioController
    if (audioController) {
      audioController.setSFXMuted(newMuted);
    }
  };

  // 处理主题选择
  const handleThemeChange = (themeId: string) => {
    setLocalThemeId(themeId);
    dispatch(setTheme(themeId));
  };

  // 处理皮肤选择
  const handleSkinChange = (skinId: string) => {
    setLocalSkinId(skinId);
    dispatch(setSkin(skinId));
  };

  // 处理性能配置选择
  const handlePerformanceChange = (level: 'low' | 'medium' | 'high') => {
    setLocalPerformanceLevel(level);
  };

  // 处理手动时间校准
  const handleManualOffsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const offset = parseInt(value, 10);
    
    // 验证范围：-3600 到 +3600 秒（±1小时）
    if (!isNaN(offset)) {
      if (offset >= -3600 && offset <= 3600) {
        setLocalManualOffset(offset);
        setOffsetError('');
      } else {
        setLocalManualOffset(offset);
        setOffsetError('偏移值必须在 -3600 到 +3600 秒之间');
      }
    } else if (value === '' || value === '-') {
      // 允许空值或负号（输入中）
      setLocalManualOffset(0);
      setOffsetError('');
    } else {
      setOffsetError('请输入有效的数字');
    }
  };

  // 保存设置
  const handleSave = () => {
    // 如果有验证错误，不保存
    if (offsetError) {
      return;
    }
    
    const settings: SettingsData = {
      musicVolume: localMusicVolume,
      sfxVolume: localSFXVolume,
      musicMuted: localMusicMuted,
      sfxMuted: localSFXMuted,
      themeId: localThemeId,
      skinId: localSkinId,
      performanceLevel: localPerformanceLevel,
      manualOffset: localManualOffset,
    };
    
    // 应用性能配置到烟花引擎
    if (fireworksEngine) {
      fireworksEngine.updatePerformanceProfile({
        level: localPerformanceLevel,
      });
    }
    
    onSave(settings);
    onClose();
  };

  // 取消设置（恢复原始值）
  const handleCancel = () => {
    // 恢复Redux状态到原始值
    dispatch(setMusicVolume(audioConfig.musicVolume));
    dispatch(setSFXVolume(audioConfig.sfxVolume));
    dispatch(setMusicMuted(audioConfig.musicMuted));
    dispatch(setSFXMuted(audioConfig.sfxMuted));
    dispatch(setTheme(currentTheme.id));
    dispatch(setSkin(currentSkin.id));
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>游戏设置</h2>
          <button className="close-button" onClick={onClose} aria-label="关闭">
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          {/* 音频设置 */}
          <section className="settings-section">
            <h3>音频设置</h3>
            
            {/* 音乐音量 */}
            <div className="setting-item">
              <label htmlFor="music-volume">
                音乐音量
                <span className="volume-value">{Math.round(localMusicVolume * 100)}%</span>
              </label>
              <div className="volume-control">
                <input
                  id="music-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={localMusicVolume}
                  onChange={handleMusicVolumeChange}
                  disabled={localMusicMuted}
                />
                <button
                  className={`mute-button ${localMusicMuted ? 'muted' : ''}`}
                  onClick={handleMusicMuteToggle}
                  aria-label={localMusicMuted ? '取消静音' : '静音'}
                >
                  {localMusicMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
            </div>

            {/* 音效音量 */}
            <div className="setting-item">
              <label htmlFor="sfx-volume">
                音效音量
                <span className="volume-value">{Math.round(localSFXVolume * 100)}%</span>
              </label>
              <div className="volume-control">
                <input
                  id="sfx-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={localSFXVolume}
                  onChange={handleSFXVolumeChange}
                  disabled={localSFXMuted}
                />
                <button
                  className={`mute-button ${localSFXMuted ? 'muted' : ''}`}
                  onClick={handleSFXMuteToggle}
                  aria-label={localSFXMuted ? '取消静音' : '静音'}
                >
                  {localSFXMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
            </div>
          </section>

          {/* 主题设置 */}
          <section className="settings-section">
            <h3>主题设置</h3>
            
            {/* 背景主题 */}
            <div className="setting-item">
              <label>背景主题</label>
              <div className="theme-selector">
                {availableThemes.map((theme) => (
                  <Button
                    key={theme.id}
                    variant="ghost"
                    size="sm"
                    className={`theme-option ${localThemeId === theme.id ? 'selected' : ''}`}
                    onClick={() => handleThemeChange(theme.id)}
                  >
                    <div
                      className="theme-preview"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span>{theme.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 倒计时皮肤 */}
            <div className="setting-item">
              <label>倒计时皮肤</label>
              <div className="skin-selector">
                {availableSkins.map((skin) => (
                  <Button
                    key={skin.id}
                    variant="ghost"
                    size="sm"
                    className={`skin-option ${localSkinId === skin.id ? 'selected' : ''}`}
                    onClick={() => handleSkinChange(skin.id)}
                  >
                    {skin.name}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          {/* 性能设置 */}
          <section className="settings-section">
            <h3>性能设置</h3>
            
            <div className="setting-item">
              <label>画质配置</label>
              <div className="performance-selector">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`performance-option ${localPerformanceLevel === 'low' ? 'selected' : ''}`}
                  onClick={() => handlePerformanceChange('low')}
                >
                  低
                  <span className="performance-desc">流畅优先</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`performance-option ${localPerformanceLevel === 'medium' ? 'selected' : ''}`}
                  onClick={() => handlePerformanceChange('medium')}
                >
                  中
                  <span className="performance-desc">平衡模式</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`performance-option ${localPerformanceLevel === 'high' ? 'selected' : ''}`}
                  onClick={() => handlePerformanceChange('high')}
                >
                  高
                  <span className="performance-desc">画质优先</span>
                </Button>
              </div>
            </div>
          </section>

          {/* 倒计时校准 */}
          <section className="settings-section">
            <h3>倒计时校准</h3>
            
            <div className="setting-item">
              <label htmlFor="manual-offset">
                手动时间偏移（秒）
                <span className="offset-hint">正数提前，负数延后</span>
              </label>
              <input
                id="manual-offset"
                type="number"
                min="-3600"
                max="3600"
                step="1"
                value={localManualOffset}
                onChange={handleManualOffsetChange}
                placeholder="0"
                className={`offset-input ${offsetError ? 'input-error' : ''}`}
                aria-invalid={!!offsetError}
                aria-describedby={offsetError ? 'offset-error' : undefined}
              />
              {offsetError && (
                <span id="offset-error" className="error-message" role="alert">
                  {offsetError}
                </span>
              )}
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <Button variant="secondary" onClick={handleCancel}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
};
