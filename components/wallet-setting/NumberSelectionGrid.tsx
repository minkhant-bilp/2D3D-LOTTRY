import { useBetStore } from '@/store/useBetStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable,
    ScrollView, StyleSheet, Text, TextInput, View, Vibration
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    purple: '#AF52DE',
};

interface NumberBadgeProps {
    num: string;
    onRemove: (n: string) => void;
}

const NumberBadge = ({ num, onRemove }: NumberBadgeProps) => (
    <View style={styles.badgeWrapper}>
        <Text style={styles.badgeText}>{num}</Text>
        <Pressable onPress={() => { Vibration.vibrate(10); onRemove(num); }} style={styles.deleteIconBox}>
            <Ionicons name="close-circle" size={14} color={THEME.danger} />
        </Pressable>
    </View>
);
const get3DPermutations = (str: string) => {
    if (str.length !== 3) return [str];
    const result = new Set<string>();
    const arr = str.split('');
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (i === j) continue;
            for (let k = 0; k < 3; k++) {
                if (i === k || j === k) continue;
                result.add(arr[i] + arr[j] + arr[k]);
            }
        }
    }
    return Array.from(result);
};

const generate3DNumbers = (input: string, type: string) => {
    let result = new Set<string>();

    if (type === 'တန်း' && input.length === 3) result.add(input);
    if (type === 'အခွေ' && input.length === 3) {
        get3DPermutations(input).forEach(x => result.add(x));
    }
    if (type === 'ထိပ်' && input.length === 1) {
        for (let i = 0; i < 100; i++) result.add(input + i.toString().padStart(2, '0'));
    }
    if (type === 'နောက်' && input.length === 1) {
        for (let i = 0; i < 100; i++) result.add(i.toString().padStart(2, '0') + input);
    }
    if (type === 'စုံပတ်' && input.length === 1) {
        for (let i = 0; i < 1000; i++) {
            let numStr = i.toString().padStart(3, '0');
            if (numStr.includes(input)) result.add(numStr);
        }
    }
    return Array.from(result);
};

export default function NumberSelectionGrid() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const setInitialBets = useBetStore((state) => state.setInitialBets);

    const [mode, setMode] = useState<'2D' | '3D'>('2D');
    const [currentInput, setCurrentInput] = useState('');

    const [is2DRActive, setIs2DRActive] = useState(false);
    const [type3D, setType3D] = useState<'တန်း' | 'အခွေ' | 'စုံပတ်' | 'ထိပ်' | 'နောက်'>('တန်း');

    const [bets, setBets] = useState<string[]>([]);
    const [showAlert, setShowAlert] = useState(false);

    const bets2D = bets.filter(b => b.length === 2);
    const bets3D = bets.filter(b => b.length === 3);

    let maxLen = 2;
    if (mode === '3D') {
        if (type3D === 'တန်း' || type3D === 'အခွေ') maxLen = 3;
        else maxLen = 1;
    }

    const handleSwitchMode = (newMode: '2D' | '3D') => {
        if (mode === newMode) return;
        setMode(newMode);
        setCurrentInput('');
        setIs2DRActive(false);
        setType3D('တန်း');
    };

    const handleAdd = () => {
        if (currentInput.length !== maxLen) return;

        let newEntries: string[] = [];

        if (mode === '2D') {
            newEntries.push(currentInput);
            if (is2DRActive && currentInput[0] !== currentInput[1]) {
                newEntries.push(currentInput[1] + currentInput[0]);
            }
        } else {
            newEntries = generate3DNumbers(currentInput, type3D);
        }

        setBets(prev => Array.from(new Set([...prev, ...newEntries])));
        setCurrentInput('');
        Keyboard.dismiss();
    };

    const handleRemove = useCallback((val: string) => {
        setBets(prev => prev.filter(x => x !== val));
    }, []);

    const handleAddDoubles2D = () => {
        const doubles = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99'];
        setBets(prev => Array.from(new Set([...prev, ...doubles])));
    };

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

            <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
                <Pressable onPress={() => bets.length > 0 ? setShowAlert(true) : router.back()} style={styles.navBtn}>
                    <Ionicons name="chevron-back" size={26} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>ဂဏန်းရိုက်ထည့်ရန်</Text>
            </View>

            <View style={styles.switcherContainer}>
                <Pressable style={[styles.switchTab, mode === '2D' && styles.switchTabActive]} onPress={() => handleSwitchMode('2D')}>
                    <Text style={[styles.switchText, mode === '2D' && styles.switchTextActive]}>2D ဂဏန်း</Text>
                </Pressable>
                <Pressable style={[styles.switchTab, mode === '3D' && styles.switchTabActive]} onPress={() => handleSwitchMode('3D')}>
                    <Text style={[styles.switchText, mode === '3D' && styles.switchTextActive]}>3D ဂဏန်း</Text>
                </Pressable>
            </View>

            <View style={styles.commandCenter}>
                <TextInput
                    style={styles.proInput}
                    placeholder={mode === '2D' ? "00" : (maxLen === 3 ? "000" : "0")}
                    placeholderTextColor={THEME.textMuted}
                    keyboardType="number-pad"
                    maxLength={maxLen}
                    value={currentInput}
                    onChangeText={(t) => setCurrentInput(t.replace(/[^0-9]/g, ''))}
                />

                {mode === '2D' && (
                    <View style={styles.toolbar}>
                        <Pressable style={[styles.toolBtn, is2DRActive ? styles.toolBtnActive : styles.toolBtnInactive]} onPress={() => setIs2DRActive(!is2DRActive)}>
                            <Text style={[styles.toolText, { color: is2DRActive ? '#000' : '#FFF' }]}>R (အပြန်)</Text>
                        </Pressable>
                        <Pressable style={[styles.toolBtn, styles.toolBtnPurple]} onPress={handleAddDoubles2D}>
                            <Text style={styles.toolTextLight}>အပူး</Text>
                        </Pressable>
                    </View>
                )}

                {mode === '3D' && (
                    <View style={styles.toolbar3D}>
                        {['တန်း', 'အခွေ', 'စုံပတ်', 'ထိပ်', 'နောက်'].map((t) => (
                            <Pressable
                                key={t}
                                style={[styles.toolBtn3D, type3D === t && styles.toolBtn3DActive]}
                                onPress={() => {
                                    setType3D(t as any);
                                    setCurrentInput('');
                                }}
                            >
                                <Text style={[styles.toolText3D, type3D === t && styles.toolText3DActive]}>{t}</Text>
                            </Pressable>
                        ))}
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
                {bets.length === 0 && <Text style={styles.emptyText}>ရွေးချယ်ထားသော ဂဏန်းမရှိသေးပါ</Text>}

                {bets2D.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2D စာရင်း ({bets2D.length} ကွက်)</Text>
                        <View style={styles.chipContainer}>
                            {bets2D.map(num => <NumberBadge key={num} num={num} onRemove={handleRemove} />)}
                        </View>
                    </View>
                )}

                {bets3D.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3D စာရင်း ({bets3D.length} ကွက်)</Text>
                        <View style={styles.chipContainer}>
                            {bets3D.map(num => <NumberBadge key={num} num={num} onRemove={handleRemove} />)}
                        </View>
                    </View>
                )}
            </ScrollView>

            {bets.length > 0 && (
                <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 15) }]}>
                    <Text style={styles.totalText}>စုစုပေါင်း {bets.length} ကွက်</Text>
                    <Pressable style={styles.fabBtn} onPress={() => { setInitialBets(bets); router.push('/wallet-profile/number-play/select'); }}>
                        <Text style={styles.fabBtnText}>ဆက်သွားမည်</Text>
                    </Pressable>
                </View>
            )}

            <Modal visible={showAlert} transparent animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={styles.alertBox}>
                        <Text style={styles.alertTitle}>ပြန်ထွက်မှာ သေချာပြီလား?</Text>
                        <View style={styles.alertActions}>
                            <Pressable style={styles.btnAlt} onPress={() => setShowAlert(false)}><Text style={{ color: '#FFF' }}>မထွက်ပါ</Text></Pressable>
                            <Pressable style={styles.btnDanger} onPress={() => { setShowAlert(false); router.back(); }}><Text style={{ color: '#FFF' }}>ထွက်မည်</Text></Pressable>
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
        paddingHorizontal: 16,
        paddingBottom: 15
    },
    navBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    headerTitle: {
        color: THEME.textWhite,
        fontSize: 18,
        fontWeight: 'bold'
    },

    switcherContainer: {
        flexDirection: 'row',
        backgroundColor: THEME.inputBg,
        marginHorizontal: 16,
        borderRadius: 10,
        padding: 4,
        marginBottom: 15
    },
    switchTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8
    },
    switchTabActive: {
        backgroundColor: THEME.neonGreen
    },
    switchText: {
        color: THEME.textMuted,
        fontSize: 13,
        fontWeight: 'bold'
    },
    switchTextActive: {
        color: '#000',
        fontWeight: '900'
    },

    commandCenter: {
        backgroundColor: THEME.card,
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: THEME.border
    },
    proInput: {
        backgroundColor: THEME.bg,
        color: THEME.neonGreen,
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        borderRadius: 12,
        height: 60,
        borderWidth: 1,
        borderColor: THEME.borderActive,
        marginBottom: 12
    },

    toolbar: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12
    },
    toolBtn: {
        flex: 1,
        height: 40,
        borderRadius: 8,
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
    toolBtnPurple: {
        backgroundColor: THEME.purple,
        borderColor: THEME.purple
    },
    toolText: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    toolTextLight: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold'
    },


    toolbar3D: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
        justifyContent: 'center'
    },
    toolBtn3D: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.inputBg
    },
    toolBtn3DActive: {
        backgroundColor: THEME.gold,
        borderColor: THEME.gold
    },
    toolText3D: {
        color: THEME.textWhite,
        fontSize: 12,
        fontWeight: 'bold'
    },
    toolText3DActive: {
        color: '#000'
    },

    mainActionBtn: {
        height: 45,
        backgroundColor: THEME.neonGreen,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainActionText: {
        color: '#000',
        fontSize: 15,
        fontWeight: 'bold'
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100
    },
    section: {
        marginBottom: 15
    },
    sectionTitle: {
        color: THEME.textMuted,
        fontSize: 12,
        marginBottom: 8,
        fontWeight: 'bold'
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },

    badgeWrapper: {
        width: 64,
        height: 40,
        borderRadius: 8,
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.borderActive,
        justifyContent: 'center',
        alignItems: 'center'
    },
    badgeText: {
        color: THEME.neonGreen,
        fontSize: 16,
        fontWeight: '900'
    },
    deleteIconBox: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: THEME.bg,
        borderRadius: 10
    },

    emptyText: {
        color: THEME.textMuted,
        textAlign: 'center',
        marginTop: 40
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: THEME.card,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: THEME.border
    },
    totalText: {
        flex: 1,
        color: THEME.neonGreen,
        fontSize: 16,
        fontWeight: 'bold'
    },
    fabBtn: {
        backgroundColor: THEME.neonGreen,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10
    },
    fabBtnText: {
        color: '#000',
        fontWeight: 'bold'
    },

    alertOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    alertBox: {
        width: '80%',
        backgroundColor: THEME.card,
        borderRadius: 20,
        padding: 25,
        alignItems: 'center'
    },
    alertTitle: {
        color: '#FFF',
        marginBottom: 20,
        textAlign: 'center'
    },
    alertActions: {
        flexDirection: 'row',
        gap: 10
    },
    btnAlt: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center'

    },
    btnDanger: {
        backgroundColor: THEME.danger,
        padding: 10,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center'
    }
});