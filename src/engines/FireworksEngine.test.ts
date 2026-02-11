/**
 * 烟花引擎属性测试
 * Feature: new-year-fireworks-game
 * 
 * 测试烟花引擎的音效完整性
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { FireworksEngine } from './FireworksEngine';

// Mock AudioController
class MockAudioController {
  launchSFXCalls: number = 0;
  explosionSFXCalls: number = 0;

  playLaunchSFX(): void {
    this.launchSFXCalls++;
  }

  playExplosionSFX(): void {
    this.explosionSFXCalls++;
  }

  reset(): void {
    this.launchSFXCalls = 0;
    this.explosionSFXCalls = 0;
  }
}

describe('FireworksEngine - Property-Based Tests', () => {
  let canvas: HTMLCanvasElement;
  let engine: FireworksEngine;
  let audioController: MockAudioController;

  beforeEach(() => {
    // 创建mock canvas
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    // 创建mock音频控制器
    audioController = new MockAudioController();

    // 创建引擎
    engine = new FireworksEngine(canvas, audioController);
  });

  afterEach(() => {
    if (engine) {
      engine.destroy();
    }
  });

  // Feature: new-year-fireworks-game, Property 7: 烟花音效完整性
  describe('Property 7: 烟花音效完整性', () => {
    it('对于任何烟花实例，应该在发射时触发发射音效', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 800 }),
          fc.integer({ min: 0, max: 600 }),
          (x, y) => {
            audioController.reset();

            // 发射烟花
            engine.launchFirework(x, y);

            // 验证发射音效被调用
            expect(audioController.launchSFXCalls).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任何烟花实例，应该在爆炸时触发爆炸音效', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 800 }),
          fc.integer({ min: 0, max: 600 }),
          (x, y) => {
            // 使用fake timers来控制时间
            vi.useFakeTimers();
            audioController.reset();

            // 发射烟花
            const startTime = Date.now();
            engine.launchFirework(x, y);

            // 前进时间到爆炸状态（200ms后进入爆炸状态）
            vi.advanceTimersByTime(250);

            // 手动更新引擎状态
            engine.update(250);

            // 验证爆炸音效被调用
            expect(audioController.explosionSFXCalls).toBeGreaterThanOrEqual(1);

            // 恢复真实时间
            vi.useRealTimers();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('多个烟花应该各自触发发射音效', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              x: fc.integer({ min: 0, max: 800 }),
              y: fc.integer({ min: 0, max: 600 })
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (fireworks) => {
            audioController.reset();

            // 发射多个烟花
            fireworks.forEach(fw => {
              engine.launchFirework(fw.x, fw.y);
            });

            // 验证发射音效调用次数等于烟花数量
            expect(audioController.launchSFXCalls).toBe(fireworks.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('没有音频控制器时，烟花应该正常发射（不抛出错误）', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 800 }),
          fc.integer({ min: 0, max: 600 }),
          (x, y) => {
            // 创建没有音频控制器的引擎
            const engineWithoutAudio = new FireworksEngine(canvas);

            // 应该不抛出错误
            expect(() => {
              engineWithoutAudio.launchFirework(x, y);
            }).not.toThrow();

            engineWithoutAudio.destroy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任何烟花类型，都应该触发音效', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 800 }),
          fc.integer({ min: 0, max: 600 }),
          fc.constantFrom('peony', 'meteor', 'heart', 'fortune', 'redEnvelope'),
          (x, y, typeId) => {
            audioController.reset();

            // 发射指定类型的烟花
            engine.launchFirework(x, y, typeId);

            // 验证发射音效被调用
            expect(audioController.launchSFXCalls).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // 辅助测试：验证烟花类型
  describe('烟花类型验证', () => {
    it('应该至少有5种烟花类型', () => {
      const types = engine.getAvailableTypes();
      expect(types.length).toBeGreaterThanOrEqual(5);
    });

    it('所有烟花类型都应该有有效的属性', () => {
      const types = engine.getAvailableTypes();
      
      types.forEach(type => {
        expect(type.id).toBeDefined();
        expect(type.name).toBeDefined();
        expect(type.particleCount).toBeGreaterThan(0);
        expect(type.colors.length).toBeGreaterThan(0);
        expect(type.pattern).toBeDefined();
        expect(type.duration).toBeGreaterThan(0);
      });
    });
  });

  // 辅助测试：验证烟花生成
  describe('烟花生成验证', () => {
    it('应该能够在指定位置生成烟花', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 800 }),
          fc.integer({ min: 0, max: 600 }),
          (x, y) => {
            const id = engine.launchFirework(x, y);
            expect(id).toBeDefined();
            expect(typeof id).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('应该能够清除所有烟花', () => {
      // 发射多个烟花
      engine.launchFirework(100, 100);
      engine.launchFirework(200, 200);
      engine.launchFirework(300, 300);

      // 清除
      engine.clear();

      // 验证清除成功（通过渲染不抛出错误来验证）
      expect(() => {
        engine.render();
      }).not.toThrow();
    });
  });

  // 辅助测试：验证音频控制器设置
  describe('音频控制器设置', () => {
    it('应该能够设置音频控制器', () => {
      const newAudioController = new MockAudioController();
      engine.setAudioController(newAudioController);

      // 发射烟花
      engine.launchFirework(100, 100);

      // 验证新的音频控制器被使用
      expect(newAudioController.launchSFXCalls).toBe(1);
    });
  });
});
