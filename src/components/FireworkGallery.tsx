/**
 * 烟花收藏画廊组件
 * Feature: firework-collection-system
 * 
 * 展示已解锁和未解锁的烟花收藏
 */

import React from 'react';
import type { FireworkCollectionItem } from '../types/CollectionTypes';
import { Button } from './Button';
import './FireworkGallery.css';

interface FireworkGalleryProps {
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 收藏项列表 */
  items: FireworkCollectionItem[];
}

/**
 * 稀有度颜色映射
 */
const rarityColors: Record<string, string> = {
  common: '#9E9E9E',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800'
};

/**
 * 稀有度名称映射
 */
const rarityNames: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说'
};

/**
 * 烟花收藏画廊组件
 */
export const FireworkGallery: React.FC<FireworkGalleryProps> = ({
  isOpen,
  onClose,
  items
}) => {
  if (!isOpen) {
    return null;
  }

  const unlockedCount = items.filter(item => item.unlocked).length;
  const totalCount = items.length;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div className="gallery-overlay" onClick={onClose}>
      <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gallery-header">
          <h2>✨ 烟花收藏</h2>
          <button className="close-button" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        <div className="gallery-progress">
          <div className="progress-info">
            <span>收藏进度</span>
            <span className="progress-count">{unlockedCount} / {totalCount}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="gallery-content">
          <div className="gallery-grid">
            {items.map((item) => (
              <div 
                key={item.id}
                className={`gallery-item ${item.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div 
                  className="item-card"
                  style={{ 
                    borderColor: item.unlocked ? rarityColors[item.rarity] : undefined 
                  }}
                >
                  {/* 稀有度标签 */}
                  <div 
                    className="rarity-badge"
                    style={{ 
                      backgroundColor: rarityColors[item.rarity],
                      opacity: item.unlocked ? 1 : 0.3
                    }}
                  >
                    {rarityNames[item.rarity]}
                  </div>

                  {/* 烟花预览 */}
                  <div className="item-preview">
                    {item.unlocked ? (
                      <div className="firework-icon">🎆</div>
                    ) : (
                      <div className="locked-icon">🔒</div>
                    )}
                  </div>

                  {/* 烟花信息 */}
                  <div className="item-info">
                    <h3 className="item-name">
                      {item.unlocked ? item.name : '???'}
                    </h3>
                    <p className="item-description">
                      {item.unlocked ? item.description : '未解锁'}
                    </p>
                    
                    {item.unlocked ? (
                      <div className="item-stats">
                        <span className="stat-label">使用次数:</span>
                        <span className="stat-value">{item.usageCount}</span>
                      </div>
                    ) : (
                      <div className="unlock-condition">
                        <span className="condition-label">解锁条件:</span>
                        <span className="condition-text">{item.unlockCondition}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gallery-footer">
          <Button variant="primary" onClick={onClose}>
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
};
