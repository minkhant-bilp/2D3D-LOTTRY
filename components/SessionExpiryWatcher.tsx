import { router } from 'expo-router';
import { useEffect } from 'react';

import { listenForSessionEnded } from '@/utils/sessionExpiry';
import { teardownSession } from '@/utils/teardownSession';

/**
 * Renders nothing. Mounted above the navigator so it is alive on every screen:
 * the axios interceptor can only announce that the session died, and something
 * inside the React tree has to act on it. Without this the user sits on an
 * inner screen with stale data while every request fails.
 */
export default function SessionExpiryWatcher() {
    useEffect(() => {
        return listenForSessionEnded((reason) => {
            void teardownSession().finally(() => {
                // Carry the reason through: a silent bounce to login is
                // indistinguishable from the app misbehaving.
                router.replace({ pathname: '/login', params: { sessionEnded: reason } });
            });
        });
    }, []);

    return null;
}
