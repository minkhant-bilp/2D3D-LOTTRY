import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getThreeDHistoryAPI } from '../../api/main';

type ThreeDHistoryEntry = { threed: string; stock_date: string; };

function formatDrawDate(value: string): string {
    if (!value) return '';
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const RESULT_TABS = [
    { id: '2d', to: '/results/twoDresult', label: '2D Results', description: 'Two-digit draws' },
    { id: '3d', to: '/results/threeDresult', label: '3D Results', description: 'Three-digit draws' },
];

export default function ThreeDResultsScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['threeDHistory'],
        queryFn: async () => {
            const res = await getThreeDHistoryAPI();
            return {
                items: res?.data?.three_d_history || res?.three_d_history || [],
                stale: res?.data?.stale || res?.stale || false
            };
        },
    });

    const items: ThreeDHistoryEntry[] = data?.items || [];
    const isStale = data?.stale || false;

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>RESULT</Text>
                    <Text style={styles.title}>Recent History</Text>
                    <Text style={styles.desc}>Browse recent 2D and 3D draw cards.</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionTitle}>Recent History</Text>

                <View style={styles.tabsContainer}>
                    {RESULT_TABS.map((tab) => {
                        const isActive = pathname.includes('threeDresult') && tab.id === '3d';
                        return (
                            <Pressable
                                key={tab.id}
                                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                                onPress={() => {
                                    if (!isActive) router.replace(tab.to as any);
                                }}
                            >
                                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
                                <Text style={styles.tabDesc}>{tab.description}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#51e1a5" style={{ marginTop: 60 }} />
                ) : isError ? (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>
                            {(error as any)?.message || 'Unable to load 3D results.'}
                        </Text>
                    </View>
                ) : items.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="inbox" size={48} color="#2A3A5C" />
                        <Text style={styles.emptyTitle}>No data here</Text>
                        <Text style={styles.emptyDesc}>No 3D results available yet.</Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        {isStale && (
                            <View style={styles.staleWarning}>
                                <MaterialIcons name="cloud-off" size={16} color="rgba(252, 211, 77, 0.9)" />
                                <Text style={styles.staleText}>Showing the last known results — the live feed is unreachable.</Text>
                            </View>
                        )}

                        {items.map((item) => (
                            <View key={item.stock_date} style={styles.resultCard}>
                                <Text style={styles.resultDate}>{formatDrawDate(item.stock_date)}</Text>
                                <Text style={styles.resultNumber}>{item.threed}</Text>
                            </View>
                        ))}
                    </View>
                )}
                <View style={{ height: 60 }}></View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },
    header: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    backBtn: { marginRight: 16, paddingTop: 6 },
    headerTextContainer: { flex: 1 },
    eyebrow: { color: '#93C5FD', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
    title: { color: '#F7F9FF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    desc: { color: '#8A9BB3', fontSize: 13, lineHeight: 20 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    sectionTitle: { color: '#F7F9FF', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },

    tabsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    tabBtn: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'flex-start',
    },
    tabBtnActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.45)',
    },
    tabLabel: { color: '#C9D4E8', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
    tabLabelActive: { color: '#10B981' },
    tabDesc: { color: '#8A9BB3', fontSize: 11 },

    listContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 16,
    },

    staleWarning: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    staleText: { color: 'rgba(252, 211, 77, 0.9)', fontSize: 12, flex: 1 },

    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    resultDate: { color: '#8A9BB3', fontSize: 13 },
    resultNumber: { color: '#51e1a5', fontSize: 18, fontWeight: 'bold', letterSpacing: 4 },

    errorBox: { backgroundColor: 'rgba(255, 77, 77, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 77, 77, 0.4)', borderRadius: 12, padding: 12 },
    errorText: { color: '#ff9b93', fontSize: 13 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyTitle: { color: '#4a5d7a', fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
    emptyDesc: { color: '#3a4d66', fontSize: 13 },
});