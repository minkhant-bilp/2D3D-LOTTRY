import { router } from 'expo-router';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { handleNotificationPayload, resolveNotificationRoute } from '@/utils/handleNotificationPayload';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function usePushNotifications() {
    const [pushToken, setPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);

    const notificationListener = useRef<Notifications.Subscription | null>(null);
    const responseListener = useRef<Notifications.Subscription | null>(null);
    // A cold-start tap is also replayed by addNotificationResponseReceivedListener
    // on some Android builds; without this the app navigates twice.
    const lastHandledResponseId = useRef<string | null>(null);

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) setPushToken(token);
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
            handleNotificationPayload(notification.request.content, { showToast: true });
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            handleNotificationResponse(response);
        });

        // The app was launched by a tap from the killed state — the listener
        // above is registered too late to see it.
        Notifications.getLastNotificationResponseAsync()
            .then(response => {
                if (response != null) handleNotificationResponse(response);
            })
            .catch(error => console.warn('[fcm] cold start response lookup failed', error));

        function handleNotificationResponse(response: Notifications.NotificationResponse) {
            const identifier = response.notification.request.identifier;
            if (lastHandledResponseId.current === identifier) return;
            lastHandledResponseId.current = identifier;

            const content = response.notification.request.content;
            // The OS banner already fired, so no toast here.
            handleNotificationPayload(content, { showToast: false });
            router.push(resolveNotificationRoute(content) as any);
        }

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return { pushToken, notification };
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#00E676',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return null;
        }

       try {
            token = (await Notifications.getDevicePushTokenAsync()).data;
        } catch (e) {
            console.log("Token Error:", e);
        }
    }

    return token;
}
