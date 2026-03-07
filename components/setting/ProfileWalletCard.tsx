import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

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
                            <Ionicons name="checkmark-done" size={16} color={THEME.neonGreen} style={{ marginLeft: 6 }} />
                        ) : (
                            <Feather name="copy" size={14} color={THEME.gold} style={{ marginLeft: 6 }} />
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
                            <MaterialCommunityIcons name="currency-usd" size={28} color={THEME.neonGreen} />
                        </View>
                        <Text style={styles.actionText}>ရပိုင်ခွင့်</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                        onPress={() => router.navigate("/wallet-profile/money-income")}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 165, 0, 0.15)', borderColor: 'rgba(255, 165, 0, 0.4)' }]}>
                            <MaterialCommunityIcons name="lightbulb-on-outline" size={28} color="#FFA500" />
                        </View>
                        <Text style={styles.actionText}>အကြံပြုချက်</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                        onPress={() => router.navigate("/wallet-profile/lottery")}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(156, 39, 176, 0.15)', borderColor: 'rgba(156, 39, 176, 0.4)' }]}>
                            <Ionicons name="ticket-outline" size={28} color="#9C27B0" />
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 60,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatar: {
        width: 65,
        height: 65,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: THEME.gold,
    },
    userInfo: {
        marginLeft: 15,
        justifyContent: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    userName: {
        color: THEME.textWhite,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    vipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: THEME.gold,
    },
    vipText: {
        color: THEME.gold,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    uidRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
        marginBottom: 6,
    },
    uidText: {
        color: THEME.gold,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    lastLogin: {
        color: THEME.textMuted,
        fontSize: 11,
    },

    actionCard: {
        backgroundColor: THEME.cardBg,
        marginHorizontal: 16,
        marginTop: -35,
        borderRadius: 24,
        paddingVertical: 24,
        paddingHorizontal: 16,
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
        width: 56,
        height: 56,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    iconText2D: {
        color: "#3B82F6",
        fontSize: 20,
        fontWeight: '900',
        fontStyle: 'italic',
        letterSpacing: -1,
    },
    actionText: {
        color: THEME.textWhite,
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 4
    }
});