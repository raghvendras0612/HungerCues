import { request } from './apiClient';
import type { GrowthRecord } from '../types';

export const growthService = {
  listGrowth: (babyId: number) => request<GrowthRecord[]>(`/growth/baby/${babyId}`),

  createGrowth: (payload: Omit<GrowthRecord, 'id'>) =>
    request<GrowthRecord>('/growth/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteGrowth: (id: number) => request<{ status: string }>(`/growth/${id}`, { method: 'DELETE' }),
};
