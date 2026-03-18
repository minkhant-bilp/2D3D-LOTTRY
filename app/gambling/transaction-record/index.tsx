import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';

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
    danger: '#FF4D4D',
    warning: '#FFB020',
};

type CategoryType = '2D' | '3D' | 'THAI' | 'MM';

interface TransactionRecord {
    id: string;
    category: CategoryType;
    date: string;
    time: string;
    numbers: string[];
    totalCount: number;
    amount: string;
    status: 'success' | 'failed' | 'pending';
}

const TRANSACTION_HISTORY: TransactionRecord[] = [
    {
        id: '1', category: '2D', date: '8 March 2026', time: '09:30 AM',
        numbers: ['00', '11'], totalCount: 2,
        amount: '2,000 Ks', status: 'failed'
    },
    {
        id: '2', category: '2D', date: '7 March 2026', time: '01:15 PM',
        numbers: ['77', '88'], totalCount: 2,
        amount: '2,000 Ks', status: 'pending'
    },
    {
        id: '3', category: '2D', date: '5 March 2026', time: '09:00 AM',
        numbers: ['15', '20'], totalCount: 2,
        amount: '2,000 Ks', status: 'success'
    },
    {
        id: '4', category: '3D', date: '8 March 2026', time: '02:15 PM',
        numbers: ['123', '456'], totalCount: 2,
        amount: '2,000 Ks', status: 'success'
    },
];

const TransactionCard = ({ item }: { item: TransactionRecord }) => {
    const router = useRouter();
    const isSuccess = item.status === 'success';
    const isPending = item.status === 'pending';
    const isFailed = item.status === 'failed';

    let statusColor = THEME.neon;
    let statusText = '';
    let statusIcon: keyof typeof Ionicons.glyphMap = 'checkmark-circle';

    if (isSuccess) {
        statusColor = THEME.neon;
        statusText = 'အောင်မြင်ပါသည်';
        statusIcon = 'checkmark-circle';
    } else if (isPending) {
        statusColor = THEME.warning;
        statusText = 'စစ်ဆေးနေပါသည်';
        statusIcon = 'time-outline';
    } else if (isFailed) {
        statusColor = THEME.danger;
        statusText = 'ပယ်ချခံရပါသည်';
        statusIcon = 'close-circle';
    }

    return (
        <View style={[styles.card, isFailed && styles.cardFailed]}>
            <View style={styles.cardTop}>
                <View>
                    <Text style={styles.numbersLabel}>ထိုးထားသော ဂဏန်းများ ({item.totalCount} ကွက်)</Text>
                    <Text style={styles.numbersText}>{item.numbers.join(', ')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.amountLabel}>ဖြတ်တောက်ငွေ</Text>
                    <Text style={[styles.amountText, { color: statusColor }]}>{item.amount}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBottom}>
                <Text style={styles.timeText}>{item.time}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
                    <Ionicons name={statusIcon} size={s(12, 14, 18)} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                </View>
            </View>

            {isFailed && (
                <Pressable style={styles.contactBtn} onPress={() => router.navigate("/wallet-profile/help-center")}>
                    <Ionicons name="headset-outline" size={s(14, 16, 20)} color={THEME.danger} />
                    <Text style={styles.contactBtnText}>Admin ဆက်သွယ်ရန်</Text>
                </Pressable>
            )}
        </View>
    );
};

const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
            <Ionicons name="wallet-outline" size={s(40, 48, 60)} color={THEME.muted} />
        </View>
        <Text style={styles.emptyTitle}>မှတ်တမ်း မရှိသေးပါ</Text>
        <Text style={styles.emptySubtext}>
            လက်ရှိရွေးချယ်ထားသော အကန့်တွင် ငွေစာရင်းမှတ်တမ်း မရှိသေးပါ။
        </Text>
    </View>
);

export default function LedgerScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<CategoryType>('2D');

    const filteredData = TRANSACTION_HISTORY.filter(item => item.category === activeTab);
    const isEmpty = filteredData.length === 0;

    const groupedData = filteredData.reduce((acc, item) => {
        const existingGroup = acc.find(g => g.title === item.date);
        if (existingGroup) {
            existingGroup.data.push(item);
        } else {
            acc.push({ title: item.date, data: [item] });
        }
        return acc;
    }, [] as { title: string; data: TransactionRecord[] }[]);

    const TODAY = '8 March 2026';
    const totalBetsToday = filteredData
        .filter(item => item.date === TODAY)
        .reduce((sum, item) => sum + item.totalCount, 0);

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={s(20, 24, 30)} color={THEME.text} />
                </Pressable>
                <Text style={styles.headerTitle}>ငွေစာရင်းမှတ်တမ်း</Text>
                <View style={styles.placeholderBtn} />
            </View>

            <View style={styles.tabWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
                    {(['2D', '3D', 'THAI', 'MM'] as CategoryType[]).map((tab) => {
                        const isActive = activeTab === tab;
                        const tabNames = { '2D': '2D ချဲ', '3D': '3D ချဲ', 'THAI': 'ထိုင်းထီ', 'MM': 'မြန်မာထီ' };

                        return (
                            <Pressable key={tab} style={[styles.tabBtn, isActive && styles.tabBtnActive]} onPress={() => setActiveTab(tab)}>
                                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                    {tabNames[tab]}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {!isEmpty && (
                <View style={styles.summaryBox}>
                    <Ionicons name="pie-chart-outline" size={s(20, 24, 30)} color={THEME.neon} />
                    <View style={styles.summaryTextContainer}>
                        <Text style={styles.summaryLabel}>ယနေ့ထိုးထားသော အရေအတွက်</Text>
                        <Text style={styles.summaryValue}>စုစုပေါင်း ({totalBetsToday}) ကွက်</Text>
                    </View>
                </View>
            )}

            <View style={styles.listContainer}>
                {isEmpty ? (
                    <EmptyState />
                ) : (
                    <SectionList
                        sections={groupedData}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        renderSectionHeader={({ section: { title } }) => (
                            <View style={styles.dateHeaderBox}>
                                <Text style={styles.dateHeaderText}>{title}</Text>
                            </View>
                        )}
                        renderItem={({ item }) => <TransactionCard item={item} />}
                    />
                )}
                <View style={{ height: 40 }}></View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: THEME.bg
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: s(15, 20, 30),
        paddingTop: s(40, 50, 70),
        paddingBottom: s(8, 10, 15),
        backgroundColor: THEME.bg
    },
    backBtn: {
        width: s(38, 44, 54),
        height: s(38, 44, 54),
        borderRadius: s(12, 14, 18),
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerTitle: {
        color: THEME.text,
        fontSize: s(18, 20, 26),
        fontWeight: 'bold'
    },
    placeholderBtn: {
        width: s(38, 44, 54)
    },

    tabWrapper: {
        paddingBottom: s(8, 10, 14)
    },
    tabContainer: {
        paddingHorizontal: s(15, 20, 30),
        gap: s(8, 10, 14)
    },
    tabBtn: {
        paddingHorizontal: s(16, 20, 28),
        paddingVertical: s(10, 12, 16),
        borderRadius: s(14, 16, 20),
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.border
    },
    tabBtnActive: {
        backgroundColor: 'rgba(0, 230, 118, 0.15)',
        borderColor: 'rgba(0, 230, 118, 0.3)'
    },
    tabText: {
        color: THEME.muted,
        fontSize: s(12, 14, 16),
        fontWeight: 'bold'
    },
    tabTextActive: {
        color: THEME.neon
    },

    summaryBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: s(15, 20, 30),
        marginBottom: s(12, 16, 20),
        padding: s(12, 16, 20),
        borderRadius: s(14, 16, 20),
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: THEME.border,
        gap: s(10, 14, 18)
    },
    summaryTextContainer: {
        flex: 1
    },
    summaryLabel: {
        color: THEME.muted,
        fontSize: s(10, 12, 14),
        marginBottom: s(2, 4, 6)
    },
    summaryValue: {
        color: THEME.text,
        fontSize: s(14, 16, 20),
        fontWeight: 'bold'
    },

    listContainer: {
        flex: 1
    },
    listContent: {
        paddingHorizontal: s(15, 20, 30),
        paddingBottom: s(30, 40, 60)
    },

    dateHeaderBox: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: s(10, 14, 18),
        paddingVertical: s(4, 6, 8),
        borderRadius: s(8, 10, 14),
        borderWidth: 1,
        borderColor: THEME.border,
        marginBottom: s(10, 12, 16),
        marginTop: s(4, 6, 10),
    },
    dateHeaderText: {
        color: THEME.text,
        fontSize: s(11, 13, 15),
        fontWeight: 'bold'
    },

    card: {
        backgroundColor: THEME.card,
        borderRadius: s(16, 20, 24),
        padding: s(14, 18, 24),
        marginBottom: s(12, 16, 20),
        borderWidth: 1,
        borderColor: THEME.border
    },
    cardFailed: {
        borderColor: 'rgba(255, 77, 77, 0.4)',
        borderStyle: 'dashed'
    },

    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    numbersLabel: {
        color: THEME.muted,
        fontSize: s(10, 12, 14),
        marginBottom: s(4, 6, 8)
    },
    numbersText: {
        color: THEME.text,
        fontSize: s(16, 18, 24),
        fontWeight: '900',
        letterSpacing: 1
    },

    amountLabel: {
        color: THEME.muted,
        fontSize: s(10, 12, 14),
        marginBottom: s(4, 6, 8)
    },
    amountText: {
        fontSize: s(16, 18, 24),
        fontWeight: 'bold'
    },

    divider: {
        height: 1,
        backgroundColor: THEME.border,
        marginVertical: s(10, 14, 18)
    },

    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    timeText: {
        color: THEME.muted,
        fontSize: s(10, 12, 14),
        fontWeight: '600'
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(8, 10, 14),
        paddingVertical: s(4, 6, 8),
        borderRadius: s(8, 10, 14),
        gap: s(2, 4, 6)
    },
    statusText: {
        fontSize: s(9, 11, 13),
        fontWeight: 'bold'
    },

    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
        paddingVertical: s(10, 12, 16),
        borderRadius: s(10, 12, 16),
        borderWidth: 1,
        borderColor: 'rgba(255, 77, 77, 0.3)',
        marginTop: s(10, 14, 18),
        gap: s(4, 6, 8),
    },
    contactBtnText: {
        color: THEME.danger,
        fontSize: s(11, 13, 15),
        fontWeight: 'bold'
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: s(20, 30, 50),
        marginTop: s(-80, -100, -120)
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
        marginBottom: s(15, 20, 30)
    },
    emptyTitle: {
        color: THEME.text,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold',
        marginBottom: s(6, 8, 12)
    },
    emptySubtext: {
        color: THEME.muted,
        fontSize: s(13, 14, 18),
        textAlign: 'center',
        lineHeight: s(20, 22, 28)
    },
});