/**
 * Date formatting utilities for Croatian locale
 * Uses date-fns with Croatian locale support
 */

import { format, formatDistanceToNow } from 'date-fns';
import { hr } from 'date-fns/locale';

/**
 * Format date as dd.MM.yyyy
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd.MM.yyyy', { locale: hr });
};

/**
 * Format time as HH:mm (24-hour format)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'HH:mm', { locale: hr });
};

/**
 * Format date and time as dd.MM.yyyy HH:mm
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date-time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: hr });
};

/**
 * Format relative time (e.g., "prije 2 sata")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string in Croatian
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { locale: hr, addSuffix: true });
};
