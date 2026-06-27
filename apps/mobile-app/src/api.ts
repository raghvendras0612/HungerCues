/**
 * api.ts — Aggregate service barrel.
 * All network logic lives in src/services/*.
 * All domain types live in src/types/index.ts.
 *
 * Feature files should import directly from the relevant service:
 *   import { feedingService } from '../services/feedingService';
 *
 * App.tsx uses the `api` aggregate object for convenience.
 */
import { babyService } from './services/babyService';
import { feedingService } from './services/feedingService';
import { sleepService } from './services/sleepService';
import { diaperService } from './services/diaperService';
import { growthService } from './services/growthService';
import { milestoneService } from './services/milestoneService';
import { aiService } from './services/aiService';
import { notificationService } from './services/notificationService';

export { API_BASE_URL } from './services/apiClient';
export { babyService } from './services/babyService';
export { feedingService } from './services/feedingService';
export { sleepService } from './services/sleepService';
export { diaperService } from './services/diaperService';
export { growthService } from './services/growthService';
export { milestoneService } from './services/milestoneService';
export { aiService } from './services/aiService';
export { notificationService } from './services/notificationService';

/** Aggregate for App.tsx — do not use in feature files. */
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
