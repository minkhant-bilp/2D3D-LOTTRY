import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
    screenBg: '#050A1F',
    profileBg: '#152243',
    cardBg: '#0B132B',
    cardBorder: 'rgba(0, 230, 118, 0.3)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    redAlert: '#FF3B30',
    divider: 'rgba(255, 255, 255, 0.08)',
};

const AVATAR_URL = { uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' };

const UIDRow = ({ label }: { label: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyUID = async () => {
        await Clipboard.setStringAsync("609763");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Pressable style={styles.uidRow} onPress={handleCopyUID}>
            <Text style={styles.uidText}>{label} 609763</Text>
            {copied ? (
                <Ionicons name="checkmark-done" size={Number(s(14, 16, 20))} color={THEME.neonGreen} style={styles.iconMargin} />
            ) : (
                <Feather name="copy" size={Number(s(12, 14, 18))} color={THEME.gold} style={styles.iconMargin} />
            )}
        </Pressable>
    );
};

interface ActionBtnProps {
    onPress: () => void;
    iconNode: React.ReactNode;
    boxStyle: any;
    label: string;
}

const ActionButton = ({ onPress, iconNode, boxStyle, label }: ActionBtnProps) => {
    return (
        <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={onPress}
        >
            <View style={[styles.iconBox, boxStyle]}>
                {iconNode}
            </View>
            <Text style={styles.actionText} numberOfLines={2} adjustsFontSizeToFit>{label}</Text>
        </Pressable>
    );
};

export default function ProfileActionCard() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <View style={styles.container}>

            <View style={styles.profileSection}>
                <Image source={AVATAR_URL} style={styles.avatar} />

                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName}>MIN KHANT</Text>
                    </View>

                    <UIDRow label={t.uid || "UID |"} />

                    <Text style={styles.lastLogin}>{t.lastLogin || "နောက်ဆုံးဝင်ရောက်ချိန်"} 2026-02-24 21:37:08</Text>
                </View>
            </View>

            <View style={styles.actionCard}>
                <View style={styles.actionGrid}>

                    <ActionButton
                        onPress={() => router.navigate("/wallet-profile/number-play")}
                        boxStyle={styles.iconBox2D}
                        iconNode={<Text style={styles.iconText2D}>2D</Text>}
                        label={t.play2D || "ချဲထိုးမည်"}
                    />

                    <ActionButton
                        onPress={() => router.navigate("/wallet-profile/despoit")}
                        boxStyle={styles.iconBoxDeposit}
                        iconNode={<MaterialCommunityIcons name="currency-usd" size={Number(s(30, 34, 40))} color={THEME.neonGreen} />}
                        label={t.entitlement || "ရပိုင်ခွင့်"}
                    />

                    <ActionButton
                        onPress={() => router.navigate("/wallet-profile/lottery")}
                        boxStyle={styles.iconBoxBank}
                        iconNode={<FontAwesome name="bank" size={Number(s(24, 28, 34))} color="#9C27B0" style={styles.bankIconAdjust} />}
                        label={t.bankAccount || "ဘဏ်အကောင့်"}
                    />

                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%' },
    profileSection: {
        backgroundColor: THEME.profileBg,
        flexDirection: 'row',
        paddingHorizontal: Number(s(15, 20, 30)),
        paddingTop: Number(s(15, 20, 30)),
        paddingBottom: Number(s(50, 60, 80)),
        borderBottomLeftRadius: Number(s(24, 30, 40)),
        borderBottomRightRadius: Number(s(24, 30, 40)),
    },
    avatar: {
        width: Number(s(55, 65, 80)),
        height: Number(s(55, 65, 80)),
        borderRadius: Number(s(28, 35, 40)),
        borderWidth: 2,
        borderColor: THEME.gold,
    },
    userInfo: {
        marginLeft: Number(s(10, 15, 20)),
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Number(s(4, 6, 8)),
    },
    userName: {
        color: THEME.textWhite,
        fontSize: Number(s(16, 18, 24)),
        fontWeight: 'bold',
        marginRight: Number(s(6, 8, 12)),
    },
    uidRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: Number(s(10, 12, 16)),
        paddingVertical: Number(s(3, 4, 6)),
        borderRadius: Number(s(12, 15, 20)),
        marginBottom: Number(s(4, 6, 8)),
    },
    uidText: {
        color: THEME.gold,
        fontSize: Number(s(10, 12, 14)),
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    lastLogin: {
        color: THEME.textMuted,
        fontSize: Number(s(9, 11, 13)),
    },

    actionCard: {
        backgroundColor: THEME.cardBg,
        marginHorizontal: Number(s(12, 16, 24)),
        marginTop: Number(s(-30, -40, -50)),
        borderRadius: Number(s(20, 24, 32)),
        paddingVertical: Number(s(22, 26, 32)),
        paddingHorizontal: Number(s(12, 16, 20)),
        borderWidth: 1,
        borderColor: THEME.cardBorder,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15 },
            android: { elevation: 10 },
        }),
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
    },
    actionBtn: {
        width: '33.33%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 4,
    },
    actionBtnPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
    iconBox: {
        width: Number(s(58, 66, 78)),
        height: Number(s(58, 66, 78)),
        borderRadius: Number(s(18, 20, 26)),
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Number(s(10, 12, 14)),
    },

    iconMargin: { marginLeft: 6 },
    bankIconAdjust: { marginLeft: 0 },

    iconBox2D: { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.4)' },
    iconBoxDeposit: { backgroundColor: 'rgba(0, 230, 118, 0.15)', borderColor: 'rgba(0, 230, 118, 0.4)' },
    iconBoxSuggestion: { backgroundColor: 'rgba(255, 165, 0, 0.15)', borderColor: 'rgba(255, 165, 0, 0.4)' },
    iconBoxBank: { backgroundColor: 'rgba(156, 39, 176, 0.15)', borderColor: 'rgba(156, 39, 176, 0.4)' },

    iconText2D: {
        color: "#3B82F6",
        fontSize: Number(s(22, 26, 30)),
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: 1,
        includeFontPadding: false,
        paddingRight: 2,
    },
    actionText: {
        width: '100%',
        color: THEME.textWhite,
        fontSize: Number(s(12, 13, 15)),
        fontWeight: '600',
        textAlign: 'center',
    }
});