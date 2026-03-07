import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
                {isOpen ? <Ionicons name="chevron-forward-circle" size={24} color={THEME.neonGreen} /> : <Ionicons name="lock-closed" size={20} color={THEME.danger} />}
            </View>
            <View style={styles.divider} />
            <View style={[styles.timerRow, !isOpen ? styles.timerRowClosed : null]}>
                <View style={styles.timerLabelRow}>
                    <Ionicons name={isOpen ? "time-outline" : "close-circle-outline"} size={16} color={isOpen ? THEME.textMuted : THEME.danger} />
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
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={26} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>ထီကစားရန် ရွေးချယ်ပါ</Text>
            </View>
            <FlatList
                data={LOTTERY_GAMES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <LotteryCard item={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom, 20) }]}
            />
        </View>
    );
}

// Styles 
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
        marginTop: 20
    },
    backButton: {
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
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 20
    },
    cardContainer: {
        backgroundColor: THEME.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        marginBottom: 16,
        overflow: 'hidden'
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    flagBox: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: THEME.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
        borderWidth: 1,
        borderColor: THEME.borderNormal
    },
    flagText: {
        fontSize: 24
    },
    titleWrapper: {
        flex: 1
    },
    cardTitle: {
        color: THEME.textWhite,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4
    },
    closeTimeText: {
        color: THEME.textMuted,
        fontSize: 12
    },
    divider: {
        height: 1,
        backgroundColor: THEME.borderNormal,
        marginHorizontal: 16
    },
    timerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
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
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 6
    },
    timerValueBox: {
        backgroundColor: THEME.timerBg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.3)'
    },
    timerValueText: {
        color: THEME.neonGreen,
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
    },
    closedText: {
        color: THEME.danger,
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 1
    }
});