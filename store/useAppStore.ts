import { create } from 'zustand';
import { getMyWallet, getNotificationStats } from '../api/main';

interface AppState {
    wallet: any | null;
    walletLoading: boolean;
    notificationStats: any | null;
    refreshWallet: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
    clearUnreadCount: () => void; 
}

export const useAppStore = create<AppState>((set) => ({
    wallet: null,
    walletLoading: true,
    notificationStats: null,

    refreshWallet: async () => {
        try {
            const response = await getMyWallet();
            set({ wallet: response.data?.wallet || null, walletLoading: false });
        } catch (error: any) {
            set({ wallet: null, walletLoading: false });
        }
    },

    refreshNotifications: async () => {
        try {
            const response = await getNotificationStats();
            set({ notificationStats: response.data || null });
        } catch (error) {
        }
    },

    clearUnreadCount: () => set((state) => ({
        notificationStats: state.notificationStats 
            ? { ...state.notificationStats, unread: 0 } 
            : { unread: 0 }
    }))
}));