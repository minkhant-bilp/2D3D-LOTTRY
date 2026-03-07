import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

const THEME = {
    cardBg: '#0B132B',
    cardBorder: 'rgba(0, 230, 118, 0.3)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    redLive: '#FF3B30',
    digitBg: '#152243',
};

export function LiveNumberCard() {
    return (
        <View style={styles.cardContainer}>

            <View style={styles.cardHeader}>
                <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                </View>
                <Text style={styles.timeText}>04:30 PM</Text>
            </View>

            <View style={styles.mainNumberWrapper}>
                <View style={styles.digitBox}>
                    <Text style={styles.hugeDigit}>8</Text>
                </View>

                <View style={styles.separator}>
                    <Text style={styles.separatorText}>-</Text>
                </View>

                <View style={styles.digitBox}>
                    <Text style={styles.hugeDigit}>5</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>

                <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>မနက်ပိုင်း</Text>
                    <Text style={[styles.statValue, { color: THEME.textMuted }]}>45</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>နေ့လည်ပိုင်း</Text>
                    <Text style={[styles.statValue, { color: THEME.textWhite }]}>89</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statBlock}>
                    <Text style={[styles.statLabel, { color: THEME.neonGreen }]}>ညနေပိုင်း</Text>
                    <Text style={[styles.statValue, { color: THEME.neonGreen }]}>85</Text>
                </View>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: THEME.cardBg,
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: THEME.cardBorder,
        ...Platform.select({
            ios: {
                shadowColor: THEME.neonGreen,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
                shadowColor: THEME.neonGreen,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)',
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: THEME.redLive,
        marginRight: 6,
    },
    liveText: {
        color: THEME.redLive,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    timeText: {
        color: THEME.textMuted,
        fontSize: 14,
        fontWeight: '600',
    },
    mainNumberWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    digitBox: {
        backgroundColor: THEME.digitBg,
        width: 100,
        height: 120,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.5,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
                shadowColor: '#000',
            }
        })
    },
    hugeDigit: {
        color: THEME.neonGreen,
        fontSize: 85,
        fontWeight: '900',
        includeFontPadding: false,
    },
    separator: {
        marginHorizontal: 15,
    },
    separatorText: {
        color: THEME.textMuted,
        fontSize: 40,
        fontWeight: '300',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.25)',
        borderRadius: 16,
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    statBlock: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        color: THEME.textMuted,
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 35,
        backgroundColor: 'rgba(255,255,255,0.1)',
    }
});