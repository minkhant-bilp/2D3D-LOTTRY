import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const THEME = {
    bg: '#050A1F',
    card: '#0B132B',
    border: 'rgba(255,255,255,0.08)',
    text: '#FFFFFF',
    muted: '#8A9BB3',
    neon: '#00E676',
    boxBg: 'rgba(255,255,255,0.03)',

    warn: '#FFB020',
    warnBg: 'rgba(255,176,32,0.12)',
    warnBorder: 'rgba(255,176,32,0.25)',

    okBg: 'rgba(0,230,118,0.10)',
    okBorder: 'rgba(0,230,118,0.25)',
};

type Tab = 'CHAI' | 'LOTTO';

type ChaiRecord = {
    id: string;
    date: string;
    type: '2D' | '3D';
    number: string;
    amount: string;
    status: 'PENDING' | 'WIN' | 'LOSE';
};

type LottoRecord = {
    id: string;
    drawDate: string;
    tickets: string[];
    totalAmount: string;
    status: 'waiting' | 'completed';
};

const CHAI_DATA: ChaiRecord[] = [
    { id: 'c1', date: '6 March 2026', type: '2D', number: '53', amount: '5,000', status: 'PENDING' },
    { id: 'c2', date: '6 March 2026', type: '3D', number: '123', amount: '3,000', status: 'WIN' },
    { id: 'c3', date: '5 March 2026', type: '2D', number: '08', amount: '1,500', status: 'LOSE' },
];

const LOTTO_DATA: LottoRecord[] = [
    {
        id: 'l1',
        drawDate: '၁ ဧပြီ ၂၀၂၆',
        tickets: ['က - ၁၂၃၄၅၆', 'ခ - ၆၅၄၃၂၁'],
        totalAmount: '၄,၀၀၀ ကျပ်',
        status: 'waiting',
    },
    {
        id: 'l2',
        drawDate: '၁ မတ် ၂၀၂၆',
        tickets: ['င - ၁၁၁၂၂၂'],
        totalAmount: '၂,၀၀၀ ကျပ်',
        status: 'completed',
    },
];

export default function RecordsHub() {
    const [tab, setTab] = useState<Tab>('CHAI');

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <View style={styles.logo}>
                    <Ionicons name="albums-outline" size={26} color={THEME.neon} />
                </View>
                <Text style={styles.title}>Records</Text>
                <Text style={styles.subtitle}>Chai bets and Lotto tickets are separated for easy checking.</Text>
            </View>

            <View style={styles.tabs}>
                <TabBtn title="Chai Records" active={tab === 'CHAI'} onPress={() => setTab('CHAI')} icon="bar-chart-outline" />
                <TabBtn title="Lotto Records" active={tab === 'LOTTO'} onPress={() => setTab('LOTTO')} icon="ticket-outline" />
            </View>

            {tab === 'CHAI' ? (
                <FlatList
                    data={CHAI_DATA}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => <ChaiCard item={item} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Empty text="No Chai records yet." />}
                />
            ) : (
                <FlatList
                    data={LOTTO_DATA}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => <LottoCard item={item} />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Empty text="No Lotto records yet." />}
                />
            )}
        </View>
    );
}

function TabBtn({
    title,
    active,
    onPress,
    icon,
}: {
    title: string;
    active: boolean;
    onPress: () => void;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
    return (
        <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
            <Ionicons name={icon} size={18} color={active ? THEME.neon : THEME.muted} />
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
        </Pressable>
    );
}

function ChaiCard({ item }: { item: ChaiRecord }) {
    const badgeStyle =
        item.status === 'PENDING'
            ? styles.badgePending
            : item.status === 'WIN'
                ? styles.badgeWin
                : styles.badgeLose;

    return (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <View style={styles.chip}>
                    <Ionicons name="pricetag-outline" size={14} color={THEME.neon} />
                    <Text style={styles.chipText}>{item.type}</Text>
                </View>

                <View style={[styles.badge, badgeStyle]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                </View>
            </View>

            <Text style={styles.bigNumber}>{item.number}</Text>

            <View style={styles.metaRow}>
                <Meta icon="calendar-outline" text={item.date} />
                <Meta icon="cash-outline" text={`${item.amount} MMK`} />
            </View>
        </View>
    );
}

function LottoCard({ item }: { item: LottoRecord }) {
    const isWaiting = item.status === 'waiting';
    const statusColor = isWaiting ? THEME.warn : THEME.neon;
    const statusText = isWaiting ? 'Waiting' : 'Result Out';
    const statusIcon = isWaiting ? 'time-outline' : 'checkmark-circle-outline';

    return (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <View style={styles.dateBox}>
                    <Ionicons name="calendar-outline" size={14} color={THEME.muted} />
                    <Text style={styles.metaText}>{item.drawDate}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15`, borderColor: statusColor }]}>
                    <Ionicons name={statusIcon} size={14} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                </View>
            </View>

            <Text style={styles.sectionLabel}>Tickets</Text>

            <View style={styles.ticketList}>
                {item.tickets.map((t, idx) => (
                    <View key={idx} style={styles.ticketPill}>
                        <Ionicons name="ticket-outline" size={16} color={THEME.neon} />
                        <Text style={styles.ticketText}>{t}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBottom}>
                <Text style={styles.totalLabel}>Total Bet</Text>
                <Text style={styles.totalAmount}>{item.totalAmount}</Text>
            </View>
        </View>
    );
}

function Meta({ icon, text }: { icon: React.ComponentProps<typeof Ionicons>['name']; text: string }) {
    return (
        <View style={styles.metaItem}>
            <Ionicons name={icon} size={14} color={THEME.muted} />
            <Text style={styles.metaText}>{text}</Text>
        </View>
    );
}

function Empty({ text }: { text: string }) {
    return (
        <View style={styles.empty}>
            <Ionicons name="information-circle-outline" size={20} color={THEME.muted} />
            <Text style={styles.emptyText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: THEME.bg },

    header: { alignItems: 'center', paddingTop: 16, paddingBottom: 12 },
    logo: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: 'rgba(0,230,118,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(0,230,118,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    title: { color: THEME.text, fontSize: 28, fontWeight: '900' },
    subtitle: { color: THEME.muted, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18, paddingHorizontal: 16 },

    tabs: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 8 },
    tabBtn: {
        flex: 1,
        height: 50,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: 'rgba(255,255,255,0.02)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    tabBtnActive: { backgroundColor: 'rgba(0,230,118,0.10)', borderColor: 'rgba(0,230,118,0.25)' },
    tabText: { color: THEME.muted, fontSize: 13, fontWeight: '900' },
    tabTextActive: { color: THEME.neon },

    listContent: { padding: 16, paddingBottom: 24 },

    card: {
        backgroundColor: THEME.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: THEME.border,
        padding: 14,
        marginBottom: 12,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(0,230,118,0.25)',
        backgroundColor: 'rgba(0,230,118,0.08)',
    },
    chipText: { color: THEME.neon, fontSize: 12, fontWeight: '900' },

    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
    badgePending: { backgroundColor: 'rgba(255,176,32,0.10)', borderColor: 'rgba(255,176,32,0.25)' },
    badgeWin: { backgroundColor: 'rgba(0,230,118,0.10)', borderColor: 'rgba(0,230,118,0.25)' },
    badgeLose: { backgroundColor: 'rgba(255,59,48,0.10)', borderColor: 'rgba(255,59,48,0.25)' },
    badgeText: { color: THEME.text, fontSize: 12, fontWeight: '900' },

    bigNumber: { color: THEME.text, fontSize: 34, fontWeight: '900', marginTop: 10 },

    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { color: THEME.muted, fontSize: 12, fontWeight: '700' },

    dateBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: { fontSize: 11, fontWeight: '900' },

    sectionLabel: { color: THEME.muted, fontSize: 12, marginTop: 12, marginBottom: 10, fontWeight: '800' },

    ticketList: { gap: 8 },
    ticketPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: THEME.boxBg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    ticketText: { color: THEME.text, fontSize: 16, fontWeight: '900', letterSpacing: 1 },

    divider: { height: 1, backgroundColor: THEME.border, marginVertical: 16 },

    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { color: THEME.muted, fontSize: 13, fontWeight: '700' },
    totalAmount: { color: THEME.neon, fontSize: 18, fontWeight: '900' },

    empty: {
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.boxBg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
    },
    emptyText: { color: THEME.muted, fontSize: 13, fontWeight: '800' },
});