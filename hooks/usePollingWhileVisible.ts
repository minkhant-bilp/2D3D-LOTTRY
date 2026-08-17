import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export const LIVE_POLL_INTERVAL_MS = 15000;

export function usePollingWhileVisible(callback: () => void, intervalMs: number = LIVE_POLL_INTERVAL_MS) {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;

        const run = () => callbackRef.current();

        const startPolling = () => {
            if (intervalId !== null) return;
            intervalId = setInterval(() => {
                if (AppState.currentState === 'active') run();
            }, intervalMs);
        };

        const stopPolling = () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };

        run();
        startPolling();

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                run();
                startPolling();
            } else {
                stopPolling();
            }
        });

        return () => {
            stopPolling();
            subscription.remove();
        };
    }, [intervalMs]);
}