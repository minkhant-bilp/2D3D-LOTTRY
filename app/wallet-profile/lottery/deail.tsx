import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME = {
    bg: '#050A1F',
    cardBg: '#0B132B',
    inputBg: '#152243',
    borderNormal: 'rgba(255, 255, 255, 0.08)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    danger: '#FF3B30',
};

const PLAY_OPTIONS = {
    '3D': [
        { id: 'top3', label: 'အပေါ် ၃ လုံး' },
        { id: 'tod3', label: 'တွတ် ၃ လုံး' },
        { id: 'rev3', label: 'အပြန်' },
    ],
    '2D': [
        { id: 'top2', label: 'အပေါ် ၂ လုံး' },
        { id: 'bot2', label: 'အောက် ၂ လုံး' },
        { id: 'rev2', label: 'အပြန် ၂ လုံး' },
        { id: '19num', label: '၁၉ လုံး (ပတ်)' },
        { id: 'double', label: 'အပူး' },
    ],
    '1D': [
        { id: 'run_top', label: 'အပေါ်ပြေး' },
        { id: 'run_bot', label: 'အောက်ပြေး' },
    ]
};

type TabType = '3D' | '2D' | '1D';

export default function NumberPlayScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const { title = 'ထီထိုးမည်', country = 'MM' } = useLocalSearchParams<{ title: string, country: string }>();

    const [activeTab, setActiveTab] = useState<TabType>('3D');
    const [inputNumber, setInputNumber] = useState('');
    const [selectedModes, setSelectedModes] = useState<string[]>([]);

    const toggleMode = (modeId: string) => {
        setSelectedModes(prev =>
            prev.includes(modeId) ? prev.filter(id => id !== modeId) : [...prev, modeId]
        );
    };
    const renderPreview = () => {
        if (inputNumber.length === 0 || selectedModes.length === 0) return null;

        const previewItems = selectedModes.map(modeId => {
            const option = PLAY_OPTIONS[activeTab].find(opt => opt.id === modeId);
            return option ? `${inputNumber} (${option.label})` : '';
        });

        return (
            <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>ရွေးချယ်ထားသော စာရင်း</Text>
                <View style={styles.previewListWrapper}>
                    {previewItems.map((itemText, index) => (
                        <View key={index.toString()} style={styles.previewBadge}>
                            <Text style={styles.previewText}>{itemText}</Text>
                            <Ionicons name="checkmark-circle" size={14} color={THEME.neonGreen} style={{ marginLeft: 4 }} />
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>

            <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={26} color={THEME.textWhite} />
                </Pressable>
                <View>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <View style={styles.countryBadge}>
                        <Text style={styles.countryBadgeText}>{country === 'MM' ? '🇲🇲 မြန်မာ' : '🇹🇭 ထိုင်း'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.tabContainer}>
                {(['3D', '2D', '1D'] as TabType[]).map((tab) => (
                    <Pressable
                        key={tab}
                        style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                        onPress={() => { setActiveTab(tab); setSelectedModes([]); setInputNumber(''); Keyboard.dismiss(); }}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab === '3D' ? 'သုံးလုံး' : tab === '2D' ? 'နှစ်လုံး' : 'တစ်လုံး'}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.inputSection}>
                <Text style={styles.sectionLabel}>ဂဏန်းရိုက်ထည့်ပါ</Text>
                <TextInput
                    style={styles.bigInput}
                    placeholder={activeTab === '3D' ? '000' : activeTab === '2D' ? '00' : '0'}
                    placeholderTextColor={THEME.textMuted}
                    keyboardType="number-pad"
                    maxLength={activeTab === '3D' ? 3 : activeTab === '2D' ? 2 : 1}
                    value={inputNumber}
                    onChangeText={(t) => setInputNumber(t.replace(/[^0-9]/g, ''))}
                />
            </View>

            <Text style={[styles.sectionLabel, { paddingHorizontal: 16, marginTop: 25, marginBottom: 10 }]}>
                ထိုးနည်း (ရွေးချယ်ထားသောနည်းများ - {selectedModes.length})
            </Text>

            <FlatList
                data={PLAY_OPTIONS[activeTab]}
                keyExtractor={(item) => item.id}
                numColumns={3}
                columnWrapperStyle={{ gap: 10 }}
                contentContainerStyle={styles.gridContent}

                ListFooterComponent={renderPreview}

                renderItem={({ item }) => {
                    const isSelected = selectedModes.includes(item.id);
                    return (
                        <Pressable
                            style={[styles.modeChip, isSelected && styles.modeChipActive]}
                            onPress={() => toggleMode(item.id)}
                        >
                            <Text style={[styles.modeText, isSelected && styles.modeTextActive]}>
                                {item.label}
                            </Text>
                        </Pressable>
                    );
                }}
            />

            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 15, 40) }]}>
                <Pressable
                    style={[styles.addBtn, (inputNumber.length === 0 || selectedModes.length === 0) && { opacity: 0.5 }]}
                    disabled={inputNumber.length === 0 || selectedModes.length === 0}
                    onPress={() => console.log('Added to cart')}
                >
                    <Ionicons name="add-circle" size={24} color="#000" />
                    <Text style={styles.addBtnText}>စာရင်းထဲ ထည့်မည်</Text>
                </Pressable>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: THEME.borderNormal,
        marginTop: 15
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: THEME.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    headerTitle: {
        color: THEME.textWhite,
        fontSize: 18,
        fontWeight: 'bold'
    },
    countryBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginTop: 4
    },
    countryBadgeText: {
        color: THEME.gold,
        fontSize: 10,
        fontWeight: 'bold'
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 15,
        marginBottom: 20
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: THEME.borderNormal
    },
    tabBtnActive: {
        borderBottomColor: THEME.neonGreen
    },
    tabText: {
        color: THEME.textMuted,
        fontSize: 15,
        fontWeight: 'bold'
    },
    tabTextActive: {
        color: THEME.neonGreen,
        fontWeight: '900'
    },
    inputSection: {
        paddingHorizontal: 16
    },
    sectionLabel: {
        color: THEME.textMuted,
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8
    },
    bigInput: {
        backgroundColor: THEME.inputBg,
        color: THEME.textWhite,
        fontSize: 40,
        fontWeight: '900',
        textAlign: 'center',
        borderRadius: 16,
        height: 80,
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        letterSpacing: 10
    },
    gridContent: {
        paddingHorizontal: 16,
        paddingBottom: 130
    },
    modeChip: {
        flex: 1,
        backgroundColor: THEME.cardBg,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: THEME.borderNormal,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modeChipActive: {
        backgroundColor: THEME.neonGreen,
        borderColor: THEME.neonGreen
    },
    modeText: {
        color: THEME.textWhite,
        fontSize: 12,
        fontWeight: '600'
    },
    modeTextActive: {
        color: '#000',
        fontWeight: 'bold'
    },


    previewContainer: {
        marginTop: 30,
        backgroundColor: 'rgba(255, 215, 0, 0.05)',

        padding: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
    },
    previewTitle: {
        color: THEME.gold,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    previewListWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    previewBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.cardBg,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: THEME.borderNormal,
    },
    previewText: {
        color: THEME.textWhite,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },

    bottomBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: THEME.cardBg,
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: THEME.borderNormal
    },
    addBtn: {
        flexDirection: 'row',
        backgroundColor: THEME.neonGreen,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: THEME.neonGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    addBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    }
});