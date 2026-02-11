/**
 * 性能优化器单元测试
 * Feature: new-year-fireworks-game
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import type { PerformanceLevel } from '../types/PerformanceTypes';

describe('PerformanceOptimizer', () => {
  let optimizer: PerformanceOptimizer;

  beforeEach(() => {
    optimizer = new PerformanceOptimizer();
  });

  describe('detectPerformance', () => {
    it('should detect performance level on initialization', () => {
      const profile = optimizer.getProfile();
      expect(profile).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(profile.level);
    });

    it('should return valid profile with all required properties', () => {
      const profile = optimizer.getProfile();
      expect(profile.level).toBeDefined();
      expect(profile.maxParticles).toBeGreaterThan(0);
      expect(profile.maxFireworks).toBeGreaterThan(0);
      expect(typeof profile.useWebGL).toBe('boolean');
      expect(profile.particleSize).toBeGreaterThan(0);
      expect(typeof profile.enableGlow).toBe('boolean');
      expect(typeof profile.enableTrails).toBe('boolean');
    });

    it('should set correct values for low profile', () => {
      optimizer.setProfile({
        level: 'low',
        maxParticles: 50,
        maxFireworks: 3,
        useWebGL: false,
        particleSize: 2,
        enableGlow: false,
        enableTrails: false,
      });

      const profile = optimizer.getProfile();
      expect(profile.level).toBe('low');
      expect(profile.maxParticles).toBe(50);
      expect(profile.maxFireworks).toBe(3);
      expect(profile.useWebGL).toBe(false);
    });

    it('should set correct values for medium profile', () => {
      optimizer.setProfile({
        level: 'medium',
        maxParticles: 100,
        maxFireworks: 5,
        useWebGL: false,
        particleSize: 3,
        enableGlow: true,
        enableTrails: false,
      });

      const profile = optimizer.getProfile();
      expect(profile.level).toBe('medium');
      expect(profile.maxParticles).toBe(100);
      expect(profile.maxFireworks).toBe(5);
      expect(profile.enableGlow).toBe(true);
    });

    it('should set correct values for high profile', () => {
      optimizer.setProfile({
        level: 'high',
        maxParticles: 200,
        maxFireworks: 10,
        useWebGL: true,
        particleSize: 4,
        enableGlow: true,
        enableTrails: true,
      });

      const profile = optimizer.getProfile();
      expect(profile.level).toBe('high');
      expect(profile.maxParticles).toBe(200);
      expect(profile.maxFireworks).toBe(10);
      expect(profile.useWebGL).toBe(true);
      expect(profile.enableTrails).toBe(true);
    });
  });

  describe('FPS monitoring', () => {
    it('should return 0 FPS when no frames recorded', () => {
      expect(optimizer.getAverageFPS()).toBe(0);
    });

    it('should calculate average FPS correctly', () => {
      // Simulate 60 FPS (16.67ms per frame)
      let time = 0;
      for (let i = 0; i < 10; i++) {
        time += 16.67;
        optimizer.updateFPS(time);
      }

      const avgFPS = optimizer.getAverageFPS();
      expect(avgFPS).toBeGreaterThan(55);
      expect(avgFPS).toBeLessThan(65);
    });

    it('should calculate average FPS for 30 FPS', () => {
      // Simulate 30 FPS (33.33ms per frame)
      let time = 0;
      for (let i = 0; i < 10; i++) {
        time += 33.33;
        optimizer.updateFPS(time);
      }

      const avgFPS = optimizer.getAverageFPS();
      expect(avgFPS).toBeGreaterThan(25);
      expect(avgFPS).toBeLessThan(35);
    });

    it('should maintain FPS history within size limit', () => {
      // Record more than 60 frames
      let time = 0;
      for (let i = 0; i < 100; i++) {
        time += 16.67;
        optimizer.updateFPS(time);
      }

      // Should still calculate average (history is capped at 60)
      const avgFPS = optimizer.getAverageFPS();
      expect(avgFPS).toBeGreaterThan(0);
    });

    it('should reset FPS history', () => {
      let time = 0;
      for (let i = 0; i < 10; i++) {
        time += 16.67;
        optimizer.updateFPS(time);
      }

      expect(optimizer.getAverageFPS()).toBeGreaterThan(0);

      optimizer.resetFPS();
      expect(optimizer.getAverageFPS()).toBe(0);
    });
  });

  describe('dynamic quality adjustment', () => {
    it('should degrade quality when FPS is low', () => {
      // Set to high profile
      optimizer.setProfile({
        level: 'high',
        maxParticles: 200,
        maxFireworks: 10,
        useWebGL: true,
        particleSize: 4,
        enableGlow: true,
        enableTrails: true,
      });

      // Simulate low FPS (20 FPS = 50ms per frame)
      let time = 0;
      for (let i = 0; i < 40; i++) {
        time += 50;
        optimizer.updateFPS(time);
      }

      optimizer.adjustProfile();

      const profile = optimizer.getProfile();
      expect(profile.level).toBe('medium');
    });

    it('should upgrade quality when FPS is high', () => {
      // Set to low profile
      optimizer.setProfile({
        level: 'low',
        maxParticles: 50,
        maxFireworks: 3,
        useWebGL: false,
        particleSize: 2,
        enableGlow: false,
        enableTrails: false,
      });

      // Simulate high FPS (60 FPS = 16.67ms per frame)
      let time = 0;
      for (let i = 0; i < 40; i++) {
        time += 16.67;
        optimizer.updateFPS(time);
      }

      optimizer.adjustProfile();

      const profile = optimizer.getProfile();
      expect(profile.level).toBe('medium');
    });

    it('should not adjust with insufficient FPS data', () => {
      const initialProfile = optimizer.getProfile();
      const initialLevel = initialProfile.level;

      // Only a few frames
      let time = 0;
      for (let i = 0; i < 5; i++) {
        time += 50;
        optimizer.updateFPS(time);
      }

      optimizer.adjustProfile();

      const profile = optimizer.getProfile();
      expect(profile.level).toBe(initialLevel);
    });

    it('should not degrade below low profile', () => {
      optimizer.setProfile({
        level: 'low',
        maxParticles: 50,
        maxFireworks: 3,
        useWebGL: false,
        particleSize: 2,
        enableGlow: false,
        enableTrails: false,
      });

      // Simulate very low FPS
      let time = 0;
      for (let i = 0; i < 40; i++) {
        time += 100;
        optimizer.updateFPS(time);
      }

      optimizer.adjustProfile();

      const profile = optimizer.getProfile();
      expect(profile.level).toBe('low');
    });

    it('should not upgrade above high profile', () => {
      optimizer.setProfile({
        level: 'high',
        maxParticles: 200,
        maxFireworks: 10,
        useWebGL: true,
        particleSize: 4,
        enableGlow: true,
        enableTrails: true,
      });

      // Simulate very high FPS
      let time = 0;
      for (let i = 0; i < 40; i++) {
        time += 10;
        optimizer.updateFPS(time);
      }

      optimizer.adjustProfile();

      const profile = optimizer.getProfile();
      expect(profile.level).toBe('high');
    });
  });

  describe('manual profile setting', () => {
    it('should allow manual profile setting', () => {
      const customProfile = {
        level: 'medium' as PerformanceLevel,
        maxParticles: 75,
        maxFireworks: 4,
        useWebGL: false,
        particleSize: 3,
        enableGlow: true,
        enableTrails: false,
      };

      optimizer.setProfile(customProfile);

      const profile = optimizer.getProfile();
      expect(profile.level).toBe('medium');
      expect(profile.maxParticles).toBe(75);
      expect(profile.maxFireworks).toBe(4);
    });

    it('should reset FPS history when setting profile', () => {
      // Record some FPS data
      let time = 0;
      for (let i = 0; i < 10; i++) {
        time += 16.67;
        optimizer.updateFPS(time);
      }

      expect(optimizer.getAverageFPS()).toBeGreaterThan(0);

      // Set new profile
      optimizer.setProfile({
        level: 'low',
        maxParticles: 50,
        maxFireworks: 3,
        useWebGL: false,
        particleSize: 2,
        enableGlow: false,
        enableTrails: false,
      });

      // FPS should be reset
      expect(optimizer.getAverageFPS()).toBe(0);
    });

    it('should return a copy of profile to prevent external modification', () => {
      const profile1 = optimizer.getProfile();
      profile1.maxParticles = 999;

      const profile2 = optimizer.getProfile();
      expect(profile2.maxParticles).not.toBe(999);
    });
  });
});
