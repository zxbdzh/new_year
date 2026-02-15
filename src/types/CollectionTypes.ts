/**
 * 烟花收藏系统类型定义
 * Feature: firework-collection-system
 */

/**
 * 烟花收藏项
 */
export interface FireworkCollectionItem {
  /** 烟花类型ID */
  id: string;
  /** 烟花名称 */
  name: string;
  /** 是否已解锁 */
  unlocked: boolean;
  /** 解锁时间戳 */
  unlockedAt?: number;
  /** 使用次数 */
  usageCount: number;
  /** 稀有度 */
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  /** 描述 */
  description: string;
  /** 解锁条件描述 */
  unlockCondition: string;
}

/**
 * 烟花收藏数据
 */
export interface FireworkCollection {
  /** 收藏项列表 */
  items: Map<string, FireworkCollectionItem>;
  /** 总解锁数量 */
  totalUnlocked: number;
  /** 总数量 */
  totalCount: number;
}
