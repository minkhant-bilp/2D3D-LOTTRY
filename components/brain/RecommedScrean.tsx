import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
                    <Ionicons name="calendar-outline" size={14} color={THEME.textMuted} />
                    <Text style={styles.dateText}>{item.dateText}</Text>
                </View>
                <View style={styles.adminBadge}>
                    <MaterialCommunityIcons name="shield-check" size={12} color={THEME.textWhite} />
                    <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
            </View>

            <View style={styles.numbersSection}>
                <View style={[styles.typeTag, { backgroundColor: typeColor + '20', borderColor: typeColor }]}>
                    <Text style={[styles.typeTagText, { color: typeColor }]}>{item.type}</Text>
                </View>

                {item.isHot && <MaterialCommunityIcons name="fire" size={24} color={THEME.adminBadge} style={{ marginRight: 10 }} />}

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
                <Ionicons name="arrow-forward" size={16} color={THEME.bg} style={{ marginLeft: 6 }} />
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

            <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 5 : 15 }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={26} color={THEME.textWhite} />
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
        paddingHorizontal: 16,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
    },
    backButton: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: THEME.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    headerTitle: {
        color: THEME.textWhite,
        fontSize: 18,
        fontWeight: 'bold'
    },
    headerSubtitle: {
        color: THEME.gold,
        fontSize: 12,
        marginTop: 2,
    },

    flatListContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 40,
    },

    cardContainer: {
        backgroundColor: THEME.cardBg,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
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
        marginBottom: 15,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        color: THEME.textMuted,
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '500',
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.adminBadge,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    adminBadgeText: {
        color: THEME.textWhite,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
    },

    numbersSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.inputBg,
        padding: 12,
        borderRadius: 14,
        marginBottom: 15,
    },
    typeTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        marginRight: 12,
    },
    typeTagText: {
        fontSize: 14,
        fontWeight: '900',
        fontStyle: 'italic',
    },
    badgesWrapper: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    numberBadge: {
        backgroundColor: THEME.bg,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: THEME.neonGreen,
    },
    numberText: {
        color: THEME.neonGreen,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
    },

    messageText: {
        color: THEME.textWhite,
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 15,
    },

    actionBtn: {
        flexDirection: 'row',
        backgroundColor: THEME.neonGreen,
        paddingVertical: 12,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnText: {
        color: "red",
        fontSize: 14,
        fontWeight: 'bold',
    }
});