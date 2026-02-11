/**
 * 音频控制器
 * Feature: new-year-fireworks-game
 * 
 * 管理背景音乐和音效
 * 需求：1.4, 3.3, 3.4, 6.2, 6.3, 6.4
 */

import type { AudioConfig, AudioAsset } from '../types';
import { StorageService } from './StorageService';

/**
 * 音频控制器类
 */
export class AudioController {
  private audioContext: AudioContext | null = null;
  private assets: Map<string, AudioAsset> = new Map();
  private config: AudioConfig;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private storageService: StorageService;
  private currentMusicId: string | null = null;
  private isInitialized: boolean = false;

  /**
   * 构造函数
   * 
   * @param storageService - 存储服务实例
   */
  constructor(storageService: StorageService) {
    this.storageService = storageService;
    
    // 默认配置
    this.config = {
      musicVolume: 0.7,
      sfxVolume: 0.8,
      musicMuted: false,
      sfxMuted: false
    };
  }

  /**
   * 初始化音频系统
   * 需求：1.4
   * 
   * @returns Promise
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 创建AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // 创建增益节点
      this.musicGainNode = this.audioContext.createGain();
      this.sfxGainNode = this.audioContext.createGain();

      // 连接到输出
      this.musicGainNode.connect(this.audioContext.destination);
      this.sfxGainNode.connect(this.audioContext.destination);

      // 加载保存的配置
      await this.loadConfig();

      // 应用配置
      this.applyConfig();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
      throw error;
    }
  }

  /**
   * 加载音频配置
   */
  private async loadConfig(): Promise<void> {
    try {
      const savedConfig = await this.storageService.load<AudioConfig>('audioConfig');
      if (savedConfig) {
        this.config = { ...this.config, ...savedConfig };
      }
    } catch (error) {
      console.warn('Failed to load audio config, using defaults:', error);
    }
  }

  /**
   * 应用配置到增益节点
   */
  private applyConfig(): void {
    if (!this.musicGainNode || !this.sfxGainNode) {
      return;
    }

    // 应用音乐音量
    this.musicGainNode.gain.value = this.config.musicMuted ? 0 : this.config.musicVolume;

    // 应用音效音量
    this.sfxGainNode.gain.value = this.config.sfxMuted ? 0 : this.config.sfxVolume;
  }

  /**
   * 加载音频资源
   * 
   * @param asset - 音频资源
   * @returns Promise
   */
  async loadAsset(asset: AudioAsset): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      // 如果已加载，跳过
      if (this.assets.has(asset.id) && this.assets.get(asset.id)?.buffer) {
        return;
      }

      // 获取音频数据
      const response = await fetch(asset.url);
      const arrayBuffer = await response.arrayBuffer();

      // 解码音频数据
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // 保存到资源映射
      this.assets.set(asset.id, {
        ...asset,
        buffer: audioBuffer
      });
    } catch (error) {
      console.error(`Failed to load audio asset ${asset.id}:`, error);
      throw error;
    }
  }

  /**
   * 播放背景音乐（循环）
   * 需求：6.2
   * 
   * @param assetId - 音频资源ID
   */
  playMusic(assetId: string): void {
    if (!this.audioContext || !this.musicGainNode) {
      console.warn('AudioContext not initialized');
      return;
    }

    // 停止当前音乐
    this.stopMusic();

    // 获取音频资源
    const asset = this.assets.get(assetId);
    if (!asset || !asset.buffer) {
      console.warn(`Audio asset ${assetId} not found or not loaded`);
      return;
    }

    try {
      // 创建音频源
      this.musicSource = this.audioContext.createBufferSource();
      this.musicSource.buffer = asset.buffer;
      this.musicSource.loop = true; // 循环播放

      // 连接到增益节点
      this.musicSource.connect(this.musicGainNode);

      // 播放
      this.musicSource.start(0);
      this.currentMusicId = assetId;
    } catch (error) {
      console.error('Failed to play music:', error);
    }
  }

  /**
   * 停止背景音乐
   */
  stopMusic(): void {
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch (error) {
        // 忽略已停止的错误
      }
      this.musicSource.disconnect();
      this.musicSource = null;
      this.currentMusicId = null;
    }
  }

  /**
   * 播放音效
   * 需求：3.3, 3.4
   * 
   * @param assetId - 音频资源ID
   */
  playSFX(assetId: string): void {
    if (!this.audioContext || !this.sfxGainNode) {
      console.warn('AudioContext not initialized');
      return;
    }

    // 获取音频资源
    const asset = this.assets.get(assetId);
    if (!asset || !asset.buffer) {
      console.warn(`Audio asset ${assetId} not found or not loaded`);
      return;
    }

    try {
      // 创建音频源（每次播放创建新的源）
      const source = this.audioContext.createBufferSource();
      source.buffer = asset.buffer;

      // 连接到增益节点
      source.connect(this.sfxGainNode);

      // 播放
      source.start(0);

      // 播放完成后自动清理
      source.onended = () => {
        source.disconnect();
      };
    } catch (error) {
      console.error('Failed to play SFX:', error);
    }
  }

  /**
   * 设置音乐音量
   * 需求：6.3
   * 
   * @param volume - 音量（0-1）
   */
  setMusicVolume(volume: number): void {
    // 限制范围
    this.config.musicVolume = Math.max(0, Math.min(1, volume));

    // 应用到增益节点
    if (this.musicGainNode && !this.config.musicMuted) {
      this.musicGainNode.gain.value = this.config.musicVolume;
    }
  }

  /**
   * 设置音效音量
   * 需求：6.3
   * 
   * @param volume - 音量（0-1）
   */
  setSFXVolume(volume: number): void {
    // 限制范围
    this.config.sfxVolume = Math.max(0, Math.min(1, volume));

    // 应用到增益节点
    if (this.sfxGainNode && !this.config.sfxMuted) {
      this.sfxGainNode.gain.value = this.config.sfxVolume;
    }
  }

  /**
   * 切换音乐静音
   * 需求：1.5
   */
  toggleMusicMute(): void {
    this.config.musicMuted = !this.config.musicMuted;

    // 应用到增益节点
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.config.musicMuted ? 0 : this.config.musicVolume;
    }
  }

  /**
   * 切换音效静音
   */
  toggleSFXMute(): void {
    this.config.sfxMuted = !this.config.sfxMuted;

    // 应用到增益节点
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this.config.sfxMuted ? 0 : this.config.sfxVolume;
    }
  }

  /**
   * 获取当前配置
   * 
   * @returns 音频配置
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * 保存配置
   * 需求：6.4
   * 
   * @returns Promise
   */
  async saveConfig(): Promise<void> {
    try {
      await this.storageService.save('audioConfig', this.config);
    } catch (error) {
      console.error('Failed to save audio config:', error);
      throw error;
    }
  }

  /**
   * 恢复AudioContext（处理浏览器自动播放限制）
   * 需求：1.4
   */
  async resumeContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    }
  }

  /**
   * 销毁音频控制器
   */
  destroy(): void {
    this.stopMusic();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.assets.clear();
    this.isInitialized = false;
  }
}
