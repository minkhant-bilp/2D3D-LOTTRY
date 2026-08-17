import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { TOKEN_KEY } from '../api/axiosClient';

interface User {
    id: number;
    username: string | null;
    email: string;
    role: string | null;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isLoading: boolean; 
    setAuth: (token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isLoading: true, 

    setAuth: async (token, user) => {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        set({ token, user, isLoading: false });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        set({ token: null, user: null, isLoading: false });
    },

    checkAuth: async () => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token) {
                set({ token, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            set({ isLoading: false });
        }
    }
}));