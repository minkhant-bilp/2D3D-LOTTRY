import React, { useEffect } from 'react';

import { Toast, ToastDescription, useToast } from '@/components/ui/toast';
import { setToastHandler, type AppToastType } from '@/utils/toastBridge';

const TOAST_DURATION_MS = 3000;

/**
 * Renders nothing. Exists only to hand the gluestack toast `show` function to
 * `utils/toastBridge`, so non-React code (the push notification listeners) can
 * raise a toast.
 */
export default function ToastBridge() {
    const toast = useToast();

    useEffect(() => {
        setToastHandler((message: string, type: AppToastType = 'info') => {
            toast.show({
                placement: 'top',
                duration: TOAST_DURATION_MS,
                render: ({ id }: { id: string }) => (
                    <Toast nativeID={`toast-${id}`} action={type} variant="solid">
                        <ToastDescription>{message}</ToastDescription>
                    </Toast>
                ),
            });
        });

        return () => setToastHandler(null);
    }, [toast]);

    return null;
}
