import { Stack } from "expo-router";

export default function WalletLayOut() {
    return (
        <Stack>
            <Stack.Screen name="number-play/index" options={{ headerShown: false }} />
            <Stack.Screen name="number-play/select" options={{ headerShown: false }} />
            <Stack.Screen name="number-play/paymet" options={{ headerShown: false }} />
            <Stack.Screen name="number-play/susscess" options={{ headerShown: false }} />
            <Stack.Screen name="despoit/index" options={{ headerShown: false }} />
            <Stack.Screen name="money-income/index" options={{ headerShown: false }} />
            <Stack.Screen name="lottery/index" options={{ headerShown: false }} />
            <Stack.Screen name="lottery/deail" options={{ headerShown: false }} />
            <Stack.Screen name="about/index" options={{ headerShown: false }} />
            <Stack.Screen name="help-center/index" options={{ headerShown: false }} />
            <Stack.Screen name="ad/index" options={{ headerShown: false }} />
        </Stack>
    )
}