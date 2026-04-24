import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTranslation from '@/hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

function s<T>(small: T, medium: T, tablet: T): T {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
}

const THEME = {
    bg: '#050A1F',
    cardBg: '#0B132B',
    inputBg: '#152243',
    borderNormal: 'rgba(255, 255, 255, 0.08)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    thbColor: '#1E90FF',
    mmkColor: '#00E676',
};

const BET_AMOUNTS = {
    MMK: [100, 200, 500, 1000, 5000, 10000],
    THB: [10, 20, 50, 100, 500, 1000],
};

const GAME_TYPES = {
    MMK: [
        { id: 'm1', title: '2D တိုက်ရိုက် (၈၅ ဆ)', multiplier: 85, icon: 'numeric-2-box-outline' as const },
        { id: 'm2', title: '3D တိုက်ရိုက် (၅၅၀ ဆ)', multiplier: 550, icon: 'numeric-3-box-outline' as const },
    ],
    THB: [
        { id: 't1', title: '2D တိုက်ရိုက် (၉၀ ဆ)', multiplier: 90, icon: 'numeric-2-box-outline' as const },
        { id: 't2', title: '3D တိုက်ရိုက် (၆၀၀ ဆ)', multiplier: 600, icon: 'numeric-3-box-outline' as const },
    ]
};

export default function BenefitsTableScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useTranslation();

    const [currency, setCurrency] = useState<'MMK' | 'THB'>('MMK');
    const currencySymbol = currency === 'MMK' ? 'Ks' : '฿';

    const PayoutTableCard = ({ game }: { game: typeof GAME_TYPES['MMK'][0] }) => (
        <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name={game.icon} size={Number(s(20, 24, 30))} color={THEME.textWhite} />
                </View>
                <Text style={styles.cardTitle}>{game.title}</Text>
            </View>

            <View style={styles.tableHeaderRow}>
                <Text style={styles.tableHeaderText}>{t.betAmount || 'ထိုးကြေး'}</Text>
                <Text style={styles.tableHeaderText}>{t.winAmount || 'ရမည့်ငွေ'}</Text>
            </View>

            {BET_AMOUNTS[currency].map((betAmount, index) => {
                const winAmount = betAmount * game.multiplier;
                const isLast = index === BET_AMOUNTS[currency].length - 1;

                return (
                    <View key={index.toString()} style={[styles.tableRow, isLast ? { borderBottomWidth: 0 } : {}]}>

                        <View style={styles.amountBadge}>
                            <Text style={styles.betAmountText}>
                                {betAmount.toLocaleString()} <Text style={styles.symbolText}>{currencySymbol}</Text>
                            </Text>
                        </View>

                        <Ionicons name="arrow-forward" size={Number(s(14, 16, 20))} color={THEME.textMuted} />

                        <View style={styles.winBadge}>
                            <Text style={styles.winAmountText}>
                                {winAmount.toLocaleString()} <Text style={styles.symbolTextGold}>{currencySymbol}</Text>
                            </Text>
                        </View>

                    </View>
                );
            })}
        </View>
    );

    return (
        <View style={styles.container}>

            <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 5 : Number(s(10, 15, 20)) }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={Number(s(20, 26, 32))} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>{t.benefitsTitle || 'ရပိုင်ခွင့် ဇယားများ'}</Text>
            </View>

            <View style={styles.switcherWrapper}>
                <View style={styles.switcherContainer}>
                    <Pressable
                        style={[styles.switchTab, currency === 'MMK' ? styles.switchTabActiveMMK : null]}
                        onPress={() => setCurrency('MMK')}
                    >
                        <Text style={[styles.switchText, currency === 'MMK' ? styles.switchTextActive : null]}>
                            {t.mmk || 'မြန်မာကျပ် (MMK)'}
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.switchTab, currency === 'THB' ? styles.switchTabActiveTHB : null]}
                        onPress={() => setCurrency('THB')}
                    >
                        <Text style={[styles.switchText, currency === 'THB' ? styles.switchTextActive : null]}>
                            {t.thb || 'ထိုင်းဘတ် (THB)'}
                        </Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={Number(s(16, 20, 26))} color={THEME.gold} />
                    <Text style={styles.infoText}>
                        {t.benefitsInfo || 'အောက်ပါဇယားတွင် ထိုးကြေးပမာဏအလိုက် ရရှိနိုင်မည့် အကျိုးအမြတ်များကို အလွယ်တကူ ကြည့်ရှုနိုင်ပါသည်။'}
                    </Text>
                </View>

                {GAME_TYPES[currency].map((game) => (
                    <PayoutTableCard key={game.id} game={game} />
                ))}

            </ScrollView>

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
        paddingHorizontal: Number(s(12, 16, 24)),
        paddingBottom: Number(s(10, 15, 20))
    },
    backButton: {
        width: Number(s(36, 40, 50)), height: Number(s(36, 40, 50)),
        borderRadius: Number(s(18, 20, 25)),
        backgroundColor: THEME.borderNormal,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Number(s(10, 12, 16))
    },
    headerTitle: {
        color: THEME.textWhite,
        fontSize: Number(s(16, 18, 24)),
        fontWeight: 'bold'
    },

    switcherWrapper: {
        paddingHorizontal: Number(s(12, 16, 24)),
        marginBottom: Number(s(8, 10, 14)),
    },
    switcherContainer: {
        flexDirection: 'row',
        backgroundColor: THEME.inputBg,
        borderRadius: Number(s(10, 12, 16)),
        padding: Number(s(3, 4, 6)),
    },
    switchTab: {
        flex: 1,
        paddingVertical: Number(s(10, 12, 16)),
        alignItems: 'center',
        borderRadius: Number(s(8, 10, 14))
    },
    switchTabActiveMMK: {
        backgroundColor: THEME.mmkColor
    },
    switchTabActiveTHB: {
        backgroundColor: THEME.thbColor
    },
    switchText: {
        color: THEME.textMuted,
        fontSize: Number(s(12, 14, 18)),
        fontWeight: 'bold'
    },
    switchTextActive: {
        color: '#000000',
        fontWeight: '900'
    },

    scrollContent: {
        paddingHorizontal: Number(s(12, 16, 24)),
        paddingBottom: Number(s(30, 40, 60)),
        paddingTop: Number(s(8, 10, 14))
    },

    infoBanner: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        padding: Number(s(10, 12, 16)),
        borderRadius: Number(s(8, 10, 14)),
        marginBottom: Number(s(15, 20, 30)),
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        color: THEME.gold,
        fontSize: Number(s(10, 12, 15)),
        marginLeft: Number(s(6, 8, 12)),
        lineHeight: Number(s(14, 18, 24)),
    },
    cardContainer: {
        backgroundColor: THEME.cardBg,
        borderRadius: Number(s(12, 16, 24)),
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        marginBottom: Number(s(15, 20, 30)),
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.inputBg,
        paddingHorizontal: Number(s(12, 16, 24)),
        paddingVertical: Number(s(12, 14, 20)),
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
    },
    iconBox: {
        width: Number(s(32, 36, 46)),
        height: Number(s(32, 36, 46)),
        borderRadius: Number(s(8, 10, 14)),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Number(s(10, 12, 16)),
    },
    cardTitle: {
        color: THEME.textWhite,
        fontSize: Number(s(14, 16, 20)),
        fontWeight: 'bold',
    },

    tableHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Number(s(15, 20, 30)),
        paddingVertical: Number(s(10, 12, 18)),
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
    },
    tableHeaderText: {
        color: THEME.textMuted,
        fontSize: Number(s(10, 12, 15)),
        fontWeight: 'bold',
    },

    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Number(s(15, 20, 30)),
        paddingVertical: Number(s(12, 14, 20)),
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
    },
    amountBadge: {
        flex: 1,
        alignItems: 'flex-start',
    },
    betAmountText: {
        color: THEME.textWhite,
        fontSize: Number(s(13, 15, 18)),
        fontWeight: 'bold',
    },
    symbolText: {
        fontSize: Number(s(10, 12, 14)),
        color: THEME.textMuted,
    },
    winBadge: {
        flex: 1,
        alignItems: 'flex-end',
    },
    winAmountText: {
        color: THEME.gold,
        fontSize: Number(s(15, 17, 22)),
        fontWeight: '900',
    },
    symbolTextGold: {
        fontSize: Number(s(10, 12, 14)),
        color: THEME.gold,
        fontWeight: 'bold',
    },
});