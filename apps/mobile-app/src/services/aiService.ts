import { request } from './apiClient';
import type { AIInsight, AIWeeklySummary } from '../types';

export const aiService = {
  getInsights: (babyId: number) => request<AIInsight>(`/ai/insights/${babyId}`, { method: 'POST' }),

  askQuestion: (babyId: number, question: string) =>
    request<{ answer: string }>(`/ai/ask/${babyId}`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),

  getWeeklySummary: (babyId: number) =>
    request<AIWeeklySummary>(`/ai/weekly-summary/${babyId}`, { method: 'POST' }),
};
