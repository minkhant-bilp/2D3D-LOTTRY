import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { getToken, verifyUser } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';

export default function IndexPage() {
    const { data: authStatus, isLoading } = useQuery({
        queryKey: ['verifyAuth'],
        queryFn: async () => {
            const token = await getToken();

            if (!token) return 'UNAUTHENTICATED';

            useAuthStore.setState({ token });

            try {
                await verifyUser();
                return 'AUTHENTICATED';
            } catch (error: any) {
                if (error.message === 'NETWORK_ERROR') {
                    return 'AUTHENTICATED';
                }
                return 'UNAUTHENTICATED';
            }
        },
        staleTime: 0
    });

    if (isLoading) {
        return <View style={{ flex: 1, backgroundColor: '#050A1F' }} />;
    }

    if (authStatus === 'AUTHENTICATED') {
        return <Redirect href="/(tabs)" />;
    }

    // Login, not register: a returning user whose session expired should not
    // land on the signup form.
    return <Redirect href="/login" />;
}