/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity } from '../types';

export const addDaysToDate = (dateStr: string, days: number): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0];
};

export const getDaysDiff = (start: string, end: string): number => {
  if (!start || !end) return 0;
  const date1 = new Date(start);
  const date2 = new Date(end);
  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return 0;
  date1.setUTCHours(0, 0, 0, 0);
  date2.setUTCHours(0, 0, 0, 0);
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const fmt = (num: number): string => (num ? num.toFixed(1) : "0.0");

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID').format(date);
};

export const calculateMetrics = (activities: Activity[], targetDate: string) => {
  if (!activities || activities.length === 0) {
    return { plannedDays: 0, actualDays: 0, achievement: 0, overdueCount: 0 };
  }

  let totalPlannedDays = 0;
  let totalActualDays = 0;
  let overdueCount = 0;
  const cutOffObj = new Date(targetDate);
  cutOffObj.setHours(0, 0, 0, 0);

  activities.forEach(item => {
    const duration = getDaysDiff(item.start, item.end);
    const startObj = new Date(item.start);
    startObj.setHours(0, 0, 0, 0);
    const endObj = new Date(item.end);
    endObj.setHours(0, 0, 0, 0);

    let plannedDaysItem = 0;
    if (cutOffObj >= endObj) {
      plannedDaysItem = duration;
    } else if (cutOffObj >= startObj) {
      plannedDaysItem = getDaysDiff(item.start, targetDate);
    }
    
    totalPlannedDays += Math.max(0, plannedDaysItem);
    totalActualDays += (item.actualDays || 0);

    if (duration > 0 && item.actualDays > 0) {
      if (item.actualDays > duration) {
        overdueCount += (item.actualDays - duration);
      }
    }
  });

  let achievement = 0;
  if (totalActualDays > 0) {
    achievement = (totalPlannedDays / totalActualDays) * 100;
  } else if (totalPlannedDays === 0) {
    achievement = 100; // If nothing planned and nothing done, we're at 100% of the void?
  }

  return { plannedDays: totalPlannedDays, actualDays: totalActualDays, achievement: Math.min(achievement, 100), overdueCount };
};
