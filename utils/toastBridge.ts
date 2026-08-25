export type AppToastType = 'info' | 'success' | 'error';

export type ShowToastFn = (message: string, type?: AppToastType) => void;

/**
 * Push payloads are handled outside the React tree (expo-notifications listeners
 * fire from a module-level subscription), so the gluestack `useToast` hook can't
 * be called there. `<ToastBridge />` publishes the hook's `show` here on mount —
 * same escape hatch the app already uses for `useAppStore.getState()`.
 */
let handler: ShowToastFn | null = null;

export function setToastHandler(fn: ShowToastFn | null) {
    handler = fn;
}

export function showAppToast(message: string, type: AppToastType = 'info') {
    // No-op before the bridge mounts — a dropped toast must never throw.
    handler?.(message, type);
}
