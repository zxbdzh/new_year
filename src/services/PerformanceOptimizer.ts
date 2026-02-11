/**
 * 性能优化器
 * Feature: new-year-fireworks-game
 * 
 * 负责检测设备性能并动态调整游戏质量配置
 */

import type { PerformanceProfile, PerformanceLevel } from '../types/PerformanceTypes';

/**
 * 性能优化器类
 * 
 * 功能：
 * - 检测设备性能（移动/桌面、WebGL支持、内存）
 * - 提供三档性能配置（low、medium、high）
 * - 监控FPS并动态调整质量
 */
export class PerformanceOptimizer {
  private profile: PerformanceProfile;
  private fps: number[] = [];
  private lastFrameTime: number = 0;
  private readonly FPS_HISTORY_SIZE = 60; // 保留最近60帧的FPS数据
  private readonly LOW_FPS_THRESHOLD = 30;
  private readonly HIGH_FPS_THRESHOLD = 50;

  constructor() {
    // 初始化时检测设备性能
    this.profile = this.detectPerformance();
  }

  /**
   * 检测设备性能并返回合适的性能配置
   * 
   * 检测因素：
   * - 设备类型（移动/桌面）
   * - WebGL支持
   * - 可用内存
   */
  detectPerformance(): PerformanceProfile {
    // 检测设备类型
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // 检测GPU能力（WebGL支持）
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const hasWebGL = !!gl;

    // 检测内存（如果可用）
    const memory = (performance as any).memory;
    const hasLowMemory =
      memory && memory.jsHeapSizeLimit < 500 * 1024 * 1024; // 小于500MB

    // 根据检测结果返回配置
    if (isMobile || hasLowMemory) {
      return this.createProfile('low');
    } else if (hasWebGL) {
      return this.createProfile('high');
    } else {
      return this.createProfile('medium');
    }
  }

  /**
   * 创建指定等级的性能配置
   */
  private createProfile(level: PerformanceLevel): PerformanceProfile {
    switch (level) {
      case 'low':
        return {
          level: 'low',
          maxParticles: 50,
          maxFireworks: 3,
          useWebGL: false,
          particleSize: 2,
          enableGlow: false,
          enableTrails: false,
        };
      case 'medium':
        return {
          level: 'medium',
          maxParticles: 100,
          maxFireworks: 5,
          useWebGL: false,
          particleSize: 3,
          enableGlow: true,
          enableTrails: false,
        };
      case 'high':
        return {
          level: 'high',
          maxParticles: 200,
          maxFireworks: 10,
          useWebGL: true,
          particleSize: 4,
          enableGlow: true,
          enableTrails: true,
        };
    }
  }

  /**
   * 更新FPS统计
   * 
   * @param currentTime 当前时间戳（毫秒）
   */
  updateFPS(currentTime: number): void {
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = currentTime;
      return;
    }

    // 计算当前帧的FPS
    const deltaTime = currentTime - this.lastFrameTime;
    if (deltaTime > 0) {
      const currentFPS = 1000 / deltaTime;
      this.fps.push(currentFPS);

      // 保持FPS历史记录在指定大小内
      if (this.fps.length > this.FPS_HISTORY_SIZE) {
        this.fps.shift();
      }
    }

    this.lastFrameTime = currentTime;
  }

  /**
   * 获取平均FPS
   * 
   * @returns 平均FPS值，如果没有数据则返回0
   */
  getAverageFPS(): number {
    if (this.fps.length === 0) {
      return 0;
    }

    const sum = this.fps.reduce((acc, fps) => acc + fps, 0);
    return sum / this.fps.length;
  }

  /**
   * 动态调整性能配置
   * 
   * 根据当前平均FPS自动降级或升级性能配置：
   * - FPS < 30: 降级
   * - FPS > 50 且当前不是最高配置: 升级
   */
  adjustProfile(): void {
    const avgFPS = this.getAverageFPS();

    // 需要足够的FPS数据才能做出调整决策
    if (this.fps.length < this.FPS_HISTORY_SIZE / 2) {
      return;
    }

    // 性能不足，降级
    if (avgFPS < this.LOW_FPS_THRESHOLD) {
      this.degradeQuality();
    }
    // 性能充足，可以升级
    else if (avgFPS > this.HIGH_FPS_THRESHOLD && this.canUpgrade()) {
      this.upgradeQuality();
    }
  }

  /**
   * 降低质量配置
   */
  private degradeQuality(): void {
    const currentLevel = this.profile.level;

    if (currentLevel === 'high') {
      this.profile = this.createProfile('medium');
    } else if (currentLevel === 'medium') {
      this.profile = this.createProfile('low');
    }
    // 已经是最低配置，无法再降级

    // 清空FPS历史，重新开始监控
    this.fps = [];
  }

  /**
   * 提升质量配置
   */
  private upgradeQuality(): void {
    const currentLevel = this.profile.level;

    if (currentLevel === 'low') {
      this.profile = this.createProfile('medium');
    } else if (currentLevel === 'medium') {
      this.profile = this.createProfile('high');
    }
    // 已经是最高配置，无法再升级

    // 清空FPS历史，重新开始监控
    this.fps = [];
  }

  /**
   * 检查是否可以升级配置
   */
  private canUpgrade(): boolean {
    return this.profile.level !== 'high';
  }

  /**
   * 获取当前性能配置
   */
  getProfile(): PerformanceProfile {
    return { ...this.profile };
  }

  /**
   * 手动设置性能配置
   * 
   * @param profile 新的性能配置
   */
  setProfile(profile: PerformanceProfile): void {
    this.profile = { ...profile };
    // 清空FPS历史
    this.fps = [];
  }

  /**
   * 重置FPS统计
   */
  resetFPS(): void {
    this.fps = [];
    this.lastFrameTime = 0;
  }
}
