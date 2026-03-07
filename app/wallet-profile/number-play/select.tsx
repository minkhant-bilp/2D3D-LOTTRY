import { useBetStore } from '@/store/useBetStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
                        onChangeText={(val) => onUpdate(group.numbers, val)}
                    />
                    <Text style={styles.currency}>Ks</Text>
                </View>
                {group.count > 1 && group.amount !== '' && (
                    <Text style={styles.subTotalText}>
                        စုစုပေါင်း: {(parseInt(group.amount) || 0) * group.count} Ks
                    </Text>
                )}
            </View>


            <Pressable onPress={() => onRemove(group.numbers)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color={THEME.red} />
            </Pressable>
        </View>
    );
};


const arePropsEqual = (prevProps: BetItemRowProps, nextProps: BetItemRowProps) => {
    return prevProps.group.amount === nextProps.group.amount && prevProps.group.id === nextProps.group.id;
};
const BetItemRow = React.memo(BetItemRowComponent, arePropsEqual);



export default function BettingCartCard() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const bets = useBetStore((state) => state.bets);
    const updateAmount = useBetStore((state) => state.updateAmount);
    const updateAllAmounts = useBetStore((state) => state.updateAllAmounts);
    const removeBet = useBetStore((state) => state.removeBet);

    const [batchAmount, setBatchAmount] = useState('');
    const [hasWarned, setHasWarned] = useState(false);
    const [toastMsg, setToastMsg] = useState('အသိပေးချက်');

    const userBalance = 150000;


    const totalAmount = useMemo(() => {
        return bets.reduce((sum, bet) => sum + (parseInt(bet.amount) || 0), 0);
    }, [bets]);


    const groupedBets = useMemo(() => {
        let grouped: GroupedBet[] = [];
        let remaining = [...bets];
        const doubles = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];

        const hasAllDoubles = doubles.every(d => remaining.find(b => b.num === d));
        if (hasAllDoubles) {
            const doubleBets = remaining.filter(b => doubles.includes(b.num));
            grouped.push({
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
                    grouped.push({
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


            grouped.push({
                id: `single_${bet.num}`,
                label: bet.num,
                numbers: [bet.num],
                amount: bet.amount,
                count: 1
            });
            processed.add(bet.num);
        }
        return grouped;
    }, [bets]);


    const handleUpdateGroupAmount = useCallback((numbers: string[], amount: string) => {
        numbers.forEach(num => updateAmount(num, amount));
    }, [updateAmount]);

    const handleRemoveGroup = useCallback((numbers: string[]) => {
        numbers.forEach(num => removeBet(num));
    }, [removeBet]);


    const toastTranslateY = useSharedValue(-100);
    const toastOpacity = useSharedValue(0);
    const toastAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: toastTranslateY.value }], opacity: toastOpacity.value }));

    const triggerToast = useCallback((message: string) => {
        setToastMsg(message);
        toastTranslateY.value = withSequence(
            withSpring(insets.top + 10, { damping: 12, stiffness: 100 }),
            withDelay(3000, withTiming(-100, { duration: 400 }))
        );
        toastOpacity.value = withSequence(
            withTiming(1, { duration: 300 }),
            withDelay(3000, withTiming(0, { duration: 400 }))
        );
    }, [insets.top, toastOpacity, toastTranslateY]);

    useEffect(() => {
        if (totalAmount > userBalance && !hasWarned) {
            triggerToast('လက်ကျန်ငွေထက် ကျော်လွန်နေပါသည်!');
            setHasWarned(true);
        } else if (totalAmount <= userBalance) {
            setHasWarned(false);
        }
    }, [totalAmount, userBalance, triggerToast, hasWarned]);

    const renderItem = useCallback(({ item }: { item: GroupedBet }) => (
        <BetItemRow group={item} onUpdate={handleUpdateGroupAmount} onRemove={handleRemoveGroup} />
    ), [handleUpdateGroupAmount, handleRemoveGroup]);

    const handleBatchApply = () => {
        if (batchAmount) updateAllAmounts(batchAmount);
    };

    const handleConfirm = () => {
        const missingBet = bets.find(bet => !bet.amount || parseInt(bet.amount) <= 0);
        if (missingBet) {
            triggerToast(`ဂဏန်းအချို့တွင် ပမာဏ ထည့်ရန် ကျန်နေပါသည်!`);
            return;
        }
        if (totalAmount > userBalance) {
            triggerToast('လက်ကျန်ငွေ မလုံလောက်ပါ!');
            return;
        }
        console.log('Final Submit to API:', bets);
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Animated.View style={[styles.toastContainer, toastAnimatedStyle]}>
                <View style={styles.toastIconBox}>
                    <Ionicons name="warning" size={20} color={THEME.textWhite} />
                </View>
                <View style={styles.toastTextWrapper}>
                    <Text style={styles.toastTitle}>အသိပေးချက်</Text>
                    <Text style={styles.toastMessage}>{toastMsg}</Text>
                </View>
            </Animated.View>

            <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={26} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>လောင်းမယ့်စာရင်း</Text>
            </View>

            <View style={styles.balanceCard}>
                <View style={styles.balanceLeft}>
                    <Ionicons name="wallet" size={18} color={THEME.gold} />
                    <Text style={styles.balanceLabel}>လက်ကျန်ငွေ</Text>
                </View>
                <Text style={styles.balanceValue}>{userBalance.toLocaleString()} Ks</Text>
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
                        onChangeText={setBatchAmount}
                    />
                    <Pressable style={styles.applyBtn} onPress={handleBatchApply}>
                        <Text style={styles.applyBtnText}>အကုန်ထည့်မည်</Text>
                    </Pressable>
                </View>
            </View>

            <FlatList
                data={groupedBets}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={15}
                keyboardShouldPersistTaps="handled"
            />

            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
                <View style={styles.summaryInfo}>
                    <Text style={styles.summaryLabel}>စုစုပေါင်း ({bets.length} ကွက်)</Text>
                    <Text style={[styles.totalAmount, totalAmount > userBalance && { color: THEME.red }]}>
                        {totalAmount.toLocaleString()} Ks
                    </Text>
                </View>

                <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
                    <Text style={styles.confirmBtnText}>အတည်ပြုမည်</Text>
                    <Ionicons name="checkmark-circle" size={18} color="#0B132B" style={{ marginLeft: 6 }} />
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
        left: 16,
        right: 16,
        zIndex: 100,
        backgroundColor: 'rgba(255, 59, 48, 0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        ...Platform.select({
            ios: {
                shadowColor: THEME.red, shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.4,
                shadowRadius: 15
            },
            android: {
                elevation: 15,
                shadowColor: THEME.red
            }
        })
    },
    toastIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    toastTextWrapper: {
        flex: 1
    },
    toastTitle: {
        color: THEME.textWhite,
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 2
    },
    toastMessage: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 13,
        fontWeight: '600'
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 15
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    headerTitle: {
        color: THEME.textWhite,
        fontSize: 18,
        fontWeight: 'bold'
    },

    balanceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 215, 0, 0.08)',
        marginHorizontal: 16,
        marginBottom: 15,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)'
    },
    balanceLeft: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    balanceLabel: {
        color: THEME.textWhite,
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 8
    },
    balanceValue: {
        color: THEME.gold,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },

    batchContainer: {
        backgroundColor: THEME.cardBg,
        marginHorizontal: 16,
        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.border,
        marginBottom: 15
    },
    batchLabel: {
        color: THEME.textMuted,
        fontSize: 12,
        marginBottom: 10
    },
    batchInputRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    batchInput: {
        flex: 1,
        backgroundColor: THEME.inputBg,
        color: THEME.textWhite,
        height: 45,
        borderRadius: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: THEME.border,
        marginRight: 10,
        fontSize: 16,
        fontWeight: 'bold'
    },
    applyBtn: {
        backgroundColor: 'rgba(0, 230, 118, 0.15)',
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: THEME.neonGreen
    },
    applyBtnText: {
        color: THEME.neonGreen,
        fontSize: 13,
        fontWeight: 'bold'
    },

    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 160
    },

    betRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.cardBg,
        padding: 12,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: THEME.border
    },
    numBox: {
        minWidth: 65,
        paddingHorizontal: 10,
        minHeight: 48,
        backgroundColor: THEME.inputBg,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.gold
    },
    numText: {
        color: THEME.gold,
        fontSize: 16,
        fontWeight: '900',
        textAlign: 'center'
    },
    badgeBox: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 4
    },
    badgeText: {
        color: THEME.gold,
        fontSize: 10,
        fontWeight: 'bold'
    },

    inputWrapper: {
        flex: 1,
        marginLeft: 12
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.bg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: THEME.border,
        paddingRight: 12
    },
    textInput: {
        flex: 1,
        color: THEME.textWhite,
        height: 45,
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: '600'
    },
    currency: {
        color: THEME.textMuted,
        fontSize: 12,
        fontWeight: 'bold'
    },
    subTotalText: {
        color: THEME.neonGreen,
        fontSize: 11,
        fontWeight: '600',
        marginTop: 6,
        textAlign: 'right',
        marginRight: 4
    },

    deleteBtn: {
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8
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
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: THEME.border
    },
    summaryInfo: {
        justifyContent: 'center'
    },
    summaryLabel: {
        color: THEME.textMuted,
        fontSize: 12,
        marginBottom: 4
    },
    totalAmount: {
        color: THEME.gold,
        fontSize: 22,
        fontWeight: '900'
    },
    confirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.neonGreen,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 14
    },
    confirmBtnText: {
        color: '#0B132B',
        fontSize: 15,
        fontWeight: 'bold'
    }
});