import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import useTranslation from '@/hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: number, medium: number, tablet: number) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

const COLORS = {
    surface: '#121C38',
    boxBg: '#1A2A40',
    iconBg: '#2D3E56',
    textMain: '#FFFFFF',
    textSub: '#A0ABC0',
    neonGreen: '#4ade80',
};

export default function Advice() {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>

            <View style={styles.resultGrid}>

                <View style={styles.resultBox}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="sunny-outline" size={s(20, 24, 28)} color={COLORS.neonGreen} />
                    </View>

                    <View style={styles.textWrapper}>
                        <Text style={styles.label}>{t.noonLabel || 'မွန်းတည့်'}</Text>
                        <Text style={styles.timeText}>12:01 PM</Text>
                    </View>

                    <Text style={styles.resultNumber}>52</Text>
                </View>

                <View style={styles.resultBox}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="cloudy-night-outline" size={s(20, 24, 28)} color={COLORS.neonGreen} />
                    </View>

                    <View style={styles.textWrapper}>
                        <Text style={styles.label}>{t.eveningLabel || 'ညနေ'}</Text>
                        <Text style={styles.timeText}>4:30 PM</Text>
                    </View>

                    <Text style={styles.resultNumber}>51</Text>
                </View>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: s(12, 16, 24),
        marginTop: s(10, 15, 20),
        paddingBottom: s(15, 20, 30),
    },

    resultGrid: {
        flexDirection: 'column',
        gap: s(12, 16, 20),
    },

    resultBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.boxBg,
        borderRadius: s(14, 18, 24),
        paddingVertical: s(14, 18, 22),
        paddingHorizontal: s(14, 18, 22),
        width: '100%',
    },

    iconWrapper: {
        width: s(44, 52, 60),
        height: s(44, 52, 60),
        backgroundColor: COLORS.iconBg,
        borderRadius: s(10, 14, 18),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: s(12, 16, 20),
    },

    textWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        color: COLORS.textSub,
        fontSize: s(12, 14, 16),
        fontWeight: '600',
        marginBottom: s(2, 4, 6),
    },
    timeText: {
        color: COLORS.textMain,
        fontSize: s(16, 18, 22),
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    resultNumber: {
        color: COLORS.neonGreen,
        fontSize: s(36, 44, 54),
        fontWeight: 'bold',
        includeFontPadding: false,
    }
});