import { request } from './apiClient';
import type { NotificationEntry } from '../types';

export const notificationService = {
  listRecentNotifications: () => request<NotificationEntry[]>('/notifications/recent'),

  clearNotifications: () => request<{ status: string }>('/notifications/clear', { method: 'POST' }),

  deleteNotification: (id: number) =>
    request<{ status: string }>(`/notifications/${id}`, { method: 'DELETE' }),

  registerDeviceToken: (payload: { fcm_token: string; baby_id: number }) =>
    request<{ status: string }>('/notifications/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
