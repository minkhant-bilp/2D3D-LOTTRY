import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Withdrawal = {
    id: string;
    amount: number;
    currency: string;
    status: 'COMPLETED' | 'PENDING' | 'REJECTED';
    created_at: string;
    bank_snapshot: { bank_name: string };
};

const STATUS_CONFIG: Record<Withdrawal['status'], { label: string; bgColor: string; textColor: string; borderColor: string }> = {
    COMPLETED: { label: 'Completed', bgColor: 'rgba(0, 230, 118, 0.12)', textColor: '#00e676', borderColor: 'rgba(0, 230, 118, 0.25)' },
    PENDING: { label: 'Pending', bgColor: 'rgba(245, 158, 11, 0.12)', textColor: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.25)' },
    REJECTED: { label: 'Rejected', bgColor: 'rgba(239, 68, 68, 0.12)', textColor: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.25)' },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function WithdrawalHistoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            setTimeout(() => {
                setWithdrawals([]);
                setLoading(false);
            }, 800);
        } catch {
            setError('Unable to load withdrawal history. Please try again.');
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const completedCount = withdrawals.filter((w) => w.status === 'COMPLETED').length;
    const pendingCount = withdrawals.filter((w) => w.status === 'PENDING').length;
    const totalWithdrawn = withdrawals.filter((w) => w.status === 'COMPLETED').reduce((s, w) => s + w.amount, 0);
    const currency = withdrawals[0]?.currency ?? 'MMK';

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>PAYOUTS</Text>
                    <Text style={styles.title}>Withdrawal History</Text>
                    <Text style={styles.desc}>Track withdrawal requests and transfer status.</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.requestBtn}
                    onPress={() => router.push({ pathname: '/wallet-profile/withdrawal' } as any)}
                >
                    <MaterialIcons name="add" size={20} color="#10B981" style={{ marginRight: 8 }} />
                    <Text style={styles.requestBtnText}>Request Withdrawal  →</Text>
                </TouchableOpacity>

                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>COMPLETED</Text>
                        <Text style={styles.statValue}>{completedCount}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>PENDING</Text>
                        <Text style={styles.statValue}>{pendingCount}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>TOTAL</Text>
                        <Text style={styles.statValue}>{totalWithdrawn.toLocaleString()} {currency}</Text>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#00e676" style={{ marginTop: 60 }} />
                ) : error ? (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyDesc, { color: '#EF4444' }]}>{error}</Text>
                    </View>
                ) : withdrawals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="inbox" size={32} color="#374151" style={styles.emptyIcon} />
                        <Text style={styles.emptyTitle}>No data here</Text>
                        <Text style={styles.emptyDesc}>
                            No withdrawal requests yet. Tap `+ Request Withdrawal` to get started.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {withdrawals.map((w) => {
                            const status = STATUS_CONFIG[w.status];
                            return (
                                <Pressable key={w.id} style={styles.listItem}>
                                    <View style={styles.listLeft}>
                                        <Text style={styles.listTitle}>Withdrawal</Text>
                                        <Text style={styles.listDate}>{formatDate(w.created_at)} · {w.bank_snapshot.bank_name}</Text>
                                    </View>
                                    <View style={styles.listRight}>
                                        <Text style={styles.listAmount}>-{w.amount.toLocaleString()} {w.currency}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: status.bgColor, borderColor: status.borderColor }]}>
                                            <Text style={[styles.statusText, { color: status.textColor }]}>{status.label}</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })}
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
    backBtn: {
        marginRight: 16,
        paddingTop: 6,
    },
    headerTextContainer: {
        flex: 1,
    },
    eyebrow: {
        color: '#93C5FD',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    title: {
        color: '#F7F9FF',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    desc: {
        color: '#8A9BB3',
        fontSize: 13,
        lineHeight: 20,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },

    requestBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#042F21',
        borderWidth: 1,
        borderColor: '#10B981',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 20,
    },
    requestBtnText: {
        color: '#10B981',
        fontSize: 15,
        fontWeight: 'bold',
    },

    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 40,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 14,
    },
    statLabel: {
        color: '#8A9BB3',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 6,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },

    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        marginBottom: 12,
        opacity: 0.8,
    },
    emptyTitle: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptyDesc: {
        color: '#4B5563',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },

    listContainer: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 16,
    },
    listLeft: {
        flex: 1,
    },
    listTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    listDate: {
        color: '#8A9BB3',
        fontSize: 12,
    },
    listRight: {
        alignItems: 'flex-end',
    },
    listAmount: {
        color: '#F87171',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    statusBadge: {
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});