import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

            <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 20) }]} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>

                    <View style={styles.logoRow}>
                        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color={THEME.neon} />
                            <Text style={styles.backText}>Back</Text>
                        </Pressable>

                        <View style={styles.logo}>
                            <Ionicons name="information-circle-outline" size={26} color={THEME.neon} />
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
                        <Ionicons name="color-palette-outline" size={18} color={THEME.neon} />
                        <Text style={styles.cardTitle}>Clean UI, simple flow</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        K Shop focuses on a minimal layout and clear steps. Buttons are easy to find, text is easy to read,
                        and screens avoid clutter so you can finish tasks quickly.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="cube-outline" size={18} color={THEME.neon} />
                        <Text style={styles.cardTitle}>2D & 3D experience</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        The app supports both 2D and 3D style visuals. 2D keeps things fast and clean for browsing.
                        3D-style cards and depth effects make important actions feel more “touchable” and modern.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="calculator-outline" size={18} color={THEME.neon} />
                        <Text style={styles.cardTitle}>Lottery & number features</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        We also include number-based features such as 2D/3D lottery-related content and results.
                        Data is shown in a clear format, with easy scanning, simple filters, and fast access to recent numbers.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="shield-checkmark-outline" size={18} color={THEME.neon} />
                        <Text style={styles.cardTitle}>Security & privacy</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        Security is a priority. We protect user sessions, reduce risky behavior (like storing sensitive info in plain text),
                        and use secure communication standards. Your personal data is handled carefully and only used to run core features.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="card-outline" size={18} color={THEME.neon} />
                        <Text style={styles.cardTitle}>Payments</Text>
                    </View>
                    <Text style={styles.bodyText}>
                        Payments are designed to be simple and safe. The app keeps the checkout flow short and clear,
                        shows transparent totals, and supports secure payment handling through trusted providers.
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Ionicons name="sparkles-outline" size={18} color={THEME.neon} />
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
                        <Ionicons name="information-outline" size={18} color={THEME.neon} />
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
                <View style={{ height: 40 }}></View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: THEME.bg },

    content: { padding: 16, paddingBottom: 40, marginTop: 15 },

    header: { alignItems: 'center', marginBottom: 18 },

    logoRow: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    backBtn: { flexDirection: 'row', alignItems: 'center', width: 70 },
    spacer: { width: 70 },
    backText: { color: THEME.neon, fontSize: 16, fontWeight: '800' },

    logo: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: 'rgba(0,230,118,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(0,230,118,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: { color: THEME.text, fontSize: 28, fontWeight: '900' },
    subtitle: { color: THEME.muted, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 18 },

    card: {
        backgroundColor: THEME.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: THEME.border,
        padding: 14,
        marginBottom: 12,
    },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    cardTitle: { color: THEME.text, fontSize: 15, fontWeight: '800' },
    bodyText: { color: THEME.muted, fontSize: 13, lineHeight: 19 },

    bulletRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: THEME.neon, marginRight: 10 },
    bulletText: { flex: 1, color: THEME.muted, fontSize: 13, lineHeight: 18 },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    infoLabel: { color: THEME.muted, fontSize: 13, fontWeight: '700' },
    infoValue: { color: THEME.text, fontSize: 13, fontWeight: '800' },

    btn: {
        marginTop: 6,
        height: 52,
        borderRadius: 16,
        backgroundColor: THEME.neon,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    btnText: { color: THEME.bg, fontSize: 15, fontWeight: '900' },

    footer: { color: THEME.muted, textAlign: 'center', marginTop: 20, fontSize: 12 },
});