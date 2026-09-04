import { MaterialIcons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

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

    const add = (number: string, amount: string) => {
        results.push({ number, amount });
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

// 🌟 Countdown Timer (MMT)
function getRemainingTimeMMT(targetTimeStr: string): { totalSeconds: number, text: string, textFormatted: string } {
    const now = new Date();
    const mmtTime = new Date(now.getTime() + 390 * 60000); // UTC+6:30
    const parts = targetTimeStr.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);

    let closeH = h;
    let closeM = m - 30;
    if (closeM < 0) {
        closeM += 60;
        closeH -= 1;
    }

    const targetDate = new Date(mmtTime);
    targetDate.setUTCHours(closeH, closeM, 0, 0);

    const diffSeconds = Math.floor((targetDate.getTime() - mmtTime.getTime()) / 1000);

    if (diffSeconds <= 0) return { totalSeconds: 0, text: '00:00:00', textFormatted: '0H 0M 0S' };

    const hours = Math.floor(diffSeconds / 3600);
    const mins = Math.floor((diffSeconds % 3600) / 60);
    const secs = diffSeconds % 60;

    const text = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const textFormatted = `${hours}H ${mins}M ${secs}S`;
    return { totalSeconds: diffSeconds, text, textFormatted };
}

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

const CountdownTimer = React.memo(({ targetTime }: { targetTime: string }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState(() => getRemainingTimeMMT(targetTime));

    useEffect(() => {
        setTimeLeft(getRemainingTimeMMT(targetTime));
        const timerId = setInterval(() => {
            setTimeLeft(getRemainingTimeMMT(targetTime));
        }, 1000);
        return () => clearInterval(timerId);
    }, [targetTime]);

    return (
        <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.timeBoxTitle}>{TARGET_OPEN_TIME_LABELS[targetTime]}</Text>
            <Text style={styles.timeBoxSub}>
                {t('twod_detail.closing_in', 'CLOSING IN') as string} {timeLeft.textFormatted}
            </Text>
        </View>
    );
});
CountdownTimer.displayName = 'CountdownTimer';

type BetPillProps = {
    row: { id: string; number: string; amount: string };
    isValid: boolean;
    selectionMode: boolean;
    isSelected: boolean;
    disabled: boolean;
    onPress: (id: string) => void;
    onLongPress: (id: string) => void;
    onRemove: (id: string) => void;
};

/**
 * One staked number in the summary. Tap edits it, press-and-hold starts a
 * multi-selection, and the trailing × drops it — the three things a player wants
 * to do to a number they can see, without hunting for its card further down.
 *
 * Memoised: editing one amount must not re-render the other ninety-nine.
 */
const BetPill = React.memo(function BetPill({
    row, isValid, selectionMode, isSelected, disabled, onPress, onLongPress, onRemove,
}: BetPillProps) {
    const tone = isSelected ? styles.pillSelected : isValid ? styles.pillValid : styles.pillInvalid;
    const textColor = isSelected ? '#BFDBFE' : isValid ? '#10B981' : '#F59E0B';

    return (
        <Pressable
            style={[styles.pill, tone, disabled && { opacity: 0.5 }]}
            disabled={disabled}
            delayLongPress={300}
            onPress={() => onPress(row.id)}
            onLongPress={() => onLongPress(row.id)}
        >
            {selectionMode && (
                <MaterialIcons
                    name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
                    size={18}
                    color={isSelected ? '#3B82F6' : 'rgba(255,255,255,0.35)'}
                />
            )}

            <Text style={[styles.pillNumber, { color: textColor }]}>{row.number}</Text>
            {row.amount !== '' && (
                <Text style={[styles.pillAmount, { color: textColor }]}>· {row.amount}</Text>
            )}

            {!selectionMode && (
                <Pressable hitSlop={10} disabled={disabled} style={styles.pillRemove} onPress={() => onRemove(row.id)}>
                    <MaterialIcons name="close" size={15} color="rgba(255,255,255,0.45)" />
                </Pressable>
            )}
        </Pressable>
    );
});
BetPill.displayName = 'BetPill';

export default function TwoDDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const walletBalance = useAppStore((state: any) => state.wallet?.balance);
    const walletCurrency = useAppStore((state: any) => state.wallet?.currency);
    const refreshWallet = useAppStore((state: any) => state.refreshWallet);
    const realWalletBalance = Number(walletBalance ?? 0);
    const realCurrency = walletCurrency ?? 'MMK';

    const step = useBetStore(state => state.step);
    const setStep = useBetStore(state => state.setStep);
    const pin = useBetStore(state => state.pin);
    const setPin = useBetStore(state => state.setPin);
    const betRows = useBetStore(state => state.betRows);
    const getValidAmountTotal = useBetStore(state => state.getValidAmountTotal);
    const addMultipleBets = useBetStore(state => state.addMultipleBets);
    const removeBetRow = useBetStore(state => state.removeBetRow);
    const clearBetRows = useBetStore(state => state.clearBetRows);
    const updateBetRow = useBetStore(state => state.updateBetRow);
    const updateBetRowFields = useBetStore(state => state.updateBetRowFields);
    const removeBetRows = useBetStore(state => state.removeBetRows);

    const validBetCount = betRows.filter((r: any) => r.number.length === 2 && Number(r.amount) >= 1).length;
    const validTotal = getValidAmountTotal();

    const isInsufficient = validTotal > realWalletBalance;
    const balanceAfter = realWalletBalance - validTotal;

    useFocusEffect(
        useCallback(() => {
            clearBetRows();
            setStep(2);
            setPin('');
            setSelectionActive(false);
            setRawSelected(new Set());
            setEditingId(null);
        }, [])
    );

    const [currentMinutes, setCurrentMinutes] = useState(() => minutesOfDayMMT());

    useEffect(() => {
        const timer = setInterval(() => setCurrentMinutes(minutesOfDayMMT()), 10000);
        return () => clearInterval(timer);
    }, []);

    const isAllClosed = TARGET_OPEN_TIME_OPTIONS.every(t => isSessionExpired(t, currentMinutes));

    const [targetTime, setTargetTime] = useState(() => {
        const mins = minutesOfDayMMT();
        const active = TARGET_OPEN_TIME_OPTIONS.find(t => !isSessionExpired(t, mins));
        return active || '16:30:00';
    });

    useEffect(() => {
        if (isSessionExpired(targetTime, currentMinutes)) {
            const fallback = TARGET_OPEN_TIME_OPTIONS.find(t => !isSessionExpired(t, currentMinutes));
            if (fallback) setTargetTime(fallback);
        }
    }, [currentMinutes, targetTime]);

    const [showTimeDropdown, setShowTimeDropdown] = useState(false);

    const [toastMessage, setToastMessage] = useState('');
    const toastOpacity = useRef(new Animated.Value(0)).current;

    const [customAlert, setCustomAlert] = useState<{
        visible: boolean;
        type: 'success' | 'error' | 'warning';
        title: string;
        message: string;
        onConfirm?: () => void;
        showCancel?: boolean;
    }>({ visible: false, type: 'error', title: '', message: '' });

    const [fastNum, setFastNum] = useState('');
    const [fastAmt, setFastAmt] = useState('');
    const [fastError, setFastError] = useState<string | null>(null);

    const [pasteText, setPasteText] = useState('');
    const [pasteAmt, setPasteAmt] = useState('500');
    const [pasteError, setPasteError] = useState<string | null>(null);

    const [bulkPick, setBulkPick] = useState<{ key: BulkPick; label: string } | null>(null);
    const [modalAmt, setModalAmt] = useState('');
    const [modalDigits, setModalDigits] = useState<string[]>([]);
    const [modalIncludeDbl, setModalIncludeDbl] = useState(false);
    const [modalDigit, setModalDigit] = useState('');
    const [modalError, setModalError] = useState<string | null>(null);

    // Selection lives here, not in useBetStore: picking numbers is a view
    // concern, and nothing about it may be able to alter a bet.
    const [selectionActive, setSelectionActive] = useState(false);
    const [rawSelected, setRawSelected] = useState<Set<string>>(new Set());

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNum, setEditNum] = useState('');
    const [editAmt, setEditAmt] = useState('');
    const [editError, setEditError] = useState<string | null>(null);

    // Quick picks, paste, Clear All and the row cards below all mutate betRows
    // while a selection may be open, so a selected id can stop existing under
    // us. Pruned on read: the count stays honest without a second render pass.
    const selectedIds = useMemo(() => {
        if (rawSelected.size === 0) return rawSelected;
        const live = new Set(betRows.map((r: any) => r.id));
        const pruned = new Set([...rawSelected].filter(id => live.has(id)));
        return pruned.size === rawSelected.size ? rawSelected : pruned;
    }, [betRows, rawSelected]);

    // Falls out of selection mode once nothing is selected — whether the player
    // deselected the last pill or those rows were removed from elsewhere.
    const selectionMode = selectionActive && selectedIds.size > 0;

    // The rows that actually render as a pill.
    const pillRowIds = useMemo(
        () => betRows.filter((r: any) => r.number !== '').map((r: any) => r.id),
        [betRows]
    );
    const allSelected = pillRowIds.length > 0 && selectedIds.size === pillRowIds.length;

    // Stable so the pills' memo survives — they take a remove handler built on it.
    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        toastOpacity.setValue(1);
        Animated.sequence([
            Animated.delay(2000),
            Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
        ]).start();
    }, [toastOpacity]);

    const showAlert = (type: 'success' | 'error' | 'warning', title: string, message: string, onConfirm?: () => void, showCancel = false) => {
        setCustomAlert({ visible: true, type, title, message, onConfirm, showCancel });
    };

    // ── Summary pills ────────────────────────────────────────────────────────

    const exitSelection = useCallback(() => {
        setSelectionActive(false);
        setRawSelected(new Set());
    }, []);

    const enterSelection = useCallback((id: string) => {
        Haptics.selectionAsync();
        setSelectionActive(true);
        // Writing the pruned set back is what stops dead ids accumulating.
        setRawSelected(selectedIds.has(id) ? selectedIds : new Set(selectedIds).add(id));
    }, [selectedIds]);

    const toggleSelect = useCallback((id: string) => {
        Haptics.selectionAsync();
        const next = new Set(selectedIds);
        if (!next.delete(id)) next.add(id);
        setRawSelected(next);
    }, [selectedIds]);

    const openEditor = useCallback((id: string) => {
        const row = betRows.find((r: any) => r.id === id);
        if (!row) return;
        setEditingId(id);
        setEditNum(row.number);
        setEditAmt(row.amount);
        setEditError(null);
    }, [betRows]);

    const handlePillPress = useCallback((id: string) => {
        if (selectionMode) toggleSelect(id);
        else openEditor(id);
    }, [selectionMode, toggleSelect, openEditor]);

    const handlePillRemove = useCallback((id: string) => {
        removeBetRow(id);
        showToast(t('twod_detail.toast_removed', 'စာရင်းမှ ဖျက်ပြီးပါပြီ') as string);
    }, [removeBetRow, showToast, t]);

    const deleteSelected = () => {
        const ids = [...selectedIds];
        if (ids.length === 0) return;
        showAlert(
            'warning',
            t('twod_detail.confirm_delete_title', 'ဂဏန်းများ ဖျက်မည်') as string,
            t('twod_detail.confirm_delete_msg', 'ရွေးထားသော ဂဏန်းများကို စာရင်းမှ ဖျက်မှာ သေချာပြီလား?') as string,
            () => {
                // One store write, addressed by id — every unselected row keeps
                // its identity, amount and position.
                removeBetRows(ids);
                exitSelection();
                showToast(t('twod_detail.toast_removed', 'စာရင်းမှ ဖျက်ပြီးပါပြီ') as string);
            },
            true
        );
    };

    const saveEdit = () => {
        if (!editingId) return;
        if (editNum.length !== 2) {
            return setEditError(t('twod_detail.err_exact_two', 'ဒဲ့ နှင့် R အတွက် ဂဏန်း (၂) လုံး အတိအကျ ထည့်ပါ။') as string);
        }
        const trimmed = editAmt.trim();
        const amt = Number(trimmed);
        if (!/^\d+$/.test(trimmed) || !Number.isInteger(amt) || amt < 1) {
            return setEditError(t('twod_detail.err_invalid_amt', 'ကျေးဇူးပြု၍ လောင်းကြေးငွေပမာဏကို မှန်ကန်စွာ ထည့်ပါ။') as string);
        }
        updateBetRowFields(editingId, { number: editNum, amount: trimmed });
        setEditingId(null);
        showToast(t('twod_detail.toast_updated', 'ဂဏန်း ပြင်ဆင်ပြီးပါပြီ') as string);
    };

    const deleteEditing = () => {
        if (!editingId) return;
        removeBetRow(editingId);
        setEditingId(null);
        showToast(t('twod_detail.toast_removed', 'စာရင်းမှ ဖျက်ပြီးပါပြီ') as string);
    };

    const editingRow = editingId != null ? betRows.find((r: any) => r.id === editingId) : null;

    const handleBack = () => {
        if (step === 3) {
            setStep(2);
        } else {
            if (betRows.filter((r: any) => r.number !== '').length > 0) {
                showAlert(
                    'warning',
                    t('twod_detail.alert_warning', 'သတိပေးချက်') as string,
                    t('twod_detail.alert_clear_warning', 'သင်ရွေးချယ်ထားသော ဂဏန်းများအားလုံး ပျက်သွားပါမည်။ ထွက်မှာ သေချာပြီလား?') as string,
                    () => {
                        clearBetRows();
                        router.back();
                    },
                    true
                );
            } else {
                router.back();
            }
        }
    };

    const handleStake = (numbers: string[], amount: string) => {
        const newBets = numbers.map(n => ({ number: n, amount }));
        if (newBets.length > 0) {
            addMultipleBets(newBets);
            showToast(t('twod_detail.toast_added', 'စာရင်း ထည့်သွင်းပြီးပါပြီ') as string);
        }
        return newBets.length;
    };

    const runQuickPick = (key: string, label: string) => {
        setFastError(null);
        if (key !== 'direct' && key !== 'reverse') {
            setBulkPick({ key: key as BulkPick, label });
            setModalAmt(fastAmt); setModalDigits([]); setModalDigit(''); setModalIncludeDbl(false); setModalError(null);
            return;
        }

        if (!fastAmt || parseInt(fastAmt) < 1) return setFastError(t('twod_detail.err_invalid_amt', 'ကျေးဇူးပြု၍ လောင်းကြေးငွေပမာဏကို မှန်ကန်စွာ ထည့်ပါ။') as string);
        if (fastNum.length !== 2) return setFastError(t('twod_detail.err_exact_two', 'ဒဲ့ နှင့် R အတွက် ဂဏန်း (၂) လုံး အတိအကျ ထည့်ပါ။') as string);

        const rev = reverseNum(fastNum);
        const nums = key === 'reverse' && rev !== fastNum ? [fastNum, rev] : [fastNum];

        handleStake(nums, fastAmt);
        setFastNum('');
    };

    const runPaste = () => {
        setPasteError(null);
        if (!pasteAmt || parseInt(pasteAmt) < 1) return setPasteError(t('twod_detail.err_paste_amt', 'ကျေးဇူးပြု၍ Default Amount ထည့်ပါ။') as string);

        const parsed = parsePastedBets(pasteText, pasteAmt);
        if (parsed.length === 0) return setPasteError(t('twod_detail.err_paste_not_found', 'သင့်စာသားထဲတွင် ဂဏန်းများ ရှာမတွေ့ပါ။') as string);

        addMultipleBets(parsed);
        showToast(t('twod_detail.toast_added', 'စာရင်း ထည့်သွင်းပြီးပါပြီ') as string);
        setPasteText('');
    };

    const modalNumbers = (() => {
        if (!bulkPick) return [];
        const mode = BULK_MODES[bulkPick.key];
        if (mode === 'fixed') return FIXED_SETS[bulkPick.key] ?? [];
        if (mode === 'digits') return getKhwayNumbers(modalDigits, modalIncludeDbl);
        return /^\d$/.test(modalDigit) ? generateInclude(modalDigit) : [];
    })();

    const confirmModal = () => {
        const mode = bulkPick ? BULK_MODES[bulkPick.key] : null;
        if (mode === 'digits' && modalDigits.length < 2) return setModalError(t('twod_detail.err_min_two_khway', 'ခွေရန်အတွက် အနည်းဆုံး ဂဏန်း ၂ လုံး ရွေးပါ။') as string);
        if (mode === 'digit' && !/^\d$/.test(modalDigit)) return setModalError(t('twod_detail.err_exact_one', 'ကျေးဇူးပြု၍ ဂဏန်း ၁ လုံး အတိအကျ ထည့်ပါ။') as string);
        if (!modalAmt || parseInt(modalAmt) < 1) return setModalError(t('twod_detail.err_invalid_amt_modal', 'လောင်းကြေးငွေပမာဏကို မှန်ကန်စွာ ထည့်ပါ။') as string);

        handleStake(modalNumbers, modalAmt);
        setBulkPick(null); setFastNum('');
    };

    const mutation = useMutation({
        mutationFn: createBetAPI,
        onSuccess: () => {
            showAlert('success', t('twod_detail.alert_success', 'အောင်မြင်ပါသည်') as string, t('twod_detail.alert_success_msg', 'လောင်းကြေး အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ။') as string, () => {
                clearBetRows();
                setPin('');
                refreshWallet();
                router.push('/results/twoDresult');
            });
        },
        onError: (err: any) => {
            showAlert('error', t('twod_detail.alert_error', 'အမှား') as string, err?.response?.data?.message || t('twod_detail.alert_fail_msg', 'လောင်းကြေးတင်ခြင်း မအောင်မြင်ပါ။') as string);
        }
    });

    const submitBet = () => {
        if (isInsufficient) return showAlert('error', t('twod_detail.alert_error', 'အမှား') as string, t('twod_detail.alert_insufficient', 'လက်ကျန်ငွေ မလုံလောက်ပါ။') as string);
        if (pin.length !== 6) return showAlert('error', t('twod_detail.alert_error', 'အမှား') as string, t('twod_detail.alert_exact_six_pin', 'PIN ဂဏန်း (၆) လုံး အတိအကျ ထည့်ပါ။') as string);
        if (validBetCount === 0) return showAlert('error', t('twod_detail.alert_error', 'အမှား') as string, t('twod_detail.alert_min_one_num', 'ဂဏန်း အနည်းဆုံး ၁ ခု ထည့်ပါ။') as string);

        const cleanRows = betRows.filter((r: any) => r.number.length === 2 && Number(r.amount) >= 1);

        const mergedMap: Record<string, number> = {};
        cleanRows.forEach((r: any) => {
            const num = r.number;
            const amt = parseInt(r.amount) || 0;
            mergedMap[num] = (mergedMap[num] || 0) + amt;
        });
        const mergedBetNumbers = Object.entries(mergedMap).map(([number, amount]) => ({ number, amount }));

        mutation.mutate({
            bet_type: '2D',
            currency: realCurrency,
            target_opentime: targetTime,
            bet_numbers: mergedBetNumbers,
            security_pin: pin
        });
    };

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={handleBack} style={styles.backBtn}><MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" /></Pressable>
                <Text style={styles.headerTitle}>{t('twod_detail.header_title', '2D FLASH MODE') as string}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                <View style={styles.titleRow}>
                    <View>
                        <Text style={styles.mainTitle}>{t('twod_detail.main_title', 'လောင်းကြေး ထားမည်') as string}</Text>
                        <Text style={styles.subTitle}>{t('twod_detail.sub_title', 'Two-digit quick rounds') as string}</Text>
                    </View>
                    <View style={styles.pillOuter}>
                        <View style={styles.pillInner}>
                            <Text style={styles.pillText}>{t('twod_detail.market_pill', '2D ဈေးကွက်') as string}</Text>
                        </View>
                    </View>
                </View>

                {step === 2 && (
                    <>
                        <View style={[styles.section, { zIndex: 10 }]}>
                            <Text style={styles.label}>{t('twod_detail.open_time', 'ပွဲစဉ် ရွေးချယ်ရန် (OPEN TIME)') as string}</Text>

                            {isAllClosed ? (
                                <View style={styles.lockedBox}>
                                    <MaterialIcons name="lock" size={24} color="#F87171" />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.lockedTitle}>{t('twod_detail.closed_title', 'ဒီနေ့အတွက် ပွဲပိတ်သွားပါပြီ') as string}</Text>
                                        <Text style={styles.lockedSub}>{t('twod_detail.closed_sub', 'မနက်ဖြန် 12:01 PM တွင် ပြန်လည်စတင်ပါမည်') as string}</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={{ position: 'relative' }}>
                                    <Pressable
                                        style={[styles.timeBox, showTimeDropdown && { borderColor: 'rgba(59, 130, 246, 0.5)' }]}
                                        onPress={() => setShowTimeDropdown(!showTimeDropdown)}
                                    >
                                        <MaterialIcons name="access-time" size={20} color="#10B981" />

                                        <CountdownTimer targetTime={targetTime} />

                                        <MaterialIcons name={showTimeDropdown ? "expand-less" : "expand-more"} size={22} color="#9CA3AF" />
                                    </Pressable>

                                    {showTimeDropdown && (
                                        <View style={styles.timeDropdownContainer}>
                                            {TARGET_OPEN_TIME_OPTIONS.map(timeVal => {
                                                const isClosed = isSessionExpired(timeVal, currentMinutes);
                                                const isActive = targetTime === timeVal;
                                                return (
                                                    <Pressable
                                                        key={timeVal}
                                                        style={[
                                                            styles.timeDropdownItem,
                                                            isActive && styles.timeDropdownItemActive,
                                                            isClosed && { opacity: 0.5 }
                                                        ]}
                                                        disabled={isClosed}
                                                        onPress={() => { setTargetTime(timeVal); setShowTimeDropdown(false); }}
                                                    >
                                                        <Text style={[styles.timeDropdownText, isActive && { color: '#10B981' }]}>
                                                            {TARGET_OPEN_TIME_LABELS[timeVal]}
                                                            {isClosed ? (t('twod_detail.closed_suffix', ' (ပိတ်သွားပါပြီ)') as string) : ''}
                                                        </Text>
                                                        {isActive && <MaterialIcons name="check" size={18} color="#10B981" />}
                                                    </Pressable>
                                                )
                                            })}
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        <View style={styles.fastCard}>
                            <View style={styles.cardTitleRow}>
                                <MaterialIcons name="bolt" size={20} color="#FBBF24" />
                                <Text style={styles.fastTitle}>{t('twod_detail.fast_entry', 'အမြန်ရွေးချယ်မှု (FAST ENTRY)') as string}</Text>
                            </View>

                            <View style={styles.inputRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>{t('twod_detail.number_label', 'ဂဏန်း (00-99)') as string}</Text>
                                    <TextInput style={styles.input} keyboardType="number-pad" maxLength={2} placeholder="23" placeholderTextColor="rgba(255,255,255,0.3)" value={fastNum} onChangeText={setFastNum} editable={!isAllClosed} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>{t('twod_detail.amount_mmk', 'ငွေပမာဏ (MMK)') as string}</Text>
                                    <TextInput style={styles.input} keyboardType="number-pad" placeholder="1000" placeholderTextColor="rgba(255,255,255,0.3)" value={fastAmt} onChangeText={setFastAmt} editable={!isAllClosed} />
                                </View>
                            </View>

                            <View style={styles.grid4}>
                                {[
                                    { k: 'direct', l: t('twod_detail.quick_direct', 'ဒဲ့') as string },
                                    { k: 'reverse', l: t('twod_detail.quick_r', 'R') as string },
                                    { k: 'apu', l: t('twod_detail.quick_apu', 'အပူး') as string },
                                    { k: 'khway', l: t('twod_detail.quick_khway', 'ခွေ') as string },
                                    { k: 'a-par', l: t('twod_detail.quick_apar', 'အပါ') as string },
                                    { k: 'power', l: t('twod_detail.quick_power', 'ပါဝါ') as string },
                                    { k: 'nakkhat', l: t('twod_detail.quick_nakkhat', 'နက္ခတ်') as string },
                                    { k: 'brother', l: t('twod_detail.quick_brother', 'ညီအစ်ကို') as string }
                                ].map(p => (
                                    <TouchableOpacity key={p.k} style={styles.quickPickBtn} onPress={() => !isAllClosed && runQuickPick(p.k, p.l)}>
                                        <Text style={styles.quickPickText}>{p.l}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.hintText}>{t('twod_detail.fast_hint', 'ဒဲ့ နှင့် R အတွက် ဂဏန်း (၂) လုံး ထည့်ပြီး တိုက်ရိုက် ထည့်သွင်းပါ။ ကျန်သည်များကို အရင် ကြည့်ရှုနိုင်ပါသည်။') as string}</Text>
                            {fastError && <Text style={styles.errorText}>{fastError}</Text>}
                        </View>

                        <View style={styles.pasteCard}>
                            <View style={styles.cardTitleRow}>
                                <MaterialIcons name="content-paste" size={18} color="#3B82F6" />
                                <Text style={styles.pasteTitle}>{t('twod_detail.paste_title', 'ဂဏန်းများ COPY / PASTE လုပ်ရန်') as string}</Text>
                            </View>
                            <Text style={styles.hintText}>{t('twod_detail.paste_instruction', 'အောက်တွင် ငွေပမာဏ သတ်မှတ်ပြီး၊ ဂဏန်းများ Paste ချပါ။') as string}</Text>

                            <Text style={styles.label}>{t('twod_detail.default_amount', 'DEFAULT AMOUNT') as string}</Text>
                            <TextInput style={[styles.input, { marginBottom: 12 }]} keyboardType="number-pad" placeholder="500" placeholderTextColor="rgba(255,255,255,0.3)" value={pasteAmt} onChangeText={setPasteAmt} editable={!isAllClosed} />

                            <TextInput style={styles.textarea} multiline textAlignVertical="top" placeholder={"12.24.56 = 500\n12.25 = r600\n1ပါ 500"} placeholderTextColor="rgba(255,255,255,0.3)" value={pasteText} onChangeText={setPasteText} editable={!isAllClosed} />

                            {pasteError && <Text style={styles.errorText}>{pasteError}</Text>}

                            <TouchableOpacity style={[styles.pasteBtn, isAllClosed && { opacity: 0.5 }]} disabled={isAllClosed} onPress={runPaste}>
                                <MaterialIcons name="add-task" size={18} color="#FFF" style={{ marginRight: 8 }} />
                                <Text style={styles.pasteBtnText}>{t('twod_detail.paste_btn', 'စာရင်းထဲသို့ ထည့်သွင်းမည်') as string}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.summaryCardOuter}>
                            <View style={styles.summaryCardInner}>
                                <View style={styles.summaryHeader}>
                                    <Text style={styles.summaryTitle}>{t('twod_detail.lottery_numbers', 'ထီဂဏန်းများ') as string}</Text>
                                    <Text style={styles.summaryCount}>{pillRowIds.length}</Text>
                                </View>

                                <View style={styles.pillsWrap}>
                                    {betRows.map((row: any) => {
                                        if (!row.number) return null;
                                        const amt = Number(row.amount);
                                        const isValid = /^\d+$/.test(row.amount.trim()) && Number.isInteger(amt) && amt >= 1;
                                        return (
                                            <BetPill
                                                key={row.id}
                                                row={row}
                                                isValid={isValid}
                                                selectionMode={selectionMode}
                                                isSelected={selectedIds.has(row.id)}
                                                disabled={isAllClosed}
                                                onPress={handlePillPress}
                                                onLongPress={enterSelection}
                                                onRemove={handlePillRemove}
                                            />
                                        );
                                    })}
                                </View>

                                {selectionMode ? (
                                    <View style={styles.selectBar}>
                                        <Text style={styles.selectCount}>
                                            {selectedIds.size} {t('twod_detail.selected_suffix', 'ခု ရွေးထားသည်') as string}
                                        </Text>
                                        <View style={styles.selectActions}>
                                            <TouchableOpacity
                                                style={[styles.selectBtn, allSelected && { opacity: 0.4 }]}
                                                disabled={allSelected}
                                                onPress={() => setRawSelected(new Set(pillRowIds))}
                                            >
                                                <Text style={styles.selectBtnText}>{t('twod_detail.select_all', 'အားလုံး ရွေးမည်') as string}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.selectDeleteBtn} onPress={deleteSelected}>
                                                <MaterialIcons name="delete-outline" size={16} color="#F87171" />
                                                <Text style={styles.selectDeleteText}>
                                                    {t('twod_detail.delete_selected', 'ဖျက်မည်') as string} ({selectedIds.size})
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.selectBtn} onPress={exitSelection}>
                                                <Text style={styles.selectBtnText}>{t('twod_detail.pill_cancel', 'မလုပ်တော့ပါ') as string}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : pillRowIds.length > 0 && (
                                    <Text style={styles.pillHint}>{t('twod_detail.pill_hint', 'ပြင်ရန် ဂဏန်းကို နှိပ်ပါ။ အများကြီး ရွေးရန် ဖိထားပါ။') as string}</Text>
                                )}
                            </View>
                        </View>

                        {betRows.map((row: any, index: number) => (
                            <View key={`${row.id}-${index}`} style={styles.rowCardOuter}>
                                <View style={styles.rowCardInner}>
                                    <View style={styles.rowCardHeader}>
                                        <View>
                                            <Text style={styles.potentialWinLabel}>{t('twod_detail.potential_win', 'POTENTIAL WIN') as string}</Text>
                                            <Text style={styles.potentialWinValue}>
                                                {row.amount && row.number.length === 2 ? `x ${(Number(row.amount) * 80).toLocaleString()}` : '—'}
                                            </Text>
                                        </View>
                                        <Pressable style={styles.closeBtnOuter} onPress={() => removeBetRow(row.id)}>
                                            <View style={styles.closeBtnInner}><MaterialIcons name="close" size={18} color="#9CA3AF" /></View>
                                        </Pressable>
                                    </View>
                                    <Text style={styles.label}>{t('twod_detail.number_label', 'ဂဏန်း (00-99)') as string}</Text>
                                    <TextInput style={styles.input} keyboardType="number-pad" maxLength={2} value={row.number} onChangeText={(val) => updateBetRow(row.id, 'number', val)} editable={!isAllClosed} />
                                    <Text style={[styles.label, { marginTop: 12 }]}>{t('twod_detail.amount_label', 'ငွေပမာဏ') as string}</Text>
                                    <TextInput style={styles.input} keyboardType="number-pad" value={row.amount} onChangeText={(val) => updateBetRow(row.id, 'amount', val)} editable={!isAllClosed} />
                                </View>
                            </View>
                        ))}

                        <View style={styles.actionsRow}>
                            <Pressable style={styles.clearBtnOuter} onPress={clearBetRows}>
                                <View style={styles.clearBtnInner}>
                                    <MaterialIcons name="delete-outline" size={18} color="#F87171" />
                                    <Text style={styles.clearBtnText}>{t('twod_detail.clear_all', 'အားလုံး ရှင်းမည်') as string}</Text>
                                </View>
                            </Pressable>
                        </View>

                        <TouchableOpacity activeOpacity={0.8} style={[styles.nextBtnOuter, (validBetCount === 0 || isAllClosed) && { opacity: 0.4 }]} disabled={validBetCount === 0 || isAllClosed} onPress={() => { exitSelection(); setStep(3); }}>
                            <LinearGradient colors={['#34D399', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnInner}>
                                <Text style={styles.nextBtnText}>{t('twod_detail.btn_next', 'ရှေ့သို့') as string}</Text>
                                <View style={styles.nextIconWrapper}><MaterialIcons name="arrow-forward" size={20} color="#042F21" /></View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </>
                )}

                {step === 3 && (
                    <>
                        <View style={styles.summaryCardOuter}>
                            <View style={[styles.summaryCardInner, { paddingVertical: 20 }]}>
                                <Text style={styles.summaryTitle}>{t('twod_detail.bet_summary', 'BET SUMMARY') as string}</Text>
                                <View style={[styles.summaryChips, { marginVertical: 16 }]}>
                                    {betRows.map((row: any, index: number) => {
                                        if (!row.number) return null;
                                        const amt = Number(row.amount);
                                        const isValid = /^\d+$/.test(row.amount.trim()) && Number.isInteger(amt) && amt >= 1;
                                        return (
                                            <View key={`${row.id}-${index}`} style={[styles.chip, isValid ? styles.chipValid : styles.chipInvalid]}>
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
                                    <Text style={styles.rowLabel}>{t('twod_detail.total', 'Total') as string}</Text>
                                    <Text style={styles.rowValueWhite}>{validTotal.toLocaleString()} {realCurrency}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.summaryCardOuter}>
                            <View style={[styles.summaryCardInner, { paddingVertical: 20 }]}>
                                <View style={[styles.rowBetween, { marginBottom: 12 }]}>
                                    <Text style={styles.rowLabel}>{t('twod_detail.balance', 'လက်ကျန်ငွေ') as string}</Text>
                                    <Text style={styles.rowValueWhite}>{realWalletBalance.toLocaleString()} {realCurrency}</Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.rowLabel}>{t('twod_detail.after_bet', 'ထိုးပြီးပါက ကျန်မည့်ငွေ') as string}</Text>
                                    <Text style={[styles.rowValueColored, isInsufficient ? { color: '#F87171' } : { color: '#10B981' }]}>
                                        {isInsufficient ? (t('twod_detail.insufficient_short', 'လက်ကျန်ငွေ မလုံလောက်ပါ') as string) : `${balanceAfter.toLocaleString()} ${realCurrency}`}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.summaryCardOuter}>
                            <View style={[styles.summaryCardInner, { paddingVertical: 20 }]}>
                                <Text style={[styles.summaryTitle, { marginBottom: 16 }]}>{t('twod_detail.security_pin', 'SECURITY PIN') as string}</Text>
                                <TextInput style={styles.pinInput} keyboardType="number-pad" secureTextEntry maxLength={6} placeholder={t('twod_detail.pin_placeholder', 'ဂဏန်း ၆ လုံး ထည့်ပါ') as string} placeholderTextColor="rgba(255,255,255,0.3)" value={pin} onChangeText={(val) => setPin(val.replace(/\D/g, '').slice(0, 6))} />
                            </View>
                        </View>

                        {isInsufficient && (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.topUpBtn}
                                onPress={() => router.push('/wallet-profile/deposit')}
                            >
                                <Text style={styles.topUpBtnText}>{t('twod_detail.top_up', '→ Top up wallet') as string}</Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.actionsCardOuter}>
                            <View style={styles.actionsCardInner}>
                                <View style={[styles.rowBetween, { marginBottom: 16 }]}>
                                    <Text style={styles.rowLabel}>{t('twod_detail.est_total', 'ခန့်မှန်းစုစုပေါင်း:') as string}</Text>
                                    <Text style={styles.rowValueWhite}>{validTotal.toLocaleString()} {realCurrency}</Text>
                                </View>
                                <View style={styles.grid2}>
                                    <TouchableOpacity style={styles.stepBackBtn} onPress={() => setStep(2)}>
                                        <MaterialIcons name="arrow-back" size={20} color="#93C5FD" />
                                        <Text style={styles.stepBackText}>{t('twod_detail.btn_back', 'နောက်သို့') as string}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.confirmBtn, (isInsufficient || pin.length !== 6 || mutation.isPending) && { opacity: 0.5 }]} disabled={isInsufficient || pin.length !== 6 || mutation.isPending} onPress={submitBet}>
                                        <LinearGradient colors={['#34D399', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.confirmBtnGradient}>
                                            {mutation.isPending ? <ActivityIndicator color="#042F21" /> : <><Text style={styles.confirmBtnText}>{t('twod_detail.btn_confirm_wager', 'လောင်းကြေး\nအတည်ပြုမည်') as string}</Text><MaterialIcons name="arrow-forward" size={20} color="#042F21" /></>}
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
                                <Text style={styles.modalTitle}>{bulkPick.label} ({modalNumbers.length}) {t('twod_detail.modal_kuet', 'ကွက်') as string}</Text>
                                <Pressable onPress={() => setBulkPick(null)}><MaterialIcons name="close" size={24} color="rgba(255,255,255,0.4)" /></Pressable>
                            </View>

                            {BULK_MODES[bulkPick.key] === 'digits' && (
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={styles.label}>{t('twod_detail.quick_khway', 'ခွေ') as string}</Text>
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
                                        <Text style={styles.checkboxText}>{t('twod_detail.quick_apu', 'အပူး') as string}ပါ ထည့်မည်</Text>
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
                                <Text style={styles.label}>{t('twod_detail.amount_mmk', 'ငွေပမာဏ (MMK)') as string}</Text>
                                <TextInput style={styles.input} keyboardType="number-pad" value={modalAmt} onChangeText={v => { setModalError(null); setModalAmt(v); }} />
                            </View>

                            {modalNumbers.length > 0 && (
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={styles.label}>{t('twod_detail.modal_included_nums', 'ပါဝင်သော ဂဏန်းများ') as string}</Text>
                                    <ScrollView style={{ maxHeight: 100 }} nestedScrollEnabled><View style={styles.chipsRow}>{modalNumbers.map(n => <View key={n} style={styles.chipBlue}><Text style={styles.chipTextBlue}>{n}</Text></View>)}</View></ScrollView>
                                </View>
                            )}

                            {modalError && <Text style={styles.errorText}>{modalError}</Text>}

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalCancel} onPress={() => setBulkPick(null)}><Text style={styles.modalCancelText}>{t('twod_detail.modal_cancel', 'ပယ်ဖျက်မည်') as string}</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.modalConfirm} onPress={confirmModal}>
                                    <LinearGradient colors={['#00e676', '#2ac48b']} style={styles.modalConfirmGrad}><Text style={styles.modalConfirmText}>{t('twod_detail.modal_confirm', 'အတည်ပြုသည်') as string}</Text></LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {editingRow && (
                <Modal transparent visible animationType="fade" onRequestClose={() => setEditingId(null)}>
                    <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{t('twod_detail.pill_edit_title', 'ဂဏန်း ပြင်မည်') as string}</Text>
                                <Pressable onPress={() => setEditingId(null)}>
                                    <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.4)" />
                                </Pressable>
                            </View>

                            <View style={{ marginBottom: 16 }}>
                                <Text style={styles.label}>{t('twod_detail.number_label', 'ဂဏန်း (00-99)') as string}</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    value={editNum}
                                    onChangeText={v => { setEditError(null); setEditNum(v.replace(/\D/g, '')); }}
                                />
                            </View>

                            <View style={{ marginBottom: 16 }}>
                                <Text style={styles.label}>{t('twod_detail.amount_mmk', 'ငွေပမာဏ (MMK)') as string}</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="number-pad"
                                    value={editAmt}
                                    onChangeText={v => { setEditError(null); setEditAmt(v.replace(/\D/g, '')); }}
                                />
                            </View>

                            <View style={styles.editWinRow}>
                                <Text style={styles.potentialWinLabel}>{t('twod_detail.potential_win', 'POTENTIAL WIN') as string}</Text>
                                <Text style={styles.potentialWinValue}>
                                    {editNum.length === 2 && /^\d+$/.test(editAmt.trim()) && Number(editAmt) >= 1
                                        ? `x ${(Number(editAmt) * 80).toLocaleString()}`
                                        : '—'}
                                </Text>
                            </View>

                            {editError && <Text style={styles.errorText}>{editError}</Text>}

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.editDeleteBtn} onPress={deleteEditing}>
                                    <MaterialIcons name="delete-outline" size={16} color="#F87171" />
                                    <Text style={styles.editDeleteText}>{t('twod_detail.pill_delete', 'ဖျက်မည်') as string}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalCancel} onPress={() => setEditingId(null)}>
                                    <Text style={styles.modalCancelText}>{t('twod_detail.pill_cancel', 'မလုပ်တော့ပါ') as string}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalConfirm} onPress={saveEdit}>
                                    <LinearGradient colors={['#00e676', '#2ac48b']} style={styles.modalConfirmGrad}>
                                        <Text style={styles.modalConfirmText}>{t('twod_detail.pill_save', 'သိမ်းမည်') as string}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            )}

            <Modal transparent visible={customAlert.visible} animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={styles.alertBox}>
                        <View style={[styles.alertIconWrap,
                        customAlert.type === 'success' ? { backgroundColor: 'rgba(16, 185, 129, 0.2)' } :
                            customAlert.type === 'warning' ? { backgroundColor: 'rgba(245, 158, 11, 0.2)' } :
                                { backgroundColor: 'rgba(248, 113, 113, 0.2)' }
                        ]}>
                            <MaterialIcons
                                name={customAlert.type === 'success' ? 'check-circle' : customAlert.type === 'warning' ? 'warning' : 'error'}
                                size={32}
                                color={customAlert.type === 'success' ? '#10B981' : customAlert.type === 'warning' ? '#F59E0B' : '#F87171'}
                            />
                        </View>
                        <Text style={styles.alertTitle}>{customAlert.title}</Text>
                        <Text style={styles.alertMessage}>{customAlert.message}</Text>

                        <View style={styles.alertActions}>
                            {customAlert.showCancel && (
                                <TouchableOpacity style={styles.alertCancelBtn} onPress={() => setCustomAlert({ ...customAlert, visible: false })}>
                                    <Text style={styles.alertCancelText}>{t('twod_detail.alert_cancel', 'မလုပ်ပါ') as string}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.alertConfirmBtn, customAlert.type === 'error' && { backgroundColor: '#F87171' }]}
                                onPress={() => {
                                    setCustomAlert({ ...customAlert, visible: false });
                                    if (customAlert.onConfirm) customAlert.onConfirm();
                                }}
                            >
                                <Text style={styles.alertConfirmText}>{t('twod_detail.alert_ok', 'အိုကေ') as string}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
                <MaterialIcons name="check-circle" size={18} color="#10B981" />
                <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>
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

    section: { marginBottom: 20, zIndex: 10 },

    timeBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    timeBoxTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    timeBoxSub: { color: '#FBBF24', fontSize: 11, marginTop: 4, letterSpacing: 0.5 },

    timeDropdownContainer: { marginTop: 8, backgroundColor: '#080E28', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' },
    timeDropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    timeDropdownItemActive: { backgroundColor: 'rgba(16, 185, 129, 0.12)' },
    timeDropdownText: { color: '#E2E8F0', fontSize: 15, fontWeight: 'bold' },

    lockedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: 12, padding: 16 },
    lockedTitle: { color: '#F87171', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    lockedSub: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

    label: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' },
    input: { height: 48, backgroundColor: 'rgba(5, 10, 31, 0.68)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, color: '#f7f9ff', fontSize: 16, fontWeight: 'bold', paddingHorizontal: 16, textAlign: 'center' },
    textarea: { minHeight: 120, backgroundColor: 'rgba(5, 10, 31, 0.68)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, color: '#f7f9ff', fontSize: 15, padding: 12, marginBottom: 12 },
    errorText: { color: '#ff9b93', fontSize: 12, marginTop: 8, marginBottom: 8 },

    fastCard: { backgroundColor: 'rgba(251, 191, 36, 0.04)', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.2)', borderRadius: 16, padding: 16, marginBottom: 20 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    fastTitle: { color: '#fbbf24', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    inputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },

    grid4: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, marginBottom: 12 },
    quickPickBtn: { width: '23.5%', height: 44, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    quickPickText: { color: '#e5e7eb', fontSize: 12, fontWeight: 'bold' },

    hintText: { color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 12, lineHeight: 16 },

    pasteCard: { backgroundColor: 'rgba(59, 130, 246, 0.05)', borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(59, 130, 246, 0.4)', borderRadius: 16, padding: 16, marginBottom: 20 },
    pasteTitle: { color: '#60a5fa', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    pasteBtn: { flexDirection: 'row', height: 48, backgroundColor: '#3b82f6', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    pasteBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginLeft: 8 },

    summaryCardOuter: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 1, borderRadius: 16, marginBottom: 20 },
    summaryCardInner: { backgroundColor: '#0B1221', borderRadius: 15, padding: 16 },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    summaryTitle: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase' },
    summaryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
    chipValid: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
    chipInvalid: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' },
    chipText: { fontSize: 13 },
    chipTextValid: { color: '#10B981', fontWeight: 'bold' },
    chipTextInvalid: { color: '#F59E0B', fontWeight: 'bold' },
    chipAmountText: { fontWeight: 'normal', opacity: 0.6 },

    // Step 2's editable pills. Deliberately separate from `chip*`, which step 3
    // keeps for its compact read-only summary.
    summaryCount: { color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 'bold' },
    pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    pill: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 14, paddingRight: 8, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
    pillValid: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.25)' },
    pillInvalid: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.25)' },
    pillSelected: { backgroundColor: 'rgba(59, 130, 246, 0.16)', borderColor: '#3B82F6' },
    pillNumber: { fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
    pillAmount: { fontSize: 13, fontWeight: '600', opacity: 0.65 },
    pillRemove: { paddingHorizontal: 4, paddingVertical: 4, marginLeft: 2 },
    pillHint: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 12, lineHeight: 16 },

    selectBar: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
    selectCount: { color: '#BFDBFE', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
    selectActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    selectBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)' },
    selectBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 'bold' },
    selectDeleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.35)', backgroundColor: 'rgba(248, 113, 113, 0.1)' },
    selectDeleteText: { color: '#F87171', fontSize: 12, fontWeight: 'bold' },

    editWinRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    editDeleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.35)', backgroundColor: 'rgba(248, 113, 113, 0.1)' },
    editDeleteText: { color: '#F87171', fontSize: 13, fontWeight: 'bold' },

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

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
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

    toastContainer: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#1F2937', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
    toastText: { color: '#F9FAFB', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },

    alertOverlay: { flex: 1, backgroundColor: 'rgba(4, 10, 31, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    alertBox: { width: '100%', maxWidth: 320, backgroundColor: '#0F172A', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    alertIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    alertTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    alertMessage: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    alertActions: { flexDirection: 'row', gap: 12, width: '100%' },
    alertCancelBtn: { flex: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    alertCancelText: { color: '#94A3B8', fontSize: 14, fontWeight: 'bold' },
    alertConfirmBtn: { flex: 1, height: 48, backgroundColor: '#10B981', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    alertConfirmText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' }
});