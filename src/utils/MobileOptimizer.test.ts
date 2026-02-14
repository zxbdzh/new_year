/**
 * MobileOptimizer 单元测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MobileOptimizer } from './MobileOptimizer';
import type { PerformanceProfile } from '../types/PerformanceTypes';

describe('MobileOptimizer', () => {
  let optimizer: MobileOptimizer;

  beforeEach(() => {
    optimizer = new MobileOptimizer();
  });

  describe('设备检测', () => {
    it('should detect device type', () => {
      expect(typeof optimizer.isMobileDevice()).toBe('boolean');
      expect(typeof optimizer.isTabletDevice()).toBe('boolean');
    });

    it('should support touch events detection', () => {
      expect(typeof optimizer.supportsTouchEvents()).toBe('boolean');
    });

    it('should get device pixel ratio', () => {
      const dpr = optimizer.getDevicePixelRatio();
      expect(dpr).toBeGreaterThan(0);
    });

    it('should detect high DPI screens', () => {
      expect(typeof optimizer.isHighDPI()).toBe('boolean');
    });
  });

  describe('性能配置优化', () => {
    it('should optimize performance profile for mobile', () => {
      const baseProfile: PerformanceProfile = {
        level: 'high',
        maxParticles: 200,
        maxFireworks: 10,
        useWebGL: true,
        particleSize: 4,
        enableGlow: true,
        enableTrails: true,
      };

      const optimized = optimizer.getOptimizedProfile(baseProfile);

      // 移动设备应该降低配置
      if (optimizer.isMobileDevice()) {
        expect(optimized.level).toBe('low');
        expect(optimized.maxParticles).toBeLessThanOrEqual(baseProfile.maxParticles);
        expect(optimized.maxFireworks).toBeLessThanOrEqual(baseProfile.maxFireworks);
        expect(optimized.useWebGL).toBe(false);
      }
    });

    it('should not modify profile for desktop', () => {
      // 模拟桌面设备
      const desktopOptimizer = new MobileOptimizer();
      
      const baseProfile: PerformanceProfile = {
        level: 'high',
        maxParticles: 200,
        maxFireworks: 10,
        useWebGL: true,
        particleSize: 4,
        enableGlow: true,
        enableTrails: true,
      };

      const optimized = desktopOptimizer.getOptimizedProfile(baseProfile);

      if (!desktopOptimizer.isMobileDevice()) {
        expect(optimized).toEqual(baseProfile);
      }
    });
  });

  describe('Canvas优化', () => {
    it('should optimize canvas size for mobile', () => {
      const canvas = document.createElement('canvas');
      canvas.style.width = '800px';
      canvas.style.height = '600px';
      Object.defineProperty(canvas, 'clientWidth', { value: 800 });
      Object.defineProperty(canvas, 'clientHeight', { value: 600 });

      optimizer.optimizeCanvasSize(canvas);

      if (optimizer.isMobileDevice()) {
        // 移动设备应该使用缩放分辨率
        expect(canvas.width).toBeLessThan(800);
        expect(canvas.height).toBeLessThan(600);
      } else {
        // 桌面设备使用全分辨率
        expect(canvas.width).toBe(800);
        expect(canvas.height).toBe(600);
      }
    });

    it('should get recommended canvas scale', () => {
      const scale = optimizer.getRecommendedCanvasScale();
      expect(scale).toBeGreaterThan(0);
      expect(scale).toBeLessThanOrEqual(1);
    });
  });

  describe('配置管理', () => {
    it('should get default config', () => {
      const config = optimizer.getConfig();
      
      expect(config).toHaveProperty('disableGlow');
      expect(config).toHaveProperty('disableTrails');
      expect(config).toHaveProperty('canvasScale');
      expect(config).toHaveProperty('useSimplifiedUI');
      expect(config).toHaveProperty('maxParticles');
      expect(config).toHaveProperty('maxFireworks');
    });

    it('should update config', () => {
      const newConfig = {
        maxParticles: 50,
        maxFireworks: 3,
      };

      optimizer.updateConfig(newConfig);
      const config = optimizer.getConfig();

      expect(config.maxParticles).toBe(50);
      expect(config.maxFireworks).toBe(3);
    });

    it('should check if simplified UI should be used', () => {
      expect(typeof optimizer.shouldUseSimplifiedUI()).toBe('boolean');
    });
  });

  describe('触摸目标尺寸', () => {
    it('should get minimum touch target size', () => {
      const minSize = optimizer.getMinTouchTargetSize();
      
      if (optimizer.isMobileDevice()) {
        expect(minSize).toBeGreaterThanOrEqual(44); // WCAG标准
      } else {
        expect(minSize).toBeGreaterThanOrEqual(32);
      }
    });
  });

  describe('移动端浏览器默认行为', () => {
    it('should disable mobile browser defaults', () => {
      const element = document.createElement('div');
      
      optimizer.disableMobileBrowserDefaults(element);

      if (optimizer.isMobileDevice()) {
        expect(element.style.touchAction).toBe('none');
        expect(element.style.webkitUserSelect).toBe('none');
        expect(element.style.userSelect).toBe('none');
      }
    });
  });

  describe('CSS类名', () => {
    it('should get mobile CSS class', () => {
      const cssClass = optimizer.getMobileCSSClass();
      
      expect(['device-mobile', 'device-tablet', 'device-desktop']).toContain(cssClass);
    });
  });

  describe('屏幕方向', () => {
    it('should detect landscape mode', () => {
      expect(typeof optimizer.isLandscape()).toBe('boolean');
    });

    it('should detect portrait mode', () => {
      expect(typeof optimizer.isPortrait()).toBe('boolean');
    });

    it('should have opposite landscape and portrait values', () => {
      const isLandscape = optimizer.isLandscape();
      const isPortrait = optimizer.isPortrait();
      
      // 横屏和竖屏应该是相反的（除非是正方形屏幕）
      if (window.innerWidth !== window.innerHeight) {
        expect(isLandscape).not.toBe(isPortrait);
      }
    });
  });

  describe('安全区域', () => {
    it('should get safe area insets', () => {
      const insets = optimizer.getSafeAreaInsets();
      
      expect(insets).toHaveProperty('top');
      expect(insets).toHaveProperty('right');
      expect(insets).toHaveProperty('bottom');
      expect(insets).toHaveProperty('left');
      
      expect(typeof insets.top).toBe('number');
      expect(typeof insets.right).toBe('number');
      expect(typeof insets.bottom).toBe('number');
      expect(typeof insets.left).toBe('number');
    });
  });
});
