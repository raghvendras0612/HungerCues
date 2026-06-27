import { request } from './apiClient';
import type { DiaperChange } from '../types';

export const diaperService = {
  listDiapers: (babyId: number) => request<DiaperChange[]>(`/diapers/baby/${babyId}`),

  createDiaper: (payload: Omit<DiaperChange, 'id'>) =>
    request<DiaperChange>('/diapers/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteDiaper: (id: number) => request<{ status: string }>(`/diapers/${id}`, { method: 'DELETE' }),
};
