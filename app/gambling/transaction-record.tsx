import { MaterialIcons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listWalletTransactionsAPI } from '../../api/main';
import { useAppStore } from '../../store/useAppStore';

type WalletTransactionType = 'DEPOSIT' | 'BET_PLACE' | 'BET_WIN' | 'BET_REFUND' | 'WITHDRAWAL' | 'WITHDRAWAL_REFUND' | 'ADJUSTMENT';
type FilterType = WalletTransactionType | null;

type WalletTransaction = {
    id: string;
    type: WalletTransactionType;
    direction: 'CREDIT' | 'DEBIT';
    amount: number;
    balance_after: number;
    note?: string;
    created_at: string;
};

const TYPE_CONFIG: Record<WalletTransactionType, { label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }> = {
    DEPOSIT: { label: 'Deposit', icon: 'account-balance-wallet', color: '#10B981' },
    BET_PLACE: { label: 'Bet Placed', icon: 'casino', color: '#FBBF24' },
    BET_WIN: { label: 'Bet Win', icon: 'emoji-events', color: '#10B981' },
    BET_REFUND: { label: 'Bet Refunded', icon: 'undo', color: '#60A5FA' },
    WITHDRAWAL: { label: 'Withdrawal', icon: 'payments', color: '#F87171' },
    WITHDRAWAL_REFUND: { label: 'Withdrawal Refunded', icon: 'undo', color: '#60A5FA' },
    ADJUSTMENT: { label: 'Adjustment', icon: 'tune', color: '#C084FC' },
};

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
    { label: 'All', value: null },
    { label: 'Deposits', value: 'DEPOSIT' },
    { label: 'Bets', value: 'BET_PLACE' },
    { label: 'Wins', value: 'BET_WIN' },
    { label: 'Withdrawals', value: 'WITHDRAWAL' },
    { label: 'Adjustments', value: 'ADJUSTMENT' },
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TransactionRecordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const wallet = useAppStore((state: any) => state.wallet);
    const currency = wallet?.currency ?? 'MMK';
    const balance = wallet?.balance ?? 0;

    const [filter, setFilter] = useState<FilterType>(null);

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['walletTransactions', filter],
        queryFn: async ({ pageParam = 1 }) => {
            const params: any = { page: pageParam, page_size: 20 };
            if (filter) params.type = filter;

            const res = await listWalletTransactionsAPI(params);
            return {
                transactions: res?.data?.transactions || res?.transactions || [],
                page: pageParam,
            };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.transactions.length === 20 ? lastPage.page + 1 : undefined;
        }
    });

    const transactions = useMemo(() => {
        return data?.pages.flatMap((page) => page.transactions) || [];
    }, [data]);

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>WALLET</Text>
                    <Text style={styles.title}>Transaction Record</Text>
                    <Text style={styles.desc}>Your complete wallet activity ledger.</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.balanceBox}>
                    <MaterialIcons name="account-balance-wallet" size={20} color="#10B981" />
                    <Text style={styles.balanceText}>
                        Balance: <Text style={styles.balanceAmount}>{balance.toLocaleString()} {currency}</Text>
                    </Text>
                </View>

                <View style={styles.filterContainer}>
                    {FILTER_OPTIONS.map((opt) => {
                        const isActive = filter === opt.value;
                        return (
                            <Pressable
                                key={String(opt.value)}
                                onPress={() => setFilter(opt.value)}
                                style={[styles.filterChip, isActive && styles.filterChipActive]}
                            >
                                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 60 }} />
                ) : isError ? (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyDesc, { color: '#EF4444' }]}>
                            {error?.message || 'Unable to load transactions. Please try again.'}
                        </Text>
                    </View>
                ) : transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconWrapper}>
                            <MaterialIcons name="inbox" size={32} color="#374151" style={styles.emptyIcon} />
                        </View>
                        <Text style={styles.emptyTitle}>No data here</Text>
                        <Text style={styles.emptyDesc}>
                            No transactions yet.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {transactions.map((txn: WalletTransaction) => {
                            const cfg = TYPE_CONFIG[txn.type] || TYPE_CONFIG.ADJUSTMENT;
                            const isCredit = txn.direction === 'CREDIT';
                            return (
                                <View key={txn.id} style={styles.listItem}>
                                    <View style={styles.listIconWrapper}>
                                        <MaterialIcons name={cfg.icon} size={24} color={cfg.color} />
                                    </View>
                                    <View style={styles.listCenter}>
                                        <Text style={styles.listTitle} numberOfLines={1}>{cfg.label}</Text>
                                        <Text style={styles.listDate}>
                                            {formatDate(txn.created_at)}
                                            {txn.note && ` · ${txn.note}`}
                                        </Text>
                                    </View>
                                    <View style={styles.listRight}>
                                        <Text style={[styles.listAmount, { color: isCredit ? '#10B981' : '#F87171' }]}>
                                            {isCredit ? '+' : '-'}{Number(txn.amount).toLocaleString()}
                                        </Text>
                                        <Text style={styles.listBal}>Bal: {Number(txn.balance_after).toLocaleString()}</Text>
                                    </View>
                                </View>
                            );
                        })}

                        {hasNextPage && (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.loadMoreBtn}
                                onPress={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? (
                                    <ActivityIndicator size="small" color="#8A9BB3" />
                                ) : (
                                    <Text style={styles.loadMoreText}>Load More</Text>
                                )}
                            </TouchableOpacity>
                        )}
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
    eyebrow: { color: '#93C5FD', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
    title: { color: '#F7F9FF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    desc: { color: '#8A9BB3', fontSize: 13, lineHeight: 20 },
    scrollContent: { padding: 20, paddingBottom: 40 },

    balanceBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 16, marginBottom: 20 },
    balanceText: { color: '#8A9BB3', fontSize: 14, marginLeft: 12 },
    balanceAmount: { color: '#FFFFFF', fontWeight: 'bold' },

    filterContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
    filterChip: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
    filterChipActive: { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.4)' },
    filterChipText: { color: '#8A9BB3', fontSize: 12, fontWeight: 'bold' },
    filterChipTextActive: { color: '#10B981' },

    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 20 },
    emptyIconWrapper: { marginBottom: 16 },
    emptyIcon: { opacity: 0.8 },
    emptyTitle: { color: '#6B7280', fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
    emptyDesc: { color: '#4B5563', fontSize: 13, textAlign: 'center' },

    listContainer: { gap: 12 },
    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(11, 19, 43, 0.94)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 16 },
    listIconWrapper: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: 'rgba(255, 255, 255, 0.03)' },
    listCenter: { flex: 1, paddingRight: 8 },
    listTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    listDate: { color: '#8A9BB3', fontSize: 11 },
    listRight: { alignItems: 'flex-end' },
    listAmount: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    listBal: { color: '#8A9BB3', fontSize: 10 },

    loadMoreBtn: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    loadMoreText: { color: '#8A9BB3', fontSize: 13, fontWeight: 'bold' }
});