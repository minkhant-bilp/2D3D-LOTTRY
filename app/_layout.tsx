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
import MaintenanceScreen from '@/src/components/MaintenanceScreen';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

// 🌟 App မတက်ခင် Native Splash Screen ကို အရင်ဖမ်းထားမည်
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

  // 🧠 EINSTEIN OPTIMIZATION 1: React Query ဖြင့် အလန်းစား Fetching (Manual Try/Catch များကို ဖယ်ရှားထားသည်)
  const { data: maintenanceData, isFetched: isApiDone } = useQuery({
    queryKey: ['maintenanceCheck'],
    queryFn: async () => {
      const response = await getMaintenanceSettingsAPI();
      return response?.maintenance;
    },
    staleTime: 1000 * 60 * 5, // ၅ မိနစ်အတွင်း နောက်တစ်ကြိမ် ထပ်မစစ်တော့ပါ (ဘက်ထရီသက်သာစေရန်)
    retry: 2,
  });

  // 🧠 EINSTEIN OPTIMIZATION 2: Parallel Animation Timer (The Pro Pattern)
  const [isAnimDone, setIsAnimDone] = useState(false);

  useEffect(() => {
    // App စပွင့်သည်နှင့် API စစ်နေစဉ်အတွင်း Animation ကို ပြိုင်တူ (Parallel) ဖွင့်ထားမည်
    const timer = setTimeout(() => {
      setIsAnimDone(true); // ၁.၅ စက္ကန့်ပြည့်ပါက Animation ပြီးဆုံးကြောင်း ကြေညာမည်
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // API အလုပ်လုပ်ပြီးသွားပါက Native Splash ကို ချက်ချင်းဖျောက်မည် 
    // (သို့မှသာ ကျွန်ုပ်တို့၏ Custom Animated Splash Screen ကို မြင်ရမည်ဖြစ်သည်)
    if (isApiDone) {
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [isApiDone]);

  // API လည်းစစ်ပြီးရမည်၊ Animation လည်းပြီးဆုံးရမည်။ နှစ်ခုစလုံး ပြည့်စုံမှသာ Main App သို့ ဝင်ခွင့်ပြုမည်။
  const isShowSplash = !isApiDone || !isAnimDone;

  const isMaintenance = maintenanceData?.is_enabled;
  const maintenanceMessage = maintenanceData?.message || 'စနစ်ပြုပြင်မွမ်းမံနေပါသည်။';

  // 🧠 EINSTEIN OPTIMIZATION 3: Single Provider Mounting
  // Provider များကို အခြေအနေ (၃) ခုစလုံး၏ အပြင်ဘက်ဆုံး တစ်နေရာတည်းတွင်သာ အုပ်ထားသဖြင့်
  // App ပွင့်လာချိန်တွင် Screen ကြီးတစ်ခုလုံး အလကားနေရင်း ဖျက်လိုက်/ဆောက်လိုက် (Re-mount) ဖြစ်ခြင်းမှ ၁၀၀% ကာကွယ်သွားပါပြီ။
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