import { Stack } from "expo-router";

export default function GamblingLayout() {
    return (
        <Stack>
            <Stack.Screen name="transaction-record" options={{ headerShown: false }} />
            <Stack.Screen name="gambling-history/index" options={{ headerShown: false }} />
        </Stack>
    )
}