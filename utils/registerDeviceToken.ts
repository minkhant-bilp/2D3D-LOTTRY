import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { createFcmTokenAPI } from '@/api/main';
import { TOKEN_KEY } from '@/api/axiosClient';
import {
    readPushTokenRefreshStamp,
    writePushTokenRefreshStamp,
    TOKEN_REFRESH_INTERVAL_MS,
} from '@/utils/pushTokenRefreshStamp';

/**
 * Registers this device's FCM token with the backend.
 *
 * `force` is for login/register, where the account just changed and its token
 * must be registered regardless of when this device last reported in. Every
 * other caller (app boot) leaves it off and is throttled to once a day.
 *
 * Never throws — push must not be able to break a login.
 */
export async function registerDeviceToken(opts?: { force?: boolean }): Promise<void> {
    const force = opts?.force ?? false;

    try {
        // An unauthenticated POST /fcm/token is just a 401 the interceptor eats,
        // and it would wrongly clear the stored session token on the way out.
        const authToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (authToken == null || authToken === '') return;

        if (!force) {
            const lastRefreshedAt = await readPushTokenRefreshStamp();
            if (Date.now() - lastRefreshedAt < TOKEN_REFRESH_INTERVAL_MS) return;
        }

        // Raw FCM/APNs device token, not an Expo push token — the backend
        // validates `token` as min:100 chars and talks to FCM directly.
        const pushToken = (await Notifications.getDevicePushTokenAsync()).data;
        if (typeof pushToken !== 'string' || pushToken === '') return;

        await createFcmTokenAPI({
            token: pushToken,
            device_type: Platform.OS === 'ios' ? 'ios' : 'android',
            device_name: Device.modelName || 'Unknown Device',
        });

        await writePushTokenRefreshStamp();
    } catch (error) {
        console.warn('[fcm] device token registration failed', error);
    }
}
