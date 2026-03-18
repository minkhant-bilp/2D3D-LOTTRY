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

const COLORS = {
    background: '#050A1F',
    primary: '#00E676',
    textMain: '#FFFFFF',
    textSub: '#8A9BB3',
    surfaceLight: '#1A2647',
};

export default function SuccessScreen() {
    const router = useRouter();

    const clearBets = useBetStore((state) => state.clearBets);
    const clearAllNumbers = useNumberStore((state) => state.clearAll);

    useEffect(() => {
        clearBets();
        clearAllNumbers();

        const onBackPress = () => {
            router.replace('/');
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => backHandler.remove();

    }, [clearBets, clearAllNumbers, router]);

    const handleGoHome = () => {
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>

                <View style={styles.iconCircle}>
                    <Ionicons name="checkmark" size={s(40, 60, 80)} color={COLORS.background} />
                </View>

                <Text style={styles.title}>ပေးပို့မှု အောင်မြင်ပါသည်</Text>

                <Text style={styles.message}>
                    လူကြီးမင်း၏ လောင်းကြေးစာရင်းနှင့် ငွေလွှဲစလစ်ကို{'\n'}
                    Admin ထံသို့ အောင်မြင်စွာ ပေးပို့ပြီးဖြစ်ပါသည်။
                </Text>

                <Text style={styles.subMessage}>
                    ငွေလွှဲမှတ်တမ်းကို စစ်ဆေးပြီးပါက (၃) မိနစ် မှ (၅) မိနစ်အတွင်း အတည်ပြုပေးမည် ဖြစ်ပါသည်။
                </Text>

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
        backgroundColor: COLORS.background,
        justifyContent: 'space-between',
        padding: s(15, 20, 30)
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: s(80, 100, 140),
        height: s(80, 100, 140),
        borderRadius: s(40, 50, 70),
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: s(20, 30, 45),
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    title: {
        color: COLORS.primary,
        fontSize: s(20, 24, 32),
        fontWeight: 'bold',
        marginBottom: s(12, 15, 20),
        textAlign: 'center'
    },
    message: {
        color: COLORS.textMain,
        fontSize: s(13, 15, 18),
        textAlign: 'center',
        lineHeight: s(20, 24, 30),
        marginBottom: s(12, 15, 20)
    },
    subMessage: {
        color: COLORS.textSub,
        fontSize: s(11, 13, 16),
        textAlign: 'center',
        lineHeight: s(16, 20, 26),
        paddingHorizontal: s(15, 20, 30)
    },
    bottomSection: {
        paddingBottom: s(15, 20, 30)
    },
    homeBtn: {
        backgroundColor: COLORS.surfaceLight,
        paddingVertical: s(14, 16, 22),
        borderRadius: s(12, 16, 24),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    homeBtnText: {
        color: COLORS.textMain,
        fontSize: s(14, 16, 20),
        fontWeight: 'bold'
    }
});