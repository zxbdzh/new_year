/**
 * 连击系统测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { ComboSystem } from './ComboSystem';
import type { ComboConfig } from '../types/ComboTypes';

describe('ComboSystem', () => {
  let defaultConfig: ComboConfig;

  beforeEach(() => {
    defaultConfig = {
      timeWindow: 3000, // 3秒
      minClicks: 2,
      comboMultipliers: new Map([
        [2, 2], // 2-3次点击：2倍
        [4, 3], // 4-5次点击：3倍
        [6, 5], // 6次以上：5倍（烟花雨）
      ]),
    };
  });

  describe('单元测试', () => {
    it('应该正确初始化连击系统', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      const state = comboSystem.getState();

      expect(state.count).toBe(0);
      expect(state.lastClickTime).toBe(0);
      expect(state.isActive).toBe(false);
      expect(state.multiplier).toBe(1);
    });

    it('应该在单次点击时不激活连击', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      const state = comboSystem.registerClick(1000);

      expect(state.count).toBe(1);
      expect(state.isActive).toBe(false);
      expect(state.multiplier).toBe(1);
    });

    it('应该在时间窗口内的2次点击时激活连击', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      
      comboSystem.registerClick(1000);
      const state = comboSystem.registerClick(2000); // 1秒后

      expect(state.count).toBe(2);
      expect(state.isActive).toBe(true);
      expect(state.multiplier).toBe(2);
    });

    it('应该在超出时间窗口后重置连击', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      
      comboSystem.registerClick(1000);
      const state = comboSystem.registerClick(5000); // 4秒后，超出3秒窗口

      expect(state.count).toBe(1);
      expect(state.isActive).toBe(false);
      expect(state.multiplier).toBe(1);
    });

    it('应该正确计算不同连击等级的倍数', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      
      // 2次点击：2倍
      comboSystem.registerClick(1000);
      let state = comboSystem.registerClick(1500);
      expect(state.multiplier).toBe(2);

      // 4次点击：3倍
      comboSystem.registerClick(2000);
      state = comboSystem.registerClick(2500);
      expect(state.multiplier).toBe(3);

      // 6次点击：5倍
      comboSystem.registerClick(3000);
      state = comboSystem.registerClick(3500);
      expect(state.multiplier).toBe(5);
    });

    it('应该在reset后清除所有状态', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      
      comboSystem.registerClick(1000);
      comboSystem.registerClick(1500);
      comboSystem.reset();

      const state = comboSystem.getState();
      expect(state.count).toBe(0);
      expect(state.lastClickTime).toBe(0);
      expect(state.isActive).toBe(false);
      expect(state.multiplier).toBe(1);
    });

    it('应该在连击激活时触发回调', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      let callbackCount = 0;
      let lastState = null;

      comboSystem.onCombo((state) => {
        callbackCount++;
        lastState = state;
      });

      comboSystem.registerClick(1000);
      comboSystem.registerClick(1500);

      expect(callbackCount).toBe(1);
      expect(lastState).not.toBeNull();
      expect(lastState?.count).toBe(2);
      expect(lastState?.isActive).toBe(true);
    });

    it('应该支持移除回调', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      let callbackCount = 0;

      const callback = () => {
        callbackCount++;
      };

      comboSystem.onCombo(callback);
      comboSystem.registerClick(1000);
      comboSystem.registerClick(1500);
      expect(callbackCount).toBe(1);

      comboSystem.offCombo(callback);
      comboSystem.registerClick(2000);
      expect(callbackCount).toBe(1); // 不应该再增加
    });

    it('应该处理回调中的错误而不影响系统', () => {
      const comboSystem = new ComboSystem(defaultConfig);

      comboSystem.onCombo(() => {
        throw new Error('Test error');
      });

      // 不应该抛出错误
      expect(() => {
        comboSystem.registerClick(1000);
        comboSystem.registerClick(1500);
      }).not.toThrow();
    });
  });

  describe('属性测试', () => {
    // Feature: new-year-fireworks-game, Property 9: 连击触发条件
    it('属性 9：对于任何在时间窗口内的连续点击序列（≥2次），连击系统应该触发增强效果', () => {
      fc.assert(
        fc.property(
          // 生成2到10次的点击序列
          fc.integer({ min: 2, max: 10 }),
          // 生成起始时间戳
          fc.integer({ min: 1000, max: 100000 }),
          // 生成点击间隔（在时间窗口内）
          fc.array(fc.integer({ min: 100, max: 2999 }), { minLength: 1, maxLength: 9 }),
          (clickCount, startTime, intervals) => {
            const comboSystem = new ComboSystem(defaultConfig);
            let currentTime = startTime;
            let lastState = null;

            // 注册连续点击
            for (let i = 0; i < clickCount; i++) {
              lastState = comboSystem.registerClick(currentTime);
              if (i < intervals.length) {
                currentTime += intervals[i];
              }
            }

            // 验证：连击次数应该等于点击次数
            expect(lastState?.count).toBe(clickCount);

            // 验证：连击应该被激活（因为 ≥ minClicks）
            expect(lastState?.isActive).toBe(true);

            // 验证：倍数应该大于1
            expect(lastState?.multiplier).toBeGreaterThan(1);

            // 验证：倍数应该根据点击次数正确计算
            if (clickCount >= 6) {
              expect(lastState?.multiplier).toBe(5);
            } else if (clickCount >= 4) {
              expect(lastState?.multiplier).toBe(3);
            } else if (clickCount >= 2) {
              expect(lastState?.multiplier).toBe(2);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('属性：超出时间窗口的点击应该重置连击', () => {
      fc.assert(
        fc.property(
          // 生成初始点击次数
          fc.integer({ min: 2, max: 5 }),
          // 生成起始时间
          fc.integer({ min: 1000, max: 100000 }),
          // 生成超出时间窗口的间隔
          fc.integer({ min: 3001, max: 10000 }),
          (initialClicks, startTime, longInterval) => {
            const comboSystem = new ComboSystem(defaultConfig);
            let currentTime = startTime;

            // 建立连击
            for (let i = 0; i < initialClicks; i++) {
              comboSystem.registerClick(currentTime);
              currentTime += 500; // 短间隔
            }

            // 等待超出时间窗口后再点击
            currentTime += longInterval;
            const state = comboSystem.registerClick(currentTime);

            // 验证：连击应该被重置为1
            expect(state.count).toBe(1);
            expect(state.isActive).toBe(false);
            expect(state.multiplier).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('属性：连击倍数应该随点击次数单调递增', () => {
      fc.assert(
        fc.property(
          // 生成起始时间
          fc.integer({ min: 1000, max: 100000 }),
          (startTime) => {
            const comboSystem = new ComboSystem(defaultConfig);
            let currentTime = startTime;
            let previousMultiplier = 1;

            // 连续点击10次
            for (let i = 1; i <= 10; i++) {
              const state = comboSystem.registerClick(currentTime);
              currentTime += 500;

              // 验证：倍数应该单调递增或保持不变
              expect(state.multiplier).toBeGreaterThanOrEqual(previousMultiplier);
              previousMultiplier = state.multiplier;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('属性：getState应该返回状态的独立副本', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 100000 }),
          fc.integer({ min: 2, max: 5 }),
          (startTime, clickCount) => {
            const comboSystem = new ComboSystem(defaultConfig);
            let currentTime = startTime;

            // 建立连击
            for (let i = 0; i < clickCount; i++) {
              comboSystem.registerClick(currentTime);
              currentTime += 500;
            }

            const state1 = comboSystem.getState();
            const state2 = comboSystem.getState();

            // 验证：两次获取的状态应该是不同的对象
            expect(state1).not.toBe(state2);

            // 验证：但内容应该相同
            expect(state1).toEqual(state2);

            // 验证：修改返回的状态不应该影响内部状态
            state1.count = 999;
            const state3 = comboSystem.getState();
            expect(state3.count).not.toBe(999);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('属性：连击回调应该在每次激活时被调用', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }),
          fc.integer({ min: 1000, max: 100000 }),
          (clickCount, startTime) => {
            const comboSystem = new ComboSystem(defaultConfig);
            let callbackCount = 0;
            const receivedStates: number[] = [];

            comboSystem.onCombo((state) => {
              callbackCount++;
              receivedStates.push(state.count);
            });

            let currentTime = startTime;
            for (let i = 0; i < clickCount; i++) {
              comboSystem.registerClick(currentTime);
              currentTime += 500;
            }

            // 验证：回调次数应该等于激活次数（从第2次点击开始）
            expect(callbackCount).toBe(clickCount - 1);

            // 验证：接收到的状态应该是递增的
            for (let i = 1; i < receivedStates.length; i++) {
              expect(receivedStates[i]).toBeGreaterThan(receivedStates[i - 1]);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('属性：reset后的系统应该等效于新创建的系统', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 10 }),
          fc.integer({ min: 1000, max: 100000 }),
          (clickCount, startTime) => {
            const comboSystem1 = new ComboSystem(defaultConfig);
            const comboSystem2 = new ComboSystem(defaultConfig);

            let currentTime = startTime;
            for (let i = 0; i < clickCount; i++) {
              comboSystem1.registerClick(currentTime);
              currentTime += 500;
            }

            comboSystem1.reset();

            // 验证：重置后的状态应该与新系统相同
            expect(comboSystem1.getState()).toEqual(comboSystem2.getState());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('属性：时间戳顺序不应该影响连击逻辑（只要间隔在窗口内）', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 100000 }),
          fc.array(fc.integer({ min: 100, max: 2999 }), { minLength: 2, maxLength: 5 }),
          (startTime, intervals) => {
            const comboSystem = new ComboSystem(defaultConfig);
            let currentTime = startTime;
            let clickCount = 0;

            for (const interval of intervals) {
              comboSystem.registerClick(currentTime);
              clickCount++;
              currentTime += interval;
            }

            // 最后一次点击
            const finalState = comboSystem.registerClick(currentTime);
            clickCount++;

            // 验证：连击次数应该等于总点击次数
            expect(finalState.count).toBe(clickCount);
            expect(finalState.isActive).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('边缘情况测试', () => {
    it('应该处理时间窗口边界情况（恰好3000ms）', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      
      comboSystem.registerClick(1000);
      const state = comboSystem.registerClick(4000); // 恰好3000ms

      expect(state.count).toBe(2);
      expect(state.isActive).toBe(true);
    });

    it('应该处理时间窗口边界情况（3001ms）', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      
      comboSystem.registerClick(1000);
      const state = comboSystem.registerClick(4001); // 3001ms，超出窗口

      expect(state.count).toBe(1);
      expect(state.isActive).toBe(false);
    });

    it('应该处理同一时间戳的多次点击', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      
      comboSystem.registerClick(1000);
      const state = comboSystem.registerClick(1000); // 同一时间

      expect(state.count).toBe(2);
      expect(state.isActive).toBe(true);
    });

    it('应该处理空的倍数映射', () => {
      const config: ComboConfig = {
        timeWindow: 3000,
        minClicks: 2,
        comboMultipliers: new Map(),
      };

      const comboSystem = new ComboSystem(config);
      comboSystem.registerClick(1000);
      const state = comboSystem.registerClick(1500);

      expect(state.multiplier).toBe(1); // 默认倍数
    });

    it('应该处理非常大的点击次数', () => {
      const comboSystem = new ComboSystem(defaultConfig);
      let currentTime = 1000;

      for (let i = 0; i < 100; i++) {
        comboSystem.registerClick(currentTime);
        currentTime += 100;
      }

      const state = comboSystem.getState();
      expect(state.count).toBe(100);
      expect(state.isActive).toBe(true);
      expect(state.multiplier).toBe(5); // 最高倍数
    });
  });
});
