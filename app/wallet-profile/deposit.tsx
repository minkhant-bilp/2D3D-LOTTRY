import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

import { useMutation, useQuery } from '@tanstack/react-query';

import { createDepositAPI, listBankSettingsAPI } from '../../api/main';
import { useAppStore } from '../../store/useAppStore';

export default function DepositScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const currency = useAppStore((state: any) => state.wallet?.currency ?? 'MMK');
    const balance = useAppStore((state: any) => state.wallet?.balance ?? 0);
    const refreshWallet = useAppStore((state: any) => state.refreshWallet);

    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [proofUri, setProofUri] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const backTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
            if (backTimeoutRef.current) clearTimeout(backTimeoutRef.current);
        };
    }, []);

    const { data: bankSettings, isLoading: loadingBanks } = useQuery({
        queryKey: ['bankSettings'],
        queryFn: async () => {
            const data = await listBankSettingsAPI();
            const rawBanks = data?.bank_settings || data?.data?.bank_settings || data?.admin_bank_settings || [];
            return rawBanks.filter((s: any) => s.is_active);
        }
    });

    const selectedBank = (() => {
        if (!bankSettings) return null;
        const matchingBanks = bankSettings.filter((s: any) => s.currency === currency);
        return matchingBanks.find((s: any) => s.is_primary) ?? matchingBanks[0] ?? null;
    })();

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

    const copyAccountNumber = async () => {
        if (!selectedBank?.account_number) return;
        await Clipboard.setStringAsync(selectedBank.account_number);
        setCopied(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setProofUri(result.assets[0].uri);
        }
    };

    const mutation = useMutation({
        mutationFn: async (formData: FormData) => {
            return await createDepositAPI(formData);
        },
        onSuccess: () => {
            showToast(t('deposit.toast_success', 'ငွေသွင်းတောင်းဆိုမှု အောင်မြင်ပါသည်။') as string, 'success');
            refreshWallet();

            if (backTimeoutRef.current) clearTimeout(backTimeoutRef.current);
            backTimeoutRef.current = setTimeout(() => {
                router.back();
            }, 1500);
        },
        onError: (error: any) => {
            console.error("❌ [DEBUG] Submit Error: ", error?.response?.data || error.message);
            showToast(error?.response?.data?.message || (t('deposit.toast_fail', 'ငွေသွင်းတောင်းဆိုမှု မအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။') as string));
        }
    });

    const isSubmitting = mutation.isPending;

    const handleSubmit = () => {
        const numericAmount = Number(amount.trim());
        if (!Number.isInteger(numericAmount) || numericAmount < 1) {
            showToast(t('deposit.err_min_amount', 'ပမာဏသည် ကိန်းပြည့်ဖြစ်ရမည်ဖြစ်ပြီး အနည်းဆုံး ၁ ကျပ် ရှိရပါမည်။') as string);
            return;
        }

        if (!proofUri) {
            showToast(t('deposit.err_need_proof', 'ငွေပေးချေမှု အထောက်အထား (Image) တင်ရန် လိုအပ်ပါသည်။') as string);
            return;
        }

        if (!selectedBank) {
            showToast(t('deposit.err_no_bank', 'ငွေလွှဲရန် ဘဏ်အကောင့် မရှိပါ။ Customer Support ကို ဆက်သွယ်ပါ။') as string);
            return;
        }

        const formData = new FormData();
        formData.append('admin_bank_setting_id', String(selectedBank.id));
        formData.append('currency', currency);
        formData.append('claimed_amount', String(numericAmount));
        if (note.trim().length > 0) {
            formData.append('transfer_note', note.trim());
        }

        const filename = proofUri.split('/').pop() || 'proof.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('proof_image', {
            uri: proofUri,
            name: filename,
            type,
        } as any);

        mutation.mutate(formData);
    };

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                    </Pressable>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.eyebrow}>{t('deposit.eyebrow', 'ပိုက်ဆံအိတ် ဖြည့်သွင်းခြင်း') as string}</Text>
                        <Text style={styles.title}>{t('deposit.title', 'ငွေအပ်ခြင်း') as string}</Text>
                        <Text style={styles.desc}>{t('deposit.desc', 'ယုံကြည်ရသောချန်နယ်များမှတဆင့် ငွေပမာဏ ဖြည့်ပါ') as string}</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={styles.infoBox}>
                        <MaterialIcons name="account-balance-wallet" size={20} color="#10B981" />
                        <Text style={styles.infoText}>
                            {t('deposit.info_text_1', 'Transfers must be in ') as string}
                            <Text style={{ fontWeight: 'bold', color: '#FFF' }}>{currency}</Text>
                            {t('deposit.info_text_2', '. Transfer to our account, then upload your payment proof.') as string}
                        </Text>
                    </View>

                    {loadingBanks ? (
                        <View style={[styles.transferBox, { alignItems: 'center', paddingVertical: 30 }]}>
                            <ActivityIndicator color="#10B981" />
                            <Text style={[styles.infoText, { textAlign: 'center', marginTop: 10, marginLeft: 0 }]}>
                                {t('deposit.fetching_banks', 'ဘဏ်အချက်အလက်များ ရှာဖွေနေပါသည်...') as string}
                            </Text>
                        </View>
                    ) : selectedBank ? (
                        <View style={styles.transferBox}>
                            <Text style={styles.transferEyebrow}>{t('deposit.transfer_to', 'TRANSFER TO') as string}</Text>
                            <Text style={styles.bankName}>{selectedBank.bank_name}</Text>
                            <Text style={styles.accountName}>{selectedBank.account_holder_name}</Text>

                            <TouchableOpacity activeOpacity={0.7} style={styles.copyRow} onPress={copyAccountNumber}>
                                <Text style={styles.accountNumber}>{selectedBank.account_number}</Text>
                                <MaterialIcons name={copied ? "check" : "content-copy"} size={18} color="#10B981" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={[styles.transferBox, { backgroundColor: 'rgba(248, 113, 113, 0.08)', borderColor: 'rgba(248, 113, 113, 0.3)' }]}>
                            <Text style={[styles.infoText, { color: '#F87171', marginLeft: 0 }]}>
                                {t('deposit.no_active_bank', 'No active bank account available. Please contact support.') as string}
                            </Text>
                        </View>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>{t('deposit.amount_label', 'ပမာဏ') as string} ({currency})</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                keyboardType="number-pad"
                                placeholder={t('deposit.amount_placeholder', 'e.g. 50000') as string}
                                placeholderTextColor="#4B5563"
                                value={amount}
                                onChangeText={(val) => setAmount(val.replace(/\D/g, ''))}
                                editable={!isSubmitting}
                            />
                        </View>
                        <Text style={styles.balanceText}>{t('deposit.current_balance', 'Current balance:') as string} {balance.toLocaleString()} {currency}</Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            {t('deposit.note_label', 'လွှဲပြောင်းမှတ်ချက်') as string} <Text style={styles.optionalText}>{t('deposit.optional', '(optional)') as string}</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder={t('deposit.note_placeholder', 'နောက်ဆုံး ၆ လုံး သို့မဟုတ် ကိုးကားနံပါတ်') as string}
                                placeholderTextColor="#4B5563"
                                value={note}
                                onChangeText={setNote}
                                editable={!isSubmitting}
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>{t('deposit.proof_label', 'ငွေပေးချေမှု အထောက်အထား') as string}</Text>
                        <Pressable style={styles.uploadArea} onPress={pickImage} disabled={isSubmitting}>
                            {proofUri ? (
                                <Image source={{ uri: proofUri }} style={styles.previewImage} resizeMode="contain" />
                            ) : (
                                <>
                                    <MaterialIcons name="cloud-upload" size={40} color="rgba(255,255,255,0.3)" />
                                    <Text style={styles.uploadText}>
                                        {t('deposit.proof_instruction', 'ငွေပေးချေမှု slip တင်ပါ (JPG/PNG/WEBP,\n10MB ထိ)') as string}
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.submitBtnOuter,
                            !(isSubmitting || !amount || !proofUri || !selectedBank) ? styles.activeGlow : { opacity: 0.4 }
                        ]}
                        disabled={isSubmitting || !amount || !proofUri || !selectedBank}
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
                                <Text style={styles.submitBtnText}>{t('deposit.submit_btn', 'ငွေသွင်းမည်') as string}</Text>
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
    eyebrow: { color: '#93C5FD', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 4 },
    title: { color: '#F7F9FF', fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
    desc: { color: '#8A9BB3', fontSize: 13, lineHeight: 20 },
    scrollContent: { padding: 20 },
    infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, marginBottom: 20 },
    infoText: { flex: 1, color: '#8A9BB3', fontSize: 13, marginLeft: 12, lineHeight: 20 },
    transferBox: { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)', borderRadius: 12, padding: 16, marginBottom: 24 },
    transferEyebrow: { color: '#10B981', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
    bankName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    accountName: { color: '#8A9BB3', fontSize: 13, marginBottom: 4 },
    copyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
    accountNumber: { color: '#FFFFFF', fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginRight: 10, letterSpacing: 1 },
    formGroup: { marginBottom: 20 },
    label: { color: '#9CA3AF', fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
    optionalText: { color: '#6B7280', fontWeight: 'normal' },
    inputContainer: { backgroundColor: 'rgba(5, 10, 31, 0.68)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 12 },
    input: { height: 52, paddingHorizontal: 16, color: '#F7F9FF', fontSize: 16 },
    balanceText: { color: '#8A9BB3', fontSize: 12, marginTop: 8 },
    uploadArea: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.15)', borderStyle: 'dashed', borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: 140 },
    uploadText: { color: '#8A9BB3', fontSize: 13, textAlign: 'center', marginTop: 12, lineHeight: 20 },
    previewImage: { width: '100%', height: 120, borderRadius: 8 },
    submitBtnOuter: { marginTop: 10, borderRadius: 12, backgroundColor: '#10B981' },
    activeGlow: { shadowColor: '#34D399', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 8 },
    submitBtnInner: { height: 56, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderRadius: 12, overflow: 'hidden' },
    submitBtnText: { color: '#003824', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
});