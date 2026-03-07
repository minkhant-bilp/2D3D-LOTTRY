import { Stack } from "expo-router";

export default function GamblingLayout() {
    return (
        <Stack>
            <Stack.Screen name="despoit-history/index" options={{ headerShown: false }} />
            <Stack.Screen name="gambling-history/index" options={{ headerShown: false }} />
            <Stack.Screen name="transaction-record/index" options={{ headerShown: false }} />
            <Stack.Screen name="withdrawal-history/index" options={{ headerShown: false }} />

        </Stack>
    )
}