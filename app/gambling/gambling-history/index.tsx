import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

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
    card: '#0B132B',
    border: 'rgba(255,255,255,0.08)',
    text: '#FFFFFF',
    muted: '#8A9BB3',
    neon: '#00E676',

    color2D: '#00B2FF',
    color3D: '#FF8A00',
    colorLotto: '#E11D48',
};

interface BetRecord {
    id: string;
    type: '2D' | '3D' | 'ထီ';
    date: string;
    drawTime: string;
    numbers: string[];
    totalAmount: string;
}

const BET_HISTORY: BetRecord[] = [
    {
        id: '1',
        type: '2D',
        date: '6 March 2026',
        drawTime: '12:01 PM',
        numbers: ['53', '12', '99', '00'],
        totalAmount: '4,000 Ks',
    },
    {
        id: '2',
        type: '3D',
        date: '16 March 2026',
        drawTime: '03:30 PM',
        numbers: ['123', '456'],
        totalAmount: '2,000 Ks',
    },
    {
        id: '3',
        type: 'ထီ',
        date: '1 April 2026',
        drawTime: '04:00 PM',
        numbers: ['က - ၁၂၃၄၅၆', 'ခ - ၆၅၄၃၂၁'],
        totalAmount: '4,000 Ks',
    }
];

const BetCard = ({ item }: { item: BetRecord }) => {

    let typeColor = THEME.color2D;
    if (item.type === '3D') typeColor = THEME.color3D;
    if (item.type === 'ထီ') typeColor = THEME.colorLotto;

    return (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <View style={[styles.typeBadge, { backgroundColor: `${typeColor}20`, borderColor: typeColor }]}>
                    <Text style={[styles.typeText, { color: typeColor }]}>{item.type}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.dateText}>{item.date}</Text>
                    <Text style={styles.timeText}>{item.drawTime} ပွဲစဉ်</Text>
                </View>
            </View>

            <View style={styles.numbersContainer}>
                {item.numbers.map((num, index) => (
                    <View key={index} style={styles.numberPill}>
                        <Text style={styles.numberText}>{num}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBottom}>
                <Text style={styles.totalLabel}>စုစုပေါင်း ကျသင့်ငွေ</Text>
                <Text style={styles.totalAmount}>{item.totalAmount}</Text>
            </View>
        </View>
    );
};

export default function MyBetsHistoryScreen() {
    const router = useRouter();

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={s(20, 24, 30)} color={THEME.text} />
                </Pressable>
                <Text style={styles.headerTitle}>ထိုးထားသော မှတ်တမ်း</Text>
                <View style={styles.placeholderBtn} />
            </View>

            <View style={styles.listContainer}>
                <FlatList
                    data={BET_HISTORY}
                    renderItem={({ item }) => <BetCard item={item} />}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: s(15, 20, 30),
        paddingTop: s(40, 50, 70),
        paddingBottom: s(15, 20, 30),
        backgroundColor: THEME.bg,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
    },
    backBtn: {
        width: s(38, 44, 54),
        height: s(38, 44, 54),
        borderRadius: s(12, 14, 18),
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: THEME.text,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold',
    },
    placeholderBtn: { width: s(38, 44, 54) },

    listContainer: { flex: 1 },
    listContent: {
        padding: s(15, 20, 30),
        paddingBottom: s(30, 40, 60),
    },

    card: {
        backgroundColor: THEME.card,
        borderRadius: s(16, 20, 24),
        padding: s(14, 18, 24),
        marginBottom: s(12, 16, 22),
        borderWidth: 1,
        borderColor: THEME.border,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: s(12, 16, 20),
    },

    typeBadge: {
        paddingHorizontal: s(10, 12, 16),
        paddingVertical: s(4, 6, 8),
        borderRadius: s(8, 10, 14),
        borderWidth: 1,
    },
    typeText: {
        fontSize: s(12, 14, 16),
        fontWeight: '900',
    },

    dateText: {
        color: THEME.text,
        fontSize: s(11, 13, 15),
        fontWeight: 'bold',
        marginBottom: s(2, 2, 4),
    },
    timeText: {
        color: THEME.muted,
        fontSize: s(10, 11, 13),
    },

    numbersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: s(6, 10, 14),
    },
    numberPill: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: s(12, 16, 22),
        paddingVertical: s(8, 10, 14),
        borderRadius: s(10, 12, 16),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    numberText: {
        color: THEME.neon,
        fontSize: s(16, 18, 24),
        fontWeight: '900',
        letterSpacing: 1,
    },

    divider: {
        height: 1,
        backgroundColor: THEME.border,
        marginVertical: s(12, 16, 20),
    },

    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        color: THEME.muted,
        fontSize: s(11, 13, 15),
        fontWeight: '600',
    },
    totalAmount: {
        color: THEME.text,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold',
    },
});