import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'zarmani_auth_token';
const BASE_URL = 'https://api.zarmani108.uk/api/v1';

export const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

axiosClient.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const status = error.response?.status;
        const data = error.response?.data;
        
        if (status === 401 || status === 403) {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        }

        let errorMessage = data?.message || 'ချိတ်ဆက်မှု မအောင်မြင်ပါ။';
        if (status === 422 && data?.errors) {
            const firstKey = Object.keys(data.errors)[0];
            errorMessage = data.errors[firstKey][0];
        }
        
        error.customMessage = errorMessage;
        return Promise.reject(error);
    }
);