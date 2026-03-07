import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router'; // 🔥 Added for back navigation
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const THEME = {
    bg: '#050A1F',
    card: '#0B132B',
    border: 'rgba(255,255,255,0.08)',
    text: '#FFFFFF',
    muted: '#8A9BB3',
    neon: '#00E676',
};

function openLink(url: string) {
    Linking.openURL(url).catch(() => console.log('Cannot open:', url));
}

type ContactItem = {
    title: string;
    subtitle: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
    url: string;
};

export default function HelpCenter() {
    const router = useRouter();

    const contacts: ContactItem[] = [
        {
            title: 'Facebook',
            subtitle: 'Chat with our support team',
            icon: 'logo-facebook',
            iconColor: '#1877F2',
            url: 'https://www.facebook.com/yourpage',
        },
        {
            title: 'Messenger',
            subtitle: 'Send us a message',
            icon: 'chatbubble-ellipses-outline',
            iconColor: THEME.neon,
            url: 'https://m.me/yourpage',
        },
        {
            title: 'Telegram',
            subtitle: 'Fast replies on Telegram',
            icon: 'paper-plane-outline',
            iconColor: '#2AABEE',
            url: 'https://t.me/yourusername',
        },
        {
            title: 'Viber',
            subtitle: 'Contact us on Viber',
            icon: 'call-outline',
            iconColor: '#7360F2',
            url: 'viber://chat?number=%2B959000000000',
        },
    ];

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.headerRow}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={THEME.text} />
                    </Pressable>

                    <View style={styles.logo}>
                        <Ionicons name="help-circle-outline" size={26} color={THEME.neon} />
                    </View>

                    <View style={styles.placeholderBtn} />
                </View>

                <View style={styles.titleSection}>
                    <Text style={styles.title}>Help Center</Text>
                    <Text style={styles.subtitle}>
                        Need help? Contact us on your favorite platform.
                    </Text>
                </View>

                {contacts.map((item) => (
                    <Pressable key={item.title} style={styles.card} onPress={() => openLink(item.url)}>
                        <View style={[styles.iconBox, { backgroundColor: `${item.iconColor}22` }]}>
                            <Ionicons name={item.icon} size={22} color={item.iconColor} />
                        </View>

                        <View style={styles.textBox}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSub}>{item.subtitle}</Text>
                        </View>

                        <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
                    </Pressable>
                ))}

                <Text style={styles.footer}>We usually reply within a short time.</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: THEME.bg },
    content: { padding: 16, paddingBottom: 24, marginTop: 25 },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderBtn: {
        width: 44,
    },

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

    titleSection: {
        alignItems: 'center',
        marginBottom: 20
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textBox: { flex: 1 },
    cardTitle: { color: THEME.text, fontSize: 15, fontWeight: '900' },
    cardSub: { color: THEME.muted, fontSize: 12, marginTop: 3 },

    footer: { color: THEME.muted, textAlign: 'center', marginTop: 6, fontSize: 12 },
});