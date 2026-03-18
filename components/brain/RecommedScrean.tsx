import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Dimensions, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    cardBg: '#0B132B',
    inputBg: '#152243',
    borderNormal: 'rgba(255, 255, 255, 0.08)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    adminBadge: '#FF3B30',
    type2D: '#3B82F6',
    type3D: '#AF52DE',
};

interface Suggestion {
    id: string;
    dateText: string;
    type: '2D' | '3D';
    numbers: string[];
    message: string;
    isHot: boolean;
}

const DUMMY_SUGGESTIONS: Suggestion[] = [
    {
        id: 's1',
        dateText: 'ယနေ့ နေ့လည်ပိုင်း (၁၂:၀၁ ပွဲ)',
        type: '2D',
        numbers: ['54', '45', '99'],
        message: 'ဒီနေ့ နေ့လည်အတွက် အထူးရွေးချယ်ထားသော VIP ဂဏန်းများ ဖြစ်ပါသည်။ အပူး လိုက်ရန် အကြံပြုပါသည်။',
        isHot: true,
    },
    {
        id: 's2',
        dateText: 'ယနေ့ ညနေပိုင်း (၀၄:၃၀ ပွဲ)',
        type: '2D',
        numbers: ['28', '82'],
        message: 'ညနေပိုင်းအတွက် မွေးဂဏန်းများ။',
        isHot: false,
    },
    {
        id: 's3',
        dateText: 'လာမည့် ထိုင်းထီထွက်ရက် (၁ ရက်နေ့)',
        type: '3D',
        numbers: ['123', '908'],
        message: '3D တိုက်ရိုက် ထိုးထားရန် အထူးကောင်းမွန်ပါသည်။',
        isHot: true,
    },
];

const SuggestionCard = ({ item }: { item: Suggestion }) => {
    const router = useRouter();

    const typeColor = item.type === '2D' ? THEME.type2D : THEME.type3D;

    return (
        <View style={styles.cardContainer}>

            <View style={styles.cardHeader}>
                <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={s(12, 14, 18)} color={THEME.textMuted} />
                    <Text style={styles.dateText}>{item.dateText}</Text>
                </View>
                <View style={styles.adminBadge}>
                    <MaterialCommunityIcons name="shield-check" size={s(10, 12, 16)} color={THEME.textWhite} />
                    <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
            </View>

            <View style={styles.numbersSection}>
                <View style={[styles.typeTag, { backgroundColor: typeColor + '20', borderColor: typeColor }]}>
                    <Text style={[styles.typeTagText, { color: typeColor }]}>{item.type}</Text>
                </View>

                {item.isHot && <MaterialCommunityIcons name="fire" size={s(20, 24, 30)} color={THEME.adminBadge} style={{ marginRight: s(8, 10, 14) }} />}

                <View style={styles.badgesWrapper}>
                    {item.numbers.map((num, index) => (
                        <View key={index} style={styles.numberBadge}>
                            <Text style={styles.numberText}>{num}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <Text style={styles.messageText}>{item.message}</Text>

            <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8 }]}
                onPress={() => router.navigate('/wallet-profile/number-play')}
            >
                <Text style={styles.actionBtnText}>ယခုပဲ ထိုးမည်</Text>
                <Ionicons name="arrow-forward" size={s(14, 16, 20)} color={THEME.bg} style={{ marginLeft: s(4, 6, 8) }} />
            </Pressable>

        </View>
    );
};

export default function RecommendationsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const renderItem = useCallback(({ item }: { item: Suggestion }) => {
        return <SuggestionCard item={item} />;
    }, []);

    return (
        <View style={styles.container}>

            <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 5 : s(10, 15, 20) }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={s(22, 26, 32)} color={THEME.textWhite} />
                </Pressable>
                <View>
                    <Text style={styles.headerTitle}>အကြံပြုချက်များ</Text>
                    <Text style={styles.headerSubtitle}>Admin မှ ရွေးချယ်ပေးသော အထူးဂဏန်းများ</Text>
                </View>
            </View>

            <FlatList
                data={DUMMY_SUGGESTIONS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                initialNumToRender={5}
                windowSize={5}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: s(12, 16, 24),
        paddingBottom: s(12, 15, 20),
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
    },
    backButton: {
        width: s(36, 40, 50), height: s(36, 40, 50),
        borderRadius: s(18, 20, 25),
        backgroundColor: THEME.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(10, 12, 16)
    },
    headerTitle: {
        color: THEME.textWhite,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold'
    },
    headerSubtitle: {
        color: THEME.gold,
        fontSize: s(10, 12, 15),
        marginTop: s(1, 2, 4),
    },

    flatListContent: {
        paddingHorizontal: s(12, 16, 24),
        paddingTop: s(16, 20, 30),
        paddingBottom: s(30, 40, 60),
    },

    cardContainer: {
        backgroundColor: THEME.cardBg,
        borderRadius: s(16, 20, 28),
        padding: s(14, 16, 24),
        marginBottom: s(14, 16, 24),
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8
            },
            android: {
                elevation: 5
            },
        }),
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: s(12, 15, 20),
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        color: THEME.textMuted,
        fontSize: s(11, 13, 16),
        marginLeft: s(4, 6, 8),
        fontWeight: '500',
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.adminBadge,
        paddingHorizontal: s(6, 8, 12),
        paddingVertical: s(3, 4, 6),
        borderRadius: s(6, 8, 12),
    },
    adminBadgeText: {
        color: THEME.textWhite,
        fontSize: s(9, 10, 12),
        fontWeight: 'bold',
        marginLeft: s(3, 4, 6),
    },

    numbersSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.inputBg,
        padding: s(10, 12, 16),
        borderRadius: s(12, 14, 20),
        marginBottom: s(12, 15, 20),
    },
    typeTag: {
        paddingHorizontal: s(6, 8, 12),
        paddingVertical: s(3, 4, 6),
        borderRadius: s(4, 6, 8),
        borderWidth: 1,
        marginRight: s(8, 12, 16),
    },
    typeTagText: {
        fontSize: s(12, 14, 18),
        fontWeight: '900',
        fontStyle: 'italic',
    },
    badgesWrapper: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: s(6, 8, 12),
    },
    numberBadge: {
        backgroundColor: THEME.bg,
        paddingHorizontal: s(10, 14, 18),
        paddingVertical: s(6, 8, 12),
        borderRadius: s(6, 8, 12),
        borderWidth: 1,
        borderColor: THEME.neonGreen,
    },
    numberText: {
        color: THEME.neonGreen,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold',
        letterSpacing: s(1, 2, 4),
    },

    messageText: {
        color: THEME.textWhite,
        fontSize: s(12, 14, 18),
        lineHeight: s(18, 22, 28),
        marginBottom: s(12, 15, 20),
    },

    actionBtn: {
        flexDirection: 'row',
        backgroundColor: THEME.neonGreen,
        paddingVertical: s(10, 12, 16),
        borderRadius: s(10, 12, 16),
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnText: {
        color: "red",
        fontSize: s(12, 14, 18),
        fontWeight: 'bold',
    }
});