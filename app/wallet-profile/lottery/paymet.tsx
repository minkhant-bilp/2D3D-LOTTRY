import { useBetStore } from '@/store/useBetStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
    BackHandler,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
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
    cardBg: '#0B132B',
    inputBg: '#152243',
    borderNormal: 'rgba(255, 255, 255, 0.08)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    danger: '#FF3B30',
    gold: '#FFD700',
    blue: '#00B2FF',
};

export default function PaymentScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const { totalPay = '0' } = useLocalSearchParams<{ totalPay: string }>();

    const country = useBetStore((state) => state.country) || 'MM';
    const currency = useBetStore((state) => state.currency) || 'Ks';
    const adminBankName = useBetStore((state) => state.selectedBankName) || 'KPay / WavePay';
    const bankImage = useBetStore((state) => state.selectedBankImage);

    const adminPhone = country === 'MM' ? "09 123 456 789" : "+66 812 345 678";
    const adminOwner = country === 'MM' ? "U Hlaing Min" : "Mr. Somchai";

    const [transactionId, setTransactionId] = useState('');
    const [slipImage, setSlipImage] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [timeLeft, setTimeLeft] = useState(900);
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);

    const backgroundTimeRef = useRef<number | null>(null);

    const [showBackAlert, setShowBackAlert] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const canSubmit = transactionId.length >= 5 && slipImage !== null;

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                backgroundTimeRef.current = Date.now();
            } else if (nextAppState === 'active') {
                if (backgroundTimeRef.current) {
                    const timeAway = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);

                    setTimeLeft(prevTime => {
                        const newTime = prevTime - timeAway;
                        return newTime > 0 ? newTime : 0;
                    });

                    backgroundTimeRef.current = null;
                }
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            setShowTimeoutModal(true);
            return;
        }
        const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    useEffect(() => {
        const onHardwareBackPress = () => {
            if (isSubmitting) return true;

            setShowBackAlert(true);
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
        return () => backHandler.remove();
    }, [isSubmitting]);

    const handleBackPress = () => {
        if (isSubmitting) return;
        setShowBackAlert(true);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 2000);
    };

    const handleCopy = async () => {
        await Clipboard.setStringAsync(adminPhone);
        showToast('ဖုန်းနံပါတ် Copy ကူးပြီးပါပြီ');
    };

    const handleUploadSlip = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            alert('ပုံရွေးချယ်ရန် Gallery အသုံးပြုခွင့် လိုအပ်ပါသည်။');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            setSlipImage(result.assets[0].uri);
            showToast('စလစ်ပုံ တင်ပြီးပါပြီ');
        }
    };

    const handleSubmit = () => {
        if (!canSubmit) return;

        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            router.replace('/wallet-profile/lottery/paymetsucess');
        }, 2000);
    };

    const handleTimeoutRestart = () => {
        setShowTimeoutModal(false);
        router.replace('/');
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            <Modal visible={isSubmitting} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={THEME.neonGreen} />
                        <Text style={styles.loadingText}>အချက်အလက်များ စစ်ဆေးနေပါသည်...</Text>
                    </View>
                </View>
            </Modal>

            <Modal visible={showTimeoutModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Ionicons name="time" size={s(36, 48, 64)} color={THEME.danger} style={{ marginBottom: s(10, 15, 20) }} />
                        <Text style={styles.modalTitle}>အချိန်ကုန်သွားပါပြီ</Text>
                        <Text style={styles.modalText}>ငွေပေးချေရန် (၁၅) မိနစ် အချိန်ပြည့်သွားပါသဖြင့် ကျေးဇူးပြု၍ အစမှ ပြန်လည်လုပ်ဆောင်ပါ။</Text>
                        <Pressable style={styles.modalBtnConfirm} onPress={handleTimeoutRestart}>
                            <Text style={styles.modalBtnConfirmText}>ပြန်လည်စတင်မည်</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal visible={showBackAlert} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Ionicons name="warning" size={s(36, 48, 64)} color={THEME.danger} style={{ marginBottom: s(10, 15, 20) }} />
                        <Text style={styles.modalTitle}>နောက်သို့ ပြန်ထွက်မည်လား?</Text>
                        <Text style={styles.modalText}>ယခုထွက်လိုက်ပါက လက်ရှိ ငွေပေးချေမှု လုပ်ငန်းစဉ် ပျက်ပြယ်သွားပါမည်။ သေချာပါသလား?</Text>

                        <View style={styles.modalActionsRow}>
                            <Pressable
                                style={[styles.modalBtnCancel, { flex: 1, marginRight: s(6, 10, 14) }]}
                                onPress={() => setShowBackAlert(false)}
                            >
                                <Text style={styles.modalBtnCancelText}>မထွက်ပါ</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalBtnConfirm, { flex: 1 }]}
                                onPress={() => {
                                    setShowBackAlert(false);
                                    router.back();
                                }}
                            >
                                <Text style={styles.modalBtnConfirmText}>သေချာသည်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={[styles.header, { paddingTop: Math.max(insets.top, s(10, 15, 20)) }]}>
                <Pressable onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={s(20, 26, 34)} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>ငွေပေးချေမည်</Text>
                <View style={styles.timerBadge}>
                    <Ionicons name="time-outline" size={s(12, 14, 18)} color={THEME.danger} style={{ marginRight: s(2, 4, 6) }} />
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.amountCard}>
                    <Text style={styles.amountLabel}>စုစုပေါင်း ကျသင့်ငွေ</Text>
                    <Text style={styles.amountValue}>
                        {parseInt(totalPay).toLocaleString()} <Text style={styles.currency}>{currency}</Text>
                    </Text>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>ငွေလွှဲရန် အကောင့်များ</Text>
                    <View style={styles.bankCard}>
                        <View style={[styles.bankIconBox, bankImage ? { backgroundColor: 'transparent', padding: 0, overflow: 'hidden' } : {}]}>
                            {bankImage ? (
                                <Image source={bankImage} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: s(8, 12, 16) }} />
                            ) : (
                                <Ionicons name="wallet" size={s(20, 24, 32)} color={THEME.blue} />
                            )}
                        </View>
                        <View style={styles.bankInfo}>
                            <Text style={styles.bankName}>{adminBankName}</Text>
                            <Text style={styles.bankPhone}>{adminPhone}</Text>
                            <Text style={styles.bankOwner}>{adminOwner}</Text>
                        </View>
                        <Pressable style={styles.copyBtn} onPress={handleCopy}>
                            <Ionicons name="copy-outline" size={s(14, 18, 24)} color={THEME.textWhite} />
                            <Text style={styles.copyText}>Copy</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>ငွေလွှဲစလစ် (Screenshot)</Text>
                    <Pressable
                        style={[
                            styles.uploadBox,
                            slipImage && styles.uploadBoxSuccess,
                            slipImage ? { padding: 0, overflow: 'hidden' } : {}
                        ]}
                        onPress={handleUploadSlip}
                    >
                        {slipImage ? (
                            <Image source={{ uri: slipImage }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload-outline" size={s(30, 40, 54)} color={THEME.textMuted} />
                                <Text style={styles.uploadText}>ပုံရွေးချယ်ရန် နှိပ်ပါ</Text>
                            </>
                        )}
                    </Pressable>
                    {slipImage && (
                        <Text style={[styles.uploadHint, { textAlign: 'center', marginTop: s(8, 10, 14) }]}>
                            ပုံပြောင်းလိုပါက အပေါ်ကပုံကို ပြန်နှိပ်ပါ
                        </Text>
                    )}
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>ငွေလွှဲ ID (နောက်ဆုံး ၆ လုံး)</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="keypad" size={s(16, 20, 26)} color={THEME.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInput}
                            placeholder="ဥပမာ - 123456"
                            placeholderTextColor={THEME.textMuted}
                            keyboardType="number-pad"
                            maxLength={6}
                            value={transactionId}
                            onChangeText={(val) => setTransactionId(val.replace(/[^0-9]/g, ''))}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom + s(6, 10, 14), s(10, 15, 20)) }]}>
                <Pressable
                    style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                >
                    <Text style={[styles.submitBtnText, !canSubmit && { color: THEME.textMuted }]}>
                        အတည်ပြုမည်
                    </Text>
                    <Ionicons name="checkmark-done-circle" size={s(18, 22, 28)} color={canSubmit ? '#000' : THEME.textMuted} style={{ marginLeft: s(6, 8, 12) }} />
                </Pressable>
            </View>

            {toastMessage && (
                <View style={styles.toastContainer}>
                    <Ionicons name="checkmark-circle" size={s(16, 20, 26)} color={THEME.neonGreen} style={{ marginRight: s(6, 8, 12) }} />
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </View>
            )}

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: s(12, 16, 24),
        paddingBottom: s(12, 15, 20),
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal
    },
    backButton: {
        width: s(36, 40, 50),
        height: s(36, 40, 50),
        borderRadius: s(18, 20, 25),
        backgroundColor: THEME.inputBg,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: {
        color: THEME.textWhite,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold'
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        paddingHorizontal: s(8, 10, 14),
        paddingVertical: s(4, 6, 8),
        borderRadius: s(8, 10, 14),
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)'
    },
    timerText: {
        color: THEME.danger,
        fontSize: s(11, 13, 16),
        fontWeight: 'bold'
    },

    scrollContent: {
        paddingHorizontal: s(12, 16, 24),
        paddingTop: s(16, 20, 30),
        paddingBottom: s(80, 100, 140)
    },
    amountCard: {
        backgroundColor: 'rgba(0, 230, 118, 0.05)',
        borderRadius: s(16, 20, 28),
        padding: s(20, 25, 35),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.3)',
        marginBottom: s(20, 25, 35)
    },
    amountLabel: {
        color: THEME.textMuted,
        fontSize: s(12, 14, 18),
        fontWeight: 'bold',
        marginBottom: s(6, 8, 12)
    },
    amountValue: {
        color: THEME.neonGreen,
        fontSize: s(28, 36, 50),
        fontWeight: '900',
        letterSpacing: 1
    },
    currency: {
        fontSize: s(14, 18, 24),
        fontWeight: 'bold'
    },
    sectionContainer: {
        marginBottom: s(20, 25, 35)
    },
    sectionTitle: {
        color: THEME.textWhite,
        fontSize: s(12, 14, 18),
        fontWeight: 'bold',
        marginBottom: s(10, 12, 16)
    },
    bankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.cardBg,
        borderRadius: s(12, 16, 20),
        padding: s(12, 16, 20),
        borderWidth: 1,
        borderColor: THEME.borderNormal
    },
    bankIconBox: {
        width: s(40, 48, 60),
        height: s(40, 48, 60),
        borderRadius: s(10, 12, 16),
        backgroundColor: 'rgba(0, 178, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(12, 15, 20)
    },
    bankInfo: {
        flex: 1
    },
    bankName: {
        color: THEME.textMuted,
        fontSize: s(10, 12, 15),
        fontWeight: 'bold',
        marginBottom: s(2, 4, 6)
    },
    bankPhone: {
        color: THEME.textWhite,
        fontSize: s(16, 18, 24),
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: s(2, 2, 4)
    },
    bankOwner: {
        color: THEME.gold,
        fontSize: s(10, 12, 15),
        fontWeight: 'bold'
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.inputBg,
        paddingHorizontal: s(10, 12, 16),
        paddingVertical: s(6, 8, 10),
        borderRadius: s(6, 8, 12)
    },
    copyText: {
        color: THEME.textWhite,
        fontSize: s(10, 12, 15),
        fontWeight: 'bold',
        marginLeft: s(4, 6, 8)
    },
    uploadBox: {
        height: s(130, 160, 220),
        backgroundColor: THEME.inputBg,
        borderRadius: s(12, 16, 20),
        borderWidth: 1.5,
        borderColor: THEME.borderNormal,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center'
    },
    uploadBoxSuccess: {
        backgroundColor: 'transparent',
        borderColor: THEME.neonGreen,
        borderStyle: 'solid'
    },
    uploadText: {
        color: THEME.textMuted,
        fontSize: s(12, 14, 18),
        fontWeight: 'bold',
        marginTop: s(8, 10, 14)
    },
    uploadHint: {
        color: THEME.textMuted,
        fontSize: s(9, 11, 14),
        marginTop: s(2, 4, 6)
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.inputBg,
        borderRadius: s(12, 16, 20),
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        paddingHorizontal: s(12, 15, 20),
        height: s(45, 55, 65)
    },
    inputIcon: {
        marginRight: s(8, 10, 14)
    },
    textInput: {
        flex: 1,
        color: THEME.textWhite,
        fontSize: s(15, 18, 24),
        fontWeight: 'bold',
        letterSpacing: 2
    },
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: THEME.cardBg,
        paddingHorizontal: s(12, 16, 24),
        paddingTop: s(12, 15, 20),
        borderTopWidth: 1,
        borderTopColor: THEME.borderNormal
    },
    submitBtn: {
        flexDirection: 'row',
        backgroundColor: THEME.neonGreen,
        height: s(45, 50, 65),
        borderRadius: s(12, 14, 18),
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitBtnDisabled: {
        backgroundColor: THEME.inputBg,
        borderColor: THEME.borderNormal,
        borderWidth: 1
    },
    submitBtnText: {
        color: '#000',
        fontSize: s(14, 16, 22),
        fontWeight: 'bold'
    },
    toastContainer: {
        position: 'absolute',
        top: s(80, 100, 130),
        alignSelf: 'center',
        backgroundColor: THEME.cardBg,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(16, 20, 30),
        paddingVertical: s(10, 12, 16),
        borderRadius: s(20, 25, 35),
        borderWidth: 1,
        borderColor: THEME.neonGreen,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 1000
    },
    toastText: {
        color: THEME.textWhite,
        fontSize: s(12, 14, 18),
        fontWeight: 'bold'
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: s(15, 20, 30)
    },
    modalBox: {
        backgroundColor: THEME.cardBg,
        borderRadius: s(20, 24, 30),
        padding: s(20, 25, 35),
        alignItems: 'center',
        width: '100%',
        maxWidth: s(340, 400, 500),
        borderWidth: 1,
        borderColor: THEME.danger
    },
    modalTitle: {
        color: THEME.textWhite,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold',
        marginBottom: s(8, 12, 16)
    },
    modalText: {
        color: THEME.textMuted,
        fontSize: s(12, 14, 18),
        textAlign: 'center',
        lineHeight: s(18, 22, 28),
        marginBottom: s(20, 25, 35)
    },

    modalActionsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    modalBtnCancel: {
        backgroundColor: THEME.inputBg,
        paddingVertical: s(12, 14, 18),
        borderRadius: s(10, 12, 16),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.borderNormal
    },
    modalBtnCancelText: {
        color: THEME.textWhite,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },

    modalBtnConfirm: {
        width: '100%',
        backgroundColor: THEME.danger,
        paddingVertical: s(12, 14, 18),
        borderRadius: s(10, 12, 16),
        alignItems: 'center'
    },
    modalBtnConfirmText: {
        color: '#FFF',
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },

    loadingBox: {
        backgroundColor: THEME.cardBg,
        borderRadius: s(16, 20, 24),
        padding: s(20, 25, 35),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.neonGreen
    },
    loadingText: {
        color: THEME.textWhite,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold',
        marginTop: s(12, 15, 20)
    },
});