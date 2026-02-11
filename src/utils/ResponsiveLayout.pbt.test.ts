/**
 * 响应式布局属性测试
 * Feature: new-year-fireworks-game, Property 28: 响应式布局适配
 * 
 * 验证需求：10.4
 * 
 * 属性：对于任何屏幕尺寸变化，游戏界面的所有元素应该保持在可见区域内且比例正确
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { ResponsiveLayout } from './ResponsiveLayout';
import type { ScreenSize } from './ResponsiveLayout';

describe('ResponsiveLayout - Property-Based Tests', () => {
  let layout: ResponsiveLayout;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    layout = new ResponsiveLayout();
    mockCanvas = document.createElement('canvas');
    mockCanvas.getContext = (() => ({
      scale: () => {},
    })) as any;
  });

  afterEach(() => {
    layout.destroy();
  });

  // Feature: new-year-fireworks-game, Property 28: 响应式布局适配
  it('Property 28: should keep all UI elements within visible area for any screen size', () => {
    fc.assert(
      fc.property(
        // 生成随机屏幕尺寸（320px - 3840px宽度，240px - 2160px高度）
        fc.record({
          width: fc.integer({ min: 320, max: 3840 }),
          height: fc.integer({ min: 240, max: 2160 }),
        }),
        (screenDimensions) => {
          // 创建屏幕尺寸对象
          const screenSize: ScreenSize = {
            width: screenDimensions.width,
            height: screenDimensions.height,
            aspectRatio: screenDimensions.width / screenDimensions.height,
            devicePixelRatio: 1,
          };

          // 计算Canvas缩放
          const scale = layout.calculateCanvasScale(screenSize);

          // 属性1：Canvas尺寸应该在屏幕尺寸范围内
          expect(scale.width).toBeGreaterThan(0);
          expect(scale.height).toBeGreaterThan(0);
          expect(scale.width).toBeLessThanOrEqual(screenSize.width);
          expect(scale.height).toBeLessThanOrEqual(screenSize.height);

          // 属性2：Canvas加上偏移应该完全在屏幕内
          expect(scale.offsetX).toBeGreaterThanOrEqual(0);
          expect(scale.offsetY).toBeGreaterThanOrEqual(0);
          expect(scale.offsetX + scale.width).toBeLessThanOrEqual(screenSize.width + 1); // +1 for rounding
          expect(scale.offsetY + scale.height).toBeLessThanOrEqual(screenSize.height + 1);

          // 属性3：缩放比例应该是正数且合理
          expect(scale.scaleX).toBeGreaterThan(0);
          expect(scale.scaleY).toBeGreaterThan(0);
          expect(scale.scaleX).toBeLessThanOrEqual(1);
          expect(scale.scaleY).toBeLessThanOrEqual(1);

          // 属性4：Canvas应该保持合理的宽高比（接近16:9）
          const canvasAspectRatio = scale.width / scale.height;
          const targetAspectRatio = 16 / 9;
          expect(Math.abs(canvasAspectRatio - targetAspectRatio)).toBeLessThan(0.1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 28: should correctly convert screen coordinates to canvas coordinates for any valid input', () => {
    fc.assert(
      fc.property(
        // 生成随机屏幕尺寸和坐标
        fc.record({
          screenWidth: fc.integer({ min: 320, max: 3840 }),
          screenHeight: fc.integer({ min: 240, max: 2160 }),
          x: fc.integer({ min: 0, max: 3840 }),
          y: fc.integer({ min: 0, max: 2160 }),
        }),
        (data) => {
          // 设置Canvas
          layout.setCanvas(mockCanvas);
          mockCanvas.width = data.screenWidth;
          mockCanvas.height = data.screenHeight;

          // 模拟getBoundingClientRect
          mockCanvas.getBoundingClientRect = () => ({
            left: 0,
            top: 0,
            width: data.screenWidth,
            height: data.screenHeight,
            right: data.screenWidth,
            bottom: data.screenHeight,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          });

          // 只测试在屏幕范围内的坐标
          if (data.x <= data.screenWidth && data.y <= data.screenHeight) {
            const canvasCoords = layout.screenToCanvasCoordinates(data.x, data.y);

            // 属性：转换后的坐标应该是有效数字
            expect(Number.isFinite(canvasCoords.x)).toBe(true);
            expect(Number.isFinite(canvasCoords.y)).toBe(true);

            // 属性：转换后的坐标应该非负
            expect(canvasCoords.x).toBeGreaterThanOrEqual(0);
            expect(canvasCoords.y).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 28: should provide consistent responsive font sizes for any base size', () => {
    fc.assert(
      fc.property(
        // 生成随机基础字体大小（8px - 72px）
        fc.integer({ min: 8, max: 72 }),
        (baseFontSize) => {
          const responsiveFontSize = layout.getResponsiveFontSize(baseFontSize);

          // 属性1：响应式字体大小应该是正数
          expect(responsiveFontSize).toBeGreaterThan(0);

          // 属性2：响应式字体大小不应超过基础大小
          expect(responsiveFontSize).toBeLessThanOrEqual(baseFontSize);

          // 属性3：响应式字体大小不应小于基础大小的50%
          expect(responsiveFontSize).toBeGreaterThanOrEqual(baseFontSize * 0.5);

          // 属性4：应该是有限数字
          expect(Number.isFinite(responsiveFontSize)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 28: should provide consistent responsive spacing for any base spacing', () => {
    fc.assert(
      fc.property(
        // 生成随机基础间距（4px - 100px）
        fc.integer({ min: 4, max: 100 }),
        (baseSpacing) => {
          const responsiveSpacing = layout.getResponsiveSpacing(baseSpacing);

          // 属性1：响应式间距应该是正数
          expect(responsiveSpacing).toBeGreaterThan(0);

          // 属性2：响应式间距不应超过基础间距
          expect(responsiveSpacing).toBeLessThanOrEqual(baseSpacing);

          // 属性3：响应式间距不应小于基础间距的50%
          expect(responsiveSpacing).toBeGreaterThanOrEqual(baseSpacing * 0.5);

          // 属性4：应该是有限数字
          expect(Number.isFinite(responsiveSpacing)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 28: should correctly identify device type for any screen width', () => {
    fc.assert(
      fc.property(
        // 生成随机屏幕宽度（320px - 3840px）
        fc.integer({ min: 320, max: 3840 }),
        (screenWidth) => {
          // 模拟屏幕宽度
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: screenWidth,
          });

          const testLayout = new ResponsiveLayout();

          const isMobile = testLayout.isMobile();
          const isTablet = testLayout.isTablet();
          const isDesktop = testLayout.isDesktop();

          // 属性1：设备类型应该是互斥的（只能是一种）
          const deviceTypeCount = [isMobile, isTablet, isDesktop].filter(Boolean).length;
          expect(deviceTypeCount).toBe(1);

          // 属性2：设备类型应该与屏幕宽度一致
          if (screenWidth < 768) {
            expect(isMobile).toBe(true);
            expect(isTablet).toBe(false);
            expect(isDesktop).toBe(false);
          } else if (screenWidth >= 768 && screenWidth < 1024) {
            expect(isMobile).toBe(false);
            expect(isTablet).toBe(true);
            expect(isDesktop).toBe(false);
          } else {
            expect(isMobile).toBe(false);
            expect(isTablet).toBe(false);
            expect(isDesktop).toBe(true);
          }

          testLayout.destroy();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 28: should maintain aspect ratio consistency across different screen sizes', () => {
    fc.assert(
      fc.property(
        // 生成两个不同的屏幕尺寸
        fc.tuple(
          fc.record({
            width: fc.integer({ min: 320, max: 3840 }),
            height: fc.integer({ min: 240, max: 2160 }),
          }),
          fc.record({
            width: fc.integer({ min: 320, max: 3840 }),
            height: fc.integer({ min: 240, max: 2160 }),
          })
        ),
        ([screen1, screen2]) => {
          const size1: ScreenSize = {
            width: screen1.width,
            height: screen1.height,
            aspectRatio: screen1.width / screen1.height,
            devicePixelRatio: 1,
          };

          const size2: ScreenSize = {
            width: screen2.width,
            height: screen2.height,
            aspectRatio: screen2.width / screen2.height,
            devicePixelRatio: 1,
          };

          const scale1 = layout.calculateCanvasScale(size1);
          const scale2 = layout.calculateCanvasScale(size2);

          // 属性：两个Canvas的宽高比应该相同（都接近16:9）
          const ratio1 = scale1.width / scale1.height;
          const ratio2 = scale2.width / scale2.height;

          expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 28: should handle extreme screen sizes gracefully', () => {
    fc.assert(
      fc.property(
        // 生成极端屏幕尺寸
        fc.oneof(
          // 极窄屏幕
          fc.record({
            width: fc.integer({ min: 320, max: 480 }),
            height: fc.integer({ min: 800, max: 2160 }),
          }),
          // 极宽屏幕
          fc.record({
            width: fc.integer({ min: 2560, max: 3840 }),
            height: fc.integer({ min: 240, max: 1080 }),
          }),
          // 正方形屏幕
          fc.integer({ min: 500, max: 2000 }).map((size) => ({
            width: size,
            height: size,
          }))
        ),
        (screenDimensions) => {
          const screenSize: ScreenSize = {
            width: screenDimensions.width,
            height: screenDimensions.height,
            aspectRatio: screenDimensions.width / screenDimensions.height,
            devicePixelRatio: 1,
          };

          const scale = layout.calculateCanvasScale(screenSize);

          // 属性：即使在极端尺寸下，Canvas也应该有效
          expect(scale.width).toBeGreaterThan(0);
          expect(scale.height).toBeGreaterThan(0);
          expect(Number.isFinite(scale.width)).toBe(true);
          expect(Number.isFinite(scale.height)).toBe(true);

          // 属性：Canvas应该完全在屏幕内
          expect(scale.width + scale.offsetX).toBeLessThanOrEqual(screenSize.width + 1);
          expect(scale.height + scale.offsetY).toBeLessThanOrEqual(screenSize.height + 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
