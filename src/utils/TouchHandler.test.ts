/**
 * TouchHandler 单元测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TouchHandler, injectTouchFeedbackStyles, type TouchPoint } from './TouchHandler';

describe('TouchHandler', () => {
  let container: HTMLElement;
  let handler: TouchHandler;

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    container.style.position = 'relative';
    document.body.appendChild(container);

    // 注入样式
    injectTouchFeedbackStyles();
  });

  afterEach(() => {
    if (handler) {
      handler.destroy();
    }
    if (container.parentElement) {
      container.parentElement.removeChild(container);
    }
  });

  describe('构造函数', () => {
    it('should create handler with default config', () => {
      handler = new TouchHandler(container);
      expect(handler).toBeDefined();
      expect(handler.getActiveTouchCount()).toBe(0);
    });

    it('should create handler with custom config', () => {
      handler = new TouchHandler(container, {
        minInterval: 200,
        enableMultiTouch: false,
        showFeedback: false,
      });
      expect(handler).toBeDefined();
    });
  });

  describe('handleTouchStart', () => {
    beforeEach(() => {
      handler = new TouchHandler(container);
    });

    it('should handle single touch', () => {
      const callback = vi.fn();
      const mockTouch = createMockTouch(100, 200, 0);
      const mockEvent = createMockTouchEvent([mockTouch]);

      handler.handleTouchStart(mockEvent, callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
          identifier: 0,
          timestamp: expect.any(Number),
        })
      );
      expect(handler.getActiveTouchCount()).toBe(1);
    });

    it('should handle multiple touches when multitouch enabled', () => {
      const callback = vi.fn();
      const mockTouches = [
        createMockTouch(100, 200, 0),
        createMockTouch(300, 400, 1),
      ];
      const mockEvent = createMockTouchEvent(mockTouches);

      handler.handleTouchStart(mockEvent, callback);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(handler.getActiveTouchCount()).toBe(2);
    });

    it('should only handle first touch when multitouch disabled', () => {
      handler = new TouchHandler(container, { enableMultiTouch: false });
      const callback = vi.fn();
      const mockTouches = [
        createMockTouch(100, 200, 0),
        createMockTouch(300, 400, 1),
      ];
      const mockEvent = createMockTouchEvent(mockTouches);

      handler.handleTouchStart(mockEvent, callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(handler.getActiveTouchCount()).toBe(1);
    });

    it('should apply debounce with minInterval', () => {
      handler = new TouchHandler(container, { minInterval: 100 });
      const callback = vi.fn();
      const mockTouch = createMockTouch(100, 200, 0);
      const mockEvent = createMockTouchEvent([mockTouch]);

      // 第一次触摸
      handler.handleTouchStart(mockEvent, callback);
      expect(callback).toHaveBeenCalledTimes(1);

      // 立即第二次触摸（应该被防抖阻止）
      handler.handleTouchStart(mockEvent, callback);
      expect(callback).toHaveBeenCalledTimes(1); // 仍然是1次
    });

    it('should show touch feedback when enabled', () => {
      handler = new TouchHandler(container, { showFeedback: true });
      const callback = vi.fn();
      const mockTouch = createMockTouch(100, 200, 0);
      const mockEvent = createMockTouchEvent([mockTouch]);

      handler.handleTouchStart(mockEvent, callback);

      // 检查是否添加了反馈元素
      const feedbackElements = container.querySelectorAll('.touch-feedback');
      expect(feedbackElements.length).toBe(1);
    });

    it('should not show touch feedback when disabled', () => {
      handler = new TouchHandler(container, { showFeedback: false });
      const callback = vi.fn();
      const mockTouch = createMockTouch(100, 200, 0);
      const mockEvent = createMockTouchEvent([mockTouch]);

      handler.handleTouchStart(mockEvent, callback);

      // 检查没有添加反馈元素
      const feedbackElements = container.querySelectorAll('.touch-feedback');
      expect(feedbackElements.length).toBe(0);
    });
  });

  describe('handleTouchMove', () => {
    beforeEach(() => {
      handler = new TouchHandler(container);
    });

    it('should update active touch position', () => {
      const callback = vi.fn();
      const mockTouch1 = createMockTouch(100, 200, 0);
      const mockTouch2 = createMockTouch(150, 250, 0);
      const startEvent = createMockTouchEvent([mockTouch1]);
      const moveEvent = createMockTouchEvent([mockTouch2]);

      // 开始触摸
      handler.handleTouchStart(startEvent, () => {});

      // 移动触摸
      handler.handleTouchMove(moveEvent, callback);

      expect(callback).toHaveBeenCalledTimes(1);
      const activeTouches = handler.getActiveTouches();
      expect(activeTouches.length).toBe(1);
    });
  });

  describe('handleTouchEnd', () => {
    beforeEach(() => {
      handler = new TouchHandler(container);
    });

    it('should remove active touch', () => {
      const mockTouch = createMockTouch(100, 200, 0);
      const startEvent = createMockTouchEvent([mockTouch]);
      const endEvent = createMockTouchEvent([mockTouch], 'changedTouches');

      // 开始触摸
      handler.handleTouchStart(startEvent, () => {});
      expect(handler.getActiveTouchCount()).toBe(1);

      // 结束触摸
      handler.handleTouchEnd(endEvent);
      expect(handler.getActiveTouchCount()).toBe(0);
    });

    it('should remove touch feedback', () => {
      handler = new TouchHandler(container, { showFeedback: true });
      const mockTouch = createMockTouch(100, 200, 0);
      const startEvent = createMockTouchEvent([mockTouch]);
      const endEvent = createMockTouchEvent([mockTouch], 'changedTouches');

      // 开始触摸
      handler.handleTouchStart(startEvent, () => {});
      expect(container.querySelectorAll('.touch-feedback').length).toBe(1);

      // 结束触摸
      handler.handleTouchEnd(endEvent);
      
      // 反馈元素应该被移除（可能需要等待动画）
      setTimeout(() => {
        expect(container.querySelectorAll('.touch-feedback').length).toBe(0);
      }, 100);
    });
  });

  describe('getActiveTouches', () => {
    beforeEach(() => {
      handler = new TouchHandler(container);
    });

    it('should return all active touches', () => {
      const mockTouches = [
        createMockTouch(100, 200, 0),
        createMockTouch(300, 400, 1),
      ];
      const mockEvent = createMockTouchEvent(mockTouches);

      handler.handleTouchStart(mockEvent, () => {});

      const activeTouches = handler.getActiveTouches();
      expect(activeTouches.length).toBe(2);
      expect(activeTouches[0].identifier).toBe(0);
      expect(activeTouches[1].identifier).toBe(1);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      handler = new TouchHandler(container, { showFeedback: true });
    });

    it('should clear all active touches and feedback', () => {
      const mockTouch = createMockTouch(100, 200, 0);
      const mockEvent = createMockTouchEvent([mockTouch]);

      handler.handleTouchStart(mockEvent, () => {});
      expect(handler.getActiveTouchCount()).toBe(1);
      expect(container.querySelectorAll('.touch-feedback').length).toBe(1);

      handler.clear();
      expect(handler.getActiveTouchCount()).toBe(0);
      expect(container.querySelectorAll('.touch-feedback').length).toBe(0);
    });
  });

  describe('updateConfig', () => {
    beforeEach(() => {
      handler = new TouchHandler(container);
    });

    it('should update configuration', () => {
      handler.updateConfig({ minInterval: 200 });
      
      const callback = vi.fn();
      const mockTouch = createMockTouch(100, 200, 0);
      const mockEvent = createMockTouchEvent([mockTouch]);

      // 第一次触摸
      handler.handleTouchStart(mockEvent, callback);
      expect(callback).toHaveBeenCalledTimes(1);

      // 立即第二次触摸（应该被新的防抖间隔阻止）
      handler.handleTouchStart(mockEvent, callback);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('destroy', () => {
    beforeEach(() => {
      handler = new TouchHandler(container);
    });

    it('should clean up all resources', () => {
      const mockTouch = createMockTouch(100, 200, 0);
      const mockEvent = createMockTouchEvent([mockTouch]);

      handler.handleTouchStart(mockEvent, () => {});
      expect(handler.getActiveTouchCount()).toBe(1);

      handler.destroy();
      expect(handler.getActiveTouchCount()).toBe(0);
    });
  });
});

describe('injectTouchFeedbackStyles', () => {
  afterEach(() => {
    // 清理注入的样式
    const style = document.getElementById('touch-feedback-styles');
    if (style && style.parentElement) {
      style.parentElement.removeChild(style);
    }
  });

  it('should inject styles only once', () => {
    injectTouchFeedbackStyles();
    const style1 = document.getElementById('touch-feedback-styles');
    expect(style1).toBeDefined();

    injectTouchFeedbackStyles();
    const style2 = document.getElementById('touch-feedback-styles');
    expect(style2).toBe(style1); // 应该是同一个元素
  });

  it('should inject keyframe animation', () => {
    injectTouchFeedbackStyles();
    const style = document.getElementById('touch-feedback-styles');
    expect(style?.textContent).toContain('@keyframes touch-ripple');
  });
});

// 辅助函数：创建模拟触摸对象
function createMockTouch(clientX: number, clientY: number, identifier: number): Touch {
  return {
    identifier,
    clientX,
    clientY,
    screenX: clientX,
    screenY: clientY,
    pageX: clientX,
    pageY: clientY,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    force: 1,
    target: document.body,
  } as Touch;
}

// 辅助函数：创建模拟触摸事件
function createMockTouchEvent(
  touches: Touch[],
  touchListType: 'touches' | 'changedTouches' = 'touches'
): TouchEvent {
  const touchList = {
    length: touches.length,
    item: (index: number) => touches[index] || null,
    [Symbol.iterator]: function* () {
      for (const touch of touches) {
        yield touch;
      }
    },
  } as TouchList;

  // 添加数组索引访问
  touches.forEach((touch, index) => {
    (touchList as any)[index] = touch;
  });

  const event = {
    [touchListType]: touchList,
    touches: touchListType === 'touches' ? touchList : ({ length: 0 } as TouchList),
    changedTouches: touchListType === 'changedTouches' ? touchList : ({ length: 0 } as TouchList),
    targetTouches: { length: 0 } as TouchList,
    preventDefault: () => {},
    stopPropagation: () => {},
  } as TouchEvent;

  return event;
}
