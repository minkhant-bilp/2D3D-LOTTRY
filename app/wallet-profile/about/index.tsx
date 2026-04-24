import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
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
    card: '#0B132B',
    border: 'rgba(255,255,255,0.08)',
    text: '#FFFFFF',
    muted: '#8A9BB3',
    neon: '#00E676',
};

export default function About() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    return (
        <View style={styles.screen}>

            <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, Number(s(15, 20, 30))) }]} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>

                    <View style={styles.logoRow}>
                        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={Number(s(20, 24, 30))} color={THEME.neon} />
                            <Text style={styles.backText}>{t.back || 'Back'}</Text>
                        </Pressable>

                        <View style={styles.logo}>
                            <Ionicons name="information-circle-outline" size={Number(s(22, 26, 32))} color={THEME.neon} />
                        </View>

                        <View style={styles.spacer} />
                    </View>

                    <Text style={styles.title}>{t.aboutTitle || 'About K Shop'}</Text>
                    <Text style={styles.subtitle}>
                        {t.aboutSubtitle || 'A clean, fast, and secure experience — designed for smooth shopping on any phone.'}
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="color-palette-outline" size={Number(s(16, 18, 22))} color={THEME.neon} />
                        <Text style={styles.cardTitle}>{t.feature1Title || 'Clean UI, simple flow'}</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        {t.feature1Desc || 'K Shop focuses on a minimal layout and clear steps. Buttons are easy to find, text is easy to read, and screens avoid clutter so you can finish tasks quickly.'}
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="cube-outline" size={Number(s(16, 18, 22))} color={THEME.neon} />
                        <Text style={styles.cardTitle}>{t.feature2Title || '2D & 3D experience'}</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        {t.feature2Desc || 'The app supports both 2D and 3D style visuals. 2D keeps things fast and clean for browsing. 3D-style cards and depth effects make important actions feel more “touchable” and modern.'}
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="calculator-outline" size={Number(s(16, 18, 22))} color={THEME.neon} />
                        <Text style={styles.cardTitle}>{t.feature3Title || 'Lottery & number features'}</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        {t.feature3Desc || 'We also include number-based features such as 2D/3D lottery-related content and results. Data is shown in a clear format, with easy scanning, simple filters, and fast access to recent numbers.'}
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="shield-checkmark-outline" size={Number(s(16, 18, 22))} color={THEME.neon} />
                        <Text style={styles.cardTitle}>{t.feature4Title || 'Security & privacy'}</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        {t.feature4Desc || 'Security is a priority. We protect user sessions, reduce risky behavior (like storing sensitive info in plain text), and use secure communication standards. Your personal data is handled carefully and only used to run core features.'}
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="card-outline" size={Number(s(16, 18, 22))} color={THEME.neon} />
                        <Text style={styles.cardTitle}>{t.feature5Title || 'Payments'}</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        {t.feature5Desc || 'Payments are designed to be simple and safe. The app keeps the checkout flow short and clear, shows transparent totals, and supports secure payment handling through trusted providers.'}
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="sparkles-outline" size={Number(s(16, 18, 22))} color={THEME.neon} />
                        <Text style={styles.cardTitle}>{t.careAboutTitle || 'What we care about'}</Text>
                    </View>

                    <View style={styles.bulletRow}>
                        <View style={styles.dot} />
                        <Text style={styles.bulletText}>{t.care1 || 'Fast performance on low and high-end devices.'}</Text>
                    </View>

                    <View style={styles.bulletRow}>
                        <View style={styles.dot} />
                        <Text style={styles.bulletText}>{t.care2 || 'Clean UI with a simple step-by-step flow.'}</Text>
                    </View>

                    <View style={styles.bulletRow}>
                        <View style={styles.dot} />
                        <Text style={styles.bulletText}>{t.care3 || 'Secure accounts and careful data handling.'}</Text>
                    </View>

                    <View style={styles.bulletRow}>
                        <View style={styles.dot} />
                        <Text style={styles.bulletText}>{t.care4 || 'Clear 2D/3D number content presentation.'}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="information-outline" size={Number(s(16, 18, 22))} color={THEME.neon} />
                        <Text style={styles.cardTitle}>{t.appInfoTitle || 'App info'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t.appVersion || 'Version'}</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t.appBuild || 'Build'}</Text>
                        <Text style={styles.infoValue}>{t.stable || 'Stable'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t.appMadeFor || 'Made for'}</Text>
                        <Text style={styles.infoValue}>{t.mobile || 'Mobile'}</Text>
                    </View>
                </View>

                <Text style={styles.footer}>{t.footerText || '© 2026 Lottery • About'}</Text>
                <View style={{ height: Number(s(30, 40, 60)) }}></View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: THEME.bg
    },
    content: {
        padding: Number(s(14, 16, 24)),
        paddingBottom: Number(s(30, 40, 60)),
        marginTop: Number(s(10, 15, 20))
    },
    header: {
        alignItems: 'center',
        marginBottom: Number(s(14, 18, 24))
    },
    logoRow: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Number(s(8, 10, 14)),
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        width: Number(s(60, 70, 90))
    },
    spacer: {
        width: Number(s(60, 70, 90))
    },
    backText: {
        color: THEME.neon,
        fontSize: Number(s(14, 16, 20)),
        fontWeight: '800'
    },
    logo: {
        width: Number(s(48, 56, 70)),
        height: Number(s(48, 56, 70)),
        borderRadius: Number(s(14, 18, 24)),
        backgroundColor: 'rgba(0,230,118,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(0,230,118,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: THEME.text,
        fontSize: Number(s(24, 28, 36)),
        fontWeight: '900',
        marginTop: Number(s(8, 10, 14))
    },
    subtitle: {
        color: THEME.muted,
        fontSize: Number(s(12, 13, 16)),
        textAlign: 'center',
        marginTop: Number(s(4, 6, 10)),
        lineHeight: Number(s(16, 18, 24))
    },
    card: {
        backgroundColor: THEME.card,
        borderRadius: Number(s(14, 18, 24)),
        borderWidth: 1,
        borderColor: THEME.border,
        padding: Number(s(12, 14, 20)),
        marginBottom: Number(s(10, 12, 16)),
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Number(s(8, 10, 14)),
        marginBottom: Number(s(6, 8, 12))
    },
    cardTitle: {
        color: THEME.text,
        fontSize: Number(s(14, 15, 18)),
        fontWeight: '800'
    },
    bodyText: {
        color: THEME.muted,
        fontSize: Number(s(12, 13, 16)),
        lineHeight: Number(s(17, 19, 24))
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Number(s(8, 10, 14))
    },
    dot: {
        width: Number(s(5, 7, 9)),
        height: Number(s(5, 7, 9)),
        borderRadius: Number(s(3, 4, 5)),
        backgroundColor: THEME.neon,
        marginRight: Number(s(8, 10, 14))
    },
    bulletText: {
        flex: 1,
        color: THEME.muted,
        fontSize: Number(s(12, 13, 16)),
        lineHeight: Number(s(16, 18, 24))
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Number(s(6, 8, 12)),
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    infoLabel: {
        color: THEME.muted,
        fontSize: Number(s(12, 13, 16)),
        fontWeight: '700'
    },
    infoValue: {
        color: THEME.text,
        fontSize: Number(s(12, 13, 16)),
        fontWeight: '800'
    },
    footer: {
        color: THEME.muted,
        textAlign: 'center',
        marginTop: Number(s(15, 20, 30)),
        fontSize: Number(s(11, 12, 14))
    },
});