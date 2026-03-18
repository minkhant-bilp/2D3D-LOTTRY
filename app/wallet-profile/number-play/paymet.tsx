import { useBetStore } from '@/store/useBetStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    AppState,
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
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

const COLORS = {
    background: '#050A1F',
    surface: '#121C38',
    surfaceLight: '#1A2647',
    primary: '#00E676',
    textMain: '#FFFFFF',
    textSub: '#8A9BB3',
    accent: '#FFD700',
    danger: '#FF453A',
    border: 'rgba(255, 255, 255, 0.08)',
};

const TIMEOUT_SECONDS = 900;

export default function PaymentScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const bets = useBetStore((state) => state.bets);
    const clearBets = useBetStore((state) => state.clearBets);
    const country = useBetStore((state) => state.country) || 'MM';
    const currency = useBetStore((state) => state.currency) || 'Ks';

    const adminBankName = useBetStore((state) => state.selectedBankName) || 'KPay';
    const bankImage = useBetStore((state) => state.selectedBankImage);
    const bankColor = useBetStore((state) => state.selectedBankColor) || COLORS.primary;

    const [slipImage, setSlipImage] = useState<string | null>(null);
    const [lastFiveDigits, setLastFiveDigits] = useState('');
    const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
    const [toastMsg, setToastMsg] = useState('');

    const backgroundTimeRef = useRef<number | null>(null);

    const [showBackAlert, setShowBackAlert] = useState(false);
    const [showTimeOutAlert, setShowTimeOutAlert] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const adminPhone = country === 'MM' ? "09 123 456 789" : "+66 812 345 678";
    const adminOwner = country === 'MM' ? "U Mya (Admin)" : "Mr. Somchai (Admin)";

    const totalAmount = bets.reduce((sum, bet) => sum + (parseInt(bet.amount) || 0), 0);

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

        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) {
            setShowTimeOutAlert(true);
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const m = Math.floor(timeLeft / 60);
    const sTime = timeLeft % 60;
    const formattedTime = `${m.toString().padStart(2, '0')}:${sTime.toString().padStart(2, '0')}`;

    const toastY = useSharedValue(-100);
    const toastOp = useSharedValue(0);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        toastY.value = withSequence(withSpring(insets.top + s(10, 15, 20)), withDelay(2000, withTiming(-100)));
        toastOp.value = withSequence(withTiming(1), withDelay(2000, withTiming(0)));
    };

    const toastStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: toastY.value }],
        opacity: toastOp.value,
    }));

    const handleCopy = async () => {
        await Clipboard.setStringAsync(adminPhone);
        showToast('ဖုန်းနံပါတ် Copy ကူးပြီးပါပြီ');
    };

    const handlePickSlip = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            showToast('ပုံရွေးရန် Gallery အသုံးပြုခွင့် လိုအပ်ပါသည်');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) setSlipImage(result.assets[0].uri);
    };

    const handleBack = () => {
        setShowBackAlert(true);
    };

    const confirmExit = () => {
        setShowBackAlert(false);
        clearBets();
        router.back();
    };

    const confirmTimeOutExit = () => {
        setShowTimeOutAlert(false);
        clearBets();
        router.replace('/');
    };

    const handleSubmit = () => {
        if (!slipImage) return showToast('ကျေးဇူးပြု၍ ငွေလွှဲစလစ် ထည့်ပါ');
        if (lastFiveDigits.length !== 5) return showToast('နောက်ဆုံး ဂဏန်း (၅) လုံး ပြည့်အောင် ထည့်ပါ');

        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            router.push('/wallet-profile/number-play/susscess');
        }, 2000);
    };

    const isFormValid = slipImage !== null && lastFiveDigits.length === 5;

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            <Animated.View style={[styles.toastBox, toastStyle]}>
                <Ionicons name="checkmark-circle" size={s(18, 20, 26)} color={COLORS.primary} style={{ marginRight: s(6, 8, 12) }} />
                <Text style={styles.toastText}>{toastMsg}</Text>
            </Animated.View>

            <View style={[styles.header, { paddingTop: Math.max(insets.top, s(10, 15, 20)) }]}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={handleBack} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={s(20, 24, 30)} color={COLORS.textMain} />
                    </Pressable>
                    <Text style={styles.headerTitle} numberOfLines={1}>Payment</Text>
                </View>
                <View style={styles.timerBadge}>
                    <Ionicons name="time-outline" size={s(12, 14, 18)} color={COLORS.danger} style={{ marginRight: s(2, 4, 6) }} />
                    <Text style={styles.timerText}>{formattedTime}</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountSubtitle}>လွှဲပြောင်းပေးချေရမည့် ငွေပမာဏ</Text>
                    <Text style={styles.amountTitle}>
                        {totalAmount.toLocaleString()} <Text style={styles.amountCurrency}>{currency}</Text>
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ငွေလွှဲရမည့် အကောင့်</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={[styles.iconCircle, { backgroundColor: `${bankColor}15`, overflow: 'hidden' }]}>
                                {bankImage ? (
                                    <Image source={bankImage} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                                ) : (
                                    <Ionicons name="wallet" size={s(18, 20, 26)} color={bankColor} />
                                )}
                            </View>
                            <View style={styles.infoTextGroup}>
                                <Text style={styles.infoLabel}>{adminBankName}</Text>
                                <Text style={styles.infoName}>{adminOwner}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.phoneRow}>
                            <Text style={styles.phoneNumber}>{adminPhone}</Text>
                            <Pressable style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.6 }]} onPress={handleCopy}>
                                <Ionicons name="copy-outline" size={s(16, 18, 24)} color={COLORS.textMain} />
                                <Text style={styles.copyText}>Copy</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ငွေလွှဲစလစ် (Payment Slip)</Text>
                    <Pressable style={[styles.uploadArea, slipImage && styles.uploadAreaFilled]} onPress={handlePickSlip}>
                        {slipImage ? (
                            <View style={styles.previewBox}>
                                <Image source={{ uri: slipImage }} style={styles.slipImage} resizeMode="contain" />
                                <View style={styles.changeImageOverlay}>
                                    <Ionicons name="camera" size={s(18, 20, 26)} color="#FFF" />
                                    <Text style={styles.changeImageText}>ပုံပြောင်းမည်</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.emptyUpload}>
                                <Ionicons name="cloud-upload-outline" size={s(30, 36, 48)} color={COLORS.textSub} />
                                <Text style={styles.emptyUploadText}>စလစ်ပုံ ရွေးချယ်ရန် နှိပ်ပါ</Text>
                            </View>
                        )}
                    </Pressable>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ငွေလွှဲစလစ်၏ နောက်ဆုံးဂဏန်း (၅) လုံး (Transaction ID)</Text>
                    <View style={styles.inputCard}>
                        <Ionicons name="keypad-outline" size={s(18, 20, 26)} color={COLORS.textSub} style={{ marginRight: s(8, 10, 14) }} />
                        <TextInput
                            style={styles.inputField}
                            placeholder="ဥပမာ - 12345"
                            placeholderTextColor={COLORS.textSub}
                            keyboardType="number-pad"
                            maxLength={5}
                            value={lastFiveDigits}
                            onChangeText={(text) => setLastFiveDigits(text.replace(/[^0-9]/g, ''))}
                        />
                    </View>
                </View>

                <View style={styles.noticeSection}>
                    <View style={styles.noticeHeader}>
                        <Ionicons name="information-circle" size={s(18, 20, 26)} color={COLORS.danger} />
                        <Text style={styles.noticeTitle}>အထူးသတိပြုရန် အချက်များ</Text>
                    </View>
                    <View style={styles.noticeBody}>
                        <View style={styles.noticeRow}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.noticeText}>ငွေလွှဲရာတွင် မှတ်ချက် (Notes) နေရာ၌ <Text style={styles.highlightText}>မည်သည့်စာသားမျှ မရေးပါနှင့်</Text>။</Text>
                        </View>
                        <View style={styles.noticeRow}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.noticeText}>စလစ်အဟောင်း သို့မဟုတ် အတုများ တင်ပါက အကောင့် <Text style={styles.highlightText}>အပြီးတိုင် ပိတ်သိမ်း</Text>ခံရပါမည်။</Text>
                        </View>
                        <View style={styles.noticeRow}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.noticeText}>ငွေလွှဲစလစ် (Transaction ID) ၏ <Text style={styles.highlightText}>နောက်ဆုံး ဂဏန်း (၅) လုံး</Text> ကို မှန်ကန်စွာ ထည့်သွင်းပေးပါ။</Text>
                        </View>
                        <View style={styles.noticeRow}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.noticeText}>အတည်ပြုပြီးပါက <Text style={styles.highlightText}>(၃) မှ (၅) မိနစ်</Text> အတွင်း စာရင်းဝင်မည်ဖြစ်ပါသည်။</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, s(15, 20, 30)) }]}>
                <Pressable style={[styles.submitBtn, !isFormValid && styles.submitBtnDisabled]} onPress={handleSubmit}>
                    <Text style={[styles.submitText, !isFormValid && styles.submitTextDisabled]}>
                        အတည်ပြုမည်
                    </Text>
                </Pressable>
            </View>

            <Modal visible={isSubmitting} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>အချက်အလက်များ စစ်ဆေးနေပါသည်...</Text>
                    </View>
                </View>
            </Modal>

            <Modal visible={showBackAlert} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Ionicons name="warning" size={s(36, 48, 64)} color={COLORS.danger} style={{ marginBottom: s(10, 15, 20) }} />
                        <Text style={styles.modalTitle}>ပြန်ထွက်မည်လား?</Text>
                        <Text style={styles.modalText}>ယခုပြန်ထွက်ပါက လက်ရှိလုပ်ဆောင်နေသော လောင်းကြေးစာရင်းများ အားလုံး ပျက်ပြယ်သွားပါမည်။</Text>

                        <View style={styles.modalActions}>
                            <Pressable style={styles.modalBtnCancel} onPress={() => setShowBackAlert(false)}>
                                <Text style={styles.modalBtnCancelText}>မထွက်ပါ</Text>
                            </Pressable>
                            <Pressable style={styles.modalBtnConfirm} onPress={confirmExit}>
                                <Text style={styles.modalBtnConfirmText}>ထွက်မည်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showTimeOutAlert} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Ionicons name="time-outline" size={s(36, 48, 64)} color={COLORS.danger} style={{ marginBottom: s(10, 15, 20) }} />
                        <Text style={styles.modalTitle}>အချိန်ကုန်သွားပါပြီ</Text>
                        <Text style={styles.modalText}>ငွေပေးချေရန် သတ်မှတ်ချိန် (၁၅ မိနစ်) ကုန်ဆုံးသွားပါသဖြင့် ကျေးဇူးပြု၍ အစမှ ပြန်လည်လုပ်ဆောင်ပါ။</Text>

                        <View style={styles.modalActions}>
                            <Pressable style={[styles.modalBtnConfirm, { flex: 1 }]} onPress={confirmTimeOutExit}>
                                <Text style={styles.modalBtnConfirmText}>ပြန်လည်စတင်မည်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background
    },
    toastBox: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        backgroundColor: COLORS.surfaceLight,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(15, 20, 30),
        paddingVertical: s(10, 12, 16),
        borderRadius: s(20, 30, 40),
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10
    },
    toastText: {
        color: COLORS.textMain,
        fontSize: s(12, 14, 18),
        fontWeight: '600'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(12, 16, 24),
        paddingBottom: s(15, 20, 30),
        justifyContent: 'space-between'
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: s(8, 10, 14)
    },
    backBtn: {
        width: s(36, 40, 50),
        height: s(36, 40, 50),
        borderRadius: s(18, 20, 25),
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(10, 12, 16)
    },
    headerTitle: {
        color: COLORS.textMain,
        fontSize: s(16, 20, 28),
        fontWeight: 'bold',
        flexShrink: 1
    },
    timerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 69, 58, 0.15)',
        paddingHorizontal: s(8, 10, 14),
        paddingVertical: s(4, 6, 8),
        borderRadius: s(16, 20, 28)
    },
    timerText: {
        color: COLORS.danger,
        fontSize: s(11, 13, 16),
        fontWeight: '800'
    },
    scrollArea: {
        paddingHorizontal: s(15, 20, 30),
        paddingBottom: s(100, 120, 160)
    },
    amountContainer: {
        alignItems: 'center',
        marginVertical: s(20, 30, 45)
    },
    amountSubtitle: {
        color: COLORS.textSub,
        fontSize: s(12, 14, 18),
        marginBottom: s(6, 8, 12),
        fontWeight: '500'
    },
    amountTitle: {
        color: COLORS.primary,
        fontSize: s(32, 40, 56),
        fontWeight: '900',
        letterSpacing: 1
    },
    amountCurrency: {
        fontSize: s(16, 20, 28),
        fontWeight: '600',
        color: COLORS.textSub
    },
    section: {
        marginBottom: s(20, 30, 45)
    },
    sectionTitle: {
        color: COLORS.textMain,
        fontSize: s(13, 15, 20),
        fontWeight: '700',
        marginBottom: s(10, 12, 16)
    },
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: s(16, 20, 28),
        padding: s(14, 16, 24),
        borderWidth: 1,
        borderColor: COLORS.border
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconCircle: {
        width: s(36, 40, 50),
        height: s(36, 40, 50),
        borderRadius: s(18, 20, 25),
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(10, 12, 16)
    },
    infoTextGroup: {
        flex: 1
    },
    infoLabel: {
        color: COLORS.textSub,
        fontSize: s(10, 12, 15),
        marginBottom: s(1, 2, 4)
    },
    infoName: {
        color: COLORS.textMain,
        fontSize: s(13, 15, 20),
        fontWeight: '600'
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: s(12, 16, 24)
    },
    phoneRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    phoneNumber: {
        color: COLORS.textMain,
        fontSize: s(18, 22, 30),
        fontWeight: '800',
        letterSpacing: 1.5
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceLight,
        paddingHorizontal: s(12, 14, 20),
        paddingVertical: s(6, 8, 12),
        borderRadius: s(10, 12, 16)
    },
    copyText: {
        color: COLORS.textMain,
        fontSize: s(11, 13, 16),
        fontWeight: '600',
        marginLeft: s(4, 6, 8)
    },
    uploadArea: {
        height: s(130, 160, 220),
        backgroundColor: COLORS.surface,
        borderRadius: s(16, 20, 28),
        borderWidth: 1.5,
        borderColor: COLORS.surfaceLight,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    uploadAreaFilled: {
        height: s(350, 450, 600),
        borderWidth: 0,
        backgroundColor: '#000'
    },
    emptyUpload: {
        alignItems: 'center'
    },
    emptyUploadText: {
        color: COLORS.textSub,
        fontSize: s(12, 14, 18),
        marginTop: s(6, 8, 12),
        fontWeight: '500'
    },
    previewBox: {
        width: '100%',
        height: '100%',
        position: 'relative'
    },
    slipImage: {
        width: '100%',
        height: '100%'
    },
    changeImageOverlay: {
        position: 'absolute',
        bottom: s(15, 20, 30),
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: s(12, 16, 24),
        paddingVertical: s(6, 8, 12),
        borderRadius: s(16, 20, 28),
        flexDirection: 'row',
        alignItems: 'center'
    },
    changeImageText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: s(6, 8, 12),
        fontSize: s(11, 13, 16)
    },
    inputCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: s(14, 16, 24),
        paddingHorizontal: s(14, 16, 24),
        height: s(45, 55, 75),
        borderWidth: 1,
        borderColor: COLORS.border
    },
    inputField: {
        flex: 1,
        color: COLORS.textMain,
        fontSize: s(16, 18, 26),
        fontWeight: 'bold',
        letterSpacing: 2
    },
    noticeSection: {
        backgroundColor: 'rgba(255, 59, 48, 0.05)',
        borderRadius: s(14, 16, 24),
        padding: s(14, 16, 24),
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.2)',
        marginBottom: s(15, 20, 30)
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: s(10, 12, 16)
    },
    noticeTitle: {
        color: COLORS.danger,
        fontSize: s(12, 14, 18),
        fontWeight: 'bold',
        marginLeft: s(6, 8, 12)
    },
    noticeBody: {
        gap: s(8, 10, 14)
    },
    noticeRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingRight: s(8, 10, 14)
    },
    bulletDot: {
        width: s(4, 5, 8),
        height: s(4, 5, 8),
        borderRadius: s(2, 2.5, 4),
        backgroundColor: COLORS.danger,
        marginTop: s(6, 8, 12),
        marginRight: s(8, 10, 14)
    },
    noticeText: {
        color: COLORS.textSub,
        fontSize: s(11, 13, 16),
        lineHeight: s(18, 22, 28),
        flex: 1
    },
    highlightText: {
        color: COLORS.textMain,
        fontWeight: 'bold'
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: COLORS.background,
        paddingHorizontal: s(15, 20, 30),
        paddingTop: s(10, 12, 16),
        borderTopWidth: 1,
        borderTopColor: COLORS.border
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: s(14, 16, 22),
        borderRadius: s(14, 16, 24),
        alignItems: 'center'
    },
    submitBtnDisabled: {
        backgroundColor: COLORS.surfaceLight
    },
    submitText: {
        color: COLORS.background,
        fontSize: s(14, 16, 22),
        fontWeight: 'bold'
    },
    submitTextDisabled: {
        color: COLORS.textSub
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: s(15, 20, 30)
    },
    modalBox: {
        backgroundColor: COLORS.surface,
        borderRadius: s(20, 24, 32),
        padding: s(25, 30, 40),
        alignItems: 'center',
        width: '100%',
        maxWidth: s(360, 400, 500),
        borderWidth: 1,
        borderColor: COLORS.border
    },
    modalTitle: {
        color: COLORS.textMain,
        fontSize: s(16, 18, 26),
        fontWeight: 'bold',
        marginBottom: s(8, 10, 14)
    },
    modalText: {
        color: COLORS.textSub,
        fontSize: s(12, 14, 18),
        textAlign: 'center',
        lineHeight: s(18, 22, 28),
        marginBottom: s(20, 25, 35)
    },
    modalActions: {
        flexDirection: 'row',
        gap: s(10, 12, 16),
        width: '100%'
    },
    modalBtnCancel: {
        flex: 1,
        backgroundColor: COLORS.surfaceLight,
        paddingVertical: s(12, 14, 18),
        borderRadius: s(10, 12, 16),
        alignItems: 'center'
    },
    modalBtnCancelText: {
        color: COLORS.textMain,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },
    modalBtnConfirm: {
        flex: 1,
        backgroundColor: COLORS.danger,
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
        backgroundColor: COLORS.surface,
        borderRadius: s(16, 20, 28),
        padding: s(25, 30, 45),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border
    },
    loadingText: {
        color: COLORS.textMain,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold',
        marginTop: s(12, 15, 20)
    },
});