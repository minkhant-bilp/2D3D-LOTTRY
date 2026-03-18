import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import Advice from './Advice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

const COLORS = {
    cardBg: '#0B132B',
    cardBorderLive: 'rgba(0, 230, 118, 0.3)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    redLive: '#FF453A',
    surfaceBox: '#152243',
    gold: '#FFD700',
};

const LiveIndicator = () => {
    return (
        <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
        </View>
    );
};

export function LiveNumberCard() {
    return (
        <View>
            <View style={[styles.cardContainer, { borderColor: COLORS.cardBorderLive }]}>

                <View style={styles.header}>
                    <LiveIndicator />
                    <Text style={styles.timeText}>04:30:45 PM</Text>
                </View>

                <View style={styles.mainDisplay}>
                    <Text style={styles.bigNumber}>85</Text>
                    <View style={styles.marketDataRow}>
                        <View style={styles.marketBox}>
                            <Text style={styles.marketLabel}>SET</Text>
                            <Text style={styles.marketValue}>
                                1,452.<Text style={styles.highlightDigit}>8</Text>3
                            </Text>
                        </View>
                        <View style={styles.marketDivider} />
                        <View style={styles.marketBox}>
                            <Text style={styles.marketLabel}>Value</Text>
                            <Text style={styles.marketValue}>
                                45,213.2<Text style={styles.highlightDigit}>5</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.historyBlock}>
                        <Ionicons name="sunny-outline" size={s(14, 18, 24)} color={COLORS.textMuted} style={{ marginBottom: s(2, 4, 6) }} />
                        <Text style={styles.historyLabel}>09:00 AM</Text>
                        <Text style={styles.historyValue}>23</Text>
                    </View>

                    <View style={styles.footerDivider} />

                    <View style={styles.historyBlock}>
                        <Ionicons name="sunny" size={s(14, 18, 24)} color={COLORS.gold} style={{ marginBottom: s(2, 4, 6) }} />
                        <Text style={styles.historyLabel}>12:01 PM</Text>
                        <Text style={[styles.historyValue, { color: COLORS.gold }]}>45</Text>
                    </View>

                    <View style={styles.footerDivider} />

                    <View style={styles.historyBlock}>
                        <Ionicons name="partly-sunny" size={s(14, 18, 24)} color={COLORS.neonGreen} style={{ marginBottom: s(2, 4, 6) }} />
                        <Text style={[styles.historyLabel, { color: COLORS.neonGreen }]}>04:30 PM</Text>
                        <Text style={[styles.historyValue, { color: COLORS.neonGreen }]}>85</Text>
                    </View>
                </View>

            </View>

            <Advice />
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: COLORS.cardBg,
        marginHorizontal: s(12, 16, 24),
        marginTop: s(15, 20, 30),
        borderRadius: s(18, 24, 32),
        padding: s(15, 20, 30),
        borderWidth: 1.5,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
            android: { elevation: 10 },
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: s(18, 25, 35)
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 69, 58, 0.15)',
        paddingHorizontal: s(10, 12, 16),
        paddingVertical: s(4, 6, 8),
        borderRadius: s(16, 20, 28),
        borderWidth: 1,
        borderColor: 'rgba(255, 69, 58, 0.3)'
    },
    liveDot: {
        width: s(6, 8, 10),
        height: s(6, 8, 10),
        borderRadius: s(3, 4, 5),
        backgroundColor: COLORS.redLive,
        marginRight: s(4, 6, 8)
    },
    liveText: {
        color: COLORS.redLive,
        fontSize: s(11, 13, 16),
        fontWeight: '900',
        letterSpacing: 1
    },
    timeText: {
        color: COLORS.textMuted,
        fontSize: s(12, 14, 18),
        fontWeight: '700',
        letterSpacing: 1
    },

    mainDisplay: {
        alignItems: 'center',
        marginBottom: s(20, 30, 45)
    },
    bigNumber: {
        color: COLORS.neonGreen,
        fontSize: s(80, 110, 160),
        fontWeight: '900',
        includeFontPadding: false,
        lineHeight: s(90, 120, 170),
        textShadowColor: 'rgba(0, 230, 118, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: s(15, 20, 30)
    },

    marketDataRow: {
        flexDirection: 'row',
        backgroundColor: COLORS.surfaceBox,
        paddingVertical: s(10, 12, 16),
        paddingHorizontal: s(15, 20, 30),
        borderRadius: s(12, 16, 24),
        marginTop: s(8, 10, 16),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    marketBox: {
        alignItems: 'center',
        paddingHorizontal: s(10, 15, 25)
    },
    marketLabel: {
        color: COLORS.textMuted,
        fontSize: s(10, 12, 15),
        fontWeight: '600',
        marginBottom: s(2, 4, 6)
    },
    marketValue: {
        color: COLORS.textWhite,
        fontSize: s(14, 16, 22),
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    highlightDigit: {
        color: COLORS.neonGreen,
        fontSize: s(18, 20, 26),
        fontWeight: '900'
    },
    marketDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)'
    },

    footer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: s(12, 16, 24),
        paddingVertical: s(10, 12, 16)
    },
    historyBlock: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    historyLabel: {
        color: COLORS.textMuted,
        fontSize: s(9, 11, 14),
        fontWeight: '700',
        marginBottom: s(2, 4, 6)
    },
    historyValue: {
        color: COLORS.textWhite,
        fontSize: s(16, 20, 28),
        fontWeight: '900'
    },
    footerDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)'
    }
});