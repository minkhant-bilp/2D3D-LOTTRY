import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SmartGenerateCard from '../../components/bets/SmartGenerateCard';
import { useBetStore } from '../../store/useBetStore';

export default function TwoDDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const {
        betRows,
        addBetRow,
        removeBetRow,
        updateBetRow,
        clearBetRows,
        getValidAmountTotal,
        currency,
        step,
        setStep,
        walletBalance,
        pin,
        setPin
    } = useBetStore();

    const filledRows = betRows.filter(row => row.number !== '');
    const validTotal = getValidAmountTotal();

    const isInsufficient = validTotal > walletBalance;
    const balanceAfter = walletBalance - validTotal;

    const handleBack = () => {
        if (step === 3) {
            setStep(2);
        } else {
            router.back();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={handleBack} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={22} color="#9CA3AF" />
                </Pressable>
                <Text style={styles.headerTitle}>2D FLASH MODE</Text>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 100 }]}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.titleRow}>
                    <View>
                        <Text style={styles.mainTitle}>လောင်းကြေး ထားမည်</Text>
                        <Text style={styles.subTitle}>Two-digit quick rounds</Text>
                    </View>
                    <View style={styles.pillOuter}>
                        <View style={styles.pillInner}>
                            <Text style={styles.pillText}>2D ဈေးကွက်</Text>
                        </View>
                    </View>
                </View>

                {step === 2 && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.label}>ဖွင့်ချိန် ပစ်မှတ်</Text>
                            <View style={styles.redBoxOuter}>
                                <View style={styles.redBoxInner}>
                                    <MaterialIcons name="lock-outline" size={22} color="#F87171" />
                                    <View style={styles.boxTextContainer}>
                                        <Text style={styles.redBoxTitle}>Betting closed for today</Text>
                                        <Text style={styles.redBoxSub}>OPENS TOMORROW AT 12:01 PM (MMT)</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <SmartGenerateCard />
                        </View>

                        {filledRows.length > 0 && (
                            <View style={styles.summaryCardOuter}>
                                <View style={styles.summaryCardInner}>
                                    <View style={styles.summaryHeader}>
                                        <Text style={styles.summaryTitle}>BET SUMMARY</Text>
                                        <Text style={styles.summaryTotal}>
                                            {filledRows.length} numbers · {validTotal.toLocaleString()} {currency}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryChips}>
                                        {filledRows.map((row) => {
                                            const amt = Number(row.amount);
                                            const isValid = /^\d+$/.test(row.amount.trim()) && Number.isInteger(amt) && amt >= 1;
                                            return (
                                                <View key={row.id} style={[styles.chip, isValid ? styles.chipValid : styles.chipInvalid]}>
                                                    <Text style={[styles.chipText, isValid ? styles.chipTextValid : styles.chipTextInvalid]}>
                                                        {row.number}
                                                        {row.amount !== '' && <Text style={styles.chipAmountText}> · {row.amount}</Text>}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>
                        )}

                        <View style={styles.fieldsetOuter}>
                            <View style={styles.fieldsetInner}>
                                <View style={styles.legendWrapper}>
                                    <Text style={styles.legendText}>ထီဂဏန်းများ</Text>
                                </View>

                                {betRows.map((row) => (
                                    <View key={row.id} style={styles.rowCardOuter}>
                                        <View style={styles.rowCardInner}>
                                            <View style={styles.rowCardHeader}>
                                                <View>
                                                    <Text style={styles.potentialWinLabel}>POTENTIAL WIN</Text>
                                                    <Text style={styles.potentialWinValue}>
                                                        {row.amount ? `x ${(Number(row.amount) * 80).toLocaleString()}` : '—'}
                                                    </Text>
                                                </View>
                                                <Pressable
                                                    style={[styles.closeBtnOuter, betRows.length === 1 && { opacity: 0.4 }]}
                                                    disabled={betRows.length === 1}
                                                    onPress={() => removeBetRow(row.id)}
                                                >
                                                    <View style={styles.closeBtnInner}>
                                                        <MaterialIcons name="close" size={18} color="#9CA3AF" />
                                                    </View>
                                                </Pressable>
                                            </View>

                                            <Text style={styles.inputLabel}>ဂဏန်း (00-99)</Text>
                                            <View style={styles.inputOuter}>
                                                <TextInput
                                                    style={styles.inputInner}
                                                    keyboardType="number-pad"
                                                    maxLength={2}
                                                    value={row.number}
                                                    onChangeText={(val) => updateBetRow(row.id, 'number', val)}
                                                />
                                            </View>

                                            <Text style={styles.inputLabel}>ငွေပမာဏ</Text>
                                            <View style={styles.inputOuter}>
                                                <TextInput
                                                    style={styles.inputInner}
                                                    keyboardType="number-pad"
                                                    value={row.amount}
                                                    onChangeText={(val) => updateBetRow(row.id, 'amount', val)}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                ))}

                                <View style={styles.actionsRow}>
                                    <Pressable style={styles.clearBtnOuter} onPress={clearBetRows}>
                                        <View style={styles.clearBtnInner}>
                                            <MaterialIcons name="delete-outline" size={18} color="#F87171" />
                                            <Text style={styles.clearBtnText}>CLEAR ALL</Text>
                                        </View>
                                    </Pressable>

                                    <Pressable style={styles.addBtnOuter} onPress={addBetRow}>
                                        <View style={styles.addBtnInner}>
                                            <MaterialIcons name="add" size={24} color="#10B981" />
                                        </View>
                                    </Pressable>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.nextBtnOuter, filledRows.length === 0 && { opacity: 0.5 }]}
                            disabled={filledRows.length === 0}
                            onPress={() => setStep(3)}
                        >
                            <LinearGradient
                                colors={['#34D399', '#10B981']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.nextBtnInner}
                            >
                                <Text style={styles.nextBtnText}>ရှေ့သို့</Text>
                                <View style={styles.nextIconWrapper}>
                                    <MaterialIcons name="arrow-forward" size={20} color="#042F21" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                )}

                {step === 3 && (
                    <>
                        <View style={styles.summaryCardOuter}>
                            <View style={[styles.summaryCardInner, { paddingVertical: 20 }]}>
                                <Text style={styles.summaryTitle}>BET SUMMARY</Text>
                                <View style={[styles.summaryChips, { marginVertical: 16 }]}>
                                    {filledRows.map((row) => {
                                        const amt = Number(row.amount);
                                        const isValid = /^\d+$/.test(row.amount.trim()) && Number.isInteger(amt) && amt >= 1;
                                        return (
                                            <View key={row.id} style={[styles.chip, isValid ? styles.chipValid : styles.chipInvalid]}>
                                                <Text style={[styles.chipText, isValid ? styles.chipTextValid : styles.chipTextInvalid]}>
                                                    {row.number}
                                                    {row.amount !== '' && <Text style={styles.chipAmountText}> · {row.amount}</Text>}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.rowBetween}>
                                    <Text style={styles.rowLabel}>Total</Text>
                                    <Text style={styles.rowValueWhite}>{validTotal.toLocaleString()} {currency}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.summaryCardOuter}>
                            <View style={[styles.summaryCardInner, { paddingVertical: 20 }]}>
                                <View style={[styles.rowBetween, { marginBottom: 12 }]}>
                                    <Text style={styles.rowLabel}>လက်ကျန်</Text>
                                    <Text style={styles.rowValueWhite}>{walletBalance.toLocaleString()} {currency}</Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.rowLabel}>After this bet</Text>
                                    <Text style={[styles.rowValueColored, isInsufficient ? { color: '#F87171' } : { color: '#10B981' }]}>
                                        {isInsufficient ? 'Insufficient' : `${balanceAfter.toLocaleString()} ${currency}`}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.summaryCardOuter}>
                            <View style={[styles.summaryCardInner, { paddingVertical: 20 }]}>
                                <Text style={[styles.summaryTitle, { marginBottom: 16 }]}>SECURITY PIN</Text>
                                <TextInput
                                    style={styles.pinInput}
                                    keyboardType="number-pad"
                                    secureTextEntry
                                    maxLength={6}
                                    placeholder="Enter 6-digit PIN"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={pin}
                                    onChangeText={(val) => setPin(val.replace(/\D/g, '').slice(0, 6))}
                                />
                            </View>
                        </View>

                        {isInsufficient && (
                            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/')}>
                                <View style={styles.topUpOuter}>
                                    <View style={styles.topUpInner}>
                                        <Text style={styles.topUpText}>→ Top up wallet</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}

                        <View style={styles.actionsCardOuter}>
                            <View style={styles.actionsCardInner}>
                                <View style={[styles.rowBetween, { marginBottom: 16 }]}>
                                    <Text style={styles.rowLabel}>ခန့်မှန်းစုစုပေါင်း:</Text>
                                    <Text style={styles.rowValueWhite}>{validTotal.toLocaleString()} {currency}</Text>
                                </View>

                                <View style={styles.grid2}>
                                    <TouchableOpacity style={styles.stepBackBtn} onPress={() => setStep(2)}>
                                        <MaterialIcons name="arrow-back" size={20} color="#93C5FD" />
                                        <Text style={styles.stepBackText}>နောက်သို့</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.confirmBtn, (isInsufficient || pin.length !== 6) && { opacity: 0.5 }]}
                                        disabled={isInsufficient || pin.length !== 6}
                                    >
                                        <LinearGradient
                                            colors={['#34D399', '#10B981']}
                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                            style={styles.confirmBtnGradient}
                                        >
                                            <Text style={styles.confirmBtnText}>လောင်းကြေး{'\n'}အတည်ပြုမည်</Text>
                                            <MaterialIcons name="arrow-forward" size={20} color="#042F21" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </>
                )}

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#070D1F',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: {
        marginRight: 12,
        padding: 4,
    },
    headerTitle: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        /* paddingBottom နေရာကို ScrollView ပေါ်တွင် တိုက်ရိုက် ထည့်သွင်းထားပါသည် */
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    mainTitle: {
        color: '#F7F9FF',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subTitle: {
        color: '#9CA3AF',
        fontSize: 13,
    },
    pillOuter: {
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
        padding: 1,
        borderRadius: 20,
        marginTop: 4,
    },
    pillInner: {
        backgroundColor: '#042F21',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 19,
    },
    pillText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    label: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    redBoxOuter: {
        backgroundColor: 'rgba(248, 113, 113, 0.25)',
        padding: 1,
        borderRadius: 12,
    },
    redBoxInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A0D14',
        padding: 16,
        borderRadius: 11,
    },
    boxTextContainer: {
        marginLeft: 12,
    },
    redBoxTitle: {
        color: '#F87171',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    redBoxSub: {
        color: '#9CA3AF',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    summaryCardOuter: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 1,
        borderRadius: 16,
        marginBottom: 20,
    },
    summaryCardInner: {
        backgroundColor: '#0B1221',
        borderRadius: 15,
        padding: 16,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryTitle: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    summaryTotal: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: 'bold',
    },
    summaryChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    chipValid: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    chipInvalid: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: 'rgba(245, 158, 11, 0.2)',
    },
    chipText: { fontSize: 13 },
    chipTextValid: { color: '#10B981', fontWeight: 'bold' },
    chipTextInvalid: { color: '#F59E0B', fontWeight: 'bold' },
    chipAmountText: { fontWeight: 'normal', opacity: 0.6 },

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 16 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowLabel: { color: '#9CA3AF', fontSize: 14 },
    rowValueWhite: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    rowValueColored: { fontSize: 14, fontWeight: 'bold' },

    pinInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#FFF',
        fontSize: 16,
        letterSpacing: 4,
    },

    topUpOuter: {
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
        padding: 1,
        borderRadius: 12,
        marginBottom: 20,
    },
    topUpInner: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        padding: 16,
        borderRadius: 11,
        alignItems: 'center',
    },
    topUpText: {
        color: '#10B981',
        fontSize: 14,
        fontWeight: 'bold',
    },

    actionsCardOuter: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        padding: 1,
        borderRadius: 16,
        marginTop: 10,
    },
    actionsCardInner: {
        backgroundColor: 'rgba(7, 15, 37, 0.95)',
        borderRadius: 15,
        padding: 16,
    },
    grid2: {
        flexDirection: 'row',
        gap: 12,
    },

    stepBackBtn: {
        flex: 1,
        height: 56,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.25)',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepBackText: {
        color: '#93C5FD',
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 6,
    },

    confirmBtn: {
        flex: 1.1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    confirmBtnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    confirmBtnText: {
        color: '#042F21',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        marginRight: 4,
    },

    fieldsetOuter: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        padding: 1,
        borderRadius: 16,
        marginTop: 10,
    },
    fieldsetInner: {
        backgroundColor: '#070D1F',
        borderRadius: 15,
        padding: 16,
        paddingTop: 24,
    },
    legendWrapper: {
        position: 'absolute',
        top: -10,
        left: 16,
        backgroundColor: '#070D1F',
        paddingHorizontal: 8,
    },
    legendText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    rowCardOuter: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        padding: 1,
        borderRadius: 12,
        marginBottom: 20,
    },
    rowCardInner: {
        backgroundColor: '#0B1221',
        borderRadius: 11,
        padding: 16,
    },
    rowCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    potentialWinLabel: {
        color: '#4B5563',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    potentialWinValue: {
        color: '#10B981',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeBtnOuter: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 1,
        borderRadius: 8,
    },
    closeBtnInner: {
        backgroundColor: '#070D1F',
        padding: 6,
        borderRadius: 7,
    },
    inputLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 8,
    },
    inputOuter: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        padding: 1,
        borderRadius: 12,
        marginBottom: 16,
    },
    inputInner: {
        backgroundColor: '#050A1F',
        borderRadius: 11,
        height: 48,
        paddingHorizontal: 16,
        color: '#F7F9FF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    clearBtnOuter: {
        backgroundColor: 'rgba(248, 113, 113, 0.3)',
        padding: 1,
        borderRadius: 20,
    },
    clearBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 19,
    },
    clearBtnText: {
        color: '#F87171',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    addBtnOuter: {
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
        padding: 1,
        borderRadius: 24,
    },
    addBtnInner: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },

    nextBtnOuter: {
        marginTop: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    nextBtnInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 20,
    },
    nextBtnText: {
        color: '#042F21',
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});