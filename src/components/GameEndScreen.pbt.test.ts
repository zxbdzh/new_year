/**
 * 游戏重置属性测试
 * Feature: new-year-fireworks-game, Property 23: 游戏重置状态恢复
 * 验证需求：8.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { configureStore } from '@reduxjs/toolkit';
import gameReducer, { resetGame, setMode, updateCountdown, addFirework, updateCombo } from '../store/gameSlice';
import statisticsReducer, { recordClick, recordCombo, unlockFirework } from '../store/statisticsSlice';
import type { GameMode } from '../types/GameTypes';

/**
 * 属性 23：游戏重置状态恢复
 * 对于任何游戏状态，点击"再玩一次"后的状态应该等效于游戏初始状态（除了保留的统计数据）
 */
describe('Property 23: 游戏重置状态恢复', () => {
  // Helper: 创建测试用的store
  const createTestStore = () => configureStore({
    reducer: {
      game: gameReducer,
      statistics: statisticsReducer,
    },
  });

  /**
   * 生成随机游戏模式
   */
  const gameModeArbitrary = fc.constantFrom<GameMode>('menu', 'single', 'multiplayer', 'ended');

  /**
   * 生成随机十六进制颜色
   */
  const hexColorArbitrary = fc.integer({ min: 0, max: 0xffffff })
    .map(n => '#' + n.toString(16).padStart(6, '0'));

  /**
   * 生成随机倒计时时间
   */
  const countdownTimeArbitrary = fc.record({
    days: fc.nat({ max: 365 }),
    hours: fc.nat({ max: 23 }),
    minutes: fc.nat({ max: 59 }),
    seconds: fc.nat({ max: 59 }),
    totalSeconds: fc.nat({ max: 31536000 }), // 最多一年
  });

  /**
   * 生成随机烟花实例
   */
  const fireworkInstanceArbitrary = fc.record({
    id: fc.uuid(),
    type: fc.record({
      id: fc.constantFrom('peony', 'meteor', 'heart', 'fortune', 'redEnvelope'),
      name: fc.string(),
      particleCount: fc.nat({ max: 200 }),
      colors: fc.array(hexColorArbitrary, { minLength: 1, maxLength: 5 }),
      pattern: fc.constantFrom('peony', 'meteor', 'heart', 'fortune', 'redEnvelope'),
      duration: fc.integer({ min: 2000, max: 3000 }),
    }),
    x: fc.nat({ max: 1920 }),
    y: fc.nat({ max: 1080 }),
    startTime: fc.nat(),
    particles: fc.array(
      fc.record({
        x: fc.float(),
        y: fc.float(),
        vx: fc.float({ min: -10, max: 10 }),
        vy: fc.float({ min: -10, max: 10 }),
        color: hexColorArbitrary,
        alpha: fc.float({ min: 0, max: 1 }),
        size: fc.nat({ max: 10 }),
      }),
      { maxLength: 50 }
    ),
    state: fc.constantFrom('launching', 'exploding', 'fading', 'complete'),
  });

  /**
   * 生成随机连击状态
   */
  const comboStateArbitrary = fc.record({
    count: fc.nat({ max: 100 }),
    lastClickTime: fc.nat(),
    isActive: fc.boolean(),
    multiplier: fc.integer({ min: 1, max: 5 }),
  });

  /**
   * 生成随机统计数据（限制范围以提高测试性能）
   */
  const statisticsArbitrary = fc.record({
    totalClicks: fc.nat({ max: 100 }), // 降低上限以提高性能
    maxCombo: fc.nat({ max: 100 }),
    unlockedFireworks: fc.array(
      fc.constantFrom('peony', 'meteor', 'heart', 'fortune', 'redEnvelope'),
      { maxLength: 5 }
    ),
  });

  it('should reset game mode to menu for any initial game state', () => {
    fc.assert(
      fc.property(gameModeArbitrary, (initialMode) => {
        const store = createTestStore();

        // 设置初始模式
        if (initialMode !== 'menu') {
          store.dispatch(setMode(initialMode));
        }

        // 验证初始状态
        expect(store.getState().game.mode).toBe(initialMode);

        // 执行重置
        store.dispatch(resetGame());

        // 验证：模式应该重置为 'menu'
        expect(store.getState().game.mode).toBe('menu');
      }),
      { numRuns: 100 }
    );
  });

  it('should clear countdown for any countdown state', () => {
    fc.assert(
      fc.property(countdownTimeArbitrary, (countdown) => {
        const store = createTestStore();

        // 设置倒计时
        store.dispatch(updateCountdown(countdown));

        // 验证倒计时已设置
        expect(store.getState().game.countdown).toEqual(countdown);

        // 执行重置
        store.dispatch(resetGame());

        // 验证：倒计时应该被清除
        expect(store.getState().game.countdown).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it('should clear all fireworks for any firework state', () => {
    fc.assert(
      fc.property(
        fc.array(fireworkInstanceArbitrary, { minLength: 1, maxLength: 10 }),
        (fireworks) => {
          const store = createTestStore();

          // 添加烟花
          fireworks.forEach((firework) => {
            store.dispatch(addFirework(firework));
          });

          // 验证烟花已添加
          expect(store.getState().game.fireworks.length).toBe(fireworks.length);

          // 执行重置
          store.dispatch(resetGame());

          // 验证：烟花列表应该被清空
          expect(store.getState().game.fireworks).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reset combo state for any combo state', () => {
    fc.assert(
      fc.property(comboStateArbitrary, (combo) => {
        const store = createTestStore();

        // 设置连击状态
        store.dispatch(updateCombo(combo));

        // 验证连击状态已设置
        expect(store.getState().game.combo).toEqual(combo);

        // 执行重置
        store.dispatch(resetGame());

        // 验证：连击状态应该重置为初始值
        const resetCombo = store.getState().game.combo;
        expect(resetCombo.count).toBe(0);
        expect(resetCombo.lastClickTime).toBe(0);
        expect(resetCombo.isActive).toBe(false);
        expect(resetCombo.multiplier).toBe(1);
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve statistics data after reset', () => {
    fc.assert(
      fc.property(statisticsArbitrary, (stats) => {
        const store = createTestStore();

        // 设置统计数据（优化：批量操作而非循环）
        for (let i = 0; i < stats.totalClicks; i++) {
          store.dispatch(recordClick());
        }
        if (stats.maxCombo > 0) {
          store.dispatch(recordCombo(stats.maxCombo));
        }
        stats.unlockedFireworks.forEach((firework) => {
          store.dispatch(unlockFirework(firework));
        });

        // 获取重置前的统计数据
        const statsBefore = store.getState().statistics;

        // 执行游戏重置
        store.dispatch(resetGame());

        // 获取重置后的统计数据
        const statsAfter = store.getState().statistics;

        // 验证：统计数据应该被保留（不受游戏重置影响）
        expect(statsAfter.totalClicks).toBe(statsBefore.totalClicks);
        expect(statsAfter.maxCombo).toBe(statsBefore.maxCombo);
        expect(statsAfter.unlockedFireworks).toEqual(statsBefore.unlockedFireworks);
      }),
      { numRuns: 100 }
    );
  });

  it('should reset to equivalent initial state for any complex game state', () => {
    fc.assert(
      fc.property(
        fc.record({
          mode: gameModeArbitrary,
          countdown: fc.option(countdownTimeArbitrary, { nil: null }),
          fireworks: fc.array(fireworkInstanceArbitrary, { maxLength: 5 }),
          combo: comboStateArbitrary,
        }),
        (gameState) => {
          const store = createTestStore();

          // 设置复杂的游戏状态
          if (gameState.mode !== 'menu') {
            store.dispatch(setMode(gameState.mode));
          }
          if (gameState.countdown) {
            store.dispatch(updateCountdown(gameState.countdown));
          }
          gameState.fireworks.forEach((firework) => {
            store.dispatch(addFirework(firework));
          });
          store.dispatch(updateCombo(gameState.combo));

          // 执行重置
          store.dispatch(resetGame());

          // 验证：所有游戏状态应该恢复到初始值
          const resetState = store.getState().game;
          expect(resetState.mode).toBe('menu');
          expect(resetState.countdown).toBeNull();
          expect(resetState.fireworks).toEqual([]);
          expect(resetState.combo.count).toBe(0);
          expect(resetState.combo.lastClickTime).toBe(0);
          expect(resetState.combo.isActive).toBe(false);
          expect(resetState.combo.multiplier).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be idempotent - multiple resets produce same result', () => {
    fc.assert(
      fc.property(
        fc.record({
          mode: gameModeArbitrary,
          countdown: fc.option(countdownTimeArbitrary, { nil: null }),
          fireworks: fc.array(fireworkInstanceArbitrary, { maxLength: 3 }),
        }),
        (gameState) => {
          const store = createTestStore();

          // 设置游戏状态
          if (gameState.mode !== 'menu') {
            store.dispatch(setMode(gameState.mode));
          }
          if (gameState.countdown) {
            store.dispatch(updateCountdown(gameState.countdown));
          }
          gameState.fireworks.forEach((firework) => {
            store.dispatch(addFirework(firework));
          });

          // 第一次重置
          store.dispatch(resetGame());
          const stateAfterFirstReset = store.getState().game;

          // 第二次重置
          store.dispatch(resetGame());
          const stateAfterSecondReset = store.getState().game;

          // 验证：多次重置应该产生相同结果（幂等性）
          expect(stateAfterSecondReset).toEqual(stateAfterFirstReset);
          expect(stateAfterSecondReset.mode).toBe('menu');
          expect(stateAfterSecondReset.countdown).toBeNull();
          expect(stateAfterSecondReset.fireworks).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain state consistency after reset and new game start', () => {
    fc.assert(
      fc.property(
        fc.record({
          initialMode: gameModeArbitrary,
          newMode: fc.constantFrom<GameMode>('single', 'multiplayer'),
        }),
        ({ initialMode, newMode }) => {
          const store = createTestStore();

          // 设置初始模式
          if (initialMode !== 'menu') {
            store.dispatch(setMode(initialMode));
          }

          // 执行重置
          store.dispatch(resetGame());

          // 验证重置后状态
          expect(store.getState().game.mode).toBe('menu');

          // 开始新游戏
          store.dispatch(setMode(newMode));

          // 验证：新游戏应该正确启动
          expect(store.getState().game.mode).toBe(newMode);
          expect(store.getState().game.countdown).toBeNull();
          expect(store.getState().game.fireworks).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge case of resetting already reset state', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const store = createTestStore();

        // 初始状态已经是重置状态
        const initialState = store.getState().game;

        // 执行重置
        store.dispatch(resetGame());

        // 验证：重置已重置的状态应该保持不变
        const stateAfterReset = store.getState().game;
        expect(stateAfterReset.mode).toBe(initialState.mode);
        expect(stateAfterReset.countdown).toBe(initialState.countdown);
        expect(stateAfterReset.fireworks).toEqual(initialState.fireworks);
        expect(stateAfterReset.combo).toEqual(initialState.combo);
      }),
      { numRuns: 100 }
    );
  });

  it('should ensure reset state matches initial state structure', () => {
    fc.assert(
      fc.property(
        fc.record({
          mode: gameModeArbitrary,
          fireworkCount: fc.nat({ max: 10 }),
        }),
        ({ mode, fireworkCount }) => {
          const store = createTestStore();

          // 创建一个参考store来获取初始状态
          const referenceStore = createTestStore();
          const expectedInitialState = referenceStore.getState().game;

          // 修改测试store的状态
          if (mode !== 'menu') {
            store.dispatch(setMode(mode));
          }
          for (let i = 0; i < fireworkCount; i++) {
            store.dispatch(
              addFirework({
                id: `firework-${i}`,
                type: {
                  id: 'peony',
                  name: 'Peony',
                  particleCount: 100,
                  colors: ['#ff0000'],
                  pattern: 'peony',
                  duration: 2000,
                },
                x: 100,
                y: 100,
                startTime: Date.now(),
                particles: [],
                state: 'launching',
              })
            );
          }

          // 执行重置
          store.dispatch(resetGame());

          // 验证：重置后的状态应该与初始状态结构完全一致
          const resetState = store.getState().game;
          expect(resetState.mode).toBe(expectedInitialState.mode);
          expect(resetState.countdown).toBe(expectedInitialState.countdown);
          expect(resetState.fireworks).toEqual(expectedInitialState.fireworks);
          expect(resetState.combo).toEqual(expectedInitialState.combo);
        }
      ),
      { numRuns: 100 }
    );
  });
});
