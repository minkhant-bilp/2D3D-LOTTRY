import { TabType, useNumberStore } from '@/store/useNumberStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    BackHandler,
    Dimensions,
    Keyboard,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
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
    gold: '#FFD700',
    danger: '#FF3B30',
    infoBg: 'rgba(0, 178, 255, 0.08)',
    infoBorder: 'rgba(0, 178, 255, 0.3)',
    infoText: '#00B2FF',
};

const PLAY_OPTIONS = {
    '3D': [
        { id: 'top3', label: 'အပေါ် ၃ လုံး' },
        { id: 'tod3', label: 'တွတ် ၃ လုံး' },
        { id: 'rev3', label: 'အပြန်' },
    ],
    '2D': [
        { id: 'top2', label: 'အပေါ် ၂ လုံး' },
        { id: 'bot2', label: 'အောက် ၂ လုံး' },
        { id: 'rev2', label: 'အပြန် ၂ လုံး' },
        { id: '19num', label: '၁၉ လုံး' },
        { id: 'double', label: 'နှစ်ထပ်ကိန်း' },
        { id: 'head', label: 'ထိပ်စည်း' },
        { id: 'tail', label: 'နောက်ပိတ်' },
        { id: 'low', label: 'အနိမ့်' },
        { id: 'high', label: 'အမြင့်' },
        { id: 'even', label: 'စုံ' },
        { id: 'odd', label: 'မ' },
    ],
    '1D': [
        { id: 'run_top', label: 'အပေါ်ပြေး' },
        { id: 'run_bot', label: 'အောက်ပြေး' },
    ],
};

const getUniquePermutations = (str: string) => {
    if (str.length === 2) return Array.from(new Set([str, str[1] + str[0]]));
    if (str.length === 3) {
        const [a, b, c] = str.split('');
        return Array.from(
            new Set([
                a + b + c, a + c + b, b + a + c,
                b + c + a, c + a + b, c + b + a,
            ])
        );
    }
    return [str];
};

const generate19Num = (digit: string) => {
    const nums = new Set<string>();
    for (let i = 0; i <= 9; i++) {
        nums.add(`${digit}${i}`);
        nums.add(`${i}${digit}`);
    }
    return Array.from(nums).sort();
};

const generateHeadNum = (digit: string) => {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(i => `${digit}${i}`);
};

const generateTailNum = (digit: string) => {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(i => `${i}${digit}`);
};

const generateLowNums = () => {
    return Array.from({ length: 50 }, (_, i) => i.toString().padStart(2, '0'));
};

const generateHighNums = () => {
    return Array.from({ length: 50 }, (_, i) => (i + 50).toString().padStart(2, '0'));
};

const generateEvenNums = () => {
    return Array.from({ length: 50 }, (_, i) => (i * 2).toString().padStart(2, '0'));
};

const generateOddNums = () => {
    return Array.from({ length: 50 }, (_, i) => (i * 2 + 1).toString().padStart(2, '0'));
};

export default function NumberPlayScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { title = 'ထီထိုးမည်', country = 'MM' } = useLocalSearchParams<{ title: string; country: string }>();

    const [activeTab, setActiveTab] = useState<TabType>('3D');
    const [inputNumber, setInputNumber] = useState('');

    const [nineteenModalVisible, setNineteenModalVisible] = useState(false);
    const [selected19Digit, setSelected19Digit] = useState<string | null>(null);

    const [doubleModalVisible, setDoubleModalVisible] = useState(false);
    const [headModalVisible, setHeadModalVisible] = useState(false);
    const [selectedHeadDigit, setSelectedHeadDigit] = useState<string | null>(null);
    const [tailModalVisible, setTailModalVisible] = useState(false);
    const [selectedTailDigit, setSelectedTailDigit] = useState<string | null>(null);
    const [lowModalVisible, setLowModalVisible] = useState(false);
    const [highModalVisible, setHighModalVisible] = useState(false);
    const [evenModalVisible, setEvenModalVisible] = useState(false);
    const [oddModalVisible, setOddModalVisible] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        visible: false,
        type: 'confirm',
        title: '',
        message: '',
        cancelText: 'မဖျက်ပါ',
        confirmText: 'သေချာပါသည်',
        onConfirm: () => { },
    });

    const { numbers, modes, addNumber, removeNumber, toggleMode, clearAll } = useNumberStore();

    const hasAnyNumber = numbers['3D'].length > 0 || numbers['2D'].length > 0 || numbers['1D'].length > 0;

    useEffect(() => {
        if (modes['3D'].length === 0) toggleMode('3D', 'top3');
    }, [modes, toggleMode]);

    useEffect(() => {
        const onBackPress = () => {
            if (hasAnyNumber) {
                handleBackPress();
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => backHandler.remove();
    }, [hasAnyNumber]);

    const showErrorAlert = (title: string, message: string) => {
        Keyboard.dismiss();
        setModalConfig({
            visible: true,
            type: 'error',
            title,
            message,
            cancelText: '',
            confirmText: 'သိပါပြီ',
            onConfirm: () => setModalConfig(prev => ({ ...prev, visible: false })),
        });
    };

    const handleBackPress = () => {
        if (hasAnyNumber) {
            Keyboard.dismiss();
            setModalConfig({
                visible: true,
                type: 'confirm',
                title: 'အနောက်သို့ ဆုတ်မည်',
                message: 'ယခု ထွက်မည်ဆိုပါက ရွေးချယ်ထားသော ဂဏန်းများအားလုံး ပျက်သွားပါမည်။ သေချာပါသလား?',
                cancelText: 'မထွက်ပါ',
                confirmText: 'ထွက်မည်',
                onConfirm: () => {
                    setModalConfig(prev => ({ ...prev, visible: false }));
                    clearAll();
                    router.back();
                }
            });
        } else {
            router.back();
        }
    };

    const handleNumberInput = (text: string) => {
        const cleanedText = text.replace(/[^0-9]/g, '');
        let activeModes = modes[activeTab];

        if (activeTab === '3D') {
            if (activeModes.length === 0) {
                showErrorAlert('ထိုးနည်း ရွေးချယ်ပါ', 'ဂဏန်းမရိုက်ထည့်မီ "အပေါ် ၃ လုံး"၊ "တွတ် ၃ လုံး" (သို့) "အပြန်" ကို အရင်ရွေးချယ်ပေးပါ။');
                return;
            }
        }
        else if (activeTab === '2D') {
            const hasPrimary2D = activeModes.includes('top2') || activeModes.includes('bot2') || activeModes.includes('rev2');
            if (!hasPrimary2D) {
                showErrorAlert('အဓိက ထိုးနည်း ရွေးချယ်ပါ', 'ဂဏန်းမရိုက်ထည့်မီ "အပေါ် ၂ လုံး"၊ "အောက် ၂ လုံး" (သို့) "အပြန် ၂ လုံး" ကို အရင်ရွေးချယ်ပေးပါ။');
                return;
            }
        }
        else if (activeTab === '1D') {
            if (activeModes.length === 0) {
                showErrorAlert('ထိုးနည်း ရွေးချယ်ပါ', 'ဂဏန်းမရိုက်ထည့်မီ "အပေါ်ပြေး" (သို့) "အောက်ပြေး" ကို အရင်ရွေးချယ်ပေးပါ။');
                return;
            }
        }

        const requiredLength = activeTab === '3D' ? 3 : activeTab === '2D' ? 2 : 1;

        if (cleanedText.length === requiredLength) {
            const primaryModes = activeModes.filter(m => m !== 'rev3' && m !== 'rev2');
            const hasRev = activeModes.includes('rev3') || activeModes.includes('rev2');

            primaryModes.forEach(modeId => {
                if (hasRev && (modeId === 'top3' || modeId === 'top2' || modeId === 'bot2')) {
                    const perms = getUniquePermutations(cleanedText).filter(n => n !== cleanedText);
                    perms.forEach(p => addNumber(activeTab, `${modeId}_${p}`));
                } else {
                    addNumber(activeTab, `${modeId}_${cleanedText}`);
                }
            });

            setInputNumber('');
        } else {
            setInputNumber(cleanedText);
        }
    };

    const handleNineteenConfirm = () => {
        if (!selected19Digit) return;
        let activeModes = modes['2D'];
        const primaryModes = activeModes.filter(m => m === 'top2' || m === 'bot2');
        const generatedNums = generate19Num(selected19Digit);
        primaryModes.forEach(modeId => {
            generatedNums.forEach(n => addNumber('2D', `${modeId}_${n}`));
        });
        setNineteenModalVisible(false);
        setSelected19Digit(null);
    };

    const handleDoubleConfirm = () => {
        let activeModes = modes['2D'];
        const primaryModes = activeModes.filter(m => m === 'top2' || m === 'bot2');
        const doubles = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
        primaryModes.forEach(modeId => {
            doubles.forEach(num => addNumber('2D', `${modeId}_${num}`));
        });
        setDoubleModalVisible(false);
    };

    const handleHeadConfirm = () => {
        if (!selectedHeadDigit) return;
        let activeModes = modes['2D'];
        const primaryModes = activeModes.filter(m => m === 'top2' || m === 'bot2');
        const generatedNums = generateHeadNum(selectedHeadDigit);
        primaryModes.forEach(modeId => {
            generatedNums.forEach(n => addNumber('2D', `${modeId}_${n}`));
        });
        setHeadModalVisible(false);
        setSelectedHeadDigit(null);
    };

    const handleTailConfirm = () => {
        if (!selectedTailDigit) return;
        let activeModes = modes['2D'];
        const primaryModes = activeModes.filter(m => m === 'top2' || m === 'bot2');
        const generatedNums = generateTailNum(selectedTailDigit);
        primaryModes.forEach(modeId => {
            generatedNums.forEach(n => addNumber('2D', `${modeId}_${n}`));
        });
        setTailModalVisible(false);
        setSelectedTailDigit(null);
    };

    const handleLowConfirm = () => {
        let activeModes = modes['2D'];
        const primaryModes = activeModes.filter(m => m === 'top2' || m === 'bot2');
        const nums = generateLowNums();
        primaryModes.forEach(modeId => {
            nums.forEach(num => addNumber('2D', `${modeId}_${num}`));
        });
        setLowModalVisible(false);
    };

    const handleHighConfirm = () => {
        let activeModes = modes['2D'];
        const primaryModes = activeModes.filter(m => m === 'top2' || m === 'bot2');
        const nums = generateHighNums();
        primaryModes.forEach(modeId => {
            nums.forEach(num => addNumber('2D', `${modeId}_${num}`));
        });
        setHighModalVisible(false);
    };

    const handleEvenConfirm = () => {
        let activeModes = modes['2D'];
        const primaryModes = activeModes.filter(m => m === 'top2' || m === 'bot2');
        const nums = generateEvenNums();
        primaryModes.forEach(modeId => {
            nums.forEach(num => addNumber('2D', `${modeId}_${num}`));
        });
        setEvenModalVisible(false);
    };

    const handleOddConfirm = () => {
        let activeModes = modes['2D'];
        const primaryModes = activeModes.filter(m => m === 'top2' || m === 'bot2');
        const nums = generateOddNums();
        primaryModes.forEach(modeId => {
            nums.forEach(num => addNumber('2D', `${modeId}_${num}`));
        });
        setOddModalVisible(false);
    };

    const handleModePress = (tab: TabType, modeId: string) => {
        const currentModes = modes[tab] || [];

        if (tab === '3D') {
            const isTop3 = currentModes.includes('top3');
            const isTod3 = currentModes.includes('tod3');
            const isRev3 = currentModes.includes('rev3');

            if (modeId === 'top3') {
                toggleMode(tab, 'top3');
                if (!isTop3 && isTod3) toggleMode(tab, 'tod3');
                else if (isTop3 && isRev3) toggleMode(tab, 'rev3');
            } else if (modeId === 'tod3') {
                toggleMode(tab, 'tod3');
                if (!isTod3) {
                    if (isTop3) toggleMode(tab, 'top3');
                    if (isRev3) toggleMode(tab, 'rev3');
                }
            } else if (modeId === 'rev3') {
                toggleMode(tab, 'rev3');
                if (!isRev3) {
                    if (!isTop3) toggleMode(tab, 'top3');
                    if (isTod3) toggleMode(tab, 'tod3');
                }
            }
        }
        else if (tab === '2D') {
            if (['19num', 'double', 'head', 'tail', 'low', 'high', 'even', 'odd'].includes(modeId)) {
                const hasTopOrBot = currentModes.includes('top2') || currentModes.includes('bot2');

                if (!hasTopOrBot) {
                    let title = '';
                    if (modeId === '19num') title = '၁၉ လုံး';
                    if (modeId === 'double') title = 'နှစ်ထပ်ကိန်း';
                    if (modeId === 'head') title = 'ထိပ်စည်း';
                    if (modeId === 'tail') title = 'နောက်ပိတ်';
                    if (modeId === 'low') title = 'အနိမ့်';
                    if (modeId === 'high') title = 'အမြင့်';
                    if (modeId === 'even') title = 'စုံ';
                    if (modeId === 'odd') title = 'မ';

                    showErrorAlert('အဓိက ထိုးနည်း ရွေးချယ်ပါ', `${title} မရွေးချယ်မီ "အပေါ် ၂ လုံး" (သို့) "အောက် ၂ လုံး" ကို အရင်ရွေးချယ်ပေးပါ။\n(အပြန် ၂ လုံးဖြင့်တွဲ၍ လက်မခံပါ)`);
                    return;
                } else {
                    Keyboard.dismiss();
                    if (modeId === '19num') {
                        setSelected19Digit(null);
                        setNineteenModalVisible(true);
                    } else if (modeId === 'double') {
                        setDoubleModalVisible(true);
                    } else if (modeId === 'head') {
                        setSelectedHeadDigit(null);
                        setHeadModalVisible(true);
                    } else if (modeId === 'tail') {
                        setSelectedTailDigit(null);
                        setTailModalVisible(true);
                    } else if (modeId === 'low') {
                        setLowModalVisible(true);
                    } else if (modeId === 'high') {
                        setHighModalVisible(true);
                    } else if (modeId === 'even') {
                        setEvenModalVisible(true);
                    } else if (modeId === 'odd') {
                        setOddModalVisible(true);
                    }
                    return;
                }
            }

            toggleMode(tab, modeId);
        }
        else {
            toggleMode(tab, modeId);
        }
    };

    const confirmDeleteNumber = (tab: TabType, itemKey: string, displayNum: string) => {
        setModalConfig({
            visible: true,
            type: 'confirm',
            title: 'ဂဏန်းဖျက်မည်',
            message: `ထိုးဂဏန်း ( ${displayNum} ) ကို ဖျက်မှာ သေချာလား?`,
            cancelText: 'မဖျက်ပါ',
            confirmText: 'သေချာပါသည်',
            onConfirm: () => {
                removeNumber(tab, itemKey);
                setModalConfig(prev => ({ ...prev, visible: false }));
            }
        });
    };

    const handleClearAll = () => {
        setModalConfig({
            visible: true,
            type: 'confirm',
            title: 'စာရင်းအားလုံးဖျက်မည်',
            message: 'ရွေးချယ်ထားသော ဂဏန်းအားလုံးကို ဖျက်မှာ သေချာလား?',
            cancelText: 'မဖျက်ပါ',
            confirmText: 'သေချာပါသည်',
            onConfirm: () => {
                setInputNumber('');
                clearAll();
                Keyboard.dismiss();
                setModalConfig(prev => ({ ...prev, visible: false }));
            }
        });
    };

    const renderCompactPreview = () => {
        if (!hasAnyNumber) return null;
        const tabs: TabType[] = ['3D', '2D', '1D'];

        return (
            <View style={[styles.sectionContainer, styles.previewBox]}>
                <View style={styles.previewHeader}>
                    <Text style={styles.previewTitle}>ရွေးချယ်ထားသော စာရင်း</Text>
                </View>

                {tabs.map((tab) => {
                    if (numbers[tab].length === 0) return null;

                    const groupedNums: Record<string, string[]> = {};

                    numbers[tab].forEach(item => {
                        const lastIdx = item.lastIndexOf('_');
                        if (lastIdx > 0) {
                            const modeId = item.substring(0, lastIdx);
                            const num = item.substring(lastIdx + 1);

                            if (modeId !== 'rev2' && modeId !== 'rev3') {
                                if (!groupedNums[modeId]) groupedNums[modeId] = [];
                                if (!groupedNums[modeId].includes(num)) {
                                    groupedNums[modeId].push(num);
                                }
                            }
                        }
                    });

                    return Object.keys(groupedNums).map(modeId => {
                        const nums = groupedNums[modeId];
                        const modeLabel = PLAY_OPTIONS[tab].find(o => o.id === modeId)?.label || modeId;

                        if (nums.length === 0) return null;

                        return (
                            <View key={`${tab}-${modeId}`} style={styles.groupContainer}>
                                <Text style={styles.groupTitle}>{modeLabel}:</Text>
                                <View style={styles.compactListWrapper}>
                                    {nums.map((n) => {
                                        const itemKey = `${modeId}_${n}`;
                                        return (
                                            <Pressable
                                                key={itemKey}
                                                style={styles.compactBadge}
                                                onPress={() => confirmDeleteNumber(tab, itemKey, n)}
                                            >
                                                <Text style={styles.compactBadgeText}>{n}</Text>
                                                <Ionicons name="close" size={s(12, 14, 18)} color={THEME.danger} style={{ marginLeft: s(4, 6, 8) }} />
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        );
                    });
                })}
            </View>
        );
    };

    const renderRules = () => {
        return (
            <View style={[styles.sectionContainer, styles.rulesBox]}>
                <View style={styles.rulesHeader}>
                    <Ionicons name="information-circle" size={s(16, 18, 22)} color={THEME.infoText} />
                    <Text style={styles.rulesTitle}>သတိပြုရန် အချက်များ:</Text>
                </View>
                <View style={styles.ruleItem}>
                    <View style={styles.ruleDot} />
                    <Text style={styles.ruleText}>အနည်းဆုံး တစ်ကြိမ်လျှင် <Text style={styles.highlightText}>၁၀၀ ကျပ်</Text> မှစတင်၍ ထိုးနိုင်ပါသည်။</Text>
                </View>
                <View style={styles.ruleItem}>
                    <View style={styles.ruleDot} />
                    <Text style={styles.ruleText}>တစ်ကြိမ်ထိုးလျှင် အများဆုံး <Text style={styles.highlightText}>၅၀,၀၀၀ ကျပ်</Text> အထိသာ ထိုးနိုင်ပါသည်။</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Modal visible={modalConfig.visible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Ionicons
                            name={modalConfig.type === 'error' ? 'alert-circle' : 'warning'}
                            size={s(36, 40, 50)}
                            color={modalConfig.type === 'error' ? THEME.gold : THEME.danger}
                            style={{ alignSelf: 'center', marginBottom: s(10, 12, 16) }}
                        />
                        <Text style={styles.modalTitle}>{modalConfig.title}</Text>
                        <Text style={styles.modalMessage}>{modalConfig.message}</Text>

                        <View style={styles.modalActions}>
                            {modalConfig.type === 'confirm' && (
                                <Pressable
                                    style={styles.modalCancelBtn}
                                    onPress={() => setModalConfig(prev => ({ ...prev, visible: false }))}
                                >
                                    <Text style={styles.modalCancelText}>{modalConfig.cancelText}</Text>
                                </Pressable>
                            )}

                            <Pressable
                                style={[
                                    styles.modalConfirmBtn,
                                    modalConfig.type === 'error' && { backgroundColor: THEME.neonGreen }
                                ]}
                                onPress={modalConfig.onConfirm}
                            >
                                <Text style={[
                                    styles.modalConfirmText,
                                    modalConfig.type === 'error' && { color: '#000' }
                                ]}>
                                    {modalConfig.confirmText}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={nineteenModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { width: '95%', paddingVertical: s(15, 20, 30) }]}>
                        <Text style={[styles.modalTitle, { fontSize: s(18, 22, 28), marginBottom: s(4, 5, 8) }]}>၁၉ လုံး</Text>
                        <Text style={styles.modalSubtitle}>ပတ်မည့် ဂဏန်းကို ရွေးချယ်ပါ</Text>

                        <View style={styles.grid5Col}>
                            {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => {
                                const isActive = selected19Digit === num;
                                return (
                                    <Pressable
                                        key={num}
                                        style={[
                                            styles.chip5Col,
                                            isActive && { backgroundColor: THEME.neonGreen, borderColor: THEME.neonGreen }
                                        ]}
                                        onPress={() => setSelected19Digit(num)}
                                    >
                                        <Text style={[styles.chip5ColText, isActive && { color: '#000' }]}>{num}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {selected19Digit && (
                            <View>
                                <View style={styles.modalDivider} />
                                <Text style={{ color: THEME.gold, fontSize: s(12, 14, 18), marginBottom: s(10, 12, 16), fontWeight: 'bold', textAlign: 'center' }}>
                                    {selected19Digit} နှင့် ပတ်သက်သော (၁၉) ကွက်
                                </Text>
                                <View style={styles.grid10Col}>
                                    {generate19Num(selected19Digit).map(n => (
                                        <View key={n} style={styles.chip10Col}>
                                            <Text style={styles.chip10ColText}>{n}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={[styles.modalActions, { marginTop: selected19Digit ? s(12, 15, 20) : s(16, 20, 26) }]}>
                            <Pressable style={styles.modalCancelBtn} onPress={() => { setNineteenModalVisible(false); setSelected19Digit(null); }}>
                                <Text style={styles.modalCancelText}>ပိတ်မည်</Text>
                            </Pressable>

                            {selected19Digit && (
                                <Pressable style={[styles.modalConfirmBtn, { backgroundColor: THEME.neonGreen }]} onPress={handleNineteenConfirm}>
                                    <Text style={[styles.modalConfirmText, { color: '#000' }]}>အတည်ပြုမည်</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={headModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { width: '95%', paddingVertical: s(15, 20, 30) }]}>
                        <Text style={[styles.modalTitle, { fontSize: s(18, 22, 28), marginBottom: s(4, 5, 8) }]}>ထိပ်စည်း</Text>
                        <Text style={styles.modalSubtitle}>ထိုးမည့် ထိပ်စည်းဂဏန်းကို ရွေးချယ်ပါ</Text>

                        <View style={styles.grid5Col}>
                            {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => {
                                const isActive = selectedHeadDigit === num;
                                return (
                                    <Pressable
                                        key={num}
                                        style={[
                                            styles.chip5Col,
                                            isActive && { backgroundColor: THEME.neonGreen, borderColor: THEME.neonGreen }
                                        ]}
                                        onPress={() => setSelectedHeadDigit(num)}
                                    >
                                        <Text style={[styles.chip5ColText, isActive && { color: '#000' }]}>{num}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {selectedHeadDigit && (
                            <View>
                                <View style={styles.modalDivider} />
                                <Text style={{ color: THEME.gold, fontSize: s(12, 14, 18), marginBottom: s(10, 12, 16), fontWeight: 'bold', textAlign: 'center' }}>
                                    {selectedHeadDigit} ထိပ်စည်း (၁၀) ကွက်
                                </Text>
                                <View style={styles.grid10Col}>
                                    {generateHeadNum(selectedHeadDigit).map(n => (
                                        <View key={n} style={styles.chip10Col}>
                                            <Text style={styles.chip10ColText}>{n}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={[styles.modalActions, { marginTop: selectedHeadDigit ? s(12, 15, 20) : s(16, 20, 26) }]}>
                            <Pressable style={styles.modalCancelBtn} onPress={() => { setHeadModalVisible(false); setSelectedHeadDigit(null); }}>
                                <Text style={styles.modalCancelText}>ပိတ်မည်</Text>
                            </Pressable>

                            {selectedHeadDigit && (
                                <Pressable style={[styles.modalConfirmBtn, { backgroundColor: THEME.neonGreen }]} onPress={handleHeadConfirm}>
                                    <Text style={[styles.modalConfirmText, { color: '#000' }]}>အတည်ပြုမည်</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={tailModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { width: '95%', paddingVertical: s(15, 20, 30) }]}>
                        <Text style={[styles.modalTitle, { fontSize: s(18, 22, 28), marginBottom: s(4, 5, 8) }]}>နောက်ပိတ်</Text>
                        <Text style={styles.modalSubtitle}>ထိုးမည့် နောက်ပိတ်ဂဏန်းကို ရွေးချယ်ပါ</Text>

                        <View style={styles.grid5Col}>
                            {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => {
                                const isActive = selectedTailDigit === num;
                                return (
                                    <Pressable
                                        key={num}
                                        style={[
                                            styles.chip5Col,
                                            isActive && { backgroundColor: THEME.neonGreen, borderColor: THEME.neonGreen }
                                        ]}
                                        onPress={() => setSelectedTailDigit(num)}
                                    >
                                        <Text style={[styles.chip5ColText, isActive && { color: '#000' }]}>{num}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {selectedTailDigit && (
                            <View>
                                <View style={styles.modalDivider} />
                                <Text style={{ color: THEME.gold, fontSize: s(12, 14, 18), marginBottom: s(10, 12, 16), fontWeight: 'bold', textAlign: 'center' }}>
                                    {selectedTailDigit} နောက်ပိတ် (၁၀) ကွက်
                                </Text>
                                <View style={styles.grid10Col}>
                                    {generateTailNum(selectedTailDigit).map(n => (
                                        <View key={n} style={styles.chip10Col}>
                                            <Text style={styles.chip10ColText}>{n}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={[styles.modalActions, { marginTop: selectedTailDigit ? s(12, 15, 20) : s(16, 20, 26) }]}>
                            <Pressable style={styles.modalCancelBtn} onPress={() => { setTailModalVisible(false); setSelectedTailDigit(null); }}>
                                <Text style={styles.modalCancelText}>ပိတ်မည်</Text>
                            </Pressable>

                            {selectedTailDigit && (
                                <Pressable style={[styles.modalConfirmBtn, { backgroundColor: THEME.neonGreen }]} onPress={handleTailConfirm}>
                                    <Text style={[styles.modalConfirmText, { color: '#000' }]}>အတည်ပြုမည်</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={doubleModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { width: '95%', paddingVertical: s(15, 20, 30) }]}>
                        <Text style={[styles.modalTitle, { fontSize: s(18, 22, 28), marginBottom: s(12, 15, 20) }]}>နှစ်ထပ်ကိန်း</Text>

                        <View style={styles.grid10Col}>
                            {['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'].map((num) => {
                                return (
                                    <View key={num} style={styles.chip10Col}>
                                        <Text style={styles.chip10ColText}>{num}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        <View style={[styles.modalActions, { marginTop: s(16, 20, 26) }]}>
                            <Pressable style={styles.modalCancelBtn} onPress={() => setDoubleModalVisible(false)}>
                                <Text style={styles.modalCancelText}>ပယ်ဖျက်ပါ</Text>
                            </Pressable>

                            <Pressable style={[styles.modalConfirmBtn, { backgroundColor: THEME.neonGreen }]} onPress={handleDoubleConfirm}>
                                <Text style={[styles.modalConfirmText, { color: '#000' }]}>ရွေးချယ်ပါ (၁၀) ကွက်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={lowModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { width: '95%', paddingVertical: s(15, 20, 30) }]}>
                        <Text style={[styles.modalTitle, { fontSize: s(18, 22, 28), marginBottom: s(12, 15, 20) }]}>အနိမ့်</Text>

                        <View style={styles.grid10Col}>
                            {generateLowNums().map((num) => (
                                <View key={num} style={styles.chip10Col}>
                                    <Text style={styles.chip10ColText}>{num}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={[styles.modalActions, { marginTop: s(16, 20, 26) }]}>
                            <Pressable style={styles.modalCancelBtn} onPress={() => setLowModalVisible(false)}>
                                <Text style={styles.modalCancelText}>ပယ်ဖျက်ပါ</Text>
                            </Pressable>

                            <Pressable style={[styles.modalConfirmBtn, { backgroundColor: THEME.neonGreen }]} onPress={handleLowConfirm}>
                                <Text style={[styles.modalConfirmText, { color: '#000' }]}>ရွေးချယ်ပါ (၅၀) ကွက်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={highModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { width: '95%', paddingVertical: s(15, 20, 30) }]}>
                        <Text style={[styles.modalTitle, { fontSize: s(18, 22, 28), marginBottom: s(12, 15, 20) }]}>အမြင့်</Text>

                        <View style={styles.grid10Col}>
                            {generateHighNums().map((num) => (
                                <View key={num} style={styles.chip10Col}>
                                    <Text style={styles.chip10ColText}>{num}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={[styles.modalActions, { marginTop: s(16, 20, 26) }]}>
                            <Pressable style={styles.modalCancelBtn} onPress={() => setHighModalVisible(false)}>
                                <Text style={styles.modalCancelText}>ပယ်ဖျက်ပါ</Text>
                            </Pressable>

                            <Pressable style={[styles.modalConfirmBtn, { backgroundColor: THEME.neonGreen }]} onPress={handleHighConfirm}>
                                <Text style={[styles.modalConfirmText, { color: '#000' }]}>ရွေးချယ်ပါ (၅၀) ကွက်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={evenModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { width: '95%', paddingVertical: s(15, 20, 30) }]}>
                        <Text style={[styles.modalTitle, { fontSize: s(18, 22, 28), marginBottom: s(12, 15, 20) }]}>စုံ</Text>

                        <View style={styles.grid10Col}>
                            {generateEvenNums().map((num) => (
                                <View key={num} style={styles.chip10Col}>
                                    <Text style={styles.chip10ColText}>{num}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={[styles.modalActions, { marginTop: s(16, 20, 26) }]}>
                            <Pressable style={styles.modalCancelBtn} onPress={() => setEvenModalVisible(false)}>
                                <Text style={styles.modalCancelText}>ပယ်ဖျက်ပါ</Text>
                            </Pressable>

                            <Pressable style={[styles.modalConfirmBtn, { backgroundColor: THEME.neonGreen }]} onPress={handleEvenConfirm}>
                                <Text style={[styles.modalConfirmText, { color: '#000' }]}>ရွေးချယ်ပါ (၅၀) ကွက်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={oddModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { width: '95%', paddingVertical: s(15, 20, 30) }]}>
                        <Text style={[styles.modalTitle, { fontSize: s(18, 22, 28), marginBottom: s(12, 15, 20) }]}>မ</Text>

                        <View style={styles.grid10Col}>
                            {generateOddNums().map((num) => (
                                <View key={num} style={styles.chip10Col}>
                                    <Text style={styles.chip10ColText}>{num}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={[styles.modalActions, { marginTop: s(16, 20, 26) }]}>
                            <Pressable style={styles.modalCancelBtn} onPress={() => setOddModalVisible(false)}>
                                <Text style={styles.modalCancelText}>ပယ်ဖျက်ပါ</Text>
                            </Pressable>

                            <Pressable style={[styles.modalConfirmBtn, { backgroundColor: THEME.neonGreen }]} onPress={handleOddConfirm}>
                                <Text style={[styles.modalConfirmText, { color: '#000' }]}>ရွေးချယ်ပါ (၅၀) ကွက်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={[styles.header, { paddingTop: Math.max(insets.top, s(10, 15, 20)) }]}>
                <Pressable onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={s(20, 26, 34)} color={THEME.textWhite} />
                </Pressable>
                <View>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <View style={styles.countryBadge}>
                        <Text style={styles.countryBadgeText}>{country === 'MM' ? '🇲🇲 မြန်မာ' : '🇹🇭 ထိုင်း'}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: s(200, 250, 320) }}
            >
                <View style={styles.tabContainer}>
                    {(['3D', '2D', '1D'] as TabType[]).map((tab) => (
                        <Pressable
                            key={tab}
                            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                            onPress={() => {
                                setActiveTab(tab);
                                setInputNumber('');
                                Keyboard.dismiss();
                            }}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                {tab === '3D' ? 'သုံးလုံး' : tab === '2D' ? 'နှစ်လုံး' : 'တစ်လုံး'}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>
                        ဂဏန်းရိုက်ထည့်ပါ ({activeTab === '3D' ? '၃' : activeTab === '2D' ? '၂' : '၁'} လုံးပြည့်ပါက အလိုအလျောက် ရွေးချယ်ပါမည်)
                    </Text>

                    <TextInput
                        style={styles.bigInput}
                        placeholder={activeTab === '3D' ? '000' : activeTab === '2D' ? '00' : '0'}
                        placeholderTextColor={THEME.textMuted}
                        keyboardType="number-pad"
                        maxLength={activeTab === '3D' ? 3 : activeTab === '2D' ? 2 : 1}
                        value={inputNumber}
                        onChangeText={handleNumberInput}
                    />
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>ထိုးနည်း (ရွေးချယ်ထားသောနည်းများ - {modes[activeTab].length})</Text>

                    {activeTab === '2D' ? (
                        <View>
                            <View style={styles.grid3Col}>
                                {PLAY_OPTIONS['2D'].slice(0, 3).map((item) => {
                                    const isSelected = modes['2D'].includes(item.id);
                                    return (
                                        <Pressable
                                            key={item.id}
                                            style={[styles.modeChip, styles.chip3Col, isSelected && styles.modeChipActive]}
                                            onPress={() => handleModePress('2D', item.id)}
                                        >
                                            <Text style={[styles.modeText, isSelected && styles.modeTextActive]}>{item.label}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>

                            <View style={styles.grid4Col}>
                                {PLAY_OPTIONS['2D'].slice(3).map((item) => {
                                    const isSelected = modes['2D'].includes(item.id);
                                    return (
                                        <Pressable
                                            key={item.id}
                                            style={[styles.modeChip, styles.chip4Col, isSelected && styles.modeChipActive]}
                                            onPress={() => handleModePress('2D', item.id)}
                                        >
                                            <Text
                                                style={[styles.modeText, isSelected && styles.modeTextActive, { fontSize: s(9, 11, 14) }]}
                                                numberOfLines={1}
                                                adjustsFontSizeToFit
                                            >
                                                {item.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.modesGrid}>
                            {PLAY_OPTIONS[activeTab].map((item) => {
                                const isSelected = modes[activeTab].includes(item.id);
                                return (
                                    <Pressable
                                        key={item.id}
                                        style={[styles.modeChip, isSelected && styles.modeChipActive]}
                                        onPress={() => handleModePress(activeTab, item.id)}
                                    >
                                        <Text style={[styles.modeText, isSelected && styles.modeTextActive]}>{item.label}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                </View>

                {renderCompactPreview()}

                {renderRules()}
            </ScrollView>

            <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom + s(8, 10, 14), s(12, 15, 20)) }]}>
                <Pressable style={[styles.clearBtn, !hasAnyNumber && { opacity: 0.3 }]} onPress={handleClearAll} disabled={!hasAnyNumber}>
                    <Ionicons name="trash-outline" size={s(16, 20, 26)} color={THEME.danger} />
                    <Text style={styles.clearBtnText}>ဖျက်မည်</Text>
                </Pressable>

                <Pressable
                    style={[styles.addBtn, !hasAnyNumber && { opacity: 0.5 }]}
                    disabled={!hasAnyNumber}
                    onPress={() => router.push("/wallet-profile/lottery/amount")}
                >
                    <Text style={styles.addBtnText}>စာရင်းထဲ ထည့်မည်</Text>
                    <Ionicons name="arrow-forward-circle" size={s(16, 20, 26)} color="#000" />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(12, 16, 24),
        paddingBottom: s(12, 15, 20),
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
        marginTop: s(12, 15, 20),
    },
    backButton: {
        width: s(34, 40, 50),
        height: s(34, 40, 50),
        borderRadius: s(17, 20, 25),
        backgroundColor: THEME.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(10, 12, 16),
    },
    headerTitle: { color: THEME.textWhite, fontSize: s(16, 18, 24), fontWeight: 'bold' },
    countryBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: s(6, 8, 12),
        paddingVertical: s(2, 2, 4),
        borderRadius: s(4, 6, 8),
        marginTop: s(2, 4, 6),
    },
    countryBadgeText: {
        color: THEME.gold,
        fontSize: s(9, 10, 14),
        fontWeight: 'bold'
    },

    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: s(12, 16, 24),
        marginTop: s(12, 15, 20),
        marginBottom: s(8, 10, 14)
    },
    tabBtn: {
        flex: 1,
        paddingVertical: s(10, 12, 16),
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: THEME.borderNormal
    },
    tabBtnActive: {
        borderBottomColor: THEME.neonGreen
    },
    tabText: {
        color: THEME.textMuted,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },
    tabTextActive: {
        color: THEME.neonGreen,
        fontWeight: '900'
    },

    sectionContainer: {
        paddingHorizontal: s(12, 16, 24),
        marginTop: s(20, 25, 35)
    },
    sectionLabel: {
        color: THEME.textMuted,
        fontSize: s(11, 13, 16),
        fontWeight: 'bold',
        marginBottom: s(8, 10, 14)
    },

    bigInput: {
        backgroundColor: THEME.inputBg,
        color: THEME.textWhite,
        fontSize: s(32, 40, 56),
        fontWeight: '900',
        textAlign: 'center',
        borderRadius: s(12, 16, 24),
        height: s(60, 80, 110),
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        letterSpacing: s(6, 10, 15),
    },

    modesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: s(8, 10, 14)
    },
    grid3Col: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: s(8, 10, 14)
    },
    chip3Col: {
        width: '31%',
        minWidth: 0,
        flexGrow: 0
    },

    grid4Col: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: '2.6%'
    },
    chip4Col: {
        width: '23%',
        minWidth: 0,
        flexGrow: 0,
        paddingVertical: s(8, 10, 14),
        marginBottom: s(8, 10, 14)
    },

    modeChip: {
        flexGrow: 1,
        minWidth: '30%',
        backgroundColor: THEME.cardBg,
        paddingVertical: s(12, 14, 18),
        borderRadius: s(10, 12, 16),
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modeChipActive: {
        backgroundColor: THEME.neonGreen,
        borderColor: THEME.neonGreen
    },
    modeText: {
        color: THEME.textWhite,
        fontSize: s(10, 12, 15),
        fontWeight: '600',
        textAlign: 'center'
    },
    modeTextActive: {
        color: '#000',
        fontWeight: 'bold'
    },

    previewBox: {
        backgroundColor: 'rgba(0, 230, 118, 0.03)',
        padding: s(12, 15, 20),
        borderRadius: s(12, 16, 24),
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.15)',
        marginHorizontal: s(12, 16, 24),
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: s(12, 16, 24)
    },
    previewTitle: {
        color: THEME.neonGreen,
        fontSize: s(12, 14, 18),
        fontWeight: 'bold'
    },

    groupContainer: {
        marginBottom: s(12, 16, 24)
    },
    groupTitle: {
        color: THEME.gold,
        fontSize: s(13, 15, 18),
        marginBottom: s(10, 12, 16),
        fontWeight: 'bold'
    },

    compactListWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        columnGap: '2.6%',
    },
    compactBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.inputBg,
        paddingVertical: s(8, 10, 14),
        borderRadius: s(8, 10, 14),
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.3)',
        width: '23%',
        marginBottom: s(8, 10, 14),
    },
    compactBadgeText: {
        color: THEME.textWhite,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },

    rulesBox: {
        backgroundColor: THEME.infoBg,
        padding: s(12, 16, 24),
        borderRadius: s(12, 16, 24),
        borderWidth: 1,
        borderColor: THEME.infoBorder,
        marginHorizontal: s(12, 16, 24),
        marginBottom: s(30, 40, 60)
    },
    rulesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: s(10, 12, 16),
        gap: s(4, 6, 8)
    },
    rulesTitle: {
        color: THEME.infoText,
        fontSize: s(12, 14, 18),
        fontWeight: 'bold'
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: s(6, 8, 12),
        paddingRight: s(8, 10, 14)
    },
    ruleDot: {
        width: s(4, 6, 8),
        height: s(4, 6, 8),
        borderRadius: s(2, 3, 4),
        backgroundColor: THEME.infoText,
        marginTop: s(4, 6, 8),
        marginRight: s(8, 10, 14)
    },
    ruleText: {
        flex: 1,
        color: THEME.textMuted,
        fontSize: s(11, 13, 16),
        lineHeight: s(16, 20, 28)
    },
    highlightText: {
        color: THEME.textWhite,
        fontWeight: 'bold'
    },

    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: THEME.bg,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(12, 16, 24),
        paddingTop: s(10, 12, 16),
        borderTopWidth: 1,
        borderTopColor: THEME.borderNormal,
    },
    clearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: s(42, 48, 60),
        paddingHorizontal: s(12, 16, 24),
        borderRadius: s(10, 14, 18),
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)',
        marginRight: s(10, 12, 16),
        gap: s(4, 6, 8)
    },
    clearBtnText: {
        color: THEME.danger,
        fontSize: s(12, 14, 18),
        fontWeight: 'bold'
    },
    addBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: THEME.neonGreen,
        height: s(42, 48, 60),
        borderRadius: s(10, 14, 18),
        justifyContent: 'center',
        alignItems: 'center',
        gap: s(4, 6, 8)
    },
    addBtnText: {
        color: '#000',
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: s('90%', '80%', '60%'),
        backgroundColor: THEME.cardBg,
        borderRadius: s(16, 20, 28),
        padding: s(20, 24, 32),
        borderWidth: 1,
        borderColor: THEME.neonGreen,
    },
    modalTitle: {
        color: THEME.neonGreen,
        fontSize: s(16, 20, 26),
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: s(8, 10, 14),
    },
    modalSubtitle: {
        color: THEME.textMuted,
        fontSize: s(12, 14, 18),
        textAlign: 'center',
        marginBottom: s(16, 20, 28),
    },
    modalMessage: {
        color: THEME.textWhite,
        fontSize: s(13, 15, 18),
        textAlign: 'center',
        marginBottom: s(20, 24, 32),
        lineHeight: s(20, 24, 30),
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: s(10, 12, 16),
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: s(12, 14, 18),
        borderRadius: s(10, 12, 16),
        borderWidth: 1,
        borderColor: THEME.textMuted,
        alignItems: 'center',
    },
    modalCancelText: {
        color: THEME.textWhite,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold',
    },
    modalConfirmBtn: {
        flex: 1,
        paddingVertical: s(12, 14, 18),
        borderRadius: s(10, 12, 16),
        backgroundColor: THEME.danger,
        alignItems: 'center',
    },
    modalConfirmText: {
        color: '#FFFFFF',
        fontSize: s(13, 15, 18),
        fontWeight: 'bold',
    },

    grid5Col: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    chip5Col: {
        width: '18%',
        aspectRatio: 1,
        backgroundColor: THEME.inputBg,
        borderRadius: s(10, 12, 16),
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: s(10, 12, 16),
    },
    chip5ColText: {
        color: THEME.textWhite,
        fontSize: s(16, 20, 28),
        fontWeight: 'bold',
    },
    modalDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: s(12, 15, 20),
        width: '100%',
    },
    grid10Col: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        columnGap: '1.6%',
        rowGap: s(6, 8, 12),
        marginBottom: s(8, 10, 14),
    },
    chip10Col: {
        width: '8.5%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: s(3, 4, 6),
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: s(4, 6, 8),
    },
    chip10ColText: {
        color: THEME.textWhite,
        fontSize: s(10, 12, 14),
        fontWeight: 'bold',
    },
});