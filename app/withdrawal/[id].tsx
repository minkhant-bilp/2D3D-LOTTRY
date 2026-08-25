import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getWithdrawalByIdAPI } from '../../api/main';
import { listenForWithdrawalNotifications } from '../../utils/withdrawalNotificationBus';

type Withdrawal = {
    id: string;
    amount: number;
    currency: string;
    status: 'COMPLETED' | 'PENDING' | 'REJECTED';
    admin_note: string | null;
    rejection_reason: string | null;
    reviewed_at: string | null;
    created_at: string;
    bank_snapshot: { bank_name?: string; account_name?: string; account_number?: string } | null;
};

const STATUS_CONFIG: Record<Withdrawal['status'], { labelKey: string; defaultLabel: string; bgColor: string; textColor: string; borderColor: string }> = {
    COMPLETED: { labelKey: 'status_completed', defaultLabel: 'Completed', bgColor: 'rgba(0, 230, 118, 0.12)', textColor: '#00e676', borderColor: 'rgba(0, 230, 118, 0.25)' },
    PENDING: { labelKey: 'status_pending', defaultLabel: 'Pending', bgColor: 'rgba(245, 158, 11, 0.12)', textColor: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.25)' },
    REJECTED: { labelKey: 'status_rejected', defaultLabel: 'Rejected', bgColor: 'rgba(239, 68, 68, 0.12)', textColor: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.25)' },
};

function formatDateTime(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
}

export default function WithdrawalDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const { id } = useLocalSearchParams<{ id: string }>();

    const { data: withdrawal, isLoading, isError } = useQuery({
        queryKey: ['withdrawal', id],
        queryFn: async () => {
            const res: any = await getWithdrawalByIdAPI(id);
            return (res?.withdrawal ?? res) as Withdrawal;
        },
        enabled: !!id,
    });

    // Refetch when an admin acts on *this* withdrawal while the screen is open.
    useEffect(() => {
        return listenForWithdrawalNotifications((detail) => {
            if (detail.withdrawalId != null && String(detail.withdrawalId) !== String(id)) return;
            queryClient.invalidateQueries({ queryKey: ['withdrawal', id] });
        });
    }, [id, queryClient]);

    const status = withdrawal ? STATUS_CONFIG[withdrawal.status] : null;

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>{t('withdraw_detail.eyebrow', 'Withdrawal') as string}</Text>
                    <Text style={styles.title}>{t('withdraw_detail.title', 'Request Detail') as string}</Text>
                </View>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#93c5fd" style={{ marginTop: 40 }} />
            ) : isError || !withdrawal ? (
                <View style={styles.emptyState}>
                    <Text style={styles.errorText}>
                        {t('withdraw_detail.load_error', 'Unable to load this withdrawal.') as string}
                    </Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.card}>
                        <Text style={styles.amount}>-{withdrawal.amount.toLocaleString()} {withdrawal.currency}</Text>
                        {status && (
                            <View style={[styles.statusBadge, { backgroundColor: status.bgColor, borderColor: status.borderColor }]}>
                                <Text style={[styles.statusText, { color: status.textColor }]}>
                                    {t(`withdraw_history.${status.labelKey}`, status.defaultLabel) as string}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.card}>
                        <DetailRow
                            label={t('withdraw_detail.bank', 'Bank') as string}
                            value={withdrawal.bank_snapshot?.bank_name || '—'}
                        />
                        <DetailRow
                            label={t('withdraw_detail.account_name', 'Account name') as string}
                            value={withdrawal.bank_snapshot?.account_name || '—'}
                        />
                        <DetailRow
                            label={t('withdraw_detail.account_number', 'Account number') as string}
                            value={withdrawal.bank_snapshot?.account_number || '—'}
                        />
                        <DetailRow
                            label={t('withdraw_detail.requested_at', 'Requested') as string}
                            value={formatDateTime(withdrawal.created_at)}
                        />
                        <DetailRow
                            label={t('withdraw_detail.reviewed_at', 'Reviewed') as string}
                            value={formatDateTime(withdrawal.reviewed_at)}
                        />
                    </View>

                    {(withdrawal.admin_note || withdrawal.rejection_reason) && (
                        <View style={styles.card}>
                            {withdrawal.rejection_reason && (
                                <DetailRow
                                    label={t('withdraw_detail.rejection_reason', 'Reason') as string}
                                    value={withdrawal.rejection_reason}
                                />
                            )}
                            {withdrawal.admin_note && (
                                <DetailRow
                                    label={t('withdraw_detail.admin_note', 'Admin note') as string}
                                    value={withdrawal.admin_note}
                                />
                            )}
                        </View>
                    )}

                    <View style={{ height: 60 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: '#050A1F' },
    backBtn: { marginRight: 16, padding: 4 },
    headerTextContainer: { justifyContent: 'center', flex: 1 },
    eyebrow: { color: '#93c5fd', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
    title: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
    scrollContent: { padding: 16 },
    card: { backgroundColor: '#0B1221', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 16, marginBottom: 12, alignItems: 'center' },
    amount: { color: '#f7f9ff', fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', paddingVertical: 8, gap: 16 },
    detailLabel: { color: '#8a9bb3', fontSize: 13 },
    detailValue: { color: '#f7f9ff', fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
    emptyState: { marginTop: 40, alignItems: 'center', justifyContent: 'center' },
    errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center' },
});
