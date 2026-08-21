import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { getThreeDHistoryAPI } from '../../api/main';

type ThreeDHistoryEntry = { threed: string; stock_date: string; };

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatDrawDate(value: string, t: any): string {
    if (!value) return '';
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;

    const monthIndex = parsed.getMonth();
    const monthName = MONTH_NAMES[monthIndex];
    const translatedMonth = t(`month.${monthName.toLowerCase()}`, monthName);

    return `${parsed.getDate()} ${translatedMonth} ${parsed.getFullYear()}`;
}

const RESULT_TABS = [
    { id: '2d', to: '/results/twoDresult', labelKey: 'tab_2d_label', descKey: 'tab_2d_desc', defaultLabel: '2D Results', defaultDesc: 'Two-digit draws' },
    { id: '3d', to: '/results/threeDresult', labelKey: 'tab_3d_label', descKey: 'tab_3d_desc', defaultLabel: '3D Results', defaultDesc: 'Three-digit draws' },
];

export default function ThreeDResultsScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

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

    const processedItems = items.map(item => ({
        ...item,
        formattedDate: formatDrawDate(item.stock_date, t)
    }));

    const renderItem = useCallback(({ item }: { item: ThreeDHistoryEntry & { formattedDate: string } }) => (
        <View style={styles.resultCard}>
            <Text style={styles.resultDate}>{item.formattedDate}</Text>
            <Text style={styles.resultNumber}>{item.threed}</Text>
        </View>
    ), []);

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>{t('threed_result.eyebrow', 'RESULT') as string}</Text>
                    <Text style={styles.title}>{t('threed_result.title', 'Recent History') as string}</Text>
                    <Text style={styles.desc}>{t('threed_result.desc', 'Browse recent 2D and 3D draw cards.') as string}</Text>
                </View>
            </View>

            <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                <Text style={styles.sectionTitle}>{t('threed_result.section_title', 'Recent History') as string}</Text>
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
                                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                                    {t(`threed_result.${tab.labelKey}`, tab.defaultLabel) as string}
                                </Text>
                                <Text style={styles.tabDesc}>
                                    {t(`threed_result.${tab.descKey}`, tab.defaultDesc) as string}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#51e1a5" style={{ marginTop: 60 }} />
            ) : isError ? (
                <View style={[styles.errorBox, { marginHorizontal: 20 }]}>
                    <Text style={styles.errorText}>
                        {(error as any)?.message || (t('threed_result.err_fetch', 'Unable to load 3D results.') as string)}
                    </Text>
                </View>
            ) : processedItems.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialIcons name="inbox" size={48} color="#2A3A5C" />
                    <Text style={styles.emptyTitle}>{t('threed_result.no_data', 'No data here') as string}</Text>
                    <Text style={styles.emptyDesc}>{t('threed_result.empty_desc', 'No 3D results available yet.') as string}</Text>
                </View>
            ) : (
                <View style={[styles.listContainer, { flex: 1, marginHorizontal: 20, marginBottom: Math.max(insets.bottom, 20) }]}>
                    {isStale && (
                        <View style={styles.staleWarning}>
                            <MaterialIcons name="cloud-off" size={16} color="rgba(252, 211, 77, 0.9)" />
                            <Text style={styles.staleText}>
                                {t('threed_result.stale_warning', 'Showing the last known results — the live feed is unreachable.') as string}
                            </Text>
                        </View>
                    )}

                    <FlatList
                        data={processedItems}
                        keyExtractor={(item, index) => `${item.stock_date}-${index}`}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}

                        initialNumToRender={15}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}
                    />
                </View>
            )}
            <View style={{ height: 60 }}></View>
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