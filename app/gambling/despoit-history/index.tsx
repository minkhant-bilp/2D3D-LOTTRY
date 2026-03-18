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
                    <Ionicons name="calendar-outline" size={s(14, 16, 20)} color={THEME.text} />
                    <Text style={styles.dateText}>{item.drawDate}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: statusColor }]}>
                    <Ionicons name={statusIcon} size={s(12, 14, 18)} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                </View>
            </View>

            <Text style={styles.ticketLabel}>ထိုးထားသော ဂဏန်းများ</Text>
            <View style={styles.ticketsContainer}>
                {item.tickets.map((ticket, index) => (
                    <View key={index} style={styles.ticketPill}>
                        <Ionicons name="ticket-outline" size={s(14, 16, 20)} color={isFailed ? THEME.danger : THEME.neon} />
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
                        <Ionicons name="headset-outline" size={s(14, 16, 20)} color={THEME.danger} />
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
                    <Ionicons name="chevron-back" size={s(20, 24, 30)} color={THEME.text} />
                </Pressable>
                <Text style={styles.headerTitle}>ထီမှတ်တမ်း</Text>
                <View style={styles.placeholderBtn} />
            </View>

            <View style={styles.listContainer}>
                {isEmpty ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="receipt-outline" size={s(40, 48, 60)} color={THEME.muted} />
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
        fontSize: s(18, 20, 26),
        fontWeight: 'bold',
    },
    placeholderBtn: { width: s(38, 44, 54) },

    listContainer: { flex: 1 },
    listContent: {
        padding: s(15, 20, 30),
        paddingBottom: s(30, 40, 60),
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: s(20, 30, 50),
        marginTop: -170,
    },
    emptyIconBox: {
        width: s(80, 100, 140),
        height: s(80, 100, 140),
        borderRadius: s(40, 50, 70),
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: s(15, 20, 30),
    },
    emptyTitle: {
        color: THEME.text,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold',
        marginBottom: s(6, 8, 12),
    },
    emptySubtext: {
        color: THEME.muted,
        fontSize: s(13, 14, 18),
        textAlign: 'center',
        lineHeight: s(20, 22, 28),
        marginBottom: s(25, 30, 40),
    },
    emptyBtn: {
        backgroundColor: THEME.neon,
        paddingHorizontal: s(20, 24, 32),
        paddingVertical: s(12, 14, 18),
        borderRadius: s(12, 14, 18),
    },
    emptyBtnText: {
        color: THEME.bg,
        fontSize: s(14, 15, 18),
        fontWeight: 'bold',
    },

    card: {
        backgroundColor: THEME.card,
        borderRadius: s(16, 20, 24),
        padding: s(15, 18, 24),
        marginBottom: s(14, 16, 20),
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
        marginBottom: s(12, 16, 20),
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(4, 6, 8),
    },
    dateText: {
        color: THEME.text,
        fontSize: s(13, 14, 16),
        fontWeight: 'bold',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(8, 10, 14),
        paddingVertical: s(4, 6, 8),
        borderRadius: s(10, 12, 16),
        borderWidth: 1,
        gap: s(2, 4, 6),
    },
    statusText: {
        fontSize: s(10, 11, 13),
        fontWeight: 'bold',
    },

    ticketLabel: {
        color: THEME.muted,
        fontSize: s(11, 12, 14),
        marginBottom: s(8, 10, 14),
    },
    ticketsContainer: {
        flexDirection: 'column',
        gap: s(6, 8, 10),
    },
    ticketPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.lottoBox,
        paddingHorizontal: s(14, 16, 20),
        paddingVertical: s(10, 12, 16),
        borderRadius: s(12, 14, 18),
        gap: s(8, 12, 16),
    },
    ticketText: {
        color: THEME.text,
        fontSize: s(14, 16, 20),
        fontWeight: 'bold',
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
        fontSize: s(12, 13, 15),
        fontWeight: '600',
    },
    totalAmount: {
        color: THEME.neon,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold',
        marginTop: s(2, 4, 6),
    },

    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
        paddingHorizontal: s(10, 12, 16),
        paddingVertical: s(6, 8, 10),
        borderRadius: s(8, 10, 14),
        borderWidth: 1,
        borderColor: 'rgba(255, 77, 77, 0.3)',
        gap: s(4, 6, 8),
    },
    contactBtnText: {
        color: THEME.danger,
        fontSize: s(10, 12, 14),
        fontWeight: 'bold',
    },
});