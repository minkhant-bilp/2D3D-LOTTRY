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
    }
];


const WinningCard = ({ item }: { item: WinningRecord }) => {
    // Status ကို စစ်ဆေးခြင်း
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
                <Ionicons name={statusIcon} size={18} color={statusColor} />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBottom}>
                <Text style={styles.infoTitle}>ငွေလက်ခံမည့် အကောင့် -</Text>
                <View style={styles.infoRow}>
                    <Ionicons name="wallet-outline" size={16} color={THEME.muted} />
                    <Text style={styles.infoText}>{item.method} ({item.account})</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color={THEME.muted} />
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
                    <Ionicons name="chevron-back" size={24} color={THEME.text} />
                </Pressable>
                <Text style={styles.headerTitle}>ငွေထုတ်မှတ်တမ်း</Text>
                <View style={styles.placeholderBtn} />
            </View>


            <View style={styles.listContainer}>
                {isEmpty ? (

                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="wallet-outline" size={48} color={THEME.muted} />
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
        marginTop: -180,
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
        marginBottom: 16,
    },
    winNumberBox: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
    },
    winNumberLabel: {
        color: THEME.muted,
        fontSize: 11,
        marginBottom: 4,
    },
    winNumberText: {
        color: THEME.text,
        fontSize: 24,
        fontWeight: '900',
    },
    winAmountBox: {
        alignItems: 'flex-end',
    },
    winAmountLabel: {
        color: THEME.muted,
        fontSize: 12,
        marginBottom: 4,
    },
    winAmountText: {
        color: THEME.neon,
        fontSize: 22,
        fontWeight: 'bold',
    },

    statusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: 'bold',
    },

    divider: {
        height: 1,
        backgroundColor: THEME.border,
        marginVertical: 16,
    },

    cardBottom: { gap: 8 },
    infoTitle: {
        color: THEME.text,
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        color: THEME.muted,
        fontSize: 13,
    },
});