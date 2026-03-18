import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

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

    return (
        <View style={styles.screen}>

            <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, s(15, 20, 30)) }]} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>

                    <View style={styles.logoRow}>
                        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={s(20, 24, 30)} color={THEME.neon} />
                            <Text style={styles.backText}>Back</Text>
                        </Pressable>

                        <View style={styles.logo}>
                            <Ionicons name="information-circle-outline" size={s(22, 26, 32)} color={THEME.neon} />
                        </View>

                        <View style={styles.spacer} />
                    </View>

                    <Text style={styles.title}>About K Shop</Text>
                    <Text style={styles.subtitle}>
                        A clean, fast, and secure experience — designed for smooth shopping on any phone.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="color-palette-outline" size={s(16, 18, 22)} color={THEME.neon} />
                        <Text style={styles.cardTitle}>Clean UI, simple flow</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        K Shop focuses on a minimal layout and clear steps. Buttons are easy to find, text is easy to read,
                        and screens avoid clutter so you can finish tasks quickly.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="cube-outline" size={s(16, 18, 22)} color={THEME.neon} />
                        <Text style={styles.cardTitle}>2D & 3D experience</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        The app supports both 2D and 3D style visuals. 2D keeps things fast and clean for browsing.
                        3D-style cards and depth effects make important actions feel more “touchable” and modern.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="calculator-outline" size={s(16, 18, 22)} color={THEME.neon} />
                        <Text style={styles.cardTitle}>Lottery & number features</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        We also include number-based features such as 2D/3D lottery-related content and results.
                        Data is shown in a clear format, with easy scanning, simple filters, and fast access to recent numbers.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="shield-checkmark-outline" size={s(16, 18, 22)} color={THEME.neon} />
                        <Text style={styles.cardTitle}>Security & privacy</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        Security is a priority. We protect user sessions, reduce risky behavior (like storing sensitive info in plain text),
                        and use secure communication standards. Your personal data is handled carefully and only used to run core features.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="card-outline" size={s(16, 18, 22)} color={THEME.neon} />
                        <Text style={styles.cardTitle}>Payments</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        Payments are designed to be simple and safe. The app keeps the checkout flow short and clear,
                        shows transparent totals, and supports secure payment handling through trusted providers.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="sparkles-outline" size={s(16, 18, 22)} color={THEME.neon} />
                        <Text style={styles.cardTitle}>What we care about</Text>
                    </View>

                    <View style={styles.bulletRow}>
                        <View style={styles.dot} />
                        <Text style={styles.bulletText}>Fast performance on low and high-end devices.</Text>
                    </View>

                    <View style={styles.bulletRow}>
                        <View style={styles.dot} />
                        <Text style={styles.bulletText}>Clean UI with a simple step-by-step flow.</Text>
                    </View>

                    <View style={styles.bulletRow}>
                        <View style={styles.dot} />
                        <Text style={styles.bulletText}>Secure accounts and careful data handling.</Text>
                    </View>

                    <View style={styles.bulletRow}>
                        <View style={styles.dot} />
                        <Text style={styles.bulletText}>Clear 2D/3D number content presentation.</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="information-outline" size={s(16, 18, 22)} color={THEME.neon} />
                        <Text style={styles.cardTitle}>App info</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Version</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Build</Text>
                        <Text style={styles.infoValue}>Stable</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Made for</Text>
                        <Text style={styles.infoValue}>Mobile</Text>
                    </View>
                </View>

                <Text style={styles.footer}>© 2026 Lottery • About</Text>
                <View style={{ height: s(30, 40, 60) }}></View>
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
        padding: s(14, 16, 24),
        paddingBottom: s(30, 40, 60),
        marginTop: s(10, 15, 20)
    },

    header: {
        alignItems: 'center',
        marginBottom: s(14, 18, 24)
    },

    logoRow: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: s(8, 10, 14),
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        width: s(60, 70, 90)
    },
    spacer: {
        width: s(60, 70, 90)
    },
    backText: {
        color: THEME.neon,
        fontSize: s(14, 16, 20),
        fontWeight: '800'
    },

    logo: {
        width: s(48, 56, 70),
        height: s(48, 56, 70),
        borderRadius: s(14, 18, 24),
        backgroundColor: 'rgba(0,230,118,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(0,230,118,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: THEME.text,
        fontSize: s(24, 28, 36),

        fontWeight: '900',
        marginTop: s(8, 10, 14)
    },
    subtitle: {
        color: THEME.muted,
        fontSize: s(12, 13, 16),
        textAlign: 'center',
        marginTop: s(4, 6, 10),
        lineHeight: s(16, 18, 24)
    },

    card: {
        backgroundColor: THEME.card,
        borderRadius: s(14, 18, 24),
        borderWidth: 1,
        borderColor: THEME.border,
        padding: s(12, 14, 20),
        marginBottom: s(10, 12, 16),
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(8, 10, 14),
        marginBottom: s(6, 8, 12)
    },
    cardTitle: {
        color: THEME.text,
        fontSize: s(14, 15, 18),
        fontWeight: '800'
    },
    bodyText: {
        color: THEME.muted,
        fontSize: s(12, 13, 16),
        lineHeight: s(17, 19, 24)
    },

    bulletRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: s(8, 10, 14)
    },
    dot: {
        width: s(5, 7, 9),
        height: s(5, 7, 9),
        borderRadius: s(3, 4, 5),
        backgroundColor: THEME.neon,
        marginRight: s(8, 10, 14)
    },
    bulletText: {
        flex: 1,
        color: THEME.muted,
        fontSize: s(12, 13, 16),
        lineHeight: s(16, 18, 24)
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: s(6, 8, 12),
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    infoLabel: {
        color: THEME.muted,
        fontSize: s(12, 13, 16),
        fontWeight: '700'
    },
    infoValue: {
        color: THEME.text,
        fontSize: s(12, 13, 16),
        fontWeight: '800'
    },

    btn: {
        marginTop: s(4, 6, 10),
        height: s(46, 52, 60),
        borderRadius: s(14, 16, 20),
        backgroundColor: THEME.neon,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: s(8, 10, 14),
    },
    btnText: {
        color: THEME.bg,
        fontSize: s(13, 15, 18),
        fontWeight: '900'
    },

    footer: {
        color: THEME.muted,
        textAlign: 'center',
        marginTop: s(15, 20, 30),
        fontSize: s(11, 12, 14)
    },
});