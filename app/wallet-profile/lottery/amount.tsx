import { useBetStore } from '@/store/useBetStore';
import { TabType, useNumberStore } from '@/store/useNumberStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
    borderNormal: 'rgba(255, 255, 255, 0.08)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    danger: '#FF3B30',
    gold: '#FFD700',
};

const LABELS: Record<string, string> = {
    top3: 'အပေါ် ၃ လုံး', tod3: 'တွတ် ၃ လုံး', rev3: 'အပြန်',
    top2: 'အပေါ် ၂ လုံး', bot2: 'အောက် ၂ လုံး', rev2: 'အပြန် ၂ လုံး',
    run_top: 'အပေါ်ပြေး', run_bot: 'အောက်ပြေး',
};

export default function AmountScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { numbers, removeNumber } = useNumberStore();

    const currency = useBetStore((state) => state.currency) || 'Ks';

    const [amounts, setAmounts] = useState<Record<string, string>>({});
    const [batchAmount, setBatchAmount] = useState('');

    const [showBackAlert, setShowBackAlert] = useState(false);

    const listData = useMemo(() => {
        const data: { tab: TabType; key: string; mode: string; num: string }[] = [];
        (['3D', '2D', '1D'] as TabType[]).forEach(tab => {
            numbers[tab].forEach(item => {
                const lastIdx = item.lastIndexOf('_');
                const mode = item.substring(0, lastIdx);
                const num = item.substring(lastIdx + 1);
                data.push({ tab, key: item, mode, num });
            });
        });
        return data;
    }, [numbers]);

    const isAllAmountsFilled = useMemo(() => {
        if (listData.length === 0) return false;
        return listData.every(item => {
            const amt = parseInt(amounts[item.key] || '0', 10);
            return !isNaN(amt) && amt > 0;
        });
    }, [listData, amounts]);

    const totalAmount = useMemo(() => {
        let total = 0;
        Object.values(amounts).forEach(val => {
            const numVal = parseInt(val, 10);
            if (!isNaN(numVal)) total += numVal;
        });
        return total;
    }, [amounts]);

    const handleBackPress = () => {
        if (listData.length > 0) {
            setShowBackAlert(true);
        } else {
            router.back();
        }
    };

    useEffect(() => {
        const onHardwareBackPress = () => {
            if (listData.length > 0) {
                setShowBackAlert(true);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
        return () => backHandler.remove();
    }, [listData.length]);

    const handleAmountChange = (key: string, value: string) => {
        const cleanedValue = value.replace(/[^0-9]/g, '');
        setAmounts(prev => ({ ...prev, [key]: cleanedValue }));
    };

    const applyBatchAmount = () => {
        if (!batchAmount) return;
        const newAmounts: Record<string, string> = {};
        listData.forEach(item => {
            newAmounts[item.key] = batchAmount;
        });
        setAmounts(newAmounts);
    };

    const handleDelete = (tab: TabType, key: string) => {
        removeNumber(tab, key);
        setAmounts(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleConfirm = () => {
        if (!isAllAmountsFilled) return;

        router.push({
            pathname: '/wallet-profile/lottery/paymet',
            params: { totalPay: totalAmount.toString() }
        });
    };

    const renderItem = ({ item }: { item: { tab: TabType; key: string; mode: string; num: string } }) => {
        const modeLabel = LABELS[item.mode] || item.mode;

        return (
            <View style={styles.rowCard}>
                <View style={styles.numInfoBox}>
                    <Text style={styles.numberText}>{item.num}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.tab} - {modeLabel}</Text>
                    </View>
                </View>

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.amountInput}
                        placeholder="ပမာဏ"
                        placeholderTextColor={THEME.textMuted}
                        keyboardType="number-pad"
                        value={amounts[item.key] || ''}
                        onChangeText={(val) => handleAmountChange(item.key, val)}
                    />
                    <Text style={styles.currency}>{currency}</Text>
                </View>

                <Pressable onPress={() => handleDelete(item.tab, item.key)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={s(20, 22, 28)} color={THEME.danger} />
                </Pressable>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Modal visible={showBackAlert} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Ionicons name="warning" size={s(40, 48, 60)} color={THEME.danger} style={{ marginBottom: s(10, 15, 20) }} />
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

            <View style={[styles.header, { paddingTop: Math.max(insets.top, s(10, 15, 20)) }]}>
                <Pressable onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={s(22, 26, 32)} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>ပမာဏ သတ်မှတ်ရန်</Text>
                <View style={{ width: s(36, 40, 50) }} />
            </View>

            <View style={styles.batchContainer}>
                <Text style={styles.batchLabel}>ပမာဏတူ အမြန်ထည့်ရန်</Text>
                <View style={styles.batchInputRow}>
                    <TextInput
                        style={styles.batchInput}
                        placeholder="ဥပမာ - ၁၀၀၀"
                        placeholderTextColor={THEME.textMuted}
                        keyboardType="number-pad"
                        value={batchAmount}
                        onChangeText={(val) => setBatchAmount(val.replace(/[^0-9]/g, ''))}
                    />
                    <Pressable style={styles.applyBtn} onPress={applyBatchAmount}>
                        <Text style={styles.applyBtnText}>အားလုံးထည့်မည်</Text>
                    </Pressable>
                </View>
            </View>

            <FlatList
                data={listData}
                keyExtractor={(item) => item.key}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <Text style={styles.emptyText}>ရွေးချယ်ထားသော ဂဏန်းမရှိပါ။</Text>
                }
            />

            <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom + s(8, 10, 14), s(12, 15, 20)) }]}>
                <View style={styles.totalBox}>
                    <Text style={styles.totalLabel}>စုစုပေါင်း ({listData.length} ကွက်)</Text>
                    <Text style={styles.totalAmount}>
                        {totalAmount.toLocaleString()} <Text style={{ fontSize: s(12, 14, 18) }}>{currency}</Text>
                    </Text>
                </View>

                <Pressable
                    style={[styles.confirmBtn, !isAllAmountsFilled && { backgroundColor: THEME.inputBg, borderColor: THEME.borderNormal, borderWidth: 1 }]}
                    onPress={handleConfirm}
                    disabled={!isAllAmountsFilled}
                >
                    <Text style={[styles.confirmBtnText, !isAllAmountsFilled && { color: THEME.textMuted }]}>
                        အတည်ပြုမည်
                    </Text>
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

    batchContainer: {
        backgroundColor: THEME.cardBg,
        margin: s(12, 16, 24),
        padding: s(12, 15, 20),
        borderRadius: s(12, 16, 20),
        borderWidth: 1,
        borderColor: THEME.borderNormal
    },
    batchLabel: {
        color: THEME.gold,
        fontSize: s(11, 13, 16),
        fontWeight: 'bold',
        marginBottom: s(8, 10, 14)
    },
    batchInputRow: {
        flexDirection: 'row',
        gap: s(8, 10, 14)
    },
    batchInput: {
        flex: 1,
        height: s(40, 45, 55),
        backgroundColor: THEME.inputBg,
        borderRadius: s(8, 10, 14),
        paddingHorizontal: s(12, 15, 20),
        color: THEME.textWhite,
        fontSize: s(14, 16, 20),
        fontWeight: 'bold'
    },
    applyBtn: {
        backgroundColor: 'rgba(0, 230, 118, 0.15)',
        justifyContent: 'center',
        paddingHorizontal: s(12, 15, 20),
        borderRadius: s(8, 10, 14),
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.4)'
    },
    applyBtnText: {
        color: THEME.neonGreen,
        fontSize: s(12, 14, 18),
        fontWeight: 'bold'
    },

    listContent: {
        paddingHorizontal: s(12, 16, 24),
        paddingBottom: s(80, 100, 140)
    },
    emptyText: {
        color: THEME.textMuted,
        textAlign: 'center',
        marginTop: s(40, 50, 70),
        fontSize: s(13, 15, 18)
    },

    rowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.cardBg,
        padding: s(10, 12, 16),
        borderRadius: s(12, 14, 18),
        marginBottom: s(8, 10, 14),
        borderWidth: 1,
        borderColor: THEME.borderNormal
    },
    numInfoBox: {
        flex: 1
    },
    numberText: {
        color: THEME.neonGreen,
        fontSize: s(18, 22, 30),
        fontWeight: '900',
        letterSpacing: s(1, 2, 4),
        marginBottom: s(2, 4, 6)
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: s(6, 8, 12),
        paddingVertical: s(2, 4, 6),
        borderRadius: s(4, 6, 8)
    },
    badgeText: {
        color: THEME.textMuted,
        fontSize: s(9, 11, 14),
        fontWeight: 'bold'
    },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.inputBg,
        borderRadius: s(8, 10, 14),
        paddingRight: s(8, 10, 14),
        width: s(90, 110, 150),
        height: s(40, 45, 55)
    },
    amountInput: {
        flex: 1,
        color: THEME.textWhite,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold',
        paddingHorizontal: s(8, 10, 14),
        textAlign: 'right'
    },
    currency: {
        color: THEME.textMuted,
        fontSize: s(10, 12, 15),
        fontWeight: 'bold'
    },

    deleteBtn: {
        padding: s(8, 10, 14),
        marginLeft: s(2, 5, 8)
    },

    bottomPanel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: THEME.cardBg,
        paddingHorizontal: s(12, 16, 24),
        paddingTop: s(12, 15, 20),
        borderTopWidth: 1,
        borderTopColor: THEME.borderNormal
    },
    totalBox: {
        flex: 1
    },
    totalLabel: {
        color: THEME.textMuted,
        fontSize: s(10, 12, 15),
        fontWeight: 'bold',
        marginBottom: s(2, 4, 6)
    },
    totalAmount: {
        color: THEME.gold,
        fontSize: s(18, 22, 30),
        fontWeight: '900'
    },
    confirmBtn: {
        backgroundColor: THEME.neonGreen,
        paddingHorizontal: s(16, 20, 28),
        paddingVertical: s(12, 14, 18),
        borderRadius: s(12, 14, 18)
    },
    confirmBtnText: {
        color: '#000',
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
        borderRadius: s(20, 24, 30),
        padding: s(20, 25, 35),
        alignItems: 'center',
        width: '100%',
        maxWidth: s(360, 400, 500),
        borderWidth: 1,
        borderColor: THEME.danger
    },
    modalTitle: {
        color: THEME.textWhite,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold',
        marginBottom: s(8, 10, 14)
    },
    modalText: {
        color: THEME.textMuted,
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
        backgroundColor: THEME.inputBg,
        paddingVertical: s(12, 14, 18),
        borderRadius: s(10, 12, 16),
        alignItems: 'center'
    },
    modalBtnCancelText: {
        color: THEME.textWhite,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },
    modalBtnConfirm: {
        flex: 1,
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
});