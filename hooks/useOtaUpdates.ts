import { usePathname } from 'expo-router';
import * as Updates from 'expo-updates';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { getAppUpdateSettingsAPI } from '@/api/main';
import { shouldForce } from '@/utils/otaCritical';

/** How long the splash waits for the check before letting the user in on the old bundle. */
const BOOT_TIMEOUT_MS = 8000;

/** Foreground re-checks closer together than this are skipped. */
const RECHECK_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Screens holding input a reload would throw away: a bet slip, a pay slip
 * upload, bank details, a half-filled login. Neither the prompt nor a forced
 * reload ever interrupts them; a critical update waits until the user leaves.
 */
const UNSAFE_ROUTE_PREFIXES = [
    '/bets/',
    '/wallet-profile/',
    '/wallet/bank-setup',
    '/user/bank-info',
    '/register',
    '/login',
];

export function isUnsafeRoute(pathname: string): boolean {
    return UNSAFE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

type ReadyUpdate = {
    id: string;
    critical: boolean;
};

/** Null on any failure: a backend hiccup must never force a reload. */
async function fetchMinCreatedAtMs(): Promise<number | null> {
    try {
        const data = await getAppUpdateSettingsAPI();
        const value = data?.app_update?.ota_min_created_at;
        const ms = typeof value === 'string' ? Date.parse(value) : NaN;

        return Number.isNaN(ms) ? null : ms;
    } catch {
        return null;
    }
}

/**
 * Drives OTA delivery for the whole app. Mounted once, in the root layout.
 *
 * - Cold start: checks while the splash is up, and applies a critical update
 *   before any screen renders. Gives up after BOOT_TIMEOUT_MS.
 * - Foreground: re-checks, at most every RECHECK_INTERVAL_MS.
 * - A normal update raises a prompt; a critical one reloads as soon as the
 *   user is off the screens in UNSAFE_ROUTE_PREFIXES.
 */
export function useOtaUpdates() {
    const pathname = usePathname();
    const enabled = Updates.isEnabled && !__DEV__;

    const [bootDone, setBootDone] = useState(!enabled);
    const [ready, setReady] = useState<ReadyUpdate | null>(null);
    const [dismissedId, setDismissedId] = useState<string | null>(null);
    const [forcing, setForcing] = useState(false);

    const bootDoneRef = useRef(!enabled);
    const inFlightRef = useRef(false);
    const lastCheckRef = useRef(0);
    // Without this a failed reload resets `forcing`, which re-fires the force effect forever.
    const reloadFailedRef = useRef(false);

    const finishBoot = useCallback(() => {
        bootDoneRef.current = true;
        setBootDone(true);
    }, []);

    const reload = useCallback(async () => {
        setForcing(true);
        try {
            await Updates.reloadAsync();
        } catch (error) {
            console.warn('OTA reload failed', error);
            reloadFailedRef.current = true;
            setForcing(false);
        }
    }, []);

    const runCheck = useCallback(async () => {
        if (inFlightRef.current) {
            return;
        }
        inFlightRef.current = true;
        lastCheckRef.current = Date.now();

        try {
            const [minCreatedAtMs, check] = await Promise.all([
                fetchMinCreatedAtMs(),
                Updates.checkForUpdateAsync(),
            ]);
            if (!check.isAvailable) {
                return;
            }

            const critical = shouldForce(check.isAvailable, Updates.createdAt, minCreatedAtMs);
            // A normal update is not applied now, so the splash must not wait for its download.
            if (!critical) {
                finishBoot();
            }

            const fetched = await Updates.fetchUpdateAsync();

            // Still on the splash: nothing has been typed yet, so apply now.
            if (critical && !bootDoneRef.current) {
                await reload();
                return;
            }

            setReady({
                id: fetched.manifest?.id ?? (fetched.isRollBackToEmbedded ? 'embedded' : 'unknown'),
                critical,
            });
        } catch (error) {
            console.warn('OTA check failed', error);
        } finally {
            inFlightRef.current = false;
        }
    }, [reload, finishBoot]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const timer = setTimeout(finishBoot, BOOT_TIMEOUT_MS);

        runCheck().finally(() => {
            clearTimeout(timer);
            finishBoot();
        });

        return () => clearTimeout(timer);
    }, [enabled, runCheck, finishBoot]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active' && Date.now() - lastCheckRef.current >= RECHECK_INTERVAL_MS) {
                void runCheck();
            }
        });

        return () => subscription.remove();
    }, [enabled, runCheck]);

    const onSafeRoute = !isUnsafeRoute(pathname);

    useEffect(() => {
        if (bootDone && ready?.critical && onSafeRoute && !forcing && !reloadFailedRef.current) {
            void reload();
        }
    }, [bootDone, ready, onSafeRoute, forcing, reload]);

    const dismiss = useCallback(() => {
        if (ready) {
            setDismissedId(ready.id);
        }
    }, [ready]);

    return {
        /** False while the cold-start check may still apply a critical update; keep the splash up. */
        bootDone,
        promptVisible:
            bootDone && ready !== null && !ready.critical && ready.id !== dismissedId && onSafeRoute && !forcing,
        forcing: bootDone && forcing,
        restart: reload,
        dismiss,
    };
}
