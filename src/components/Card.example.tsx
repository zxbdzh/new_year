/**
 * Card Component Examples
 * 
 * This file demonstrates various Card component configurations
 * Used for visual testing and documentation
 */

import React from 'react';
import { Card } from './Card';

export const CardExamples: React.FC = () => {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ color: 'white' }}>Card Component Examples</h1>
      
      {/* Variants */}
      <section>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Variants</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Card variant="default">
            <h3>Default Card</h3>
            <p>半透明背景 + 背景模糊效果</p>
          </Card>
          
          <Card variant="elevated">
            <h3>Elevated Card</h3>
            <p>更强的阴影和模糊效果</p>
          </Card>
          
          <Card variant="outlined">
            <h3>Outlined Card</h3>
            <p>金色边框强调</p>
          </Card>
        </div>
      </section>

      {/* Padding Sizes */}
      <section>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Padding Sizes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Card padding="sm">
            <h3>Small Padding</h3>
            <p>16px 内边距</p>
          </Card>
          
          <Card padding="md">
            <h3>Medium Padding</h3>
            <p>24px 内边距（默认）</p>
          </Card>
          
          <Card padding="lg">
            <h3>Large Padding</h3>
            <p>32px 内边距</p>
          </Card>
        </div>
      </section>

      {/* Hoverable Cards */}
      <section>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Hoverable Cards</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Card variant="default" hoverable>
            <h3>Hoverable Default</h3>
            <p>悬停时提升 + 金色发光</p>
          </Card>
          
          <Card variant="elevated" hoverable>
            <h3>Hoverable Elevated</h3>
            <p>悬停时更强的提升效果</p>
          </Card>
          
          <Card variant="outlined" hoverable>
            <h3>Hoverable Outlined</h3>
            <p>悬停时边框变亮</p>
          </Card>
        </div>
      </section>

      {/* Clickable Cards */}
      <section>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Clickable Cards</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Card 
            variant="default" 
            onClick={() => alert('Default card clicked!')}
            ariaLabel="点击默认卡片"
          >
            <h3>🎮 单人模式</h3>
            <p>收集烟花样式，追踪游戏统计</p>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                background: 'rgba(255, 215, 0, 0.2)', 
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}>
                离线可玩
              </span>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                background: 'rgba(255, 215, 0, 0.2)', 
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}>
                成就系统
              </span>
            </div>
          </Card>
          
          <Card 
            variant="elevated" 
            onClick={() => alert('Elevated card clicked!')}
            ariaLabel="点击多人模式卡片"
          >
            <h3>👥 多人模式</h3>
            <p>与朋友一起燃放烟花</p>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                background: 'rgba(255, 215, 0, 0.2)', 
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}>
                最多20人
              </span>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                background: 'rgba(255, 215, 0, 0.2)', 
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}>
                实时同步
              </span>
            </div>
          </Card>
          
          <Card 
            variant="outlined" 
            onClick={() => alert('Outlined card clicked!')}
            ariaLabel="点击设置卡片"
          >
            <h3>⚙️ 设置</h3>
            <p>调整音频、图形和游戏设置</p>
          </Card>
        </div>
      </section>

      {/* Complex Content */}
      <section>
        <h2 style={{ color: 'white', marginBottom: '1rem' }}>Complex Content</h2>
        <Card variant="elevated" padding="lg">
          <h2 style={{ marginTop: 0 }}>🎆 游戏统计</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>128</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>燃放烟花</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>15</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>最高连击</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>5</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>解锁样式</div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
