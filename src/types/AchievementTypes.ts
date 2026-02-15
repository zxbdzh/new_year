/**
 * 成就系统类型定义
 * Feature: achievement-system
 */

/**
 * 成就类型
 */
export type AchievementType = 
  | 'clicks' // 点击次数
  | 'combo' // 连击
  | 'collection' // 收藏
  | 'playtime' // 游戏时长
  | 'special'; // 特殊成就

/**
 * 成就等级
 */
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

/**
 * 成就定义
 */
export interface Achievement {
  /** 成就ID */
  id: string;
  /** 成就名称 */
  name: string;
  /** 成就描述 */
  description: string;
  /** 成就类型 */
  type: AchievementType;
  /** 成就等级 */
  tier: AchievementTier;
  /** 目标值 */
  target: number;
  /** 当前进度 */
  progress: number;
  /** 是否已解锁 */
  unlocked: boolean;
  /** 解锁时间戳 */
  unlockedAt?: number;
  /** 图标 */
  icon: string;
  /** 奖励描述 */
  reward?: string;
}

/**
 * 成就数据
 */
export interface AchievementData {
  /** 成就列表 */
  achievements: Map<string, Achievement>;
  /** 总解锁数量 */
  totalUnlocked: number;
  /** 总数量 */
  totalCount: number;
}
