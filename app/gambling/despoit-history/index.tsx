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
    warning: '#FFB020',
    danger: '#FF4D4D',
    lottoBox: 'rgba(255,255,255,0.05)',
};

interface LottoRecord {
    id: string;
    drawDate: string;
    tickets: string[];
    totalAmount: string;

    status: 'waiting' | 'completed' | 'failed';
}

// 📊 (၃) နမူနာ Data
const LOTTO_HISTORY: LottoRecord[] = [
    {
        id: '1',
        drawDate: '၁ ဧပြီ ၂၀၂၆',
        tickets: ['က - ၁၂၃၄၅၆', 'ခ - ၆၅၄၃၂၁', 'ဂ - ၉၉၉၉၉၉'],
        totalAmount: '၆,၀၀၀ ကျပ်',
        status: 'waiting',
    },
    {
        id: '2',
        drawDate: '၁ မတ် ၂၀၂၆',
        tickets: ['င - ၁၁၁၂၂၂'],
        totalAmount: '၂,၀၀၀ ကျပ်',
        status: 'completed',
    },
    {
        id: '3',
        drawDate: '၁ မေ ၂၀၂၆',
        tickets: ['စ - ၉၈၇၆၅၄'],
        totalAmount: '၂,၀၀၀ ကျပ်',
        status: 'failed',
    }
];


const LottoCard = ({ item }: { item: LottoRecord }) => {
    const router = useRouter()

    const isWaiting = item.status === 'waiting';
    const isFailed = item.status === 'failed';
    const isCompleted = item.status === 'completed';


    let statusColor = THEME.neon;
    let statusText = 'ရလဒ်ထွက်ပါပြီ';
    let statusIcon: keyof typeof Ionicons.glyphMap = 'checkmark-circle-outline';

    if (isWaiting) {
        statusColor = THEME.warning;
        statusText = 'ရလဒ်စောင့်ဆိုင်း';
        statusIcon = 'time-outline';
    } else if (isFailed) {
        statusColor = THEME.danger;
        statusText = 'ပယ်ချခံရပါသည်';
        statusIcon = 'close-circle-outline';
    }

    return (
        <View style={[
            styles.card,
            isCompleted && styles.cardCompleted,
            isFailed && styles.cardFailed
        ]}>

            <View style={styles.cardTop}>
                <View style={styles.dateBox}>
                    <Ionicons name="calendar-outline" size={16} color={THEME.text} />
                    <Text style={styles.dateText}>{item.drawDate}</Text>
                </View>


                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: statusColor }]}>
                    <Ionicons name={statusIcon} size={14} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                </View>
            </View>


            <Text style={styles.ticketLabel}>ထိုးထားသော ဂဏန်းများ</Text>
            <View style={styles.ticketsContainer}>
                {item.tickets.map((ticket, index) => (
                    <View key={index} style={styles.ticketPill}>
                        <Ionicons name="ticket-outline" size={16} color={isFailed ? THEME.danger : THEME.neon} />
                        <Text style={styles.ticketText}>{ticket}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.divider} />


            <View style={styles.cardBottom}>
                <View>
                    <Text style={styles.totalLabel}>ထိုးကြေးစုစုပေါင်း</Text>
                    <Text style={[styles.totalAmount, isFailed && { color: THEME.danger }]}>{item.totalAmount}</Text>
                </View>

                {isFailed && (
                    <Pressable
                        style={styles.contactBtn}
                        onPress={() => router.navigate("/wallet-profile/help-center")}
                    >
                        <Ionicons name="headset-outline" size={16} color={THEME.danger} />
                        <Text style={styles.contactBtnText}>Admin ဆက်သွယ်ရန်</Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

export default function LottoHistoryScreen() {
    const router = useRouter();

    const isEmpty = LOTTO_HISTORY.length === 0;

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={THEME.text} />
                </Pressable>
                <Text style={styles.headerTitle}>ထီမှတ်တမ်း</Text>
                <View style={styles.placeholderBtn} />
            </View>

            <View style={styles.listContainer}>
                {isEmpty ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="receipt-outline" size={48} color={THEME.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>မှတ်တမ်း မရှိသေးပါ</Text>
                        <Text style={styles.emptySubtext}>
                            လက်ရှိမှာ သင်ထိုးထားသော ထီမှတ်တမ်း မရှိသေးပါ။
                        </Text>
                        <Pressable style={styles.emptyBtn} onPress={() => router.push('/buy-lotto' as any)}>
                            <Text style={styles.emptyBtnText}>ထီသွားထိုးမည်</Text>
                        </Pressable>
                    </View>
                ) : (
                    <FlatList
                        data={LOTTO_HISTORY}
                        renderItem={({ item }) => <LottoCard item={item} />}
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
        fontSize: 20,
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
        marginTop: -170,
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
    cardCompleted: {
        borderColor: 'rgba(0, 230, 118, 0.3)',
    },
    cardFailed: {
        borderColor: 'rgba(255, 77, 77, 0.4)',
        borderStyle: 'dashed',
    },

    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        color: THEME.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },

    ticketLabel: {
        color: THEME.muted,
        fontSize: 12,
        marginBottom: 10,
    },
    ticketsContainer: {
        flexDirection: 'column',
        gap: 8,
    },
    ticketPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.lottoBox,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        gap: 12,
    },
    ticketText: {
        color: THEME.text,
        fontSize: 16,
        fontWeight: 'bold',
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
        color: THEME.neon,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },


    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 77, 77, 0.3)',
        gap: 6,
    },
    contactBtnText: {
        color: THEME.danger,
        fontSize: 12,
        fontWeight: 'bold',
    },
});