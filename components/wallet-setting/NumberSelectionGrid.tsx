import { useBetStore } from '@/store/useBetStore';
import { PATTERN_3D, TabType, TRIPLE_3D, useNumberStore } from '@/store/useNumberStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    BackHandler,
    Dimensions,
    Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable,
    ScrollView, StyleSheet, Text, TextInput,
    Vibration,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SmartParserModal from './SmartParserModal';
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
    card: '#121C38',
    inputBg: '#1A2647',
    border: 'rgba(255, 255, 255, 0.1)',
    borderActive: '#00E676',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    danger: '#FF3B30',
    infoBg: 'rgba(0, 178, 255, 0.08)',
    infoBorder: 'rgba(0, 178, 255, 0.3)',
    infoText: '#00B2FF',
};

const POWER_2D = ['05', '50', '16', '61', '27', '72', '38', '83', '49', '94'];
const NATKHAT_2D = ['07', '70', '18', '81', '24', '42', '35', '53', '69', '96'];

const BetRowItem = ({
    num,
    tab,
    amount,
    onAmountChange,
    onRemove
}: {
    num: string;
    tab: TabType;
    amount: string;
    onAmountChange: (val: string) => void;
    onRemove: (tab: TabType, val: string) => void;
}) => {
    const { t } = useTranslation();
    const amtNum = parseInt(amount) || 0;
    const multiplier = tab === '2D' ? 80 : 500;
    const winAmt = amtNum * multiplier;

    return (
        <View style={styles.betRow}>
            <View style={styles.betRowLeft}>
                <View style={styles.betBadge}>
                    <Text style={styles.betBadgeText} numberOfLines={1} adjustsFontSizeToFit>{num}</Text>
                </View>
                <View style={styles.betWinInfo}>
                    <Text style={styles.betWinLabel}>{t.potentialWin || 'ပေါက်ကြေး'} (x{multiplier})</Text>
                    <Text style={styles.betWinValue}>{winAmt > 0 ? winAmt.toLocaleString() : '-'} {t.kyats || 'ကျပ်'}</Text>
                </View>
            </View>

            <View style={styles.betRowRight}>
                <View style={styles.amountInputWrapper}>
                    <TextInput
                        style={styles.amountInput}
                        keyboardType="number-pad"
                        value={amount}
                        onChangeText={onAmountChange}
                        placeholder={t.amountPlaceholder || "ပမာဏ"}
                        placeholderTextColor={THEME.textMuted}
                    />
                    <Text style={styles.amountCurrency}>{t.kyats || 'ကျပ်'}</Text>
                </View>
                <Pressable style={styles.betDeleteBtn} onPress={() => { Vibration.vibrate(10); onRemove(tab, num); }}>
                    <Ionicons name="trash-outline" size={s(16, 18, 20)} color={THEME.danger} />
                </Pressable>
            </View>
        </View>
    );
};

export default function NumberSelectionGrid() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useTranslation();

    const numbers = useNumberStore((state) => state.numbers);
    const addComputedBets = useNumberStore((state) => state.addComputedBets);
    const addBulkBets = useNumberStore((state) => state.addBulkBets);
    const removeNumber = useNumberStore((state) => state.removeNumber);
    const clearAll = useNumberStore((state) => state.clearAll);

    const setInitialBets = useBetStore((state) => state.setInitialBets);
    const updateAmount = useBetStore((state) => state.updateAmount);

    const [activeTab, setActiveTab] = useState<TabType>('3D');
    const [currentInput, setCurrentInput] = useState('');

    const [is2DRActive, setIs2DRActive] = useState(false);
    const [is3DBoxActive, setIs3DBoxActive] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const [doublesModalVisible, setDoublesModalVisible] = useState(false);
    const [brothersModalVisible, setBrothersModalVisible] = useState(false);
    const [powerModalVisible, setPowerModalVisible] = useState(false);
    const [natkhatModalVisible, setNatkhatModalVisible] = useState(false);
    const [khwayModalVisible, setKhwayModalVisible] = useState(false);
    const [khwayDigits, setKhwayDigits] = useState<string[]>([]);

    const [parserModalVisible, setParserModalVisible] = useState(false);

    const [triples3DModalVisible, setTriples3DModalVisible] = useState(false);
    const [patterns3DModalVisible, setPatterns3DModalVisible] = useState(false);

    const [deleteNum, setDeleteNum] = useState<{ tab: TabType, val: string } | null>(null);
    const [isNoticeLoading, setIsNoticeLoading] = useState<boolean>(true);

    const [betAmounts, setBetAmounts] = useState<Record<string, string>>({});
    const [globalAmount, setGlobalAmount] = useState('');

    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'confirm',
        title: '',
        message: '',
        cancelText: '',
        confirmText: '',
        onConfirm: () => { },
    });

    const bets2D = numbers['2D'] || [];
    const bets3D = numbers['3D'] || [];
    const totalBetsCount = bets2D.length + bets3D.length;

    useEffect(() => {
        setBetAmounts(prev => {
            const next = { ...prev };
            let isChanged = false;
            [...bets2D, ...bets3D].forEach(num => {
                if (!next[num]) {
                    next[num] = '100';
                    isChanged = true;
                }
            });
            return isChanged ? next : prev;
        });
    }, [bets2D, bets3D]);

    const totalAmount = [...bets2D, ...bets3D].reduce((sum, num) => sum + (parseInt(betAmounts[num]) || 0), 0);

    let maxLen = activeTab === '3D' ? 3 : (activeTab === '2D' ? 2 : 1);

    useEffect(() => {
        const onHardwareBackPress = () => {
            if (totalBetsCount > 0) {
                setShowAlert(true);
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
        return () => backHandler.remove();
    }, [totalBetsCount]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsNoticeLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleSwitchMode = (newMode: TabType) => {
        if (activeTab === newMode) return;
        setActiveTab(newMode);
        setCurrentInput('');
        setIs2DRActive(false);
        setIs3DBoxActive(false);
    };

    const handleAdd = () => {
        if (currentInput.length !== maxLen) return;
        addComputedBets(activeTab, currentInput, is2DRActive, is3DBoxActive, maxLen);
        setCurrentInput('');
        Keyboard.dismiss();
    };

    const handleRemoveRequest = (tab: TabType, val: string) => {
        setDeleteNum({ tab, val });
    };

    const confirmRemove = () => {
        if (deleteNum) {
            removeNumber(deleteNum.tab, deleteNum.val);
            setDeleteNum(null);
        }
    };

    const confirmClearAll = () => {
        setModalConfig({
            visible: true,
            type: 'confirm',
            title: t.clearAllTitle || 'အကုန်ဖျက်မည်',
            message: t.clearAllDesc || 'ရွေးချယ်ထားသော ဂဏန်းအားလုံးကို ဖျက်မှာ သေချာပြီလား?',
            cancelText: t.doNotDelete || 'မဖျက်ပါ',
            confirmText: t.delete || 'ဖျက်မည်',
            onConfirm: () => {
                clearAll();
                setModalConfig(prev => ({ ...prev, visible: false }));
            }
        });
    };

    const handleAmountChange = (num: string, val: string) => {
        setBetAmounts(prev => ({ ...prev, [num]: val.replace(/[^0-9]/g, '') }));
    };

    const applyGlobalAmount = () => {
        if (!globalAmount) return;
        Keyboard.dismiss();
        setBetAmounts(prev => {
            const next = { ...prev };
            [...bets2D, ...bets3D].forEach(num => {
                next[num] = globalAmount;
            });
            return next;
        });
        setGlobalAmount('');
    };

    const confirmAddDoubles2D = () => {
        const doubles = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
        setDoublesModalVisible(false);
        setTimeout(() => addBulkBets('2D', doubles), 100);
    };

    const confirmAddBrothers2D = () => {
        const brothers = [
            '01', '12', '23', '34', '45', '56', '67', '78', '89', '09',
            '10', '21', '32', '43', '54', '65', '76', '87', '98', '90'
        ];
        setBrothersModalVisible(false);
        setTimeout(() => addBulkBets('2D', brothers), 100);
    };

    const confirmAddPower2D = () => {
        setPowerModalVisible(false);
        setTimeout(() => addBulkBets('2D', POWER_2D), 100);
    };

    const confirmAddNatkhat2D = () => {
        setNatkhatModalVisible(false);
        setTimeout(() => addBulkBets('2D', NATKHAT_2D), 100);
    };

    const toggleKhwayDigit = (d: string) => {
        setKhwayDigits(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
    };

    const confirmAddKhway2D = () => {
        const generated: string[] = [];
        for (let i = 0; i < khwayDigits.length; i++) {
            for (let j = 0; j < khwayDigits.length; j++) {
                if (i !== j) {
                    generated.push(khwayDigits[i] + khwayDigits[j]);
                }
            }
        }
        setKhwayModalVisible(false);
        setTimeout(() => addBulkBets('2D', generated), 100);
    };

    const handleConfirmParsedBets = (parsedNumbers: string[]) => {
        setParserModalVisible(false);
        if (parsedNumbers.length > 0) {
            setTimeout(() => addBulkBets('2D', parsedNumbers), 100);
        }
    };

    const confirmAddTriples3D = () => {
        setTriples3DModalVisible(false);
        setTimeout(() => addBulkBets('3D', TRIPLE_3D), 100);
    };

    const confirmAddPatterns3D = () => {
        setPatterns3DModalVisible(false);
        setTimeout(() => addBulkBets('3D', PATTERN_3D), 100);
    };

    const handleAddRandom3D = () => {
        Vibration.vibrate(20);
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        addBulkBets('3D', [randomNum]);
    };

    const handleProceedToCart = () => {
        const combinedBets = [...bets2D, ...bets3D];
        setInitialBets(combinedBets);

        setTimeout(() => {
            combinedBets.forEach(num => {
                if (betAmounts[num]) {
                    updateAmount(num, betAmounts[num]);
                }
            });
            router.push('/wallet-profile/number-play/select');
        }, 50);
    };

    const dynamicHeaderStyle = [styles.header, { paddingTop: Math.max(insets.top, s(10, 15, 20)) }];
    const dynamicBottomBarStyle = [styles.bottomBar, { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, s(10, 15, 20)) : s(15, 20, 25) }];

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            <View style={dynamicHeaderStyle}>
                <Pressable onPress={() => totalBetsCount > 0 ? setShowAlert(true) : router.back()} style={styles.navBtn}>
                    <Ionicons name="chevron-back" size={s(20, 26, 32)} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>{t.enterNumbers || 'ဂဏန်းရိုက်ထည့်ရန်'}</Text>
            </View>

            <View style={styles.switcherContainer}>
                <Pressable style={[styles.switchTab, activeTab === '2D' && styles.switchTabActive]} onPress={() => handleSwitchMode('2D')}>
                    <Text style={[styles.switchText, activeTab === '2D' && styles.switchTextActive]}>{t.number2D || '2D ဂဏန်း'}</Text>
                </Pressable>
                <Pressable style={[styles.switchTab, activeTab === '3D' && styles.switchTabActive]} onPress={() => handleSwitchMode('3D')}>
                    <Text style={[styles.switchText, activeTab === '3D' && styles.switchTextActive]}>{t.number3D || '3D ဂဏန်း'}</Text>
                </Pressable>
            </View>

            <View style={styles.commandCenter}>
                <TextInput
                    style={styles.proInput}
                    placeholder={activeTab === '2D' ? "00" : (maxLen === 3 ? "000" : "0")}
                    placeholderTextColor={THEME.textMuted}
                    keyboardType="number-pad"
                    maxLength={maxLen}
                    value={currentInput}
                    onChangeText={(t) => setCurrentInput(t.replace(/[^0-9]/g, ''))}
                />

                {activeTab === '2D' && (
                    <View>
                        <View style={styles.toolbar2D}>
                            <Pressable style={[styles.toolBtn2D, is2DRActive ? styles.toolBtnActive : styles.toolBtnInactive]} onPress={() => setIs2DRActive(!is2DRActive)}>
                                <Text style={[styles.toolText, is2DRActive ? styles.textBlack : styles.textWhite]}>{t.rReverse || 'R (အပြန်)'}</Text>
                            </Pressable>
                            <Pressable style={[styles.toolBtn2D, styles.toolBtnInactive]} onPress={() => { Keyboard.dismiss(); setDoublesModalVisible(true); }}>
                                <Text style={styles.toolTextLight}>{t.doubles || 'အပူး'}</Text>
                            </Pressable>
                            <Pressable style={[styles.toolBtn2D, styles.toolBtnInactive]} onPress={() => { Keyboard.dismiss(); setBrothersModalVisible(true); }}>
                                <Text style={styles.toolTextLight}>{t.brothers || 'ညီအစ်ကို'}</Text>
                            </Pressable>
                            <Pressable style={[styles.toolBtn2D, styles.toolBtnInactive]} onPress={() => { Keyboard.dismiss(); setPowerModalVisible(true); }}>
                                <Text style={styles.toolTextLight}>{t.power || 'ပါဝါ'}</Text>
                            </Pressable>
                            <Pressable style={[styles.toolBtn2D, styles.toolBtnInactive]} onPress={() => { Keyboard.dismiss(); setNatkhatModalVisible(true); }}>
                                <Text style={styles.toolTextLight}>{t.natkhat || 'နက္ခတ်'}</Text>
                            </Pressable>
                            <Pressable style={[styles.toolBtn2D, styles.toolBtnInactive]} onPress={() => { Keyboard.dismiss(); setKhwayModalVisible(true); setKhwayDigits([]); }}>
                                <Text style={styles.toolTextLight}>{t.khway || 'ခွေ'}</Text>
                            </Pressable>
                        </View>

                        <Pressable style={styles.pasteActionBtn} onPress={() => { Keyboard.dismiss(); setParserModalVisible(true); }}>
                            <Ionicons name="clipboard-outline" size={s(16, 18, 22)} color="#000" />
                            <Text style={styles.pasteActionText}>{t.pasteText || 'စာကူးထည့်'}</Text>
                        </Pressable>
                    </View>
                )}

                {activeTab === '3D' && (
                    <View>
                        <View style={styles.toolbar}>
                            <Pressable style={[styles.toolBtn, is3DBoxActive ? styles.toolBtnActive : styles.toolBtnInactive]} onPress={() => setIs3DBoxActive(!is3DBoxActive)}>
                                <Text style={[styles.toolText, is3DBoxActive ? styles.textBlack : styles.textWhite]}>{t.patBox || 'ပတ် (Box)'}</Text>
                            </Pressable>
                            <Pressable style={[styles.toolBtn, styles.toolBtnInactive]} onPress={() => { Keyboard.dismiss(); setTriples3DModalVisible(true); }}>
                                <Text style={styles.toolTextLight}>{t.triples || 'သုံးလုံးတူ'}</Text>
                            </Pressable>
                            <Pressable style={[styles.toolBtn, styles.toolBtnInactive]} onPress={() => { Keyboard.dismiss(); setPatterns3DModalVisible(true); }}>
                                <Text style={styles.toolTextLight}>{t.patterns || 'စီဂဏန်း'}</Text>
                            </Pressable>
                        </View>
                        <View style={[styles.toolbar, styles.toolbarMarginTop]}>
                            <Pressable style={[styles.toolBtn, styles.toolBtnInactive, styles.randomBtnBg]} onPress={handleAddRandom3D}>
                                <Text style={[styles.toolTextLight, styles.randomBtnText]}>{t.random || 'ကျပန်း'}</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                <Pressable
                    style={[styles.mainActionBtn, currentInput.length !== maxLen && styles.btnDisabled]}
                    onPress={handleAdd}
                    disabled={currentInput.length !== maxLen}
                >
                    <Text style={styles.mainActionText}>{t.addToCart || 'စာရင်းထဲ ပေါင်းထည့်မည်'}</Text>
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {totalBetsCount === 0 && <Text style={styles.emptyText}>{t.noNumbersSelected || 'ရွေးချယ်ထားသော ဂဏန်းမရှိသေးပါ'}</Text>}

                {totalBetsCount > 0 && (
                    <View style={styles.globalAmountBox}>
                        <Text style={styles.globalAmountLabel}>{t.setSameAmountForAll || 'အားလုံးကို ပမာဏတူညီစွာ သတ်မှတ်ရန်'}</Text>
                        <View style={styles.globalAmountRow}>
                            <TextInput
                                style={styles.globalAmountInput}
                                keyboardType="number-pad"
                                value={globalAmount}
                                onChangeText={(t) => setGlobalAmount(t.replace(/\D/g, ''))}
                                placeholder={t.example1000 || 'ဥပမာ - ၁၀၀၀'}
                                placeholderTextColor={THEME.textMuted}
                            />
                            <Pressable style={styles.globalAmountBtn} onPress={applyGlobalAmount}>
                                <Text style={styles.globalAmountBtnText}>{t.apply || 'သတ်မှတ်မည်'}</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {bets2D.length > 0 && (
                    <View style={styles.resultSection}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.sectionTitle}>{t.list2D || '2D စာရင်း'}</Text>
                            <Text style={styles.sectionCount}>({bets2D.length} {t.betsCount || 'ကွက်'})</Text>
                        </View>
                        {bets2D.map(num => (
                            <BetRowItem
                                key={`2D-${num}`}
                                tab="2D"
                                num={num}
                                amount={betAmounts[num] || ''}
                                onAmountChange={(val) => handleAmountChange(num, val)}
                                onRemove={handleRemoveRequest}
                            />
                        ))}
                    </View>
                )}

                {bets3D.length > 0 && (
                    <View style={styles.resultSection}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.sectionTitle}>{t.list3D || '3D စာရင်း'}</Text>
                            <Text style={styles.sectionCount}>({bets3D.length} {t.betsCount || 'ကွက်'})</Text>
                        </View>
                        {bets3D.map(num => (
                            <BetRowItem
                                key={`3D-${num}`}
                                tab="3D"
                                num={num}
                                amount={betAmounts[num] || ''}
                                onAmountChange={(val) => handleAmountChange(num, val)}
                                onRemove={handleRemoveRequest}
                            />
                        ))}
                    </View>
                )}

                <View style={styles.noticeBox}>
                    <View style={styles.noticeHeader}>
                        <Ionicons name="megaphone" size={s(14, 18, 24)} color={THEME.infoText} />
                        <Text style={styles.noticeTitle}>{t.noticeTitle || 'အသိပေးချက်'}</Text>
                    </View>
                    {isNoticeLoading ? (
                        <ActivityIndicator size="small" color={THEME.infoText} style={styles.marginTop10} />
                    ) : (
                        <Text style={styles.noticeText}>{t.noticeDesc || 'လူကြီးမင်းတို့ ရွေးချယ်ထားသော ဂဏန်းများကို စာရင်းမသွင်းမီ သေချာစွာ ထပ်မံစစ်ဆေးပေးပါရန် အထူးမေတ္တာရပ်ခံအပ်ပါသည်။'}</Text>
                    )}
                </View>

            </ScrollView>

            {totalBetsCount > 0 && (
                <View style={dynamicBottomBarStyle}>
                    <View style={styles.bottomBarContent}>
                        <View style={styles.bottomTotalBox}>
                            <Text style={styles.bottomTotalLabel}>{t.totalCost || 'စုစုပေါင်း ကျသင့်ငွေ'} ({totalBetsCount} {t.betsCount || 'ကွက်'})</Text>
                            <Text style={styles.bottomTotalValue}>
                                {totalAmount.toLocaleString()} <Text style={styles.bottomTotalCurrency}>{t.kyats || 'ကျပ်'}</Text>
                            </Text>
                        </View>
                        <View style={styles.bottomActions}>
                            <Pressable style={styles.clearAllBtn} onPress={confirmClearAll}>
                                <Ionicons name="trash" size={s(20, 24, 28)} color={THEME.danger} />
                            </Pressable>
                            <Pressable style={styles.fabBtn} onPress={handleProceedToCart}>
                                <Text style={styles.fabBtnText}>{t.proceed || 'ဆက်သွားမည်'}</Text>
                                <Ionicons name="arrow-forward" size={s(16, 18, 20)} color="#000" />
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}

            <SmartParserModal
                visible={parserModalVisible}
                onClose={() => setParserModalVisible(false)}
                onConfirm={handleConfirmParsedBets}
            />

            {/* --- Modals --- */}
            <Modal visible={showAlert} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={styles.alertBox}>
                        <Ionicons name="warning" size={s(40, 48, 60)} color={THEME.danger} style={styles.alertIconMargin} />
                        <Text style={[styles.alertTitle, styles.alertTitleLarge]}>{t.backAlertTitle || 'နောက်သို့ ပြန်ထွက်မည်လား?'}</Text>
                        <Text style={[styles.alertTitle, styles.alertDesc]}>{t.backAlertDesc || 'ယခုထွက်လိုက်ပါက ရွေးချယ်ထားသော ဂဏန်းများအားလုံး ပျက်ပြယ်သွားပါမည်။'}</Text>
                        <View style={styles.alertActions}>
                            <Pressable style={styles.btnAlt} onPress={() => setShowAlert(false)}>
                                <Text style={styles.btnAltText}>{t.doNotExit || 'မထွက်ပါ'}</Text>
                            </Pressable>
                            <Pressable style={styles.btnDanger} onPress={() => { setShowAlert(false); clearAll(); router.back(); }}>
                                <Text style={styles.btnAltText}>{t.exit || 'ထွက်မည်'}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={modalConfig.visible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={styles.alertBox}>
                        <Ionicons name="warning" size={s(36, 42, 54)} color={THEME.danger} style={styles.alertIconCenter} />
                        <Text style={[styles.alertTitle, styles.alertTitleLarge]}>{modalConfig.title}</Text>
                        <Text style={[styles.alertTitle, styles.alertDesc]}>{modalConfig.message}</Text>
                        <View style={styles.alertActions}>
                            {modalConfig.cancelText !== '' && (
                                <Pressable style={styles.btnAlt} onPress={() => setModalConfig(prev => ({ ...prev, visible: false }))}>
                                    <Text style={styles.btnAltText}>{modalConfig.cancelText}</Text>
                                </Pressable>
                            )}
                            <Pressable style={styles.btnDanger} onPress={modalConfig.onConfirm}>
                                <Text style={styles.btnAltText}>{modalConfig.confirmText}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={!!deleteNum} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={styles.alertBox}>
                        <Ionicons name="trash-bin" size={s(36, 42, 54)} color={THEME.danger} style={styles.alertIconMargin} />
                        <Text style={[styles.alertTitle, styles.alertTitleLineHeight]}>
                            {t.deleteConfirm1 || 'ဂဏန်း ('} <Text style={styles.alertNumberText}>{deleteNum?.val}</Text> {t.deleteConfirm2 || ') ကို ဖျက်မှာ သေချာပြီလား?'}
                        </Text>
                        <View style={styles.alertActions}>
                            <Pressable style={styles.btnAlt} onPress={() => setDeleteNum(null)}>
                                <Text style={styles.btnAltText}>{t.doNotDelete || 'မဖျက်ပါ'}</Text>
                            </Pressable>
                            <Pressable style={styles.btnDanger} onPress={confirmRemove}>
                                <Text style={styles.btnAltText}>{t.delete || 'ဖျက်မည်'}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={doublesModalVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, styles.modalBoxWide]}>
                        <Text style={[styles.alertTitle, styles.modalTitleGreen]}>{t.doubles2D || 'အပူး (2D)'}</Text>
                        <View style={styles.grid5Col}>
                            {['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'].map((num) => (
                                <View key={num} style={styles.chip5Col}><Text style={styles.chip5ColText}>{num}</Text></View>
                            ))}
                        </View>
                        <View style={[styles.alertActions, styles.modalActionMargin]}>
                            <Pressable style={[styles.btnAlt, styles.flex1]} onPress={() => setDoublesModalVisible(false)}><Text style={styles.btnAltText}>{t.cancel || 'ပယ်ဖျက်မည်'}</Text></Pressable>
                            <Pressable style={[styles.btnDanger, styles.btnConfirmGreen]} onPress={confirmAddDoubles2D}><Text style={styles.btnConfirmGreenText}>{t.selectPrefix || 'ရွေးချယ်ပါမည်'} (10) {t.betsCount || 'ကွက်'}</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={brothersModalVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, styles.modalBoxExtraWide]}>
                        <Text style={[styles.alertTitle, styles.modalTitleGreen]}>{t.brothers2D || 'ညီအစ်ကို (2D)'}</Text>
                        <View style={styles.grid10Col}>
                            {['01', '12', '23', '34', '45', '56', '67', '78', '89', '09'].map((num) => (
                                <View key={num} style={styles.chip10Col}><Text style={styles.chip10ColText}>{num}</Text></View>
                            ))}
                            {['10', '21', '32', '43', '54', '65', '76', '87', '98', '90'].map((num) => (
                                <View key={num} style={styles.chip10Col}><Text style={styles.chip10ColText}>{num}</Text></View>
                            ))}
                        </View>
                        <View style={[styles.alertActions, styles.modalActionMargin]}>
                            <Pressable style={[styles.btnAlt, styles.flex1]} onPress={() => setBrothersModalVisible(false)}><Text style={styles.btnAltText}>{t.cancel || 'ပယ်ဖျက်မည်'}</Text></Pressable>
                            <Pressable style={[styles.btnDanger, styles.btnConfirmGreen]} onPress={confirmAddBrothers2D}><Text style={styles.btnConfirmGreenText}>{t.selectPrefix || 'ရွေးချယ်ပါမည်'} (20) {t.betsCount || 'ကွက်'}</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={powerModalVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, styles.modalBoxExtraWide]}>
                        <Text style={[styles.alertTitle, styles.modalTitleGreen]}>{t.power2D || 'ပါဝါ (2D)'}</Text>
                        <View style={styles.grid10Col}>
                            {POWER_2D.slice(0, 5).map((num) => (
                                <View key={num} style={styles.chip10Col}><Text style={styles.chip10ColText}>{num}</Text></View>
                            ))}
                            {POWER_2D.slice(5, 10).map((num) => (
                                <View key={num} style={styles.chip10Col}><Text style={styles.chip10ColText}>{num}</Text></View>
                            ))}
                        </View>
                        <View style={[styles.alertActions, styles.modalActionMargin]}>
                            <Pressable style={[styles.btnAlt, styles.flex1]} onPress={() => setPowerModalVisible(false)}><Text style={styles.btnAltText}>{t.cancel || 'ပယ်ဖျက်မည်'}</Text></Pressable>
                            <Pressable style={[styles.btnDanger, styles.btnConfirmGreen]} onPress={confirmAddPower2D}><Text style={styles.btnConfirmGreenText}>{t.selectPrefix || 'ရွေးချယ်ပါမည်'} (10) {t.betsCount || 'ကွက်'}</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={natkhatModalVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, styles.modalBoxExtraWide]}>
                        <Text style={[styles.alertTitle, styles.modalTitleGreen]}>{t.natkhat2D || 'နက္ခတ် (2D)'}</Text>
                        <View style={styles.grid10Col}>
                            {NATKHAT_2D.slice(0, 5).map((num) => (
                                <View key={num} style={styles.chip10Col}><Text style={styles.chip10ColText}>{num}</Text></View>
                            ))}
                            {NATKHAT_2D.slice(5, 10).map((num) => (
                                <View key={num} style={styles.chip10Col}><Text style={styles.chip10ColText}>{num}</Text></View>
                            ))}
                        </View>
                        <View style={[styles.alertActions, styles.modalActionMargin]}>
                            <Pressable style={[styles.btnAlt, styles.flex1]} onPress={() => setNatkhatModalVisible(false)}><Text style={styles.btnAltText}>{t.cancel || 'ပယ်ဖျက်မည်'}</Text></Pressable>
                            <Pressable style={[styles.btnDanger, styles.btnConfirmGreen]} onPress={confirmAddNatkhat2D}><Text style={styles.btnConfirmGreenText}>{t.selectPrefix || 'ရွေးချယ်ပါမည်'} (10) {t.betsCount || 'ကွက်'}</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={khwayModalVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, styles.modalBoxWide]}>
                        <Text style={[styles.alertTitle, styles.modalTitleGreen]}>{t.khway2D || 'ခွေ (2D)'}</Text>
                        <Text style={styles.khwaySubText}>{t.selectKhwayDigits || 'ခွေလိုသော ဂဏန်းများကို ရွေးချယ်ပါ'}</Text>
                        <View style={styles.grid5Col}>
                            {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => {
                                const isSelected = khwayDigits.includes(num);
                                return (
                                    <Pressable
                                        key={num}
                                        style={[styles.chip5Col, isSelected && styles.khwayChipActive]}
                                        onPress={() => toggleKhwayDigit(num)}
                                    >
                                        <Text style={[styles.chip5ColText, isSelected && styles.khwayChipTextActive]}>{num}</Text>
                                    </Pressable>
                                )
                            })}
                        </View>
                        <View style={[styles.alertActions, styles.modalActionMargin]}>
                            <Pressable style={[styles.btnAlt, styles.flex1]} onPress={() => setKhwayModalVisible(false)}><Text style={styles.btnAltText}>{t.cancel || 'ပယ်ဖျက်မည်'}</Text></Pressable>
                            <Pressable
                                style={[styles.btnDanger, styles.btnConfirmGreen, khwayDigits.length < 2 && styles.btnDisabled]}
                                onPress={confirmAddKhway2D}
                                disabled={khwayDigits.length < 2}
                            >
                                <Text style={styles.btnConfirmGreenText}>{t.selectPrefix || 'ရွေးချယ်မည်'} ({khwayDigits.length * (khwayDigits.length - 1)}) {t.betsCount || 'ကွက်'}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={triples3DModalVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, styles.modalBoxWide]}>
                        <Text style={[styles.alertTitle, styles.modalTitleGreen]}>{t.triples3D || 'သုံးလုံးတူ (3D)'}</Text>
                        <View style={styles.grid5Col}>
                            {TRIPLE_3D.map((num) => (
                                <View key={num} style={styles.chip5Col}><Text style={styles.chip5ColText}>{num}</Text></View>
                            ))}
                        </View>
                        <View style={[styles.alertActions, styles.modalActionMargin]}>
                            <Pressable style={[styles.btnAlt, styles.flex1]} onPress={() => setTriples3DModalVisible(false)}><Text style={styles.btnAltText}>{t.cancel || 'ပယ်ဖျက်မည်'}</Text></Pressable>
                            <Pressable style={[styles.btnDanger, styles.btnConfirmGreen]} onPress={confirmAddTriples3D}><Text style={styles.btnConfirmGreenText}>{t.selectPrefix || 'ရွေးချယ်မည်'} ({TRIPLE_3D.length}) {t.betsCount || 'ကွက်'}</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={patterns3DModalVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, styles.modalBoxExtraWide]}>
                        <Text style={[styles.alertTitle, styles.modalTitleGreen]}>{t.patterns3D || 'စီဂဏန်း (3D)'}</Text>
                        <View style={styles.chip5ColContainer}>
                            {PATTERN_3D.map((num) => (
                                <View key={num} style={styles.badgeWrapper}><Text style={styles.badgeText}>{num}</Text></View>
                            ))}
                        </View>
                        <View style={[styles.alertActions, styles.modalActionMargin]}>
                            <Pressable style={[styles.btnAlt, styles.flex1]} onPress={() => setPatterns3DModalVisible(false)}><Text style={styles.btnAltText}>{t.cancel || 'ပယ်ဖျက်မည်'}</Text></Pressable>
                            <Pressable style={[styles.btnDanger, styles.btnConfirmGreen]} onPress={confirmAddPatterns3D}><Text style={styles.btnConfirmGreenText}>{t.selectPrefix || 'ရွေးချယ်မည်'} ({PATTERN_3D.length}) {t.betsCount || 'ကွက်'}</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: THEME.bg },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: s(12, 16, 24), paddingBottom: s(12, 15, 20) },

    navBtn: { width: s(36, 40, 50), height: s(36, 40, 50), borderRadius: s(18, 20, 25), backgroundColor: THEME.inputBg, justifyContent: 'center', alignItems: 'center', marginRight: s(10, 12, 16) },

    headerTitle: { color: THEME.textWhite, fontSize: s(16, 18, 24), fontWeight: 'bold' },

    switcherContainer: { flexDirection: 'row', backgroundColor: THEME.inputBg, marginHorizontal: s(12, 16, 24), borderRadius: s(8, 10, 14), padding: s(3, 4, 6), marginBottom: s(12, 15, 20) },

    switchTab: { flex: 1, paddingVertical: s(8, 10, 14), alignItems: 'center', borderRadius: s(6, 8, 12) },

    switchTabActive: { backgroundColor: THEME.neonGreen },

    switchText: { color: THEME.textMuted, fontSize: s(11, 13, 16), fontWeight: 'bold' },

    switchTextActive: { color: '#000', fontWeight: '900' },

    commandCenter: { backgroundColor: THEME.card, marginHorizontal: s(12, 16, 24), borderRadius: s(12, 16, 24), padding: s(12, 16, 24), borderWidth: 1, borderColor: THEME.border },

    proInput: { backgroundColor: THEME.bg, color: THEME.neonGreen, fontSize: s(26, 32, 42), fontWeight: '900', textAlign: 'center', borderRadius: s(10, 12, 16), height: s(50, 60, 80), borderWidth: 1, borderColor: THEME.borderActive, marginBottom: s(10, 12, 16) },

    toolbar: { flexDirection: 'row', gap: s(8, 10, 14), marginBottom: s(10, 12, 16) },

    toolBtn: { flex: 1, height: s(36, 40, 50), borderRadius: s(6, 8, 12), justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

    toolbar2D: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: s(10, 12, 16), marginBottom: s(12, 15, 20) },

    toolBtn2D: { width: '31.5%', height: s(36, 40, 50), borderRadius: s(6, 8, 12), justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

    toolBtnInactive: { backgroundColor: THEME.inputBg, borderColor: THEME.border },

    toolBtnActive: { backgroundColor: THEME.gold, borderColor: THEME.gold },

    toolText: { fontSize: s(10, 12, 14), fontWeight: 'bold' },

    toolTextLight: { color: '#FFF', fontSize: s(10, 12, 14), fontWeight: 'bold' },

    textBlack: { color: '#000' },

    textWhite: { color: '#FFF' },

    pasteActionBtn: { flexDirection: 'row', height: s(40, 45, 55), backgroundColor: '#FFFFFF', borderRadius: s(8, 10, 14), justifyContent: 'center', alignItems: 'center', marginBottom: s(12, 15, 20) },

    pasteActionText: { color: '#000', fontSize: s(13, 15, 18), fontWeight: 'bold', marginLeft: 8 },


    toolbarMarginTop: { marginTop: s(-2, -4, -6) },

    randomBtnBg: { backgroundColor: 'rgba(0, 178, 255, 0.1)', borderColor: 'rgba(0, 178, 255, 0.4)' },

    randomBtnText: { color: THEME.infoText },

    mainActionBtn: { height: s(40, 45, 55), backgroundColor: THEME.neonGreen, borderRadius: s(8, 10, 14), justifyContent: 'center', alignItems: 'center' },

    mainActionText: { color: '#000', fontSize: s(13, 15, 18), fontWeight: 'bold' },

    btnDisabled: { opacity: 0.5 },

    scrollContent: { paddingHorizontal: s(12, 16, 24), paddingBottom: s(100, 120, 160) },

    globalAmountBox: { backgroundColor: 'rgba(0, 230, 118, 0.04)', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', borderRadius: s(12, 16, 24), padding: s(12, 15, 20), marginTop: s(15, 20, 25), marginBottom: s(5, 8, 12) },

    globalAmountLabel: { color: THEME.gold, fontSize: s(11, 13, 15), fontWeight: 'bold', marginBottom: s(8, 10, 12) },

    globalAmountRow: { flexDirection: 'row', gap: s(8, 10, 12) },

    globalAmountInput: { flex: 1, height: s(40, 45, 50), backgroundColor: THEME.bg, borderRadius: s(8, 10, 12), borderWidth: 1, borderColor: THEME.border, color: THEME.textWhite, fontSize: s(14, 16, 18), fontWeight: 'bold', textAlign: 'center' },

    globalAmountBtn: { backgroundColor: THEME.neonGreen, paddingHorizontal: s(16, 20, 24), borderRadius: s(8, 10, 12), justifyContent: 'center', alignItems: 'center' },

    globalAmountBtnText: { color: '#000', fontWeight: 'bold', fontSize: s(12, 14, 16) },

    resultSection: { marginTop: s(10, 15, 20), marginBottom: s(10, 15, 20) },

    resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(10, 12, 16), borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)', paddingBottom: s(6, 8, 12) },

    sectionTitle: { color: THEME.textWhite, fontSize: s(13, 15, 18), fontWeight: 'bold' },

    sectionCount: { color: THEME.textMuted, fontSize: s(11, 13, 16), fontWeight: 'bold' },

    betRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(5, 10, 31, 0.5)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: s(12, 14, 18), padding: s(10, 12, 16), marginBottom: s(8, 10, 12) },

    betRowLeft: { flexDirection: 'row', alignItems: 'center', gap: s(10, 12, 16) },

    betBadge: { backgroundColor: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.3)', borderWidth: 1, borderRadius: s(8, 10, 12), width: s(42, 48, 56), height: s(42, 48, 56), alignItems: 'center', justifyContent: 'center' },

    betBadgeText: { color: THEME.neonGreen, fontSize: s(16, 20, 24), fontWeight: '900' },

    betWinInfo: { justifyContent: 'center' },

    betWinLabel: { color: THEME.textMuted, fontSize: s(9, 10, 12), textTransform: 'uppercase', marginBottom: s(2, 4, 6) },

    betWinValue: { color: THEME.gold, fontSize: s(12, 14, 16), fontWeight: 'bold' },

    betRowRight: { flexDirection: 'row', alignItems: 'center', gap: s(8, 10, 14) },

    amountInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.inputBg, borderWidth: 1, borderColor: THEME.border, borderRadius: s(8, 10, 12), paddingHorizontal: s(8, 10, 12), height: s(36, 40, 48), width: s(80, 100, 120) },

    amountInput: { flex: 1, color: THEME.textWhite, fontSize: s(12, 14, 16), fontWeight: 'bold', textAlign: 'right' },

    amountCurrency: { color: THEME.textMuted, fontSize: s(10, 12, 14), marginLeft: 6 },

    betDeleteBtn: { width: s(36, 40, 48), height: s(36, 40, 48), borderRadius: s(8, 10, 12), backgroundColor: 'rgba(255, 59, 48, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.3)', alignItems: 'center', justifyContent: 'center' },

    emptyText: { color: THEME.textMuted, textAlign: 'center', marginTop: s(30, 40, 60), fontSize: s(12, 14, 18) },

    noticeBox: { backgroundColor: THEME.infoBg, borderWidth: 1, borderColor: THEME.infoBorder, borderRadius: s(12, 16, 24), padding: s(12, 16, 24), marginTop: s(20, 25, 35), marginBottom: s(8, 10, 14) },

    noticeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: s(8, 10, 14), gap: s(6, 8, 12) },

    noticeTitle: { color: THEME.infoText, fontSize: s(13, 15, 18), fontWeight: 'bold' },

    noticeText: { color: THEME.textMuted, fontSize: s(12, 14, 18), lineHeight: s(18, 22, 28), fontWeight: '500' },

    marginTop10: { marginTop: 10 },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(18, 28, 56, 0.98)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingHorizontal: s(16, 20, 30), paddingTop: s(12, 16, 20) },

    bottomBarContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },

    bottomTotalBox: { flex: 1, marginRight: s(10, 15, 20) },

    bottomTotalLabel: { color: THEME.textMuted, fontSize: s(10, 12, 14), fontWeight: '600', marginBottom: s(2, 4, 6) },

    bottomTotalValue: { color: THEME.neonGreen, fontSize: s(18, 22, 28), fontWeight: '900', letterSpacing: 0.5 },

    bottomTotalCurrency: { fontSize: s(12, 14, 16), color: THEME.textWhite, fontWeight: 'normal' },

    bottomActions: { flexDirection: 'row', gap: s(10, 12, 16), alignItems: 'center' },

    clearAllBtn: { width: s(40, 48, 56), height: s(40, 48, 56), borderRadius: s(12, 14, 16), backgroundColor: 'rgba(255, 59, 48, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.3)' },

    fabBtn: { flexDirection: 'row', backgroundColor: THEME.neonGreen, paddingHorizontal: s(16, 20, 24), height: s(40, 48, 56), borderRadius: s(12, 14, 16), alignItems: 'center', gap: 6 },

    fabBtnText: { color: '#000', fontWeight: 'bold', fontSize: s(13, 15, 17) },

    alertOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },

    alertBox: { width: s('90%', '85%', '60%'), backgroundColor: THEME.card, borderRadius: s(20, 24, 32), padding: s(20, 25, 35), alignItems: 'center', borderWidth: 1, borderColor: THEME.border },

    modalBoxWide: { width: s('95%', '90%', '70%'), paddingVertical: s(20, 25, 35) },

    modalBoxExtraWide: { width: s('95%', '95%', '75%'), paddingVertical: s(20, 25, 35) },

    alertTitle: { color: '#FFF', marginBottom: s(15, 20, 25), textAlign: 'center' },

    alertTitleLarge: { fontSize: s(16, 18, 24), fontWeight: 'bold' },

    alertTitleLineHeight: { fontSize: s(14, 16, 20), lineHeight: s(20, 24, 30) },

    alertDesc: { fontSize: s(12, 14, 18), color: THEME.textMuted, marginTop: s(-8, -10, -14), marginBottom: s(15, 25, 35) },

    modalTitleGreen: { fontSize: s(16, 20, 26), marginBottom: s(10, 15, 20), color: THEME.neonGreen, fontWeight: 'bold' },

    alertNumberText: { color: THEME.gold, fontWeight: 'bold', fontSize: s(18, 20, 26) },

    alertIconMargin: { marginBottom: s(10, 15, 20) },

    alertIconCenter: { alignSelf: 'center', marginBottom: s(10, 15, 20) },

    alertActions: { flexDirection: 'row', gap: s(10, 12, 16), width: '100%' },

    modalActionMargin: { marginTop: s(15, 25, 35) },

    flex1: { flex: 1 },

    btnAlt: { backgroundColor: THEME.inputBg, paddingVertical: s(12, 14, 18), borderRadius: s(10, 12, 16), flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: THEME.border },

    btnAltText: { color: '#FFF', fontWeight: 'bold', fontSize: s(12, 14, 18) },

    btnDanger: { backgroundColor: THEME.danger, paddingVertical: s(12, 14, 18), borderRadius: s(10, 12, 16), flex: 1, alignItems: 'center', justifyContent: 'center' },

    btnConfirmGreen: { backgroundColor: THEME.neonGreen, flex: 1.2 },

    btnConfirmGreenText: { color: '#000', fontWeight: 'bold', fontSize: s(12, 14, 18) },

    grid5Col: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: s(8, 10, 14), width: '100%' },

    chip5Col: { width: '18%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: s(6, 8, 12), borderWidth: 1, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center', paddingVertical: s(10, 12, 16) },

    chip5ColText: { color: THEME.textWhite, fontSize: s(14, 16, 20), fontWeight: 'bold' },

    khwaySubText: { color: THEME.textMuted, marginBottom: 15, textAlign: 'center' },

    khwayChipActive: { backgroundColor: THEME.neonGreen, borderColor: THEME.neonGreen },

    khwayChipTextActive: { color: '#000' },

    grid10Col: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: s(6, 8, 12), width: '100%' },

    chip10Col: { width: '9.5%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: s(3, 4, 6), borderWidth: 1, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center', paddingVertical: s(6, 8, 12) },

    chip10ColText: { color: THEME.textWhite, fontSize: s(10, 12, 15), fontWeight: 'bold' },

    chip5ColContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', columnGap: '2.2%', rowGap: s(10, 14, 20) },

    badgeWrapper: { width: '18.2%', backgroundColor: 'rgba(0, 230, 118, 0.08)', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)', borderRadius: s(6, 8, 12), paddingVertical: s(8, 10, 14), alignItems: 'center', justifyContent: 'center' },

    badgeText: { color: THEME.neonGreen, fontSize: s(13, 15, 18), fontWeight: '900' },

    deleteIconBox: { position: 'absolute', top: s(-6, -8, -10), right: s(-6, -8, -10), backgroundColor: THEME.bg, borderRadius: s(10, 12, 16) },
});