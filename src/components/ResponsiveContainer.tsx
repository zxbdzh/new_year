/**
 * 响应式容器组件
 * Feature: ui-ux-redesign
 * 
 * 提供响应式布局容器，根据断点自动调整样式
 */

import React from 'react';
import { useBreakpoint } from '../utils/ResponsiveLayout';
import './ResponsiveContainer.css';

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  centered?: boolean;
}

/**
 * 响应式容器组件
 * 
 * 根据当前断点自动调整容器样式，提供一致的布局体验
 * 
 * @example
 * ```tsx
 * <ResponsiveContainer maxWidth="lg" padding="md" centered>
 *   <h1>内容</h1>
 * </ResponsiveContainer>
 * ```
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'lg',
  padding = 'md',
  centered = true,
}) => {
  const breakpoint = useBreakpoint();

  const containerClasses = [
    'responsive-container',
    `responsive-container--${breakpoint}`,
    `responsive-container--max-${maxWidth}`,
    `responsive-container--padding-${padding}`,
    centered ? 'responsive-container--centered' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} data-breakpoint={breakpoint}>
      {children}
    </div>
  );
};
