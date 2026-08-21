import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { listTwoDResultsLastFiveDays } from '../../api/main';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const OPEN_TIME_PERIODS: Record<string, string> = {
    '12:01:00': 'period_morning',
    '16:30:00': 'period_evening',
};

type ResultEntry = { period: string; time: string; number: string; };
type HistoryDay = { id: string; date: string; results: ResultEntry[]; };
type TwoDResult = { twod?: string | null; stock_date?: string | null; open_time?: string | null; };

function formatStockDate(date: string, t: any) {
    const [, month, day] = date.split('-');
    const m = parseInt(month ?? '1', 10);
    const d = parseInt(day ?? '1', 10);
    const year = date.slice(0, 4);
    const monthName = MONTH_NAMES[m - 1] ?? '';
    const translatedMonth = t(`month.${monthName.toLowerCase()}`, monthName);
    return `${d} ${translatedMonth} ${year}`;
}

function formatOpenTime(time: string) {
    const [h, m] = time.split(':');
    const hour = parseInt(h ?? '0', 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${suffix}`;
}

function mapToHistoryDays(results: TwoDResult[], t: any): HistoryDay[] {
    const byDate = new Map<string, TwoDResult[]>();
    for (const r of results) {
        const key = r.stock_date ?? 'Unknown';
        if (!byDate.has(key)) byDate.set(key, []);
        byDate.get(key)!.push(r);
    }

    return [...byDate.entries()].map(([date, entries]) => ({
        id: date,
        date: date === 'Unknown' ? date : formatStockDate(date, t),
        results: [...entries]
            .sort((a, b) => (a.open_time ?? '').localeCompare(b.open_time ?? ''))
            .map((r) => {
                const periodKey = OPEN_TIME_PERIODS[r.open_time ?? ''];
                const periodLabel = periodKey ? t(`twod_result.${periodKey}`, periodKey.replace('period_', '')) : (r.open_time ? formatOpenTime(r.open_time) : '—');

                return {
                    period: periodLabel as string,
                    time: r.open_time != null ? formatOpenTime(r.open_time) : '—',
                    number: r.twod ?? '—',
                }
            }),
    }));
}

const RESULT_TABS = [
    { id: '2d', to: '/results/twoDresult', labelKey: 'tab_2d_label', descKey: 'tab_2d_desc', defaultLabel: '2D Results', defaultDesc: 'Two-digit draws' },
    { id: '3d', to: '/results/threeDresult', labelKey: 'tab_3d_label', descKey: 'tab_3d_desc', defaultLabel: '3D Results', defaultDesc: 'Three-digit draws' },
];

export default function TwoDResultsScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const { t } = useTranslation();

    const { data: rawResults, isLoading, isError, error } = useQuery({
        queryKey: ['twoDResultsLastFiveDays'],
        queryFn: async () => {
            const res: any = await listTwoDResultsLastFiveDays();
            return res?.data?.two_d_results || res?.two_d_results || [];
        },
    });

    const historyDays = mapToHistoryDays(rawResults || [], t);

    const renderDayCard = useCallback(({ item: day }: { item: HistoryDay }) => (
        <View style={styles.dayCard}>
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
    ), []);

    const renderHeader = () => (
        <View style={{ paddingBottom: 8 }}>
            <Text style={styles.sectionTitle}>{t('twod_result.section_title', 'Recent History') as string}</Text>
            <View style={styles.tabsContainer}>
                {RESULT_TABS.map((tab) => {
                    const isActive = pathname.includes('twoDresult') && tab.id === '2d';
                    return (
                        <Pressable
                            key={tab.id}
                            style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                            onPress={() => {
                                if (!isActive) router.replace(tab.to as any);
                            }}
                        >
                            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                {t(`twod_result.${tab.labelKey}`, tab.defaultLabel) as string}
                            </Text>
                            <Text style={styles.tabDesc}>
                                {t(`twod_result.${tab.descKey}`, tab.defaultDesc) as string}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );

    const renderEmptyState = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="#00e676" style={{ marginTop: 60 }} />;
        }
        if (isError) {
            return (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>
                        {(error as any)?.message || (t('twod_result.err_fetch', 'Unable to load 2D results. Please try again.') as string)}
                    </Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyState}>
                <MaterialIcons name="inbox" size={48} color="#2A3A5C" />
                <Text style={styles.emptyTitle}>{t('twod_result.no_data', 'No data here') as string}</Text>
                <Text style={styles.emptyDesc}>{t('twod_result.empty_desc', 'No 2D results available yet.') as string}</Text>
            </View>
        );
    };

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>{t('twod_result.eyebrow', 'RESULT') as string}</Text>
                    <Text style={styles.title}>{t('twod_result.title', 'Recent History') as string}</Text>
                    <Text style={styles.desc}>{t('twod_result.desc', 'Browse recent 2D and 3D draw cards.') as string}</Text>
                </View>
            </View>

            <FlatList
                data={historyDays}
                keyExtractor={(item) => item.id}
                renderItem={renderDayCard}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}

                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
            />
            <View style={{ height: 60 }}></View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },
    header: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    backBtn: { marginRight: 16, paddingTop: 6 },
    headerTextContainer: { flex: 1 },
    eyebrow: { color: '#93C5FD', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
    title: { color: '#F7F9FF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    desc: { color: '#8A9BB3', fontSize: 13, lineHeight: 20 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    sectionTitle: { color: '#F7F9FF', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },

    tabsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
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
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.45)',
    },
    tabLabel: { color: '#C9D4E8', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    tabLabelActive: { color: '#10B981' },
    tabDesc: { color: '#8A9BB3', fontSize: 11 },

    dayCard: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 16 },
    dayDate: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 16 },

    resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    resultBox: {
        width: '48%',
        marginBottom: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },

    resPeriod: { color: '#8A9BB3', fontSize: 13, marginBottom: 2 },
    resTime: { color: '#4B5563', fontSize: 11, marginBottom: 8 },
    resNumber: { color: '#00e676', fontSize: 26, fontWeight: 'bold' },

    errorBox: { backgroundColor: 'rgba(255, 77, 77, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 77, 77, 0.4)', borderRadius: 12, padding: 12 },
    errorText: { color: '#ff9b93', fontSize: 13 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyTitle: { color: '#4a5d7a', fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
    emptyDesc: { color: '#3a4d66', fontSize: 13 },
});