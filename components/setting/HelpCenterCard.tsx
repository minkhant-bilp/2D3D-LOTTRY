import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SUPPORT_CHANNELS, type SupportChannelId } from '@/constants/support';

// MaterialIcons carries no Telegram/Viber brand glyph, so these are the closest
// generic stand-ins — the same ones the Help Center screen already uses.
const CHANNEL_ICON: Record<SupportChannelId, keyof typeof MaterialIcons.glyphMap> = {
    facebook: 'facebook',
    telegram: 'send',
    viber: 'phone-in-talk',
};

const CHANNEL_LABEL: Record<SupportChannelId, { key: string; fallback: string }> = {
    facebook: { key: 'help_center.fb_support', fallback: 'Facebook Support' },
    telegram: { key: 'help_center.telegram', fallback: 'Telegram Line' },
    viber: { key: 'help_center.viber', fallback: 'Viber Contact' },
};

export default function HelpCenterCard() {
    const { t } = useTranslation();
    const [copiedId, setCopiedId] = useState<SupportChannelId | null>(null);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    const openChannel = async (href: string) => {
        try {
            await Linking.openURL(href);
        } catch (error) {
            // Viber deep links fail when the app isn't installed — not worth an alert.
            console.warn('[support] could not open channel', href, error);
        }
    };

    const copyValue = async (channelId: SupportChannelId, value: string) => {
        try {
            await Clipboard.setStringAsync(value);
            setCopiedId(channelId);

            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
            copyTimeoutRef.current = setTimeout(() => setCopiedId(null), 1200);
        } catch (error) {
            console.log('Copy Error: ', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>
                {t('help_center.section_title', 'Help Center') as string}
            </Text>

            <View style={styles.cardWrapper}>
                <LinearGradient
                    colors={['rgba(11, 19, 43, 0.94)', 'rgba(7, 15, 35, 0.88)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={styles.cardGradient}
                >
                    {SUPPORT_CHANNELS.map((channel, index) => {
                        const isCopied = copiedId === channel.id;
                        const label = CHANNEL_LABEL[channel.id];

                        return (
                            <View
                                key={channel.id}
                                style={[styles.row, index !== SUPPORT_CHANNELS.length - 1 && styles.rowBorder]}
                            >
                                <Pressable
                                    style={({ pressed }) => [styles.leftContent, pressed && styles.pressed]}
                                    onPress={() => openChannel(channel.href)}
                                >
                                    <MaterialIcons
                                        name={CHANNEL_ICON[channel.id]}
                                        size={24}
                                        color="#8a9bb3"
                                        style={styles.iconStyle}
                                    />
                                    <View style={styles.labelGroup}>
                                        <Text style={styles.rowText}>{t(label.key, label.fallback) as string}</Text>
                                        <Text style={styles.rowValue} numberOfLines={1}>
                                            {channel.value}
                                        </Text>
                                    </View>
                                </Pressable>

                                <Pressable
                                    hitSlop={10}
                                    style={({ pressed }) => [styles.copyButton, pressed && styles.pressed]}
                                    onPress={() => copyValue(channel.id, channel.value)}
                                >
                                    <MaterialIcons
                                        name={isCopied ? 'check' : 'content-copy'}
                                        size={20}
                                        color={isCopied ? '#00e676' : '#8a9bb3'}
                                    />
                                </Pressable>
                            </View>
                        );
                    })}
                </LinearGradient>
            </View>

            {copiedId !== null && (
                <Text style={styles.copiedHint}>{t('help_center.copied', 'Copied to clipboard') as string}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20, gap: 14 },
    sectionTitle: { color: '#f7f9ff', fontSize: 14, fontWeight: 'bold', paddingLeft: 4, marginBottom: 14 },
    cardWrapper: { borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' },
    cardGradient: { width: '100%' },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 22,
        width: '100%',
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.08)' },
    pressed: { opacity: 0.6 },
    leftContent: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
    iconStyle: { marginRight: 16 },
    labelGroup: { flex: 1, minWidth: 0 },
    rowText: { fontSize: 15, fontWeight: 'bold', color: '#f7f9ff', includeFontPadding: false },
    rowValue: { fontSize: 13, color: '#8a9bb3', marginTop: 2, includeFontPadding: false },
    copyButton: { paddingLeft: 12 },
    copiedHint: { color: '#00e676', fontSize: 12, paddingLeft: 4 },
});
