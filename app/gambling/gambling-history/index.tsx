import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BetNumber = { number: string; amount: number };
type Bet = {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REFUNDED';
    bet_type: string;
    total_amount: number;
    currency: string;
    bet_numbers: BetNumber[];
    stock_date: string;
    target_opentime?: string | null;
};

const STATUS_CONFIG: Record<Bet['status'], { label: string; bgColor: string; textColor: string; borderColor: string }> = {
    PENDING: { label: 'Pending', bgColor: 'rgba(245, 158, 11, 0.15)', textColor: '#FCD34D', borderColor: 'rgba(245, 158, 11, 0.25)' },
    ACCEPTED: { label: 'Accepted', bgColor: 'rgba(0, 230, 118, 0.12)', textColor: '#00e676', borderColor: 'rgba(0, 230, 118, 0.25)' },
    REJECTED: { label: 'Rejected', bgColor: 'rgba(239, 68, 68, 0.12)', textColor: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.25)' },
    REFUNDED: { label: 'Refunded', bgColor: 'rgba(59, 130, 246, 0.12)', textColor: '#60A5FA', borderColor: 'rgba(59, 130, 246, 0.25)' },
};

function formatOpenTime(time: string | null | undefined) {
    if (!time) return null;
    const [h, m] = time.split(':');
    const hour = parseInt(h ?? '0', 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${suffix}`;
}

export default function GamblingHistoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [bets, setBets] = useState<Bet[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            setTimeout(() => {
                setBets([]);
                setLoading(false);
            }, 800);
        } catch {
            setError('Unable to load bet history. Please try again.');
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>လုပ်ဆောင်မှု</Text>
                    <Text style={styles.title}>လောင်းကြေးမှတ်တမ်း</Text>
                    <Text style={styles.desc}>သင့်ယခင်လောင်းကြေးများ၊ ရလဒ်နှင့် ငွေပေးချေမှု အခြေအနေ</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color="#00e676" style={{ marginTop: 60 }} />
                ) : error ? (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyDesc, { color: '#EF4444' }]}>{error}</Text>
                    </View>
                ) : bets.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrapper}>
                            <MaterialIcons name="inbox" size={32} color="#374151" style={styles.emptyIcon} />
                        </View>
                        <Text style={styles.emptyTitle}>No data here</Text>
                        <Text style={styles.emptyDesc}>
                            လောင်းကြေး မရှိသေးပါ။ ပထမဆုံး{'\n'}လောင်းကြေးလုပ်ရန် Bets tab သို့ သွားပါ
                        </Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {bets.map((bet) => {
                            const status = STATUS_CONFIG[bet.status];
                            return (
                                <View key={bet.id} style={styles.listItem}>
                                    <View style={styles.itemHeader}>
                                        <View style={styles.betTypeBadge}>
                                            <Text style={styles.betTypeText}>{bet.bet_type}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: status.bgColor, borderColor: status.borderColor }]}>
                                            <Text style={[styles.statusText, { color: status.textColor }]}>{status.label}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.amountContainer}>
                                        <Text style={styles.wagerLabel}>TOTAL WAGER</Text>
                                        <Text style={styles.wagerAmount}>
                                            {bet.total_amount} <Text style={styles.wagerCurrency}>{bet.currency}</Text>
                                        </Text>
                                    </View>

                                    <View style={styles.numbersGrid}>
                                        {bet.bet_numbers.map((n, i) => (
                                            <View key={i} style={styles.numberBadge}>
                                                <Text style={styles.numberText}>{String(n.number).padStart(2, '0')}</Text>
                                                <Text style={styles.numberAmount}>× {n.amount}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.metaRow}>
                                        <Text style={styles.metaDate}>{bet.stock_date}</Text>
                                        {formatOpenTime(bet.target_opentime) && (
                                            <View style={styles.timeBadge}>
                                                <MaterialIcons name="schedule" size={14} color="#00e676" />
                                                <Text style={styles.timeText}>{formatOpenTime(bet.target_opentime)}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },
    header: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    backBtn: { marginRight: 16, paddingTop: 6 },
    headerTextContainer: { flex: 1 },
    eyebrow: { color: '#93C5FD', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 6 },
    title: { color: '#F7F9FF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    desc: { color: '#8A9BB3', fontSize: 13, lineHeight: 20 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 20 },
    emptyIconWrapper: { marginBottom: 16 },
    emptyIcon: { opacity: 0.8 },
    emptyTitle: { color: '#6B7280', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
    emptyDesc: { color: '#4B5563', fontSize: 13, textAlign: 'center', lineHeight: 22 },
    listContainer: { gap: 12 },
    listItem: { backgroundColor: 'rgba(11, 19, 43, 0.94)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 16 },
    itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    betTypeBadge: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    betTypeText: { color: '#F7F9FF', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' },
    statusBadge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase' },
    amountContainer: { marginBottom: 12 },
    wagerLabel: { color: '#8A9BB3', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 },
    wagerAmount: { color: '#F7F9FF', fontSize: 18, fontWeight: 'bold' },
    wagerCurrency: { color: '#8A9BB3', fontSize: 12, fontWeight: 'normal' },
    numbersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    numberBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
    numberText: { color: '#E2E8F0', fontSize: 12, fontWeight: 'bold' },
    numberAmount: { color: '#8A9BB3', fontSize: 12 },
    metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    metaDate: { color: '#8A9BB3', fontSize: 11 },
    timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 230, 118, 0.1)', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    timeText: { color: '#00e676', fontSize: 11, fontWeight: 'bold' },
});