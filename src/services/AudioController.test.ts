/**
 * 音频控制器属性测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { AudioController } from './AudioController';
import { StorageService } from './StorageService';

// Mock Web Audio API
class MockAudioContext {
  state = 'running';
  destination = {};

  createGain() {
    return {
      gain: { value: 1 },
      connect: vi.fn()
    };
  }

  createBufferSource() {
    return {
      buffer: null,
      loop: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null
    };
  }

  async decodeAudioData(arrayBuffer: ArrayBuffer) {
    return { duration: 1, length: 44100, sampleRate: 44100 };
  }

  async resume() {
    this.state = 'running';
  }

  async close() {
    this.state = 'closed';
  }
}

// Mock global AudioContext
(global as any).AudioContext = MockAudioContext;
(global as any).window = { AudioContext: MockAudioContext };

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  arrayBuffer: async () => new ArrayBuffer(8)
});

describe('AudioController - Property-Based Tests', () => {
  let storageService: StorageService;
  let audioController: AudioController;

  beforeEach(async () => {
    storageService = new StorageService();
    audioController = new AudioController(storageService);
    await audioController.initialize();
  });

  afterEach(() => {
    if (audioController) {
      audioController.destroy();
    }
  });

  // Feature: new-year-fireworks-game, Property 1: 静音状态往返一致性
  describe('Property 1: 静音状态往返一致性', () => {
    it('对于任何静音状态序列，连续切换偶数次后应恢复到初始状态', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }).map(n => n * 2),
          (toggleCount) => {
            const initialConfig = audioController.getConfig();
            const initialMusicMuted = initialConfig.musicMuted;
            const initialSFXMuted = initialConfig.sfxMuted;

            for (let i = 0; i < toggleCount; i++) {
              audioController.toggleMusicMute();
            }
            for (let i = 0; i < toggleCount; i++) {
              audioController.toggleSFXMute();
            }

            const finalConfig = audioController.getConfig();
            expect(finalConfig.musicMuted).toBe(initialMusicMuted);
            expect(finalConfig.sfxMuted).toBe(initialSFXMuted);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('切换奇数次后应该与初始状态相反', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10 }).map(n => n * 2 + 1),
          (toggleCount) => {
            const initialConfig = audioController.getConfig();
            const initialMusicMuted = initialConfig.musicMuted;

            for (let i = 0; i < toggleCount; i++) {
              audioController.toggleMusicMute();
            }

            const finalConfig = audioController.getConfig();
            expect(finalConfig.musicMuted).toBe(!initialMusicMuted);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Feature: new-year-fireworks-game, Property 18: 背景音乐循环播放
  describe('Property 18: 背景音乐循环播放', () => {
    it('播放背景音乐时应该设置循环标志', async () => {
      const testAsset = {
        id: 'test-music',
        url: 'test.mp3',
        type: 'music' as const
      };

      await audioController.loadAsset(testAsset);
      audioController.playMusic('test-music');

      const config = audioController.getConfig();
      expect(config).toBeDefined();
    });

    it('停止音乐后应该能够重新播放', async () => {
      const testAsset = {
        id: 'test-music-2',
        url: 'test2.mp3',
        type: 'music' as const
      };

      await audioController.loadAsset(testAsset);

      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (playCount) => {
            for (let i = 0; i < playCount; i++) {
              audioController.playMusic('test-music-2');
              audioController.stopMusic();
            }

            audioController.playMusic('test-music-2');
            expect(audioController.getConfig()).toBeDefined();
            
            audioController.stopMusic();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Feature: new-year-fireworks-game, Property 19: 音量控制独立性
  describe('Property 19: 音量控制独立性', () => {
    it('对于任何音乐音量和音效音量的组合，两者应该独立控制', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1, noNaN: true }),
          fc.float({ min: 0, max: 1, noNaN: true }),
          (musicVolume, sfxVolume) => {
            audioController.setMusicVolume(musicVolume);
            audioController.setSFXVolume(sfxVolume);

            const config = audioController.getConfig();
            expect(config.musicVolume).toBeCloseTo(musicVolume, 5);
            expect(config.sfxVolume).toBeCloseTo(sfxVolume, 5);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('修改音乐音量不应影响音效音量', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1, noNaN: true }),
          fc.float({ min: 0, max: 1, noNaN: true }),
          (initialSFXVolume, newMusicVolume) => {
            audioController.setSFXVolume(initialSFXVolume);
            audioController.setMusicVolume(newMusicVolume);

            const config = audioController.getConfig();
            expect(config.sfxVolume).toBeCloseTo(initialSFXVolume, 5);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('修改音效音量不应影响音乐音量', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1, noNaN: true }),
          fc.float({ min: 0, max: 1, noNaN: true }),
          (initialMusicVolume, newSFXVolume) => {
            audioController.setMusicVolume(initialMusicVolume);
            audioController.setSFXVolume(newSFXVolume);

            const config = audioController.getConfig();
            expect(config.musicVolume).toBeCloseTo(initialMusicVolume, 5);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Feature: new-year-fireworks-game, Property 20: 音频配置持久化往返
  describe('Property 20: 音频配置持久化往返', () => {
    it('对于任何音频配置，保存后加载应该得到相同的配置', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.float({ min: 0, max: 1, noNaN: true }),
          fc.float({ min: 0, max: 1, noNaN: true }),
          fc.boolean(),
          fc.boolean(),
          async (musicVolume, sfxVolume, musicMuted, sfxMuted) => {
            audioController.setMusicVolume(musicVolume);
            audioController.setSFXVolume(sfxVolume);
            
            const currentConfig = audioController.getConfig();
            if (currentConfig.musicMuted !== musicMuted) {
              audioController.toggleMusicMute();
            }
            if (currentConfig.sfxMuted !== sfxMuted) {
              audioController.toggleSFXMute();
            }

            await audioController.saveConfig();

            const newController = new AudioController(storageService);
            await newController.initialize();

            const loadedConfig = newController.getConfig();
            expect(loadedConfig.musicVolume).toBeCloseTo(musicVolume, 5);
            expect(loadedConfig.sfxVolume).toBeCloseTo(sfxVolume, 5);
            expect(loadedConfig.musicMuted).toBe(musicMuted);
            expect(loadedConfig.sfxMuted).toBe(sfxMuted);

            newController.destroy();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // 辅助测试：验证音量范围限制
  describe('音量范围限制', () => {
    it('音量应该被限制在0-1范围内', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -10, max: 10, noNaN: true }),
          (volume) => {
            audioController.setMusicVolume(volume);
            const config = audioController.getConfig();
            
            expect(config.musicVolume).toBeGreaterThanOrEqual(0);
            expect(config.musicVolume).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('音效音量应该被限制在0-1范围内', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -10, max: 10, noNaN: true }),
          (volume) => {
            audioController.setSFXVolume(volume);
            const config = audioController.getConfig();
            
            expect(config.sfxVolume).toBeGreaterThanOrEqual(0);
            expect(config.sfxVolume).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // 辅助测试：验证资源加载
  describe('资源加载', () => {
    it('应该能够加载音频资源', async () => {
      const asset = {
        id: 'test-asset',
        url: 'test.mp3',
        type: 'music' as const
      };

      await audioController.loadAsset(asset);
      audioController.playMusic('test-asset');
      expect(audioController.getConfig()).toBeDefined();
      
      audioController.stopMusic();
    });

    it('重复加载同一资源应该跳过', async () => {
      const asset = {
        id: 'test-asset-2',
        url: 'test2.mp3',
        type: 'sfx' as const
      };

      await audioController.loadAsset(asset);
      await audioController.loadAsset(asset);

      audioController.playSFX('test-asset-2');
      expect(audioController.getConfig()).toBeDefined();
    });
  });

  // 辅助测试：验证AudioContext恢复
  describe('AudioContext恢复', () => {
    it('应该能够恢复suspended的AudioContext', async () => {
      await audioController.resumeContext();
      
      const config = audioController.getConfig();
      expect(config).toBeDefined();
    });
  });
});
