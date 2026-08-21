import { MaterialIcons } from '@expo/vector-icons';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';
import { listNotificationLogsAPI, markAllNotificationsAsReadAPI } from '../../api/main';

import { useAppStore } from '@/store/useAppStore';

type NotificationLogEntry = {
    id: string | number;
    notification_type: string;
    title: string;
    body: string;
    created_at: string;
};

const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: any; bgColor: string; iconColor: string }> = {
    deposit_approved: { icon: 'check-circle', bgColor: 'rgba(0, 230, 118, 0.12)', iconColor: '#00e676' },
    deposit_rejected: { icon: 'cancel', bgColor: 'rgba(239, 68, 68, 0.12)', iconColor: '#f87171' },
    withdrawal_completed: { icon: 'account-balance', bgColor: 'rgba(0, 230, 118, 0.12)', iconColor: '#00e676' },
    withdrawal_rejected: { icon: 'cancel', bgColor: 'rgba(239, 68, 68, 0.12)', iconColor: '#f87171' },
    bet_won: { icon: 'emoji-events', bgColor: 'rgba(0, 230, 118, 0.12)', iconColor: '#00e676' },
    bet_paid_out: { icon: 'payments', bgColor: 'rgba(0, 230, 118, 0.12)', iconColor: '#00e676' },
    settlement_reverted: { icon: 'undo', bgColor: 'rgba(245, 158, 11, 0.12)', iconColor: '#fbbf24' },
};

const DEFAULT_NOTIFICATION_TYPE_CONFIG = {
    icon: 'notifications',
    bgColor: 'rgba(147, 197, 253, 0.12)',
    iconColor: '#93c5fd'
};

function getNotificationTypeConfig(notificationType: string) {
    return NOTIFICATION_TYPE_CONFIG[notificationType] ?? DEFAULT_NOTIFICATION_TYPE_CONFIG;
}

export default function NotificationsPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const clearUnreadCount = useAppStore(state => state.clearUnreadCount);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        error
    } = useInfiniteQuery({
        queryKey: ['notifications'],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await listNotificationLogsAPI({ page: pageParam, per_page: 20 });
            return response?.data || response;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: any) => {
            if (lastPage?.current_page && lastPage?.last_page && lastPage.current_page < lastPage.last_page) {
                return lastPage.current_page + 1;
            }
            return undefined;
        },
    });

    const markAsReadMutation = useMutation({
        mutationFn: markAllNotificationsAsReadAPI,
        onSuccess: () => {
            clearUnreadCount();
        }
    });

    useEffect(() => {
        markAsReadMutation.mutate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const items = (data?.pages || []).flatMap((page: any) => {
        let entries: any[] = [];
        if (Array.isArray(page)) {
            entries = page;
        } else if (page?.data && Array.isArray(page.data)) {
            entries = page.data;
        } else if (page?.data?.data && Array.isArray(page.data.data)) {
            entries = page.data.data;
        }
        return entries;
    }).filter((item: any) => item && typeof item === 'object' && 'notification_type' in item) as NotificationLogEntry[];

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>{t('notification.eyebrow', 'အကြောင်းကြားစာများ') as string}</Text>
                    <Text style={styles.title}>{t('notification.title', 'အသိပေးချက်များ') as string}</Text>
                    <Text style={styles.desc}>{t('notification.desc', 'သင့်လောင်းကြေး၊ ငွေဖြည့်၊ အကောင့်နှင့် ပတ်သက်သော နောက်ဆုံးသတင်းများ') as string}</Text>
                </View>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    items.length > 0
                        ? [styles.card, { margin: 16, paddingBottom: 60 }]
                        : styles.scrollContent
                }
                renderItem={({ item }) => {
                    const typeConfig = getNotificationTypeConfig(item.notification_type);
                    return (
                        <View style={styles.notificationItem}>
                            <View style={[styles.iconWrapper, { backgroundColor: typeConfig.bgColor }]}>
                                <MaterialIcons name={typeConfig.icon} size={18} color={typeConfig.iconColor} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemBody}>{item.body}</Text>
                                <Text style={styles.itemDate}>
                                    {new Date(item.created_at).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    );
                }}
                ListEmptyComponent={() => {
                    if (status === 'pending') {
                        return <ActivityIndicator size="large" color="#93c5fd" style={{ marginTop: 40 }} />;
                    }
                    if (status === 'error') {
                        return (
                            <View style={styles.emptyState}>
                                <Text style={styles.errorText}>
                                    {error instanceof Error ? error.message : t('notification.error_fetch', 'မှတ်တမ်းများ ရယူရာတွင် အမှားအယွင်းဖြစ်ပေါ်ခဲ့ပါသည်။')}
                                </Text>
                            </View>
                        );
                    }
                    return (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>{t('notification.empty', 'အကြောင်းကြားစာ မရှိသေးပါ')}</Text>
                        </View>
                    );
                }}
                ListFooterComponent={() => {
                    if (!hasNextPage || items.length === 0) return null;
                    return (
                        <Pressable
                            style={({ pressed }) => [styles.loadMoreBtn, pressed && styles.loadMoreBtnPressed]}
                            onPress={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                        >
                            {isFetchingNextPage ? (
                                <ActivityIndicator size="small" color="#8a9bb3" />
                            ) : (
                                <Text style={styles.loadMoreText}>{t('notification.load_more', 'ထပ်မံပြသမည်') as string}</Text>
                            )}
                        </Pressable>
                    );
                }}
            />
            <View style={{ height: 60 }}></View>
        </View>
    );
}


const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: '#050A1F' },
    backBtn: { marginRight: 16, padding: 4 },
    headerTextContainer: { justifyContent: 'center', flex: 1 },
    eyebrow: { color: '#93c5fd', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
    title: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
    desc: { color: '#8a9bb3', fontSize: 13, lineHeight: 20 },
    scrollContent: { padding: 16, paddingBottom: 60 },
    card: { backgroundColor: '#0B1221', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12 },
    notificationItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12, marginBottom: 8 },
    iconWrapper: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
    textContainer: { flex: 1 },
    itemTitle: { color: '#f7f9ff', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    itemBody: { color: '#8a9bb3', fontSize: 13, lineHeight: 18 },
    itemDate: { color: '#5d6f8c', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
    loadMoreBtn: { marginTop: 4, width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    loadMoreBtnPressed: { backgroundColor: 'rgba(255,255,255,0.08)' },
    loadMoreText: { color: '#8a9bb3', fontSize: 13, fontWeight: 'bold' },
    emptyState: { marginTop: 40, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#8a9bb3', fontSize: 14 },
    errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center' }
});