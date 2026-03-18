import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

const COLORS = {
    surface: '#121C38',
    textMain: '#FFFFFF',
    textSub: '#8A9BB3',
    cyan: '#00F0FF',
    purple: '#B24BF3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    border: 'rgba(255, 255, 255, 0.08)',
};

const PredictionBox = ({ title, value, color, icon, isFullWidth = false }: { title: string, value: string, color: string, icon: any, isFullWidth?: boolean }) => {
    return (
        <View style={[styles.predBox, isFullWidth && styles.predBoxFull, { backgroundColor: `${color}10`, borderColor: `${color}30` }]}>
            <View style={[styles.predHeader, isFullWidth && { justifyContent: 'flex-start' }]}>
                <Ionicons name={icon} size={s(14, 16, 22)} color={color} style={{ marginRight: s(4, 6, 8) }} />
                <Text style={[styles.predTitle, { color: color }]}>{title}</Text>
            </View>
            <Text style={[styles.predValue, isFullWidth && styles.predValueLarge, { color: COLORS.textMain, textAlign: isFullWidth ? 'left' : 'center' }]}>
                {value}
            </Text>
        </View>
    );
};

export default function Advice() {
    return (
        <View style={styles.container}>

            <View style={styles.predictionHeader}>
                <Ionicons name="bulb" size={s(18, 22, 28)} color={COLORS.gold} />
                <Text style={styles.predictionSectionTitle}>ယနေ့အတွက် အထူးခန့်မှန်းချက်</Text>
            </View>

            <View style={styles.predictionGrid}>

                <View style={styles.row}>
                    <PredictionBox title="ထိပ်စီး (Head)" value="1, 4, 8" color={COLORS.cyan} icon="arrow-up-circle" />
                    <PredictionBox title="နောက်ပိတ် (Tail)" value="2, 7, 9" color={COLORS.purple} icon="arrow-down-circle" />
                </View>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: s(12, 16, 24),
        marginTop: s(20, 30, 45),
        paddingBottom: s(15, 20, 30),
    },

    predictionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: s(10, 15, 20),
        paddingHorizontal: s(2, 4, 8),
    },
    predictionSectionTitle: {
        color: COLORS.textMain,
        fontSize: s(14, 16, 20),
        fontWeight: 'bold',
        marginLeft: s(6, 8, 12),
    },

    // Grid Layout
    predictionGrid: {
        gap: s(8, 12, 16),
    },
    row: {
        flexDirection: 'row',
        gap: s(8, 12, 16),
    },

    predBox: {
        flex: 1,
        borderRadius: s(12, 16, 22),
        padding: s(12, 16, 24),
        borderWidth: 1,
        justifyContent: 'center',
    },
    predBoxFull: {
        width: '100%',
        alignItems: 'flex-start',
    },
    predHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: s(6, 8, 12),
        justifyContent: 'center',
    },
    predTitle: {
        fontSize: s(11, 13, 16),
        fontWeight: 'bold',
    },
    predValue: {
        fontSize: s(18, 22, 28),
        fontWeight: '900',
        letterSpacing: s(1, 2, 3),
    },
    predValueLarge: {
        fontSize: s(20, 26, 34),
        letterSpacing: s(2, 3, 4),
        marginTop: s(3, 4, 6),
    }
});