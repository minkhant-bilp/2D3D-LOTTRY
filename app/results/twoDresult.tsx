import { MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const OPEN_TIME_PERIODS: Record<string, string> = {
    '12:01:00': 'Morning',
    '16:30:00': 'Evening',
};

type ResultEntry = { period: string; time: string; number: string; };
type HistoryDay = { id: string; date: string; results: ResultEntry[]; };

function formatStockDate(date: string) {
    const [, month, day] = date.split('-');
    const m = parseInt(month ?? '1', 10);
    const d = parseInt(day ?? '1', 10);
    const year = date.slice(0, 4);
    return `${d} ${MONTH_NAMES[m - 1] ?? ''} ${year}`;
}

function formatOpenTime(time: string) {
    const [h, m] = time.split(':');
    const hour = parseInt(h ?? '0', 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${suffix}`;
}

const RESULT_TABS = [
    { id: '2d', to: '/results/2d', label: '2D Results', description: 'Two-digit draws' },
    { id: '3d', to: '/results/3d', label: '3D Results', description: 'Three-digit draws' },
];

export default function TwoDResultsScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const [historyDays, setHistoryDays] = useState<HistoryDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            setTimeout(() => {
                const mockData = [
                    { stock_date: '2026-07-14', open_time: '11:00:00', twod: '38' },
                    { stock_date: '2026-07-14', open_time: '12:01:00', twod: '80' },
                    { stock_date: '2026-07-14', open_time: '15:00:00', twod: '80' },
                    { stock_date: '2026-07-14', open_time: '16:30:00', twod: '16' },
                    { stock_date: '2026-07-13', open_time: '11:00:00', twod: '35' },
                    { stock_date: '2026-07-13', open_time: '12:01:00', twod: '17' },
                ];

                const byDate = new Map<string, any[]>();
                for (const r of mockData) {
                    const key = r.stock_date;
                    if (!byDate.has(key)) byDate.set(key, []);
                    byDate.get(key)!.push(r);
                }

                const mapped = [...byDate.entries()].map(([date, entries]) => ({
                    id: date,
                    date: formatStockDate(date),
                    results: entries.map((r) => ({
                        period: OPEN_TIME_PERIODS[r.open_time] ?? formatOpenTime(r.open_time),
                        time: formatOpenTime(r.open_time),
                        number: r.twod,
                    })),
                }));

                setHistoryDays(mapped);
                setLoading(false);
            }, 800);
        } catch {
            setError('Unable to load 2D results. Please try again.');
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
                    <Text style={styles.eyebrow}>RESULT</Text>
                    <Text style={styles.title}>Recent History</Text>
                    <Text style={styles.desc}>Browse recent 2D and 3D draw cards.</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionTitle}>Recent History</Text>

                <View style={styles.tabsContainer}>
                    {RESULT_TABS.map((tab) => {
                        const isActive = pathname === tab.to || (pathname === '/' && tab.id === '2d');
                        return (
                            <Pressable
                                key={tab.id}
                                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                                onPress={() => router.push({ pathname: tab.to } as any)}
                            >
                                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                                <Text style={styles.tabDesc}>{tab.description}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#00e676" style={{ marginTop: 60 }} />
                ) : error ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : historyDays.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="inbox" size={48} color="#2A3A5C" />
                        <Text style={styles.emptyTitle}>No data here</Text>
                        <Text style={styles.emptyDesc}>No 2D results available yet.</Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {historyDays.map((day) => (
                            <View key={day.id} style={styles.dayCard}>
                                <Text style={styles.dayDate}>{day.date}</Text>

                                <View style={styles.resultsGrid}>
                                    {day.results.map((res, idx) => (
                                        <View key={`${day.id}-${idx}`} style={styles.resultBox}>
                                            <Text style={styles.resPeriod}>{res.period}</Text>
                                            <Text style={styles.resTime}>{res.time}</Text>
                                            <Text style={styles.resNumber}>{res.number}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#050A1F',
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: { marginRight: 16, paddingTop: 6 },
    headerTextContainer: { flex: 1 },
    eyebrow: {
        color: '#93C5FD',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    title: { color: '#F7F9FF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    desc: { color: '#8A9BB3', fontSize: 13, lineHeight: 20 },
    scrollContent: { padding: 20, paddingBottom: 40 },

    sectionTitle: { color: '#F7F9FF', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },

    tabsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    tabBtn: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'flex-start',
    },
    tabBtnActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        borderColor: 'rgba(59, 130, 246, 0.45)',
    },
    tabLabel: {
        color: '#C9D4E8',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    tabLabelActive: { color: '#93C5FD' },
    tabDesc: { color: '#8A9BB3', fontSize: 11 },

    listContainer: { gap: 16 },
    dayCard: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 16,
    },
    dayDate: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    resultsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    resultBox: {
        width: '48%',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resPeriod: {
        color: '#8A9BB3',
        fontSize: 13,
        marginBottom: 2,
    },
    resTime: {
        color: '#4B5563',
        fontSize: 11,
        marginBottom: 8,
    },
    resNumber: {
        color: '#00e676',
        fontSize: 26,
        fontWeight: 'bold',
    },

    errorBox: {
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 77, 77, 0.4)',
        borderRadius: 12,
        padding: 12,
    },
    errorText: { color: '#ff9b93', fontSize: 13 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyTitle: { color: '#4a5d7a', fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
    emptyDesc: { color: '#3a4d66', fontSize: 13 },
});