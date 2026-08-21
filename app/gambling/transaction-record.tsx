import { MaterialIcons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 🌟 Translation အတွက် Import လုပ်ပါသည်
import { useTranslation } from 'react-i18next';

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

// 🌟 Translation ချိတ်ဆက်ရန် labelKey များ ထည့်သွင်းထားပါသည်
const TYPE_CONFIG: Record<WalletTransactionType, { labelKey: string; defaultLabel: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }> = {
    DEPOSIT: { labelKey: 'type_deposit', defaultLabel: 'Deposit', icon: 'account-balance-wallet', color: '#10B981' },
    BET_PLACE: { labelKey: 'type_bet_place', defaultLabel: 'Bet Placed', icon: 'casino', color: '#FBBF24' },
    BET_WIN: { labelKey: 'type_bet_win', defaultLabel: 'Bet Win', icon: 'emoji-events', color: '#10B981' },
    BET_REFUND: { labelKey: 'type_bet_refund', defaultLabel: 'Bet Refunded', icon: 'undo', color: '#60A5FA' },
    WITHDRAWAL: { labelKey: 'type_withdrawal', defaultLabel: 'Withdrawal', icon: 'payments', color: '#F87171' },
    WITHDRAWAL_REFUND: { labelKey: 'type_withdrawal_refund', defaultLabel: 'Withdrawal Refunded', icon: 'undo', color: '#60A5FA' },
    ADJUSTMENT: { labelKey: 'type_adjustment', defaultLabel: 'Adjustment', icon: 'tune', color: '#C084FC' },
};

const FILTER_OPTIONS: { labelKey: string; defaultLabel: string; value: FilterType }[] = [
    { labelKey: 'filter_all', defaultLabel: 'All', value: null },
    { labelKey: 'filter_deposits', defaultLabel: 'Deposits', value: 'DEPOSIT' },
    { labelKey: 'filter_bets', defaultLabel: 'Bets', value: 'BET_PLACE' },
    { labelKey: 'filter_wins', defaultLabel: 'Wins', value: 'BET_WIN' },
    { labelKey: 'filter_withdrawals', defaultLabel: 'Withdrawals', value: 'WITHDRAWAL' },
    { labelKey: 'filter_adjustments', defaultLabel: 'Adjustments', value: 'ADJUSTMENT' },
];

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TransactionRecordScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    // 🧠 EINSTEIN OPTIMIZATION 1: Zustand Primitive Selectors အသုံးပြုခြင်း
    // Object တစ်ခုလုံး ဆွဲထုတ်ခြင်းကို ရှောင်ကြဉ်ပြီး Primitive တန်ဖိုးများကိုသာ ဆွဲထုတ်သဖြင့် မလိုအပ်ဘဲ Re-render ဖြစ်ခြင်းကို ကာကွယ်ပေးပါမည်။
    const currency = useAppStore((state: any) => state.wallet?.currency ?? 'MMK');
    const balance = useAppStore((state: any) => state.wallet?.balance ?? 0);

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

    // 🧠 EINSTEIN OPTIMIZATION 2: React Compiler ၏ စွမ်းရည်ကို အပြည့်အဝအသုံးပြု၍ useMemo အပိုကို ဖယ်ရှားပါသည်
    const transactions = data?.pages.flatMap((page) => page.transactions) || [];

    // 🧠 EINSTEIN OPTIMIZATION 3: FlatList အတွက် renderItem ကို useCallback ဖြင့် သီးသန့် ထုတ်ထားပါသည်
    const renderItem = useCallback(({ item: txn }: { item: WalletTransaction }) => {
        const cfg = TYPE_CONFIG[txn.type] || TYPE_CONFIG.ADJUSTMENT;
        const isCredit = txn.direction === 'CREDIT';
        return (
            <View style={styles.listItem}>
                <View style={styles.listIconWrapper}>
                    <MaterialIcons name={cfg.icon} size={24} color={cfg.color} />
                </View>
                <View style={styles.listCenter}>
                    <Text style={styles.listTitle} numberOfLines={1}>
                        {t(`transaction.${cfg.labelKey}`, cfg.defaultLabel) as string}
                    </Text>
                    <Text style={styles.listDate}>
                        {formatDate(txn.created_at)}
                        {txn.note && ` · ${txn.note}`}
                    </Text>
                </View>
                <View style={styles.listRight}>
                    <Text style={[styles.listAmount, { color: isCredit ? '#10B981' : '#F87171' }]}>
                        {isCredit ? '+' : '-'}{Number(txn.amount).toLocaleString()}
                    </Text>
                    <Text style={styles.listBal}>{t('transaction.bal', 'Bal: ') as string}{Number(txn.balance_after).toLocaleString()}</Text>
                </View>
            </View>
        );
    }, [t]);

    // FlatList ၏ Header ပိုင်း
    const renderHeader = () => (
        <>
            <View style={styles.balanceBox}>
                <MaterialIcons name="account-balance-wallet" size={20} color="#10B981" />
                <Text style={styles.balanceText}>
                    {t('transaction.balance', 'Balance: ') as string}<Text style={styles.balanceAmount}>{balance.toLocaleString()} {currency}</Text>
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
                                {t(`transaction.${opt.labelKey}`, opt.defaultLabel) as string}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </>
    );

    // FlatList ၏ Empty/Loading/Error ပိုင်း
    const renderEmptyComponent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 60 }} />;
        }
        if (isError) {
            return (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyDesc, { color: '#EF4444' }]}>
                        {error?.message || (t('transaction.err_fetch', 'Unable to load transactions. Please try again.') as string)}
                    </Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyState}>
                <View style={styles.emptyIconWrapper}>
                    <MaterialIcons name="inbox" size={32} color="#374151" style={styles.emptyIcon} />
                </View>
                <Text style={styles.emptyTitle}>{t('transaction.no_data', 'No data here') as string}</Text>
                <Text style={styles.emptyDesc}>
                    {t('transaction.empty_desc', 'No transactions yet.') as string}
                </Text>
            </View>
        );
    };

    // FlatList ၏ အောက်ခြေ Loading (Infinite Scroll အတွက်)
    const renderFooterComponent = () => {
        if (!isFetchingNextPage) return null;
        return <ActivityIndicator size="small" color="#10B981" style={{ marginVertical: 20 }} />;
    };

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>{t('transaction.eyebrow', 'WALLET') as string}</Text>
                    <Text style={styles.title}>{t('transaction.title', 'Transaction Record') as string}</Text>
                    <Text style={styles.desc}>{t('transaction.desc', 'Your complete wallet activity ledger.') as string}</Text>
                </View>
            </View>

            {/* 🧠 EINSTEIN OPTIMIZATION 4: FlatList ဖြင့် အပြည့်အဝ အစားထိုးခြင်း (Memory Hacks များပါဝင်သည်) */}
            <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyComponent}
                ListFooterComponent={renderFooterComponent}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />} // ကတ်များကြားရှိ 12px ခြားမှုကို ပြုလုပ်ပေးသည်
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}

                // 🌟 Auto Infinite Scroll (Auto Fetch) စနစ် 🌟
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

    listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(11, 19, 43, 0.94)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 16 },
    listIconWrapper: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: 'rgba(255, 255, 255, 0.03)' },
    listCenter: { flex: 1, paddingRight: 8 },
    listTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    listDate: { color: '#8A9BB3', fontSize: 11 },
    listRight: { alignItems: 'flex-end' },
    listAmount: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    listBal: { color: '#8A9BB3', fontSize: 10 },
});