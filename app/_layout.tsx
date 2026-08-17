import { SessionProvider, useSession } from '@/provider/ctx';
import { SplashScreenController } from '@/provider/splash';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
  const { session } = useSession();

  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}