import { useLiveStore } from '@/store/useLiveStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
    Animated,
    Easing,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const POLLING_INTERVAL = 10000;

function getSessionIcon(label: string): keyof typeof MaterialIcons.glyphMap {
    if (label === 'Morning') return 'wb-twilight';
    if (label === 'Noon') return 'light-mode';
    return 'nights-stay';
}

function getMyanmarSessionLabel(label: string): string {
    switch (label) {
        case 'Morning': return 'မနက်';
        case 'Noon': return 'မွန်းတည့်';
        case 'Evening': return 'ညနေ';
        case 'Night': return 'ည';
        default: return label;
    }
}

export default function LiveNumberCard() {
    const router = useRouter();
    const { liveNumber, lastUpdatedTimeText, error, sessionStats, fetchLive } = useLiveStore();

    const numberOpacity = useRef(new Animated.Value(1)).current;
    const ringScale = useRef(new Animated.Value(1)).current;
    const ringOpacity = useRef(new Animated.Value(0.5)).current;
    const dotOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fetchLive();
        const intervalId = setInterval(() => {
            fetchLive();
        }, POLLING_INTERVAL);

        return () => clearInterval(intervalId);
    }, [fetchLive]);

    useEffect(() => {
        const numberBlink = Animated.loop(
            Animated.sequence([
                Animated.timing(numberOpacity, {
                    toValue: 0.3,
                    duration: 400,
                    delay: 1600,
                    useNativeDriver: true,
                }),
                Animated.timing(numberOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ])
        );
        numberBlink.start();

        const ringPulse = Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(ringScale, {
                        toValue: 1.15,
                        duration: 1500,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(ringScale, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(ringOpacity, {
                        toValue: 0,
                        duration: 1500,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(ringOpacity, {
                        toValue: 0.5,
                        duration: 1500,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ])
        );
        ringPulse.start();

        const dotBlink = Animated.loop(
            Animated.sequence([
                Animated.timing(dotOpacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(dotOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        );
        dotBlink.start();

        return () => {
            numberBlink.stop();
            ringPulse.stop();
            dotBlink.stop();
        };
    }, [numberOpacity, ringScale, ringOpacity, dotOpacity]);

    const lastUpdatedLabel = useMemo(() => {
        if (!lastUpdatedTimeText) return 'စောင့်ဆိုင်းနေပါသည်...';
        return `${lastUpdatedTimeText} တွင် မွမ်းမံထားသည်`;
    }, [lastUpdatedTimeText]);

    return (
        <View style={styles.container}>
            <View style={styles.heroSection}>
                <View style={styles.heroWrapper}>
                    <Animated.View
                        style={[
                            styles.glowRingOuter,
                            {
                                transform: [{ scale: ringScale }],
                                opacity: ringOpacity,
                            },
                        ]}
                    />
                    <View style={styles.glowRingInner} />

                    <View style={styles.heroContent}>
                        <Image
                            source={require('../../assets/images/Zarmani_Brand_logo.png')}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />

                        <View style={styles.heroOverlay}>
                            <View style={styles.livePill}>
                                <Animated.View style={[styles.liveDot, { opacity: dotOpacity }]} />
                                <Text style={styles.liveText}>တိုက်ရိုက်</Text>
                            </View>
                            <Animated.Text style={[styles.mainNumber, { opacity: numberOpacity }]}>
                                {liveNumber}
                            </Animated.Text>
                            <Text style={styles.updatedText}>{lastUpdatedLabel}</Text>
                        </View>
                    </View>
                </View>

                {error != null && <Text style={styles.errorText}>ချိတ်ဆက်မှု မအောင်မြင်ပါ</Text>}
            </View>

            <View style={styles.bentoGrid}>
                <View style={styles.bentoCard}>
                    <Text style={styles.bentoTitle}>လောလောဆယ် 2D</Text>
                    <Animated.Text style={[styles.bentoNumber, { opacity: numberOpacity }]}>
                        {liveNumber}
                    </Animated.Text>
                </View>
                <View style={styles.bentoCard}>
                    <Text style={styles.bentoTitle}>လောလောဆယ် 3D</Text>
                    <Text style={styles.bentoNumber}>--</Text>
                </View>
            </View>

            <View style={styles.resultsSection}>
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>နေ့စဉ်ရလဒ်</Text>
                    <Text style={styles.resultsSubtitle}>{lastUpdatedLabel}</Text>
                </View>

                <View style={styles.statsContainer}>
                    {sessionStats.length === 0 ? (
                        <Text style={styles.emptyText}>ရလဒ်မရှိသေးပါ</Text>
                    ) : (
                        sessionStats.map((stat, i) => (
                            <View key={i} style={styles.statRow}>
                                <View style={styles.statLeft}>
                                    <View style={styles.statIconWrap}>
                                        <MaterialIcons name={getSessionIcon(stat.label)} size={22} color="#51e1a5" />
                                    </View>
                                    <View>
                                        <Text style={styles.statLabel}>{getMyanmarSessionLabel(stat.label)}</Text>
                                        <Text style={styles.statTime}>{stat.time}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.statValue, stat.value === '--' && styles.statValueEmpty]}>
                                    {stat.value}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </View>

            <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/explore')}
            >
                <Text style={styles.actionBtnText}>ထီထိုးမည်</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 24,
        paddingTop: 20,
        paddingBottom: 30,
    },
    heroSection: {
        alignItems: 'center',
    },
    heroWrapper: {
        width: 240,
        height: 240,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    glowRingOuter: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 120,
        borderWidth: 2,
        borderColor: 'rgba(81, 225, 165, 0.2)',
    },
    glowRingInner: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(81, 225, 165, 0.1)',
    },
    heroContent: {
        width: '100%',
        height: '100%',
        borderRadius: 120,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#0c1324',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        opacity: 0.5,
        position: 'absolute',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    livePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(81, 225, 165, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(81, 225, 165, 0.4)',
        marginBottom: 8,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#f87171',
        marginRight: 6,
    },
    liveText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#51e1a5',
    },
    mainNumber: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: -2,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 10,
    },
    updatedText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 4,
    },
    errorText: {
        marginTop: 8,
        fontSize: 11,
        color: 'rgba(248, 113, 113, 0.9)',
        textAlign: 'center',
    },
    bentoGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    bentoCard: {
        flex: 1,
        backgroundColor: 'rgba(35, 41, 60, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(60, 74, 60, 0.2)',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    bentoTitle: {
        fontSize: 11,
        color: '#51e1a5',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    bentoNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    resultsSection: {},
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    resultsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    resultsSubtitle: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.4)',
    },
    statsContainer: {
        gap: 8,
    },
    emptyText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        paddingVertical: 16,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#151b2d',
        borderRadius: 12,
        padding: 16,
    },
    statLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#2e3447',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 4,
    },
    statTime: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#51e1a5',
    },
    statValueEmpty: {
        color: 'rgba(255, 255, 255, 0.25)',
    },
    actionBtn: {
        height: 56,
        backgroundColor: '#51e1a5',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#51e1a5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    actionBtnText: {
        color: '#003824',
        fontSize: 16,
        fontWeight: 'bold',
    },
});