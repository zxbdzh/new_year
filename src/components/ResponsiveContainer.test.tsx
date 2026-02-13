/**
 * ResponsiveContainer组件测试
 * Feature: ui-ux-redesign
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveContainer } from './ResponsiveContainer';

describe('ResponsiveContainer', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('should render children', () => {
    render(
      <ResponsiveContainer>
        <div>Test Content</div>
      </ResponsiveContainer>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply default classes', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Content</div>
      </ResponsiveContainer>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement.className).toContain('responsive-container');
    expect(containerElement.className).toContain('responsive-container--max-lg');
    expect(containerElement.className).toContain('responsive-container--padding-md');
    expect(containerElement.className).toContain('responsive-container--centered');
  });

  it('should apply custom maxWidth', () => {
    const { container } = render(
      <ResponsiveContainer maxWidth="sm">
        <div>Content</div>
      </ResponsiveContainer>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement.className).toContain('responsive-container--max-sm');
  });

  it('should apply custom padding', () => {
    const { container } = render(
      <ResponsiveContainer padding="lg">
        <div>Content</div>
      </ResponsiveContainer>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement.className).toContain('responsive-container--padding-lg');
  });

  it('should not center when centered is false', () => {
    const { container } = render(
      <ResponsiveContainer centered={false}>
        <div>Content</div>
      </ResponsiveContainer>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement.className).not.toContain('responsive-container--centered');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ResponsiveContainer className="custom-class">
        <div>Content</div>
      </ResponsiveContainer>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement.className).toContain('custom-class');
  });

  it('should have data-breakpoint attribute', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Content</div>
      </ResponsiveContainer>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveAttribute('data-breakpoint');
  });
});
