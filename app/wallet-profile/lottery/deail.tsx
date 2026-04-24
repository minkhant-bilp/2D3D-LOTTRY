import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBankStore } from '@/store/useBankStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

const THEME = {
    bg: '#050A1F', cardBg: '#0B132B', inputBg: '#152243', borderNormal: 'rgba(255, 255, 255, 0.08)',
    textWhite: '#FFFFFF', textMuted: '#8A9BB3', neonGreen: '#00E676', danger: '#FF3B30', gold: '#FFD700',
};

export default function BankDetailSetupScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const bindBank = useBankStore((state) => state.bindBank);

    const { bankId = '1', bankName = 'Bank', bankColor = '#1B5497', bankIcon = 'bank', bankType = 'Bank Account' } = useLocalSearchParams<{
        bankId: string; bankName: string; bankColor: string; bankIcon: any; bankType: string;
    }>();

    const [accName, setAccName] = useState('');
    const [accNumber, setAccNumber] = useState('');

    const [nameError, setNameError] = useState('');
    const [numError, setNumError] = useState('');

    const handleSubmit = () => {
        let isValid = true;

        if (accName.trim().length < 3) {
            setNameError('ကျေးဇူးပြု၍ ဘဏ်ဖွင့်ထားသော အမည်အမှန်ကို ထည့်သွင်းပါ။');
            isValid = false;
        } else {
            setNameError('');
        }

        if (accNumber.trim().length < 6) {
            setNumError('အချက်အလက်များ မှားယွင်းနေပါသည်။ ပြန်လည်စစ်ဆေးပါ။');
            isValid = false;
        } else {
            setNumError('');
        }

        if (isValid) {
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const dateString = `${nextMonth.getDate().toString().padStart(2, '0')}-${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}-${nextMonth.getFullYear()}`;

            bindBank({
                bankId,
                bankName,
                bankColor,
                bankIcon,
                bankType,
                accName: accName.trim(),
                accNumber: accNumber.trim(),
                nextChangeDate: dateString
            });

            alert('အကောင့်ချိတ်ဆက်ခြင်း အောင်မြင်ပါသည်။');
            router.back();
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, s(10, 15, 20)) }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={s(20, 26, 34)} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>အချက်အလက် ဖြည့်သွင်းမည်</Text>
                <View style={{ width: s(36, 40, 50) }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: s(100, 120, 150) }} keyboardShouldPersistTaps="handled">
                <View style={[styles.compactBankCard, { borderLeftColor: bankColor }]}>
                    <View style={[styles.compactIconWrapper, { backgroundColor: bankColor + '20' }]}>
                        <MaterialCommunityIcons name={bankIcon} size={s(24, 28, 34)} color={bankColor === '#FFD100' ? '#D4AF37' : bankColor} />
                    </View>
                    <View style={styles.compactBankInfo}>
                        <Text style={styles.compactBankName}>{bankName}</Text>
                        <Text style={styles.compactBankType}>{bankType}</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={s(20, 24, 28)} color={THEME.neonGreen} />
                </View>

                <View style={styles.rulesBox}>
                    <View style={styles.rulesHeader}>
                        <Ionicons name="shield-checkmark" size={s(16, 20, 24)} color={THEME.neonGreen} />
                        <Text style={styles.rulesTitle}>အထူးသတိပြုရန်</Text>
                    </View>
                    <View style={styles.ruleItem}>
                        <View style={styles.ruleDot} />
                        <Text style={styles.ruleText}>ငွေသွင်း/ငွေထုတ် ပြုလုပ်ရန် <Text style={styles.highlightText}>နာမည်နှင့် အကောင့်နံပါတ်</Text> တိကျစွာ ဖြည့်သွင်းပေးပါ။</Text>
                    </View>
                    <View style={styles.ruleItem}>
                        <View style={styles.ruleDot} />
                        <Text style={styles.ruleText}>လုံခြုံရေးအရ ဘဏ်အချက်အလက်များကို <Text style={styles.highlightGold}>၁ လ ပြည့်မှသာ တစ်ကြိမ်</Text> ပြန်လည်ပြောင်းလဲခွင့် ရှိပါမည်။</Text>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>အကောင့်ပိုင်ရှင် အမည် (Account Name)</Text>
                        <TextInput
                            style={[styles.inputField, nameError ? styles.inputErrorBorder : null]}
                            placeholder="ဥပမာ - U Aung Aung"
                            placeholderTextColor={THEME.textMuted}
                            value={accName}
                            onChangeText={setAccName}
                        />
                        {nameError ? <Text style={styles.errorText}><Ionicons name="warning-outline" size={s(12, 14, 16)} /> {nameError}</Text> : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{bankType === 'Mobile Wallet' ? 'ဖုန်းနံပါတ် (Phone Number)' : 'အကောင့်နံပါတ် (Account Number)'}</Text>
                        <TextInput
                            style={[styles.inputField, numError ? styles.inputErrorBorder : null]}
                            placeholder={bankType === 'Mobile Wallet' ? "09xxxxxxxxx" : "xxxxxxxxxxxxxx"}
                            placeholderTextColor={THEME.textMuted}
                            keyboardType="number-pad"
                            value={accNumber}
                            onChangeText={setAccNumber}
                        />
                        {numError ? <Text style={styles.errorText}><Ionicons name="close-circle" size={s(12, 14, 16)} /> {numError}</Text> : null}
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom + s(8, 10, 14), s(12, 15, 20)) }]}>
                <Pressable style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitBtnText}>ချိတ်ဆက်မှုကို အတည်ပြုမည်</Text>
                    <Ionicons name="checkmark-done-circle" size={s(18, 22, 26)} color="#000" style={{ marginLeft: s(8, 10, 14) }} />
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: s(12, 16, 24), paddingBottom: s(12, 15, 20), borderBottomWidth: 1, borderBottomColor: THEME.borderNormal, backgroundColor: THEME.bg, zIndex: 10 },

    backButton: { width: s(36, 40, 50), height: s(36, 40, 50), borderRadius: s(18, 20, 25), backgroundColor: THEME.inputBg, justifyContent: 'center', alignItems: 'center' },

    headerTitle: { color: THEME.textWhite, fontSize: s(16, 18, 24), fontWeight: 'bold' },

    compactBankCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.cardBg, marginHorizontal: s(16, 20, 24), marginTop: s(20, 24, 30), padding: s(12, 16, 20), borderRadius: s(14, 16, 20), borderWidth: 1, borderColor: THEME.borderNormal, borderLeftWidth: s(4, 5, 6) },

    compactIconWrapper: { width: s(44, 52, 64), height: s(44, 52, 64), borderRadius: s(12, 14, 18), justifyContent: 'center', alignItems: 'center', marginRight: s(12, 16, 20) },

    compactBankInfo: { flex: 1, justifyContent: 'center' },

    compactBankName: { color: THEME.textWhite, fontSize: s(15, 18, 22), fontWeight: 'bold', marginBottom: s(2, 4, 6) },

    compactBankType: { color: THEME.textMuted, fontSize: s(11, 13, 16), fontWeight: '600' },

    rulesBox: { backgroundColor: 'rgba(0, 230, 118, 0.05)', padding: s(16, 20, 26), borderRadius: s(14, 16, 20), borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', marginHorizontal: s(16, 20, 24), marginTop: s(16, 20, 24) },

    rulesHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: s(10, 14, 18), gap: s(6, 8, 10) },

    rulesTitle: { color: THEME.neonGreen, fontSize: s(13, 15, 18), fontWeight: 'bold' },

    ruleItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: s(6, 8, 12), paddingRight: s(10, 14, 18) },

    ruleDot: { width: s(6, 8, 10), height: s(6, 8, 10), borderRadius: s(3, 4, 5), backgroundColor: THEME.neonGreen, marginTop: s(4, 5, 6), marginRight: s(10, 12, 16) },

    ruleText: { flex: 1, color: THEME.textMuted, fontSize: s(11, 13, 16), lineHeight: s(18, 22, 28) },

    highlightText: { color: THEME.textWhite, fontWeight: 'bold' }, highlightGold: { color: THEME.gold, fontWeight: 'bold' },

    formContainer: { marginHorizontal: s(16, 20, 24), marginTop: s(24, 30, 40) },

    inputGroup: { marginBottom: s(20, 24, 30) },

    inputLabel: { color: THEME.textWhite, fontSize: s(13, 15, 18), fontWeight: 'bold', marginBottom: s(8, 10, 14) },

    inputField: { backgroundColor: THEME.inputBg, color: THEME.textWhite, fontSize: s(15, 18, 22), fontWeight: '600', height: s(50, 60, 70), borderRadius: s(12, 14, 18), paddingHorizontal: s(16, 20, 24), borderWidth: 1, borderColor: THEME.borderNormal },

    inputErrorBorder: { borderColor: THEME.danger, backgroundColor: 'rgba(255, 59, 48, 0.05)' },

    errorText: { color: THEME.danger, fontSize: s(11, 13, 15), marginTop: s(6, 8, 10), fontWeight: 'bold' },

    bottomPanel: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: THEME.bg, paddingHorizontal: s(16, 20, 24), paddingTop: s(12, 15, 20), borderTopWidth: 1, borderTopColor: THEME.borderNormal },

    submitBtn: { flexDirection: 'row', backgroundColor: THEME.neonGreen, height: s(48, 56, 68), borderRadius: s(14, 16, 20), justifyContent: 'center', alignItems: 'center', elevation: 8 },

    submitBtnText: { color: '#000', fontSize: s(15, 18, 22), fontWeight: 'bold' },
});