import { request } from './apiClient';
import type { SleepSession } from '../types';

export const sleepService = {
  listSleep: (babyId: number) => request<SleepSession[]>(`/sleep/baby/${babyId}`),

  createSleep: (payload: Omit<SleepSession, 'id'>) =>
    request<SleepSession>('/sleep/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteSleep: (id: number) => request<{ status: string }>(`/sleep/${id}`, { method: 'DELETE' }),
};
