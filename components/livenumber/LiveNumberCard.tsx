import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import Advice from './Advice';
import useTranslation from '@/hooks/useTranslation';

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

const LiveIndicator = ({ label }: { label: string }) => {
    return (
        <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{label}</Text>
        </View>
    );
};

export function LiveNumberCard() {
    const { t } = useTranslation();

    return (
        <View>
            <View style={styles.cardContainer}>

                <View style={styles.header}>
                    <LiveIndicator label={t.live || 'LIVE'} />
                    <Text style={styles.timeText}>04:30:45 PM</Text>
                </View>

                <View style={styles.mainDisplay}>
                    <Text style={styles.bigNumber}>85</Text>
                    <View style={styles.horizontalDivider} />
                </View>

                <View style={styles.footer}>
                    <View style={styles.historyBlock}>
                        <Ionicons name="sunny" size={s(15, 26, 32)} color={COLORS.gold} style={styles.iconMargin} />
                        <Text style={styles.historyLabel}>12:01 PM</Text>
                        <Text style={styles.historyValueGold}>45</Text>
                    </View>

                    <View style={styles.footerDivider} />

                    <View style={styles.historyBlock}>
                        <Ionicons name="partly-sunny" size={s(15, 26, 32)} color={COLORS.neonGreen} style={styles.iconMargin} />
                        <Text style={styles.historyLabelNeon}>04:30 PM</Text>
                        <Text style={styles.historyValueNeon}>85</Text>
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
        borderColor: COLORS.cardBorderLive,
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

    // အသစ်ထည့်ထားသော Horizontal Divider ၏ Style
    horizontalDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'stretch',
        marginTop: s(15, 20, 30),
        marginHorizontal: s(10, 15, 20)
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
        fontSize: s(12, 14, 18),
        fontWeight: '700',
        marginBottom: s(2, 4, 6)
    },
    footerDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.1)'
    },

    iconMargin: {
        marginBottom: s(4, 6, 8)
    },
    historyValueGold: {
        color: COLORS.gold,
        fontSize: s(20, 25, 30),
        fontWeight: '900'
    },
    historyLabelNeon: {
        color: COLORS.neonGreen,
        fontSize: s(12, 14, 18),
        fontWeight: '700',
        marginBottom: s(2, 4, 6)
    },
    historyValueNeon: {
        color: COLORS.neonGreen,
        fontSize: s(20, 25, 30),
        fontWeight: '900'
    }
});