import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
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
    thbColor: '#1E90FF',
    mmkColor: '#00E676',
};

const BET_AMOUNTS = {
    MMK: [100, 200, 500, 1000, 5000, 10000],
    THB: [10, 20, 50, 100, 500, 1000],
};

const GAME_TYPES = {
    MMK: [
        { id: 'm1', title: '2D တိုက်ရိုက် (၈၅ ဆ)', multiplier: 85, icon: 'numeric-2-box-outline' },
        { id: 'm2', title: '3D တိုက်ရိုက် (၅၅၀ ဆ)', multiplier: 550, icon: 'numeric-3-box-outline' },
    ],
    THB: [
        { id: 't1', title: '2D တိုက်ရိုက် (၉၀ ဆ)', multiplier: 90, icon: 'numeric-2-box-outline' },
        { id: 't2', title: '3D တိုက်ရိုက် (၆၀၀ ဆ)', multiplier: 600, icon: 'numeric-3-box-outline' },
    ]
};

export default function BenefitsTableScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [currency, setCurrency] = useState<'MMK' | 'THB'>('MMK');
    const currencySymbol = currency === 'MMK' ? 'Ks' : '฿';

    const PayoutTableCard = ({ game }: { game: any }) => (
        <View style={styles.cardContainer}>
            <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                    <MaterialCommunityIcons name={game.icon} size={24} color={THEME.textWhite} />
                </View>
                <Text style={styles.cardTitle}>{game.title}</Text>
            </View>

            <View style={styles.tableHeaderRow}>
                <Text style={styles.tableHeaderText}>ထိုးကြေး</Text>
                <Text style={styles.tableHeaderText}>ရမည့်ငွေ</Text>
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


                        <Ionicons name="arrow-forward" size={16} color={THEME.textMuted} />


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

            <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 5 : 15 }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={26} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>ရပိုင်ခွင့် ဇယားများ</Text>
            </View>

            <View style={styles.switcherWrapper}>
                <View style={styles.switcherContainer}>
                    <Pressable
                        style={[styles.switchTab, currency === 'MMK' ? styles.switchTabActiveMMK : null]}
                        onPress={() => setCurrency('MMK')}
                    >
                        <Text style={[styles.switchText, currency === 'MMK' ? styles.switchTextActive : null]}>မြန်မာကျပ် (MMK)</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.switchTab, currency === 'THB' ? styles.switchTabActiveTHB : null]}
                        onPress={() => setCurrency('THB')}
                    >
                        <Text style={[styles.switchText, currency === 'THB' ? styles.switchTextActive : null]}>ထိုင်းဘတ် (THB)</Text>
                    </Pressable>
                </View>
            </View>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={20} color={THEME.gold} />
                    <Text style={styles.infoText}>
                        အောက်ပါဇယားတွင် ထိုးကြေးပမာဏအလိုက် ရရှိနိုင်မည့် အကျိုးအမြတ်များကို အလွယ်တကူ ကြည့်ရှုနိုင်ပါသည်။
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
        paddingHorizontal: 16,
        paddingBottom: 15
    },
    backButton: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: THEME.borderNormal,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    headerTitle: {
        color: THEME.textWhite,
        fontSize: 18,
        fontWeight: 'bold'
    },

    switcherWrapper: {
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    switcherContainer: {
        flexDirection: 'row',
        backgroundColor: THEME.inputBg,
        borderRadius: 12,
        padding: 4,
    },
    switchTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 10
    },
    switchTabActiveMMK: { backgroundColor: THEME.mmkColor },
    switchTabActiveTHB: { backgroundColor: THEME.thbColor },
    switchText: { color: THEME.textMuted, fontSize: 14, fontWeight: 'bold' },
    switchTextActive: { color: '#000000', fontWeight: '900' },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
        paddingTop: 10
    },

    infoBanner: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        color: THEME.gold,
        fontSize: 12,
        marginLeft: 8,
        lineHeight: 18,
    },
    cardContainer: {
        backgroundColor: THEME.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        marginBottom: 20,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.inputBg,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardTitle: {
        color: THEME.textWhite,
        fontSize: 16,
        fontWeight: 'bold',
    },

    tableHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
    },
    tableHeaderText: {
        color: THEME.textMuted,
        fontSize: 12,
        fontWeight: 'bold',
    },

    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
    },
    amountBadge: {
        flex: 1,
        alignItems: 'flex-start',
    },
    betAmountText: {
        color: THEME.textWhite,
        fontSize: 15,
        fontWeight: 'bold',
    },
    symbolText: {
        fontSize: 12,
        color: THEME.textMuted,
    },
    winBadge: {
        flex: 1,
        alignItems: 'flex-end',
    },
    winAmountText: {
        color: THEME.gold,
        fontSize: 17,
        fontWeight: '900',
    },
    symbolTextGold: {
        fontSize: 12,
        color: THEME.gold,
        fontWeight: 'bold',
    },
});