import { MaterialIcons } from '@expo/vector-icons';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { listBetsAPI } from '@/api/main';
import { listenForBetNotifications } from '@/utils/betNotificationBus';

type BetNumber = { number: string | number; amount: number };
type Bet = {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REFUNDED';
    bet_type: string;
    total_amount: string | number;
    currency: string;
    bet_numbers: BetNumber[];
    stock_date: string;
    target_opentime?: string | null;
};

const STATUS_CONFIG: Record<Bet['status'], { labelKey: string; defaultLabel: string; bgColor: string; textColor: string; borderColor: string }> = {
    PENDING: { labelKey: 'status_pending', defaultLabel: 'Pending', bgColor: 'rgba(245, 158, 11, 0.15)', textColor: '#FCD34D', borderColor: 'rgba(245, 158, 11, 0.25)' },
    ACCEPTED: { labelKey: 'status_accepted', defaultLabel: 'Accepted', bgColor: 'rgba(0, 230, 118, 0.12)', textColor: '#00e676', borderColor: 'rgba(0, 230, 118, 0.25)' },
    REJECTED: { labelKey: 'status_rejected', defaultLabel: 'Rejected', bgColor: 'rgba(239, 68, 68, 0.12)', textColor: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.25)' },
    REFUNDED: { labelKey: 'status_refunded', defaultLabel: 'Refunded', bgColor: 'rgba(59, 130, 246, 0.12)', textColor: '#60A5FA', borderColor: 'rgba(59, 130, 246, 0.25)' },
};

function formatOpenTime(time: string | null | undefined) {
    if (!time) return null;
    const [h, m] = time.split(':');
    const hour = parseInt(h ?? '0', 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${suffix}`;
}

function formatBetNumber(value: number | string | null | undefined, betType: string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '—';
    return String(value).padStart(betType === '3D' ? 3 : 2, '0');
}

export default function GamblingHistoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['betsHistory'],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await listBetsAPI({ page: pageParam, page_size: 15 });
            return {
                bets: res?.data?.bets || res?.bets || [],
                page: pageParam,
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.bets.length === 15 ? lastPage.page + 1 : undefined;
        }
    });

    useEffect(() => {
        const unsubscribe = listenForBetNotifications(() => {
            console.log("🔄 [DEBUG] Bet Notification Received. Refreshing Data...");
            queryClient.invalidateQueries({ queryKey: ['betsHistory'] });
        });
        return () => unsubscribe();
    }, [queryClient]);

    const bets = data?.pages.flatMap((page) => page.bets) || [];

    const renderItem = useCallback(({ item: bet }: { item: Bet }) => {
        const status = STATUS_CONFIG[bet.status] || STATUS_CONFIG.PENDING;
        return (
            <View style={styles.listItem}>
                <View style={styles.itemHeader}>
                    <View style={styles.betTypeBadge}>
                        <Text style={styles.betTypeText}>{bet.bet_type}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bgColor, borderColor: status.borderColor }]}>
                        <Text style={[styles.statusText, { color: status.textColor }]}>
                            {t(`bet_history.${status.labelKey}`, status.defaultLabel) as string}
                        </Text>
                    </View>
                </View>

                <View style={styles.amountContainer}>
                    <Text style={styles.wagerLabel}>{t('bet_history.total_wager', 'TOTAL WAGER') as string}</Text>
                    <Text style={styles.wagerAmount}>
                        {bet.total_amount} <Text style={styles.wagerCurrency}>{bet.currency}</Text>
                    </Text>
                </View>

                <View style={styles.numbersGrid}>
                    {bet.bet_numbers.map((n, i) => (
                        <View key={i} style={styles.numberBadge}>
                            <Text style={styles.numberText}>{formatBetNumber(n.number, bet.bet_type)}</Text>
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
    }, [t]);

    const renderEmptyComponent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="#00e676" style={{ marginTop: 60 }} />;
        }
        if (isError) {
            return (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyDesc, { color: '#EF4444' }]}>
                        {error?.message || (t('bet_history.err_fetch', 'Unable to load bet history. Please try again.') as string)}
                    </Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyState}>
                <View style={styles.emptyIconWrapper}>
                    <MaterialIcons name="inbox" size={32} color="#374151" style={styles.emptyIcon} />
                </View>
                <Text style={styles.emptyTitle}>{t('bet_history.no_data', 'No data here') as string}</Text>
                <Text style={styles.emptyDesc}>
                    {t('bet_history.empty_desc', 'လောင်းကြေး မရှိသေးပါ။ ပထမဆုံး\nလောင်းကြေးလုပ်ရန် Bets tab သို့ သွားပါ') as string}
                </Text>
            </View>
        );
    };

    const renderFooterComponent = () => {
        if (!isFetchingNextPage) return null;
        return <ActivityIndicator size="small" color="#8A9BB3" style={{ marginVertical: 20 }} />;
    };

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>{t('bet_history.eyebrow', 'လုပ်ဆောင်မှု') as string}</Text>
                    <Text style={styles.title}>{t('bet_history.title', 'လောင်းကြေးမှတ်တမ်း') as string}</Text>
                    <Text style={styles.desc}>{t('bet_history.desc', 'သင့်ယခင်လောင်းကြေးများ၊ ရလဒ်နှင့် ငွေပေးချေမှု အခြေအနေ') as string}</Text>
                </View>
            </View>

            <FlatList
                data={bets}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={renderEmptyComponent}
                ListFooterComponent={renderFooterComponent}
                contentContainerStyle={[styles.scrollContent, bets.length > 0 && { gap: 12 }]}
                showsVerticalScrollIndicator={false}

                onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }}
                onEndReachedThreshold={0.5}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
            />
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

    loadMoreBtn: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    loadMoreText: { color: '#8A9BB3', fontSize: 13, fontWeight: 'bold' }
});