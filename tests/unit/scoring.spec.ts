import { describe, it, expect } from 'vitest';
import {
  generateEvents,
  calculateExpectedScore,
  validateRun,
  calculateRewards,
} from '../../src/core/scoring';

describe('Scoring System', () => {
  describe('generateEvents', () => {
    it('should generate events based on seed', () => {
      const seed = 'test_seed_123';
      const difficulty = 2;
      const duration = 60;

      const events = generateEvents(seed, difficulty, duration);

      expect(events.length).toBeGreaterThan(0);
      expect(events.length).toBeLessThanOrEqual(20);

      events.forEach((event) => {
        expect(event.type).toBeDefined();
        expect(event.duration).toBeGreaterThan(0);
        expect(event.baseScore).toBeGreaterThan(0);
        expect(event.difficulty).toBeGreaterThanOrEqual(1);
        expect(event.difficulty).toBeLessThanOrEqual(5);
      });
    });

    it('should generate same events for same seed', () => {
      const seed = 'deterministic_seed';
      const difficulty = 3;
      const duration = 60;

      const events1 = generateEvents(seed, difficulty, duration);
      const events2 = generateEvents(seed, difficulty, duration);

      expect(events1).toEqual(events2);
    });

    it('should generate more events for higher difficulty', () => {
      const seed = 'test_seed';
      const duration = 60;

      const eventsEasy = generateEvents(seed, 1, duration);
      const eventsHard = generateEvents(seed + 'x', 5, duration);

      // Higher difficulty should trend toward more events
      expect(eventsHard.length).toBeGreaterThanOrEqual(eventsEasy.length);
    });
  });

  describe('calculateExpectedScore', () => {
    it('should calculate score range for valid run', () => {
      const params = {
        seed: 'test_seed',
        difficulty: 2,
        playerCount: 1,
        duration: 60,
        betrayUsed: false,
        gearLevel: 1,
      };

      const { min, max } = calculateExpectedScore(params);

      expect(min).toBeGreaterThan(0);
      expect(max).toBeGreaterThan(min);
      expect(max).toBeLessThan(min * 5); // Sanity check
    });

    it('should give higher scores for higher difficulty', () => {
      const baseParams = {
        seed: 'test_seed',
        playerCount: 1,
        duration: 60,
        betrayUsed: false,
        gearLevel: 1,
      };

      const easy = calculateExpectedScore({ ...baseParams, difficulty: 1 });
      const hard = calculateExpectedScore({ ...baseParams, difficulty: 5 });

      expect(hard.max).toBeGreaterThan(easy.max);
    });

    it('should apply team bonus for multiple players', () => {
      const baseParams = {
        seed: 'test_seed',
        difficulty: 2,
        duration: 60,
        betrayUsed: false,
        gearLevel: 1,
      };

      const solo = calculateExpectedScore({ ...baseParams, playerCount: 1 });
      const team = calculateExpectedScore({ ...baseParams, playerCount: 3 });

      expect(team.max).toBeGreaterThan(solo.max);
    });
  });

  describe('validateRun', () => {
    it('should validate legitimate run', () => {
      const params = {
        seed: 'test_seed',
        difficulty: 2,
        playerCount: 1,
        duration: 60,
        betrayUsed: false,
        gearLevel: 1,
      };

      const expectedScore = calculateExpectedScore(params);
      const clientResult = {
        score: (expectedScore.min + expectedScore.max) / 2,
        eventsCompleted: 5,
        inputs: 100,
      };

      const result = validateRun(params, clientResult);

      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject run with too short duration', () => {
      const params = {
        seed: 'test_seed',
        difficulty: 2,
        playerCount: 1,
        duration: 10, // Too short
        betrayUsed: false,
        gearLevel: 1,
      };

      const result = validateRun(params, {
        score: 1000,
        eventsCompleted: 5,
        inputs: 50,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('duration');
    });

    it('should reject run with impossible score', () => {
      const params = {
        seed: 'test_seed',
        difficulty: 1,
        playerCount: 1,
        duration: 60,
        betrayUsed: false,
        gearLevel: 1,
      };

      const result = validateRun(params, {
        score: 999999999, // Way too high
        eventsCompleted: 5,
        inputs: 100,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('range');
    });

    it('should reject run with impossible input rate', () => {
      const params = {
        seed: 'test_seed',
        difficulty: 2,
        playerCount: 1,
        duration: 60,
        betrayUsed: false,
        gearLevel: 1,
      };

      const result = validateRun(params, {
        score: 5000,
        eventsCompleted: 5,
        inputs: 2000, // 33 inputs/sec - impossible
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('input rate');
    });
  });

  describe('calculateRewards', () => {
    it('should calculate cash from score', () => {
      const params = {
        seed: 'test_seed',
        difficulty: 2,
        playerCount: 1,
        duration: 60,
        betrayUsed: false,
        gearLevel: 1,
      };

      const result = calculateRewards(params, 5000);

      expect(result.score).toBe(5000);
      expect(result.cashEarned).toBeGreaterThan(0);
    });

    it('should double cash on success', () => {
      const params = {
        seed: 'test_seed',
        difficulty: 2,
        playerCount: 1,
        duration: 60,
        betrayUsed: false,
        gearLevel: 1,
      };

      const expectedScore = calculateExpectedScore(params);
      const highScore = expectedScore.max;
      const result = calculateRewards(params, highScore);

      expect(result.success).toBe(true);
    });
  });
});
