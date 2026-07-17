import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileWalletCard from '@/components/setting/ProfileWalletCard';
import MenuSettingsCard from '@/components/setting/MenuSettingsCard';
import ServiceCenterCard from '@/components/setting/ServiceCenterCard';

export default function SettingTabPage() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
                <Text style={styles.eyebrow}>နှစ်သက်မှုများ</Text>
                <Text style={styles.title}>ဆက်တင်</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ProfileWalletCard />
                <MenuSettingsCard />
                <ServiceCenterCard />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#050A1F',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: '#0c1324',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        ...Platform.select({
            ios: {
                shadowColor: '#070d1f',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
            },
            android: {
                elevation: 6,
            }
        }),
        zIndex: 10,
    },
    eyebrow: {
        color: '#8a9bb3',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
        gap: 20,
    },
});