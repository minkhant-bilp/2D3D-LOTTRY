import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/useAuthStore'; // 🌟 Zustand ခေါ်သုံးမည်
import { axiosClient, TOKEN_KEY } from './axiosClient';

export const getToken = async () => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const clearToken = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const loginUser = async (credentials: any) => {
    const response: any = await axiosClient.post('/login', credentials);
    
    if (response?.data?.token && response?.data?.user) {
        await useAuthStore.getState().setAuth(response.data.token, response.data.user);
    }
    return response.data;
};

export const registerUser = async (data: any) => {
    const response: any = await axiosClient.post('/register', data);
    
    if (response?.data?.token && response?.data?.user) {
        await useAuthStore.getState().setAuth(response.data.token, response.data.user);
    }
    return response.data;
};

export const setWalletCurrency = async (currency: 'MMK' | 'THB') => {
    const response: any = await axiosClient.put('/me/wallet/currency', { currency });
    return response.data;
};

export const setupBankInfo = async (data: any) => {
    const response: any = await axiosClient.post('/me/bank-info', data);
    return response.data;
};

export const verifyUser = async () => {
    const token = await getToken();
    
    if (!token) throw new Error('NO_TOKEN');

    try {
        const response: any = await axiosClient.get('/me');
        
        if (response?.data?.user) {
            await useAuthStore.getState().setAuth(token, response.data.user);
        }
        return response.data;
    } catch (error: any) {
        const status = error.response?.status;
        
        if (status === 401 || status === 403) {
            await clearToken();
            await useAuthStore.getState().logout();
            throw new Error('UNAUTHORIZED');
        }
        
        useAuthStore.setState({ token });
        throw new Error('NETWORK_ERROR');
    }
};

export const logoutUser = async () => {
    try {
        await axiosClient.post('/logout'); 
    } catch (e) {
    } finally {
        await clearToken();
        await useAuthStore.getState().logout();
    }
};