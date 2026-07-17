import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';

export default function LogoutButton() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const onLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            setIsLoggingOut(false);
            router.replace('/login');
        }, 1500);
    };

    return (
        <View className="w-full mt-6">
            <TouchableOpacity
                className={`w-full flex-row items-center justify-center rounded-[14px] border border-[#ef4444]/20 bg-[#ef4444]/10 py-[18px] ${isLoggingOut ? 'opacity-60' : ''
                    }`}
                onPress={() => setIsConfirmOpen(true)}
                disabled={isLoggingOut}
                activeOpacity={0.7}
            >
                {isLoggingOut ? (
                    <ActivityIndicator size="small" color="#ff6a62" />
                ) : (
                    <Text className="text-[16px] font-medium tracking-[0.5px] text-[#ff6a62]">
                        ထွက်ခွာမည်
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
                        <Text className="mb-2 text-[16px] font-bold text-[#f5f8ff]">အကောင့်ထွက်မည်</Text>
                        <Text className="mb-5 text-[14px] text-[#a7b4cb]">သင့်အကောင့်မှ ထွက်ခွာမှာ သေချာပါသလား?</Text>

                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                className="flex-1 h-10 items-center justify-center rounded-xl border border-white/20 mx-1"
                                onPress={() => setIsConfirmOpen(false)}
                                disabled={isLoggingOut}
                                activeOpacity={0.7}
                            >
                                <Text className="text-[14px] font-bold text-[#d5def0]">မလုပ်ပါ</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-1 h-10 items-center justify-center rounded-xl bg-[#ef4444] mx-1 ${isLoggingOut ? 'opacity-70' : ''
                                    }`}
                                onPress={() => {
                                    setIsConfirmOpen(false);
                                    onLogout();
                                }}
                                disabled={isLoggingOut}
                                activeOpacity={0.7}
                            >
                                <Text className="text-[14px] font-bold text-white">ထွက်မည်</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}