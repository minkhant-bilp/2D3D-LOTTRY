import { SessionProvider } from '@/provider/ctx';
import { SplashScreenController } from '@/provider/splash';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../constants/translation/i18n';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { createFcmTokenAPI, getMaintenanceSettingsAPI } from '@/api/main';
import CustomSplashScreen from '@/components/CustomSplashScreen';
import MaintenanceScreen from '@/src/components/MaintenanceScreen';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SplashScreenController />
        <RootNavigator />
      </SessionProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();

  const { pushToken } = usePushNotifications();

  useEffect(() => {
    if (pushToken) {
      const sendTokenToBackend = async () => {
        try {
          await createFcmTokenAPI({
            token: pushToken,
            device_type: Platform.OS === 'ios' ? 'ios' : 'android',
            device_name: Device.modelName || 'Unknown Device'
          });
        } catch (error: any) {
          if (error.response?.status === 401) {
          }
        }
      };
      sendTokenToBackend();
    }
  }, [pushToken]);

  const { data: maintenanceData, isFetched: isApiDone } = useQuery({
    queryKey: ['maintenanceCheck'],
    queryFn: async () => {
      const response = await getMaintenanceSettingsAPI();
      return response?.maintenance;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const [isAnimDone, setIsAnimDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimDone(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isApiDone) {
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [isApiDone]);

  const isShowSplash = !isApiDone || !isAnimDone;

  const isMaintenance = maintenanceData?.is_enabled;
  const maintenanceMessage = maintenanceData?.message || 'စနစ်ပြုပြင်မွမ်းမံနေပါသည်။';

  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>

        {isShowSplash ? (
          <CustomSplashScreen />
        ) : isMaintenance ? (
          <MaintenanceScreen message={maintenanceMessage} />
        ) : (
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />

            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />

            <Stack.Screen name="wallet/bank-setup" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen name="gambling" options={{ headerShown: false }} />
            <Stack.Screen name="user/profile" options={{ headerShown: false }} />
            <Stack.Screen name="user/bankinfo" options={{ headerShown: false }} />
            <Stack.Screen name="noti/notifications" options={{ headerShown: false }} />
            <Stack.Screen name="bets/twoD" options={{ headerShown: false }} />
            <Stack.Screen name="bets/threeD" options={{ headerShown: false }} />
            <Stack.Screen name="wallet-profile" options={{ headerShown: false }} />
            <Stack.Screen name="withdrawal" options={{ headerShown: false }} />
            <Stack.Screen name="results/twoDresult" options={{ headerShown: false }} />
            <Stack.Screen name="user/bank-info" options={{ headerShown: false }} />
            <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
            <Stack.Screen name="results/threeDresult" options={{ headerShown: false }} />
          </Stack>
        )}

        <StatusBar style={isShowSplash ? "light" : "auto"} />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}