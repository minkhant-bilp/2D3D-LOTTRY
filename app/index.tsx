import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getToken, verifyUser } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';

SplashScreen.preventAutoHideAsync();

export default function IndexPage() {
    const [isReady, setIsReady] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const prepareApp = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    setIsAuthenticated(false);
                } else {
                    useAuthStore.setState({ token });

                    await verifyUser();
                    setIsAuthenticated(true);
                }
            } catch (error: any) {
                if (error.message === 'NETWORK_ERROR') {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } finally {
                setIsReady(true);
                await SplashScreen.hideAsync();
            }
        };

        prepareApp();
    }, []);

    if (!isReady) {
        return <View style={{ flex: 1, backgroundColor: '#050A1F' }} />;
    }

    if (!isAuthenticated) {
        return <Redirect href="/register" />;
    }

    return <Redirect href="/(tabs)" />;
}