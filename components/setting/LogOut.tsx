import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';

import { logoutUser } from '../../api/auth';
import { logoutAllFcmTokensAPI } from '../../api/main';
import { teardownSession } from '../../utils/teardownSession';

export default function LogoutButton() {
    const router = useRouter();
    const { t } = useTranslation();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const onLogout = async () => {
        setIsLoggingOut(true);

        // Every step here is best-effort. Logging out must succeed locally even
        // when the server is unreachable or the token is already dead — the old
        // code let a failed POST /logout skip the teardown and the redirect,
        // which made a stale session impossible to leave.
        try {
            await logoutAllFcmTokensAPI();
        } catch (fcmError) {
            console.log('FCM token clearing failed (non-fatal):', fcmError);
        }

        // Swallows its own errors and clears the token in a finally.
        await logoutUser();

        await teardownSession();

        router.replace('/login');
    };

    return (
        <View className="w-full mt-6">
            <TouchableOpacity
                className={`w-full flex-row items-center justify-center rounded-[14px] border border-[#ef4444]/20 bg-[#ef4444]/10 py-[18px] ${isLoggingOut ? 'opacity-60' : ''}`}
                onPress={() => setIsConfirmOpen(true)}
                disabled={isLoggingOut}
                activeOpacity={0.7}
            >
                {isLoggingOut ? (
                    <ActivityIndicator size="small" color="#ff6a62" />
                ) : (
                    <Text className="text-[16px] font-medium tracking-[0.5px] text-[#ff6a62]">
                        {t('auth.logout_btn') as string}
                    </Text>
                )}
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={isConfirmOpen}
                animationType="fade"
                onRequestClose={() => !isLoggingOut && setIsConfirmOpen(false)}
            >
                <View className="flex-1 items-center justify-center bg-[#040a1f]/60 p-5">
                    <View className="w-full max-w-[320px] rounded-[20px] border border-white/10 bg-[#0f1d38] p-5">
                        <Text className="mb-2 text-[16px] font-bold text-[#f5f8ff]">{t('auth.logout_confirm_title') as string}</Text>
                        <Text className="mb-5 text-[14px] text-[#a7b4cb]">{t('auth.logout_confirm_desc') as string}</Text>

                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                className="flex-1 h-10 items-center justify-center rounded-xl border border-white/20 mx-1"
                                onPress={() => setIsConfirmOpen(false)}
                                disabled={isLoggingOut}
                                activeOpacity={0.7}
                            >
                                <Text className="text-[14px] font-bold text-[#d5def0]">{t('common.cancel') as string}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-1 h-10 items-center justify-center rounded-xl bg-[#ef4444] mx-1 ${isLoggingOut ? 'opacity-70' : ''}`}
                                onPress={() => {
                                    setIsConfirmOpen(false);
                                    onLogout();
                                }}
                                disabled={isLoggingOut}
                                activeOpacity={0.7}
                            >
                                <Text className="text-[14px] font-bold text-white">{t('auth.logout_confirm_btn') as string}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}