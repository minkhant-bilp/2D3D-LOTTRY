import AsyncStorage from '@react-native-async-storage/async-storage';

/** Tokens rarely rotate — re-registering once a day is plenty and keeps /fcm quiet. */
export const TOKEN_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

const TOKEN_REFRESH_STORAGE_KEY = 'zarmani:fcm-token-refreshed-at';

export async function readPushTokenRefreshStamp(): Promise<number> {
    try {
        const stored = await AsyncStorage.getItem(TOKEN_REFRESH_STORAGE_KEY);
        return Number(stored ?? 0);
    } catch {
        return 0;
    }
}

export async function writePushTokenRefreshStamp(): Promise<void> {
    try {
        await AsyncStorage.setItem(TOKEN_REFRESH_STORAGE_KEY, String(Date.now()));
    } catch {
        // A missing stamp only costs an extra registration next boot.
    }
}

/**
 * The stamp is per-device but the registration it records is per-account, so it
 * has to go with the session. Left behind, the next account signed in on this
 * device looks "recently refreshed" and skips registering its own token for up
 * to a day — no push notifications until then.
 */
export async function clearPushTokenRefreshStamp(): Promise<void> {
    try {
        await AsyncStorage.removeItem(TOKEN_REFRESH_STORAGE_KEY);
    } catch {
        // Non-fatal — logout must not fail on this.
    }
}
