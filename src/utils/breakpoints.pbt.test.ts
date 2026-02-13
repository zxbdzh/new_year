/**
 * 响应式断点属性测试
 * Feature: ui-ux-redesign, Property 2: 响应式断点定义
 * 
 * **Validates: Requirements 2.1**
 * 
 * 属性：对于任何断点类型（mobile, tablet, desktop），相应的媒体查询应该在CSS中定义
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { BREAKPOINTS, MEDIA_QUERIES, getCurrentBreakpoint, type Breakpoint } from './constants';

describe('Property 2: Responsive Breakpoint Definitions', () => {
  /**
   * Property 2.1: 断点范围完整性
   * 验证所有断点都有有效的min和max值
   */
  it('Property 2.1: All breakpoints should have valid min and max values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Breakpoint>('mobile', 'tablet', 'desktop'),
        (breakpoint) => {
          const bp = BREAKPOINTS[breakpoint];
          
          // 属性1：min值应该是正整数
          expect(bp.min).toBeGreaterThan(0);
          expect(Number.isInteger(bp.min)).toBe(true);
          
          // 属性2：max值应该大于min值
          expect(bp.max).toBeGreaterThan(bp.min);
          
          // 属性3：min和max应该是有限数字（除了desktop的max可以是Infinity）
          expect(Number.isFinite(bp.min)).toBe(true);
          if (breakpoint !== 'desktop') {
            expect(Number.isFinite(bp.max)).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.2: 断点范围不重叠
   * 验证断点之间没有重叠，确保每个宽度只属于一个断点
   */
  it('Property 2.2: Breakpoint ranges should not overlap', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        (width) => {
          // 计算该宽度匹配的断点数量
          let matchCount = 0;
          
          if (width >= BREAKPOINTS.mobile.min && width <= BREAKPOINTS.mobile.max) {
            matchCount++;
          }
          if (width >= BREAKPOINTS.tablet.min && width <= BREAKPOINTS.tablet.max) {
            matchCount++;
          }
          if (width >= BREAKPOINTS.desktop.min && width <= BREAKPOINTS.desktop.max) {
            matchCount++;
          }
          
          // 属性：任何宽度应该恰好匹配一个断点
          expect(matchCount).toBe(1);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.3: 断点范围连续性
   * 验证断点之间是连续的，没有间隙
   */
  it('Property 2.3: Breakpoint ranges should be continuous', () => {
    // 属性：mobile的max + 1 应该等于 tablet的min
    expect(BREAKPOINTS.mobile.max + 1).toBe(BREAKPOINTS.tablet.min);
    
    // 属性：tablet的max + 1 应该等于 desktop的min
    expect(BREAKPOINTS.tablet.max + 1).toBe(BREAKPOINTS.desktop.min);
  });

  /**
   * Property 2.4: 断点顺序正确性
   * 验证断点按照从小到大的顺序定义
   */
  it('Property 2.4: Breakpoints should be ordered from smallest to largest', () => {
    // 属性：mobile.min < tablet.min < desktop.min
    expect(BREAKPOINTS.mobile.min).toBeLessThan(BREAKPOINTS.tablet.min);
    expect(BREAKPOINTS.tablet.min).toBeLessThan(BREAKPOINTS.desktop.min);
    
    // 属性：mobile.max < tablet.max < desktop.max
    expect(BREAKPOINTS.mobile.max).toBeLessThan(BREAKPOINTS.tablet.max);
    expect(BREAKPOINTS.tablet.max).toBeLessThan(BREAKPOINTS.desktop.max);
  });

  /**
   * Property 2.5: 媒体查询字符串格式正确性
   * 验证所有媒体查询字符串格式正确
   */
  it('Property 2.5: Media query strings should be correctly formatted', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<keyof typeof MEDIA_QUERIES>(
          'mobile',
          'tablet',
          'desktop',
          'touchDevice',
          'reducedMotion',
          'highContrast'
        ),
        (queryKey) => {
          const query = MEDIA_QUERIES[queryKey];
          
          // 属性1：媒体查询应该以@media开头
          expect(query).toMatch(/^@media/);
          
          // 属性2：媒体查询应该是非空字符串
          expect(query.length).toBeGreaterThan(0);
          
          // 属性3：媒体查询应该包含有效的CSS语法
          expect(query).toMatch(/@media\s+\(/);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.6: getCurrentBreakpoint函数一致性
   * 验证getCurrentBreakpoint函数对于任何宽度都返回正确的断点
   */
  it('Property 2.6: getCurrentBreakpoint should return correct breakpoint for any width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }),
        (width) => {
          const breakpoint = getCurrentBreakpoint(width);
          
          // 属性1：返回值应该是有效的断点类型
          expect(['mobile', 'tablet', 'desktop']).toContain(breakpoint);
          
          // 属性2：返回的断点应该与宽度范围匹配
          const bp = BREAKPOINTS[breakpoint];
          expect(width).toBeGreaterThanOrEqual(bp.min);
          expect(width).toBeLessThanOrEqual(bp.max);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.7: 边界值处理正确性
   * 验证断点边界值被正确处理
   */
  it('Property 2.7: Breakpoint boundaries should be handled correctly', () => {
    // 测试mobile的边界
    expect(getCurrentBreakpoint(BREAKPOINTS.mobile.min)).toBe('mobile');
    expect(getCurrentBreakpoint(BREAKPOINTS.mobile.max)).toBe('mobile');
    
    // 测试tablet的边界
    expect(getCurrentBreakpoint(BREAKPOINTS.tablet.min)).toBe('tablet');
    expect(getCurrentBreakpoint(BREAKPOINTS.tablet.max)).toBe('tablet');
    
    // 测试desktop的边界
    expect(getCurrentBreakpoint(BREAKPOINTS.desktop.min)).toBe('desktop');
    
    // 测试边界过渡
    expect(getCurrentBreakpoint(BREAKPOINTS.mobile.max + 1)).toBe('tablet');
    expect(getCurrentBreakpoint(BREAKPOINTS.tablet.max + 1)).toBe('desktop');
  });

  /**
   * Property 2.8: 断点最小宽度符合规范
   * 验证mobile断点的最小宽度为320px（符合需求2.1）
   */
  it('Property 2.8: Mobile breakpoint should start at 320px', () => {
    // 属性：mobile断点的最小宽度应该是320px
    expect(BREAKPOINTS.mobile.min).toBe(320);
  });

  /**
   * Property 2.9: 断点最大宽度符合规范
   * 验证断点的最大宽度符合需求2.1的定义
   */
  it('Property 2.9: Breakpoint max values should match requirements', () => {
    // 属性：mobile断点的最大宽度应该是767px
    expect(BREAKPOINTS.mobile.max).toBe(767);
    
    // 属性：tablet断点的最小宽度应该是768px
    expect(BREAKPOINTS.tablet.min).toBe(768);
    
    // 属性：tablet断点的最大宽度应该是1023px
    expect(BREAKPOINTS.tablet.max).toBe(1023);
    
    // 属性：desktop断点的最小宽度应该是1024px
    expect(BREAKPOINTS.desktop.min).toBe(1024);
  });

  /**
   * Property 2.10: 媒体查询与断点值一致性
   * 验证媒体查询字符串中的数值与BREAKPOINTS常量一致
   */
  it('Property 2.10: Media queries should match breakpoint values', () => {
    // 属性：mobile媒体查询应该包含正确的max-width值
    expect(MEDIA_QUERIES.mobile).toContain(`${BREAKPOINTS.mobile.max}px`);
    
    // 属性：tablet媒体查询应该包含正确的min-width和max-width值
    expect(MEDIA_QUERIES.tablet).toContain(`${BREAKPOINTS.tablet.min}px`);
    expect(MEDIA_QUERIES.tablet).toContain(`${BREAKPOINTS.tablet.max}px`);
    
    // 属性：desktop媒体查询应该包含正确的min-width值
    expect(MEDIA_QUERIES.desktop).toContain(`${BREAKPOINTS.desktop.min}px`);
  });

  /**
   * Property 2.11: 断点转换的单调性
   * 验证随着宽度增加，断点按照mobile -> tablet -> desktop的顺序转换
   */
  it('Property 2.11: Breakpoint transitions should be monotonic', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 320, max: 3840 }),
          fc.integer({ min: 320, max: 3840 })
        ).filter(([w1, w2]) => w1 < w2),
        ([width1, width2]) => {
          const bp1 = getCurrentBreakpoint(width1);
          const bp2 = getCurrentBreakpoint(width2);
          
          const order: Record<Breakpoint, number> = {
            mobile: 0,
            tablet: 1,
            desktop: 2,
          };
          
          // 属性：较大的宽度应该对应相同或更大的断点
          expect(order[bp2]).toBeGreaterThanOrEqual(order[bp1]);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.12: 断点覆盖完整性
   * 验证断点定义覆盖了所有常见的屏幕宽度
   */
  it('Property 2.12: Breakpoints should cover all common screen widths', () => {
    // 常见的屏幕宽度
    const commonWidths = [
      320,  // iPhone SE
      375,  // iPhone 6/7/8
      414,  // iPhone Plus
      768,  // iPad portrait
      1024, // iPad landscape
      1280, // Desktop
      1366, // Laptop
      1920, // Full HD
      2560, // 2K
      3840, // 4K
    ];

    commonWidths.forEach((width) => {
      const breakpoint = getCurrentBreakpoint(width);
      
      // 属性：每个常见宽度都应该匹配一个有效的断点
      expect(['mobile', 'tablet', 'desktop']).toContain(breakpoint);
    });
  });

  /**
   * Property 2.13: 断点类型不可变性
   * 验证BREAKPOINTS对象是只读的（通过as const定义）
   */
  it('Property 2.13: BREAKPOINTS should be immutable', () => {
    // 属性：尝试修改BREAKPOINTS应该失败（TypeScript编译时检查）
    // 这个测试主要验证类型定义的正确性
    
    // 运行时检查：BREAKPOINTS应该是对象
    expect(typeof BREAKPOINTS).toBe('object');
    expect(BREAKPOINTS).not.toBeNull();
    
    // 验证所有断点都存在
    expect(BREAKPOINTS).toHaveProperty('mobile');
    expect(BREAKPOINTS).toHaveProperty('tablet');
    expect(BREAKPOINTS).toHaveProperty('desktop');
  });

  /**
   * Property 2.14: 极端宽度处理
   * 验证函数能够正确处理极端的屏幕宽度
   */
  it('Property 2.14: Should handle extreme screen widths gracefully', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // 极小宽度
          fc.integer({ min: 1, max: 319 }),
          // 极大宽度
          fc.integer({ min: 4000, max: 10000 })
        ),
        (width) => {
          const breakpoint = getCurrentBreakpoint(width);
          
          // 属性：即使是极端宽度，也应该返回有效的断点
          expect(['mobile', 'tablet', 'desktop']).toContain(breakpoint);
          
          // 属性：小于320px的宽度应该返回mobile
          if (width < 320) {
            expect(breakpoint).toBe('mobile');
          }
          
          // 属性：大于1024px的宽度应该返回desktop
          if (width >= 1024) {
            expect(breakpoint).toBe('desktop');
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2.15: 媒体查询特殊类型有效性
   * 验证特殊媒体查询（touchDevice, reducedMotion, highContrast）格式正确
   */
  it('Property 2.15: Special media queries should be valid', () => {
    // 属性：touchDevice媒体查询应该检查hover和pointer
    expect(MEDIA_QUERIES.touchDevice).toContain('hover: none');
    expect(MEDIA_QUERIES.touchDevice).toContain('pointer: coarse');
    
    // 属性：reducedMotion媒体查询应该检查prefers-reduced-motion
    expect(MEDIA_QUERIES.reducedMotion).toContain('prefers-reduced-motion');
    
    // 属性：highContrast媒体查询应该检查prefers-contrast
    expect(MEDIA_QUERIES.highContrast).toContain('prefers-contrast');
  });
});
