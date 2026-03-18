import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

const THEME = {
    bg: '#050A1F',
    card: '#0B132B',
    border: 'rgba(255,255,255,0.08)',
    text: '#FFFFFF',
    muted: '#8A9BB3',
    neon: '#00E676',
};

interface NotiRecord {
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
}

// 🚨 မူလ Data
const INITIAL_NOTI_DATA: NotiRecord[] = [
    {
        id: '1',
        title: 'ငွေထုတ်ယူခြင်း အောင်မြင်ပါသည်',
        message: 'သင်၏ ငွေထုတ်ယူမှု 50,000 Ks ကို KBZ Pay သို့ အောင်မြင်စွာ လွှဲပြောင်းပေးလိုက်ပါပြီ။',
        time: 'ယခုလေးတင်',
        isRead: false,
    },
    {
        id: '2',
        title: 'ဂဏန်းပေါက်ပါသည်! 🎉',
        message: 'ဂဏန်း "53" ဖြင့် ဆုမဲပေါက်သွားပါသည်။ ဆုကြေးငွေများ ဝင်ရောက်ထုတ်ယူနိုင်ပါပြီ။',
        time: 'လွန်ခဲ့သော ၂ နာရီ',
        isRead: false,
    },
    {
        id: '3',
        title: 'Lottery Site မှ ကြိုဆိုပါသည်',
        message: 'အကောင့်အသစ်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ ကံစမ်းမဲများ စတင်ထိုးနိုင်ပါပြီ။',
        time: 'လွန်ခဲ့သော ၁ ရက်',
        isRead: true,
    }
];

export default function NotificationScreen() {
    const router = useRouter();

    const [notiList, setNotiList] = useState<NotiRecord[]>(INITIAL_NOTI_DATA);

    const markAsRead = (id: string) => {
        setNotiList(prevList =>
            prevList.map(noti =>
                noti.id === id ? { ...noti, isRead: true } : noti
            )
        );
    };

    const isEmpty = notiList.length === 0;

    const renderNotiCard = ({ item }: { item: NotiRecord }) => {
        const cardBorderColor = item.isRead ? THEME.border : 'rgba(0, 230, 118, 0.3)';
        const cardBgColor = item.isRead ? THEME.card : 'rgba(0, 230, 118, 0.05)';
        const titleColor = item.isRead ? THEME.muted : THEME.text;

        const iconName = item.isRead ? 'mail-open-outline' : 'mail';
        const iconColor = item.isRead ? THEME.muted : THEME.neon;

        return (
            <Pressable
                style={[styles.card, { borderColor: cardBorderColor, backgroundColor: cardBgColor }]}
                onPress={() => markAsRead(item.id)} // 🚨 နှိပ်လိုက်လျှင် ဖတ်ပြီးသားအဖြစ် ပြောင်းမည် 🚨
            >

                {!item.isRead && <View style={styles.unreadDot} />}

                <View style={styles.iconBox}>
                    <Ionicons name={iconName} size={s(20, 24, 30)} color={iconColor} />
                </View>

                <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.titleText, { color: titleColor }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                    <Text style={styles.messageText} numberOfLines={2}>
                        {item.message}
                    </Text>
                </View>

            </Pressable>
        );
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={s(20, 24, 30)} color={THEME.text} />
                </Pressable>
                <Text style={styles.headerTitle}>အသိပေးချက်များ</Text>
                <View style={styles.placeholderBtn} />
            </View>

            <View style={styles.listContainer}>
                {isEmpty ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <Ionicons name="notifications-off-outline" size={s(40, 48, 60)} color={THEME.muted} />
                        </View>
                        <Text style={styles.emptyTitle}>အသိပေးချက် မရှိသေးပါ</Text>
                        <Text style={styles.emptySubtext}>
                            သင့်ထံသို့ ပေးပို့ထားသော အသိပေးစာများ မရှိသေးပါ။ အသစ်ရောက်လာပါက ဤနေရာတွင် ပြသပေးပါမည်။
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={notiList}
                        renderItem={renderNotiCard}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: s(15, 20, 30),
        paddingTop: s(40, 50, 70),
        paddingBottom: s(15, 20, 30),
        backgroundColor: THEME.bg,
        borderBottomWidth: 1,
        borderBottomColor: THEME.border,
    },
    backBtn: {
        width: s(38, 44, 54),
        height: s(38, 44, 54),
        borderRadius: s(12, 14, 18),
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: THEME.text,
        fontSize: s(18, 20, 26),
        fontWeight: 'bold',
    },
    placeholderBtn: { width: s(38, 44, 54) },

    listContainer: { flex: 1 },
    listContent: {
        padding: s(15, 20, 30),
        paddingBottom: s(30, 40, 60),
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: s(20, 30, 50),
        marginTop: s(-140, -180, -220),
    },
    emptyIconBox: {
        width: s(80, 100, 140),
        height: s(80, 100, 140),
        borderRadius: s(40, 50, 70),
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: s(15, 20, 30),
    },
    emptyTitle: {
        color: THEME.text,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold',
        marginBottom: s(6, 8, 12),
    },
    emptySubtext: {
        color: THEME.muted,
        fontSize: s(13, 14, 18),
        textAlign: 'center',
        lineHeight: s(20, 22, 28),
    },

    card: {
        flexDirection: 'row',
        borderRadius: s(16, 20, 24),
        padding: s(14, 16, 20),
        marginBottom: s(10, 12, 16),
        borderWidth: 1,
        alignItems: 'center',
    },
    unreadDot: {
        position: 'absolute',
        top: s(12, 16, 20),
        right: s(12, 16, 20),
        width: s(6, 8, 10),
        height: s(6, 8, 10),
        borderRadius: s(3, 4, 5),
        backgroundColor: THEME.neon,
    },
    iconBox: {
        width: s(40, 50, 65),
        height: s(40, 50, 65),
        borderRadius: s(12, 16, 20),
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(10, 14, 18),
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: s(4, 6, 8),
        paddingRight: s(6, 10, 14),
    },
    titleText: {
        flex: 1,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold',
        marginRight: s(6, 8, 12),
    },
    timeText: {
        color: THEME.muted,
        fontSize: s(9, 11, 13),
    },
    messageText: {
        color: THEME.muted,
        fontSize: s(11, 13, 16),
        lineHeight: s(18, 20, 26),
    },
});