import { useBetStore } from '@/store/useBetStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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
import useTranslation from '@/hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

function s<T>(small: T, medium: T, tablet: T): T {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
}

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

export default function PaymentScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useTranslation();

    const bets = useBetStore((state) => state.bets);
    const clearBets = useBetStore((state) => state.clearBets);
    const country = useBetStore((state) => state.country) || 'MM';
    const currency = useBetStore((state) => state.currency) || 'Ks';

    const adminBankName = useBetStore((state) => state.selectedBankName) || 'KPay';
    const bankImage = useBetStore((state) => state.selectedBankImage);
    const bankColor = useBetStore((state) => state.selectedBankColor) || COLORS.primary;

    const [slipImage, setSlipImage] = useState<string | null>(null);
    const [lastTwoDigits, setLastTwoDigits] = useState('');
    const [toastMsg, setToastMsg] = useState('');

    const [showBackAlert, setShowBackAlert] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const adminPhone = country === 'MM' ? "09 123 456 789" : "+66 812 345 678";
    const adminOwner = country === 'MM' ? "U Mya (Admin)" : "Mr. Somchai (Admin)";

    const totalAmount = bets.reduce((sum, bet) => sum + (parseInt(bet.amount) || 0), 0);

    const toastY = useSharedValue(-100);
    const toastOp = useSharedValue(0);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        toastY.value = withSequence(withSpring(Number(insets.top) + Number(s(10, 15, 20))), withDelay(2000, withTiming(-100)));
        toastOp.value = withSequence(withTiming(1), withDelay(2000, withTiming(0)));
    };

    const toastStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: toastY.value }],
        opacity: toastOp.value,
    }));

    const handleCopy = async () => {
        await Clipboard.setStringAsync(adminPhone);
        showToast(t.phoneCopied || 'ဖုန်းနံပါတ် Copy ကူးပြီးပါပြီ');
    };

    const handlePickSlip = async () => {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
            showToast(t.galleryPermissionReq || 'ပုံရွေးရန် Gallery အသုံးပြုခွင့် လိုအပ်ပါသည်');
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

    const handleSubmit = () => {
        if (!slipImage) return showToast(t.pleaseUploadSlip || 'ကျေးဇူးပြု၍ ငွေလွှဲစလစ် ထည့်ပါ');

        if (lastTwoDigits.length !== 2) return showToast(t.enterTwoDigits || 'နောက်ဆုံး ဂဏန်း (၂) လုံး ပြည့်အောင် ထည့်ပါ');

        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            router.push('/wallet-profile/number-play/susscess');
        }, 2000);
    };

    const isFormValid = slipImage !== null && lastTwoDigits.length === 2;

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            <Animated.View style={[styles.toastBox, toastStyle]}>
                <Ionicons name="checkmark-circle" size={Number(s(18, 20, 26))} color={COLORS.primary} style={{ marginRight: Number(s(6, 8, 12)) }} />
                <Text style={styles.toastText}>{toastMsg}</Text>
            </Animated.View>

            <View style={[styles.header, { paddingTop: Math.max(insets.top, Number(s(10, 15, 20))) }]}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={handleBack} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={Number(s(20, 24, 30))} color={COLORS.textMain} />
                    </Pressable>
                    <Text style={styles.headerTitle} numberOfLines={1}>{t.paymentTitle || 'Payment'}</Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountSubtitle}>{t.transferAmountLabel || 'လွှဲပြောင်းပေးချေရမည့် ငွေပမာဏ'}</Text>
                    <Text style={styles.amountTitle}>
                        {totalAmount.toLocaleString()} <Text style={styles.amountCurrency}>{currency}</Text>
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.transferAccountLabel || 'ငွေလွှဲရမည့် အကောင့်'}</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={[styles.iconCircle, { backgroundColor: `${bankColor}15`, overflow: 'hidden' }]}>
                                {bankImage ? (
                                    <Image source={bankImage} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                                ) : (
                                    <Ionicons name="wallet" size={Number(s(18, 20, 26))} color={bankColor} />
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
                                <Ionicons name="copy-outline" size={Number(s(16, 18, 24))} color={COLORS.textMain} />
                                <Text style={styles.copyText}>{t.copyBtn || 'Copy'}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.paymentSlipLabel || 'ငွေလွှဲစလစ် (Payment Slip)'}</Text>
                    <Pressable style={[styles.uploadArea, slipImage && styles.uploadAreaFilled]} onPress={handlePickSlip}>
                        {slipImage ? (
                            <View style={styles.previewBox}>
                                <Image source={{ uri: slipImage }} style={styles.slipImage} resizeMode="contain" />
                                <View style={styles.changeImageOverlay}>
                                    <Ionicons name="camera" size={Number(s(18, 20, 26))} color="#FFF" />
                                    <Text style={styles.changeImageText}>{t.changeImage || 'ပုံပြောင်းမည်'}</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.emptyUpload}>
                                <Ionicons name="cloud-upload-outline" size={Number(s(30, 36, 48))} color={COLORS.textSub} />
                                <Text style={styles.emptyUploadText}>{t.clickToSelectSlip || 'စလစ်ပုံ ရွေးချယ်ရန် နှိပ်ပါ'}</Text>
                            </View>
                        )}
                    </Pressable>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.transactionIdLabel || 'ငွေလွှဲစလစ်၏ နောက်ဆုံးဂဏန်း (၂) လုံး (Transaction ID)'}</Text>
                    <View style={styles.inputCard}>
                        <Ionicons name="keypad-outline" size={Number(s(18, 20, 26))} color={COLORS.textSub} style={{ marginRight: Number(s(8, 10, 14)) }} />
                        <TextInput
                            style={styles.inputField}
                            placeholder={t.example12 || "ဥပမာ - 12"}
                            placeholderTextColor={COLORS.textSub}
                            keyboardType="number-pad"
                            maxLength={2}
                            value={lastTwoDigits}
                            onChangeText={(text) => setLastTwoDigits(text.replace(/[^0-9]/g, ''))}
                        />
                    </View>
                </View>

                <View style={styles.noticeSection}>
                    <View style={styles.noticeHeader}>
                        <Ionicons name="information-circle" size={Number(s(18, 20, 26))} color={COLORS.danger} />
                        <Text style={styles.noticeTitle}>{t.importantNotesTitle || 'အထူးသတိပြုရန် အချက်များ'}</Text>
                    </View>
                    <View style={styles.noticeBody}>
                        <View style={styles.noticeRow}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.noticeText}>{t.note1_1 || 'ငွေလွှဲရာတွင် မှတ်ချက် (Notes) နေရာ၌ '}<Text style={styles.highlightText}>{t.note1_2 || 'မည်သည့်စာသားမျှ မရေးပါနှင့်'}</Text>{t.note1_3 || '။'}</Text>
                        </View>
                        <View style={styles.noticeRow}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.noticeText}>{t.note2_1 || 'စလစ်အဟောင်း သို့မဟုတ် အတုများ တင်ပါက အကောင့် '}<Text style={styles.highlightText}>{t.note2_2 || 'အပြီးတိုင် ပိတ်သိမ်း'}</Text>{t.note2_3 || 'ခံရပါမည်။'}</Text>
                        </View>
                        <View style={styles.noticeRow}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.noticeText}>{t.note3_1 || 'ငွေလွှဲစလစ် (Transaction ID) ၏ '}<Text style={styles.highlightText}>{t.note3_2 || 'နောက်ဆုံး ဂဏန်း (၂) လုံး'}</Text>{t.note3_3 || ' ကို မှန်ကန်စွာ ထည့်သွင်းပေးပါ။'}</Text>
                        </View>
                        <View style={styles.noticeRow}>
                            <View style={styles.bulletDot} />
                            <Text style={styles.noticeText}>{t.note4_1 || 'အတည်ပြုပြီးပါက '}<Text style={styles.highlightText}>{t.note4_2 || '(၃) မှ (၅) မိနစ်'}</Text>{t.note4_3 || ' အတွင်း စာရင်းဝင်မည်ဖြစ်ပါသည်။'}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, Number(s(15, 20, 30))) }]}>
                <Pressable style={[styles.submitBtn, !isFormValid && styles.submitBtnDisabled]} onPress={handleSubmit}>
                    <Text style={[styles.submitText, !isFormValid && styles.submitTextDisabled]}>
                        {t.confirmSubmit || 'အတည်ပြုမည်'}
                    </Text>
                </Pressable>
            </View>

            <Modal visible={isSubmitting} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>{t.checkingInfo || 'အချက်အလက်များ စစ်ဆေးနေပါသည်...'}</Text>
                    </View>
                </View>
            </Modal>

            <Modal visible={showBackAlert} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Ionicons name="warning" size={Number(s(36, 48, 64))} color={COLORS.danger} style={{ marginBottom: Number(s(10, 15, 20)) }} />
                        <Text style={styles.modalTitle}>{t.backAlertTitlePay || 'ပြန်ထွက်မည်လား?'}</Text>
                        <Text style={styles.modalText}>{t.backAlertDescPay || 'ယခုပြန်ထွက်ပါက လက်ရှိလုပ်ဆောင်နေသော လောင်းကြေးစာရင်းများ အားလုံး ပျက်ပြယ်သွားပါမည်။'}</Text>

                        <View style={styles.modalActions}>
                            <Pressable style={styles.modalBtnCancel} onPress={() => setShowBackAlert(false)}>
                                <Text style={styles.modalBtnCancelText}>{t.stay || 'မထွက်ပါ'}</Text>
                            </Pressable>
                            <Pressable style={styles.modalBtnConfirm} onPress={confirmExit}>
                                <Text style={styles.modalBtnConfirmText}>{t.exit || 'ထွက်မည်'}</Text>
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
        paddingHorizontal: Number(s(15, 20, 30)),
        paddingVertical: Number(s(10, 12, 16)),
        borderRadius: Number(s(20, 30, 40)),
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10
    },
    toastText: {
        color: COLORS.textMain,
        fontSize: Number(s(12, 14, 18)),
        fontWeight: '600'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Number(s(12, 16, 24)),
        paddingBottom: Number(s(15, 20, 30)),
        justifyContent: 'space-between'
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: Number(s(8, 10, 14))
    },
    backBtn: {
        width: Number(s(36, 40, 50)),
        height: Number(s(36, 40, 50)),
        borderRadius: Number(s(18, 20, 25)),
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Number(s(10, 12, 16))
    },
    headerTitle: {
        color: COLORS.textMain,
        fontSize: Number(s(16, 20, 28)),
        fontWeight: 'bold',
        flexShrink: 1
    },
    scrollArea: {
        paddingHorizontal: Number(s(15, 20, 30)),
        paddingBottom: Number(s(100, 120, 160))
    },
    amountContainer: {
        alignItems: 'center',
        marginVertical: Number(s(20, 30, 45))
    },
    amountSubtitle: {
        color: COLORS.textSub,
        fontSize: Number(s(12, 14, 18)),
        marginBottom: Number(s(6, 8, 12)),
        fontWeight: '500'
    },
    amountTitle: {
        color: COLORS.primary,
        fontSize: Number(s(32, 40, 56)),
        fontWeight: '900',
        letterSpacing: 1
    },
    amountCurrency: {
        fontSize: Number(s(16, 20, 28)),
        fontWeight: '600',
        color: COLORS.textSub
    },
    section: {
        marginBottom: Number(s(20, 30, 45))
    },
    sectionTitle: {
        color: COLORS.textMain,
        fontSize: Number(s(13, 15, 20)),
        fontWeight: '700',
        marginBottom: Number(s(10, 12, 16))
    },
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: Number(s(16, 20, 28)),
        padding: Number(s(14, 16, 24)),
        borderWidth: 1,
        borderColor: COLORS.border
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconCircle: {
        width: Number(s(36, 40, 50)),
        height: Number(s(36, 40, 50)),
        borderRadius: Number(s(18, 20, 25)),
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Number(s(10, 12, 16))
    },
    infoTextGroup: {
        flex: 1
    },
    infoLabel: {
        color: COLORS.textSub,
        fontSize: Number(s(10, 12, 15)),
        marginBottom: Number(s(1, 2, 4))
    },
    infoName: {
        color: COLORS.textMain,
        fontSize: Number(s(13, 15, 20)),
        fontWeight: '600'
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: Number(s(12, 16, 24))
    },
    phoneRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    phoneNumber: {
        color: COLORS.textMain,
        fontSize: Number(s(18, 22, 30)),
        fontWeight: '800',
        letterSpacing: 1.5
    },
    copyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceLight,
        paddingHorizontal: Number(s(12, 14, 20)),
        paddingVertical: Number(s(6, 8, 12)),
        borderRadius: Number(s(10, 12, 16))
    },
    copyText: {
        color: COLORS.textMain,
        fontSize: Number(s(11, 13, 16)),
        fontWeight: '600',
        marginLeft: Number(s(4, 6, 8))
    },
    uploadArea: {
        height: Number(s(130, 160, 220)),
        backgroundColor: COLORS.surface,
        borderRadius: Number(s(16, 20, 28)),
        borderWidth: 1.5,
        borderColor: COLORS.surfaceLight,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    uploadAreaFilled: {
        height: Number(s(350, 450, 600)),
        borderWidth: 0,
        backgroundColor: '#000'
    },
    emptyUpload: {
        alignItems: 'center'
    },
    emptyUploadText: {
        color: COLORS.textSub,
        fontSize: Number(s(12, 14, 18)),
        marginTop: Number(s(6, 8, 12)),
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
        bottom: Number(s(15, 20, 30)),
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: Number(s(12, 16, 24)),
        paddingVertical: Number(s(6, 8, 12)),
        borderRadius: Number(s(16, 20, 28)),
        flexDirection: 'row',
        alignItems: 'center'
    },
    changeImageText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: Number(s(6, 8, 12)),
        fontSize: Number(s(11, 13, 16))
    },
    inputCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: Number(s(14, 16, 24)),
        paddingHorizontal: Number(s(14, 16, 24)),
        height: Number(s(45, 55, 75)),
        borderWidth: 1,
        borderColor: COLORS.border
    },
    inputField: {
        flex: 1,
        color: COLORS.textMain,
        fontSize: Number(s(16, 18, 26)),
        fontWeight: 'bold',
        letterSpacing: 2
    },
    noticeSection: {
        backgroundColor: 'rgba(255, 59, 48, 0.05)',
        borderRadius: Number(s(14, 16, 24)),
        padding: Number(s(14, 16, 24)),
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.2)',
        marginBottom: Number(s(15, 20, 30))
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Number(s(10, 12, 16))
    },
    noticeTitle: {
        color: COLORS.danger,
        fontSize: Number(s(12, 14, 18)),
        fontWeight: 'bold',
        marginLeft: Number(s(6, 8, 12))
    },
    noticeBody: {
        gap: Number(s(8, 10, 14))
    },
    noticeRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingRight: Number(s(8, 10, 14))
    },
    bulletDot: {
        width: Number(s(4, 5, 8)),
        height: Number(s(4, 5, 8)),
        borderRadius: Number(s(2, 2.5, 4)),
        backgroundColor: COLORS.danger,
        marginTop: Number(s(6, 8, 12)),
        marginRight: Number(s(8, 10, 14))
    },
    noticeText: {
        color: COLORS.textSub,
        fontSize: Number(s(11, 13, 16)),
        lineHeight: Number(s(18, 22, 28)),
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
        paddingHorizontal: Number(s(15, 20, 30)),
        paddingTop: Number(s(10, 12, 16)),
        borderTopWidth: 1,
        borderTopColor: COLORS.border
    },
    submitBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: Number(s(14, 16, 22)),
        borderRadius: Number(s(14, 16, 24)),
        alignItems: 'center'
    },
    submitBtnDisabled: {
        backgroundColor: COLORS.surfaceLight
    },
    submitText: {
        color: COLORS.background,
        fontSize: Number(s(14, 16, 22)),
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
        padding: Number(s(15, 20, 30))
    },
    modalBox: {
        backgroundColor: COLORS.surface,
        borderRadius: Number(s(20, 24, 32)),
        padding: Number(s(25, 30, 40)),
        alignItems: 'center',
        width: '100%',
        maxWidth: Number(s(360, 400, 500)),
        borderWidth: 1,
        borderColor: COLORS.border
    },
    modalTitle: {
        color: COLORS.textMain,
        fontSize: Number(s(16, 18, 26)),
        fontWeight: 'bold',
        marginBottom: Number(s(8, 10, 14))
    },
    modalText: {
        color: COLORS.textSub,
        fontSize: Number(s(12, 14, 18)),
        textAlign: 'center',
        lineHeight: Number(s(18, 22, 28)),
        marginBottom: Number(s(20, 25, 35))
    },
    modalActions: {
        flexDirection: 'row',
        gap: Number(s(10, 12, 16)),
        width: '100%'
    },
    modalBtnCancel: {
        flex: 1,
        backgroundColor: COLORS.surfaceLight,
        paddingVertical: Number(s(12, 14, 18)),
        borderRadius: Number(s(10, 12, 16)),
        alignItems: 'center'
    },
    modalBtnCancelText: {
        color: COLORS.textMain,
        fontSize: Number(s(13, 15, 18)),
        fontWeight: 'bold'
    },
    modalBtnConfirm: {
        flex: 1,
        backgroundColor: COLORS.danger,
        paddingVertical: Number(s(12, 14, 18)),
        borderRadius: Number(s(10, 12, 16)),
        alignItems: 'center'
    },
    modalBtnConfirmText: {
        color: '#FFF',
        fontSize: Number(s(13, 15, 18)),
        fontWeight: 'bold'
    },
    loadingBox: {
        backgroundColor: COLORS.surface,
        borderRadius: Number(s(16, 20, 28)),
        padding: Number(s(25, 30, 45)),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border
    },
    loadingText: {
        color: COLORS.textMain,
        fontSize: Number(s(13, 15, 18)),
        fontWeight: 'bold',
        marginTop: Number(s(12, 15, 20))
    },
});