import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * PLACEHOLDER HANDLES — replace with the real support accounts before release.
 * These are carried over from the web client, which never had real ones either.
 */
export const SUPPORT_CHANNELS: {
    id: string;
    href: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    titleKey: string;
    defaultTitle: string;
    descKey: string;
    defaultDesc: string;
}[] = [
    {
        id: 'facebook',
        href: 'https://facebook.com',
        icon: 'facebook',
        titleKey: 'help_center.fb_support',
        defaultTitle: 'Facebook Support',
        descKey: 'help_center.fb_support_desc',
        defaultDesc: 'Chat with live support agents',
    },
    {
        id: 'telegram',
        href: 'https://t.me',
        icon: 'send',
        titleKey: 'help_center.telegram',
        defaultTitle: 'Telegram Line',
        descKey: 'help_center.telegram_desc',
        defaultDesc: 'Fast response for payment and ticket issues',
    },
    {
        id: 'viber',
        href: 'viber://chat',
        icon: 'phone-in-talk',
        titleKey: 'help_center.viber',
        defaultTitle: 'Viber Contact',
        descKey: 'help_center.viber_desc',
        defaultDesc: 'Voice and text support for urgent cases',
    },
];

const FAQ = [
    { id: 'faq-1', qKey: 'help_center.faq_q1', qDefault: 'How long does a deposit approval take?', aKey: 'help_center.faq_a1', aDefault: 'Most requests are approved within a few minutes when transfer notes are complete.' },
    { id: 'faq-2', qKey: 'help_center.faq_q2', qDefault: 'Can I edit a number slip after submit?', aKey: 'help_center.faq_a2', aDefault: 'No, submitted slips are locked, so review picks and stake before final confirmation.' },
];

export default function HelpCenterScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const openChannel = async (href: string) => {
        try {
            await Linking.openURL(href);
        } catch (error) {
            // Viber deep links fail when the app isn't installed — not worth an alert.
            console.warn('[support] could not open channel', href, error);
        }
    };

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>{t('help_center.eyebrow', 'Support') as string}</Text>
                    <Text style={styles.title}>{t('help_center.title', 'Help Center') as string}</Text>
                    <Text style={styles.desc}>
                        {t('help_center.desc', 'Reach support channels and browse quick answers for common issues.') as string}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('help_center.contact_channels', 'Contact channels') as string}</Text>
                    <Text style={styles.cardCaption}>{t('help_center.available_daily', 'Available daily') as string}</Text>

                    {SUPPORT_CHANNELS.map((channel) => (
                        <Pressable
                            key={channel.id}
                            style={({ pressed }) => [styles.channelRow, pressed && styles.channelRowPressed]}
                            onPress={() => openChannel(channel.href)}
                        >
                            <View style={styles.channelIcon}>
                                <MaterialIcons name={channel.icon} size={18} color="#51e1a5" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.channelTitle}>{t(channel.titleKey, channel.defaultTitle) as string}</Text>
                                <Text style={styles.channelDesc}>{t(channel.descKey, channel.defaultDesc) as string}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#5d6f8c" />
                        </Pressable>
                    ))}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('help_center.faq', 'FAQ') as string}</Text>
                    <Text style={styles.cardCaption}>{t('help_center.quick_answers', '2 quick answers') as string}</Text>

                    {FAQ.map((item) => (
                        <View key={item.id} style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>{t(item.qKey, item.qDefault) as string}</Text>
                            <Text style={styles.faqAnswer}>{t(item.aKey, item.aDefault) as string}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: '#050A1F' },
    backBtn: { marginRight: 16, padding: 4 },
    headerTextContainer: { justifyContent: 'center', flex: 1 },
    eyebrow: { color: '#93c5fd', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
    title: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
    desc: { color: '#8a9bb3', fontSize: 13, lineHeight: 20 },
    scrollContent: { padding: 16 },
    card: { backgroundColor: '#0B1221', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 16, marginBottom: 12 },
    cardTitle: { color: '#f7f9ff', fontSize: 15, fontWeight: 'bold' },
    cardCaption: { color: '#5d6f8c', fontSize: 12, marginTop: 2, marginBottom: 12 },
    channelRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12, marginBottom: 8 },
    channelRowPressed: { backgroundColor: 'rgba(255,255,255,0.08)' },
    channelIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: 'rgba(0,230,118,0.12)' },
    channelTitle: { color: '#f7f9ff', fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
    channelDesc: { color: '#8a9bb3', fontSize: 12, lineHeight: 17 },
    faqItem: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    faqQuestion: { color: '#f7f9ff', fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
    faqAnswer: { color: '#8a9bb3', fontSize: 13, lineHeight: 19 },
});
