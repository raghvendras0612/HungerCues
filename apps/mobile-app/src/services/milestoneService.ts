import { request } from './apiClient';
import type { Milestone } from '../types';

export const milestoneService = {
  listMilestones: (babyId: number) => request<Milestone[]>(`/milestones/baby/${babyId}`),

  createMilestone: (payload: Omit<Milestone, 'id'>) =>
    request<Milestone>('/milestones/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateMilestone: (id: number, payload: Partial<Omit<Milestone, 'id' | 'baby_id' | 'name'>>) =>
    request<Milestone>(`/milestones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteMilestone: (id: number) =>
    request<{ status: string }>(`/milestones/${id}`, { method: 'DELETE' }),
};
