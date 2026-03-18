import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
    danger: '#FF3B30',
    timerBg: 'rgba(0, 230, 118, 0.1)',
};

interface LotteryGame {
    id: string;
    title: string;
    flag: string;
    closeTime: string;
    countryType: 'MM' | 'TH';
}

const LOTTERY_GAMES: LotteryGame[] = [
    { id: '1', title: 'အောင်ဘာလေထီ (မြန်မာ)', flag: '🇲🇲', closeTime: '01/04/2026 12:00', countryType: 'MM' },
    { id: '2', title: 'ထိုင်းထီ (Thai Lottery)', flag: '🇹🇭', closeTime: '16/03/2026 15:30', countryType: 'TH' },
    { id: '3', title: 'အောင်ဘာလေထီ (ယခင်လ)', flag: '🇲🇲', closeTime: '01/03/2026 12:00', countryType: 'MM' },
];

const parseDate = (dateStr: string) => {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), 0).getTime();
};

const LotteryCard = ({ item }: { item: LotteryGame }) => {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState('');
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const targetTime = parseDate(item.closeTime);

        const calculateTime = () => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference <= 0) {
                setIsOpen(false);
                setTimeLeft('ပိတ်သွားပါပြီ');
            } else {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                const h = hours.toString().padStart(2, '0');
                const m = minutes.toString().padStart(2, '0');
                const s = seconds.toString().padStart(2, '0');
                setTimeLeft(days > 0 ? `${days} ရက် ${h}:${m}:${s}` : `${h}:${m}:${s}`);
                setIsOpen(true);
            }
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [item.closeTime]);

    const handlePress = () => {
        if (!isOpen) return;
        router.push({
            pathname: '/wallet-profile/lottery/deail',
            params: {
                title: item.title,
                country: item.countryType
            }
        });
    };

    return (
        <Pressable
            style={({ pressed }) => [styles.cardContainer, pressed && isOpen ? { opacity: 0.8, transform: [{ scale: 0.98 }] } : null]}
            onPress={handlePress}
            disabled={!isOpen}
        >
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <View style={styles.flagBox}><Text style={styles.flagText}>{item.flag}</Text></View>
                    <View style={styles.titleWrapper}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.closeTimeText}>ပိတ်မည် - {item.closeTime}</Text>
                    </View>
                </View>
                {isOpen ? <Ionicons name="chevron-forward-circle" size={s(20, 24, 32)} color={THEME.neonGreen} /> : <Ionicons name="lock-closed" size={s(16, 20, 26)} color={THEME.danger} />}
            </View>
            <View style={styles.divider} />
            <View style={[styles.timerRow, !isOpen ? styles.timerRowClosed : null]}>
                <View style={styles.timerLabelRow}>
                    <Ionicons name={isOpen ? "time-outline" : "close-circle-outline"} size={s(14, 16, 22)} color={isOpen ? THEME.textMuted : THEME.danger} />
                    <Text style={styles.timerLabel}>{isOpen ? 'အချိန်ကျန်ပါသေးသည်' : 'ထိုး၍မရတော့ပါ'}</Text>
                </View>
                {isOpen ? (
                    <View style={styles.timerValueBox}><Text style={styles.timerValueText}>{timeLeft}</Text></View>
                ) : (
                    <Text style={styles.closedText}>CLOSED</Text>
                )}
            </View>
        </Pressable>
    );
};

export default function LotteryGamesScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, s(10, 15, 20)) }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={s(20, 26, 34)} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>ထီကစားရန် ရွေးချယ်ပါ</Text>
            </View>
            <FlatList
                data={LOTTERY_GAMES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <LotteryCard item={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, s(15, 20, 30)) }]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(12, 16, 24),
        paddingBottom: s(12, 15, 20),
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
        marginTop: s(15, 20, 30)
    },
    backButton: {
        width: s(34, 40, 50),
        height: s(34, 40, 50),
        borderRadius: s(17, 20, 25),
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
    listContent: {
        paddingHorizontal: s(12, 16, 24),
        paddingTop: s(15, 20, 30)
    },
    cardContainer: {
        backgroundColor: THEME.cardBg,
        borderRadius: s(12, 16, 22),
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        marginBottom: s(12, 16, 22),
        overflow: 'hidden'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: s(12, 16, 22)
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    flagBox: {
        width: s(40, 46, 56),
        height: s(40, 46, 56),
        borderRadius: s(20, 23, 28),
        backgroundColor: THEME.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(10, 14, 18),
        borderWidth: 1,
        borderColor: THEME.borderNormal
    },
    flagText: {
        fontSize: s(20, 24, 30)
    },
    titleWrapper: {
        flex: 1
    },
    cardTitle: {
        color: THEME.textWhite,
        fontSize: s(14, 16, 20),
        fontWeight: 'bold',
        marginBottom: s(2, 4, 6)
    },
    closeTimeText: {
        color: THEME.textMuted,
        fontSize: s(10, 12, 15)
    },
    divider: {
        height: 1,
        backgroundColor: THEME.borderNormal,
        marginHorizontal: s(12, 16, 22)
    },
    timerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: s(12, 16, 22),
        paddingVertical: s(10, 12, 16),
        backgroundColor: 'rgba(255, 255, 255, 0.02)'
    },
    timerRowClosed: {
        backgroundColor: 'rgba(255, 59, 48, 0.05)'
    },
    timerLabelRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    timerLabel: {
        color: THEME.textMuted,
        fontSize: s(10, 12, 15),
        fontWeight: '500',
        marginLeft: s(4, 6, 8)
    },
    timerValueBox: {
        backgroundColor: THEME.timerBg,
        paddingHorizontal: s(8, 10, 14),
        paddingVertical: s(3, 4, 6),
        borderRadius: s(4, 6, 8),
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.3)'
    },
    timerValueText: {
        color: THEME.neonGreen,
        fontSize: s(12, 14, 18),
        fontWeight: '900',
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
    },
    closedText: {
        color: THEME.danger,
        fontSize: s(11, 13, 16),
        fontWeight: 'bold',
        letterSpacing: 1
    }
});