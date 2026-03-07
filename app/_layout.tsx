import { SessionProvider, useSession } from '@/provider/ctx';
import { SplashScreenController } from '@/provider/splash';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <SessionProvider>
      <SplashScreenController />
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { session } = useSession();

  return (

    <GluestackUIProvider mode="light">
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* <Stack.Protected guard={!!session}> */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name='wallet-profile' options={{ headerShown: false }} />
          <Stack.Screen name='gambling' options={{ headerShown: false }} />
          {/* </Stack.Protected> */}

          {/* <Stack.Protected guard={!session}> */}
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name='register' options={{ headerShown: false }} />
          {/* </Stack.Protected> */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>

  );
}