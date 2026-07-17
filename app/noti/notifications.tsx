import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NotificationLogEntry = {
    id: string;
    notification_type: string;
    title: string;
    body: string;
    created_at: string;
};

const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: any; bgColor: string; iconColor: string }> = {
    deposit_approved: { icon: 'check-circle', bgColor: 'rgba(0, 230, 118, 0.12)', iconColor: '#00e676' },
    deposit_rejected: { icon: 'cancel', bgColor: 'rgba(239, 68, 68, 0.12)', iconColor: '#f87171' },
    bet_won: { icon: 'emoji-events', bgColor: 'rgba(0, 230, 118, 0.12)', iconColor: '#00e676' },
    bet_paid_out: { icon: 'payments', bgColor: 'rgba(0, 230, 118, 0.12)', iconColor: '#00e676' },
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

    const [items, setItems] = useState<NotificationLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const load = async (pageNum: number, append: boolean) => {
        setLoading(true);
        try {
            setTimeout(() => {
                const fetched: NotificationLogEntry[] = [
                    { id: '1', notification_type: 'deposit_approved', title: 'ငွေသွင်းခြင်း အောင်မြင်ပါသည်', body: 'သင့်အကောင့်သို့ 50,000 MMK ရောက်ရှိပါပြီ။', created_at: new Date().toISOString() },
                    { id: '2', notification_type: 'bet_won', title: 'လောင်းကြေး အောင်မြင်ပါသည်', body: 'ဂုဏ်ယူပါတယ်။ သင် 100,000 MMK အနိုင်ရရှိပါသည်။', created_at: new Date(Date.now() - 86400000).toISOString() },
                    { id: '3', notification_type: 'deposit_rejected', title: 'ငွေသွင်းခြင်း ပယ်ချခံရပါသည်', body: 'သင့်ငွေသွင်းမှု မအောင်မြင်ပါ။ ထပ်မံကြိုးစားကြည့်ပါ။', created_at: new Date(Date.now() - 172800000).toISOString() },
                    { id: '4', notification_type: 'unknown', title: 'စနစ် အကြောင်းကြားစာ', body: 'စနစ်ကို ခေတ္တခဏ ပြုပြင်နေပါသည်။', created_at: new Date(Date.now() - 259200000).toISOString() },
                ];
                setItems((prev) => (append ? [...prev, ...fetched] : fetched));
                setHasMore(false);
                setLoading(false);
            }, 800);
        } catch {
            setError('မှတ်တမ်းများ ရယူရာတွင် အမှားအယွင်းဖြစ်ပေါ်ခဲ့ပါသည်။');
            setLoading(false);
        }
    };

    useEffect(() => {
        load(1, false);
    }, []);

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>အကြောင်းကြားစာများ</Text>
                    <Text style={styles.title}>အသိပေးချက်များ</Text>
                    <Text style={styles.desc}>သင့်လောင်းကြေး၊ ငွေဖြည့်၊ အကောင့်နှင့် ပတ်သက်သော နောက်ဆုံးသတင်းများ</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {loading && page === 1 ? (
                    <ActivityIndicator size="large" color="#93c5fd" style={{ marginTop: 40 }} />
                ) : error ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : items.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>အကြောင်းကြားစာ မရှိသေးပါ</Text>
                    </View>
                ) : (
                    <View style={styles.card}>
                        {items.map((item) => {
                            const typeConfig = getNotificationTypeConfig(item.notification_type);

                            return (
                                <View key={item.id} style={styles.notificationItem}>
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
                        })}

                        {hasMore && (
                            <Pressable
                                style={({ pressed }) => [styles.loadMoreBtn, pressed && styles.loadMoreBtnPressed]}
                                onPress={() => {
                                    const next = page + 1;
                                    setPage(next);
                                    load(next, true);
                                }}
                            >
                                <Text style={styles.loadMoreText}>ထပ်မံပြသမည်</Text>
                            </Pressable>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#050A1F'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#050A1F'
    },
    backBtn: {
        marginRight: 16,
        padding: 4,
    },
    headerTextContainer: {
        justifyContent: 'center',
        flex: 1,
    },
    eyebrow: {
        color: '#93c5fd',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 6
    },
    title: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6
    },
    desc: {
        color: '#8a9bb3',
        fontSize: 13,
        lineHeight: 20
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 60
    },
    card: {
        backgroundColor: '#0B1221',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 12
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 12,
        marginBottom: 8
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2
    },
    textContainer: {
        flex: 1
    },
    itemTitle: {
        color: '#f7f9ff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4
    },
    itemBody: {
        color: '#8a9bb3',
        fontSize: 13,
        lineHeight: 18
    },
    itemDate: {
        color: '#5d6f8c',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 8
    },
    loadMoreBtn: {
        marginTop: 4,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    loadMoreBtnPressed: {
        backgroundColor: 'rgba(255,255,255,0.08)'
    },
    loadMoreText: {
        color: '#8a9bb3',
        fontSize: 13,
        fontWeight: 'bold'
    },
    emptyState: {
        marginTop: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyText: {
        color: '#8a9bb3',
        fontSize: 14
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14
    }
});