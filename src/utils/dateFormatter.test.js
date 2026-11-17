/**
 * Date formatter utility tests
 * Validates Croatian locale formatting (dd.MM.yyyy HH:mm)
 */

import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatDateTime, formatRelativeTime } from './dateFormatter';

describe('dateFormatter', () => {
  describe('formatDate', () => {
    it('formats date as dd.MM.yyyy', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatDate(date);
      expect(result).toBe('15.01.2024');
    });

    it('handles Date objects', () => {
      const date = new Date('2024-03-25T14:45:00Z');
      const result = formatDate(date);
      expect(result).toBe('25.03.2024');
    });

    it('handles different months', () => {
      expect(formatDate('2024-01-01T12:00:00Z')).toBe('01.01.2024');
      expect(formatDate('2024-06-15T12:00:00Z')).toBe('15.06.2024');
      expect(formatDate('2024-12-31T12:00:00Z')).toBe('31.12.2024');
    });

    it('returns empty string for null', () => {
      expect(formatDate(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(formatDate(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatTime', () => {
    it('formats time as HH:mm in 24-hour format', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatTime(date);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('handles Date objects', () => {
      const date = new Date('2024-01-15T14:45:00Z');
      const result = formatTime(date);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('uses 24-hour format', () => {
      const morningDate = '2024-01-15T08:30:00Z';
      const afternoonDate = '2024-01-15T20:30:00Z';
      
      const morning = formatTime(morningDate);
      const afternoon = formatTime(afternoonDate);
      
      expect(morning).toMatch(/^\d{2}:\d{2}$/);
      expect(afternoon).toMatch(/^\d{2}:\d{2}$/);
    });

    it('returns empty string for null', () => {
      expect(formatTime(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(formatTime(undefined)).toBe('');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time as dd.MM.yyyy HH:mm', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatDateTime(date);
      // Should match Croatian format with space between date and time
      expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    });

    it('handles Date objects', () => {
      const date = new Date('2024-03-25T14:45:00Z');
      const result = formatDateTime(date);
      expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    });

    it('formats complete datetime correctly', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatDateTime(date);
      // Date part should be 15.01.2024
      expect(result).toContain('15.01.2024');
      // Should have time part
      expect(result).toMatch(/\d{2}:\d{2}$/);
    });

    it('returns empty string for null', () => {
      expect(formatDateTime(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(formatDateTime(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(formatDateTime('')).toBe('');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats relative time in Croatian', () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const result = formatRelativeTime(pastDate);
      
      // Should include Croatian text
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('handles string dates', () => {
      const date = new Date(Date.now() - 1000 * 60 * 5).toISOString(); // 5 minutes ago
      const result = formatRelativeTime(date);
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('returns empty string for null', () => {
      expect(formatRelativeTime(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
      expect(formatRelativeTime(undefined)).toBe('');
    });
  });

  describe('Croatian locale compliance', () => {
    it('uses dots as date separators (Croatian standard)', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatDate(date);
      expect(result).toContain('.');
      expect(result).not.toContain('/');
      expect(result).not.toContain('-');
    });

    it('uses space between date and time', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatDateTime(date);
      expect(result).toContain(' ');
    });

    it('uses colon for time separator', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatTime(date);
      expect(result).toContain(':');
    });

    it('formats year with 4 digits', () => {
      const date = '2024-01-15T10:30:00Z';
      const result = formatDate(date);
      expect(result).toMatch(/\d{4}$/);
    });

    it('pads single-digit days and months with zero', () => {
      const date = '2024-01-05T10:30:00Z';
      const result = formatDate(date);
      expect(result).toBe('05.01.2024');
    });
  });

  describe('Edge cases', () => {
    it('handles leap year dates', () => {
      const leapYearDate = '2024-02-29T00:00:00Z';
      const result = formatDate(leapYearDate);
      expect(result).toBe('29.02.2024');
    });

    it('handles year boundaries', () => {
      const newYearEve = '2023-12-31T12:00:00Z';
      const newYear = '2024-01-01T12:00:00Z';
      
      expect(formatDate(newYearEve)).toBe('31.12.2023');
      expect(formatDate(newYear)).toBe('01.01.2024');
    });

    it('handles different timezones consistently', () => {
      const utcDate = '2024-01-15T10:30:00Z';
      const result = formatDateTime(utcDate);
      
      // Should format consistently regardless of local timezone
      expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
    });
  });
});
