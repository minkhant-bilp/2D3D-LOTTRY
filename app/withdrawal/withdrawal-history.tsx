import { MaterialIcons } from '@expo/vector-icons';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { listWithdrawalsAPI } from '../../api/main';
import { listenForWithdrawalNotifications } from '../../utils/withdrawalNotificationBus';

type Withdrawal = {
    id: string;
    amount: number;
    currency: string;
    status: 'COMPLETED' | 'PENDING' | 'REJECTED';
    created_at: string;
    bank_snapshot: { bank_name: string };
};

const STATUS_CONFIG: Record<Withdrawal['status'], { labelKey: string; defaultLabel: string; bgColor: string; textColor: string; borderColor: string }> = {
    COMPLETED: { labelKey: 'status_completed', defaultLabel: 'Completed', bgColor: 'rgba(0, 230, 118, 0.12)', textColor: '#00e676', borderColor: 'rgba(0, 230, 118, 0.25)' },
    PENDING: { labelKey: 'status_pending', defaultLabel: 'Pending', bgColor: 'rgba(245, 158, 11, 0.12)', textColor: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.25)' },
    REJECTED: { labelKey: 'status_rejected', defaultLabel: 'Rejected', bgColor: 'rgba(239, 68, 68, 0.12)', textColor: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.25)' },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function WithdrawalHistoryScreen() {
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
        queryKey: ['withdrawals'],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await listWithdrawalsAPI({ page: pageParam, page_size: 20 });
            return {
                withdrawals: res.withdrawals || [],
                page: pageParam,
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.withdrawals.length === 20 ? lastPage.page + 1 : undefined;
        }
    });

    useEffect(() => {
        const unsubscribe = listenForWithdrawalNotifications(() => {
            console.log("🔄 [DEBUG] Withdrawal Notification Received. Refreshing Data...");
            queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
        });
        return () => unsubscribe();
    }, [queryClient]);

    const withdrawals = data?.pages.flatMap((page) => page.withdrawals) || [];

    const { completedCount, pendingCount, totalWithdrawn, currencyCode } = (() => {
        let completed = 0;
        let pending = 0;
        let total = 0;
        let curr = 'MMK';

        for (let i = 0; i < withdrawals.length; i++) {
            const w = withdrawals[i];
            if (i === 0 && w.currency) curr = w.currency;

            if (w.status === 'COMPLETED') {
                completed++;
                total += w.amount;
            } else if (w.status === 'PENDING') {
                pending++;
            }
        }
        return { completedCount: completed, pendingCount: pending, totalWithdrawn: total, currencyCode: curr };
    })();

    const renderItem = useCallback(({ item: w }: { item: Withdrawal }) => {
        const status = STATUS_CONFIG[w.status];
        return (
            <Pressable
                style={({ pressed }) => [styles.listItem, pressed && { opacity: 0.7 }]}
                onPress={() => router.push(`/withdrawal/${w.id}` as any)}
            >
                <View style={styles.listLeft}>
                    <Text style={styles.listTitle}>{t('withdraw_history.list_title', 'Withdrawal') as string}</Text>
                    <Text style={styles.listDate}>{formatDate(w.created_at)} · {w.bank_snapshot?.bank_name}</Text>
                </View>
                <View style={styles.listRight}>
                    <Text style={styles.listAmount}>-{w.amount.toLocaleString()} {w.currency}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.bgColor, borderColor: status.borderColor }]}>
                        <Text style={[styles.statusText, { color: status.textColor }]}>
                            {t(`withdraw_history.${status.labelKey}`, status.defaultLabel) as string}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    }, [t, router]);

    const renderHeader = () => (
        <>
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.requestBtn}
                onPress={() => router.push({ pathname: '/wallet-profile/withdrawal' } as any)}
            >
                <MaterialIcons name="add" size={20} color="#10B981" style={{ marginRight: 8 }} />
                <Text style={styles.requestBtnText}>{t('withdraw_history.request_btn', 'Request Withdrawal  →') as string}</Text>
            </TouchableOpacity>

            <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>{t('withdraw_history.stat_completed', 'COMPLETED') as string}</Text>
                    <Text style={styles.statValue}>{completedCount}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>{t('withdraw_history.stat_pending', 'PENDING') as string}</Text>
                    <Text style={styles.statValue}>{pendingCount}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>{t('withdraw_history.stat_total', 'TOTAL') as string}</Text>
                    <Text style={styles.statValue}>{totalWithdrawn.toLocaleString()} {currencyCode}</Text>
                </View>
            </View>
        </>
    );

    const renderEmptyComponent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="#00e676" style={{ marginTop: 60 }} />;
        }
        if (isError) {
            return (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyDesc, { color: '#EF4444' }]}>
                        {error?.message || (t('withdraw_history.err_fetch', 'Unable to load withdrawal history. Please try again.') as string)}
                    </Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyState}>
                <MaterialIcons name="inbox" size={32} color="#374151" style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>{t('withdraw_history.no_data', 'No data here') as string}</Text>
                <Text style={styles.emptyDesc}>
                    {t('withdraw_history.empty_desc', 'No withdrawal requests yet. Tap `+ Request Withdrawal` to get started.') as string}
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
                    <Text style={styles.eyebrow}>{t('withdraw_history.eyebrow', 'PAYOUTS') as string}</Text>
                    <Text style={styles.title}>{t('withdraw_history.title', 'Withdrawal History') as string}</Text>
                    <Text style={styles.desc}>{t('withdraw_history.desc', 'Track withdrawal requests and transfer status.') as string}</Text>
                </View>
            </View>

            <FlatList
                data={withdrawals}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyComponent}
                ListFooterComponent={renderFooterComponent}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />} // ကတ်များကြားရှိ 12px ခြားမှုကို ပြုလုပ်ပေးသည်
                contentContainerStyle={styles.scrollContent}
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
    eyebrow: { color: '#93C5FD', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 },
    title: { color: '#F7F9FF', fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
    desc: { color: '#8A9BB3', fontSize: 13, lineHeight: 20 },
    scrollContent: { padding: 20, paddingBottom: 40 },

    requestBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#042F21', borderWidth: 1, borderColor: '#10B981', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 20 },
    requestBtnText: { color: '#10B981', fontSize: 15, fontWeight: 'bold' },

    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 40 },
    statBox: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 14 },
    statLabel: { color: '#8A9BB3', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 6 },
    statValue: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },

    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 20 },
    emptyIcon: { marginBottom: 12, opacity: 0.8 },
    emptyTitle: { color: '#6B7280', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    emptyDesc: { color: '#4B5563', fontSize: 13, textAlign: 'center', lineHeight: 20 },

    listItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: 16 },
    listLeft: { flex: 1 },
    listTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    listDate: { color: '#8A9BB3', fontSize: 12 },
    listRight: { alignItems: 'flex-end' },
    listAmount: { color: '#F87171', fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
    statusBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
});