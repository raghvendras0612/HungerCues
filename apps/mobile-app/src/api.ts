/**
 * api.ts — Backwards-compatible re-export barrel.
 * All network logic now lives in src/services/*.
 * This file remains for compatibility and as a single import point.
 */
import { babyService } from './services/babyService';
import { feedingService } from './services/feedingService';
import { sleepService } from './services/sleepService';
import { diaperService } from './services/diaperService';
import { growthService } from './services/growthService';
import { milestoneService } from './services/milestoneService';
import { aiService } from './services/aiService';
import { notificationService } from './services/notificationService';

export type {
  Baby,
  Feeding,
  SleepSession,
  DiaperChange,
  GrowthRecord,
  AIInsight,
  Milestone,
  NotificationEntry,
  AIWeeklySummary,
} from './types';

export { API_BASE_URL } from './services/apiClient';
export { babyService } from './services/babyService';
export { feedingService } from './services/feedingService';
export { sleepService } from './services/sleepService';
export { diaperService } from './services/diaperService';
export { growthService } from './services/growthService';
export { milestoneService } from './services/milestoneService';
export { aiService } from './services/aiService';
export { notificationService } from './services/notificationService';

// Legacy aggregate `api` object — App.tsx continues to use this until screen extraction
export const api = {
  ...babyService,
  ...feedingService,
  ...sleepService,
  ...diaperService,
  ...growthService,
  ...milestoneService,
  ...aiService,
  ...notificationService,
};
