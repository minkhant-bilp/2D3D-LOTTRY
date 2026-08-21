import { MaterialIcons } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

import { createMyBankInfoAPI, getMyBankInfoAPI, updateMyBankInfoAPI } from '../../api/main';
import { useAppStore } from '../../store/useAppStore';

type BankEntry = { code: string; label: string; currency: 'MMK' | 'THB' };
const BANKS: BankEntry[] = [
    { code: 'KBZ', label: 'Kanbawza Bank', currency: 'MMK' },
    { code: 'AYA', label: 'AYA Bank', currency: 'MMK' },
    { code: 'CB', label: 'CB Bank', currency: 'MMK' },
    { code: 'UAB', label: 'United Amara Bank', currency: 'MMK' },
    { code: 'YOMA', label: 'Yoma Bank', currency: 'MMK' },
    { code: 'SCB', label: 'Siam Commercial Bank', currency: 'THB' },
    { code: 'KBANK', label: 'Kasikorn Bank', currency: 'THB' },
    { code: 'BBL', label: 'Bangkok Bank', currency: 'THB' },
    { code: 'KTB', label: 'Krungthai Bank', currency: 'THB' },
    { code: 'BAY', label: 'Bank of Ayudhya (Krungsri)', currency: 'THB' },
    { code: 'TTB', label: 'TMBThanachart Bank', currency: 'THB' },
    { code: 'GSB', label: 'Government Savings Bank', currency: 'THB' },
];
const CURRENCY_LABEL: Record<'MMK' | 'THB', string> = { MMK: 'Myanmar', THB: 'Thailand' };

function bankInfoCooldownUntil(nextAllowedAt: string | null | undefined): Date | null {
    if (!nextAllowedAt) return null;
    const until = new Date(nextAllowedAt);
    if (Number.isNaN(until.getTime()) || until.getTime() <= Date.now()) return null;
    return until;
}

function formatCooldownDate(until: Date): string {
    return until.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BankInfoScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const nextAllowedAt = useAppStore((state: any) => state.wallet?.bank_info_next_allowed_at);
    const refreshWallet = useAppStore((state: any) => state.refreshWallet);
    const cooldownUntil = bankInfoCooldownUntil(nextAllowedAt);

    const [form, setForm] = useState({ bank_name: 'KBZ', account_name: '', account_number: '' });
    const [showConfirm, setShowConfirm] = useState(false);

    const [showBankList, setShowBankList] = useState(false);
    const [bankSearch, setBankSearch] = useState('');

    const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        return () => {
            if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
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

    const { data: bankInfo, isLoading } = useQuery({
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

    const [isFormInitialized, setIsFormInitialized] = useState(false);

    useEffect(() => {
        if (bankInfo && !isFormInitialized) {
            setForm({
                bank_name: bankInfo.bank_name || 'KBZ',
                account_name: bankInfo.account_name || bankInfo.account_holder_name || '',
                account_number: bankInfo.account_number || '',
            });
            setIsFormInitialized(true);
        }
    }, [bankInfo, isFormInitialized]);

    const mutation = useMutation({
        mutationFn: async (payload: typeof form) => {
            if (bankInfo) return await updateMyBankInfoAPI(payload);
            return await createMyBankInfoAPI(payload);
        },
        onSuccess: (data) => {
            showToast(data?.message || (t('bank_info.toast_success', 'Bank info saved successfully.') as string), 'success');
            refreshWallet();
            setShowConfirm(false);
        },
        onError: (error: any) => {
            const errorData = error?.response?.data;
            const errMsg = errorData?.errors?.domain?.[0] || errorData?.message || (t('bank_info.toast_fail', 'Unable to save bank info. Please try again.') as string);
            showToast(errMsg, 'error');
            setShowConfirm(false);
        }
    });

    const isSubmitting = mutation.isPending;

    const handleSubmit = () => {
        if (!form.bank_name || !form.account_name || !form.account_number) {
            return showToast(t('bank_info.err_fill_all', 'Please fill in all fields.') as string);
        }
        if (bankInfo) {
            setShowConfirm(true);
        } else {
            mutation.mutate(form);
        }
    };

    const filteredBanks = BANKS.filter(b => b.code.toLowerCase().includes(bankSearch.toLowerCase()) || b.label.toLowerCase().includes(bankSearch.toLowerCase()));
    const activeBankLabel = BANKS.find(b => b.code === form.bank_name)?.label ?? '';

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                    </Pressable>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.eyebrow}>{t('bank_info.eyebrow', 'WALLET') as string}</Text>
                        <Text style={styles.title}>{t('bank_info.title', 'Bank Info') as string}</Text>
                    </View>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 60 }} />
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardHeaderLeft}>
                                    <MaterialIcons name="account-balance" size={20} color="#93C5FD" />
                                    <Text style={styles.cardTitle}>{t('bank_info.card_title', 'Bank account') as string}</Text>
                                </View>
                                {bankInfo && (
                                    <View style={styles.savedBadge}>
                                        <MaterialIcons name="check-circle" size={14} color="#00e676" />
                                        <Text style={styles.savedText}>{t('bank_info.saved', 'SAVED') as string}</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{t('bank_info.label_bank', 'BANK') as string}</Text>
                                <View style={[styles.dropdownInput, showBankList && { borderColor: 'rgba(59, 130, 246, 0.5)' }]}>
                                    {showBankList ? (
                                        <TextInput
                                            style={[styles.textInput, { flex: 1, paddingHorizontal: 0, paddingVertical: 0, borderWidth: 0 }]}
                                            autoFocus
                                            value={bankSearch}
                                            onChangeText={setBankSearch}
                                            placeholder={t('bank_info.search_placeholder', 'Search bank...') as string}
                                            placeholderTextColor="#4A5D7A"
                                            onBlur={() => {
                                                blurTimeoutRef.current = setTimeout(() => setShowBankList(false), 200);
                                            }}
                                        />
                                    ) : (
                                        <Pressable style={{ flex: 1 }} onPress={() => { setShowBankList(true); setBankSearch(''); }}>
                                            <Text style={styles.dropdownText}>{form.bank_name} — {activeBankLabel}</Text>
                                        </Pressable>
                                    )}
                                    <MaterialIcons name={showBankList ? "expand-less" : "expand-more"} size={20} color="#8A9BB3" />
                                </View>

                                {showBankList && (
                                    <View style={styles.dropdownBox}>
                                        <ScrollView
                                            style={{ maxHeight: 250 }}
                                            nestedScrollEnabled={true}
                                            keyboardShouldPersistTaps="handled"
                                        >
                                            {['MMK', 'THB'].map((cur: any) => {
                                                const items = filteredBanks.filter(b => b.currency === cur);
                                                if (items.length === 0) return null;
                                                return (
                                                    <View key={cur}>
                                                        <Text style={styles.dropdownHeader}>{CURRENCY_LABEL[cur as 'MMK' | 'THB']}</Text>
                                                        {items.map(b => (
                                                            <Pressable
                                                                key={b.code}
                                                                style={[styles.dropdownItem, form.bank_name === b.code && styles.dropdownItemActive]}
                                                                onPress={() => { setForm({ ...form, bank_name: b.code }); setShowBankList(false); }}
                                                            >
                                                                <Text style={[styles.dropdownItemCode, form.bank_name === b.code && { color: '#93C5FD' }]}>{b.code}</Text>
                                                                <Text style={styles.dropdownItemLabel}>{b.label}</Text>
                                                                {form.bank_name === b.code && <MaterialIcons name="check" size={16} color="#93C5FD" style={{ marginLeft: 'auto' }} />}
                                                            </Pressable>
                                                        ))}
                                                    </View>
                                                );
                                            })}
                                            {filteredBanks.length === 0 && <Text style={{ color: '#4A5D7A', padding: 16, textAlign: 'center' }}>{t('bank_info.no_banks_found', 'No banks found') as string}</Text>}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{t('bank_info.label_account_name', 'ACCOUNT NAME') as string}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={form.account_name}
                                    onChangeText={(val) => setForm({ ...form, account_name: val })}
                                    placeholder={t('bank_info.placeholder_account_name', 'e.g. Aung Ko Ko') as string}
                                    placeholderTextColor="#4A5D7A"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{t('bank_info.label_account_number', 'ACCOUNT NUMBER') as string}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={form.account_number}
                                    onChangeText={(val) => setForm({ ...form, account_number: val })}
                                    keyboardType="numeric"
                                    placeholder={t('bank_info.placeholder_account_number', 'e.g. 09123456789') as string}
                                    placeholderTextColor="#4A5D7A"
                                />
                            </View>

                            {cooldownUntil && (
                                <View style={styles.cooldownBox}>
                                    <Text style={styles.cooldownText}>
                                        {t('bank_info.cooldown_msg_1', 'Bank details can only be changed once every 30 days. You can update again on ') as string}
                                        {formatCooldownDate(cooldownUntil)}.
                                    </Text>
                                </View>
                            )}

                            <Pressable
                                onPress={handleSubmit}
                                disabled={!!cooldownUntil || isSubmitting}
                                style={({ pressed }) => [styles.submitBtnWrapper, (pressed || !!cooldownUntil) && { opacity: 0.8 }]}
                            >
                                <LinearGradient
                                    colors={['#3B82F6', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.submitBtn}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <MaterialIcons name={bankInfo ? "save" : "add-circle"} size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                            <Text style={styles.submitBtnText}>
                                                {bankInfo ? (t('bank_info.btn_update', 'Update Bank Info') as string) : (t('bank_info.btn_create', 'Create Bank Info') as string)}
                                            </Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </Pressable>
                        </View>

                    </ScrollView>
                )}
            </KeyboardAvoidingView>

            <Modal visible={showConfirm} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <MaterialIcons name="warning" size={24} color="#F59E0B" />
                            <Text style={styles.modalTitle}>{t('bank_info.modal_title', 'Update Bank Info?') as string}</Text>
                        </View>
                        <Text style={styles.modalDesc}>{t('bank_info.modal_desc', 'Changing your bank details will lock further updates for 30 days. Withdrawals will be sent to the new account. Proceed?') as string}</Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowConfirm(false)}>
                                <Text style={styles.modalBtnCancelText}>{t('bank_info.modal_cancel', 'Cancel') as string}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnConfirm} onPress={() => mutation.mutate(form)}>
                                <LinearGradient colors={['#3B82F6', '#6366F1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.modalBtnConfirmInner}>
                                    {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalBtnConfirmText}>{t('bank_info.modal_confirm', 'Yes, Update') as string}</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Animated.View style={[styles.toastContainer, toastAnimatedStyle, { borderColor: toastData.type === 'success' ? '#10B981' : '#F87171' }]}>
                <MaterialIcons name={toastData.type === 'success' ? 'check-circle' : 'error'} size={20} color={toastData.type === 'success' ? '#10B981' : '#F87171'} />
                <Text style={[styles.toastText, { color: toastData.type === 'success' ? '#34D399' : '#FCA5A5' }]}>{toastData.msg}</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: { marginRight: 16, paddingTop: 6 },
    headerTextContainer: { flex: 1 },
    eyebrow: { color: '#93C5FD', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
    title: { color: '#F7F9FF', fontSize: 24, fontWeight: 'bold' },
    scrollContent: { padding: 20, paddingBottom: 40 },

    card: {
        backgroundColor: 'rgba(11, 19, 43, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    cardTitle: { color: '#F7F9FF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    savedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 230, 118, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.25)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    savedText: { color: '#00e676', fontSize: 10, fontWeight: 'bold', marginLeft: 4, letterSpacing: 0.5 },

    formGroup: { marginBottom: 20 },
    label: { color: '#4A5D7A', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 8 },
    textInput: {
        backgroundColor: 'rgba(5, 10, 31, 0.68)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#F7F9FF',
        fontSize: 15,
    },
    dropdownInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(5, 10, 31, 0.68)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownText: { color: '#F7F9FF', fontSize: 15 },

    dropdownBox: {
        marginTop: 8,
        backgroundColor: '#080E28',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        overflow: 'hidden'
    },
    dropdownHeader: { backgroundColor: 'rgba(255,255,255,0.03)', color: '#4A5D7A', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 12, paddingVertical: 8, textTransform: 'uppercase' },
    dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    dropdownItemActive: { backgroundColor: 'rgba(59, 130, 246, 0.12)' },
    dropdownItemCode: { color: '#E2E8F0', fontSize: 14, fontWeight: 'bold', width: 60 },
    dropdownItemLabel: { color: '#8A9BB3', fontSize: 13, flex: 1 },

    cooldownBox: { backgroundColor: 'rgba(245, 158, 11, 0.08)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.25)', borderRadius: 12, padding: 12, marginBottom: 20 },
    cooldownText: { color: '#FEF3C7', fontSize: 13, lineHeight: 20 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', padding: 20 },
    modalContent: { backgroundColor: '#080E28', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    modalTitle: { color: '#E2E8F0', fontSize: 18, fontWeight: 'bold' },
    modalDesc: { color: '#8A9BB3', fontSize: 14, lineHeight: 22, marginBottom: 24 },
    modalActions: { gap: 12 },
    modalBtnConfirm: { borderRadius: 12, overflow: 'hidden' },
    modalBtnConfirmInner: { height: 50, alignItems: 'center', justifyContent: 'center' },
    modalBtnConfirmText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    modalBtnCancel: { height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    modalBtnCancelText: { color: '#8A9BB3', fontSize: 16, fontWeight: 'bold' },

    toastContainer: { position: 'absolute', top: 0, left: 20, right: 20, backgroundColor: '#0B291D', borderWidth: 1, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 9999, zIndex: 99999 },
    toastText: { fontSize: 13, fontWeight: 'bold', marginLeft: 8, letterSpacing: 0.5, flex: 1, textAlign: 'center' },

    submitBtnWrapper: { marginTop: 10, borderRadius: 12, overflow: 'hidden' },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});