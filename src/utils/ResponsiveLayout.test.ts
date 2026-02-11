/**
 * 响应式布局工具单元测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ResponsiveLayout } from './ResponsiveLayout';

describe('ResponsiveLayout', () => {
  let layout: ResponsiveLayout;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    layout = new ResponsiveLayout();

    // 创建模拟Canvas
    mockCanvas = document.createElement('canvas');
    mockCanvas.getContext = vi.fn(() => ({
      scale: vi.fn(),
    })) as any;
  });

  afterEach(() => {
    layout.destroy();
  });

  describe('getCurrentScreenSize', () => {
    it('should return current screen size', () => {
      const size = layout.getCurrentScreenSize();

      expect(size.width).toBeGreaterThan(0);
      expect(size.height).toBeGreaterThan(0);
      expect(size.aspectRatio).toBeGreaterThan(0);
      expect(size.devicePixelRatio).toBeGreaterThan(0);
    });

    it('should calculate aspect ratio correctly', () => {
      const size = layout.getCurrentScreenSize();
      const expectedRatio = size.width / size.height;

      expect(size.aspectRatio).toBeCloseTo(expectedRatio, 2);
    });
  });

  describe('Canvas scaling', () => {
    it('should set canvas and update size', () => {
      layout.setCanvas(mockCanvas);

      expect(mockCanvas.style.width).toBeTruthy();
      expect(mockCanvas.style.height).toBeTruthy();
      expect(mockCanvas.width).toBeGreaterThan(0);
      expect(mockCanvas.height).toBeGreaterThan(0);
    });

    it('should calculate canvas scale for wide screen', () => {
      const size = {
        width: 1920,
        height: 1080,
        aspectRatio: 1920 / 1080,
        devicePixelRatio: 1,
      };

      const scale = layout.calculateCanvasScale(size);

      expect(scale.width).toBeGreaterThan(0);
      expect(scale.height).toBeGreaterThan(0);
      expect(scale.scaleX).toBeGreaterThan(0);
      expect(scale.scaleY).toBeGreaterThan(0);
    });

    it('should calculate canvas scale for narrow screen', () => {
      const size = {
        width: 768,
        height: 1024,
        aspectRatio: 768 / 1024,
        devicePixelRatio: 1,
      };

      const scale = layout.calculateCanvasScale(size);

      expect(scale.width).toBeGreaterThan(0);
      expect(scale.height).toBeGreaterThan(0);
      expect(scale.offsetY).toBeGreaterThanOrEqual(0);
    });

    it('should handle device pixel ratio', () => {
      const size = {
        width: 1920,
        height: 1080,
        aspectRatio: 1920 / 1080,
        devicePixelRatio: 2,
      };

      layout.setCanvas(mockCanvas);
      const scale = layout.calculateCanvasScale(size);

      // Canvas实际分辨率应该考虑设备像素比
      expect(mockCanvas.width).toBeGreaterThan(0);
      expect(mockCanvas.height).toBeGreaterThan(0);
    });
  });

  describe('Coordinate conversion', () => {
    beforeEach(() => {
      layout.setCanvas(mockCanvas);
      
      // 模拟getBoundingClientRect
      mockCanvas.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));
    });

    it('should convert screen coordinates to canvas coordinates', () => {
      const result = layout.screenToCanvasCoordinates(100, 100);

      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it('should handle coordinates at origin', () => {
      const result = layout.screenToCanvasCoordinates(0, 0);

      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it('should check if coordinates are in visible area', () => {
      mockCanvas.width = 800;
      mockCanvas.height = 600;

      expect(layout.isInVisibleArea(400, 300)).toBe(true);
      expect(layout.isInVisibleArea(0, 0)).toBe(true);
      expect(layout.isInVisibleArea(800, 600)).toBe(true);
      expect(layout.isInVisibleArea(-10, 300)).toBe(false);
      expect(layout.isInVisibleArea(900, 300)).toBe(false);
    });
  });

  describe('Resize callbacks', () => {
    it('should register resize callback', () => {
      const callback = vi.fn();
      const unregister = layout.onResize(callback);

      expect(typeof unregister).toBe('function');
    });

    it('should unregister resize callback', () => {
      const callback = vi.fn();
      const unregister = layout.onResize(callback);

      unregister();

      // Callback should not be called after unregister
      // (We can't easily test this without triggering a resize event)
    });
  });

  describe('Device detection', () => {
    it('should detect mobile device', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const newLayout = new ResponsiveLayout();
      expect(newLayout.isMobile()).toBe(true);
      expect(newLayout.isTablet()).toBe(false);
      expect(newLayout.isDesktop()).toBe(false);
      newLayout.destroy();
    });

    it('should detect tablet device', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });

      const newLayout = new ResponsiveLayout();
      expect(newLayout.isMobile()).toBe(false);
      expect(newLayout.isTablet()).toBe(true);
      expect(newLayout.isDesktop()).toBe(false);
      newLayout.destroy();
    });

    it('should detect desktop device', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const newLayout = new ResponsiveLayout();
      expect(newLayout.isMobile()).toBe(false);
      expect(newLayout.isTablet()).toBe(false);
      expect(newLayout.isDesktop()).toBe(true);
      newLayout.destroy();
    });
  });

  describe('Responsive sizing', () => {
    it('should calculate responsive font size', () => {
      const baseFontSize = 16;
      const fontSize = layout.getResponsiveFontSize(baseFontSize);

      expect(fontSize).toBeGreaterThan(0);
      expect(fontSize).toBeLessThanOrEqual(baseFontSize);
    });

    it('should not scale font size below minimum', () => {
      const baseFontSize = 16;
      const fontSize = layout.getResponsiveFontSize(baseFontSize);

      // Should not be less than 50% of base size
      expect(fontSize).toBeGreaterThanOrEqual(baseFontSize * 0.5);
    });

    it('should calculate responsive spacing', () => {
      const baseSpacing = 20;
      const spacing = layout.getResponsiveSpacing(baseSpacing);

      expect(spacing).toBeGreaterThan(0);
      expect(spacing).toBeLessThanOrEqual(baseSpacing);
    });

    it('should not scale spacing below minimum', () => {
      const baseSpacing = 20;
      const spacing = layout.getResponsiveSpacing(baseSpacing);

      // Should not be less than 50% of base spacing
      expect(spacing).toBeGreaterThanOrEqual(baseSpacing * 0.5);
    });
  });

  describe('getScreenSize', () => {
    it('should return a copy of current size', () => {
      const size1 = layout.getScreenSize();
      size1.width = 9999;

      const size2 = layout.getScreenSize();
      expect(size2.width).not.toBe(9999);
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      layout.setCanvas(mockCanvas);
      const callback = vi.fn();
      layout.onResize(callback);

      layout.destroy();

      // Should not throw errors after destroy
      expect(() => layout.destroy()).not.toThrow();
    });
  });
});
