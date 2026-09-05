import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { getMe } from '../../api/main';
import { useAppStore } from '../../store/useAppStore';

export default function ProfileWalletCard() {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    const walletBalance = useAppStore((state: any) => state.wallet?.balance);
    const walletCurrency = useAppStore((state: any) => state.wallet?.currency);

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await getMe();
            const responseData = res as any;
            return responseData?.data?.user || responseData?.user || null;
        },
    });

    let displayName = t('profile.unknown_user') as string;
    if (isUserLoading) {
        displayName = t('profile.loading') as string;
    } else if (user?.name?.trim()) {
        displayName = user.name.trim();
    } else if (user?.email?.trim()) {
        displayName = user.email.trim();
    }

    const avatarText = isUserLoading ? '..' : displayName.slice(0, 2).toUpperCase();

    const fullUid = user ? (user.uuid ?? String(user.id)) : null;
    const trimmedUid = fullUid
        ? (fullUid.includes('-') ? fullUid.split('-')[0] + '...' : fullUid)
        : '-';

    const copyUid = async () => {
        if (!fullUid) return;
        try {
            await Clipboard.setStringAsync(fullUid);
            setCopied(true);

            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
            copyTimeoutRef.current = setTimeout(() => setCopied(false), 1200);
        } catch (error) {
            console.log("Copy Error: ", error);
        }
    };

    return (
        <LinearGradient
            colors={['rgba(11, 19, 43, 0.94)', 'rgba(7, 15, 35, 0.88)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.card}
        >
            <View style={styles.blurCircle} />

            <View style={styles.content}>
                <LinearGradient
                    colors={['#00e676', '#00c896']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatar}
                >
                    {isUserLoading ? (
                        <ActivityIndicator color="#003824" />
                    ) : (
                        <Text style={styles.avatarText}>{avatarText}</Text>
                    )}
                </LinearGradient>

                <View style={styles.infoContainer}>
                    <Text style={styles.nameText} numberOfLines={1}>
                        {displayName}
                    </Text>

                    <View style={styles.idRow}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.idBadge,
                                pressed && styles.idBadgePressed
                            ]}
                            onPress={copyUid}
                            disabled={!user}
                        >
                            <Text style={styles.idText}>ID: {trimmedUid}</Text>
                            <MaterialIcons
                                name={copied ? "check" : "content-copy"}
                                size={14}
                                color="#00e676"
                            />
                        </Pressable>

                        {user?.role && (
                            <View style={styles.userBadge}>
                                <Text style={styles.userText}>
                                    {String(user.role).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>

                    {isUserLoading ? (
                        <View style={styles.balanceBadge}>
                            <Text style={[styles.balanceText, { color: 'rgba(255,255,255,0.3)' }]}>---</Text>
                        </View>
                    ) : walletBalance != null ? (
                        <View style={styles.balanceBadge}>
                            <Text style={styles.balanceText}>
                                {Number(walletBalance).toLocaleString()} {walletCurrency ?? 'MMK'}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    card: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', padding: 24, overflow: 'hidden' },
    blurCircle: { position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0, 230, 118, 0.05)', transform: [{ scale: 1.5 }] },
    content: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', shadowColor: '#00e676', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 },
    avatarText: { fontSize: 26, fontWeight: '900', color: '#003824' },
    infoContainer: { flex: 1, alignItems: 'flex-start', gap: 8 },
    nameText: { fontSize: 18, fontWeight: 'bold', color: '#f7f9ff' },
    idRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    idBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24 },
    idBadgePressed: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
    idText: { fontSize: 12, fontWeight: 'bold', color: '#00e676', letterSpacing: 0.5 },
    userBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(147, 197, 253, 0.25)', backgroundColor: 'rgba(147, 197, 253, 0.1)' },
    userText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, color: '#93c5fd' },
    balanceBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)', backgroundColor: 'transparent', marginTop: 2 },
    balanceText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5, color: '#00e676' },
});