/**
 * 连击系统
 * Feature: new-year-fireworks-game
 * 
 * 检测快速连续点击并触发特殊效果
 */

import type { ComboConfig, ComboState } from '../types/ComboTypes';

/**
 * 连击系统类
 * 
 * 负责检测和管理连击状态，当玩家在时间窗口内连续点击时触发增强效果
 */
export class ComboSystem {
  private config: ComboConfig;
  private state: ComboState;
  private comboCallbacks: Set<(state: ComboState) => void>;

  /**
   * 创建连击系统实例
   * @param config 连击配置
   */
  constructor(config: ComboConfig) {
    this.config = config;
    this.state = {
      count: 0,
      lastClickTime: 0,
      isActive: false,
      multiplier: 1,
    };
    this.comboCallbacks = new Set();
  }

  /**
   * 注册一次点击
   * @param timestamp 点击时间戳（毫秒）
   * @returns 更新后的连击状态
   */
  registerClick(timestamp: number): ComboState {
    const timeSinceLastClick = timestamp - this.state.lastClickTime;

    // 检查是否在时间窗口内
    if (timeSinceLastClick <= this.config.timeWindow && this.state.count > 0) {
      // 在时间窗口内，增加连击计数
      this.state.count++;
    } else {
      // 超出时间窗口，重置连击
      this.state.count = 1;
    }

    // 更新最后点击时间
    this.state.lastClickTime = timestamp;

    // 检查是否达到最小连击次数
    if (this.state.count >= this.config.minClicks) {
      this.state.isActive = true;
      
      // 计算连击倍数
      this.state.multiplier = this.calculateMultiplier(this.state.count);

      // 触发连击回调
      this.triggerComboCallbacks();
    } else {
      this.state.isActive = false;
      this.state.multiplier = 1;
    }

    return { ...this.state };
  }

  /**
   * 计算连击倍数
   * @param count 连击次数
   * @returns 连击倍数
   */
  private calculateMultiplier(count: number): number {
    // 从高到低查找匹配的倍数
    const sortedKeys = Array.from(this.config.comboMultipliers.keys()).sort((a, b) => b - a);
    
    for (const threshold of sortedKeys) {
      if (count >= threshold) {
        return this.config.comboMultipliers.get(threshold) || 1;
      }
    }

    return 1;
  }

  /**
   * 触发所有连击回调
   */
  private triggerComboCallbacks(): void {
    const stateCopy = { ...this.state };
    this.comboCallbacks.forEach(callback => {
      try {
        callback(stateCopy);
      } catch (error) {
        console.error('Error in combo callback:', error);
      }
    });
  }

  /**
   * 重置连击状态
   */
  reset(): void {
    this.state = {
      count: 0,
      lastClickTime: 0,
      isActive: false,
      multiplier: 1,
    };
  }

  /**
   * 获取当前连击状态
   * @returns 连击状态的副本
   */
  getState(): ComboState {
    return { ...this.state };
  }

  /**
   * 注册连击触发回调
   * @param callback 连击触发时调用的回调函数
   */
  onCombo(callback: (state: ComboState) => void): void {
    this.comboCallbacks.add(callback);
  }

  /**
   * 移除连击回调
   * @param callback 要移除的回调函数
   */
  offCombo(callback: (state: ComboState) => void): void {
    this.comboCallbacks.delete(callback);
  }

  /**
   * 清除所有连击回调
   */
  clearCallbacks(): void {
    this.comboCallbacks.clear();
  }
}
