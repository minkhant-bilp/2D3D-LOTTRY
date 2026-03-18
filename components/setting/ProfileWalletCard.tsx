import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

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

export default function ProfileActionCard() {
    const router = useRouter();

    const [copied, setCopied] = useState(false);

    const handleCopyUID = async () => {
        await Clipboard.setStringAsync("609763");

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <View style={styles.container}>

            <View style={styles.profileSection}>
                <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                    style={styles.avatar}
                />

                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName}>MIN KHANT</Text>
                    </View>

                    <Pressable style={styles.uidRow} onPress={handleCopyUID}>
                        <Text style={styles.uidText}>UID | 609763</Text>

                        {copied ? (
                            <Ionicons name="checkmark-done" size={s(14, 16, 20)} color={THEME.neonGreen} style={{ marginLeft: 6 }} />
                        ) : (
                            <Feather name="copy" size={s(12, 14, 18)} color={THEME.gold} style={{ marginLeft: 6 }} />
                        )}
                    </Pressable>

                    <Text style={styles.lastLogin}>နောက်ဆုံးဝင်ရောက်ချိန် 2026-02-24 21:37:08</Text>
                </View>
            </View>

            <View style={styles.actionCard}>

                <View style={styles.actionGrid}>
                    <Pressable
                        style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                        onPress={() => router.navigate("/wallet-profile/number-play")}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.4)' }]}>
                            <Text style={styles.iconText2D}>2D</Text>
                        </View>
                        <Text style={styles.actionText}>ချဲထိုးမည်</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                        onPress={() => router.navigate("/wallet-profile/despoit")}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 230, 118, 0.15)', borderColor: 'rgba(0, 230, 118, 0.4)' }]}>
                            <MaterialCommunityIcons name="currency-usd" size={s(24, 28, 34)} color={THEME.neonGreen} />
                        </View>
                        <Text style={styles.actionText}>ရပိုင်ခွင့်</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                        onPress={() => router.navigate("/wallet-profile/money-income")}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 165, 0, 0.15)', borderColor: 'rgba(255, 165, 0, 0.4)' }]}>
                            <MaterialCommunityIcons name="lightbulb-on-outline" size={s(24, 28, 34)} color="#FFA500" />
                        </View>
                        <Text style={styles.actionText}>အကြံပြုချက်</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                        onPress={() => router.navigate("/wallet-profile/lottery")}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(156, 39, 176, 0.15)', borderColor: 'rgba(156, 39, 176, 0.4)' }]}>
                            <Ionicons name="ticket-outline" size={s(24, 28, 34)} color="#9C27B0" />
                        </View>
                        <Text style={styles.actionText}>ထီထိုးရန်</Text>
                    </Pressable>
                </View>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    profileSection: {
        backgroundColor: THEME.profileBg,
        flexDirection: 'row',
        paddingHorizontal: s(15, 20, 30),
        paddingTop: s(15, 20, 30),
        paddingBottom: s(50, 60, 80),
        borderBottomLeftRadius: s(24, 30, 40),
        borderBottomRightRadius: s(24, 30, 40),
    },
    avatar: {
        width: s(55, 65, 80),
        height: s(55, 65, 80),
        borderRadius: s(28, 35, 40),
        borderWidth: 2,
        borderColor: THEME.gold,
    },
    userInfo: {
        marginLeft: s(10, 15, 20),
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: s(4, 6, 8),
    },
    userName: {
        color: THEME.textWhite,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold',
        marginRight: s(6, 8, 12),
    },
    uidRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: s(10, 12, 16),
        paddingVertical: s(3, 4, 6),
        borderRadius: s(12, 15, 20),
        marginBottom: s(4, 6, 8),
    },
    uidText: {
        color: THEME.gold,
        fontSize: s(10, 12, 14),
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    lastLogin: {
        color: THEME.textMuted,
        fontSize: s(9, 11, 13),
    },

    actionCard: {
        backgroundColor: THEME.cardBg,
        marginHorizontal: s(12, 16, 24),
        marginTop: s(-25, -35, -45),
        borderRadius: s(20, 24, 32),
        paddingVertical: s(18, 24, 32),
        paddingHorizontal: s(12, 16, 24),
        borderWidth: 1,
        borderColor: THEME.cardBorder,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.5,
                shadowRadius: 15,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    actionBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    actionBtnPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
    iconBox: {
        width: s(46, 56, 70),
        height: s(46, 56, 70),
        borderRadius: s(16, 20, 26),
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: s(8, 10, 14),
    },
    iconText2D: {
        color: "#3B82F6",
        fontSize: s(16, 20, 26),
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: -1,
    },
    actionText: {
        color: THEME.textWhite,
        fontSize: s(11, 13, 16),
        fontWeight: '600',
        marginLeft: s(2, 4, 6)
    }
});