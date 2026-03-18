import { useBetStore } from '@/store/useBetStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

const THEME = {
    bg: '#050A1F',
    cardBg: '#152243',
    border: '#1E293B',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    danger: '#FF4D4D',
    infoBg: 'rgba(0, 178, 255, 0.1)',
    infoBorder: 'rgba(0, 178, 255, 0.3)',
    infoText: '#00B2FF',
};

const BANKS = {
    MM: [
        { id: 'kpay', name: 'KPay', image: require('../../assets/paymet-image/kbz.png'), color: '#00B2FF' },
        { id: 'wave', name: 'WavePay', image: require('../../assets/paymet-image/wave.png'), color: '#FFD700' },
    ],
    TH: [
        { id: 'kbank', name: 'Kasikorn', image: require('../../assets/paymet-image/karsilon.png'), color: '#34C759' },
        { id: 'truemoney', name: 'TrueMoney', image: require('../../assets/paymet-image/truemoney.png'), color: '#FF9500' },
        { id: 'scb', name: 'SCB', image: require('../../assets/paymet-image/scb.png'), color: '#AF52DE' },
        { id: 'krungthai', name: 'Krungthai', image: require('../../assets/paymet-image/kurnthai.png'), color: '#32ADE6' },
        { id: 'ttb', name: 'ttb', image: require('../../assets/paymet-image/ttb.png'), color: '#32ADE6' },
    ],
};

const LANGUAGES = [
    { code: 'EN', name: 'English' },
    { code: 'MM', name: 'မြန်မာ' },
    { code: 'TH', name: 'ไทย' },
];

export default function SelectPayment() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const setPaymentInfo = useBetStore((state) => state.setPaymentInfo);

    const [country, setCountry] = useState<'MM' | 'TH'>('MM');
    const [selectedLang, setSelectedLang] = useState('EN');
    const [showLangModal, setShowLangModal] = useState(false);

    const [selectedBank, setSelectedBank] = useState<any | null>(null);
    const [showBankModal, setShowBankModal] = useState(false);

    const [accountName, setAccountName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const canSubmit = accountName.trim().length > 2 && accountNumber.length > 5;

    const handleCountryChange = (c: 'MM' | 'TH') => {
        setCountry(c);
        setErrorMessage('');
    };

    const handleBankPress = (bank: any) => {
        setSelectedBank(bank);
        setAccountName('');

        const prefix = country === 'MM' ? '+95 ' : '+66 ';
        setAccountNumber(prefix);
        setErrorMessage('');
        setShowBankModal(true);
    };

    const handlePhoneInput = (val: string) => {
        const prefix = country === 'MM' ? '+95 ' : '+66 ';

        if (!val.startsWith(prefix)) {
            setAccountNumber(prefix);
        } else {
            const numberPart = val.slice(prefix.length).replace(/[^0-9]/g, '');
            setAccountNumber(prefix + numberPart);
        }
        setErrorMessage('');
    };

    const handleNameInput = (val: string) => {
        setAccountName(val);
        setErrorMessage('');
    };

    const handleConnectBank = () => {
        if (!canSubmit) return;
        Keyboard.dismiss();

        const nameRegex = /^[a-zA-Z\u1000-\u109F\u0E00-\u0E7F\s]+$/;
        if (!nameRegex.test(accountName.trim())) {
            setErrorMessage('အကောင့်ပိုင်ရှင် အမည် မှားယွင်းနေပါသည်။ စာသားသီးသန့်သာ ထည့်ပါ။');
            return;
        }

        const phoneDigits = accountNumber.replace(/[^0-9]/g, '');

        if (country === 'MM' && (phoneDigits.length < 11 || phoneDigits.length > 12)) {
            setErrorMessage('မြန်မာ ဖုန်းနံပါတ် မှားယွင်းနေပါသည်။ ပြန်လည်စစ်ဆေးပါ။');
            return;
        }

        if (country === 'TH' && phoneDigits.length !== 11) {
            setErrorMessage('ထိုင်း ဖုန်းနံပါတ် မှားယွင်းနေပါသည်။ ပြန်လည်စစ်ဆေးပါ။');
            return;
        }

        setShowBankModal(false);
        setIsLoading(true);

        const symbol = country === 'MM' ? 'Ks' : 'B';
        setPaymentInfo(country, symbol, selectedBank?.name || '', selectedBank?.image, selectedBank?.color || '#00E676');

        setTimeout(() => {
            setIsLoading(false);
            setShowToast(true);

            setTimeout(() => {
                setShowToast(false);
                router.replace('/(tabs)');
            }, 1000);

        }, 2000);
    };

    return (
        <View style={styles.root}>

            {showToast && (
                <View style={styles.toastContainer}>
                    <Ionicons name="checkmark-circle" size={s(18, 20, 26)} color={THEME.neonGreen} style={{ marginRight: 8 }} />
                    <Text style={styles.toastText}>ဘဏ်ချိတ်ဆက်ခြင်း အောင်မြင်ပါသည်</Text>
                </View>
            )}

            <Modal visible={isLoading} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={THEME.neonGreen} />
                        <Text style={styles.loadingText}>ချိတ်ဆက်နေပါသည်...</Text>
                    </View>
                </View>
            </Modal>

            <Modal visible={showLangModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <Pressable style={styles.modalCenterContainer} onPress={() => setShowLangModal(false)}>
                        <TouchableWithoutFeedback>
                            <View style={styles.langAlertBox}>
                                <Ionicons name="globe-outline" size={s(36, 42, 54)} color={THEME.infoText} style={{ marginBottom: s(10, 15, 20) }} />
                                <Text style={styles.alertTitle}>Select Language</Text>

                                <View style={styles.langListWrapper}>
                                    {LANGUAGES.map((lang) => (
                                        <Pressable
                                            key={lang.code}
                                            style={[styles.langOptionBtn, selectedLang === lang.code && styles.langOptionActive]}
                                            onPress={() => {
                                                setSelectedLang(lang.code);
                                                setShowLangModal(false);
                                            }}
                                        >
                                            <Text style={[styles.langOptionText, selectedLang === lang.code && { color: '#000', fontWeight: 'bold' }]}>
                                                {lang.name}
                                            </Text>
                                            {selectedLang === lang.code && <Ionicons name="checkmark-circle" size={s(18, 20, 26)} color="#000" />}
                                        </Pressable>
                                    ))}
                                </View>

                                <Pressable style={styles.closeAlertBtn} onPress={() => setShowLangModal(false)}>
                                    <Text style={styles.closeAlertText}>ပိတ်မည်</Text>
                                </Pressable>
                            </View>
                        </TouchableWithoutFeedback>
                    </Pressable>
                </View>
            </Modal>

            <Modal visible={showBankModal} transparent animationType="fade">
                <View style={styles.modalBackdrop}>
                    <KeyboardAvoidingView
                        style={{ flex: 1, width: '100%' }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: s(15, 20, 30) }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            bounces={false}
                        >
                            <View style={styles.bankAlertBox}>

                                <View style={styles.bankModalHeader}>
                                    <View style={styles.modalBankIcon}>
                                        {selectedBank?.image && (
                                            <Image source={selectedBank.image} style={styles.bankImage} />
                                        )}
                                    </View>
                                    <Text style={styles.modalBankName}>{selectedBank?.name}</Text>
                                    <Pressable onPress={() => setShowBankModal(false)} style={styles.closeIconBtn}>
                                        <Ionicons name="close" size={s(18, 22, 28)} color={THEME.textMuted} />
                                    </Pressable>
                                </View>

                                <View style={styles.formContainer}>
                                    <Text style={styles.inputLabel}>အကောင့်ပိုင်ရှင် အမည်</Text>
                                    <View style={[styles.inputBox, errorMessage.includes('အမည်') && styles.inputBoxError]}>
                                        <Ionicons name="person-outline" size={s(18, 20, 24)} color={errorMessage.includes('အမည်') ? THEME.danger : THEME.textMuted} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.inputField}
                                            placeholder="ဥပမာ - U Hlaing Min"
                                            placeholderTextColor={THEME.textMuted}
                                            value={accountName}
                                            onChangeText={handleNameInput}
                                            autoCapitalize="words"
                                        />
                                    </View>

                                    <Text style={styles.inputLabel}>အကောင့်နံပါတ် / ဖုန်းနံပါတ်</Text>
                                    <View style={[styles.inputBox, errorMessage.includes('ဖုန်းနံပါတ်') && styles.inputBoxError]}>
                                        <Ionicons name="call-outline" size={s(18, 20, 24)} color={errorMessage.includes('ဖုန်းနံပါတ်') ? THEME.danger : THEME.textMuted} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.inputField}
                                            placeholderTextColor={THEME.textMuted}
                                            keyboardType="phone-pad"
                                            value={accountNumber}
                                            onChangeText={handlePhoneInput}
                                        />
                                    </View>
                                </View>

                                {errorMessage ? (
                                    <View style={styles.errorBox}>
                                        <Ionicons name="warning" size={s(14, 16, 20)} color={THEME.danger} />
                                        <Text style={styles.errorText}>{errorMessage}</Text>
                                    </View>
                                ) : null}

                                <Pressable
                                    style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                                    onPress={handleConnectBank}
                                    disabled={!canSubmit}
                                >
                                    <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
                                        အတည်ပြုမည်
                                    </Text>
                                </Pressable>

                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <View style={[styles.header, { paddingTop: Math.max(insets.top, 35) }]}>
                <Text style={styles.headerTitle}>Payment Setup</Text>

                <Pressable style={styles.langBtn} onPress={() => setShowLangModal(true)}>
                    <Ionicons name="globe-outline" size={s(16, 18, 22)} color={THEME.infoText} />
                    <Text style={styles.langBtnText}>{selectedLang}</Text>
                    <Ionicons name="chevron-down" size={s(12, 14, 18)} color={THEME.textMuted} />
                </Pressable>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.sectionLabel}>နိုင်ငံ ရွေးချယ်ပါ</Text>
                <View style={styles.tabContainer}>
                    <Pressable style={[styles.tabBtn, country === 'MM' && styles.tabBtnActive]} onPress={() => handleCountryChange('MM')}>
                        <Text style={[styles.tabText, country === 'MM' && styles.tabTextActive]}>🇲🇲 မြန်မာ</Text>
                    </Pressable>
                    <Pressable style={[styles.tabBtn, country === 'TH' && styles.tabBtnActive]} onPress={() => handleCountryChange('TH')}>
                        <Text style={[styles.tabText, country === 'TH' && styles.tabTextActive]}>🇹🇭 ထိုင်း</Text>
                    </Pressable>
                </View>

                <Text style={styles.sectionLabel}>ဘဏ်အမျိုးအစား ရွေးချယ်ပါ</Text>
                <View style={styles.bankGrid}>
                    {BANKS[country].map((bank) => (
                        <Pressable
                            key={bank.id}
                            style={styles.bankCard}
                            onPress={() => handleBankPress(bank)}
                        >
                            <View style={styles.bankIconBox}>
                                {bank.image && (
                                    <Image source={bank.image} style={styles.bankImage} />
                                )}
                            </View>
                            <Text style={styles.bankName}>{bank.name}</Text>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.noticeBox}>
                    <View style={styles.noticeHeader}>
                        <Ionicons name="shield-checkmark" size={s(18, 20, 26)} color={THEME.infoText} />
                        <Text style={styles.noticeTitle}>အရေးကြီး အသိပေးချက်</Text>
                    </View>
                    <Text style={styles.noticeBody}>
                        လူကြီးမင်း၏ လုံခြုံရေးအတွက် ဂဏန်းထိုးရာတွင် ငွေသွင်းခြင်း၊ ဆုမဲပေါက်ပါက ငွေထုတ်ယူခြင်းများကို <Text style={styles.highlightText}>ယခုချိတ်ဆက်ထားသော ဘဏ်အကောင့်တစ်ခုတည်းဖြင့်သာ</Text> လုပ်ဆောင်ရမည် ဖြစ်ပါသည်။ သို့ဖြစ်ပါ၍ အကောင့်ပိုင်ရှင်အမည်နှင့် ဖုန်းနံပါတ်ကို အတိအကျ မှန်ကန်စွာ ထည့်သွင်းပေးပါ။
                    </Text>
                </View>
                <View style={{ height: s(50, 70, 90) }}></View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: THEME.bg
    },
    toastContainer: {
        position: 'absolute',
        top: s(80, 100, 120),
        alignSelf: 'center',
        backgroundColor: THEME.cardBg,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(15, 20, 30),
        paddingVertical: s(10, 12, 16),
        borderRadius: s(20, 25, 30),
        borderWidth: 1,
        borderColor: THEME.neonGreen,
        zIndex: 1000
    },
    toastText: {
        color: THEME.textWhite,
        fontSize: s(13, 14, 16),
        fontWeight: 'bold'
    },
    loadingBox: {
        backgroundColor: THEME.cardBg,
        borderRadius: s(16, 20, 24),
        padding: s(25, 30, 45),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.neonGreen
    },
    loadingText: {
        color: THEME.textWhite,
        fontSize: s(14, 15, 18),
        fontWeight: 'bold',
        marginTop: s(12, 15, 20)
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: s(15, 20, 30),
        paddingBottom: s(12, 15, 20),
        borderBottomWidth: 1,
        borderBottomColor: THEME.border
    },
    headerTitle: {
        color: THEME.textWhite,
        fontSize: s(18, 20, 26),
        fontWeight: 'bold'
    },
    langBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.cardBg,
        paddingHorizontal: s(10, 12, 16),
        paddingVertical: s(6, 8, 12),
        borderRadius: s(10, 12, 16),
        borderWidth: 1,
        borderColor: THEME.border,
        gap: s(4, 6, 10)
    },
    langBtnText: {
        color: THEME.textWhite,
        fontSize: s(13, 14, 16),
        fontWeight: 'bold'
    },

    scrollContent: {
        paddingHorizontal: s(15, 20, 30),
        paddingTop: s(15, 20, 30),
        paddingBottom: s(40, 50, 70)
    },
    sectionLabel: {
        color: THEME.textWhite,
        fontSize: s(15, 16, 20),
        fontWeight: 'bold',
        marginBottom: s(10, 12, 16)
    },

    tabContainer: {
        flexDirection: 'row',
        backgroundColor: THEME.cardBg,
        borderRadius: s(12, 14, 18),
        padding: s(3, 4, 6),
        marginBottom: s(25, 30, 45),
        borderWidth: 1,
        borderColor: THEME.border
    },
    tabBtn: {
        flex: 1,
        paddingVertical: s(12, 14, 18),
        alignItems: 'center',
        borderRadius: s(10, 12, 16)
    },
    tabBtnActive: {
        backgroundColor: THEME.neonGreen
    },
    tabText: {
        color: THEME.textMuted,
        fontSize: s(14, 15, 18),
        fontWeight: 'bold'
    },
    tabTextActive: {
        color: '#000',
        fontWeight: '900'
    },

    bankGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: s(12, 15, 20),
        marginBottom: s(30, 40, 60)
    },
    bankCard: {
        width: s('48%', '48%', '31%'),
        backgroundColor: THEME.cardBg,
        borderWidth: 1,
        borderColor: THEME.border,
        borderRadius: s(16, 20, 24),
        padding: s(15, 20, 30),
        alignItems: 'center'
    },
    bankIconBox: {
        width: s(48, 56, 70),
        height: s(48, 56, 70),
        borderRadius: s(12, 14, 18),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: s(10, 12, 16),
        borderWidth: 1,
        borderColor: THEME.border,
        overflow: 'hidden'
    },
    bankName: {
        color: THEME.textWhite,
        fontSize: s(14, 15, 18),
        fontWeight: 'bold'
    },
    bankImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: s(10, 12, 16)
    },

    noticeBox: {
        backgroundColor: THEME.infoBg,
        borderWidth: 1,
        borderColor: THEME.infoBorder,
        borderRadius: s(14, 16, 20),
        padding: s(15, 18, 25)
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: s(8, 10, 14)
    },
    noticeTitle: {
        color: THEME.infoText,
        fontSize: s(15, 16, 20),
        fontWeight: 'bold',
        marginLeft: s(6, 8, 12)
    },
    noticeBody: {
        color: THEME.textMuted,
        fontSize: s(13, 14, 16),
        lineHeight: s(20, 24, 28)
    },
    highlightText: {
        color: THEME.textWhite,
        fontWeight: 'bold'
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalCenterContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: s(15, 20, 30)
    },

    langAlertBox: {
        width: s('90%', '85%', '50%'),
        maxWidth: s(340, 380, 500),
        backgroundColor: THEME.cardBg,
        borderRadius: s(20, 24, 30),
        padding: s(20, 25, 35),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.border
    },
    alertTitle: {
        color: THEME.textWhite,
        fontSize: s(18, 20, 26),
        fontWeight: 'bold',
        marginBottom: s(15, 20, 25)
    },
    langListWrapper: {
        width: '100%',
        marginBottom: s(10, 15, 20)
    },
    langOptionBtn: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: s(12, 14, 18),
        borderRadius: s(10, 12, 16),
        marginBottom: s(8, 10, 14),
        backgroundColor: THEME.bg,
        borderWidth: 1,
        borderColor: THEME.border
    },
    langOptionActive: {
        backgroundColor: THEME.neonGreen,
        borderColor: THEME.neonGreen
    },
    langOptionText: {
        color: THEME.textWhite,
        fontSize: s(14, 15, 18),
        fontWeight: '600'
    },
    closeAlertBtn: {
        width: '100%',
        paddingVertical: s(12, 14, 18),
        borderRadius: s(12, 14, 18),
        backgroundColor: THEME.bg,
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: 'center',
        marginTop: s(8, 10, 15)
    },
    closeAlertText: {
        color: THEME.textWhite,
        fontSize: s(14, 15, 18),
        fontWeight: 'bold'
    },

    bankAlertBox: {
        width: s('95%', '100%', '60%'),
        maxWidth: s(360, 400, 600),
        backgroundColor: THEME.cardBg,
        borderRadius: s(20, 24, 30),
        padding: s(20, 25, 35),
        borderWidth: 1,
        borderColor: THEME.border,
        flexShrink: 0
    },
    bankModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: s(20, 25, 35),
        flexShrink: 0
    },
    modalBankIcon: {
        width: s(40, 50, 65),
        height: s(40, 50, 65),
        borderRadius: s(10, 12, 16),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(12, 15, 20),
        borderWidth: 1,
        borderColor: THEME.border,
        overflow: 'hidden'
    },
    modalBankName: {
        color: THEME.textWhite,
        fontSize: s(18, 22, 28),
        fontWeight: 'bold',
        flex: 1
    },
    closeIconBtn: {
        width: s(30, 36, 44),
        height: s(30, 36, 44),
        borderRadius: s(15, 18, 22),
        backgroundColor: THEME.bg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.border
    },

    formContainer: {
        width: '100%',
        marginBottom: s(10, 15, 20),
        flexShrink: 0
    },
    inputLabel: {
        color: THEME.textMuted,
        fontSize: s(12, 13, 16),
        fontWeight: 'bold',
        marginBottom: s(6, 8, 12)
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.bg,
        borderRadius: s(12, 14, 18),
        borderWidth: 1,
        borderColor: THEME.border,
        paddingHorizontal: s(12, 15, 20),
        height: s(50, 55, 65),
        minHeight: s(50, 55, 65),
        marginBottom: s(14, 18, 24),
        flexShrink: 0
    },
    inputBoxError: {
        borderColor: THEME.danger
    },
    inputIcon: {
        marginRight: s(8, 12, 16)
    },
    inputField: {
        flex: 1,
        color: THEME.textWhite,
        fontSize: s(14, 15, 18),
        fontWeight: '600',
        height: '100%'
    },

    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
        padding: s(10, 12, 16),
        borderRadius: s(10, 12, 16),
        marginBottom: s(15, 20, 25),
        borderWidth: 1,
        borderColor: 'rgba(255, 77, 77, 0.3)',
        width: '100%',
        flexShrink: 0
    },
    errorText: {
        color: THEME.danger,
        fontSize: s(12, 13, 15),
        fontWeight: 'bold',
        marginLeft: s(6, 8, 10),
        flex: 1,
        lineHeight: s(18, 20, 24)
    },

    submitBtn: {
        width: '100%',
        backgroundColor: THEME.neonGreen,
        height: s(50, 55, 65),
        minHeight: s(50, 55, 65),
        borderRadius: s(14, 16, 20),
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0
    },
    submitBtnDisabled: {
        backgroundColor: THEME.bg,
        borderColor: THEME.border,
        borderWidth: 1
    },
    submitText: {
        color: '#000',
        fontSize: s(15, 16, 20),
        fontWeight: 'bold'
    },
    submitTextDisabled: {
        color: THEME.textMuted
    },
});