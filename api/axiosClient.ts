import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { dispatchSessionEnded, type SessionEndedReason } from '../utils/sessionExpiry';

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

/**
 * A ban is reported as 403 by the backend's EnsureUserIsNotBanned middleware,
 * not 401.
 *
 * Deliberately narrow: a bare 403 from any other endpoint is that one request
 * being refused, not a dead session, and must never log the user out.
 */
function isBannedResponse(payload: any): boolean {
    return Array.isArray(payload?.errors?.authorization);
}

/**
 * Ends a session the server no longer recognises. Only clears + announces once
 * — a screen firing several requests in parallel would otherwise emit a burst
 * of events and bounce the user repeatedly.
 *
 * This module deliberately does not import the zustand stores: `useAppStore`
 * pulls in `api/main`, which pulls in this file. The event is picked up by
 * `components/SessionExpiryWatcher.tsx`, which owns the teardown and the
 * navigation.
 */
async function endSession(reason: SessionEndedReason) {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token == null) return;

    await SecureStore.deleteItemAsync(TOKEN_KEY);
    dispatchSessionEnded(reason);
}

axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 401) {
            await endSession('expired');
        } else if (status === 403 && isBannedResponse(data)) {
            await endSession('banned');
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