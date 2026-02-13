/**
 * Button Component Usage Examples
 * 
 * This file demonstrates all the variants, sizes, and states of the Button component.
 * Use this as a reference for implementing buttons throughout the application.
 */

import React from 'react';
import { Button } from './Button';

export const ButtonExamples: React.FC = () => {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Variants */}
      <section>
        <h2>Variants</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
        </div>
      </section>

      {/* Sizes */}
      <section>
        <h2>Sizes</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* States */}
      <section>
        <h2>States</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button>Normal</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </div>
      </section>

      {/* With Icons */}
      <section>
        <h2>With Icons</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button icon={<span>🎆</span>}>Start Game</Button>
          <Button variant="secondary" icon={<span>⚙️</span>}>
            Settings
          </Button>
          <Button variant="ghost" icon={<span>❌</span>}>
            Close
          </Button>
        </div>
      </section>

      {/* Combinations */}
      <section>
        <h2>Combinations</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="primary" size="lg" icon={<span>🎉</span>}>
            点击开始
          </Button>
          <Button variant="secondary" size="sm" icon={<span>🔇</span>}>
            静音
          </Button>
          <Button variant="danger" size="md" disabled>
            退出游戏
          </Button>
          <Button variant="ghost" size="lg" loading>
            加载中...
          </Button>
        </div>
      </section>

      {/* Real-world Examples */}
      <section>
        <h2>Real-world Examples</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          {/* Launch Screen */}
          <Button
            variant="primary"
            size="lg"
            icon={<span>🎆</span>}
            onClick={() => console.log('Start game')}
          >
            点击开始
          </Button>

          {/* Mode Selection */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              variant="secondary"
              onClick={() => console.log('Single player')}
            >
              单人模式
            </Button>
            <Button
              variant="secondary"
              onClick={() => console.log('Multiplayer')}
            >
              多人模式
            </Button>
          </div>

          {/* Game Controls */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              variant="ghost"
              size="sm"
              icon={<span>⚙️</span>}
              ariaLabel="设置"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<span>🔇</span>}
              ariaLabel="静音"
            />
            <Button
              variant="danger"
              size="sm"
              onClick={() => console.log('Exit')}
            >
              退出
            </Button>
          </div>

          {/* Game End */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              variant="primary"
              onClick={() => console.log('Play again')}
            >
              再玩一次
            </Button>
            <Button
              variant="ghost"
              onClick={() => console.log('Back to menu')}
            >
              返回菜单
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
