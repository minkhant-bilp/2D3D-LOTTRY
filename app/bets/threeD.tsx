import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createBetAPI } from '../../api/main';
import { useAppStore } from '../../store/useAppStore';
import { useBetStore } from '../../store/useBetStore';

function getTutNumbers3D(core: string) {
    if (core.length !== 3) return [];
    const [a, b, c] = [core[0], core[1], core[2]];
    const perms = new Set([
        `${a}${b}${c}`, `${a}${c}${b}`, `${b}${a}${c}`,
        `${b}${c}${a}`, `${c}${a}${b}`, `${c}${b}${a}`
    ]);
    return Array.from(perms);
}

function getTriples3D() {
    return Array.from({ length: 10 }, (_, i) => `${i}${i}${i}`);
}

function getThwatNumbers3D(pair: string) {
    if (pair.length !== 2) return [];
    const [a, b] = [pair[0], pair[1]];
    const nums: string[] = [];
    for (let i = 0; i <= 9; i++) {
        nums.push(`${a}${i}${b}`);
    }
    return nums;
}

function parsePastedBets3D(text: string, defaultAmount: string) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const results: { number: string; amount: string; origin: string; coreNumber?: string }[] = [];
    const seen = new Set<string>();

    const add = (number: string, amount: string, origin: string = 'manual', coreNumber?: string) => {
        const key = `${number}|${amount}`;
        if (!seen.has(key)) {
            seen.add(key);
            results.push({ number, amount, origin, coreNumber });
        }
    };

    for (const line of lines) {
        const amtMatch = line.match(/[=\-\/]\s*(\d+)/);
        const lineAmt = amtMatch ? amtMatch[1] : defaultAmount;

        const isRev = /r/i.test(line);
        const nums = [...new Set(line.replace(/r/gi, ' ').match(/\b\d{3}\b/g) || [])];

        nums.forEach(n => {
            if (isRev) {
                getTutNumbers3D(n).forEach(perm => add(perm, lineAmt, 'tut', n));
            } else {
                add(n, lineAmt, 'manual');
            }
        });
    }
    return results;
}

export default function ThreeDDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const wallet = useAppStore((state: any) => state.wallet);
    const refreshWallet = useAppStore((state: any) => state.refreshWallet);

    const realWalletBalance = Number(wallet?.balance ?? 0);
    const realCurrency = wallet?.currency ?? 'MMK';

    const { betRows, addBetRow, removeBetRow, updateBetRow, clearBetRows, getValidAmountTotal, step, setStep, pin, setPin, addMultipleBets } = useBetStore() as any;

    useEffect(() => {
        useBetStore.setState({ isTwoDType: false, step: 2 });
        clearBetRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [fastNum, setFastNum] = useState('');
    const [fastAmt, setFastAmt] = useState('');
    const [fastError, setFastError] = useState<string | null>(null);

    const [pasteAmt, setPasteAmt] = useState('100');
    const [pasteText, setPasteText] = useState('');
    const [pasteError, setPasteError] = useState<string | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalNumbers, setModalNumbers] = useState<{ number: string, origin: string, setKey?: string, coreNumber?: string }[]>([]);
    const [modalAmt, setModalAmt] = useState('');

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const toastAnim = useRef(new Animated.Value(150)).current;
    const [toastMsg, setToastMsg] = useState('');

    const showToast = (msg: string) => {
        setToastMsg(msg);
        toastAnim.stopAnimation();
        toastAnim.setValue(150);

        Animated.sequence([

            Animated.timing(toastAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true
            }),
            Animated.delay(2400),
            Animated.timing(toastAnim, {
                toValue: 150,
                duration: 300,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true
            })
        ]).start();
    };

    const validTotal = getValidAmountTotal();
    const isInsufficient = validTotal > realWalletBalance;
    const balanceAfter = realWalletBalance - validTotal;

    const groupedRows = useMemo(() => {
        const groupsMap = new Map<string, any>();
        const manualRows: any[] = [];

        betRows.forEach((row: any) => {
            if (!row.origin || row.origin === 'manual') {
                manualRows.push(row);
            } else {
                let key = '';
                let label = '';
                if (row.origin === 'set') {
                    key = `set_${row.setKey}`;
                    label = row.setKey === 'apu' ? 'အပူး (TRIPLES)' :
                        row.setKey?.startsWith('thwat:') ? `သွပ် (${row.setKey.split(':')[1]})` :
                            row.setKey || 'အုပ်စု';
                } else if (row.origin === 'tut') {
                    key = `tut_${row.coreNumber}`;
                    label = `ခွေ (${row.coreNumber})`;
                } else if (row.origin === 'core') {
                    key = `core_${row.coreNumber}`;
                    label = `ဒဲ့ (${row.coreNumber})`;
                }

                if (!groupsMap.has(key)) {
                    groupsMap.set(key, { id: key, label, rows: [], isManual: false });
                }
                groupsMap.get(key).rows.push(row);
            }
        });

        const finalGroups = Array.from(groupsMap.values());
        if (manualRows.length > 0) {
            finalGroups.push({ id: 'manual', label: 'အခြား', rows: manualRows, isManual: true });
        }

        finalGroups.forEach(g => {
            if (expandedGroups[g.id] === undefined) {
                setExpandedGroups(prev => ({ ...prev, [g.id]: true }));
            }
        });

        return finalGroups.map(g => {
            const amounts = new Set(g.rows.map((r: any) => r.amount || ''));
            const validCount = g.rows.filter((r: any) => r.number !== '').length;
            const subtotal = g.rows.reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0);
            return { ...g, groupAmount: (amounts.size === 1 ? [...amounts][0] : '') || '', validCount, subtotal };
        });
    }, [betRows, expandedGroups]);

    const filledRowsCount = betRows.filter((r: any) => r.number !== '').length;

    const processAndAddBets = (newBets: any[]) => {
        const existingNumbers = new Set(betRows.filter((r: any) => r.number !== '').map((r: any) => r.number));
        const toAdd = newBets.filter(b => !existingNumbers.has(b.number));

        if (toAdd.length === 0) {
            showToast('ဂဏန်းများ စာရင်းထဲတွင် ပါဝင်ပြီးသားဖြစ်နေပါသည်။');
            return;
        }

        if (addMultipleBets) addMultipleBets(toAdd);
        setFastNum('');
        setPasteText('');
        showToast('စာရင်းထဲ ပေါင်းထည့်လိုက်ပါပြီ');
    };

    const handleQuickPick = (pick: 'direct' | 'reverse' | 'apu' | 'thwat') => {
        setFastError(null);
        const input = fastNum.trim();
        const stake = fastAmt.trim();
        const hasAmount = /^\d+$/.test(stake) && Number(stake) >= 1;

        if ((pick === 'direct' || pick === 'reverse') && !hasAmount) {
            setFastError('ကျေးဇူးပြု၍ လောင်းကြေးငွေပမာဏ မှန်ကန်စွာထည့်ပါ။'); return;
        }

        let candidates: any[] = [];

        if (pick === 'direct' || pick === 'reverse') {
            if (!/^\d{3}$/.test(input)) { setFastError('ဂဏန်း (၃) လုံး အတိအကျ ထည့်ပါ။'); return; }
            candidates.push({ number: input, amount: stake, origin: 'core', coreNumber: input });
            if (pick === 'reverse') {
                getTutNumbers3D(input).forEach(perm => {
                    candidates.push({ number: perm, amount: stake, origin: 'tut', coreNumber: input });
                });
            }
        } else if (pick === 'apu') {
            getTriples3D().forEach(triple => candidates.push({ number: triple, amount: stake, origin: 'set', setKey: 'apu' }));
        } else if (pick === 'thwat') {
            if (!/^\d{2}$/.test(input)) { setFastError('သွပ်ရန်အတွက် ဂဏန်း (၂) လုံး အတိအကျ ထည့်ပါ။'); return; }
            getThwatNumbers3D(input).forEach(num => candidates.push({ number: num, amount: stake, origin: 'set', setKey: `thwat:${input}` }));
        }

        if (candidates.length > 0) {
            if (candidates.length > 1 && !hasAmount) {
                setModalTitle(pick === 'apu' ? 'အပူး' : pick === 'thwat' ? 'သွပ်' : 'ခွေ');
                setModalNumbers(candidates);
                setModalAmt(stake);
                setModalVisible(true);
            } else {
                processAndAddBets(candidates.map(c => ({ ...c, amount: stake })));
            }
        }
    };

    const confirmCustomAlert = () => {
        if (!modalAmt || parseInt(modalAmt) <= 0) return;
        setModalVisible(false);

        setTimeout(() => {
            processAndAddBets(modalNumbers.map(b => ({ ...b, amount: modalAmt })));
        }, 300);
    };

    const handlePasteSubmit = () => {
        setPasteError(null);
        const stake = pasteAmt.trim();
        if (!/^\d+$/.test(stake) || Number(stake) < 1) { setPasteError('အခြေခံ လောင်းကြေးငွေပမာဏ မှန်ကန်စွာ သတ်မှတ်ပါ။'); return; }
        if (!pasteText.trim()) { setPasteError('ဂဏန်းများကို Paste ချပါ။'); return; }

        const parsedBets = parsePastedBets3D(pasteText, stake);
        if (parsedBets.length === 0) {
            setPasteError('ဂဏန်းများ ရှာမတွေ့ပါ သို့မဟုတ် ဖော်မတ်မှားနေပါသည်။ (ဥပမာ: 123=500/200)'); return;
        }
        processAndAddBets(parsedBets);
    };

    const mutation = useMutation({
        mutationFn: createBetAPI,
        onSuccess: () => {
            Alert.alert('အောင်မြင်ပါသည်', 'လောင်းကြေး အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ။');
            clearBetRows(); setPin(''); refreshWallet();
            router.push('/results/threeDresult');
        },
        onError: (err: any) => Alert.alert('အမှား', err?.response?.data?.message || 'လောင်းကြေးတင်ခြင်း မအောင်မြင်ပါ။')
    });

    const submitBet = () => {
        if (isInsufficient) return Alert.alert('အမှား', 'လက်ကျန်ငွေ မလုံလောက်ပါ။');
        if (pin.length !== 6) return Alert.alert('အမှား', 'PIN ၆ လုံး ထည့်ပါ။');
        if (filledRowsCount === 0) return Alert.alert('အမှား', 'ဂဏန်း အနည်းဆုံး ၁ ခု ထည့်ပါ။');

        mutation.mutate({
            bet_type: '3D',
            currency: realCurrency,
            bet_numbers: betRows.filter((r: any) => r.number !== '').map((r: any) => ({ number: r.number, amount: parseInt(r.amount) })),
            security_pin: pin
        });
    };

    const toggleGroup = (id: string) => setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    const removeGroup = (rows: any[]) => rows.forEach(r => removeBetRow(r.id));
    const updateGroupAmount = (rows: any[], val: string) => rows.forEach(r => updateBetRow(r.id, 'amount', val));

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => step === 3 ? setStep(2) : router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={22} color="#9CA3AF" />
                </Pressable>
                <Text style={styles.headerTitle}>3D FLASH MODE</Text>
            </View>

            <ScrollView style={styles.scrollFlex} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 120 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.titleRow}>
                    <View>
                        <Text style={styles.mainTitle}>လောင်းကြေး ထားမည်</Text>
                        <Text style={styles.subTitle}>Three-digit premium rounds</Text>
                    </View>
                    <View style={styles.pillOuter}>
                        <View style={styles.pillInner}><Text style={styles.pillText}>3D ဈေးကွက်</Text></View>
                    </View>
                </View>

                {step === 2 && (
                    <>
                        <View style={styles.fastEntryOuter}>
                            <View style={styles.fastEntryInner}>
                                <View style={styles.fastEntryHeader}>
                                    <MaterialIcons name="bolt" size={22} color="#FBBF24" />
                                    <Text style={styles.fastEntryTitle}>အမြန်ရွေးချယ်မှု (FAST ENTRY)</Text>
                                </View>

                                <View style={styles.fastInputRow}>
                                    <View style={styles.fastInputWrapper}>
                                        <Text style={styles.fastInputLabel}>ဂဏန်း (000-999)</Text>
                                        <TextInput style={styles.fastInput} keyboardType="number-pad" maxLength={3} placeholder="123" placeholderTextColor="#4B5563" value={fastNum} onChangeText={(v) => { setFastNum(v.replace(/\D/g, '').slice(0, 3)); setFastError(null); }} />
                                    </View>
                                    <View style={styles.fastInputWrapper}>
                                        <Text style={styles.fastInputLabel}>ငွေပမာဏ (MMK)</Text>
                                        <TextInput style={styles.fastInput} keyboardType="number-pad" placeholder="1000" placeholderTextColor="#4B5563" value={fastAmt} onChangeText={(v) => { setFastAmt(v); setFastError(null); }} />
                                    </View>
                                </View>

                                <View style={styles.fastActionGrid}>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('direct')}><Text style={styles.fastActionText}>ဒဲ့</Text></TouchableOpacity>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('reverse')}><Text style={styles.fastActionText}>R</Text></TouchableOpacity>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('apu')}><Text style={styles.fastActionText}>အပူး</Text></TouchableOpacity>
                                    <TouchableOpacity style={styles.fastActionBtn} onPress={() => handleQuickPick('thwat')}><Text style={styles.fastActionText}>သွပ်</Text></TouchableOpacity>
                                </View>

                                <Text style={styles.hintText}>ဒဲ့ နှင့် R အတွက် ဂဏန်း (၃) လုံး၊ သွပ် အတွက် (၂) လုံး (12 {'->'} 102...192)၊ အပူး အတွက် မလိုပါ။</Text>
                                {fastError && <Text style={styles.errorText}>{fastError}</Text>}
                            </View>
                        </View>

                        <View style={styles.pasteCardOuter}>
                            <View style={styles.pasteCardInner}>
                                <View style={styles.pasteHeader}>
                                    <MaterialIcons name="content-paste" size={20} color="#3B82F6" />
                                    <Text style={styles.pasteTitle}>ဂဏန်းများ COPY / PASTE လုပ်ရန်</Text>
                                </View>
                                <Text style={styles.pasteInstruction}>အောက်တွင် ငွေပမာဏ သတ်မှတ်ပြီး၊ ဂဏန်းများ Paste ချပါ။</Text>

                                <Text style={[styles.fastInputLabel, { marginTop: 8 }]}>အခြေခံ ငွေပမာဏ (Default Amount)</Text>
                                <TextInput style={[styles.fastInput, { marginBottom: 12 }]} keyboardType="number-pad" placeholder="100" placeholderTextColor="#4B5563" value={pasteAmt} onChangeText={(v) => { setPasteAmt(v); setPasteError(null); }} />

                                <TextInput style={styles.pasteInput} multiline textAlignVertical="top" placeholder={'123=500/200\n456.300r100\n789-1000-500'} placeholderTextColor="#4B5563" value={pasteText} onChangeText={(v) => { setPasteText(v); setPasteError(null); }} />

                                <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteSubmit}>
                                    <MaterialIcons name="add-task" size={20} color="#FFFFFF" />
                                    <Text style={styles.pasteBtnText}>စာရင်းထဲသို့ ထည့်သွင်းမည်</Text>
                                </TouchableOpacity>
                                {pasteError && <Text style={styles.errorText}>{pasteError}</Text>}
                            </View>
                        </View>

                        {filledRowsCount > 0 && (
                            <View style={styles.summaryCardOuter}>
                                <View style={styles.summaryCardInner}>
                                    <View style={styles.summaryHeader}>
                                        <Text style={styles.summaryTitle}>BET SUMMARY</Text>
                                        <Text style={styles.summaryTotal}>{filledRowsCount} numbers · {validTotal.toLocaleString()} {realCurrency}</Text>
                                    </View>

                                    {groupedRows.map((group: any) => {
                                        if (group.validCount === 0) return null;
                                        return (
                                            <View key={`sum-${group.id}`} style={styles.summaryGroupSection}>
                                                <Text style={styles.summaryGroupLabel}>{group.label}</Text>
                                                <View style={styles.summaryChips}>
                                                    {group.rows.filter((r: any) => r.number !== '').map((r: any) => {
                                                        const isValid = /^\d+$/.test(String(r.amount).trim()) && Number(r.amount) >= 1;
                                                        return (
                                                            <View key={r.id} style={[styles.miniChip, !isValid && styles.chipInvalid]}>
                                                                <Text style={[styles.miniChipText, !isValid && styles.chipTextInvalid]}>
                                                                    {r.number} · {r.amount || 0}
                                                                </Text>
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        <View style={styles.fieldsetOuter}>
                            <View style={styles.fieldsetInner}>
                                <View style={styles.legendWrapper}><Text style={styles.legendText}>ထီဂဏန်းများ</Text></View>

                                {groupedRows.map((group: any) => {
                                    if (group.validCount === 0 && !group.isManual) return null;
                                    const isExpanded = expandedGroups[group.id];

                                    return (
                                        <View key={group.id} style={styles.groupCardOuter}>
                                            <View style={styles.groupCardInner}>
                                                <View style={styles.groupHeaderRow}>
                                                    <Pressable style={styles.groupTitleCol} onPress={() => toggleGroup(group.id)}>
                                                        <MaterialIcons name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#9CA3AF" style={{ marginRight: 8 }} />
                                                        <View>
                                                            <Text style={styles.groupTitleText}>{group.label}</Text>
                                                            <Text style={styles.groupSubtitleText}>ဂဏန်း {group.validCount} လုံး · {group.subtotal.toLocaleString()} {realCurrency}</Text>
                                                        </View>
                                                    </Pressable>

                                                    <View style={styles.groupActionCol}>
                                                        {!group.isManual && (
                                                            <TextInput
                                                                style={styles.groupAmtInput}
                                                                keyboardType="number-pad"
                                                                placeholder="Amt"
                                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                                value={group.groupAmount}
                                                                onChangeText={(val) => updateGroupAmount(group.rows, val)}
                                                            />
                                                        )}
                                                        <Pressable style={styles.groupDelBtn} onPress={() => removeGroup(group.rows)}>
                                                            <MaterialIcons name="delete-outline" size={18} color="#9CA3AF" />
                                                        </Pressable>
                                                    </View>
                                                </View>

                                                {isExpanded && !group.isManual && group.validCount > 0 && (
                                                    <View style={styles.groupChipsContainer}>
                                                        {group.rows.filter((r: any) => r.number !== '').map((r: any) => (
                                                            <View key={r.id} style={styles.miniChip}>
                                                                <Text style={styles.miniChipText}>{r.number} · {r.amount || 0}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}

                                                {isExpanded && group.isManual && (
                                                    <View style={styles.manualEntriesContainer}>
                                                        {group.rows.map((row: any) => (
                                                            <View key={row.id} style={styles.manualRowCard}>
                                                                <View style={styles.manualRowHeader}>
                                                                    <View>
                                                                        <Text style={styles.potentialWinLabel}>POTENTIAL WIN</Text>
                                                                        <Text style={styles.potentialWinValue}>{row.amount ? `x ${(Number(row.amount) * 500).toLocaleString()}` : '—'}</Text>
                                                                    </View>
                                                                    <Pressable style={styles.closeBtnOuter} onPress={() => removeBetRow(row.id)}>
                                                                        <View style={styles.closeBtnInner}><MaterialIcons name="close" size={16} color="#9CA3AF" /></View>
                                                                    </Pressable>
                                                                </View>
                                                                <View style={styles.manualInputGrid}>
                                                                    <View style={{ flex: 1 }}>
                                                                        <Text style={styles.inputLabel}>ဂဏန်း (000-999)</Text>
                                                                        <TextInput style={styles.inputInner} keyboardType="number-pad" maxLength={3} value={row.number} onChangeText={(val) => updateBetRow(row.id, 'number', val)} />
                                                                    </View>
                                                                    <View style={{ flex: 1 }}>
                                                                        <Text style={styles.inputLabel}>ငွေပမာဏ</Text>
                                                                        <TextInput style={styles.inputInner} keyboardType="number-pad" value={row.amount} onChangeText={(val) => updateBetRow(row.id, 'amount', val)} />
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        ))}

                                                        <Pressable style={styles.addBtnOuter} onPress={addBetRow}>
                                                            <MaterialIcons name="add" size={24} color="#10B981" />
                                                        </Pressable>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}

                                <Pressable style={styles.clearBtnOuter} onPress={clearBetRows}>
                                    <View style={styles.clearBtnInner}>
                                        <MaterialIcons name="delete-outline" size={18} color="#F87171" />
                                        <Text style={styles.clearBtnText}>အားလုံး ရှင်းမည်</Text>
                                    </View>
                                </Pressable>
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.nextBtnInline,
                                filledRowsCount > 0 ? { ...styles.activeGlow, opacity: 1 } : { opacity: 0.4 }
                            ]}
                            disabled={filledRowsCount === 0}
                            onPress={() => setStep(3)}
                        >
                            <LinearGradient colors={['#34D399', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnInnerInline}>
                                <Text style={styles.nextBtnTextInline}>ရှေ့သို့</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#042F21" />
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
                                    {betRows.filter((r: any) => r.number !== '').map((row: any) => {
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
                                    <Text style={styles.rowLabel}>လက်ကျန်ငွေ</Text>
                                    <Text style={styles.rowValueWhite}>{realWalletBalance.toLocaleString()} {realCurrency}</Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.rowLabel}>ထိုးပြီးပါက ကျန်မည့်ငွေ</Text>
                                    <Text style={[styles.rowValueColored, isInsufficient ? { color: '#F87171' } : { color: '#10B981' }]}>
                                        {isInsufficient ? 'လက်ကျန်ငွေ မလုံလောက်ပါ' : `${balanceAfter.toLocaleString()} ${realCurrency}`}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.summaryCardOuter}>
                            <View style={[styles.summaryCardInner, { paddingVertical: 20 }]}>
                                <Text style={[styles.summaryTitle, { marginBottom: 16 }]}>SECURITY PIN</Text>
                                <TextInput style={styles.pinInput} keyboardType="number-pad" secureTextEntry maxLength={6} placeholder="ဂဏန်း ၆ လုံး ထည့်ပါ" placeholderTextColor="rgba(255,255,255,0.3)" value={pin} onChangeText={(val) => setPin(val.replace(/\D/g, '').slice(0, 6))} />
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
                                    <Text style={styles.rowLabel}>ခန့်မှန်းစုစုပေါင်း:</Text>
                                    <Text style={styles.rowValueWhite}>{validTotal.toLocaleString()} {realCurrency}</Text>
                                </View>
                                <View style={styles.grid2}>
                                    <TouchableOpacity style={styles.stepBackBtn} onPress={() => setStep(2)}>
                                        <MaterialIcons name="arrow-back" size={20} color="#FFF" />
                                        <Text style={styles.stepBackText}>နောက်သို့</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.confirmBtn, (isInsufficient || pin.length !== 6 || mutation.isPending) && { opacity: 0.5 }]} disabled={isInsufficient || pin.length !== 6 || mutation.isPending} onPress={submitBet}>
                                        <LinearGradient colors={['#34D399', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.confirmBtnGradient}>
                                            {mutation.isPending ? <ActivityIndicator color="#042F21" size="small" /> : <><Text style={styles.confirmBtnText}>လောင်းကြေး{'\n'}အတည်ပြုမည်</Text><MaterialIcons name="arrow-forward" size={20} color="#042F21" /></>}
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
                            <Pressable onPress={() => setModalVisible(false)}><MaterialIcons name="close" size={24} color="#9CA3AF" /></Pressable>
                        </View>
                        <Text style={styles.modalLabel}>ငွေပမာဏ (MMK)</Text>
                        <TextInput style={styles.modalInput} keyboardType="number-pad" placeholder="1000" placeholderTextColor="#4B5563" value={modalAmt} onChangeText={setModalAmt} autoFocus={true} />
                        <Text style={styles.modalLabel}>ပါဝင်သော ဂဏန်းများ</Text>
                        <ScrollView style={styles.modalGridScroll} nestedScrollEnabled={true}>
                            <View style={styles.modalNumberGrid}>
                                {modalNumbers.map((n, idx) => (
                                    <View key={idx} style={styles.modalNumBadge}><Text style={styles.modalNumText}>{n.number}</Text></View>
                                ))}
                            </View>
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.modalCancelText}>ပယ်ဖျက်မည်</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmCustomAlert}><LinearGradient colors={['#34D399', '#10B981']} style={styles.modalConfirmGrad}><Text style={styles.modalConfirmText}>အတည်ပြုသည်</Text></LinearGradient></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text style={styles.toastText}>{toastMsg}</Text>
            </Animated.View>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#070D1F' },

    toastContainer: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: '#0B291D',
        borderColor: '#10B981',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 999999
    },
    toastText: { color: '#34D399', fontSize: 14, fontWeight: 'bold', marginLeft: 8, letterSpacing: 0.5 },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
    backBtn: { marginRight: 12, padding: 4 },
    headerTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase' },

    scrollFlex: { flex: 1 },
    scrollContent: { paddingHorizontal: 20 },

    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    mainTitle: { color: '#F7F9FF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
    subTitle: { color: '#9CA3AF', fontSize: 13 },
    pillOuter: { backgroundColor: 'rgba(214, 181, 96, 0.3)', padding: 1, borderRadius: 20, marginTop: 4 },
    pillInner: { backgroundColor: '#2A200B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 19 },
    pillText: { color: '#D6B560', fontSize: 12, fontWeight: 'bold' },
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
    hintText: { marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 16 },
    pasteCardOuter: { backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: 1, borderRadius: 16, marginBottom: 24 },
    pasteCardInner: { backgroundColor: '#0A132B', borderRadius: 15, padding: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.4)' },
    pasteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    pasteTitle: { color: '#3B82F6', fontSize: 14, fontWeight: 'bold', letterSpacing: 1, marginLeft: 8 },
    pasteInstruction: { color: '#9CA3AF', fontSize: 11, marginBottom: 12, lineHeight: 16 },
    pasteInput: { backgroundColor: '#050A1F', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 10, minHeight: 80, color: '#FFF', fontSize: 16, padding: 12, textAlignVertical: 'top', marginBottom: 12 },
    pasteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#3B82F6', borderRadius: 10, paddingVertical: 14 },
    pasteBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
    errorText: { marginTop: 10, fontSize: 11, color: '#ff9b93' },

    summaryCardOuter: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 1, borderRadius: 16, marginBottom: 20 },
    summaryCardInner: { backgroundColor: '#0B1221', borderRadius: 15, padding: 16 },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    summaryTitle: { color: '#6B7280', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    summaryTotal: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
    summaryGroupSection: { marginTop: 12 },
    summaryGroupLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold', marginBottom: 8 },
    summaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chipInvalid: { backgroundColor: 'rgba(248, 113, 113, 0.1)', borderColor: 'rgba(248, 113, 113, 0.3)' },
    chipTextInvalid: { color: '#F87171' },

    fieldsetOuter: { backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: 1, borderRadius: 16, marginTop: 10 },
    fieldsetInner: { backgroundColor: '#070D1F', borderRadius: 15, padding: 16, paddingTop: 24 },
    legendWrapper: { position: 'absolute', top: -10, left: 16, backgroundColor: '#070D1F', paddingHorizontal: 8 },
    legendText: { color: '#9CA3AF', fontSize: 14, fontWeight: 'bold' },

    groupCardOuter: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 16, padding: 1 },
    groupCardInner: { backgroundColor: '#0B1221', borderRadius: 11, padding: 12 },
    groupHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    groupTitleCol: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    groupTitleText: { color: '#10B981', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
    groupSubtitleText: { color: '#9CA3AF', fontSize: 10 },
    groupActionCol: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    groupAmtInput: { backgroundColor: '#050A1F', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, width: 70, height: 36, color: '#FFF', fontSize: 13, textAlign: 'center', fontWeight: 'bold' },
    groupDelBtn: { backgroundColor: 'rgba(255,255,255,0.05)', width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    groupChipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },

    miniChip: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    miniChipText: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },

    manualEntriesContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    manualRowCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, marginBottom: 12 },
    manualRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    potentialWinLabel: { color: '#4B5563', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
    potentialWinValue: { color: '#10B981', fontSize: 14, fontWeight: 'bold' },
    closeBtnOuter: { padding: 4 },
    closeBtnInner: { backgroundColor: '#050A1F', width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
    manualInputGrid: { flexDirection: 'row', gap: 12 },
    inputLabel: { color: '#9CA3AF', fontSize: 11, marginBottom: 6 },
    inputInner: { backgroundColor: '#050A1F', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10, height: 44, color: '#FFF', fontSize: 15, fontWeight: 'bold', paddingHorizontal: 12, textAlign: 'center' },

    addBtnOuter: { alignSelf: 'flex-start', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginTop: 4 },

    clearBtnOuter: { alignSelf: 'flex-start', marginTop: 8, borderRadius: 8, overflow: 'hidden' },
    clearBtnInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(248, 113, 113, 0.1)', borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.3)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    clearBtnText: { color: '#F87171', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },

    nextBtnInline: {
        marginTop: 16,
        marginBottom: 20,
        borderRadius: 12,
        backgroundColor: '#10B981',
    },
    activeGlow: {
        shadowColor: '#34D399',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 8,
    },
    nextBtnInnerInline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 56,
        paddingHorizontal: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    nextBtnTextInline: {
        color: '#042F21',
        fontSize: 16,
        fontWeight: 'bold',
    },

    chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
    chipValid: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
    chipText: { fontSize: 13 },
    chipTextValid: { color: '#10B981', fontWeight: 'bold' },
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
    modalConfirmText: { color: '#042F21', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 }
});