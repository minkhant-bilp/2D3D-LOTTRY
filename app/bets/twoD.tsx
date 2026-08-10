import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
        setPin,
        addMultipleBets
    } = useBetStore() as any;

    const [fastNum, setFastNum] = useState('');
    const [fastAmt, setFastAmt] = useState('');

    const [pasteText, setPasteText] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalNumbers, setModalNumbers] = useState<string[]>([]);
    const [modalAmt, setModalAmt] = useState('');

    const filledRows = betRows.filter((row: any) => row.number !== '');
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

    const handleQuickPick = (type: string) => {
        let numbersToAdd: string[] = [];
        const inputVal = fastNum.trim();

        if ((type === 'DIRECT' || type === 'R') && !fastAmt) {
            Alert.alert('သတိပေးချက်', 'ကျေးဇူးပြု၍ လောင်းကြေးငွေပမာဏ ထည့်ပါ။');
            return;
        }

        if (type === 'DIRECT' || type === 'R') {
            if (!inputVal || inputVal.length !== 2) {
                Alert.alert('သတိပေးချက်', 'ဒဲ့/R အတွက် ဂဏန်း (၂) လုံး အတိအကျ ထည့်ပါ။');
                return;
            }
            if (type === 'DIRECT') {
                numbersToAdd = [inputVal];
            } else {
                const rev = inputVal[1] + inputVal[0];
                numbersToAdd = inputVal === rev ? [inputVal] : [inputVal, rev];
            }

            const bets = numbersToAdd.map(num => ({ number: num, amount: fastAmt }));
            if (addMultipleBets) addMultipleBets(bets);
            setFastNum('');
            return;
        }

        else if (type === 'APU') {
            numbersToAdd = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
        } else if (type === 'POWER') {
            numbersToAdd = ['05', '50', '16', '61', '27', '72', '38', '83', '49', '94'];
        } else if (type === 'NATKHAT') {
            numbersToAdd = ['07', '70', '18', '81', '24', '42', '35', '53', '69', '96'];
        } else if (type === 'KWAY') {
            if (inputVal.length < 2) {
                Alert.alert('သတိပေးချက်', 'ခွေရန်အတွက် ဂဏန်း (၂) လုံး အနည်းဆုံး ထည့်ပါ။');
                return;
            }
            let nums = [];
            let digits = inputVal.split('');
            for (let i = 0; i < digits.length; i++) {
                for (let j = 0; j < digits.length; j++) {
                    if (i !== j) nums.push(digits[i] + digits[j]);
                }
            }
            numbersToAdd = [...new Set(nums)];
        } else if (type === 'APAR') {
            if (inputVal.length < 1) {
                Alert.alert('သတိပေးချက်', 'အပါအတွက် ဂဏန်း ထည့်ပါ။');
                return;
            }
            let nums = [];
            let digits = inputVal.split('');
            for (let i = 0; i <= 99; i++) {
                let str = i.toString().padStart(2, '0');
                if (digits.some(d => str.includes(d))) {
                    nums.push(str);
                }
            }
            numbersToAdd = [...new Set(nums)];
        } else if (type === 'BROTHER') {
            numbersToAdd = ['01', '10', '12', '21', '23', '32', '34', '43', '45', '54', '56', '65', '67', '76', '78', '87', '89', '98', '90', '09'];
        }

        if (numbersToAdd.length > 0) {
            const typeNames: Record<string, string> = {
                APU: 'အပူ',
                POWER: 'ပါဝါ',
                NATKHAT: 'နက္ခတ်',
                KWAY: 'ခွေ',
                APAR: 'အပါ',
                BROTHER: 'ညီအစ်ကို'
            };
            const pickName = typeNames[type] || 'ရွေးချယ်မှု';

            setModalTitle(pickName);
            setModalNumbers(numbersToAdd);
            setModalAmt(fastAmt);
            setModalVisible(true);
        }
    };

    const confirmCustomAlert = () => {
        if (!modalAmt || parseInt(modalAmt) <= 0) {
            Alert.alert('သတိပေးချက်', 'ကျေးဇူးပြု၍ လောင်းကြေးငွေပမာဏကို ထည့်ပါ။');
            return;
        }
        const bets = modalNumbers.map(num => ({ number: num, amount: modalAmt }));
        if (addMultipleBets) {
            addMultipleBets(bets);
        }
        setModalVisible(false);
        setFastNum('');
    };

    const handlePasteSubmit = () => {
        if (!pasteText.trim()) {
            Alert.alert('သတိပေးချက်', 'ဂဏန်းများကို Paste ချပါ။');
            return;
        }
        if (!fastAmt) {
            Alert.alert('သတိပေးချက်', 'ကျေးဇူးပြု၍ လောင်းကြေးငွေပမာဏကို အပေါ်တွင် သတ်မှတ်ပါ။');
            return;
        }

        const matches = pasteText.match(/\b\d{2}\b/g);

        if (matches && matches.length > 0) {
            const uniqueNums = [...new Set(matches)];
            const bets = uniqueNums.map(num => ({ number: num, amount: fastAmt }));
            if (addMultipleBets) {
                addMultipleBets(bets);
            }
            setPasteText('');
            Alert.alert('အောင်မြင်ပါသည်', `ဂဏန်း (${uniqueNums.length}) ကွက် ထည့်သွင်းပြီးပါပြီ။`);
        } else {
            Alert.alert('အမှား', '(၂) လုံး ဂဏန်းများ ရှာမတွေ့ပါ။ ဖော်မတ် မှန်ကန်မှုရှိမရှိ စစ်ဆေးပါ။ (ဥပမာ - 12 34 56)');
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
                keyboardShouldPersistTaps="handled"
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

                        <View style={styles.fastEntryOuter}>
                            <View style={styles.fastEntryInner}>
                                <View style={styles.fastEntryHeader}>
                                    <MaterialIcons name="bolt" size={22} color="#FBBF24" />
                                    <Text style={styles.fastEntryTitle}>အမြန်ရွေးချယ်မှု (FAST ENTRY)</Text>
                                </View>

                                <View style={styles.fastInputRow}>
                                    <View style={styles.fastInputWrapper}>
                                        <Text style={styles.fastInputLabel}>ဂဏန်း (00-99)</Text>
                                        <TextInput
                                            style={styles.fastInput}
                                            keyboardType="number-pad"
                                            maxLength={2}
                                            placeholder="23"
                                            placeholderTextColor="#4B5563"
                                            value={fastNum}
                                            onChangeText={setFastNum}
                                        />
                                    </View>
                                    <View style={styles.fastInputWrapper}>
                                        <Text style={styles.fastInputLabel}>ငွေပမာဏ (MMK)</Text>
                                        <TextInput
                                            style={styles.fastInput}
                                            keyboardType="number-pad"
                                            placeholder="1000"
                                            placeholderTextColor="#4B5563"
                                            value={fastAmt}
                                            onChangeText={setFastAmt}
                                        />
                                    </View>
                                </View>

                                <View style={styles.fastActionGrid}>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('DIRECT')}>
                                        <Text style={styles.fastActionText}>ဒဲ့</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('R')}>
                                        <Text style={styles.fastActionText}>R</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('APU')}>
                                        <Text style={styles.fastActionText}>အပူ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('KWAY')}>
                                        <Text style={styles.fastActionText}>ခွေ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('APAR')}>
                                        <Text style={styles.fastActionText}>အပါ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('POWER')}>
                                        <Text style={styles.fastActionText}>ပါဝါ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('NATKHAT')}>
                                        <Text style={styles.fastActionText}>နက္ခတ်</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('BROTHER')}>
                                        <Text style={styles.fastActionText}>ညီအစ်ကို</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.pasteCardOuter}>
                            <View style={styles.pasteCardInner}>
                                <View style={styles.pasteHeader}>
                                    <MaterialIcons name="content-paste" size={20} color="#3B82F6" />
                                    <Text style={styles.pasteTitle}>ဂဏန်းများ COPY / PASTE လုပ်ရန်</Text>
                                </View>
                                <Text style={styles.pasteInstruction}>
                                    အပေါ်တွင် ငွေပမာဏ သတ်မှတ်ပြီး၊ အောက်ပါအကွက်တွင် ဂဏန်းများ Paste ချပါ။
                                </Text>
                                <TextInput
                                    style={styles.pasteInput}
                                    multiline
                                    placeholder="ဥပမာ - 12, 34, 56, 78"
                                    placeholderTextColor="#4B5563"
                                    value={pasteText}
                                    onChangeText={setPasteText}
                                />
                                <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteSubmit}>
                                    <MaterialIcons name="add-task" size={20} color="#FFFFFF" />
                                    <Text style={styles.pasteBtnText}>စာရင်းထဲသို့ ထည့်သွင်းမည်</Text>
                                </TouchableOpacity>
                            </View>
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
                                        {filledRows.map((row: any) => {
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

                                {betRows.map((row: any) => (
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
                                    {filledRows.map((row: any) => {
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

            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{modalTitle} ({modalNumbers.length}) ကွက်</Text>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <Text style={styles.modalLabel}>ငွေပမာဏ (MMK)</Text>
                        <TextInput
                            style={styles.modalInput}
                            keyboardType="number-pad"
                            placeholder="ဥပမာ - 1000"
                            placeholderTextColor="#4B5563"
                            value={modalAmt}
                            onChangeText={setModalAmt}
                            autoFocus={true}
                        />

                        <Text style={styles.modalLabel}>ပါဝင်သော ဂဏန်းများ</Text>
                        <ScrollView style={styles.modalGridScroll} nestedScrollEnabled={true}>
                            <View style={styles.modalNumberGrid}>
                                {modalNumbers.map(n => (
                                    <View key={n} style={styles.modalNumBadge}>
                                        <Text style={styles.modalNumText}>{n}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalCancelText}>ပယ်ဖျက်မည်</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmCustomAlert}>
                                <LinearGradient colors={['#34D399', '#10B981']} style={styles.modalConfirmGrad}>
                                    <Text style={styles.modalConfirmText}>အတည်ပြုသည်</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#070D1F' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
    backBtn: { marginRight: 12, padding: 4 },
    headerTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5 },
    scrollContent: { paddingHorizontal: 20 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    mainTitle: { color: '#F7F9FF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    subTitle: { color: '#9CA3AF', fontSize: 13 },
    pillOuter: { backgroundColor: 'rgba(16, 185, 129, 0.3)', padding: 1, borderRadius: 20, marginTop: 4 },
    pillInner: { backgroundColor: '#042F21', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 19 },
    pillText: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
    section: { marginBottom: 20 },
    label: { color: '#6B7280', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },

    fastEntryOuter: { backgroundColor: 'rgba(251, 191, 36, 0.18)', padding: 1, borderRadius: 16, marginBottom: 20 },
    fastEntryInner: { backgroundColor: '#0B1221', borderRadius: 15, padding: 16 },
    fastEntryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    fastEntryTitle: { color: '#FBBF24', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, marginLeft: 8 },
    fastInputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    fastInputWrapper: { flex: 1 },
    fastInputLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold', marginBottom: 6 },
    fastInput: { backgroundColor: '#050A1F', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10, height: 48, color: '#FFF', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16, textAlign: 'center' },
    fastActionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    fastActionBtn: { flex: 1, minWidth: '22%', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
    fastActionText: { color: '#E5E7EB', fontSize: 14, fontWeight: 'bold' },

    pasteCardOuter: { backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: 1, borderRadius: 16, marginBottom: 24 },
    pasteCardInner: { backgroundColor: '#0A132B', borderRadius: 15, padding: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.4)' },
    pasteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    pasteTitle: { color: '#3B82F6', fontSize: 14, fontWeight: 'bold', letterSpacing: 1, marginLeft: 8 },
    pasteInstruction: { color: '#9CA3AF', fontSize: 11, marginBottom: 12, lineHeight: 16 },
    pasteInput: { backgroundColor: '#050A1F', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 10, minHeight: 80, color: '#FFF', fontSize: 16, padding: 12, textAlignVertical: 'top', marginBottom: 12 },
    pasteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', borderRadius: 10, paddingVertical: 14 },
    pasteBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '90%', maxHeight: '85%', backgroundColor: '#0B1221', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { color: '#FBBF24', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
    modalLabel: { color: '#9CA3AF', fontSize: 13, fontWeight: 'bold', marginBottom: 10 },
    modalInput: { backgroundColor: '#050A1F', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, height: 54, color: '#FFF', fontSize: 20, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 24 },
    modalGridScroll: { maxHeight: 180, marginBottom: 24 },
    modalNumberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    modalNumBadge: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.25)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
    modalNumText: { color: '#93C5FD', fontSize: 15, fontWeight: 'bold' },
    modalActions: { flexDirection: 'row', gap: 12 },
    modalCancelBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 50 },
    modalCancelText: { color: '#E5E7EB', fontSize: 15, fontWeight: 'bold' },
    modalConfirmBtn: { flex: 1, borderRadius: 12, overflow: 'hidden', height: 50 },
    modalConfirmGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    modalConfirmText: { color: '#042F21', fontSize: 15, fontWeight: 'bold' },

    redBoxOuter: { backgroundColor: 'rgba(248, 113, 113, 0.25)', padding: 1, borderRadius: 12 },
    redBoxInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A0D14', padding: 16, borderRadius: 11 },
    boxTextContainer: { marginLeft: 12 },
    redBoxTitle: { color: '#F87171', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
    redBoxSub: { color: '#9CA3AF', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
    summaryCardOuter: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 1, borderRadius: 16, marginBottom: 20 },
    summaryCardInner: { backgroundColor: '#0B1221', borderRadius: 15, padding: 16 },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    summaryTitle: { color: '#6B7280', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    summaryTotal: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
    summaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
    chipValid: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
    chipInvalid: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' },
    chipText: { fontSize: 13 },
    chipTextValid: { color: '#10B981', fontWeight: 'bold' },
    chipTextInvalid: { color: '#F59E0B', fontWeight: 'bold' },
    chipAmountText: { fontWeight: 'normal', opacity: 0.6 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 16 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowLabel: { color: '#9CA3AF', fontSize: 14 },
    rowValueWhite: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    rowValueColored: { fontSize: 14, fontWeight: 'bold' },
    pinInput: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, color: '#FFF', fontSize: 16, letterSpacing: 4 },
    topUpOuter: { backgroundColor: 'rgba(16, 185, 129, 0.3)', padding: 1, borderRadius: 12, marginBottom: 20 },
    topUpInner: { backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 16, borderRadius: 11, alignItems: 'center' },
    topUpText: { color: '#10B981', fontSize: 14, fontWeight: 'bold' },
    actionsCardOuter: { backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: 1, borderRadius: 16, marginTop: 10 },
    actionsCardInner: { backgroundColor: 'rgba(7, 15, 37, 0.95)', borderRadius: 15, padding: 16 },
    grid2: { flexDirection: 'row', gap: 12 },
    stepBackBtn: { flex: 1, height: 56, backgroundColor: 'rgba(59, 130, 246, 0.08)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.25)', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    stepBackText: { color: '#93C5FD', fontSize: 15, fontWeight: 'bold', marginLeft: 6 },
    confirmBtn: { flex: 1.1, borderRadius: 12, overflow: 'hidden' },
    confirmBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
    confirmBtnText: { color: '#042F21', fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginRight: 4 },
    fieldsetOuter: { backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: 1, borderRadius: 16, marginTop: 10 },
    fieldsetInner: { backgroundColor: '#070D1F', borderRadius: 15, padding: 16, paddingTop: 24 },
    legendWrapper: { position: 'absolute', top: -10, left: 16, backgroundColor: '#070D1F', paddingHorizontal: 8 },
    legendText: { color: '#9CA3AF', fontSize: 14, fontWeight: 'bold' },
    rowCardOuter: { backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: 1, borderRadius: 12, marginBottom: 20 },
    rowCardInner: { backgroundColor: '#0B1221', borderRadius: 11, padding: 16 },
    rowCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    potentialWinLabel: { color: '#4B5563', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
    potentialWinValue: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
    closeBtnOuter: { backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 1, borderRadius: 8 },
    closeBtnInner: { backgroundColor: '#070D1F', padding: 6, borderRadius: 7 },
    inputLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
    inputOuter: { backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: 1, borderRadius: 12, marginBottom: 16 },
    inputInner: { backgroundColor: '#050A1F', borderRadius: 11, height: 48, paddingHorizontal: 16, color: '#F7F9FF', fontSize: 16, fontWeight: 'bold' },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    clearBtnOuter: { backgroundColor: 'rgba(248, 113, 113, 0.3)', padding: 1, borderRadius: 20 },
    clearBtnInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(248, 113, 113, 0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 19 },
    clearBtnText: { color: '#F87171', fontSize: 12, fontWeight: 'bold', marginLeft: 6, letterSpacing: 0.5 },
    addBtnOuter: { backgroundColor: 'rgba(16, 185, 129, 0.3)', padding: 1, borderRadius: 24 },
    addBtnInner: { backgroundColor: 'rgba(16, 185, 129, 0.15)', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    nextBtnOuter: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
    nextBtnInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, paddingHorizontal: 20 },
    nextBtnText: { color: '#042F21', fontSize: 16, fontWeight: 'bold' },
    nextIconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0, 0, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },
});