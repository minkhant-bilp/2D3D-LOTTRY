import { useBetStore } from '@/store/useBetStore';
import { useNumberStore } from '@/store/useNumberStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

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
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    borderNormal: 'rgba(255, 255, 255, 0.08)',
};

export default function PaymentSuccess() {
    const router = useRouter();

    const clearAllNumbers = useNumberStore((state) => state.clearAll);
    const clearBets = useBetStore((state) => state.clearBets);

    useEffect(() => {
        clearAllNumbers();
        clearBets();

        const onHardwareBackPress = () => {
            router.replace('/');
            return true;
        };
        const backHandler = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
        return () => backHandler.remove();
    }, [clearAllNumbers, clearBets, router]);

    const handleGoHome = () => {
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>

                <View style={styles.iconWrapper}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="checkmark" size={s(40, 60, 80)} color={THEME.bg} />
                    </View>
                </View>

                <Text style={styles.title}>ပေးပို့မှု အောင်မြင်ပါသည်</Text>

                <Text style={styles.message}>
                    လူကြီးမင်း၏ လောင်းကြေးစာရင်းနှင့် ငွေလွှဲစလစ်ကို{'\n'}
                    Admin ထံသို့ အောင်မြင်စွာ ပေးပို့ပြီးဖြစ်ပါသည်။
                </Text>

                <View style={styles.infoBox}>
                    <Ionicons name="time-outline" size={s(16, 20, 26)} color={THEME.neonGreen} style={{ marginBottom: s(6, 8, 12) }} />
                    <Text style={styles.infoText}>
                        ငွေလွှဲမှတ်တမ်းကို စစ်ဆေးပြီးပါက (၂) မိနစ် မှ (၃) မိနစ်အတွင်း အတည်ပြုပေးမည် ဖြစ်ပါသည်။
                    </Text>
                </View>

            </View>

            <View style={styles.bottomSection}>
                <Pressable style={styles.homeBtn} onPress={handleGoHome}>
                    <Text style={styles.homeBtnText}>ပင်မစာမျက်နှာသို့ ပြန်သွားမည်</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
        justifyContent: 'space-between',
        padding: s(15, 20, 30)
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapper: {
        marginBottom: s(20, 30, 45),
        padding: s(15, 20, 30),
        borderRadius: s(80, 100, 140),
        backgroundColor: 'rgba(0, 230, 118, 0.05)',
    },
    iconCircle: {
        width: s(80, 100, 140),
        height: s(80, 100, 140),
        borderRadius: s(40, 50, 70),
        backgroundColor: THEME.neonGreen,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: THEME.neonGreen,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 15
    },
    title: {
        color: THEME.textWhite,
        fontSize: s(20, 24, 32),
        fontWeight: 'bold',
        marginBottom: s(12, 15, 20),
        textAlign: 'center'
    },
    message: {
        color: THEME.textMuted,
        fontSize: s(13, 15, 18),
        textAlign: 'center',
        lineHeight: s(20, 24, 30),
        marginBottom: s(20, 30, 45)
    },
    infoBox: {
        backgroundColor: THEME.cardBg,
        padding: s(16, 20, 30),
        borderRadius: s(12, 16, 24),
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        alignItems: 'center',
        width: '100%',
        maxWidth: s(360, 400, 500)
    },
    infoText: {
        color: THEME.neonGreen,
        fontSize: s(12, 14, 18),
        textAlign: 'center',
        lineHeight: s(18, 22, 28),
        fontWeight: 'bold'
    },
    bottomSection: {
        paddingBottom: s(15, 20, 30)
    },
    homeBtn: {
        backgroundColor: THEME.cardBg,
        paddingVertical: s(14, 16, 22),
        borderRadius: s(12, 16, 24),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.borderNormal
    },
    homeBtnText: {
        color: THEME.textWhite,
        fontSize: s(14, 16, 20),
        fontWeight: 'bold'
    }
});