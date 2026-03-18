import { useBetStore } from '@/store/useBetStore';
import { PATTERN_3D, TabType, TRIPLE_3D, useNumberStore } from '@/store/useNumberStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

interface NumberBadgeProps {
    num: string;
    onRemove: (n: string) => void;
}

const NumberBadge = ({ num, onRemove }: NumberBadgeProps) => (
    <View style={styles.badgeWrapper}>
        <Text style={styles.badgeText} numberOfLines={1} adjustsFontSizeToFit>{num}</Text>
        <Pressable onPress={() => { Vibration.vibrate(10); onRemove(num); }} style={styles.deleteIconBox}>
            <Ionicons name="close-circle" size={s(14, 18, 24)} color={THEME.danger} />
        </Pressable>
    </View>
);

export default function NumberSelectionGrid() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const numbers = useNumberStore((state) => state.numbers);
    const addComputedBets = useNumberStore((state) => state.addComputedBets);
    const addBulkBets = useNumberStore((state) => state.addBulkBets);
    const removeNumber = useNumberStore((state) => state.removeNumber);
    const clearAll = useNumberStore((state) => state.clearAll);

    const setInitialBets = useBetStore((state) => state.setInitialBets);

    const [activeTab, setActiveTab] = useState<TabType>('3D');
    const [currentInput, setCurrentInput] = useState('');

    const [is2DRActive, setIs2DRActive] = useState(false);
    const [is3DBoxActive, setIs3DBoxActive] = useState(false);

    const [showAlert, setShowAlert] = useState(false);
    const [doublesModalVisible, setDoublesModalVisible] = useState(false);
    const [brothersModalVisible, setBrothersModalVisible] = useState(false);

    const [triples3DModalVisible, setTriples3DModalVisible] = useState(false);
    const [patterns3DModalVisible, setPatterns3DModalVisible] = useState(false);

    const [deleteNum, setDeleteNum] = useState<{ tab: TabType, val: string } | null>(null);

    const [noticeText, setNoticeText] = useState<string>('');
    const [isNoticeLoading, setIsNoticeLoading] = useState<boolean>(true);

    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'confirm',
        title: '',
        message: '',
        cancelText: 'မဖျက်ပါ',
        confirmText: 'သေချာပါသည်',
        onConfirm: () => { },
    });

    const bets2D = numbers['2D'];
    const bets3D = numbers['3D'];
    const totalBetsCount = bets2D.length + bets3D.length;

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
        const fetchNoticeFromAPI = async () => {
            setIsNoticeLoading(true);
            try {
                setTimeout(() => {
                    setNoticeText(
                        "လူကြီးမင်းတို့ ရွေးချယ်ထားသော ဂဏန်းများကို စာရင်းမသွင်းမီ သေချာစွာ ထပ်မံစစ်ဆေးပေးပါရန် အထူးမေတ္တာရပ်ခံအပ်ပါသည်။ " +
                        "စာရင်းသွင်းပြီးနောက် မှားယွင်းမှုတစ်စုံတစ်ရာ ရှိပါက ကျွန်ုပ်တို့ဘက်မှ တာဝန်ယူမည်မဟုတ်ပါ။ " +
                        "ထီထွက်စဉ် ရလဒ်များကိုလည်း ကျွန်ုပ်တို့၏ Application အတွင်းရှိ Result ကဏ္ဍတွင် အချိန်နှင့်တပြေးညီ တိုက်ရိုက်ကြည့်ရှုနိုင်ပြီဖြစ်ကြောင်း အသိပေးအပ်ပါသည်။"
                    );
                    setIsNoticeLoading(false);
                }, 1000);
            } catch (error) {
                setNoticeText("အသိပေးချက် ရယူရန် အခက်အခဲရှိနေပါသည်။");
                setIsNoticeLoading(false);
            }
        };
        fetchNoticeFromAPI();
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

    const handleRemoveRequest = useCallback((tab: TabType, val: string) => {
        setDeleteNum({ tab, val });
    }, []);

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
            title: 'အကုန်ဖျက်မည်',
            message: 'ရွေးချယ်ထားသော ဂဏန်းအားလုံးကို ဖျက်မှာ သေချာပြီလား?',
            cancelText: 'မဖျက်ပါ',
            confirmText: 'ဖျက်မည်',
            onConfirm: () => {
                clearAll();
                setModalConfig(prev => ({ ...prev, visible: false }));
            }
        });
    };

    const confirmAddDoubles2D = () => {
        const doubles = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
        setDoublesModalVisible(false);
        setTimeout(() => {
            addBulkBets('2D', doubles);
        }, 100);
    };

    const confirmAddBrothers2D = () => {
        const brothers = [
            '01', '12', '23', '34', '45', '56', '67', '78', '89', '09',
            '10', '21', '32', '43', '54', '65', '76', '87', '98', '90'
        ];
        setBrothersModalVisible(false);
        setTimeout(() => {
            addBulkBets('2D', brothers);
        }, 100);
    };

    const confirmAddTriples3D = () => {
        setTriples3DModalVisible(false);
        setTimeout(() => {
            addBulkBets('3D', TRIPLE_3D);
        }, 100);
    };

    const confirmAddPatterns3D = () => {
        setPatterns3DModalVisible(false);
        setTimeout(() => {
            addBulkBets('3D', PATTERN_3D);
        }, 100);
    };

    const handleAddRandom3D = () => {
        Vibration.vibrate(20);
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        addBulkBets('3D', [randomNum]);
    };

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            <View style={[styles.header, { paddingTop: Math.max(insets.top, s(10, 15, 20)) }]}>
                <Pressable onPress={() => totalBetsCount > 0 ? setShowAlert(true) : router.back()} style={styles.navBtn}>
                    <Ionicons name="chevron-back" size={s(20, 26, 32)} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>ဂဏန်းရိုက်ထည့်ရန်</Text>
            </View>

            <View style={styles.switcherContainer}>
                <Pressable style={[styles.switchTab, activeTab === '2D' && styles.switchTabActive]} onPress={() => handleSwitchMode('2D')}>
                    <Text style={[styles.switchText, activeTab === '2D' && styles.switchTextActive]}>2D ဂဏန်း</Text>
                </Pressable>
                <Pressable style={[styles.switchTab, activeTab === '3D' && styles.switchTabActive]} onPress={() => handleSwitchMode('3D')}>
                    <Text style={[styles.switchText, activeTab === '3D' && styles.switchTextActive]}>3D ဂဏန်း</Text>
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
                    <View style={styles.toolbar}>
                        <Pressable style={[styles.toolBtn, is2DRActive ? styles.toolBtnActive : styles.toolBtnInactive]} onPress={() => setIs2DRActive(!is2DRActive)}>
                            <Text style={[styles.toolText, { color: is2DRActive ? '#000' : '#FFF' }]}>R (အပြန်)</Text>
                        </Pressable>
                        <Pressable style={[styles.toolBtn, styles.toolBtnInactive]} onPress={() => { Keyboard.dismiss(); setDoublesModalVisible(true); }}>
                            <Text style={styles.toolTextLight}>အပူး</Text>
                        </Pressable>
                        <Pressable style={[styles.toolBtn, styles.toolBtnInactive]} onPress={() => { Keyboard.dismiss(); setBrothersModalVisible(true); }}>
                            <Text style={styles.toolTextLight}>ညီအစ်ကို</Text>
                        </Pressable>
                    </View>
                )}

                {activeTab === '3D' && (
                    <View>
                        <View style={styles.toolbar}>
                            <Pressable style={[styles.toolBtn, is3DBoxActive ? styles.toolBtnActive : styles.toolBtnInactive]} onPress={() => setIs3DBoxActive(!is3DBoxActive)}>
                                <Text style={[styles.toolText, { color: is3DBoxActive ? '#000' : '#FFF' }]}>ပတ် (Box)</Text>
                            </Pressable>
                            <Pressable style={[styles.toolBtn, styles.toolBtnInactive]} onPress={() => { Keyboard.dismiss(); setTriples3DModalVisible(true); }}>
                                <Text style={styles.toolTextLight}>သုံးလုံးတူ</Text>
                            </Pressable>
                            <Pressable style={[styles.toolBtn, styles.toolBtnInactive]} onPress={() => { Keyboard.dismiss(); setPatterns3DModalVisible(true); }}>
                                <Text style={styles.toolTextLight}>စီဂဏန်း</Text>
                            </Pressable>
                        </View>
                        <View style={[styles.toolbar, { marginTop: s(-2, -4, -6) }]}>
                            <Pressable style={[styles.toolBtn, styles.toolBtnInactive, { backgroundColor: 'rgba(0, 178, 255, 0.1)', borderColor: 'rgba(0, 178, 255, 0.4)' }]} onPress={handleAddRandom3D}>
                                <Text style={[styles.toolTextLight, { color: THEME.infoText }]}>ကျပန်း</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                <Pressable
                    style={[styles.mainActionBtn, currentInput.length !== maxLen && { opacity: 0.5 }]}
                    onPress={handleAdd}
                    disabled={currentInput.length !== maxLen}
                >
                    <Text style={styles.mainActionText}>စာရင်းထဲ ပေါင်းထည့်မည်</Text>
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {totalBetsCount === 0 && <Text style={styles.emptyText}>ရွေးချယ်ထားသော ဂဏန်းမရှိသေးပါ</Text>}

                {bets2D.length > 0 && (
                    <View style={styles.resultBox}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.sectionTitle}>2D စာရင်း</Text>
                            <Text style={styles.sectionCount}>({bets2D.length} ကွက်)</Text>
                        </View>
                        <View style={styles.chip5ColContainer}>
                            {bets2D.map(num => <NumberBadge key={num} num={num} onRemove={(n) => handleRemoveRequest('2D', n)} />)}
                        </View>
                    </View>
                )}

                {bets3D.length > 0 && (
                    <View style={styles.resultBox}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.sectionTitle}>3D စာရင်း</Text>
                            <Text style={styles.sectionCount}>({bets3D.length} ကွက်)</Text>
                        </View>
                        <View style={styles.chip5ColContainer}>
                            {bets3D.map(num => <NumberBadge key={num} num={num} onRemove={(n) => handleRemoveRequest('3D', n)} />)}
                        </View>
                    </View>
                )}

                <View style={styles.noticeBox}>
                    <View style={styles.noticeHeader}>
                        <Ionicons name="megaphone" size={s(14, 18, 24)} color={THEME.infoText} />
                        <Text style={styles.noticeTitle}>အသိပေးချက်</Text>
                    </View>
                    {isNoticeLoading ? (
                        <ActivityIndicator size="small" color={THEME.infoText} style={{ marginTop: 10 }} />
                    ) : (
                        <Text style={styles.noticeText}>{noticeText}</Text>
                    )}
                </View>

            </ScrollView>

            {totalBetsCount > 0 && (
                <View style={[styles.bottomBar, { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, s(10, 15, 20)) : s(10, 15, 20) }]}>

                    <Pressable style={styles.clearAllBtn} onPress={confirmClearAll}>
                        <Ionicons name="trash" size={s(18, 22, 28)} color={THEME.danger} />
                    </Pressable>

                    <Text style={styles.totalText}>စုစုပေါင်း {totalBetsCount} ကွက်</Text>

                    <Pressable style={styles.fabBtn} onPress={() => {
                        setInitialBets([...numbers['2D'], ...numbers['3D']]);
                        router.push('/wallet-profile/number-play/select');
                    }}>
                        <Text style={styles.fabBtnText}>ဆက်သွားမည်</Text>
                    </Pressable>
                </View>
            )}

            <Modal visible={showAlert} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={styles.alertBox}>
                        <Ionicons name="warning" size={s(40, 48, 60)} color={THEME.danger} style={{ marginBottom: s(10, 15, 20) }} />
                        <Text style={[styles.alertTitle, { fontSize: s(16, 18, 24), fontWeight: 'bold' }]}>နောက်သို့ ပြန်ထွက်မည်လား?</Text>
                        <Text style={[styles.alertTitle, { fontSize: s(12, 14, 18), color: THEME.textMuted, marginTop: s(-8, -10, -14), marginBottom: s(15, 25, 35) }]}>ယခုထွက်လိုက်ပါက ရွေးချယ်ထားသော ဂဏန်းများအားလုံး ပျက်ပြယ်သွားပါမည်။</Text>

                        <View style={styles.alertActions}>
                            <Pressable style={styles.btnAlt} onPress={() => setShowAlert(false)}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>မထွက်ပါ</Text>
                            </Pressable>
                            <Pressable style={styles.btnDanger} onPress={() => { setShowAlert(false); clearAll(); router.back(); }}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>ထွက်မည်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={modalConfig.visible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={styles.alertBox}>
                        <Ionicons name="warning" size={s(36, 42, 54)} color={THEME.danger} style={{ alignSelf: 'center', marginBottom: s(10, 15, 20) }} />
                        <Text style={[styles.alertTitle, { fontSize: s(16, 18, 24), fontWeight: 'bold' }]}>{modalConfig.title}</Text>
                        <Text style={[styles.alertTitle, { fontSize: s(12, 14, 18), color: THEME.textMuted, marginTop: s(-8, -10, -14), marginBottom: s(15, 25, 35) }]}>{modalConfig.message}</Text>
                        <View style={styles.alertActions}>
                            {modalConfig.cancelText !== '' && (
                                <Pressable style={styles.btnAlt} onPress={() => setModalConfig(prev => ({ ...prev, visible: false }))}>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>{modalConfig.cancelText}</Text>
                                </Pressable>
                            )}
                            <Pressable style={styles.btnDanger} onPress={modalConfig.onConfirm}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>{modalConfig.confirmText}</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={!!deleteNum} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={styles.alertBox}>
                        <Ionicons name="trash-bin" size={s(36, 42, 54)} color={THEME.danger} style={{ marginBottom: s(10, 15, 20) }} />
                        <Text style={[styles.alertTitle, { fontSize: s(14, 16, 20), lineHeight: s(20, 24, 30) }]}>
                            ဂဏန်း ( <Text style={{ color: THEME.gold, fontWeight: 'bold', fontSize: s(18, 20, 26) }}>{deleteNum?.val}</Text> ) ကို{'\n'}ဖျက်မှာ သေချာပြီလား?
                        </Text>
                        <View style={styles.alertActions}>
                            <Pressable style={styles.btnAlt} onPress={() => setDeleteNum(null)}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>မဖျက်ပါ</Text>
                            </Pressable>
                            <Pressable style={styles.btnDanger} onPress={confirmRemove}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>ဖျက်မည်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 2D Modals */}
            <Modal visible={doublesModalVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, { width: s('95%', '90%', '70%'), paddingVertical: s(20, 25, 35) }]}>
                        <Text style={[styles.alertTitle, { fontSize: s(16, 20, 26), marginBottom: s(10, 15, 20), color: THEME.neonGreen, fontWeight: 'bold' }]}>အပူး (2D)</Text>
                        <View style={styles.grid5Col}>
                            {['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'].map((num) => (
                                <View key={num} style={styles.chip5Col}><Text style={styles.chip5ColText}>{num}</Text></View>
                            ))}
                        </View>
                        <View style={[styles.alertActions, { marginTop: s(15, 25, 35) }]}>
                            <Pressable style={[styles.btnAlt, { flex: 1 }]} onPress={() => setDoublesModalVisible(false)}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>ပယ်ဖျက်မည်</Text></Pressable>
                            <Pressable style={[styles.btnDanger, { backgroundColor: THEME.neonGreen, flex: 1.2 }]} onPress={confirmAddDoubles2D}><Text style={{ color: '#000', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>ရွေးချယ်ပါမည် (၁၀) ကွက်</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={brothersModalVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, { width: s('95%', '95%', '75%'), paddingVertical: s(20, 25, 35) }]}>
                        <Text style={[styles.alertTitle, { fontSize: s(16, 20, 26), marginBottom: s(10, 15, 20), color: THEME.neonGreen, fontWeight: 'bold' }]}>ညီအစ်ကို (2D)</Text>
                        <View style={styles.grid10Col}>
                            {['01', '12', '23', '34', '45', '56', '67', '78', '89', '09'].map((num) => (
                                <View key={num} style={styles.chip10Col}><Text style={styles.chip10ColText}>{num}</Text></View>
                            ))}
                            {['10', '21', '32', '43', '54', '65', '76', '87', '98', '90'].map((num) => (
                                <View key={num} style={styles.chip10Col}><Text style={styles.chip10ColText}>{num}</Text></View>
                            ))}
                        </View>
                        <View style={[styles.alertActions, { marginTop: s(15, 25, 35) }]}>
                            <Pressable style={[styles.btnAlt, { flex: 1 }]} onPress={() => setBrothersModalVisible(false)}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>ပယ်ဖျက်မည်</Text></Pressable>
                            <Pressable style={[styles.btnDanger, { backgroundColor: THEME.neonGreen, flex: 1.2 }]} onPress={confirmAddBrothers2D}><Text style={{ color: '#000', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>ရွေးချယ်ပါမည် (၂၀) ကွက်</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={triples3DModalVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, { width: s('95%', '90%', '70%'), paddingVertical: s(20, 25, 35) }]}>
                        <Text style={[styles.alertTitle, { fontSize: s(16, 20, 26), marginBottom: s(10, 15, 20), color: THEME.neonGreen, fontWeight: 'bold' }]}>သုံးလုံးတူ (3D)</Text>
                        <View style={styles.grid5Col}>
                            {TRIPLE_3D.map((num) => (
                                <View key={num} style={styles.chip5Col}><Text style={styles.chip5ColText}>{num}</Text></View>
                            ))}
                        </View>
                        <View style={[styles.alertActions, { marginTop: s(15, 25, 35) }]}>
                            <Pressable style={[styles.btnAlt, { flex: 1 }]} onPress={() => setTriples3DModalVisible(false)}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>ပယ်ဖျက်မည်</Text></Pressable>
                            <Pressable style={[styles.btnDanger, { backgroundColor: THEME.neonGreen, flex: 1.2 }]} onPress={confirmAddTriples3D}><Text style={{ color: '#000', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>ရွေးချယ်မည် ({TRIPLE_3D.length}) ကွက်</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={patterns3DModalVisible} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={[styles.alertBox, { width: s('95%', '95%', '75%'), paddingVertical: s(20, 25, 35) }]}>
                        <Text style={[styles.alertTitle, { fontSize: s(16, 20, 26), marginBottom: s(10, 15, 20), color: THEME.neonGreen, fontWeight: 'bold' }]}>စီဂဏန်း (3D)</Text>
                        <View style={styles.chip5ColContainer}>
                            {PATTERN_3D.map((num) => (
                                <View key={num} style={styles.badgeWrapper}><Text style={styles.badgeText}>{num}</Text></View>
                            ))}
                        </View>
                        <View style={[styles.alertActions, { marginTop: s(15, 25, 35) }]}>
                            <Pressable style={[styles.btnAlt, { flex: 1 }]} onPress={() => setPatterns3DModalVisible(false)}><Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>ပယ်ဖျက်မည်</Text></Pressable>
                            <Pressable style={[styles.btnDanger, { backgroundColor: THEME.neonGreen, flex: 1.2 }]} onPress={confirmAddPatterns3D}><Text style={{ color: '#000', fontWeight: 'bold', fontSize: s(12, 14, 18) }}>ရွေးချယ်မည် ({PATTERN_3D.length}) ကွက်</Text></Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: THEME.bg
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(12, 16, 24),
        paddingBottom: s(12, 15, 20)
    },
    navBtn: {
        width: s(36, 40, 50),
        height: s(36, 40, 50),
        borderRadius: s(18, 20, 25),
        backgroundColor: THEME.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(10, 12, 16)
    },
    headerTitle: {
        color: THEME.textWhite,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold'
    },

    switcherContainer: {
        flexDirection: 'row',
        backgroundColor: THEME.inputBg,
        marginHorizontal: s(12, 16, 24),
        borderRadius: s(8, 10, 14),
        padding: s(3, 4, 6),
        marginBottom: s(12, 15, 20)
    },
    switchTab: {
        flex: 1,
        paddingVertical: s(8, 10, 14),
        alignItems: 'center',
        borderRadius: s(6, 8, 12)
    },
    switchTabActive: {
        backgroundColor: THEME.neonGreen
    },
    switchText: {
        color: THEME.textMuted,
        fontSize: s(11, 13, 16),
        fontWeight: 'bold'
    },
    switchTextActive: {
        color: '#000',
        fontWeight: '900'
    },

    commandCenter: {
        backgroundColor: THEME.card,
        marginHorizontal: s(12, 16, 24),
        borderRadius: s(12, 16, 24),
        padding: s(12, 16, 24),
        borderWidth: 1,
        borderColor: THEME.border
    },
    proInput: {
        backgroundColor: THEME.bg,
        color: THEME.neonGreen,
        fontSize: s(26, 32, 42),
        fontWeight: '900',
        textAlign: 'center',
        borderRadius: s(10, 12, 16),
        height: s(50, 60, 80),
        borderWidth: 1,
        borderColor: THEME.borderActive,
        marginBottom: s(10, 12, 16)
    },

    toolbar: {
        flexDirection: 'row',
        gap: s(8, 10, 14),
        marginBottom: s(10, 12, 16)
    },
    toolBtn: {
        flex: 1,
        height: s(36, 40, 50),
        borderRadius: s(6, 8, 12),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1
    },
    toolBtnInactive: {
        backgroundColor: THEME.inputBg,
        borderColor: THEME.border
    },
    toolBtnActive: {
        backgroundColor: THEME.gold,
        borderColor: THEME.gold
    },
    toolText: {
        fontSize: s(10, 12, 15),
        fontWeight: 'bold'
    },
    toolTextLight: {
        color: '#FFF',
        fontSize: s(10, 12, 15),
        fontWeight: 'bold'
    },

    mainActionBtn: {
        height: s(40, 45, 55),
        backgroundColor: THEME.neonGreen,
        borderRadius: s(8, 10, 14),
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainActionText: {
        color: '#000',
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },

    scrollContent: {
        paddingHorizontal: s(12, 16, 24),
        paddingBottom: s(100, 120, 160)
    },
    resultBox: {
        backgroundColor: 'rgba(0, 230, 118, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.2)',
        borderRadius: s(12, 16, 24),
        padding: s(10, 12, 16),
        marginTop: s(12, 15, 20),
        marginBottom: s(4, 5, 8)
    },
    resultHeader: {

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: s(10, 12, 16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 230, 118, 0.1)',
        paddingBottom: s(6, 8, 12)
    },
    sectionTitle: {
        color: THEME.gold,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },
    sectionCount: {
        color: THEME.textMuted,
        fontSize: s(11, 13, 16),
        fontWeight: 'bold'
    },
    chip5ColContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        columnGap: '2.2%',
        rowGap: s(10, 14, 20)
    },
    badgeWrapper: {
        width: '18.2%',
        backgroundColor: 'rgba(0, 230, 118, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.3)',
        borderRadius: s(6, 8, 12),
        paddingVertical: s(8, 10, 14),
        alignItems: 'center',
        justifyContent: 'center'
    },
    badgeText: {
        color: THEME.neonGreen,
        fontSize: s(13, 15, 18),
        fontWeight: '900'
    },
    deleteIconBox: {
        position: 'absolute',
        top: s(-6, -8, -10),
        right: s(-6, -8, -10),
        backgroundColor: THEME.bg,
        borderRadius: s(10, 12, 16)
    },

    emptyText: {
        color: THEME.textMuted,
        textAlign: 'center',
        marginTop: s(30, 40, 60),
        fontSize: s(12, 14, 18)
    },

    noticeBox: {
        backgroundColor: THEME.infoBg,
        borderWidth: 1,
        borderColor: THEME.infoBorder,
        borderRadius: s(12, 16, 24),
        padding: s(12, 16, 24),
        marginTop: s(20, 25, 35),
        marginBottom: s(8, 10, 14)
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: s(8, 10, 14),
        gap: s(6, 8, 12)
    },
    noticeTitle: {
        color: THEME.infoText,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },
    noticeText: {
        color: THEME.textMuted,
        fontSize: s(12, 14, 18),
        lineHeight: s(18, 22, 28),
        fontWeight: '500'
    },

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(18, 28, 56, 0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(16, 20, 30),
        paddingTop: s(10, 12, 16),
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)'
    },
    clearAllBtn: {
        width: s(38, 44, 54),
        height: s(38, 44, 54),
        borderRadius: s(10, 12, 16),
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(10, 12, 16),
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)'
    },
    totalText: {
        flex: 1,
        color: THEME.neonGreen,
        fontSize: s(14, 16, 20),
        fontWeight: 'bold'
    },
    fabBtn: {
        backgroundColor: THEME.neonGreen,
        paddingHorizontal: s(16, 20, 28),
        paddingVertical: s(10, 12, 16),
        borderRadius: s(8, 10, 14)
    },
    fabBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: s(12, 14, 16)
    },

    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    alertBox: {
        width: s('90%', '85%', '60%'),
        backgroundColor: THEME.card,
        borderRadius: s(20, 24, 32),
        padding: s(20, 25, 35),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.border
    },
    alertTitle: {
        color: '#FFF',
        marginBottom: s(15, 20, 25),
        textAlign: 'center'
    },
    alertActions: {
        flexDirection: 'row',
        gap: s(10, 12, 16),
        width: '100%'
    },
    btnAlt: {
        backgroundColor: THEME.inputBg,
        paddingVertical: s(12, 14, 18),
        borderRadius: s(10, 12, 16),
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: THEME.border
    },
    btnDanger: {
        backgroundColor: THEME.danger,
        paddingVertical: s(12, 14, 18),
        borderRadius: s(10, 12, 16),
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    grid5Col: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: s(8, 10, 14),
        width: '100%'
    },
    chip5Col: {
        width: '18%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: s(6, 8, 12),
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: s(10, 12, 16)
    },
    chip5ColText: {
        color: THEME.textWhite,
        fontSize: s(14, 16, 20),
        fontWeight: 'bold'
    },

    grid10Col: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: s(6, 8, 12),
        width: '100%'
    },
    chip10Col: {
        width: '9.5%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: s(3, 4, 6),
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: s(6, 8, 12)
    },
    chip10ColText: {
        color: THEME.textWhite,
        fontSize: s(10, 12, 15),
        fontWeight: 'bold'
    },
});