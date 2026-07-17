import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WalletCurrency = 'MMK' | 'THB';

interface BankInfo {
    code: string;
    label: string;
    currency: WalletCurrency;
}

const BANKS_DATA: BankInfo[] = [
    { code: 'KBZ', label: 'Kanbawza Bank', currency: 'MMK' },
    { code: 'AYA', label: 'AYA Bank', currency: 'MMK' },
    { code: 'CB', label: 'CB Bank', currency: 'MMK' },
    { code: 'UAB', label: 'United Amara Bank', currency: 'MMK' },
    { code: 'YOMA', label: 'Yoma Bank', currency: 'MMK' },
    { code: 'WAVE', label: 'Wave Money', currency: 'MMK' },
    { code: 'KPay', label: 'KBZPay', currency: 'MMK' },
    { code: 'KBANK', label: 'Kasikorn Bank', currency: 'THB' },
    { code: 'BBL', label: 'Bangkok Bank', currency: 'THB' },
    { code: 'KTB', label: 'Krungthai Bank', currency: 'THB' },
    { code: 'BAY', label: 'Bank of Ayudhya (Krungsri)', currency: 'THB' },
    { code: 'TTB', label: 'TMBThanachart Bank', currency: 'THB' },
    { code: 'GSB', label: 'Government Savings Bank', currency: 'THB' },
];

export default function BankSetupPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [currencyLocked, setCurrencyLocked] = useState(false);
    const [currency, setCurrency] = useState<WalletCurrency>('MMK');
    const [bankName, setBankName] = useState<string>('KBZ');
    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    const [bankSearch, setBankSearch] = useState('');
    const [showBankList, setShowBankList] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCurrencySelect = useCallback((code: WalletCurrency) => {
        setCurrency(code);
        const firstBank = BANKS_DATA.find(b => b.currency === code);
        if (firstBank) {
            setBankName(firstBank.code);
        }
        setShowBankList(false);
        setBankSearch('');
    }, []);

    const filteredBanks = useMemo(() => {
        const banksByCurrency = BANKS_DATA.filter(b => b.currency === currency);
        const q = bankSearch.toLowerCase().trim();
        if (!q) return banksByCurrency;
        return banksByCurrency.filter(
            b => b.code.toLowerCase().includes(q) || b.label.toLowerCase().includes(q)
        );
    }, [currency, bankSearch]);

    const handleBankSelect = useCallback((code: string) => {
        setBankName(code);
        setShowBankList(false);
        setBankSearch('');
        Keyboard.dismiss();
    }, []);

    const handleSubmit = useCallback(async () => {
        Keyboard.dismiss();
        setError(null);

        if (!bankName || !accountName.trim() || !accountNumber.trim()) {
            setError('Please fill out all required fields.');
            return;
        }

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            router.replace('/(tabs)');
        } catch (err) {
            setError('Setup failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [bankName, accountName, accountNumber, router]);

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={() => {
                    Keyboard.dismiss();
                    setShowBankList(false);
                }}>
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            {
                                paddingTop: Math.max(insets.top + 24, 40),
                                paddingBottom: Math.max(insets.bottom + 24, 40)
                            }
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.header}>
                            <Text style={styles.headerSubtitle}>ACCOUNT SETUP</Text>
                            <Text style={styles.headerTitle}>Bank Setup</Text>
                            <Text style={styles.headerDescription}>
                                Link your bank account to enable withdrawals.
                            </Text>
                        </View>

                        <View style={styles.warningBanner}>
                            <MaterialIcons name="warning" size={20} color="#fcd34d" style={styles.warningIcon} />
                            <Text style={styles.warningText}>
                                Your currency cannot be changed after setup. Choose the currency you use for all deposits and bets.
                            </Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>CURRENCY</Text>
                                <View style={styles.currencyRow}>
                                    {(['MMK', 'THB'] as WalletCurrency[]).map(code => {
                                        const isActive = currency === code;
                                        return (
                                            <Pressable
                                                key={code}
                                                style={[styles.currencyBtn, isActive && styles.currencyBtnActive]}
                                                onPress={() => handleCurrencySelect(code)}
                                            >
                                                <View style={styles.currencyBtnTop}>
                                                    <Text style={[styles.currencyBtnTitle, isActive && styles.currencyBtnTitleActive]}>
                                                        {code}
                                                    </Text>
                                                    {isActive && (
                                                        <MaterialIcons name="check-circle" size={18} color="#00e676" />
                                                    )}
                                                </View>
                                                <Text style={styles.currencyBtnDesc}>
                                                    {code === 'MMK' ? 'Myanmar Kyat' : 'Thai Baht'}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>BANK NAME</Text>
                                <View style={styles.dropdownContainer}>
                                    <TextInput
                                        style={[styles.input, showBankList && styles.inputActive]}
                                        value={showBankList ? bankSearch : `${bankName} — ${BANKS_DATA.find(b => b.code === bankName)?.label}`}
                                        placeholder="Search bank..."
                                        placeholderTextColor="#3a4d66"
                                        onFocus={() => {
                                            setShowBankList(true);
                                            setBankSearch('');
                                        }}
                                        onChangeText={setBankSearch}
                                    />
                                    <View style={styles.dropdownIcon}>
                                        <MaterialIcons
                                            name={showBankList ? "expand-less" : "expand-more"}
                                            size={20}
                                            color="#4a5d7a"
                                        />
                                    </View>
                                </View>

                                {showBankList && (
                                    <View style={styles.inlineBankList}>
                                        {filteredBanks.map(b => (
                                            <Pressable
                                                key={b.code}
                                                style={[styles.listItem, bankName === b.code && styles.listItemActive]}
                                                onPress={() => handleBankSelect(b.code)}
                                            >
                                                <Text style={styles.listItemCode}>{b.code}</Text>
                                                <Text style={styles.listItemLabel}>{b.label}</Text>
                                                {bankName === b.code && (
                                                    <MaterialIcons name="check" size={18} color="#93c5fd" />
                                                )}
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>ACCOUNT NAME</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Aung Ko Ko"
                                    placeholderTextColor="#3a4d66"
                                    value={accountName}
                                    onChangeText={setAccountName}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>ACCOUNT NUMBER</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 09123456789"
                                    placeholderTextColor="#3a4d66"
                                    value={accountNumber}
                                    onChangeText={setAccountNumber}
                                    keyboardType="numeric"
                                />
                            </View>

                            {error && (
                                <View style={styles.errorBox}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                                activeOpacity={0.8}
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#003824" size="small" />
                                ) : (
                                    <Text style={styles.submitBtnText}>CONFIRM & ENTER</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 20 },
    header: { marginBottom: 24 },
    headerSubtitle: { color: '#93c5fd', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase' },
    headerTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: '700', marginTop: 6, marginBottom: 4 },
    headerDescription: { color: '#8a9bb3', fontSize: 14, marginTop: 6 },
    warningBanner: { flexDirection: 'row', backgroundColor: 'rgba(245, 158, 11, 0.08)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.25)', borderRadius: 12, padding: 16, marginBottom: 24 },
    warningIcon: { marginRight: 10, marginTop: 2 },
    warningText: { flex: 1, color: '#fef3c7', fontSize: 13, lineHeight: 20 },
    formContainer: { paddingBottom: 20 },
    fieldGroup: { marginBottom: 20 },
    label: { color: '#4a5d7a', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: 10 },
    currencyRow: { flexDirection: 'row', gap: 12 },
    currencyBtn: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 14 },
    currencyBtnActive: { backgroundColor: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.4)' },
    currencyBtnTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    currencyBtnTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
    currencyBtnTitleActive: { color: '#00e676' },
    currencyBtnDesc: { color: '#8a9bb3', fontSize: 11 },
    dropdownContainer: { position: 'relative', justifyContent: 'center' },
    input: { backgroundColor: 'rgba(5, 10, 31, 0.68)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, height: 52, paddingHorizontal: 14, color: '#f7f9ff', fontSize: 14.5 },
    inputActive: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderColor: '#1E293B' },
    dropdownIcon: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
    inlineBankList: { backgroundColor: '#0F172A', borderWidth: 1, borderTopWidth: 0, borderColor: '#1E293B', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
    listItemActive: { backgroundColor: 'rgba(59, 130, 246, 0.15)' },
    listItemCode: { color: '#e2e8f0', fontWeight: 'bold', fontSize: 14, width: 60 },
    listItemLabel: { color: '#8a9bb3', fontSize: 13, flex: 1 },
    errorBox: { backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: 14, marginBottom: 20 },
    errorText: { color: '#f87171', fontSize: 13 },
    submitBtn: { backgroundColor: '#00e676', height: 56, width: '100%', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#00e676', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { color: '#003824', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});