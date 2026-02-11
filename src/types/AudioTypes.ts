/**
 * 音频类型定义
 * Feature: new-year-fireworks-game
 * 
 * 使用Web Audio API动态生成音效，无需外部音频文件
 */

/**
 * 音频配置
 */
export interface AudioConfig {
  /** 音乐音量 (0-1) */
  musicVolume: number;
  /** 音效音量 (0-1) */
  sfxVolume: number;
  /** 音乐是否静音 */
  musicMuted: boolean;
  /** 音效是否静音 */
  sfxMuted: boolean;
}

/**
 * 音效类型
 * - launch: 烟花发射音效
 * - explosion: 烟花爆炸音效
 * - click: 点击音效
 * - success: 成功音效
 */
export type SFXType = 'launch' | 'explosion' | 'click' | 'success';
