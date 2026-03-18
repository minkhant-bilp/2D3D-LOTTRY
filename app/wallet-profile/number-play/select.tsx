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
    border: 'rgba(255, 255, 255, 0.08)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    red: '#FF3B30',
    bottomBarBg: 'rgba(11, 19, 43, 0.95)',
};

interface GroupedBet {
    id: string;
    label: string;
    numbers: string[];
    amount: string;
    count: number
}

interface BetItemRowProps {
    group: GroupedBet;
    onUpdate: (nums: string[], amount: string) => void;
    onRemove: (nums: string[]) => void;
}

const BetItemRowComponent = ({ group, onUpdate, onRemove }: BetItemRowProps) => {
    const currency = useBetStore((state) => state.currency) || 'Ks';

    return (
        <View style={styles.betRow}>
            <View style={styles.numBox}>
                <Text style={styles.numText}>{group.label}</Text>
                {group.count > 1 && (
                    <View style={styles.badgeBox}>
                        <Text style={styles.badgeText}>{group.count} ကွက်</Text>
                    </View>
                )}
            </View>

            <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="ပမာဏ"
                        placeholderTextColor={THEME.textMuted}
                        keyboardType="number-pad"
                        value={group.amount}
                        onChangeText={(val) => onUpdate(group.numbers, val.replace(/[^0-9]/g, ''))}
                    />
                    <Text style={styles.currency}>{currency}</Text>
                </View>
                {group.count > 1 && group.amount !== '' && (
                    <Text style={styles.subTotalText}>
                        စုစုပေါင်း: {(parseInt(group.amount) || 0) * group.count} {currency}
                    </Text>
                )}
            </View>

            <Pressable onPress={() => onRemove(group.numbers)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={s(18, 20, 26)} color={THEME.red} />
            </Pressable>
        </View>
    );
};

export default function BettingCartCard() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const bets = useBetStore((state) => state.bets);
    const updateAmount = useBetStore((state) => state.updateAmount);
    const updateAllAmounts = useBetStore((state) => state.updateAllAmounts);
    const removeBet = useBetStore((state) => state.removeBet);

    const currency = useBetStore((state) => state.currency) || 'Ks';

    const [batchAmount, setBatchAmount] = useState('');

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMsg, setToastMsg] = useState('အသိပေးချက်');

    const [showBackAlert, setShowBackAlert] = useState(false);

    const totalAmount = bets.reduce((sum, bet) => sum + (parseInt(bet.amount) || 0), 0);

    let groupedBets: GroupedBet[] = [];
    let remaining = [...bets];
    const doubles = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];

    const hasAllDoubles = doubles.every(d => remaining.find(b => b.num === d));
    if (hasAllDoubles) {
        const doubleBets = remaining.filter(b => doubles.includes(b.num));
        groupedBets.push({
            id: 'doubles',
            label: 'အပူး',
            numbers: doubles,
            amount: doubleBets[0].amount,
            count: 10
        });
        remaining = remaining.filter(b => !doubles.includes(b.num));
    }

    const processed = new Set<string>();
    for (const bet of remaining) {
        if (processed.has(bet.num)) continue;

        const rev = bet.num[1] + bet.num[0];

        if (bet.num !== rev) {
            const revBet = remaining.find(b => b.num === rev);
            if (revBet) {
                groupedBets.push({
                    id: `R_${bet.num}_${rev}`,
                    label: `${bet.num}, ${rev}`,
                    numbers: [bet.num, rev],
                    amount: bet.amount,
                    count: 2
                });
                processed.add(bet.num);
                processed.add(rev);
                continue;
            }
        }

        groupedBets.push({
            id: `single_${bet.num}`,
            label: bet.num,
            numbers: [bet.num],
            amount: bet.amount,
            count: 1
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
        setTimeout(() => {
            setToastVisible(false);
        }, 2000);
    };

    const handleBatchApply = () => {
        if (batchAmount) updateAllAmounts(batchAmount);
    };

    const handleConfirm = () => {
        const missingBet = bets.find(bet => !bet.amount || parseInt(bet.amount) <= 0);

        if (missingBet) {
            showToast(`ဂဏန်းအချို့တွင် ပမာဏ ထည့်ရန် ကျန်နေပါသည်!`);
            return;
        }

        router.push({
            pathname: '/wallet-profile/lottery/paymet',
            params: { totalPay: totalAmount.toString() }
        });
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            <Modal visible={showBackAlert} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Ionicons name="warning" size={s(36, 48, 64)} color={THEME.red} style={{ marginBottom: s(10, 15, 20) }} />
                        <Text style={styles.modalTitle}>နောက်သို့ ပြန်ထွက်မည်လား?</Text>
                        <Text style={styles.modalText}>ယခုထွက်လိုက်ပါက ရွေးချယ်ထားသော စာရင်းများ ပျက်ပြယ်သွားပါမည်။</Text>

                        <View style={styles.modalActions}>
                            <Pressable style={styles.modalBtnCancel} onPress={() => setShowBackAlert(false)}>
                                <Text style={styles.modalBtnCancelText}>မထွက်ပါ</Text>
                            </Pressable>
                            <Pressable style={styles.modalBtnConfirm} onPress={() => {
                                setShowBackAlert(false);
                                router.back();
                            }}>
                                <Text style={styles.modalBtnConfirmText}>ထွက်မည်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {toastVisible && (
                <View style={[styles.toastContainer, { top: insets.top + s(8, 10, 14) }]}>
                    <View style={styles.toastIconBox}>
                        <Ionicons name="warning" size={s(16, 20, 26)} color={THEME.textWhite} />
                    </View>
                    <View style={styles.toastTextWrapper}>
                        <Text style={styles.toastTitle}>အသိပေးချက်</Text>
                        <Text style={styles.toastMessage}>{toastMsg}</Text>
                    </View>
                </View>
            )}

            <View style={[styles.header, { paddingTop: insets.top + s(10, 15, 20) }]}>
                <Pressable onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={s(20, 26, 32)} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>လောင်းမယ့်စာရင်း</Text>
            </View>

            <View style={styles.batchContainer}>
                <Text style={styles.batchLabel}>ပမာဏတူ ထည့်ရန် (ရွေးချယ်နိုင်သည်)</Text>
                <View style={styles.batchInputRow}>
                    <TextInput
                        style={styles.batchInput}
                        placeholder="ဥပမာ - 1000"
                        placeholderTextColor={THEME.textMuted}
                        keyboardType="number-pad"
                        value={batchAmount}
                        onChangeText={(val) => setBatchAmount(val.replace(/[^0-9]/g, ''))}
                    />
                    <Pressable style={styles.applyBtn} onPress={handleBatchApply}>
                        <Text style={styles.applyBtnText}>အကုန်ထည့်မည်</Text>
                    </Pressable>
                </View>
            </View>

            <FlatList
                data={groupedBets}
                renderItem={({ item }) => (
                    <BetItemRowComponent group={item} onUpdate={handleUpdateGroupAmount} onRemove={handleRemoveGroup} />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={15}
                keyboardShouldPersistTaps="handled"
            />

            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + s(15, 20, 30) }]}>
                <View style={styles.summaryInfo}>
                    <Text style={styles.summaryLabel}>စုစုပေါင်း ({bets.length} ကွက်)</Text>
                    <Text style={styles.totalAmount}>
                        {totalAmount.toLocaleString()} {currency}
                    </Text>
                </View>

                <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
                    <Text style={styles.confirmBtnText}>အတည်ပြုမည်</Text>
                    <Ionicons name="checkmark-circle" size={s(16, 18, 24)} color="#0B132B" style={{ marginLeft: s(4, 6, 8) }} />
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg
    },
    toastContainer: {
        position: 'absolute',
        left: s(12, 16, 24),
        right: s(12, 16, 24),
        zIndex: 100,
        backgroundColor: 'rgba(255, 59, 48, 0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        padding: s(10, 12, 16),
        borderRadius: s(12, 16, 24),
        ...Platform.select({
            ios: {
                shadowColor: THEME.red, shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.4, shadowRadius: 15
            },
            android: { elevation: 15, shadowColor: THEME.red }
        })
    },
    toastIconBox: {
        width: s(28, 36, 46),
        height: s(28, 36, 46),
        borderRadius: s(14, 18, 23),
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(8, 12, 16)
    },
    toastTextWrapper: {
        flex: 1
    },
    toastTitle: {
        color: THEME.textWhite,
        fontSize: s(11, 13, 16),
        fontWeight: 'bold',
        marginBottom: s(1, 2, 4)
    },
    toastMessage: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: s(11, 13, 16),
        fontWeight: '600'
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(12, 16, 24),
        paddingBottom: s(10, 15, 20)
    },
    backButton: {
        width: s(32, 40, 50),
        height: s(32, 40, 50),
        borderRadius: s(16, 20, 25),
        backgroundColor: THEME.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(8, 12, 16)
    },
    headerTitle: {
        color: THEME.textWhite,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold'
    },

    batchContainer: {
        backgroundColor: THEME.cardBg,
        marginHorizontal: s(12, 16, 24),
        padding: s(10, 15, 20),
        borderRadius: s(12, 16, 24),
        borderWidth: 1,
        borderColor: THEME.border,
        marginBottom: s(10, 15, 20)
    },
    batchLabel: {
        color: THEME.textMuted,
        fontSize: s(10, 12, 15),
        marginBottom: s(6, 10, 14)
    },
    batchInputRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    batchInput: {
        flex: 1,
        backgroundColor: THEME.inputBg,
        color: THEME.textWhite,
        height: s(38, 45, 55),
        borderRadius: s(8, 10, 14),
        paddingHorizontal: s(10, 15, 20),
        borderWidth: 1,
        borderColor: THEME.border,
        marginRight: s(6, 10, 14),
        fontSize: s(14, 16, 20),
        fontWeight: 'bold'
    },
    applyBtn: {
        backgroundColor: 'rgba(0, 230, 118, 0.15)',
        height: s(38, 45, 55),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: s(10, 15, 20),
        borderRadius: s(8, 10, 14),
        borderWidth: 1,
        borderColor: THEME.neonGreen
    },
    applyBtnText: {
        color: THEME.neonGreen,
        fontSize: s(11, 13, 16),
        fontWeight: 'bold'
    },

    listContent: {
        paddingHorizontal: s(12, 16, 24),
        paddingBottom: s(120, 160, 200)
    },
    betRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.cardBg,
        padding: s(8, 12, 16),
        borderRadius: s(10, 14, 18),
        marginBottom: s(8, 12, 16),
        borderWidth: 1,
        borderColor: THEME.border
    },
    numBox: {
        minWidth: s(50, 65, 80),
        paddingHorizontal: s(6, 10, 14),
        minHeight: s(38, 48, 60),
        backgroundColor: THEME.inputBg,
        borderRadius: s(8, 12, 16),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.gold
    },
    numText: {
        color: THEME.gold,
        fontSize: s(14, 16, 22),
        fontWeight: '900',
        textAlign: 'center'
    },
    badgeBox: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        paddingHorizontal: s(4, 6, 8),
        paddingVertical: s(1, 2, 4),
        borderRadius: s(4, 6, 8),
        marginTop: s(2, 4, 6)
    },
    badgeText: {
        color: THEME.gold,
        fontSize: s(8, 10, 12),
        fontWeight: 'bold'
    },

    inputWrapper: {
        flex: 1,
        marginLeft: s(8, 12, 16)
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.bg,
        borderRadius: s(8, 10, 14),
        borderWidth: 1,
        borderColor: THEME.border,
        paddingRight: s(8, 12, 16)
    },
    textInput: {
        flex: 1,
        color: THEME.textWhite,
        height: s(38, 45, 55),
        paddingHorizontal: s(8, 12, 16),
        fontSize: s(14, 16, 20),
        fontWeight: '600'
    },
    currency: {
        color: THEME.textMuted,
        fontSize: s(10, 12, 15),
        fontWeight: 'bold'
    },
    subTotalText: {
        color: THEME.neonGreen,
        fontSize: s(9, 11, 14),
        fontWeight: '600',
        marginTop: s(4, 6, 8),
        textAlign: 'right',
        marginRight: s(2, 4, 6)
    },
    deleteBtn: {
        width: s(36, 45, 55),
        height: s(36, 45, 55),
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: s(4, 8, 12)
    },

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: THEME.bottomBarBg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: s(15, 20, 30),
        paddingTop: s(10, 15, 20),
        borderTopWidth: 1,
        borderTopColor: THEME.border
    },
    summaryInfo: {
        justifyContent: 'center'
    },
    summaryLabel: {
        color: THEME.textMuted,
        fontSize: s(10, 12, 15),
        marginBottom: s(2, 4, 6)
    },
    totalAmount: {
        color: THEME.gold,
        fontSize: s(18, 22, 30),
        fontWeight: '900'
    },
    confirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.neonGreen,
        paddingHorizontal: s(16, 20, 28),
        paddingVertical: s(10, 14, 18),
        borderRadius: s(10, 14, 18)
    },
    confirmBtnText: {
        color: '#0B132B',
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: s(15, 20, 30)
    },
    modalBox: {
        backgroundColor: THEME.cardBg,
        borderRadius: s(18, 24, 32),
        padding: s(20, 25, 35),
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: THEME.red
    },
    modalTitle: {
        color: THEME.textWhite,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold'
        , marginBottom: s(8, 10, 14)
    },
    modalText: {
        color: THEME.textMuted,
        fontSize: s(12, 14, 18),
        textAlign: 'center',
        lineHeight: s(18, 22, 28),
        marginBottom: s(18, 25, 35)
    },
    modalActions: {
        flexDirection: 'row',
        gap: s(8, 12, 16),
        width: '100%'
    },
    modalBtnCancel: {
        flex: 1,
        backgroundColor: THEME.inputBg,
        paddingVertical: s(10, 14, 18),
        borderRadius: s(10, 12, 16),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.border
    },
    modalBtnCancelText: {
        color: THEME.textWhite,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },
    modalBtnConfirm: {
        flex: 1,
        backgroundColor: THEME.red,
        paddingVertical: s(10, 14, 18),
        borderRadius: s(10, 12, 16),
        alignItems: 'center'
    },
    modalBtnConfirmText: {
        color: '#FFF',
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },
});