import { request } from './apiClient';
import type { Feeding } from '../types';

export const feedingService = {
  listFeedings: (babyId: number) => request<Feeding[]>(`/feedings/baby/${babyId}`),

  createFeeding: (payload: Omit<Feeding, 'id'>) =>
    request<Feeding>('/feedings/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteFeeding: (id: number) =>
    request<{ status: string }>(`/feedings/${id}`, { method: 'DELETE' }),
};
