/**
 * 烟花收藏画廊组件
 * Feature: new-year-fireworks-game
 * 
 * 显示所有已解锁和未解锁的烟花样式
 * 需求：4.1, 7.4
 */

import { useEffect, useRef, useState } from 'react';
import { FireworksEngine } from '../engines/FireworksEngine';
import './FireworkGallery.css';

interface FireworkGalleryProps {
  /** 已解锁的烟花ID集合 */
  unlockedFireworks: Set<string>;
  /** 总点击次数（用于显示解锁进度） */
  totalClicks: number;
  /** 关闭画廊的回调 */
  onClose?: () => void;
}

/** 里程碑配置（与StatisticsTracker保持一致） */
const MILESTONES = [
  { clicks: 0, fireworkId: 'peony', name: '牡丹型' },
  { clicks: 10, fireworkId: 'meteor', name: '流星型' },
  { clicks: 50, fireworkId: 'heart', name: '心形' },
  { clicks: 100, fireworkId: 'fortune', name: '福字型' },
  { clicks: 200, fireworkId: 'redEnvelope', name: '红包型' },
];

/**
 * 烟花收藏画廊组件
 */
export function FireworkGallery({
  unlockedFireworks,
  totalClicks,
  onClose,
}: FireworkGalleryProps) {
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const enginesRef = useRef<Map<string, FireworksEngine>>(new Map());
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  // 初始化预览引擎
  useEffect(() => {
    // 清理旧引擎
    enginesRef.current.forEach(engine => engine.destroy());
    enginesRef.current.clear();

    // 为每个已解锁的烟花创建预览引擎
    unlockedFireworks.forEach(fireworkId => {
      const canvas = canvasRefs.current.get(fireworkId);
      if (canvas) {
        const engine = new FireworksEngine(canvas);
        enginesRef.current.set(fireworkId, engine);
      }
    });

    return () => {
      // 组件卸载时清理所有引擎
      enginesRef.current.forEach(engine => engine.destroy());
      enginesRef.current.clear();
    };
  }, [unlockedFireworks]);

  // 处理烟花预览
  const handlePreview = (fireworkId: string) => {
    if (!unlockedFireworks.has(fireworkId)) return;

    const engine = enginesRef.current.get(fireworkId);
    const canvas = canvasRefs.current.get(fireworkId);
    
    if (engine && canvas) {
      setPreviewingId(fireworkId);
      
      // 在画布中心发射烟花
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      engine.launchFirework(centerX, centerY, fireworkId);

      // 2秒后重置预览状态
      setTimeout(() => {
        setPreviewingId(null);
      }, 2000);
    }
  };

  // 计算解锁进度
  const getUnlockProgress = (fireworkId: string): number => {
    const milestone = MILESTONES.find(m => m.fireworkId === fireworkId);
    if (!milestone || milestone.clicks === 0) return 100;
    
    if (totalClicks >= milestone.clicks) return 100;
    return Math.floor((totalClicks / milestone.clicks) * 100);
  };

  // 获取解锁条件文本
  const getUnlockCondition = (fireworkId: string): string => {
    const milestone = MILESTONES.find(m => m.fireworkId === fireworkId);
    if (!milestone) return '未知条件';
    if (milestone.clicks === 0) return '默认解锁';
    return `点击 ${milestone.clicks} 次解锁`;
  };

  return (
    <div className="firework-gallery-overlay">
      <div className="firework-gallery">
        <div className="gallery-header">
          <h2>烟花收藏画廊</h2>
          <button className="close-button" onClick={onClose} aria-label="关闭画廊">
            ✕
          </button>
        </div>

        <div className="gallery-stats">
          <p>已解锁：{unlockedFireworks.size} / {MILESTONES.length}</p>
          <p>总点击数：{totalClicks}</p>
        </div>

        <div className="gallery-grid">
          {MILESTONES.map(milestone => {
            const isUnlocked = unlockedFireworks.has(milestone.fireworkId);
            const progress = getUnlockProgress(milestone.fireworkId);
            const isPreviewing = previewingId === milestone.fireworkId;

            return (
              <div
                key={milestone.fireworkId}
                className={`gallery-item ${isUnlocked ? 'unlocked' : 'locked'} ${
                  isPreviewing ? 'previewing' : ''
                }`}
              >
                <div className="item-preview">
                  <canvas
                    ref={el => {
                      if (el) canvasRefs.current.set(milestone.fireworkId, el);
                    }}
                    width={200}
                    height={200}
                    className="preview-canvas"
                  />
                  {!isUnlocked && <div className="locked-overlay">🔒</div>}
                </div>

                <div className="item-info">
                  <h3>{milestone.name}</h3>
                  
                  {isUnlocked ? (
                    <button
                      className="preview-button"
                      onClick={() => handlePreview(milestone.fireworkId)}
                      disabled={isPreviewing}
                    >
                      {isPreviewing ? '预览中...' : '预览动画'}
                    </button>
                  ) : (
                    <div className="unlock-info">
                      <p className="unlock-condition">
                        {getUnlockCondition(milestone.fireworkId)}
                      </p>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="progress-text">{progress}%</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
