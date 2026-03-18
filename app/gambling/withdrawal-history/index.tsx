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
};

interface WinningRecord {
    id: string;
    winNumber: string;
    winAmount: string;
    method: string;
    account: string;
    date: string;
    status: 'pending' | 'success';
}

const WINNING_HISTORY: WinningRecord[] = [
    {
        id: '1',
        winNumber: '53',
        winAmount: '80,000 Ks',
        method: 'KBZ Pay',
        account: '09*********',
        date: '6 March 2026, 12:30 PM',
        status: 'pending',
    },
    {
        id: '2',
        winNumber: '12',
        winAmount: '40,000 Ks',
        method: 'Wave Pay',
        account: '09*********',
        date: '5 March 2026, 04:15 PM',
        status: 'success',
    },
    {
        id: '3',
        winNumber: '12',
        winAmount: '40,000 Ks',
        method: 'Wave Pay',
        account: '09*********',
        date: '5 March 2026, 04:15 PM',
        status: 'success',
    },
];

const WinningCard = ({ item }: { item: WinningRecord }) => {
    const isPending = item.status === 'pending';
    const statusColor = isPending ? THEME.warning : THEME.neon;
    const statusText = isPending ? 'Admin စစ်ဆေးနေပါသည်' : 'ငွေလွှဲပြီးပါပြီ';
    const statusIcon = isPending ? 'time' : 'checkmark-circle';

    return (
        <View style={[
            styles.card,
            isPending ? styles.cardPending : styles.cardSuccess
        ]}>

            <View style={styles.cardTop}>
                <View style={styles.winNumberBox}>
                    <Text style={styles.winNumberLabel}>ပေါက်ဂဏန်း</Text>
                    <Text style={styles.winNumberText}>{item.winNumber}</Text>
                </View>

                <View style={styles.winAmountBox}>
                    <Text style={styles.winAmountLabel}>ရရှိမည့်ငွေ</Text>
                    <Text style={styles.winAmountText}>{item.winAmount}</Text>
                </View>
            </View>

            <View style={[styles.statusBox, { backgroundColor: `${statusColor}15` }]}>
                <Ionicons name={statusIcon} size={s(14, 18, 24)} color={statusColor} />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBottom}>
                <Text style={styles.infoTitle}>ငွေလက်ခံမည့် အကောင့် -</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="wallet-outline" size={s(14, 16, 20)} color={THEME.muted} />
                    <Text style={styles.infoText}>{item.method} ({item.account})</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={s(14, 16, 20)} color={THEME.muted} />
                    <Text style={styles.infoText}>{item.date}</Text>
                </View>
            </View>
        </View>
    );
};

export default function WinningHistoryScreen() {
    const router = useRouter();

    const isEmpty = WINNING_HISTORY.length === 0;

    return (
        <View style={styles.screen}>

            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={s(20, 24, 30)} color={THEME.text} />
                </Pressable>
                <Text style={styles.headerTitle}>ငွေထုတ်မှတ်တမ်း</Text>
                <View style={styles.placeholderBtn} />
            </View>

            <View style={styles.listContainer}>
                {isEmpty ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="wallet-outline" size={s(40, 48, 60)} color={THEME.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>မှတ်တမ်း မရှိသေးပါ</Text>
                        <Text style={styles.emptySubtext}>
                            လက်ရှိမှာ သင်ပေါက်ထားသော ငွေထုတ်မှတ်တမ်း မရှိသေးပါ။
                        </Text>

                        <Pressable style={styles.emptyBtn} onPress={() => router.replace('/')}>
                            <Text style={styles.emptyBtnText}>ကစားမည်</Text>
                        </Pressable>
                    </View>
                ) : (
                    <FlatList
                        data={WINNING_HISTORY}
                        renderItem={({ item }) => <WinningCard item={item} />}
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
        fontSize: s(16, 18, 24),
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
        marginTop: s(-140, -180, -220),
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
        padding: s(14, 18, 24),
        marginBottom: s(12, 16, 22),
        borderWidth: 1,
    },
    cardPending: {
        borderColor: THEME.warning,
        borderStyle: 'dashed',
    },
    cardSuccess: {
        borderColor: THEME.neon,
        borderStyle: 'solid',
        shadowColor: THEME.neon,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },

    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: s(12, 16, 20),
    },
    winNumberBox: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: s(12, 16, 20),
        paddingVertical: s(8, 10, 14),
        borderRadius: s(12, 14, 18),
    },
    winNumberLabel: {
        color: THEME.muted,
        fontSize: s(10, 11, 13),
        marginBottom: s(2, 4, 6),
    },
    winNumberText: {
        color: THEME.text,
        fontSize: s(20, 24, 32),
        fontWeight: '900',
    },
    winAmountBox: {
        alignItems: 'flex-end',
    },
    winAmountLabel: {
        color: THEME.muted,
        fontSize: s(10, 12, 14),
        marginBottom: s(2, 4, 6),
    },
    winAmountText: {
        color: THEME.neon,
        fontSize: s(18, 22, 28),
        fontWeight: 'bold',
    },

    statusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: s(8, 10, 14),
        borderRadius: s(10, 12, 16),
        gap: s(4, 6, 8),
    },
    statusText: {
        fontSize: s(11, 13, 15),
        fontWeight: 'bold',
    },

    divider: {
        height: 1,
        backgroundColor: THEME.border,
        marginVertical: s(12, 16, 20),
    },

    cardBottom: { gap: s(6, 8, 12) },
    infoTitle: {
        color: THEME.text,
        fontSize: s(11, 13, 15),
        fontWeight: '600',
        marginBottom: s(2, 4, 6),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(6, 8, 12),
    },
    infoText: {
        color: THEME.muted,
        fontSize: s(11, 13, 15),
    },
});