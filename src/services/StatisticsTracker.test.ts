/**
 * 统计追踪器属性测试
 * Feature: new-year-fireworks-game
 * 
 * 使用fast-check进行基于属性的测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { StatisticsTracker } from './StatisticsTracker';
import { StorageService } from './StorageService';
import type { PlayerStatistics } from '../types';

describe('StatisticsTracker - Property Based Tests', () => {
  let storageService: StorageService;
  let tracker: StatisticsTracker;

  beforeEach(() => {
    storageService = new StorageService();
    tracker = new StatisticsTracker(storageService);
  });

  // Feature: new-year-fireworks-game, Property 11: 统计数据单调递增
  describe('Property 11: 统计数据单调递增', () => {
    it('总点击次数应该随着玩家点击而单调递增，不应减少', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constant('click'), { minLength: 1, maxLength: 100 }),
          (clicks) => {
            // 创建新的tracker实例
            const testTracker = new StatisticsTracker(storageService);
            
            let previousClicks = 0;
            
            for (const _ of clicks) {
              testTracker.recordClick();
              const currentStats = testTracker.getStatistics();
              
              // 验证点击次数单调递增
              expect(currentStats.totalClicks).toBeGreaterThan(previousClicks);
              previousClicks = currentStats.totalClicks;
            }
            
            // 最终点击次数应该等于点击数组的长度
            const finalStats = testTracker.getStatistics();
            expect(finalStats.totalClicks).toBe(clicks.length);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('总游戏时长应该随着记录而单调递增', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 1, maxLength: 50 }),
          (playTimes) => {
            const testTracker = new StatisticsTracker(storageService);
            
            let previousPlayTime = 0;
            
            for (const seconds of playTimes) {
              testTracker.recordPlayTime(seconds);
              const currentStats = testTracker.getStatistics();
              
              // 验证游戏时长单调递增
              expect(currentStats.totalPlayTime).toBeGreaterThanOrEqual(previousPlayTime);
              previousPlayTime = currentStats.totalPlayTime;
            }
            
            // 最终游戏时长应该等于所有时长的总和
            const finalStats = testTracker.getStatistics();
            const expectedTotal = playTimes.reduce((sum, time) => sum + time, 0);
            expect(finalStats.totalPlayTime).toBe(expectedTotal);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('最高连击数应该单调递增或保持不变', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 50 }), { minLength: 1, maxLength: 30 }),
          (comboCounts) => {
            const testTracker = new StatisticsTracker(storageService);
            
            let previousMaxCombo = 0;
            
            for (const count of comboCounts) {
              testTracker.recordCombo(count);
              const currentStats = testTracker.getStatistics();
              
              // 验证最高连击数单调递增或保持不变
              expect(currentStats.maxCombo).toBeGreaterThanOrEqual(previousMaxCombo);
              previousMaxCombo = currentStats.maxCombo;
            }
            
            // 最终最高连击数应该等于输入中的最大值
            const finalStats = testTracker.getStatistics();
            const expectedMax = Math.max(...comboCounts);
            expect(finalStats.maxCombo).toBe(expectedMax);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: new-year-fireworks-game, Property 12: 里程碑解锁机制
  describe('Property 12: 里程碑解锁机制', () => {
    it('达到解锁条件的里程碑应该增加已解锁烟花集合的大小', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 300 }),
          (totalClicks) => {
            // 定义测试用的里程碑
            const milestones = [
              { clicks: 10, fireworkId: 'meteor' },
              { clicks: 50, fireworkId: 'heart' },
              { clicks: 100, fireworkId: 'fortune' },
              { clicks: 200, fireworkId: 'redEnvelope' },
            ];
            
            const testTracker = new StatisticsTracker(storageService, milestones);
            
            // 记录初始已解锁烟花数量（默认有1个：peony）
            const initialSize = testTracker.getStatistics().unlockedFireworks.size;
            
            // 执行点击
            for (let i = 0; i < totalClicks; i++) {
              testTracker.recordClick();
            }
            
            const finalStats = testTracker.getStatistics();
            
            // 计算应该解锁的里程碑数量
            const unlockedMilestones = milestones.filter(m => totalClicks >= m.clicks);
            const expectedSize = initialSize + unlockedMilestones.length;
            
            // 验证已解锁烟花集合的大小
            expect(finalStats.unlockedFireworks.size).toBe(expectedSize);
            
            // 验证所有应该解锁的烟花都已解锁
            for (const milestone of unlockedMilestones) {
              expect(finalStats.unlockedFireworks.has(milestone.fireworkId)).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('未达到里程碑条件时不应解锁烟花', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 9 }), // 小于第一个里程碑（10）
          (clicks) => {
            const milestones = [
              { clicks: 10, fireworkId: 'meteor' },
              { clicks: 50, fireworkId: 'heart' },
            ];
            
            const testTracker = new StatisticsTracker(storageService, milestones);
            const initialSize = testTracker.getStatistics().unlockedFireworks.size;
            
            // 执行点击
            for (let i = 0; i < clicks; i++) {
              testTracker.recordClick();
            }
            
            const finalStats = testTracker.getStatistics();
            
            // 验证没有新的烟花被解锁
            expect(finalStats.unlockedFireworks.size).toBe(initialSize);
            expect(finalStats.unlockedFireworks.has('meteor')).toBe(false);
            expect(finalStats.unlockedFireworks.has('heart')).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('手动解锁烟花应该增加集合大小', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 3, maxLength: 10 }),
            { minLength: 1, maxLength: 20 }
          ),
          (fireworkIds) => {
            const testTracker = new StatisticsTracker(storageService);
            const initialSize = testTracker.getStatistics().unlockedFireworks.size;
            
            // 解锁烟花
            for (const id of fireworkIds) {
              testTracker.unlockFirework(id);
            }
            
            const finalStats = testTracker.getStatistics();
            
            // 验证集合大小增加（考虑到可能有重复的ID）
            const uniqueIds = new Set(fireworkIds);
            const expectedSize = initialSize + uniqueIds.size;
            expect(finalStats.unlockedFireworks.size).toBe(expectedSize);
            
            // 验证所有ID都已解锁
            for (const id of uniqueIds) {
              expect(finalStats.unlockedFireworks.has(id)).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for async property tests
  });

  // Feature: new-year-fireworks-game, Property 13: 统计数据持久化往返
  describe('Property 13: 统计数据持久化往返', () => {
    it('保存到本地存储然后加载应该产生等效的数据对象', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            clicks: fc.integer({ min: 0, max: 500 }),
            combos: fc.array(fc.integer({ min: 1, max: 20 }), { maxLength: 10 }),
            playTime: fc.integer({ min: 0, max: 10000 }),
            fireworks: fc.array(
              fc.string({ minLength: 3, maxLength: 8 }),
              { minLength: 0, maxLength: 10 }
            ),
            achievements: fc.array(
              fc.string({ minLength: 3, maxLength: 8 }),
              { minLength: 0, maxLength: 5 }
            ),
          }),
          async (data) => {
            const testTracker = new StatisticsTracker(storageService);
            
            // 设置统计数据
            for (let i = 0; i < data.clicks; i++) {
              testTracker.recordClick();
            }
            
            for (const combo of data.combos) {
              testTracker.recordCombo(combo);
            }
            
            testTracker.recordPlayTime(data.playTime);
            
            for (const firework of data.fireworks) {
              testTracker.unlockFirework(firework);
            }
            
            for (const achievement of data.achievements) {
              testTracker.unlockAchievement(achievement);
            }
            
            // 获取保存前的统计数据
            const statsBefore = testTracker.getStatistics();
            
            // 保存数据
            await testTracker.save();
            
            // 创建新的tracker并加载数据
            const newTracker = new StatisticsTracker(storageService);
            await newTracker.load();
            const statsAfter = newTracker.getStatistics();
            
            // 验证数据一致性
            expect(statsAfter.totalClicks).toBe(statsBefore.totalClicks);
            expect(statsAfter.maxCombo).toBe(statsBefore.maxCombo);
            expect(statsAfter.totalPlayTime).toBe(statsBefore.totalPlayTime);
            
            // 验证Set的内容一致
            expect(statsAfter.unlockedFireworks.size).toBe(statsBefore.unlockedFireworks.size);
            for (const firework of statsBefore.unlockedFireworks) {
              expect(statsAfter.unlockedFireworks.has(firework)).toBe(true);
            }
            
            expect(statsAfter.achievementsUnlocked.size).toBe(statsBefore.achievementsUnlocked.size);
            for (const achievement of statsBefore.achievementsUnlocked) {
              expect(statsAfter.achievementsUnlocked.has(achievement)).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for async property tests

    it('空统计数据的往返应该保持一致', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            const testTracker = new StatisticsTracker(storageService);
            
            // 不做任何操作,直接保存和加载
            const statsBefore = testTracker.getStatistics();
            
            await testTracker.save();
            
            const newTracker = new StatisticsTracker(storageService);
            await newTracker.load();
            const statsAfter = newTracker.getStatistics();
            
            // 验证默认值保持一致
            expect(statsAfter.totalClicks).toBe(statsBefore.totalClicks);
            expect(statsAfter.maxCombo).toBe(statsBefore.maxCombo);
            expect(statsAfter.totalPlayTime).toBe(statsBefore.totalPlayTime);
            expect(statsAfter.unlockedFireworks.size).toBe(statsBefore.unlockedFireworks.size);
            expect(statsAfter.achievementsUnlocked.size).toBe(statsBefore.achievementsUnlocked.size);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for async property tests

    it('多次保存和加载应该保持数据一致性', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 1, max: 10 }), { minLength: 1, maxLength: 5 }),
          async (clickCounts) => {
            const testTracker = new StatisticsTracker(storageService);
            
            let expectedClicks = 0;
            
            for (const count of clickCounts) {
              // 添加点击
              for (let i = 0; i < count; i++) {
                testTracker.recordClick();
              }
              expectedClicks += count;
              
              // 保存
              await testTracker.save();
              
              // 加载到新tracker
              const newTracker = new StatisticsTracker(storageService);
              await newTracker.load();
              const stats = newTracker.getStatistics();
              
              // 验证数据一致
              expect(stats.totalClicks).toBe(expectedClicks);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for async property tests
  });

  // 单元测试：基本功能验证
  describe('Unit Tests - Basic Functionality', () => {
    it('应该正确初始化默认统计数据', () => {
      const stats = tracker.getStatistics();
      
      expect(stats.totalClicks).toBe(0);
      expect(stats.maxCombo).toBe(0);
      expect(stats.unlockedFireworks.has('peony')).toBe(true);
      expect(stats.totalPlayTime).toBe(0);
      expect(stats.achievementsUnlocked.size).toBe(0);
    });

    it('应该正确记录点击', () => {
      tracker.recordClick();
      tracker.recordClick();
      tracker.recordClick();
      
      const stats = tracker.getStatistics();
      expect(stats.totalClicks).toBe(3);
    });

    it('应该正确更新最高连击数', () => {
      tracker.recordCombo(5);
      expect(tracker.getStatistics().maxCombo).toBe(5);
      
      tracker.recordCombo(3);
      expect(tracker.getStatistics().maxCombo).toBe(5); // 不应该减少
      
      tracker.recordCombo(10);
      expect(tracker.getStatistics().maxCombo).toBe(10);
    });

    it('应该正确解锁烟花', () => {
      tracker.unlockFirework('meteor');
      tracker.unlockFirework('heart');
      
      const stats = tracker.getStatistics();
      expect(stats.unlockedFireworks.has('meteor')).toBe(true);
      expect(stats.unlockedFireworks.has('heart')).toBe(true);
      expect(stats.unlockedFireworks.size).toBe(3); // peony + meteor + heart
    });

    it('应该正确累计游戏时间', () => {
      tracker.recordPlayTime(60);
      tracker.recordPlayTime(120);
      
      const stats = tracker.getStatistics();
      expect(stats.totalPlayTime).toBe(180);
    });

    it('应该正确解锁成就', () => {
      tracker.unlockAchievement('first_click');
      tracker.unlockAchievement('combo_master');
      
      const stats = tracker.getStatistics();
      expect(stats.achievementsUnlocked.has('first_click')).toBe(true);
      expect(stats.achievementsUnlocked.has('combo_master')).toBe(true);
      expect(stats.achievementsUnlocked.size).toBe(2);
    });

    it('应该正确重置统计数据', () => {
      tracker.recordClick();
      tracker.recordCombo(5);
      tracker.unlockFirework('meteor');
      
      tracker.reset();
      
      const stats = tracker.getStatistics();
      expect(stats.totalClicks).toBe(0);
      expect(stats.maxCombo).toBe(0);
      expect(stats.unlockedFireworks.size).toBe(1); // 只有默认的peony
      expect(stats.unlockedFireworks.has('peony')).toBe(true);
    });

    it('应该在达到里程碑时自动解锁烟花', () => {
      const milestones = [
        { clicks: 5, fireworkId: 'test1' },
        { clicks: 10, fireworkId: 'test2' },
      ];
      
      const testTracker = new StatisticsTracker(storageService, milestones);
      
      // 点击5次
      for (let i = 0; i < 5; i++) {
        testTracker.recordClick();
      }
      
      let stats = testTracker.getStatistics();
      expect(stats.unlockedFireworks.has('test1')).toBe(true);
      expect(stats.unlockedFireworks.has('test2')).toBe(false);
      
      // 再点击5次
      for (let i = 0; i < 5; i++) {
        testTracker.recordClick();
      }
      
      stats = testTracker.getStatistics();
      expect(stats.unlockedFireworks.has('test1')).toBe(true);
      expect(stats.unlockedFireworks.has('test2')).toBe(true);
    });
  });
});
