import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

import { createWithdrawalAPI, getMyBankInfoAPI } from '../../api/main';
import { useAppStore } from '../../store/useAppStore';

export default function WithdrawalRequestScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const currency = useAppStore((state: any) => state.wallet?.currency ?? 'MMK');
    const availableBalance = useAppStore((state: any) => state.wallet?.balance ?? 0);
    const refreshWallet = useAppStore((state: any) => state.refreshWallet);

    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);

    const backTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (backTimeoutRef.current) clearTimeout(backTimeoutRef.current);
        };
    }, []);

    const toastTranslateY = useSharedValue(-150);
    const [toastData, setToastData] = useState({ msg: '', type: 'error' });

    const showToast = (msg: string, type: 'success' | 'error' = 'error') => {
        setToastData({ msg, type });
        toastTranslateY.value = -150;
        toastTranslateY.value = withSequence(
            withTiming(Math.max(insets.top, 20) + 10, { duration: 400 }),
            withDelay(2500, withTiming(-150, { duration: 300 }))
        );
    };

    const toastAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: toastTranslateY.value }]
    }));

    const { data: bankInfo, isLoading: loadingBank } = useQuery({
        queryKey: ['myBankInfo'],
        queryFn: async () => {
            try {
                const res = await getMyBankInfoAPI();
                return res?.data?.bank_info ?? res?.bank_info ?? null;
            } catch (error: any) {
                if (error?.response?.status === 404) return null;
                throw error;
            }
        }
    });

    const mutation = useMutation({
        mutationFn: createWithdrawalAPI,
        onSuccess: () => {
            showToast(t('withdraw.toast_success', 'ငွေထုတ်တောင်းဆိုမှု အောင်မြင်ပါသည်။') as string, 'success');
            refreshWallet();

            if (backTimeoutRef.current) clearTimeout(backTimeoutRef.current);
            backTimeoutRef.current = setTimeout(() => {
                router.back();
            }, 1500);
        },
        onError: (error: any) => {
            const errorData = error?.response?.data;
            const errMsg = errorData?.errors?.domain?.[0]
                || errorData?.message
                || t('withdraw.toast_fail', 'ငွေထုတ်တောင်းဆိုမှု မအောင်မြင်ပါ။');
            showToast(errMsg, 'error');
        }
    });

    const handleSubmit = () => {
        const numericAmount = Number(amount.trim());
        if (!numericAmount || numericAmount <= 0) return showToast(t('withdraw.err_invalid_amount', 'ပမာဏ မှန်ကန်စွာ ထည့်ပါ။') as string);
        if (numericAmount > availableBalance) return showToast(t('withdraw.err_insufficient_bal', 'လက်ကျန်ငွေ မလုံလောက်ပါ။') as string);
        if (pin.length !== 6) return showToast(t('withdraw.err_invalid_pin', 'PIN ဂဏန်း ၆ လုံး ထည့်ပါ။') as string);
        if (!bankInfo) return showToast(t('withdraw.err_no_bank', 'ငွေထုတ်ရန် ဘဏ်အကောင့် မရှိပါ။ ကျေးဇူးပြု၍ ဘဏ်အချက်အလက် ဦးစွာထည့်သွင်းပါ။') as string);

        mutation.mutate({
            amount: numericAmount,
            currency: currency,
            security_pin: pin
        });
    };

    const isSubmitting = mutation.isPending;

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                    </Pressable>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.eyebrow}>{t('withdraw.eyebrow', 'ပိုက်ဆံအိတ်') as string}</Text>
                        <Text style={styles.title}>{t('withdraw.title', 'ငွေထုတ်ခြင်း') as string}</Text>
                        <Text style={styles.desc}>{t('withdraw.desc', 'သင်၏ မှတ်ပုံတင်ထားသောဘဏ်အကောင့်သို့ ငွေထုတ်တောင်းဆိုပါ') as string}</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    <View style={styles.bankBoxOuter}>
                        <View style={styles.bankBoxInner}>
                            <Text style={styles.bankBoxLabel}>{t('withdraw.transfer_to', 'လွှဲပြောင်းမည့်နေရာ') as string}</Text>

                            {loadingBank ? (
                                <ActivityIndicator color="#10B981" style={{ marginVertical: 10, alignSelf: 'flex-start' }} />
                            ) : bankInfo ? (
                                <View style={styles.bankDetailRow}>
                                    <MaterialIcons name="account-balance" size={22} color="#10B981" style={styles.bankIcon} />
                                    <View>
                                        <Text style={styles.bankName}>{bankInfo.bank_name}</Text>
                                        <Text style={styles.accountInfo}>{bankInfo.account_name || bankInfo.account_holder_name} · {bankInfo.account_number}</Text>
                                    </View>
                                </View>
                            ) : (
                                <Text style={{ color: '#F87171', fontSize: 13, marginBottom: 12, lineHeight: 20 }}>
                                    {t('withdraw.no_bank_warning', 'ဤငွေကြေးအတွက် မှတ်ပုံတင်ထားသော ဘဏ်အကောင့် မရှိပါ။ ငွေထုတ်ရန် ဘဏ်အကောင့် ဦးစွာထည့်သွင်းပါ။') as string}
                                </Text>
                            )}

                            <Text style={styles.bankFooterText}>
                                {t('withdraw.bank_footer_note', 'Funds will be sent to your registered bank account.') as string}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>{t('withdraw.amount_label', 'ပမာဏ') as string} ({currency})</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                keyboardType="number-pad"
                                placeholder={`e.g. ${currency === 'MMK' ? '50000' : '1000'}`}
                                placeholderTextColor="#4B5563"
                                value={amount}
                                onChangeText={(val) => setAmount(val.replace(/\D/g, ''))}
                                editable={!isSubmitting}
                            />
                        </View>
                        <Text style={styles.helperText}>{t('withdraw.available_balance', 'Available:') as string} {availableBalance.toLocaleString()} {currency}</Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>{t('withdraw.pin_label', 'လုံခြုံရေး PIN') as string}</Text>
                        <View style={styles.pinInputContainer}>
                            <TextInput
                                style={styles.pinInput}
                                keyboardType="number-pad"
                                placeholder="••••••"
                                placeholderTextColor="#4B5563"
                                secureTextEntry={!showPin}
                                maxLength={6}
                                value={pin}
                                onChangeText={(val) => setPin(val.replace(/\D/g, ''))}
                                editable={!isSubmitting}
                            />
                            <Pressable onPress={() => setShowPin(!showPin)} style={styles.eyeIcon}>
                                <MaterialIcons name={showPin ? "visibility" : "visibility-off"} size={20} color="#6B7280" />
                            </Pressable>
                        </View>
                        <Text style={styles.helperText}>{t('withdraw.pin_helper', 'အတည်ပြုရန် သင်၏ ဂဏန်း ၆ လုံး PIN ထည့်ပါ') as string}</Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.submitBtnOuter,
                            !(isSubmitting || !amount || pin.length !== 6 || !bankInfo) ? styles.activeGlow : { opacity: 0.5 }
                        ]}
                        disabled={isSubmitting || !amount || pin.length !== 6 || !bankInfo}
                        onPress={handleSubmit}
                    >
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.submitBtnInner}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#003824" />
                            ) : (
                                <Text style={styles.submitBtnText}>{t('withdraw.submit_btn', 'ငွေထုတ်တောင်းဆိုမှု တင်မည်') as string}</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            <Animated.View style={[
                styles.toastContainer,
                toastAnimatedStyle,
                { borderColor: toastData.type === 'success' ? '#10B981' : '#F87171' }
            ]}>
                <MaterialIcons name={toastData.type === 'success' ? 'check-circle' : 'error'} size={20} color={toastData.type === 'success' ? '#10B981' : '#F87171'} />
                <Text style={[styles.toastText, { color: toastData.type === 'success' ? '#34D399' : '#FCA5A5' }]}>{toastData.msg}</Text>
            </Animated.View>
            <View style={{ height: 60 }}></View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },

    toastContainer: { position: 'absolute', top: 0, left: 20, right: 20, backgroundColor: '#0B291D', borderWidth: 1, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 9999, zIndex: 99999 },
    toastText: { fontSize: 13, fontWeight: 'bold', marginLeft: 8, letterSpacing: 0.5, flex: 1, textAlign: 'center' },

    header: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    backBtn: { marginRight: 16, paddingTop: 4 },
    headerTextContainer: { flex: 1 },
    eyebrow: { color: '#93C5FD', fontSize: 12, marginBottom: 4 },
    title: { color: '#F7F9FF', fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
    desc: { color: '#8A9BB3', fontSize: 13, lineHeight: 20 },
    scrollContent: { padding: 20 },

    bankBoxOuter: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, marginBottom: 24 },
    bankBoxInner: { padding: 16 },
    bankBoxLabel: { color: '#8A9BB3', fontSize: 12, marginBottom: 12 },
    bankDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    bankIcon: { marginRight: 12 },
    bankName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    accountInfo: { color: '#9CA3AF', fontSize: 13 },
    bankFooterText: { color: '#8A9BB3', fontSize: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)' },

    formGroup: { marginBottom: 20 },
    label: { color: '#9CA3AF', fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
    inputContainer: { backgroundColor: 'rgba(5, 10, 31, 0.68)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 12 },
    input: { height: 52, paddingHorizontal: 16, color: '#F7F9FF', fontSize: 16 },

    pinInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(5, 10, 31, 0.68)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 12 },
    pinInput: { flex: 1, height: 52, paddingHorizontal: 16, color: '#F7F9FF', fontSize: 16, letterSpacing: 2 },
    eyeIcon: { padding: 14 },

    helperText: { color: '#8A9BB3', fontSize: 12, marginTop: 8 },

    submitBtnOuter: { marginTop: 10, borderRadius: 12, backgroundColor: '#10B981' },
    activeGlow: { shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 8 },
    submitBtnInner: { height: 56, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderRadius: 12, overflow: 'hidden' },
    submitBtnText: { color: '#003824', fontSize: 16, fontWeight: 'bold' },
});