import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserProfilePage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [user] = useState({
        username: 'TesterKhant',
        email: 'testerkhant@gmail.com',
        role: 'USER'
    });

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>အကောင့်</Text>
                    <Text style={styles.title}>ပရိုဖိုင်</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.card}>
                    <View style={styles.heroTop}>
                        <View style={styles.heroLeft}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user.username.slice(0, 2).toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.heroInfo}>
                                <Text style={styles.heroName}>{user.username}</Text>
                                <Text style={styles.heroEmail}>{user.email}</Text>
                            </View>
                        </View>

                        <View style={styles.roleChip}>
                            <MaterialIcons name="person" size={12} color="#D6B560" style={{ marginTop: 2 }} />
                            <View style={styles.roleChipTextContainer}>
                                <Text style={styles.roleChipText}>ROLE ·</Text>
                                <Text style={styles.roleChipText}>{user.role}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoLabel}>
                            <MaterialIcons name="person" size={16} color="#9CA3AF" />
                            <Text style={styles.labelText}>ပြသမည့်နာမည်</Text>
                        </View>
                        <Text style={styles.valueText}>{user.username}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLabel}>
                            <MaterialIcons name="mail" size={16} color="#9CA3AF" />
                            <Text style={styles.labelText}>အီးမေးလ်</Text>
                        </View>
                        <Text style={styles.valueText}>{user.email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoLabel}>
                            <View style={{ width: 16 }} />
                            <Text style={styles.labelText}>အဆင့်</Text>
                        </View>
                        <Text style={styles.valueText}>{user.role}</Text>
                    </View>
                </View>

                <View style={[styles.card, { marginTop: 20 }]}>
                    <Text style={styles.opsTitle}>လုပ်ဆောင်ချက်များ:</Text>

                    <Pressable onPress={() => router.push('/user/bankinfo')} style={{ marginBottom: 12 }}>
                        {({ pressed }) => (
                            <View style={[styles.opsOuterBorder, pressed && styles.opsOuterBorderPressed]}>
                                <View style={[styles.opsInnerCard, pressed && styles.opsInnerCardPressed]}>
                                    <MaterialIcons name="account-balance" size={18} color="#F3F4F6" />
                                    <Text style={styles.opsBtnText}>ဘဏ်အချက်အလက် စီမံမည်</Text>
                                </View>
                            </View>
                        )}
                    </Pressable>

                    <Pressable onPress={() => router.push('/')}>
                        {({ pressed }) => (
                            <View style={[styles.opsOuterBorder, pressed && styles.opsOuterBorderPressed]}>
                                <View style={[styles.opsInnerCard, pressed && styles.opsInnerCardPressed]}>
                                    <MaterialIcons name="receipt-long" size={18} color="#F3F4F6" />
                                    <Text style={styles.opsBtnText}>လောင်းကြေးစာရင်း ကြည့်မည်</Text>
                                </View>
                            </View>
                        )}
                    </Pressable>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#060B19'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: {
        marginRight: 16,
        padding: 4,
    },
    headerTextContainer: {
        justifyContent: 'center',
    },
    eyebrow: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 2
    },
    title: {
        color: '#ffffff',
        fontSize: 26,
        fontWeight: 'bold'
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 60
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1F2937',
        backgroundColor: '#0B1221',
        padding: 16
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    heroLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(214, 181, 96, 0.1)',
        borderWidth: 1,
        borderColor: '#D6B560',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14
    },
    avatarText: {
        color: '#D6B560',
        fontSize: 18,
        fontWeight: 'bold'
    },
    heroInfo: {
        justifyContent: 'center',
        flex: 1
    },
    heroName: {
        color: '#F3F4F6',
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 4
    },
    heroEmail: {
        color: '#9CA3AF',
        fontSize: 13
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(214, 181, 96, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D6B560'
    },
    roleChipTextContainer: {
        marginLeft: 6,
        justifyContent: 'center',
    },
    roleChipText: {
        color: '#D6B560',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 0.5
    },
    divider: {
        height: 1,
        backgroundColor: '#1F2937',
        marginVertical: 20
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#121B2E',
        borderWidth: 1,
        borderColor: '#1E293B',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 10
    },
    infoLabel: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    labelText: {
        color: '#9CA3AF',
        fontSize: 14,
        marginLeft: 10,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    valueText: {
        color: '#F3F4F6',
        fontSize: 14,
        fontWeight: 'bold',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    opsTitle: {
        color: '#F3F4F6',
        fontSize: 18,
        marginBottom: 16
    },

    opsOuterBorder: {
        width: '100%',
        backgroundColor: '#1E3A8A',
        borderRadius: 12,
        padding: 1,
    },
    opsOuterBorderPressed: {
        backgroundColor: '#2563EB',
        transform: [{ scale: 0.98 }],
    },
    opsInnerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0B152C',
        padding: 16,
        borderRadius: 11,
    },
    opsInnerCardPressed: {
        backgroundColor: '#12234A',
    },
    opsBtnText: {
        color: '#F3F4F6',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 12,
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
});