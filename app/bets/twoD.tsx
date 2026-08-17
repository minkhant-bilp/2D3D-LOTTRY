import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createBetAPI } from '../../api/main';
import { useAppStore } from '../../store/useAppStore';
import { useBetStore } from '../../store/useBetStore';

const NAKKHAT_NUMS = ['07', '70', '18', '81', '24', '42', '35', '53', '69', '96'];
const POWER_NUMS = ['05', '50', '16', '61', '27', '72', '38', '83', '49', '94'];
const BROTHER_NUMS = ['01', '10', '12', '21', '23', '32', '34', '43', '45', '54', '56', '65', '67', '76', '78', '87', '89', '98', '90', '09'];
const DOUBLE_NUMS = Array.from({ length: 10 }, (_, i) => `${i}${i}`);

function reverseNum(n: string) { return n[1] + n[0]; }
function generateInclude(digit: string) {
    const nums: string[] = [];
    for (let i = 0; i <= 9; i++) {
        const a = `${digit}${i}`, b = `${i}${digit}`;
        if (!nums.includes(a)) nums.push(a);
        if (b !== a && !nums.includes(b)) nums.push(b);
    }
    return nums;
}
function getKhwayNumbers(digits: string[], includeDoubles: boolean) {
    const nums: string[] = [];
    for (const a of digits) {
        for (const b of digits) {
            if (a === b && !includeDoubles) continue;
            const num = `${a}${b}`;
            if (!nums.includes(num)) nums.push(num);
        }
    }
    return nums;
}

type BulkPick = 'apu' | 'khway' | 'a-par' | 'power' | 'nakkhat' | 'brother';
const BULK_MODES: Record<BulkPick, 'fixed' | 'digits' | 'digit'> = { apu: 'fixed', power: 'fixed', nakkhat: 'fixed', brother: 'fixed', khway: 'digits', 'a-par': 'digit' };
const FIXED_SETS: Partial<Record<BulkPick, string[]>> = { apu: DOUBLE_NUMS, power: POWER_NUMS, nakkhat: NAKKHAT_NUMS, brother: BROTHER_NUMS };

function parsePastedBets(text: string, defaultAmount: string) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const results: { number: string; amount: string }[] = [];
    const seen = new Set<string>();

    const add = (number: string, amount: string) => {
        const key = `${number}|${amount}`;
        if (!seen.has(key)) { seen.add(key); results.push({ number, amount }); }
    };

    for (const line of lines) {
        const amtMatch = line.match(/\b\d{3,}\b/g);
        const lineAmt = amtMatch ? amtMatch[amtMatch.length - 1] : defaultAmount;

        if (/ပါဝါ|power/i.test(line)) { POWER_NUMS.forEach(n => add(n, lineAmt)); continue; }
        if (/နက္ခတ်|နက်ခတ်|N/i.test(line)) { NAKKHAT_NUMS.forEach(n => add(n, lineAmt)); continue; }
        if (/ညီကို|ညီအစ်ကို/.test(line)) { BROTHER_NUMS.forEach(n => add(n, lineAmt)); continue; }
        if (/အပူး|ပူး|double|D/i.test(line)) { DOUBLE_NUMS.forEach(n => add(n, lineAmt)); continue; }

        const incMatch = line.match(/(\d)\s*(?:အပါ|ပါ|p)/ui);
        if (incMatch) { generateInclude(incMatch[1]).forEach(n => add(n, lineAmt)); continue; }

        const isRev = /\(r\)|r/i.test(line);
        const nums = [...new Set(line.replace(/\(r\)|r/gi, ' ').match(/\b\d{2}\b/g) || [])];
        nums.forEach(n => {
            add(n, lineAmt);
            if (isRev) { const r = reverseNum(n); if (r !== n) add(r, lineAmt); }
        });
    }
    return results;
}

const TARGET_OPEN_TIME_OPTIONS = ['12:01:00', '16:30:00'];
const TARGET_OPEN_TIME_LABELS: Record<string, string> = {
    '12:01:00': '12:01 PM',
    '16:30:00': '4:30 PM',
};

function minutesOfDayMMT(): number {
    const d = new Date();
    const mmtTime = new Date(d.getTime() + 390 * 60000);
    return mmtTime.getUTCHours() * 60 + mmtTime.getUTCMinutes();
}

function isSessionExpired(openTime: string, currentMinutes: number): boolean {
    const parts = openTime.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const closeTimeMMT = h * 60 + m - 30;
    return currentMinutes >= closeTimeMMT;
}

export default function TwoDDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const wallet = useAppStore((state: any) => state.wallet);
    const refreshWallet = useAppStore((state: any) => state.refreshWallet);

    const realWalletBalance = Number(wallet?.balance ?? 0);
    const realCurrency = wallet?.currency ?? 'MMK';

    const { betRows, getValidAmountTotal, pin, setPin, addMultipleBets, removeBetRow, clearBetRows, step, setStep, updateBetRow } = useBetStore() as any;

    const filledRows = betRows.filter((r: any) => r.number !== '');
    const validTotal = getValidAmountTotal();

    const isInsufficient = validTotal > realWalletBalance;
    const balanceAfter = realWalletBalance - validTotal;

    const [currentMinutes, setCurrentMinutes] = useState(() => minutesOfDayMMT());

    useEffect(() => {
        const timer = setInterval(() => setCurrentMinutes(minutesOfDayMMT()), 10000);
        return () => clearInterval(timer);
    }, []);

    const availableTimes = useMemo(() => {
        return TARGET_OPEN_TIME_OPTIONS
            .filter(t => !isSessionExpired(t, currentMinutes))
            .map(t => ({ value: t, label: TARGET_OPEN_TIME_LABELS[t] }));
    }, [currentMinutes]);

    const isAllClosed = availableTimes.length === 0;

    const [targetTime, setTargetTime] = useState(() => {
        const mins = minutesOfDayMMT();
        const active = TARGET_OPEN_TIME_OPTIONS.find(t => !isSessionExpired(t, mins));
        return active || '16:30:00';
    });

    const [showTimeDropdown, setShowTimeDropdown] = useState(false);

    useEffect(() => {
        if (!isAllClosed && isSessionExpired(targetTime, currentMinutes)) {
            setTargetTime(availableTimes[0].value);
        }
    }, [currentMinutes, isAllClosed, availableTimes, targetTime]);

    const [fastNum, setFastNum] = useState('');
    const [fastAmt, setFastAmt] = useState('');
    const [fastError, setFastError] = useState<string | null>(null);
    const [skippedCount, setSkippedCount] = useState(0);

    const [pasteText, setPasteText] = useState('');
    const [pasteAmt, setPasteAmt] = useState('500');
    const [pasteError, setPasteError] = useState<string | null>(null);

    const [bulkPick, setBulkPick] = useState<{ key: BulkPick; label: string } | null>(null);
    const [modalAmt, setModalAmt] = useState('');
    const [modalDigits, setModalDigits] = useState<string[]>([]);
    const [modalIncludeDbl, setModalIncludeDbl] = useState(false);
    const [modalDigit, setModalDigit] = useState('');
    const [modalError, setModalError] = useState<string | null>(null);

    const handleBack = () => {
        if (step === 3) {
            setStep(2);
        } else {
            router.back();
        }
    };

    const handleStake = (numbers: string[], amount: string) => {
        const existing = new Set(filledRows.map((r: any) => r.number));
        const newBets: { number: string; amount: string }[] = [];
        let skips = 0;

        numbers.forEach(n => {
            if (existing.has(n)) skips++;
            else newBets.push({ number: n, amount });
        });

        if (newBets.length > 0) addMultipleBets(newBets);
        setSkippedCount(skips);
        return newBets.length;
    };

    const runQuickPick = (key: string, label: string) => {
        setFastError(null); setSkippedCount(0);
        if (key !== 'direct' && key !== 'reverse') {
            setBulkPick({ key: key as BulkPick, label });
            setModalAmt(fastAmt); setModalDigits([]); setModalDigit(''); setModalIncludeDbl(false); setModalError(null);
            return;
        }

        if (!fastAmt || parseInt(fastAmt) < 1) return setFastError('ကျေးဇူးပြု၍ လောင်းကြေးငွေပမာဏကို မှန်ကန်စွာ ထည့်ပါ။');
        if (fastNum.length !== 2) return setFastError('ဒဲ့ နှင့် R အတွက် ဂဏန်း (၂) လုံး အတိအကျ ထည့်ပါ။');

        const rev = reverseNum(fastNum);
        const nums = key === 'reverse' && rev !== fastNum ? [fastNum, rev] : [fastNum];
        if (handleStake(nums, fastAmt) === 0) setFastError(`ဂဏန်း ${nums.length} လုံး စလုံးမှာ ထည့်သွင်းပြီးသား ဖြစ်နေပါသည်။`);
        setFastNum('');
    };

    const runPaste = () => {
        setPasteError(null); setSkippedCount(0);
        if (!pasteAmt || parseInt(pasteAmt) < 1) return setPasteError('ကျေးဇူးပြု၍ Default Amount ထည့်ပါ။');

        const parsed = parsePastedBets(pasteText, pasteAmt);
        if (parsed.length === 0) return setPasteError('သင့်စာသားထဲတွင် ဂဏန်းများ ရှာမတွေ့ပါ။');

        const existing = new Set(filledRows.map((r: any) => r.number));
        const newBets = parsed.filter(b => !existing.has(b.number));

        if (newBets.length === 0) return setPasteError(`ဂဏန်း ${parsed.length} လုံး စလုံးမှာ ထည့်သွင်းပြီးသား ဖြစ်နေပါသည်။`);

        addMultipleBets(newBets);
        setSkippedCount(parsed.length - newBets.length);
        setPasteText('');
    };

    const modalNumbers = useMemo(() => {
        if (!bulkPick) return [];
        const mode = BULK_MODES[bulkPick.key];
        if (mode === 'fixed') return FIXED_SETS[bulkPick.key] ?? [];
        if (mode === 'digits') return getKhwayNumbers(modalDigits, modalIncludeDbl);
        return /^\d$/.test(modalDigit) ? generateInclude(modalDigit) : [];
    }, [bulkPick, modalDigits, modalIncludeDbl, modalDigit]);

    const confirmModal = () => {
        const mode = bulkPick ? BULK_MODES[bulkPick.key] : null;
        if (mode === 'digits' && modalDigits.length < 2) return setModalError('ခွေရန်အတွက် အနည်းဆုံး ဂဏန်း ၂ လုံး ရွေးပါ။');
        if (mode === 'digit' && !/^\d$/.test(modalDigit)) return setModalError('ကျေးဇူးပြု၍ ဂဏန်း ၁ လုံး အတိအကျ ထည့်ပါ။');
        if (!modalAmt || parseInt(modalAmt) < 1) return setModalError('လောင်းကြေးငွေပမာဏကို မှန်ကန်စွာ ထည့်ပါ။');

        if (handleStake(modalNumbers, modalAmt) === 0) {
            setModalError(`ဂဏန်း ${modalNumbers.length} လုံး စလုံးမှာ ထည့်သွင်းပြီးသား ဖြစ်နေပါသည်။`);
            return;
        }
        setBulkPick(null); setFastNum('');
    };

    const mutation = useMutation({
        mutationFn: createBetAPI,
        onSuccess: () => {
            Alert.alert('အောင်မြင်ပါသည်', 'လောင်းကြေး အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ။');
            clearBetRows(); setPin(''); refreshWallet();
            router.push('/results/twoDresult');
        },
        onError: (err: any) => {
            Alert.alert('အမှား', err?.response?.data?.message || 'လောင်းကြေးတင်ခြင်း မအောင်မြင်ပါ။');
        }
    });

    const submitBet = () => {
        if (isInsufficient) return Alert.alert('အမှား', 'လက်ကျန်ငွေ မလုံလောက်ပါ။');
        if (pin.length !== 6) return Alert.alert('အမှား', 'PIN ၆ လုံး ထည့်ပါ။');
        if (filledRows.length === 0) return Alert.alert('အမှား', 'ဂဏန်း အနည်းဆုံး ၁ ခု ထည့်ပါ။');

        mutation.mutate({
            bet_type: '2D',
            currency: realCurrency,
            target_opentime: targetTime,
            bet_numbers: filledRows.map((r: any) => ({ number: r.number, amount: parseInt(r.amount) })),
            security_pin: pin
        });
    };

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={handleBack} style={styles.backBtn}><MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" /></Pressable>
                <Text style={styles.headerTitle}>2D FLASH MODE</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

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
                        <View style={[styles.section, { zIndex: 10 }]}>
                            <Text style={styles.label}>TARGET OPEN TIME</Text>

                            {isAllClosed ? (
                                <View style={styles.lockedBox}>
                                    <MaterialIcons name="lock" size={24} color="#F87171" />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.lockedTitle}>ဒီနေ့အတွက် ပွဲပိတ်သွားပါပြီ</Text>
                                        <Text style={styles.lockedSub}>မနက်ဖြန် 12:01 PM တွင် ပြန်လည်စတင်ပါမည်</Text>
                                    </View>
                                </View>
                            ) : (
                                <Pressable
                                    style={[styles.timeBox, showTimeDropdown && { borderColor: 'rgba(59, 130, 246, 0.5)' }]}
                                    onPress={() => setShowTimeDropdown(!showTimeDropdown)}
                                >
                                    <MaterialIcons name="access-time" size={20} color="#10B981" />
                                    <View style={{ marginLeft: 12, flex: 1 }}>
                                        <Text style={styles.timeBoxTitle}>{TARGET_OPEN_TIME_LABELS[targetTime]}</Text>
                                        <Text style={styles.timeBoxSub}>SELECT TIME ({availableTimes.map(t => t.label).join(' OR ')})</Text>
                                    </View>
                                    {availableTimes.length > 1 && (
                                        <MaterialIcons name={showTimeDropdown ? "expand-less" : "expand-more"} size={22} color="#9CA3AF" />
                                    )}
                                </Pressable>
                            )}

                            {showTimeDropdown && availableTimes.length > 1 && !isAllClosed && (
                                <View style={styles.timeDropdownContainer}>
                                    {availableTimes.map(t => {
                                        const isActive = targetTime === t.value;
                                        return (
                                            <Pressable
                                                key={t.value}
                                                style={[styles.timeDropdownItem, isActive && styles.timeDropdownItemActive]}
                                                onPress={() => { setTargetTime(t.value); setShowTimeDropdown(false); }}
                                            >
                                                <Text style={[styles.timeDropdownText, isActive && { color: '#10B981' }]}>{t.label}</Text>
                                                {isActive && <MaterialIcons name="check" size={18} color="#10B981" />}
                                            </Pressable>
                                        )
                                    })}
                                </View>
                            )}
                        </View>

                        <View style={styles.fastCard}>
                            <View style={styles.cardTitleRow}>
                                <MaterialIcons name="bolt" size={20} color="#FBBF24" />
                                <Text style={styles.fastTitle}>အမြန်ရွေးချယ်မှု (FAST ENTRY)</Text>
                            </View>

                            <View style={styles.inputRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>ဂဏန်း (00-99)</Text>
                                    <TextInput style={styles.input} keyboardType="number-pad" maxLength={2} placeholder="23" placeholderTextColor="rgba(255,255,255,0.3)" value={fastNum} onChangeText={setFastNum} editable={!isAllClosed} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>ငွေပမာဏ (MMK)</Text>
                                    <TextInput style={styles.input} keyboardType="number-pad" placeholder="1000" placeholderTextColor="rgba(255,255,255,0.3)" value={fastAmt} onChangeText={setFastAmt} editable={!isAllClosed} />
                                </View>
                            </View>

                            <View style={styles.grid4}>
                                {[{ k: 'direct', l: 'ဒဲ့' }, { k: 'reverse', l: 'R' }, { k: 'apu', l: 'အပူး' }, { k: 'khway', l: 'ခွေ' },
                                { k: 'a-par', l: 'အပါ' }, { k: 'power', l: 'ပါဝါ' }, { k: 'nakkhat', l: 'နက္ခတ်' }, { k: 'brother', l: 'ညီအစ်ကို' }].map(p => (
                                    <TouchableOpacity key={p.k} style={styles.quickPickBtn} onPress={() => !isAllClosed && runQuickPick(p.k, p.l)}>
                                        <Text style={styles.quickPickText}>{p.l}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.hintText}>ဒဲ့ နှင့် R အတွက် ဂဏန်း (၂) လုံး ထည့်ပြီး တိုက်ရိုက် ထည့်သွင်းပါ။ ကျန်သည်များကို အရင် ကြည့်ရှုနိုင်ပါသည်။</Text>
                            {fastError && <Text style={styles.errorText}>{fastError}</Text>}
                            {skippedCount > 0 && <View style={styles.skipNotice}><Text style={styles.skipText}>ဂဏန်း {skippedCount} လုံးမှာ ထပ်နေသဖြင့် ပယ်ဖျက်လိုက်ပါသည်။</Text></View>}
                        </View>

                        <View style={styles.pasteCard}>
                            <View style={styles.cardTitleRow}>
                                <MaterialIcons name="content-paste" size={18} color="#3B82F6" />
                                <Text style={styles.pasteTitle}>ဂဏန်းများ COPY / PASTE လုပ်ရန်</Text>
                            </View>
                            <Text style={styles.hintText}>အောက်တွင် ငွေပမာဏ သတ်မှတ်ပြီး၊ ဂဏန်းများ Paste ချပါ။</Text>

                            <Text style={styles.label}>DEFAULT AMOUNT</Text>
                            <TextInput style={[styles.input, { marginBottom: 12 }]} keyboardType="number-pad" placeholder="500" placeholderTextColor="rgba(255,255,255,0.3)" value={pasteAmt} onChangeText={setPasteAmt} editable={!isAllClosed} />

                            <TextInput style={styles.textarea} multiline textAlignVertical="top" placeholder={"12.24.56 = 500\n12.25 = r600\n1ပါ 500"} placeholderTextColor="rgba(255,255,255,0.3)" value={pasteText} onChangeText={setPasteText} editable={!isAllClosed} />

                            {pasteError && <Text style={styles.errorText}>{pasteError}</Text>}

                            <TouchableOpacity style={[styles.pasteBtn, isAllClosed && { opacity: 0.5 }]} disabled={isAllClosed} onPress={runPaste}>
                                <MaterialIcons name="add-task" size={18} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.pasteBtnText}>စာရင်းထဲသို့ ထည့်သွင်းမည်</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.summaryCardOuter}>
                            <View style={styles.summaryCardInner}>
                                <View style={styles.summaryHeader}>
                                    <Text style={styles.summaryTitle}>ထီဂဏန်းများ</Text>
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
                                        <Pressable style={styles.closeBtnOuter} onPress={() => removeBetRow(row.id)}>
                                            <View style={styles.closeBtnInner}><MaterialIcons name="close" size={18} color="#9CA3AF" /></View>
                                        </Pressable>
                                    </View>
                                    <Text style={styles.label}>ဂဏန်း (00-99)</Text>
                                    <TextInput style={styles.input} keyboardType="number-pad" maxLength={2} value={row.number} onChangeText={(val) => updateBetRow(row.id, 'number', val)} editable={!isAllClosed} />
                                    <Text style={[styles.label, { marginTop: 12 }]}>ငွေပမာဏ</Text>
                                    <TextInput style={styles.input} keyboardType="number-pad" value={row.amount} onChangeText={(val) => updateBetRow(row.id, 'amount', val)} editable={!isAllClosed} />
                                </View>
                            </View>
                        ))}

                        <View style={styles.actionsRow}>
                            <Pressable style={styles.clearBtnOuter} onPress={clearBetRows}>
                                <View style={styles.clearBtnInner}>
                                    <MaterialIcons name="delete-outline" size={18} color="#F87171" />
                                    <Text style={styles.clearBtnText}>အားလုံး ရှင်းမည်</Text>
                                </View>
                            </Pressable>
                        </View>

                        <TouchableOpacity activeOpacity={0.8} style={[styles.nextBtnOuter, (filledRows.length === 0 || isAllClosed) && { opacity: 0.5 }]} disabled={filledRows.length === 0 || isAllClosed} onPress={() => setStep(3)}>
                            <LinearGradient colors={['#34D399', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnInner}>
                                <Text style={styles.nextBtnText}>ရှေ့သို့</Text>
                                <View style={styles.nextIconWrapper}><MaterialIcons name="arrow-forward" size={20} color="#042F21" /></View>
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
                                    <Text style={styles.rowValueWhite}>{validTotal.toLocaleString()} {realCurrency}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.summaryCardOuter}>
                            <View style={[styles.summaryCardInner, { paddingVertical: 20 }]}>
                                <View style={[styles.rowBetween, { marginBottom: 12 }]}>
                                    <Text style={styles.rowLabel}>Balance</Text>
                                    <Text style={styles.rowValueWhite}>{realWalletBalance.toLocaleString()} {realCurrency}</Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.rowLabel}>After this bet</Text>
                                    <Text style={[styles.rowValueColored, isInsufficient ? { color: '#F87171' } : { color: '#10B981' }]}>
                                        {isInsufficient ? 'Insufficient' : `${balanceAfter.toLocaleString()} ${realCurrency}`}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.summaryCardOuter}>
                            <View style={[styles.summaryCardInner, { paddingVertical: 20 }]}>
                                <Text style={[styles.summaryTitle, { marginBottom: 16 }]}>SECURITY PIN</Text>
                                <TextInput style={styles.pinInput} keyboardType="number-pad" secureTextEntry maxLength={6} placeholder="Enter 6-digit PIN" placeholderTextColor="rgba(255,255,255,0.3)" value={pin} onChangeText={(val) => setPin(val.replace(/\D/g, '').slice(0, 6))} />
                            </View>
                        </View>

                        {isInsufficient && (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.topUpBtn}
                                onPress={() => router.push('/wallet-profile/deposit')}
                            >
                                <Text style={styles.topUpBtnText}>→ Top up wallet</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.actionsCardOuter}>
                            <View style={styles.actionsCardInner}>
                                <View style={[styles.rowBetween, { marginBottom: 16 }]}>
                                    <Text style={styles.rowLabel}>Estimated Total</Text>
                                    <Text style={styles.rowValueWhite}>{validTotal.toLocaleString()} {realCurrency}</Text>
                                </View>
                                <View style={styles.grid2}>
                                    <TouchableOpacity style={styles.stepBackBtn} onPress={() => setStep(2)}>
                                        <MaterialIcons name="arrow-back" size={20} color="#93C5FD" />
                                        <Text style={styles.stepBackText}>BACK</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.confirmBtn, (isInsufficient || pin.length !== 6 || mutation.isPending) && { opacity: 0.5 }]} disabled={isInsufficient || pin.length !== 6 || mutation.isPending} onPress={submitBet}>
                                        <LinearGradient colors={['#34D399', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.confirmBtnGradient}>
                                            {mutation.isPending ? <ActivityIndicator color="#042F21" /> : <><Text style={styles.confirmBtnText}>CONFIRM{'\n'}WAGER</Text><MaterialIcons name="arrow-forward" size={20} color="#042F21" /></>}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {bulkPick && (
                <Modal transparent visible animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{bulkPick.label} ({modalNumbers.length})</Text>
                                <Pressable onPress={() => setBulkPick(null)}><MaterialIcons name="close" size={24} color="rgba(255,255,255,0.4)" /></Pressable>
                            </View>

                            {BULK_MODES[bulkPick.key] === 'digits' && (
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={styles.label}>ဂဏန်းရွေးပါ</Text>
                                    <View style={styles.digitsGrid}>
                                        {Array.from({ length: 10 }, (_, i) => String(i)).map(d => {
                                            const active = modalDigits.includes(d);
                                            return (
                                                <TouchableOpacity key={d} style={[styles.digitBtn, active && styles.digitBtnActive]} onPress={() => { setModalError(null); setModalDigits(prev => active ? prev.filter(x => x !== d) : [...prev, d]); }}>
                                                    <Text style={[styles.digitBtnText, active && { color: '#51e1a5' }]}>{d}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setModalIncludeDbl(!modalIncludeDbl)}>
                                        <View style={[styles.checkbox, modalIncludeDbl && styles.checkboxActive]}>
                                            {modalIncludeDbl && <MaterialIcons name="check" size={14} color="#0B1221" />}
                                        </View>
                                        <Text style={styles.checkboxText}>အပူးပါ ထည့်မည်</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {BULK_MODES[bulkPick.key] === 'digit' && (
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={styles.label}>ဂဏန်း</Text>
                                    <TextInput style={styles.input} keyboardType="number-pad" maxLength={1} value={modalDigit} onChangeText={v => { setModalError(null); setModalDigit(v.replace(/\D/g, '')); }} />
                                </View>
                            )}

                            <View style={{ marginBottom: 16 }}>
                                <Text style={styles.label}>ငွေပမာဏ (MMK)</Text>
                                <TextInput style={styles.input} keyboardType="number-pad" value={modalAmt} onChangeText={v => { setModalError(null); setModalAmt(v); }} />
                            </View>

                            {modalNumbers.length > 0 && (
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={styles.label}>ပါဝင်သော ဂဏန်းများ</Text>
                                    <ScrollView style={{ maxHeight: 100 }} nestedScrollEnabled><View style={styles.chipsRow}>{modalNumbers.map(n => <View key={n} style={styles.chipBlue}><Text style={styles.chipTextBlue}>{n}</Text></View>)}</View></ScrollView>
                                </View>
                            )}

                            {modalError && <Text style={styles.errorText}>{modalError}</Text>}

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalCancel} onPress={() => setBulkPick(null)}><Text style={styles.modalCancelText}>ပယ်ဖျက်မည်</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.modalConfirm} onPress={confirmModal}>
                                    <LinearGradient colors={['#00e676', '#2ac48b']} style={styles.modalConfirmGrad}><Text style={styles.modalConfirmText}>အတည်ပြုသည်</Text></LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#070D1F' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
    backBtn: { marginRight: 12, padding: 4 },
    headerTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' },
    scrollContent: { padding: 20, paddingBottom: 100 },

    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    mainTitle: { color: '#F7F9FF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    subTitle: { color: '#9CA3AF', fontSize: 13 },
    pillOuter: { backgroundColor: 'rgba(16, 185, 129, 0.3)', padding: 1, borderRadius: 20, marginTop: 4 },
    pillInner: { backgroundColor: '#042F21', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 19 },
    pillText: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },

    section: { marginBottom: 20 },
    timeBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    timeBoxTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    timeBoxSub: { color: '#9CA3AF', fontSize: 10, marginTop: 4, letterSpacing: 0.5 },

    lockedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: 16 },
    lockedTitle: { color: '#F87171', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    lockedSub: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

    timeDropdownContainer: { marginTop: 8, backgroundColor: '#080E28', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' },
    timeDropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    timeDropdownItemActive: { backgroundColor: 'rgba(16, 185, 129, 0.12)' },
    timeDropdownText: { color: '#E2E8F0', fontSize: 15, fontWeight: 'bold' },

    label: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' },
    input: { height: 48, backgroundColor: 'rgba(5, 10, 31, 0.68)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, color: '#f7f9ff', fontSize: 16, fontWeight: 'bold', paddingHorizontal: 16, textAlign: 'center' },
    textarea: { minHeight: 120, backgroundColor: 'rgba(5, 10, 31, 0.68)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, color: '#f7f9ff', fontSize: 15, padding: 12, marginBottom: 12 },
    hintText: { color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 12, lineHeight: 16 },
    errorText: { color: '#ff9b93', fontSize: 12, marginTop: 8, marginBottom: 8 },
    skipNotice: { backgroundColor: 'rgba(245, 158, 11, 0.06)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.15)', borderRadius: 8, padding: 8, marginTop: 8 },
    skipText: { color: 'rgba(252, 211, 77, 0.9)', fontSize: 11 },

    fastCard: { backgroundColor: 'rgba(251, 191, 36, 0.04)', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.2)', borderRadius: 16, padding: 16, marginBottom: 20 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    fastTitle: { color: '#fbbf24', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    inputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    grid4: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    quickPickBtn: { width: '23%', height: 44, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    quickPickText: { color: '#e5e7eb', fontSize: 12, fontWeight: 'bold' },

    pasteCard: { backgroundColor: 'rgba(59, 130, 246, 0.05)', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(59, 130, 246, 0.4)', borderRadius: 16, padding: 16, marginBottom: 20 },
    pasteTitle: { color: '#60a5fa', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    pasteBtn: { flexDirection: 'row', height: 48, backgroundColor: '#3b82f6', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    pasteBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

    summaryCardOuter: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 1, borderRadius: 16, marginBottom: 20 },
    summaryCardInner: { backgroundColor: '#0B1221', borderRadius: 15, padding: 16 },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    summaryTitle: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase' },
    summaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipValid: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
    chipInvalid: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' },
    chipTextValid: { color: '#10B981', fontWeight: 'bold' },
    chipTextInvalid: { color: '#F59E0B', fontWeight: 'bold' },
    chipAmountText: { fontWeight: 'normal', opacity: 0.6 },

    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 16 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowLabel: { color: '#9CA3AF', fontSize: 14 },
    rowValueWhite: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    rowValueColored: { fontSize: 14, fontWeight: 'bold' },
    pinInput: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16, color: '#FFF', fontSize: 16, letterSpacing: 4, textAlign: 'center' },

    topUpBtn: { width: '100%', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.35)', backgroundColor: 'rgba(0, 230, 118, 0.1)', paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    topUpBtnText: { color: '#00e676', fontSize: 14, fontWeight: '600' },

    actionsCardOuter: { backgroundColor: 'rgba(255, 255, 255, 0.12)', padding: 1, borderRadius: 16, marginTop: 10 },
    actionsCardInner: { backgroundColor: '#070D1F', borderRadius: 15, padding: 16 },
    grid2: { flexDirection: 'row', gap: 12 },

    stepBackBtn: { flex: 1, height: 56, backgroundColor: '#0B1221', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    stepBackText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },

    confirmBtn: { flex: 1.1, borderRadius: 12, overflow: 'hidden' },
    confirmBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
    confirmBtnText: { color: '#042F21', fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginRight: 4 },

    rowCardOuter: { backgroundColor: 'rgba(255, 255, 255, 0.06)', padding: 1, borderRadius: 12, marginBottom: 20 },
    rowCardInner: { backgroundColor: '#0B1221', borderRadius: 11, padding: 16 },
    rowCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    potentialWinLabel: { color: '#4B5563', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
    potentialWinValue: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
    closeBtnOuter: { backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 1, borderRadius: 8 },
    closeBtnInner: { backgroundColor: '#070D1F', padding: 6, borderRadius: 7 },
    actionsRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
    clearBtnOuter: { backgroundColor: 'rgba(248, 113, 113, 0.3)', padding: 1, borderRadius: 20 },
    clearBtnInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(248, 113, 113, 0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 19 },
    clearBtnText: { color: '#F87171', fontSize: 12, fontWeight: 'bold', marginLeft: 6, letterSpacing: 0.5 },
    nextBtnOuter: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
    nextBtnInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, paddingHorizontal: 20 },
    nextBtnText: { color: '#042F21', fontSize: 16, fontWeight: 'bold' },
    nextIconWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0, 0, 0, 0.1)', alignItems: 'center', justifyContent: 'center' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#19202d', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { color: '#fbbf24', fontSize: 16, fontWeight: 'bold' },
    digitsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    digitBtn: { width: '17%', height: 40, backgroundColor: '#19202d', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    digitBtnActive: { backgroundColor: 'rgba(81, 225, 165, 0.15)', borderColor: 'rgba(81, 225, 165, 0.4)' },
    digitBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 'bold' },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
    checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
    checkboxActive: { backgroundColor: '#51e1a5', borderColor: '#51e1a5' },
    checkboxText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipBlue: { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    chipTextBlue: { color: '#93c5fd', fontSize: 13, fontWeight: 'bold' },
    modalActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
    modalCancel: { flex: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modalCancelText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 'bold' },
    modalConfirm: { flex: 1, height: 48, borderRadius: 12, overflow: 'hidden' },
    modalConfirmGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    modalConfirmText: { color: '#042F21', fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 },
    chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
    chipText: { fontSize: 13 },
});