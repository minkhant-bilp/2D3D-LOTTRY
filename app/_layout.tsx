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

import { getMaintenanceSettingsAPI } from '@/api/main';
import CustomSplashScreen from '@/components/CustomSplashScreen';
import SessionExpiryWatcher from '@/components/SessionExpiryWatcher';
import ToastBridge from '@/components/ToastBridge';
import { queryClient } from '@/lib/queryClient';
import MaintenanceScreen from '@/src/components/MaintenanceScreen';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuthStore } from '@/store/useAuthStore';
import { registerDeviceToken } from '@/utils/registerDeviceToken';

SplashScreen.preventAutoHideAsync();

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

  // Stack.Protected reads this, so the store has to be rehydrated from
  // SecureStore at boot — nothing called checkAuth() before now.
  const isSignedIn = useAuthStore((state) => state.token != null);

  useEffect(() => {
    void useAuthStore.getState().checkAuth();
  }, []);

  const { pushToken } = usePushNotifications();

  // Throttled to once a day, and a no-op until the user is signed in.
  useEffect(() => {
    if (pushToken) {
      void registerDeviceToken();
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
        <ToastBridge />
        <SessionExpiryWatcher />

        {isShowSplash ? (
          <CustomSplashScreen />
        ) : isMaintenance ? (
          <MaintenanceScreen message={maintenanceMessage} />
        ) : (
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />

            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />

            {/* Everything past here needs a session. Without the guard a push
                deep link (or any stale navigation state) drops a signed-out
                user straight onto an inner screen that then 401s forever. */}
            <Stack.Protected guard={isSignedIn}>
              <Stack.Screen name="wallet/bank-setup" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              <Stack.Screen name="gambling" options={{ headerShown: false }} />
              <Stack.Screen name="user/profile" options={{ headerShown: false }} />
              <Stack.Screen name="noti/notifications" options={{ headerShown: false }} />
              <Stack.Screen name="bets/twoD" options={{ headerShown: false }} />
              <Stack.Screen name="bets/threeD" options={{ headerShown: false }} />
              <Stack.Screen name="wallet-profile" options={{ headerShown: false }} />
              <Stack.Screen name="withdrawal" options={{ headerShown: false }} />
              <Stack.Screen name="results/twoDresult" options={{ headerShown: false }} />
              <Stack.Screen name="user/bank-info" options={{ headerShown: false }} />
              <Stack.Screen name="help-center" options={{ headerShown: false }} />
              <Stack.Screen name="results/threeDresult" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        )}

        <StatusBar style={isShowSplash ? "light" : "auto"} />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}