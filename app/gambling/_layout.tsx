import { Stack } from "expo-router";

export default function GamblingLayout() {
    return (
        <Stack>
            <Stack.Screen name="transaction-record" options={{ headerShown: false }} />

        </Stack>
    )
}