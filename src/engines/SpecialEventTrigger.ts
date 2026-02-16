/**
 * 特殊事件触发器
 * Feature: new-year-fireworks-game
 *
 * 在特定时间触发特殊效果（整点烟花雨、10分钟倒计时特效等）
 */

import type { CountdownTime } from '../types/CountdownTypes';

/**
 * 特殊事件接口
 */
export interface SpecialEvent {
  /** 事件唯一标识 */
  id: string;
  /** 事件名称 */
  name: string;
  /** 触发条件函数 */
  triggerCondition: (time: CountdownTime) => boolean;
  /** 事件效果函数 */
  effect: () => void;
  /** 是否已触发 */
  triggered: boolean;
}

/**
 * 特殊事件触发器类
 *
 * 负责注册、检查和触发特殊事件
 */
export class SpecialEventTrigger {
  private events: Map<string, SpecialEvent>;

  /**
   * 构造函数
   */
  constructor() {
    this.events = new Map();
  }

  /**
   * 注册特殊事件
   * @param event 特殊事件对象
   */
  registerEvent(event: SpecialEvent): void {
    this.events.set(event.id, event);
  }

  /**
   * 检查并触发事件
   * @param time 当前倒计时时间
   */
  checkAndTrigger(time: CountdownTime): void {
    for (const event of this.events.values()) {
      // 如果事件未触发且满足触发条件
      if (!event.triggered && event.triggerCondition(time)) {
        event.effect();
        event.triggered = true;
      }
    }
  }

  /**
   * 重置所有事件
   * 将所有事件的triggered状态重置为false
   */
  reset(): void {
    for (const event of this.events.values()) {
      event.triggered = false;
    }
  }

  /**
   * 获取已触发事件列表
   * @returns 已触发的事件数组
   */
  getTriggeredEvents(): SpecialEvent[] {
    return Array.from(this.events.values()).filter((event) => event.triggered);
  }

  /**
   * 获取所有事件
   * @returns 所有事件数组
   */
  getAllEvents(): SpecialEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * 移除事件
   * @param eventId 事件ID
   */
  removeEvent(eventId: string): void {
    this.events.delete(eventId);
  }

  /**
   * 清空所有事件
   */
  clearEvents(): void {
    this.events.clear();
  }
}

/**
 * 创建整点烟花雨事件
 * @param fireworksEngine 烟花引擎实例
 * @param audioController 音频控制器实例（可选）
 * @returns 整点烟花雨事件对象
 */
export function createHourlyFireworkRainEvent(
  fireworksEngine: any,
  audioController?: any
): SpecialEvent {
  return {
    id: 'hourly_rain',
    name: '整点烟花雨',
    triggerCondition: () => {
      const now = new Date();
      return now.getMinutes() === 0 && now.getSeconds() === 0;
    },
    effect: () => {
      // 触发烟花雨效果 - 20个烟花，间隔200ms
      const canvas = fireworksEngine.canvas;
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height * 0.5;
          fireworksEngine.launchFirework(x, y);
        }, i * 200);
      }

      // 播放祝福音频（如果提供了音频控制器）
      if (audioController) {
        audioController.playSFX('success');
      }
    },
    triggered: false,
  };
}

/**
 * 创建10分钟倒计时特效事件
 * @param countdownDisplay 倒计时显示组件实例（可选）
 * @param audioController 音频控制器实例（可选）
 * @returns 10分钟倒计时特效事件对象
 */
export function createTenMinuteCountdownEvent(
  countdownDisplay?: any,
  audioController?: any
): SpecialEvent {
  return {
    id: 'ten_minute_countdown',
    name: '10分钟倒计时',
    triggerCondition: (time: CountdownTime) => {
      return time.totalSeconds === 600; // 10分钟 = 600秒
    },
    effect: () => {
      // 触发特殊倒计时效果
      if (
        countdownDisplay &&
        typeof countdownDisplay.enableSpecialEffect === 'function'
      ) {
        countdownDisplay.enableSpecialEffect();
      }

      // 播放倒计时警告音效
      if (audioController) {
        audioController.playSFX('click');
      }

      console.log('10分钟倒计时特效已触发！');
    },
    triggered: false,
  };
}
