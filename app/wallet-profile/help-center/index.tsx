import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router'; // 🔥 Added for back navigation
import React from 'react';
import { Dimensions, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
                        <Ionicons name="chevron-back" size={s(20, 24, 30)} color={THEME.text} />
                    </Pressable>

                    <View style={styles.logo}>
                        <Ionicons name="help-circle-outline" size={s(22, 26, 34)} color={THEME.neon} />
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
                            <Ionicons name={item.icon} size={s(20, 22, 28)} color={item.iconColor} />
                        </View>

                        <View style={styles.textBox}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSub}>{item.subtitle}</Text>
                        </View>

                        <Ionicons name="chevron-forward" size={s(18, 20, 26)} color={THEME.muted} />
                    </Pressable>
                ))}

                <Text style={styles.footer}>We usually reply within a short time.</Text>
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
        paddingBottom: s(20, 24, 32),
        marginTop: s(20, 25, 35)
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: s(8, 10, 14)
    },
    backBtn: {
        width: s(38, 44, 54),
        height: s(38, 44, 54),
        borderRadius: s(12, 14, 18),
        backgroundColor: THEME.card,
        borderWidth: 1,
        borderColor: THEME.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderBtn: {
        width: s(38, 44, 54),
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

    titleSection: {
        alignItems: 'center',
        marginBottom: s(15, 20, 30)
    },
    title: {
        color: THEME.text,
        fontSize: s(24, 28, 36),
        fontWeight: '900'
    },
    subtitle: {
        color: THEME.muted,
        fontSize: s(11, 13, 16),
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: s(10, 12, 16),
    },
    iconBox: {
        width: s(38, 44, 54),
        height: s(38, 44, 54),
        borderRadius: s(12, 14, 18),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textBox: {
        flex: 1
    },
    cardTitle: {
        color: THEME.text,
        fontSize: s(13, 15, 18),
        fontWeight: '900'
    },
    cardSub: {
        color: THEME.muted,
        fontSize: s(10, 12, 14),
        marginTop: s(2, 3, 5)
    },

    footer: {
        color: THEME.muted,
        textAlign: 'center',
        marginTop: s(4, 6, 10),
        fontSize: s(10, 12, 14)
    },
});