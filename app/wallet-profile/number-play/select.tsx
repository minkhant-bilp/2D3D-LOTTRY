import { useBetStore } from '@/store/useBetStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    BackHandler,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
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

const THEME = {
    bg: '#050A1F',
    cardBg: '#121C38',
    inputBg: '#1A2647',
    border: 'rgba(255, 255, 255, 0.1)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    red: '#FF3B30',
    bottomBarBg: 'rgba(11, 19, 43, 0.98)',
    infoBg: 'rgba(0, 178, 255, 0.08)',
};

interface GroupedBet {
    id: string;
    label: string;
    numbers: string[];
    amount: string;
    count: number;
    multiplier: number;
}

interface BetItemRowProps {
    group: GroupedBet;
    onUpdate: (nums: string[], amount: string) => void;
    onRemove: (nums: string[]) => void;
}

const BetItemRowComponent = ({ group, onUpdate, onRemove }: BetItemRowProps) => {
    const { t } = useTranslation();
    const currency = useBetStore((state) => state.currency) || 'Ks';
    const amountNum = parseInt(group.amount) || 0;
    const totalCost = amountNum * group.count;
    const potentialWin = amountNum * group.multiplier;

    return (
        <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
                <View style={styles.badgeRow}>
                    {group.id === 'doubles' ? (
                        <View style={styles.groupBadge}>

                            <Text style={styles.groupBadgeText}>{t.doubles10 || 'အပူး (၁၀) ကွက်'}</Text>
                        </View>
                    ) : (
                        group.numbers.map((num, idx) => (
                            <View key={idx} style={styles.numBadge}>
                                <Text style={styles.numBadgeText}>{num}</Text>
                            </View>
                        ))
                    )}
                </View>
                <Pressable onPress={() => onRemove(group.numbers)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={Number(s(16, 18, 22))} color={THEME.red} />
                </Pressable>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.winInfoBox}>
                    <Text style={styles.infoLabel}>{t.potentialWin || 'ပေါက်ကြေး'} (x{group.multiplier})</Text>
                    <Text style={styles.winValue}>{potentialWin > 0 ? potentialWin.toLocaleString() : '-'} {currency}</Text>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.inputSectionLabel}>{t.perBet || '၁ ကွက်စာ'} ({currency})</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder={t.enterAmount || "ပမာဏထည့်ပါ"}
                            placeholderTextColor={THEME.textMuted}
                            keyboardType="number-pad"
                            value={group.amount}
                            onChangeText={(val) => onUpdate(group.numbers, val.replace(/[^0-9]/g, ''))}
                        />
                    </View>
                    {group.count > 1 && amountNum > 0 && (
                        <Text style={styles.subTotalText}>
                            {t.subTotal || 'စုစုပေါင်း'}: {totalCost.toLocaleString()} {currency}
                        </Text>
                    )}
                </View>
            </View>
        </View>
    );
};

export default function BettingCartCard() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useTranslation();

    const bets = useBetStore((state) => state.bets);
    const updateAmount = useBetStore((state) => state.updateAmount);
    const removeBet = useBetStore((state) => state.removeBet);

    const currency = useBetStore((state) => state.currency) || 'Ks';

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMsg, setToastMsg] = useState(t.noticeTitle || 'အသိပေးချက်');
    const [showBackAlert, setShowBackAlert] = useState(false);

    const totalAmount = bets.reduce((sum, bet) => sum + (parseInt(bet.amount) || 0), 0);

    let groupedBets: GroupedBet[] = [];
    let remaining = [...bets];
    const doubles = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];

    const doubleBets = doubles.map(d => remaining.find(b => b.num === d)).filter(Boolean);
    if (doubleBets.length === 10) {
        const firstAmt = doubleBets[0]!.amount;
        const allSameAmt = doubleBets.every(b => b!.amount === firstAmt);
        if (allSameAmt) {
            groupedBets.push({
                id: 'doubles',
                label: 'အပူး',
                numbers: doubles,
                amount: firstAmt,
                count: 10,
                multiplier: 80
            });
            remaining = remaining.filter(b => !doubles.includes(b.num));
        }
    }

    const processed = new Set<string>();
    for (const bet of remaining) {
        if (processed.has(bet.num)) continue;

        const is3D = bet.num.length === 3;
        const multiplier = is3D ? 500 : 80;

        if (!is3D) {
            const rev = bet.num[1] + bet.num[0];
            if (bet.num !== rev) {
                const revBet = remaining.find(b => b.num === rev);
                if (revBet && revBet.amount === bet.amount) {
                    groupedBets.push({
                        id: `R_${bet.num}_${rev}`,
                        label: `${bet.num}, ${rev}`,
                        numbers: [bet.num, rev],
                        amount: bet.amount,
                        count: 2,
                        multiplier
                    });
                    processed.add(bet.num);
                    processed.add(rev);
                    continue;
                }
            }
        }

        groupedBets.push({
            id: `single_${bet.num}`,
            label: bet.num,
            numbers: [bet.num],
            amount: bet.amount,
            count: 1,
            multiplier
        });
        processed.add(bet.num);
    }

    useEffect(() => {
        const onHardwareBackPress = () => {
            if (bets.length > 0) {
                setShowBackAlert(true);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
        return () => backHandler.remove();
    }, [bets.length]);

    const handleBackPress = () => {
        if (bets.length > 0) {
            setShowBackAlert(true);
        } else {
            router.back();
        }
    };

    const handleUpdateGroupAmount = (numbers: string[], amount: string) => {
        numbers.forEach(num => updateAmount(num, amount));
    };

    const handleRemoveGroup = (numbers: string[]) => {
        numbers.forEach(num => removeBet(num));
    };

    const showToast = (message: string) => {
        setToastMsg(message);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
    };

    const handleConfirm = () => {
        const missingBet = bets.find(bet => !bet.amount || parseInt(bet.amount) <= 0);

        if (missingBet) {

            showToast(t.missingAmountError || 'ဂဏန်းအချို့တွင် ပမာဏ ထည့်ရန် ကျန်နေပါသည်!');
            return;
        }

        router.push({
            pathname: '/wallet-profile/number-play/paymet',
            params: { totalPay: totalAmount.toString() }
        });
    };

    const dynamicHeaderStyle = [styles.header, { paddingTop: Math.max(insets.top, Number(s(10, 15, 20))) }];
    const dynamicBottomBarStyle = [
        styles.bottomBar,
        { paddingBottom: Math.max(insets.bottom + 15, Number(s(30, 35, 40))) }
    ];

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            <Modal visible={showBackAlert} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Ionicons name="warning" size={Number(s(36, 48, 64))} color={THEME.red} style={styles.modalIcon} />
                        <Text style={styles.modalTitle}>{t.backAlertTitleCart || 'နောက်သို့ ပြန်ထွက်မည်လား?'}</Text>
                        <Text style={styles.modalText}>{t.backAlertDescCart || 'ယခုထွက်လိုက်ပါက ရွေးချယ်ထားသော စာရင်းများ ပျက်ပြယ်သွားပါမည်။'}</Text>

                        <View style={styles.modalActions}>
                            <Pressable style={styles.modalBtnCancel} onPress={() => setShowBackAlert(false)}>
                                <Text style={styles.modalBtnCancelText}>{t.stay || 'မထွက်ပါ'}</Text>
                            </Pressable>
                            <Pressable style={styles.modalBtnConfirm} onPress={() => { setShowBackAlert(false); router.back(); }}>
                                <Text style={styles.modalBtnConfirmText}>{t.exit || 'ထွက်မည်'}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {toastVisible && (
                <View style={[styles.toastContainer, { top: Math.max(insets.top, Number(s(10, 15, 20))) }]}>
                    <View style={styles.toastIconBox}>
                        <Ionicons name="warning" size={Number(s(16, 20, 26))} color={THEME.textWhite} />
                    </View>
                    <View style={styles.toastTextWrapper}>
                        <Text style={styles.toastTitle}>{t.noticeTitle || 'အသိပေးချက်'}</Text>
                        <Text style={styles.toastMessage}>{toastMsg}</Text>
                    </View>
                </View>
            )}

            <View style={dynamicHeaderStyle}>
                <Pressable onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={Number(s(20, 26, 32))} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>{t.bettingList || 'လောင်းမယ့်စာရင်း'}</Text>
            </View>

            <FlatList
                data={groupedBets}
                renderItem={({ item }) => (
                    <BetItemRowComponent group={item} onUpdate={handleUpdateGroupAmount} onRemove={handleRemoveGroup} />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={true}
            />

            {bets.length > 0 && (
                <View style={dynamicBottomBarStyle}>
                    <View style={styles.bottomBarContent}>
                        <View style={styles.summaryInfo}>
                            <Text style={styles.summaryLabel}>{t.totalPrefix || 'စုစုပေါင်း ('}{bets.length}{t.totalSuffix || ' ကွက်)'}</Text>
                            <Text style={styles.totalAmount}>
                                {totalAmount.toLocaleString()} <Text style={styles.currencyLight}>{currency}</Text>
                            </Text>
                        </View>

                        <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
                            <Text style={styles.confirmBtnText}>{t.confirmBtn || 'အတည်ပြုမည်'}</Text>
                            <Ionicons name="checkmark-circle" size={Number(s(18, 20, 24))} color="#0B132B" style={styles.mlIcon} />
                        </Pressable>
                    </View>
                </View>
            )}

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Number(s(12, 16, 24)), paddingBottom: Number(s(10, 15, 20)) },

    backButton: { width: Number(s(36, 40, 50)), height: Number(s(36, 40, 50)), borderRadius: Number(s(18, 20, 25)), backgroundColor: THEME.inputBg, justifyContent: 'center', alignItems: 'center', marginRight: Number(s(10, 12, 16)) },

    headerTitle: { color: THEME.textWhite, fontSize: Number(s(18, 20, 26)), fontWeight: 'bold' },

    listContent: { paddingHorizontal: Number(s(12, 16, 24)), paddingTop: Number(s(10, 15, 20)), paddingBottom: Number(s(160, 180, 220)) },

    cardContainer: { backgroundColor: THEME.cardBg, borderRadius: Number(s(16, 20, 24)), padding: Number(s(14, 18, 22)), marginBottom: Number(s(12, 15, 20)), borderWidth: 1, borderColor: THEME.border },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)', paddingBottom: Number(s(12, 14, 18)), marginBottom: Number(s(12, 14, 18)) },

    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1, marginRight: 10 },

    numBadge: { backgroundColor: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.3)', borderWidth: 1, borderRadius: Number(s(8, 10, 12)), paddingHorizontal: Number(s(12, 14, 18)), paddingVertical: Number(s(6, 8, 10)), justifyContent: 'center', alignItems: 'center' },

    numBadgeText: { color: THEME.neonGreen, fontSize: Number(s(18, 22, 26)), fontWeight: '900', letterSpacing: 1 },

    groupBadge: { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderColor: 'rgba(255, 215, 0, 0.3)', borderWidth: 1, borderRadius: Number(s(8, 10, 12)), paddingHorizontal: Number(s(12, 14, 18)), paddingVertical: Number(s(8, 10, 12)), justifyContent: 'center', alignItems: 'center' },

    groupBadgeText: { color: THEME.gold, fontSize: Number(s(14, 16, 18)), fontWeight: 'bold' },

    deleteBtn: { width: Number(s(36, 40, 48)), height: Number(s(36, 40, 48)), borderRadius: Number(s(10, 12, 14)), backgroundColor: 'rgba(255, 59, 48, 0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.2)' },

    cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },

    winInfoBox: { flex: 1, justifyContent: 'center', paddingTop: 6 },

    infoLabel: { color: THEME.textMuted, fontSize: Number(s(10, 11, 13)), textTransform: 'uppercase', marginBottom: Number(s(4, 6, 8)), fontWeight: '600' },

    winValue: { color: THEME.gold, fontSize: Number(s(14, 16, 20)), fontWeight: 'bold' },

    inputSection: { alignItems: 'flex-end' },

    inputSectionLabel: { color: THEME.textWhite, fontSize: Number(s(10, 12, 14)), fontWeight: '600', marginBottom: Number(s(6, 8, 10)) },

    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.inputBg, borderRadius: Number(s(10, 12, 14)), borderWidth: 1, borderColor: THEME.neonGreen, paddingHorizontal: Number(s(12, 14, 16)), height: Number(s(40, 48, 55)), width: Number(s(130, 150, 180)) },

    textInput: { flex: 1, color: THEME.neonGreen, height: '100%', fontSize: Number(s(16, 18, 22)), fontWeight: 'bold', textAlign: 'right' },

    currencyText: { color: THEME.textMuted, fontSize: Number(s(11, 13, 15)), fontWeight: 'bold', marginLeft: 8 },

    subTotalText: { color: THEME.neonGreen, fontSize: Number(s(10, 11, 13)), fontWeight: 'bold', marginTop: Number(s(6, 8, 10)), marginRight: Number(s(4, 6, 8)) },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: THEME.bottomBarBg, borderTopWidth: 1, borderTopColor: THEME.border, paddingHorizontal: Number(s(16, 20, 30)), paddingTop: Number(s(12, 16, 20)) },

    bottomBarContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    summaryInfo: { flex: 1 },

    summaryLabel: { color: THEME.textMuted, fontSize: Number(s(11, 13, 15)), fontWeight: 'bold', marginBottom: Number(s(2, 4, 6)) },

    totalAmount: { color: THEME.gold, fontSize: Number(s(20, 24, 30)), fontWeight: '900', letterSpacing: 0.5 },

    currencyLight: { fontSize: Number(s(12, 14, 16)), color: THEME.textWhite, fontWeight: 'normal' },

    confirmBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.neonGreen, paddingHorizontal: Number(s(20, 24, 30)), height: Number(s(48, 55, 65)), borderRadius: Number(s(14, 16, 20)) },

    confirmBtnText: { color: '#0B132B', fontSize: Number(s(14, 16, 18)), fontWeight: 'bold' },

    mlIcon: { marginLeft: Number(s(6, 8, 10)) },

    toastContainer: { position: 'absolute', left: Number(s(12, 16, 24)), right: Number(s(12, 16, 24)), zIndex: 100, backgroundColor: 'rgba(255, 59, 48, 0.95)', flexDirection: 'row', alignItems: 'center', padding: Number(s(10, 12, 16)), borderRadius: Number(s(12, 16, 24)) },

    toastIconBox: { width: Number(s(32, 36, 46)), height: Number(s(32, 36, 46)), borderRadius: Number(s(16, 18, 23)), backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: Number(s(10, 12, 16)) },

    toastTextWrapper: { flex: 1 },

    toastTitle: { color: THEME.textWhite, fontSize: Number(s(12, 14, 16)), fontWeight: 'bold', marginBottom: 2 },

    toastMessage: { color: 'rgba(255,255,255,0.9)', fontSize: Number(s(12, 14, 16)), fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', padding: Number(s(15, 20, 30)) },

    modalBox: { backgroundColor: THEME.cardBg, borderRadius: Number(s(24, 28, 32)), padding: Number(s(24, 28, 35)), alignItems: 'center', width: '100%', maxWidth: 400, borderWidth: 1, borderColor: THEME.border },

    modalIcon: { marginBottom: Number(s(15, 20, 25)) },

    modalTitle: { color: THEME.textWhite, fontSize: Number(s(18, 20, 24)), fontWeight: 'bold', marginBottom: Number(s(8, 10, 14)) },

    modalText: { color: THEME.textMuted, fontSize: Number(s(13, 15, 18)), textAlign: 'center', lineHeight: Number(s(20, 24, 28)), marginBottom: Number(s(25, 30, 35)) },

    modalActions: { flexDirection: 'row', gap: Number(s(10, 14, 16)), width: '100%' },

    modalBtnCancel: { flex: 1, backgroundColor: THEME.inputBg, height: Number(s(48, 55, 60)), borderRadius: Number(s(12, 14, 16)), justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.border },

    modalBtnCancelText: { color: THEME.textWhite, fontSize: Number(s(14, 16, 18)), fontWeight: 'bold' },

    modalBtnConfirm: { flex: 1, backgroundColor: THEME.red, height: Number(s(48, 55, 60)), borderRadius: Number(s(12, 14, 16)), justifyContent: 'center', alignItems: 'center' },

    modalBtnConfirmText: { color: '#FFF', fontSize: Number(s(14, 16, 18)), fontWeight: 'bold' },
});