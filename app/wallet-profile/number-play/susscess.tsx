import { useBetStore } from '@/store/useBetStore';
import { useNumberStore } from '@/store/useNumberStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import useTranslation from '@/hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

function s<T>(small: T, medium: T, tablet: T): T {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
}

const COLORS = {
    background: '#050A1F',
    primary: '#00E676',
    textMain: '#FFFFFF',
    textSub: '#8A9BB3',
    surfaceLight: '#1A2647',
};

export default function SuccessScreen() {
    const router = useRouter();
    const { t } = useTranslation(); // 🚀 Translation ကို အသက်သွင်းလိုက်ပါပြီ

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
                    <Ionicons name="checkmark" size={Number(s(40, 60, 80))} color={COLORS.background} />
                </View>

                <Text style={styles.title}>{t.successTitle || 'ပေးပို့မှု အောင်မြင်ပါသည်'}</Text>

                <Text style={styles.message}>
                    {t.successMsg1 || 'လူကြီးမင်း၏ လောင်းကြေးစာရင်းနှင့် ငွေလွှဲစလစ်ကို'}{'\n'}
                    {t.successMsg2 || 'Admin ထံသို့ အောင်မြင်စွာ ပေးပို့ပြီးဖြစ်ပါသည်။'}
                </Text>

                <Text style={styles.subMessage}>
                    {t.successSubMsg || 'ငွေလွှဲမှတ်တမ်းကို စစ်ဆေးပြီးပါက (၃) မိနစ် မှ (၅) မိနစ်အတွင်း အတည်ပြုပေးမည် ဖြစ်ပါသည်။'}
                </Text>

            </View>

            <View style={styles.bottomSection}>
                <Pressable style={styles.homeBtn} onPress={handleGoHome}>
                    <Text style={styles.homeBtnText}>{t.goHomeBtn || 'ပင်မစာမျက်နှာသို့ ပြန်သွားမည်'}</Text>
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
        padding: Number(s(15, 20, 30))
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: Number(s(80, 100, 140)),
        height: Number(s(80, 100, 140)),
        borderRadius: Number(s(40, 50, 70)),
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Number(s(20, 30, 45)),
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    title: {
        color: COLORS.primary,
        fontSize: Number(s(20, 24, 32)),
        fontWeight: 'bold',
        marginBottom: Number(s(12, 15, 20)),
        textAlign: 'center'
    },
    message: {
        color: COLORS.textMain,
        fontSize: Number(s(13, 15, 18)),
        textAlign: 'center',
        lineHeight: Number(s(20, 24, 30)),
        marginBottom: Number(s(12, 15, 20))
    },
    subMessage: {
        color: COLORS.textSub,
        fontSize: Number(s(11, 13, 16)),
        textAlign: 'center',
        lineHeight: Number(s(16, 20, 26)),
        paddingHorizontal: Number(s(15, 20, 30))
    },
    bottomSection: {
        paddingBottom: Number(s(15, 20, 30))
    },
    homeBtn: {
        backgroundColor: COLORS.surfaceLight,
        paddingVertical: Number(s(14, 16, 22)),
        borderRadius: Number(s(12, 16, 24)),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
    },
    homeBtnText: {
        color: COLORS.textMain,
        fontSize: Number(s(14, 16, 20)),
        fontWeight: 'bold'
    }
});