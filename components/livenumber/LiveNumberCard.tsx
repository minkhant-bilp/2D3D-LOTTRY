import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

import { getTwoDLive, listTwoDResultsLastFiveDays, listTwoDSideNumbersLastFiveDays } from '@/api/main';

const MMT_OFFSET_MINUTES = 390;

function todayMMT(): string {
    return new Date(Date.now() + MMT_OFFSET_MINUTES * 60000).toISOString().slice(0, 10);
}

function minutesOfDayMMT(now: Date = new Date()): number {
    const shifted = new Date(now.getTime() + MMT_OFFSET_MINUTES * 60000);
    return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

const LIVE_TICKER_START_MINUTES = 9 * 60;
const LIVE_TICKER_END_MINUTES = 16 * 60 + 30;

function isLiveTickerActive(now: Date = new Date()): boolean {
    const minutes = minutesOfDayMMT(now);
    return minutes >= LIVE_TICKER_START_MINUTES && minutes < LIVE_TICKER_END_MINUTES;
}

function sanitizeTwod(value: any): string {
    if (typeof value !== 'string' && typeof value !== 'number') return '--';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length === 0) return '--';
    return digits.slice(-2).padStart(2, '0');
}

function formatOpenTime(openTime: string): string {
    const parts = openTime.split(':');
    const hour = parseInt(parts[0] || '0', 10);
    const min = parts[1] || '00';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${min} ${suffix}`;
}

type SlotSpec =
    | { kind: 'single'; label: string; openTime: string }
    | { kind: 'pair'; label: string; slot: 'morning' | 'evening'; displayTime: string };

const SLOTS: readonly SlotSpec[] = [
    { kind: 'pair', label: 'Morning', slot: 'morning', displayTime: '09:30:00' },
    { kind: 'single', label: 'Noon', openTime: '12:01:00' },
    { kind: 'pair', label: 'Afternoon', slot: 'evening', displayTime: '14:00:00' },
    { kind: 'single', label: 'Evening', openTime: '16:30:00' },
];

function buildTodayStats(results: any[] = [], sideNumbers: any[] = []) {
    const today = todayMMT();
    const todaysResults = results.filter((r) => (r.stock_date || '').slice(0, 10) === today);
    const todaysSideNumbers = sideNumbers.filter((s) => (s.result_date || '').slice(0, 10) === today);

    return SLOTS.map((spec) => {
        if (spec.kind === 'single') {
            const row = todaysResults.find((r) => (r.open_time || '').slice(0, 5) === spec.openTime.slice(0, 5));
            return {
                kind: 'single',
                label: spec.label,
                time: formatOpenTime(spec.openTime),
                value: sanitizeTwod(row?.twod),
            };
        }
        const row = todaysSideNumbers.find((s) => s.slot === spec.slot);
        return {
            kind: 'pair',
            label: spec.label,
            time: formatOpenTime(row?.display_time ?? spec.displayTime),
            modern: sanitizeTwod(row?.modern),
            internet: sanitizeTwod(row?.internet),
        };
    });
}

function getSessionIcon(label: string): keyof typeof MaterialIcons.glyphMap {
    if (label === 'Morning') return 'wb-twilight';
    if (label === 'Noon') return 'light-mode';
    if (label === 'Afternoon') return 'wb-cloudy';
    return 'nights-stay';
}

export default function LiveNumberCard() {
    const router = useRouter();
    const { t } = useTranslation();

    const [tickerActive, setTickerActive] = useState(() => isLiveTickerActive());

    useEffect(() => {
        const id = setInterval(() => {
            setTickerActive(isLiveTickerActive());
        }, 30000);
        return () => clearInterval(id);
    }, []);

    const { data: liveData, isError: isLiveError } = useQuery({
        queryKey: ['twoDLive'],
        queryFn: async () => {
            const res: any = await getTwoDLive();
            return res?.data?.live || res?.live;
        },
        refetchInterval: tickerActive ? 5000 : 120000,
    });

    const liveNumber = liveData?.twod ? sanitizeTwod(liveData.twod) : '--';
    const lastUpdatedTimeText = liveData?.time ?? null;

    const { data: sessionStats = [], isError: isResultsError } = useQuery({
        queryKey: ['twoDDailyResults'],
        queryFn: async () => {
            const [resultsRes, sideNumbersRes] = await Promise.all([
                listTwoDResultsLastFiveDays(),
                listTwoDSideNumbersLastFiveDays(),
            ]);

            return buildTodayStats(
                (resultsRes as any)?.data?.two_d_results || (resultsRes as any)?.two_d_results || [],
                (sideNumbersRes as any)?.data?.two_d_side_numbers || (sideNumbersRes as any)?.two_d_side_numbers || []
            );
        },
        refetchInterval: 60000,
    });

    const pulsing = liveNumber !== '--' && tickerActive;

    const numberOpacity = useSharedValue(1);
    const ringOpacity = useSharedValue(1);
    const dotOpacity = useSharedValue(1);

    useEffect(() => {
        if (pulsing) {
            numberOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.15, { duration: 250, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 250, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1500 })
                ),
                -1
            );

            ringOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1
            );

            dotOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
                ),
                -1
            );
        } else {
            cancelAnimation(numberOpacity);
            cancelAnimation(ringOpacity);
            cancelAnimation(dotOpacity);
            numberOpacity.value = withTiming(1);
            ringOpacity.value = withTiming(1);
            dotOpacity.value = withTiming(1);
        }
    }, [pulsing]);

    const numberStyle = useAnimatedStyle(() => ({ opacity: numberOpacity.value }));
    const ringStyle = useAnimatedStyle(() => ({ opacity: ringOpacity.value }));
    const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

    const lastUpdatedLabel = useMemo(() => {
        if (!lastUpdatedTimeText) return t('live.waiting', 'စောင့်ဆိုင်းနေပါသည်...') as string;
        return `${lastUpdatedTimeText} ${t('live.updated_at', 'တွင် မွမ်းမံထားသည်') as string}`;
    }, [lastUpdatedTimeText, t]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.heroSection}>
                <View style={styles.heroWrapper}>
                    <Animated.View style={[styles.glowRingOuter, ringStyle]} />
                    <View style={styles.glowRingInner} />

                    <View style={styles.heroContent}>
                        <Image
                            source={require('../../assets/images/Zarmani_Brand_logo.png')}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />

                        <View style={styles.heroOverlay}>
                            <View style={styles.livePill}>
                                <Animated.View style={[styles.liveDot, dotStyle]} />
                                <Text style={styles.liveText}>{t('live.live_now', 'တိုက်ရိုက်') as string}</Text>
                            </View>

                            <Animated.View style={numberStyle}>
                                <Text style={styles.mainNumber}>{liveNumber}</Text>
                            </Animated.View>

                            <View style={styles.updatedTextContainer}>
                                <Text style={styles.updatedText}>{lastUpdatedLabel}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {isLiveError && <Text style={styles.errorText}>{t('live.conn_error', 'ချိတ်ဆက်မှု မအောင်မြင်ပါ') as string}</Text>}
            </View>

            <View style={styles.resultsSection}>
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>{t('live.daily_result', 'နေ့စဉ်ရလဒ်') as string}</Text>
                    <Text style={styles.resultsSubtitle}>{lastUpdatedLabel}</Text>
                </View>

                <View style={styles.statsContainer}>
                    {isResultsError ? (
                        <Text style={[styles.emptyText, { color: '#F87171' }]}>{t('live.result_error', 'ရလဒ်များ ရယူ၍မရပါ') as string}</Text>
                    ) : sessionStats.length === 0 ? (
                        <Text style={styles.emptyText}>{t('live.no_result', 'ရလဒ်မရှိသေးပါ') as string}</Text>
                    ) : (
                        sessionStats.map((stat, i) => (
                            <View key={i} style={styles.statRow}>
                                <View style={styles.statLeft}>
                                    <View style={styles.statIconWrap}>
                                        <MaterialIcons name={getSessionIcon(stat.label)} size={22} color="#51e1a5" />
                                    </View>
                                    <View>
                                        <Text style={styles.statLabel}>
                                            {t(`live.session_${stat.label.toLowerCase()}`, stat.label) as string}
                                        </Text>
                                        <Text style={styles.statTime}>{stat.time}</Text>
                                    </View>
                                </View>

                                {stat.kind === 'single' ? (
                                    <Text style={[styles.statValue, stat.value === '--' && styles.statValueEmpty]}>
                                        {stat.value}
                                    </Text>
                                ) : (
                                    <View style={styles.indicatorContainer}>
                                        <View style={styles.indicatorCol}>
                                            <Text style={[styles.statValue, stat.modern === '--' && styles.statValueEmpty]}>
                                                {stat.modern}
                                            </Text>
                                            <Text style={styles.indicatorLabel}>MODERN</Text>
                                        </View>
                                        <View style={styles.indicatorCol}>
                                            <Text style={[styles.statValue, stat.internet === '--' && styles.statValueEmpty]}>
                                                {stat.internet}
                                            </Text>
                                            <Text style={styles.indicatorLabel}>INTERNET</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </View>

            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85} onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.actionBtnText}>{t('live.bet_btn', 'ထီထိုးမည်') as string}</Text>
            </TouchableOpacity>
            <View style={{ height: 70 }}></View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { gap: 24, paddingTop: 20, paddingBottom: 25, paddingHorizontal: 20 },

    heroSection: { alignItems: 'center' },
    heroWrapper: { width: 240, height: 240, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    glowRingOuter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 120, borderWidth: 2, borderColor: 'rgba(81, 225, 165, 0.2)' },
    glowRingInner: { position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(81, 225, 165, 0.1)' },

    heroContent: { width: '100%', height: '100%', borderRadius: 120, overflow: 'hidden', position: 'relative', backgroundColor: '#0c1324' },
    heroImage: { width: '100%', height: '100%', opacity: 0.5, position: 'absolute' },
    heroOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingBottom: 30, backgroundColor: 'rgba(0, 0, 0, 0.35)' },
    livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(81, 225, 165, 0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(81, 225, 165, 0.4)', marginBottom: 8 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#f87171', marginRight: 6 },
    liveText: { fontSize: 10, fontWeight: 'bold', color: '#51e1a5' },
    mainNumber: { fontSize: 72, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: -2, textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 10 },
    updatedTextContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    updatedText: { fontSize: 10, color: 'rgba(255, 255, 255, 0.7)' },
    errorText: { marginTop: 8, fontSize: 11, color: 'rgba(248, 113, 113, 0.9)', textAlign: 'center' },

    resultsSection: {},
    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
    resultsTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    resultsSubtitle: { fontSize: 10, color: 'rgba(255, 255, 255, 0.4)' },
    statsContainer: { gap: 8 },
    emptyText: { fontSize: 14, color: 'rgba(255, 255, 255, 0.3)', textAlign: 'center', paddingVertical: 16 },
    statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#151b2d', borderRadius: 12, padding: 16 },
    statLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    statIconWrap: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#2e3447', alignItems: 'center', justifyContent: 'center' },
    statLabel: { fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 4 },
    statTime: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#51e1a5' },
    statValueEmpty: { color: 'rgba(255, 255, 255, 0.25)' },
    indicatorContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    indicatorCol: { alignItems: 'flex-end' },
    indicatorLabel: { fontSize: 9, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },

    actionBtn: { height: 56, backgroundColor: '#51e1a5', borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#51e1a5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    actionBtnText: { color: '#003824', fontSize: 16, fontWeight: 'bold' },
});