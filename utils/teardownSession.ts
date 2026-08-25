import { queryClient } from '@/lib/queryClient';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useBetStore } from '@/store/useBetStore';
import { clearPushTokenRefreshStamp } from '@/utils/pushTokenRefreshStamp';

/**
 * Drops every trace of the current session from this device.
 *
 * The zustand stores are in-memory and unpersisted, so this only matters when
 * the app is not killed in between — but that is exactly the logout -> sign in
 * as someone else flow, where the previous account's balance, bank account
 * number and security PIN would otherwise still be sitting in state.
 *
 * Never throws: every caller is already on an unhappy path.
 */
export async function teardownSession(): Promise<void> {
    try {
        await useAuthStore.getState().logout();
    } catch (error) {
        console.warn('[auth] auth store teardown failed', error);
    }

    try {
        useAppStore.getState().clearSession();
        // useBetStore has no reset action; `pin` is the reason this matters.
        useBetStore.setState({ betRows: [], pin: '', step: 2 });
    } catch (error) {
        console.warn('[auth] store reset failed', error);
    }

    await clearPushTokenRefreshStamp();

    try {
        queryClient.clear();
    } catch (error) {
        console.warn('[auth] query cache clear failed', error);
    }
}
