import { create } from 'zustand';

interface NotiState {
  unreadCount: number;
  increaseCount: () => void;
  clearCount: () => void;
}

export const useNotiStore = create<NotiState>((set) => ({
  unreadCount: 0,
  increaseCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  clearCount: () => set({ unreadCount: 0 }),
}));