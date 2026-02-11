/**
 * 烟花收藏画廊组件测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FireworkGallery } from './FireworkGallery';
import * as fc from 'fast-check';

describe('FireworkGallery', () => {
  beforeEach(() => {
    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      globalAlpha: 1,
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
    })) as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Display Requirements', () => {
    it('should display all firework types (locked and unlocked)', () => {
      const unlockedFireworks = new Set(['peony', 'meteor']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={15}
        />
      );

      // 应该显示所有5种烟花类型
      expect(screen.getByText('牡丹型')).toBeInTheDocument();
      expect(screen.getByText('流星型')).toBeInTheDocument();
      expect(screen.getByText('心形')).toBeInTheDocument();
      expect(screen.getByText('福字型')).toBeInTheDocument();
      expect(screen.getByText('红包型')).toBeInTheDocument();
    });

    it('should show correct unlock status for each firework', () => {
      const unlockedFireworks = new Set(['peony', 'meteor']);
      
      const { container } = render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={15}
        />
      );

      const items = container.querySelectorAll('.gallery-item');
      expect(items).toHaveLength(5);

      // 检查解锁状态
      const unlockedItems = container.querySelectorAll('.gallery-item.unlocked');
      const lockedItems = container.querySelectorAll('.gallery-item.locked');
      
      expect(unlockedItems).toHaveLength(2); // peony, meteor
      expect(lockedItems).toHaveLength(3); // heart, fortune, redEnvelope
    });

    it('should display unlock statistics', () => {
      const unlockedFireworks = new Set(['peony', 'meteor', 'heart']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={75}
        />
      );

      expect(screen.getByText('已解锁：3 / 5')).toBeInTheDocument();
      expect(screen.getByText('总点击数：75')).toBeInTheDocument();
    });

    it('should show lock icon for locked fireworks', () => {
      const unlockedFireworks = new Set(['peony']);
      
      const { container } = render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={5}
        />
      );

      const lockedOverlays = container.querySelectorAll('.locked-overlay');
      expect(lockedOverlays.length).toBeGreaterThan(0);
    });
  });

  describe('Unlock Conditions and Progress', () => {
    it('should display correct unlock conditions for locked fireworks', () => {
      const unlockedFireworks = new Set(['peony']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={5}
        />
      );

      expect(screen.getByText('点击 10 次解锁')).toBeInTheDocument(); // meteor
      expect(screen.getByText('点击 50 次解锁')).toBeInTheDocument(); // heart
      expect(screen.getByText('点击 100 次解锁')).toBeInTheDocument(); // fortune
      expect(screen.getByText('点击 200 次解锁')).toBeInTheDocument(); // redEnvelope
    });

    it('should calculate correct unlock progress', () => {
      const unlockedFireworks = new Set(['peony']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={25} // 25/50 = 50% for heart
        />
      );

      // 检查进度文本
      const progressTexts = screen.getAllByText(/\d+%/);
      expect(progressTexts.length).toBeGreaterThan(0);
    });

    it('should show 100% progress for unlocked fireworks', () => {
      const unlockedFireworks = new Set(['peony', 'meteor']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={15}
        />
      );

      // 已解锁的烟花应该显示预览按钮而不是进度条
      expect(screen.getAllByText('预览动画')).toHaveLength(2);
    });

    it('should show default unlock condition for peony', () => {
      const unlockedFireworks = new Set<string>();
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={0}
        />
      );

      // 牡丹型应该显示"默认解锁"
      expect(screen.getByText('默认解锁')).toBeInTheDocument();
    });
  });

  describe('Preview Animation', () => {
    it('should show preview button for unlocked fireworks', () => {
      const unlockedFireworks = new Set(['peony', 'meteor']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={15}
        />
      );

      const previewButtons = screen.getAllByText('预览动画');
      expect(previewButtons).toHaveLength(2);
    });

    it('should not show preview button for locked fireworks', () => {
      const unlockedFireworks = new Set(['peony']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={5}
        />
      );

      // 只有1个已解锁的烟花，所以只有1个预览按钮
      const previewButtons = screen.getAllByText('预览动画');
      expect(previewButtons).toHaveLength(1);
    });

    it('should change button text when previewing', async () => {
      const unlockedFireworks = new Set(['peony']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={0}
        />
      );

      const previewButton = screen.getByText('预览动画');
      fireEvent.click(previewButton);

      // 按钮文本应该变为"预览中..."
      await waitFor(() => {
        expect(screen.getByText('预览中...')).toBeInTheDocument();
      });
    });

    it('should disable preview button while previewing', async () => {
      const unlockedFireworks = new Set(['peony']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={0}
        />
      );

      const previewButton = screen.getByText('预览动画') as HTMLButtonElement;
      fireEvent.click(previewButton);

      await waitFor(() => {
        const previewingButton = screen.getByText('预览中...') as HTMLButtonElement;
        expect(previewingButton.disabled).toBe(true);
      });
    });

    it('should not trigger preview for locked fireworks', () => {
      const unlockedFireworks = new Set(['peony']);
      
      const { container } = render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={5}
        />
      );

      // 尝试点击锁定的烟花项
      const lockedItems = container.querySelectorAll('.gallery-item.locked');
      expect(lockedItems.length).toBeGreaterThan(0);
      
      // 锁定的项不应该有预览按钮
      const lockedItem = lockedItems[0];
      const previewButton = lockedItem.querySelector('.preview-button');
      expect(previewButton).toBeNull();
    });
  });

  describe('Canvas Rendering', () => {
    it('should render canvas for each firework type', () => {
      const unlockedFireworks = new Set(['peony', 'meteor']);
      
      const { container } = render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={15}
        />
      );

      const canvases = container.querySelectorAll('.preview-canvas');
      expect(canvases).toHaveLength(5); // 所有5种烟花都有画布
    });

    it('should set correct canvas dimensions', () => {
      const unlockedFireworks = new Set(['peony']);
      
      const { container } = render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={0}
        />
      );

      const canvas = container.querySelector('.preview-canvas') as HTMLCanvasElement;
      expect(canvas.width).toBe(200);
      expect(canvas.height).toBe(200);
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      const unlockedFireworks = new Set(['peony']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={0}
          onClose={onClose}
        />
      );

      const closeButton = screen.getByLabelText('关闭画廊');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not crash if onClose is not provided', () => {
      const unlockedFireworks = new Set(['peony']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={0}
        />
      );

      const closeButton = screen.getByLabelText('关闭画廊');
      
      // 不应该抛出错误
      expect(() => fireEvent.click(closeButton)).not.toThrow();
    });
  });

  describe('Gallery Completeness - Property 22', () => {
    /**
     * 属性 22：收藏画廊完整性
     * 对于任何玩家的已解锁烟花集合，收藏画廊显示的烟花应该与该集合完全一致
     * **验证需求：7.4**
     */
    it('should display exactly the unlocked fireworks from the set', () => {
      const unlockedFireworks = new Set(['peony', 'meteor', 'heart']);
      
      const { container } = render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={60}
        />
      );

      // 检查解锁的烟花数量
      const unlockedItems = container.querySelectorAll('.gallery-item.unlocked');
      expect(unlockedItems).toHaveLength(unlockedFireworks.size);

      // 检查每个解锁的烟花都有预览按钮
      const previewButtons = screen.getAllByText('预览动画');
      expect(previewButtons).toHaveLength(unlockedFireworks.size);
    });

    it('should match unlocked count with statistics display', () => {
      const unlockedFireworks = new Set(['peony', 'meteor', 'heart', 'fortune']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={150}
        />
      );

      // 统计显示应该与实际解锁数量一致
      expect(screen.getByText(`已解锁：${unlockedFireworks.size} / 5`)).toBeInTheDocument();
    });

    it('should show all fireworks as locked when set is empty', () => {
      const unlockedFireworks = new Set<string>();
      
      const { container } = render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={0}
        />
      );

      const lockedItems = container.querySelectorAll('.gallery-item.locked');
      expect(lockedItems).toHaveLength(5);
      
      expect(screen.getByText('已解锁：0 / 5')).toBeInTheDocument();
    });

    it('should show all fireworks as unlocked when all are in the set', () => {
      const unlockedFireworks = new Set(['peony', 'meteor', 'heart', 'fortune', 'redEnvelope']);
      
      const { container } = render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={250}
        />
      );

      const unlockedItems = container.querySelectorAll('.gallery-item.unlocked');
      expect(unlockedItems).toHaveLength(5);
      
      expect(screen.getByText('已解锁：5 / 5')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty unlocked set', () => {
      const unlockedFireworks = new Set<string>();
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={0}
        />
      );

      expect(screen.getByText('已解锁：0 / 5')).toBeInTheDocument();
    });

    it('should handle zero total clicks', () => {
      const unlockedFireworks = new Set(['peony']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={0}
        />
      );

      expect(screen.getByText('总点击数：0')).toBeInTheDocument();
    });

    it('should handle very large click counts', () => {
      const unlockedFireworks = new Set(['peony', 'meteor', 'heart', 'fortune', 'redEnvelope']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={999999}
        />
      );

      expect(screen.getByText('总点击数：999999')).toBeInTheDocument();
    });

    it('should handle progress calculation at exact milestone', () => {
      const unlockedFireworks = new Set(['peony']);
      
      render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={50} // Exactly at heart milestone
        />
      );

      // 应该显示100%进度
      const progressTexts = screen.getAllByText('100%');
      expect(progressTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should render gallery grid', () => {
      const unlockedFireworks = new Set(['peony']);
      
      const { container } = render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={0}
        />
      );

      const grid = container.querySelector('.gallery-grid');
      expect(grid).toBeInTheDocument();
    });

    it('should have proper CSS classes for styling', () => {
      const unlockedFireworks = new Set(['peony']);
      
      const { container } = render(
        <FireworkGallery
          unlockedFireworks={unlockedFireworks}
          totalClicks={0}
        />
      );

      expect(container.querySelector('.firework-gallery-overlay')).toBeInTheDocument();
      expect(container.querySelector('.firework-gallery')).toBeInTheDocument();
      expect(container.querySelector('.gallery-header')).toBeInTheDocument();
      expect(container.querySelector('.gallery-stats')).toBeInTheDocument();
    });
  });

  describe('Property-Based Tests', () => {
    // Feature: new-year-fireworks-game, Property 22: 收藏画廊完整性
    describe('Property 22: Gallery Completeness Integrity', () => {
      /**
       * 属性 22：收藏画廊完整性
       * 对于任何玩家的已解锁烟花集合,收藏画廊显示的烟花应该与该集合完全一致
       * **验证需求：7.4**
       */
      
      // 所有可用的烟花类型
      const ALL_FIREWORK_IDS = ['peony', 'meteor', 'heart', 'fortune', 'redEnvelope'];

      // 生成随机的已解锁烟花集合
      const unlockedFireworksArbitrary = fc.array(
        fc.constantFrom(...ALL_FIREWORK_IDS),
        { minLength: 0, maxLength: ALL_FIREWORK_IDS.length }
      ).map(arr => new Set(arr));

      // 生成随机的点击次数
      const totalClicksArbitrary = fc.integer({ min: 0, max: 1000 });

      it('should display exactly the number of unlocked fireworks from the set', () => {
        fc.assert(
          fc.property(unlockedFireworksArbitrary, totalClicksArbitrary, (unlockedFireworks, totalClicks) => {
            const { container, unmount } = render(
              <FireworkGallery
                unlockedFireworks={unlockedFireworks}
                totalClicks={totalClicks}
              />
            );

            try {
              // 验证：显示的已解锁烟花数量应该等于集合大小
              const unlockedItems = container.querySelectorAll('.gallery-item.unlocked');
              expect(unlockedItems).toHaveLength(unlockedFireworks.size);

              // 验证：统计显示应该与实际解锁数量一致
              const statsElements = screen.getAllByText(`已解锁：${unlockedFireworks.size} / ${ALL_FIREWORK_IDS.length}`);
              expect(statsElements.length).toBeGreaterThan(0);
            } finally {
              unmount();
            }
          }),
          { numRuns: 100 }
        );
      });

      it('should show preview buttons only for unlocked fireworks', () => {
        fc.assert(
          fc.property(unlockedFireworksArbitrary, totalClicksArbitrary, (unlockedFireworks, totalClicks) => {
            const { unmount } = render(
              <FireworkGallery
                unlockedFireworks={unlockedFireworks}
                totalClicks={totalClicks}
              />
            );

            try {
              // 验证：预览按钮数量应该等于已解锁烟花数量
              if (unlockedFireworks.size > 0) {
                const previewButtons = screen.getAllByText('预览动画');
                expect(previewButtons).toHaveLength(unlockedFireworks.size);
              } else {
                // 如果没有解锁任何烟花，不应该有预览按钮
                expect(screen.queryByText('预览动画')).toBeNull();
              }
            } finally {
              unmount();
            }
          }),
          { numRuns: 100 }
        );
      });

      it('should show locked state for fireworks not in the unlocked set', () => {
        fc.assert(
          fc.property(unlockedFireworksArbitrary, totalClicksArbitrary, (unlockedFireworks, totalClicks) => {
            const { container, unmount } = render(
              <FireworkGallery
                unlockedFireworks={unlockedFireworks}
                totalClicks={totalClicks}
              />
            );

            try {
              // 验证：锁定的烟花数量 = 总数 - 已解锁数量
              const lockedItems = container.querySelectorAll('.gallery-item.locked');
              const expectedLockedCount = ALL_FIREWORK_IDS.length - unlockedFireworks.size;
              expect(lockedItems).toHaveLength(expectedLockedCount);

              // 验证：锁定的烟花应该显示锁定图标
              if (expectedLockedCount > 0) {
                const lockedOverlays = container.querySelectorAll('.locked-overlay');
                expect(lockedOverlays.length).toBeGreaterThan(0);
              }
            } finally {
              unmount();
            }
          }),
          { numRuns: 100 }
        );
      });

      it('should maintain total firework count regardless of unlock state', () => {
        fc.assert(
          fc.property(unlockedFireworksArbitrary, totalClicksArbitrary, (unlockedFireworks, totalClicks) => {
            const { container, unmount } = render(
              <FireworkGallery
                unlockedFireworks={unlockedFireworks}
                totalClicks={totalClicks}
              />
            );

            try {
              // 验证：总烟花项数量应该始终等于所有烟花类型数量
              const allItems = container.querySelectorAll('.gallery-item');
              expect(allItems).toHaveLength(ALL_FIREWORK_IDS.length);

              // 验证：已解锁 + 锁定 = 总数
              const unlockedItems = container.querySelectorAll('.gallery-item.unlocked');
              const lockedItems = container.querySelectorAll('.gallery-item.locked');
              expect(unlockedItems.length + lockedItems.length).toBe(ALL_FIREWORK_IDS.length);
            } finally {
              unmount();
            }
          }),
          { numRuns: 100 }
        );
      });

      it('should correctly identify each firework unlock state', () => {
        fc.assert(
          fc.property(unlockedFireworksArbitrary, totalClicksArbitrary, (unlockedFireworks, totalClicks) => {
            const { container, unmount } = render(
              <FireworkGallery
                unlockedFireworks={unlockedFireworks}
                totalClicks={totalClicks}
              />
            );

            try {
              // 验证：每个烟花的解锁状态应该与集合中的状态一致
              ALL_FIREWORK_IDS.forEach(fireworkId => {
                const isUnlocked = unlockedFireworks.has(fireworkId);
                const items = container.querySelectorAll('.gallery-item');
                
                // 找到对应的烟花项（通过索引）
                const index = ALL_FIREWORK_IDS.indexOf(fireworkId);
                const item = items[index];
                
                if (isUnlocked) {
                  expect(item.classList.contains('unlocked')).toBe(true);
                  expect(item.classList.contains('locked')).toBe(false);
                } else {
                  expect(item.classList.contains('locked')).toBe(true);
                  expect(item.classList.contains('unlocked')).toBe(false);
                }
              });
            } finally {
              unmount();
            }
          }),
          { numRuns: 100 }
        );
      });

      it('should display consistent unlock count across all UI elements', () => {
        fc.assert(
          fc.property(unlockedFireworksArbitrary, totalClicksArbitrary, (unlockedFireworks, totalClicks) => {
            const { container, unmount } = render(
              <FireworkGallery
                unlockedFireworks={unlockedFireworks}
                totalClicks={totalClicks}
              />
            );

            try {
              // 验证：统计文本中的解锁数量
              const statsElements = screen.getAllByText(`已解锁：${unlockedFireworks.size} / ${ALL_FIREWORK_IDS.length}`);
              expect(statsElements.length).toBeGreaterThan(0);

              // 验证：实际显示的已解锁项数量
              const unlockedItems = container.querySelectorAll('.gallery-item.unlocked');
              expect(unlockedItems).toHaveLength(unlockedFireworks.size);

              // 验证：预览按钮数量（如果有已解锁的烟花）
              if (unlockedFireworks.size > 0) {
                const previewButtons = screen.getAllByText('预览动画');
                expect(previewButtons).toHaveLength(unlockedFireworks.size);
              }

              // 这三个数量应该完全一致
              expect(unlockedItems.length).toBe(unlockedFireworks.size);
            } finally {
              unmount();
            }
          }),
          { numRuns: 100 }
        );
      });

      it('should handle edge case of empty unlocked set', () => {
        fc.assert(
          fc.property(totalClicksArbitrary, (totalClicks) => {
            const emptySet = new Set<string>();
            const { container, unmount } = render(
              <FireworkGallery
                unlockedFireworks={emptySet}
                totalClicks={totalClicks}
              />
            );

            try {
              // 验证：所有烟花都应该是锁定状态
              const lockedItems = container.querySelectorAll('.gallery-item.locked');
              expect(lockedItems).toHaveLength(ALL_FIREWORK_IDS.length);

              // 验证：不应该有预览按钮
              expect(screen.queryByText('预览动画')).toBeNull();

              // 验证：统计显示0个已解锁
              const statsElements = screen.getAllByText('已解锁：0 / 5');
              expect(statsElements.length).toBeGreaterThan(0);
            } finally {
              unmount();
            }
          }),
          { numRuns: 100 }
        );
      });

      it('should handle edge case of all fireworks unlocked', () => {
        fc.assert(
          fc.property(totalClicksArbitrary, (totalClicks) => {
            const allUnlocked = new Set(ALL_FIREWORK_IDS);
            const { container, unmount } = render(
              <FireworkGallery
                unlockedFireworks={allUnlocked}
                totalClicks={totalClicks}
              />
            );

            try {
              // 验证：所有烟花都应该是解锁状态
              const unlockedItems = container.querySelectorAll('.gallery-item.unlocked');
              expect(unlockedItems).toHaveLength(ALL_FIREWORK_IDS.length);

              // 验证：不应该有锁定的烟花
              const lockedItems = container.querySelectorAll('.gallery-item.locked');
              expect(lockedItems).toHaveLength(0);

              // 验证：应该有5个预览按钮
              const previewButtons = screen.getAllByText('预览动画');
              expect(previewButtons).toHaveLength(ALL_FIREWORK_IDS.length);

              // 验证：统计显示全部已解锁
              const statsElements = screen.getAllByText('已解锁：5 / 5');
              expect(statsElements.length).toBeGreaterThan(0);
            } finally {
              unmount();
            }
          }),
          { numRuns: 100 }
        );
      });
    });
  });
});
