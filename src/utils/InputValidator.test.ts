/**
 * 输入验证器属性测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { InputValidator } from './InputValidator';

describe('InputValidator - Property-Based Tests', () => {
  const validator = new InputValidator();

  // Feature: new-year-fireworks-game, Property 14: 昵称长度验证
  describe('Property 14: 昵称长度验证', () => {
    it('应该拒绝长度不在1-8个字符范围内的昵称', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ minLength: 9, maxLength: 100 }), // 超过8个字符
            fc.constant('') // 空字符串
          ),
          (nickname) => {
            const result = validator.validateNickname(nickname);
            // 对于长度不在1-8范围内的昵称，应该返回无效
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('应该接受长度在1-8个字符范围内的有效昵称', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 8 }).filter(s => 
            /^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(s)
          ),
          (nickname) => {
            const result = validator.validateNickname(nickname);
            // 对于长度在1-8范围内且字符有效的昵称，应该返回有效
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: new-year-fireworks-game, Property 24: 昵称字符验证
  describe('Property 24: 昵称字符验证', () => {
    it('应该拒绝包含非法字符的昵称', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 8 }).filter(s => 
            // 确保字符串包含至少一个非法字符
            /[^a-zA-Z0-9\u4e00-\u9fa5]/.test(s)
          ),
          (nickname) => {
            const result = validator.validateNickname(nickname);
            // 包含非法字符的昵称应该被拒绝
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('只能包含');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: new-year-fireworks-game, Property 25: 房间码格式验证
  describe('Property 25: 房间码格式验证', () => {
    it('应该拒绝不是恰好4位数字的房间码', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ minLength: 0, maxLength: 3 }), // 少于4位
            fc.string({ minLength: 5, maxLength: 10 }), // 多于4位
            fc.string({ minLength: 4, maxLength: 4 }).filter(s => !/^\d{4}$/.test(s)) // 4位但非数字
          ),
          (code) => {
            const result = validator.validateRoomCode(code);
            // 不符合4位数字格式的房间码应该被拒绝
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('应该接受恰好4位数字的房间码', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 9999 }).map(n => n.toString().padStart(4, '0')),
          (code) => {
            const result = validator.validateRoomCode(code);
            // 4位数字的房间码应该被接受
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: new-year-fireworks-game, Property 26: 验证失败错误消息
  describe('Property 26: 验证失败错误消息', () => {
    it('对于任何验证失败的输入，应该返回非空的错误消息', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // 无效昵称
            fc.string({ minLength: 9, maxLength: 20 }),
            fc.constant(''),
            fc.string({ minLength: 1, maxLength: 8 }).filter(s => 
              /[^a-zA-Z0-9\u4e00-\u9fa5]/.test(s)
            ),
            // 无效房间码
            fc.string({ minLength: 0, maxLength: 10 }).filter(s => 
              s.length !== 4 || !/^\d{4}$/.test(s)
            )
          ),
          (input) => {
            // 尝试作为昵称验证
            const nicknameResult = validator.validateNickname(input);
            if (!nicknameResult.valid) {
              expect(nicknameResult.error).toBeDefined();
              expect(nicknameResult.error).not.toBe('');
              expect(typeof nicknameResult.error).toBe('string');
            }
            
            // 尝试作为房间码验证
            const roomCodeResult = validator.validateRoomCode(input);
            if (!roomCodeResult.valid) {
              expect(roomCodeResult.error).toBeDefined();
              expect(roomCodeResult.error).not.toBe('');
              expect(typeof roomCodeResult.error).toBe('string');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // 坐标验证测试
  describe('坐标验证', () => {
    it('应该拒绝超出范围的坐标', () => {
      fc.assert(
        fc.property(
          fc.integer(),
          fc.integer(),
          fc.nat({ max: 1920 }),
          fc.nat({ max: 1080 }),
          (x, y, maxX, maxY) => {
            // 确保至少有一个坐标超出范围
            if ((x >= 0 && x <= maxX) && (y >= 0 && y <= maxY)) {
              return true; // 跳过有效坐标
            }
            
            const result = validator.validateCoordinates(x, y, maxX, maxY);
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('应该接受范围内的坐标', () => {
      fc.assert(
        fc.property(
          fc.nat({ max: 1920 }),
          fc.nat({ max: 1080 }),
          fc.nat({ max: 1920 }),
          fc.nat({ max: 1080 }),
          (maxX, maxY, x, y) => {
            // 确保x和y在范围内
            const validX = Math.min(x, maxX);
            const validY = Math.min(y, maxY);
            
            const result = validator.validateCoordinates(validX, validY, maxX, maxY);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
