import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

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


    const isEmpty = BET_HISTORY.length === 0;

    return (
        <View style={styles.screen}>

            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={THEME.text} />
                </Pressable>
                <Text style={styles.headerTitle}>ထိုးထားသော မှတ်တမ်း</Text>
                <View style={styles.placeholderBtn} />
            </View>


            <View style={styles.listContainer}>
                {isEmpty ? (

                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="ticket-outline" size={48} color={THEME.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>မှတ်တမ်း မရှိသေးပါ</Text>
                        <Text style={styles.emptySubtext}>
                            လက်ရှိမှာ သင်ထိုးထားသော ဂဏန်းမှတ်တမ်း မရှိသေးပါ။
                        </Text>

                        <Pressable style={styles.emptyBtn} onPress={() => router.replace('/')}>
                            <Text style={styles.emptyBtnText}>ဂဏန်းသွားထိုးမည်</Text>
                        </Pressable>
                    </View>
                ) : (
                    <FlatList
                        data={BET_HISTORY}
                        renderItem={({ item }) => <BetCard item={item} />}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                )}
                <View style={{ height: 30 }}></View>
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
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: THEME.bg,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: THEME.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeholderBtn: { width: 44 },


    listContainer: { flex: 1 },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },


    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        marginTop: -190,
    },
    emptyIconBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        color: THEME.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtext: {
        color: THEME.muted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    emptyBtn: {
        backgroundColor: THEME.neon,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
    },
    emptyBtnText: {
        color: THEME.bg,
        fontSize: 15,
        fontWeight: 'bold',
    },


    card: {
        backgroundColor: THEME.card,
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
    },
    typeText: {
        fontSize: 14,
        fontWeight: '900',
    },


    dateText: {
        color: THEME.text,
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    timeText: {
        color: THEME.muted,
        fontSize: 11,
    },

    numbersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    numberPill: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    numberText: {
        color: THEME.neon,
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
    },

    divider: {
        height: 1,
        backgroundColor: THEME.border,
        marginVertical: 16,
    },


    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        color: THEME.muted,
        fontSize: 13,
        fontWeight: '600',
    },
    totalAmount: {
        color: THEME.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
});