import { create } from 'zustand';

interface NotificationState {
  hasPermission: boolean;
  scheduledCount: number;
  setHasPermission: (has: boolean) => void;
  setScheduledCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  hasPermission: false,
  scheduledCount: 0,
  setHasPermission: (hasPermission) => set({ hasPermission }),
  setScheduledCount: (scheduledCount) => set({ scheduledCount }),
}));
