/**
 * 触摸事件处理工具
 * Feature: new-year-fireworks-game
 * 需求：10.3
 * 
 * 提供高级触摸事件处理功能：
 * - 触摸防抖（避免过度触发）
 * - 多点触摸支持
 * - 触摸反馈效果
 */

/**
 * 触摸点信息
 */
export interface TouchPoint {
  x: number;
  y: number;
  identifier: number;
  timestamp: number;
}

/**
 * 触摸处理器配置
 */
export interface TouchHandlerConfig {
  /** 最小触摸间隔（毫秒），用于防抖 */
  minInterval?: number;
  /** 是否启用多点触摸 */
  enableMultiTouch?: boolean;
  /** 是否显示触摸反馈 */
  showFeedback?: boolean;
  /** 触摸反馈持续时间（毫秒） */
  feedbackDuration?: number;
}

/**
 * 触摸处理器类
 * 
 * 提供触摸事件的高级处理功能
 */
export class TouchHandler {
  private config: Required<TouchHandlerConfig>;
  private lastTouchTime: number = 0;
  private activeTouches: Map<number, TouchPoint> = new Map();
  private feedbackElements: Map<number, HTMLElement> = new Map();
  private container: HTMLElement;

  /**
   * 构造函数
   * 
   * @param container - 容器元素（用于添加触摸反馈）
   * @param config - 配置选项
   */
  constructor(container: HTMLElement, config: TouchHandlerConfig = {}) {
    this.container = container;
    this.config = {
      minInterval: config.minInterval ?? 100, // 默认100ms防抖
      enableMultiTouch: config.enableMultiTouch ?? true,
      showFeedback: config.showFeedback ?? true,
      feedbackDuration: config.feedbackDuration ?? 800,
    };
  }

  /**
   * 处理触摸开始事件
   * 
   * @param event - 触摸事件
   * @param callback - 触摸点回调函数
   */
  handleTouchStart(
    event: TouchEvent | React.TouchEvent,
    callback: (point: TouchPoint) => void
  ): void {
    const now = Date.now();
    
    // 防抖检查
    if (now - this.lastTouchTime < this.config.minInterval) {
      return;
    }
    
    this.lastTouchTime = now;
    
    // 获取触摸列表
    const touches = 'touches' in event ? event.touches : (event as React.TouchEvent).touches;
    
    // 处理每个触摸点
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      
      // 如果不支持多点触摸，只处理第一个触摸点
      if (!this.config.enableMultiTouch && i > 0) {
        break;
      }
      
      // 计算相对坐标
      const rect = this.container.getBoundingClientRect();
      const touchPoint: TouchPoint = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        identifier: touch.identifier,
        timestamp: now,
      };
      
      // 记录活动触摸点
      this.activeTouches.set(touch.identifier, touchPoint);
      
      // 显示触摸反馈
      if (this.config.showFeedback) {
        this.showTouchFeedback(touchPoint);
      }
      
      // 调用回调
      callback(touchPoint);
    }
  }

  /**
   * 处理触摸移动事件
   * 
   * @param event - 触摸事件
   * @param callback - 触摸点回调函数（可选）
   */
  handleTouchMove(
    event: TouchEvent | React.TouchEvent,
    callback?: (point: TouchPoint) => void
  ): void {
    const touches = 'touches' in event ? event.touches : (event as React.TouchEvent).touches;
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      
      // 更新活动触摸点
      if (this.activeTouches.has(touch.identifier)) {
        const rect = this.container.getBoundingClientRect();
        const touchPoint: TouchPoint = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
          identifier: touch.identifier,
          timestamp: Date.now(),
        };
        
        this.activeTouches.set(touch.identifier, touchPoint);
        
        // 调用回调（如果提供）
        if (callback) {
          callback(touchPoint);
        }
      }
    }
  }

  /**
   * 处理触摸结束事件
   * 
   * @param event - 触摸事件
   */
  handleTouchEnd(event: TouchEvent | React.TouchEvent): void {
    const touches = 'changedTouches' in event 
      ? event.changedTouches 
      : (event as React.TouchEvent).changedTouches;
    
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      
      // 移除活动触摸点
      this.activeTouches.delete(touch.identifier);
      
      // 移除触摸反馈
      this.removeTouchFeedback(touch.identifier);
    }
  }

  /**
   * 显示触摸反馈效果
   * 
   * @param point - 触摸点
   */
  private showTouchFeedback(point: TouchPoint): void {
    // 创建反馈元素
    const feedback = document.createElement('div');
    feedback.className = 'touch-feedback';
    feedback.style.cssText = `
      position: absolute;
      left: ${point.x}px;
      top: ${point.y}px;
      width: 40px;
      height: 40px;
      margin-left: -20px;
      margin-top: -20px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 70%);
      pointer-events: none;
      animation: touch-ripple ${this.config.feedbackDuration}ms ease-out;
      z-index: 9999;
    `;
    
    // 添加到容器
    this.container.appendChild(feedback);
    this.feedbackElements.set(point.identifier, feedback);
    
    // 自动移除
    setTimeout(() => {
      this.removeTouchFeedback(point.identifier);
    }, this.config.feedbackDuration);
  }

  /**
   * 移除触摸反馈效果
   * 
   * @param identifier - 触摸点标识符
   */
  private removeTouchFeedback(identifier: number): void {
    const feedback = this.feedbackElements.get(identifier);
    if (feedback && feedback.parentElement) {
      feedback.parentElement.removeChild(feedback);
      this.feedbackElements.delete(identifier);
    }
  }

  /**
   * 获取当前活动触摸点数量
   * 
   * @returns 活动触摸点数量
   */
  getActiveTouchCount(): number {
    return this.activeTouches.size;
  }

  /**
   * 获取所有活动触摸点
   * 
   * @returns 活动触摸点数组
   */
  getActiveTouches(): TouchPoint[] {
    return Array.from(this.activeTouches.values());
  }

  /**
   * 清除所有触摸状态
   */
  clear(): void {
    this.activeTouches.clear();
    
    // 清除所有反馈元素
    this.feedbackElements.forEach((feedback) => {
      if (feedback.parentElement) {
        feedback.parentElement.removeChild(feedback);
      }
    });
    this.feedbackElements.clear();
  }

  /**
   * 更新配置
   * 
   * @param config - 新配置
   */
  updateConfig(config: Partial<TouchHandlerConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * 销毁处理器
   */
  destroy(): void {
    this.clear();
  }
}

/**
 * 添加触摸反馈CSS动画
 * 应该在应用启动时调用一次
 */
export function injectTouchFeedbackStyles(): void {
  // 检查是否已经注入
  if (document.getElementById('touch-feedback-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'touch-feedback-styles';
  style.textContent = `
    @keyframes touch-ripple {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;
  
  document.head.appendChild(style);
}
