import { useAppStore } from '@/store/useAppStore';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

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

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            if (token) setPushToken(token);
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log( notification.request.content.title);
            console.log( notification.request.content.body);
            console.log( JSON.stringify(notification.request.content.data, null, 2));

            setNotification(notification);
            useAppStore.getState().refreshNotifications();
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log( JSON.stringify(response.notification.request.content.data, null, 2));
          
        });

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