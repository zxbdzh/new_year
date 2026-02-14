/**
 * CountdownDisplay组件单元测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CountdownDisplay } from './CountdownDisplay';
import { CountdownEngine } from '../engines/CountdownEngine';
import type { CountdownConfig } from '../types';

describe('CountdownDisplay', () => {
  let engine: CountdownEngine;
  let config: CountdownConfig;

  beforeEach(() => {
    // 创建测试用的倒计时引擎
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 2); // 2小时后
    
    config = {
      targetDate,
      timezone: 'Asia/Shanghai',
      manualOffset: 0
    };
    
    engine = new CountdownEngine(config);
  });

  afterEach(() => {
    engine.destroy();
  });

  it('应该渲染倒计时显示', () => {
    render(<CountdownDisplay engine={engine} />);
    
    // 检查是否显示了时间单位标签
    expect(screen.getByText('天')).toBeInTheDocument();
    expect(screen.getByText('小时')).toBeInTheDocument();
    expect(screen.getByText('分钟')).toBeInTheDocument();
    expect(screen.getByText('秒')).toBeInTheDocument();
  });

  it('应该显示格式化的时间值（两位数）', () => {
    render(<CountdownDisplay engine={engine} />);
    
    // 获取所有时间值元素
    const timeValues = screen.getAllByText(/^\d{2}$/);
    
    // 应该有4个时间值（天、小时、分钟、秒）
    expect(timeValues.length).toBeGreaterThanOrEqual(4);
  });

  it('当剩余时间少于1小时时应该应用紧急样式', async () => {
    // 创建一个剩余时间少于1小时的引擎
    const targetDate = new Date();
    targetDate.setMinutes(targetDate.getMinutes() + 30); // 30分钟后
    
    const urgentConfig: CountdownConfig = {
      targetDate,
      timezone: 'Asia/Shanghai',
      manualOffset: 0
    };
    
    const urgentEngine = new CountdownEngine(urgentConfig);
    
    render(<CountdownDisplay engine={urgentEngine} />);
    
    // 等待状态更新
    await waitFor(() => {
      const container = document.querySelector('.countdown-container');
      expect(container).toHaveClass('urgent');
    });
    
    urgentEngine.destroy();
  });

  it('当倒计时归零时应该调用回调函数', async () => {
    // 创建一个已经归零的引擎
    const targetDate = new Date();
    targetDate.setSeconds(targetDate.getSeconds() - 1); // 1秒前
    
    const zeroConfig: CountdownConfig = {
      targetDate,
      timezone: 'Asia/Shanghai',
      manualOffset: 0
    };
    
    const zeroEngine = new CountdownEngine(zeroConfig);
    const onCountdownZero = vi.fn();
    
    render(<CountdownDisplay engine={zeroEngine} onCountdownZero={onCountdownZero} />);
    
    // 等待回调被调用
    await waitFor(() => {
      expect(onCountdownZero).toHaveBeenCalled();
    }, { timeout: 2000 });
    
    zeroEngine.destroy();
  });

  it('应该在组件卸载时清理资源', () => {
    const { unmount } = render(<CountdownDisplay engine={engine} />);
    
    const stopSpy = vi.spyOn(engine, 'stop');
    
    unmount();
    
    expect(stopSpy).toHaveBeenCalled();
  });

  it('应该显示时间分隔符', () => {
    render(<CountdownDisplay engine={engine} />);
    
    // 应该有3个分隔符（天:小时:分钟:秒）
    const separators = screen.getAllByText(':');
    expect(separators).toHaveLength(3);
  });

  it('应该正确格式化个位数为两位数', () => {
    // 创建一个剩余时间很短的引擎
    const targetDate = new Date();
    targetDate.setSeconds(targetDate.getSeconds() + 5); // 5秒后
    
    const shortConfig: CountdownConfig = {
      targetDate,
      timezone: 'Asia/Shanghai',
      manualOffset: 0
    };
    
    const shortEngine = new CountdownEngine(shortConfig);
    
    render(<CountdownDisplay engine={shortEngine} />);
    
    // 检查是否有两位数格式的时间值
    const timeValues = document.querySelectorAll('.time-value');
    timeValues.forEach(value => {
      expect(value.textContent).toMatch(/^\d{2}$/);
    });
    
    shortEngine.destroy();
  });
});
