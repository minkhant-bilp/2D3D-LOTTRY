import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBankStore } from '@/store/useBankStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

const THEME = {
    bg: '#050A1F', cardBg: '#0B132B', inputBg: '#152243', borderNormal: 'rgba(255, 255, 255, 0.08)',
    textWhite: '#FFFFFF', textMuted: '#8A9BB3', neonGreen: '#00E676', danger: '#FF3B30', gold: '#FFD700',
};

type CountryTab = 'MM' | 'TH';

interface Bank { id: string; name: string; type: string; color: string; icon: any; }

const BANKS: Record<CountryTab, Bank[]> = {
    MM: [
        { id: 'm1', name: 'KBZ Pay', type: 'Mobile Wallet', color: '#1B5497', icon: 'wallet' },
        { id: 'm2', name: 'Wave Pay', type: 'Mobile Wallet', color: '#FFD100', icon: 'cellphone-wireless' },
        { id: 'm3', name: 'AYA Pay', type: 'Mobile Wallet', color: '#CF152D', icon: 'wallet-outline' },
        { id: 'm4', name: 'CB Pay', type: 'Mobile Wallet', color: '#00539F', icon: 'cellphone-nfc' },
        { id: 'm5', name: 'KBZ Bank', type: 'Bank Account', color: '#1B5497', icon: 'bank' },
        { id: 'm6', name: 'AYA Bank', type: 'Bank Account', color: '#CF152D', icon: 'bank' },
        { id: 'm7', name: 'CB Bank', type: 'Bank Account', color: '#00539F', icon: 'bank' },
        { id: 'm8', name: 'Yoma Bank', type: 'Bank Account', color: '#F47920', icon: 'bank' },
        { id: 'm9', name: 'K Pay', type: 'Mobile Wallet', color: '#1B5497', icon: 'cellphone' },
    ],
    TH: [
        { id: 't1', name: 'KBank (Kasikorn)', type: 'Bank Account', color: '#138F2D', icon: 'bank' },
        { id: 't2', name: 'SCB', type: 'Bank Account', color: '#4E2A81', icon: 'bank' },
        { id: 't3', name: 'Bangkok Bank', type: 'Bank Account', color: '#1E4598', icon: 'bank' },
        { id: 't4', name: 'Krungthai Bank', type: 'Bank Account', color: '#1BA4E4', icon: 'bank' },
        { id: 't5', name: 'PromptPay', type: 'Mobile Wallet', color: '#ED1C24', icon: 'qrcode-scan' },
    ]
};

export default function BankBindingScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const boundBank = useBankStore((state) => state.boundBank);

    const [activeTab, setActiveTab] = useState<CountryTab>('MM');
    const [searchQuery, setSearchQuery] = useState('');

    const handleBindBank = (bank: Bank) => {
        router.push({
            pathname: '/wallet-profile/lottery/deail',
            params: { bankId: bank.id, bankName: bank.name, bankColor: bank.color, bankIcon: bank.icon, bankType: bank.type }
        });
    };

    if (boundBank) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, { paddingTop: Math.max(insets.top, s(10, 15, 20)) }]}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={s(20, 26, 34)} color={THEME.textWhite} />
                    </Pressable>
                    <Text style={styles.headerTitle}>ငါ့ဘဏ်အကောင့်</Text>
                    <View style={{ width: s(36, 40, 50) }} />
                </View>

                <View style={styles.boundContent}>
                    <View style={[styles.boundCard, { borderColor: boundBank.bankColor + '50' }]}>
                        <View style={styles.boundHeaderRow}>
                            <View style={[styles.boundIconBox, { backgroundColor: boundBank.bankColor + '20' }]}>
                                <MaterialCommunityIcons name={boundBank.bankIcon as any} size={s(28, 34, 42)} color={boundBank.bankColor === '#FFD100' ? '#D4AF37' : boundBank.bankColor} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.boundBankName}>{boundBank.bankName}</Text>
                                <Text style={styles.boundBankType}>{boundBank.bankType}</Text>
                            </View>
                        </View>

                        <View style={styles.boundDivider} />

                        <View style={styles.boundDataRow}>
                            <Text style={styles.boundLabel}>အကောင့်ပိုင်ရှင်</Text>
                            <Text style={styles.boundValue}>{boundBank.accName}</Text>
                        </View>
                        <View style={styles.boundDataRow}>
                            <Text style={styles.boundLabel}>အကောင့်နံပါတ်</Text>
                            <Text style={styles.boundValueHighlight}>{boundBank.accNumber}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={s(20, 24, 28)} color={THEME.gold} style={{ marginBottom: s(8, 10, 12) }} />
                        <Text style={styles.infoText}>
                            လုံခြုံရေးအရ ဘဏ်အချက်အလက်များကို (၁) လ ပြည့်မှသာ တစ်ကြိမ် ပြန်လည်ပြောင်းလဲခွင့် ရှိပါမည်။
                        </Text>
                        <Text style={styles.dateText}>
                            နောက်တစ်ကြိမ် ပြောင်းလဲနိုင်မည့်ရက် - <Text style={{ color: THEME.textWhite, fontWeight: 'bold' }}>{boundBank.nextChangeDate}</Text>
                        </Text>
                    </View>

                    <Pressable style={styles.csBox}>
                        <Ionicons name="headset" size={s(18, 22, 26)} color={THEME.textMuted} />
                        <Text style={styles.csText}>အချက်အလက် မှားယွင်းသွားပါက Customer Service သို့ ဆက်သွယ်ပါ</Text>
                    </Pressable>
                </View>

                <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom + s(8, 10, 14), s(12, 15, 20)) }]}>
                    <Pressable style={[styles.changeBtn, styles.changeBtnDisabled]} disabled={true}>
                        <Text style={[styles.changeBtnText, { color: THEME.textMuted }]}>
                            ပြောင်းလဲခွင့်မရသေးပါ
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    const filteredBanks = BANKS[activeTab].filter(bank => bank.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const renderBankCard = ({ item }: { item: Bank }) => (
        <View style={styles.bankCard}>
            <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                    <MaterialCommunityIcons name={item.icon} size={s(24, 28, 34)} color={item.color === '#FFD100' ? '#D4AF37' : item.color} />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.bankName}>{item.name}</Text>
                    <Text style={styles.bankType}>{item.type}</Text>
                </View>
            </View>
            <Pressable style={({ pressed }) => [styles.bindBtn, pressed && styles.bindBtnPressed]} onPress={() => handleBindBank(item)}>
                <Text style={styles.bindBtnText}>ရွေးချယ်မည်</Text>
                <Ionicons name="arrow-forward" size={s(14, 16, 20)} color={THEME.neonGreen} style={{ marginLeft: s(4, 6, 8) }} />
            </Pressable>
        </View>
    );

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, s(10, 15, 20)) }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={s(20, 26, 34)} color={THEME.textWhite} />
                </Pressable>
                <Text style={styles.headerTitle}>ဘဏ်အကောင့် ချိတ်ဆက်မည်</Text>
                <View style={{ width: s(36, 40, 50) }} />
            </View>

            <View style={styles.tabContainer}>
                <Pressable style={[styles.tabButton, activeTab === 'MM' && styles.activeTab]} onPress={() => { setActiveTab('MM'); setSearchQuery(''); }}>
                    <Text style={[styles.tabText, activeTab === 'MM' && styles.activeTabText]}>🇲🇲 မြန်မာဘဏ်</Text>
                </Pressable>
                <Pressable style={[styles.tabButton, activeTab === 'TH' && styles.activeTab]} onPress={() => { setActiveTab('TH'); setSearchQuery(''); }}>
                    <Text style={[styles.tabText, activeTab === 'TH' && styles.activeTabText]}>🇹🇭 ထိုင်းဘဏ်</Text>
                </Pressable>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={s(18, 22, 26)} color={THEME.textMuted} style={styles.searchIcon} />
                <TextInput style={styles.searchInput} placeholder={`${activeTab === 'MM' ? 'မြန်မာ' : 'ထိုင်း'}ဘဏ် ရှာဖွေရန်...`} placeholderTextColor={THEME.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
                {searchQuery.length > 0 && <Pressable onPress={() => setSearchQuery('')} style={styles.clearIcon}><Ionicons name="close-circle" size={s(18, 22, 26)} color={THEME.textMuted} /></Pressable>}
            </View>

            <FlatList data={filteredBanks} keyExtractor={(item) => item.id} renderItem={renderBankCard} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(insets.bottom + s(20, 30, 40), s(40, 50, 60)) }]} ListEmptyComponent={() => (<View style={styles.emptyContainer}><MaterialCommunityIcons name="bank-minus" size={s(50, 60, 80)} color={THEME.borderNormal} /><Text style={styles.emptyText}>ရှာဖွေထားသော ဘဏ် မတွေ့ရှိပါ</Text></View>)} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: s(12, 16, 24), paddingBottom: s(12, 15, 20), borderBottomWidth: 1, borderBottomColor: THEME.borderNormal, backgroundColor: THEME.bg, zIndex: 10 },

    backButton: { width: s(36, 40, 50), height: s(36, 40, 50), borderRadius: s(18, 20, 25), backgroundColor: THEME.inputBg, justifyContent: 'center', alignItems: 'center' },

    headerTitle: { color: THEME.textWhite, fontSize: s(16, 18, 24), fontWeight: 'bold' },

    tabContainer: { flexDirection: 'row', backgroundColor: THEME.inputBg, marginHorizontal: s(12, 16, 24), marginTop: s(16, 20, 30), borderRadius: s(12, 14, 18), padding: s(4, 6, 8) },

    tabButton: { flex: 1, paddingVertical: s(10, 12, 16), alignItems: 'center', borderRadius: s(10, 12, 14) },

    activeTab: { backgroundColor: THEME.cardBg, elevation: 4 },

    tabText: { color: THEME.textMuted, fontSize: s(13, 15, 18), fontWeight: 'bold' },

    activeTabText: { color: THEME.textWhite, fontWeight: '900' },

    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.cardBg, marginHorizontal: s(12, 16, 24), marginTop: s(16, 20, 24), borderRadius: s(14, 16, 20), borderWidth: 1, borderColor: THEME.borderNormal, paddingHorizontal: s(12, 16, 20), height: s(45, 50, 60) },

    searchIcon: { marginRight: s(8, 10, 14) },

    searchInput: { flex: 1, color: THEME.textWhite, fontSize: s(13, 15, 18), fontWeight: '500', height: '100%' },

    clearIcon: { padding: s(4, 6, 8) },

    listContent: { paddingHorizontal: s(12, 16, 24), paddingTop: s(16, 20, 24) },

    bankCard: { flexDirection: 'column', backgroundColor: THEME.cardBg, borderRadius: s(16, 20, 26), padding: s(16, 20, 26), marginBottom: s(12, 16, 20), borderWidth: 1, borderColor: THEME.borderNormal },

    cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: s(16, 20, 24) },

    iconContainer: { width: s(50, 60, 75), height: s(50, 60, 75), borderRadius: s(14, 18, 24), justifyContent: 'center', alignItems: 'center', marginRight: s(12, 16, 20), borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },

    infoContainer: { flex: 1, justifyContent: 'center' },

    bankName: { color: THEME.textWhite, fontSize: s(15, 18, 24), fontWeight: 'bold', marginBottom: s(4, 6, 8) },

    bankType: { color: THEME.textMuted, fontSize: s(11, 13, 16), fontWeight: '600' },

    bindBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 230, 118, 0.08)', borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.3)', paddingVertical: s(12, 14, 18), borderRadius: s(10, 12, 16) },

    bindBtnPressed: { backgroundColor: 'rgba(0, 230, 118, 0.2)', transform: [{ scale: 0.98 }] },

    bindBtnText: { color: THEME.neonGreen, fontSize: s(13, 15, 18), fontWeight: 'bold' },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: s(40, 50, 70) },

    emptyText: { color: THEME.textMuted, fontSize: s(13, 15, 18), marginTop: s(12, 16, 20), fontWeight: 'bold' },

    boundContent: { paddingHorizontal: s(16, 20, 24), paddingTop: s(24, 30, 40) },

    boundCard: { backgroundColor: THEME.cardBg, borderRadius: s(16, 20, 24), padding: s(20, 24, 30), borderWidth: 1, marginBottom: s(20, 24, 30), elevation: 6 },

    boundHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: s(16, 20, 24) },

    boundIconBox: { width: s(50, 60, 70), height: s(50, 60, 70), borderRadius: s(14, 16, 20), justifyContent: 'center', alignItems: 'center', marginRight: s(12, 16, 20) },

    boundBankName: { color: THEME.textWhite, fontSize: s(18, 22, 28), fontWeight: 'bold', marginBottom: s(4, 6, 8) },

    boundBankType: { color: THEME.textMuted, fontSize: s(12, 14, 16), fontWeight: '600' },

    boundDivider: { height: 1, backgroundColor: THEME.borderNormal, marginBottom: s(16, 20, 24) },

    boundDataRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: s(12, 14, 18) },

    boundLabel: { color: THEME.textMuted, fontSize: s(13, 15, 18) },

    boundValue: { color: THEME.textWhite, fontSize: s(14, 16, 20), fontWeight: 'bold' },

    boundValueHighlight: { color: THEME.neonGreen, fontSize: s(15, 18, 22), fontWeight: '900', letterSpacing: 1 },

    infoBox: { backgroundColor: 'rgba(255, 215, 0, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 215, 0, 0.3)', borderRadius: s(12, 16, 20), padding: s(16, 20, 26), alignItems: 'center', marginBottom: s(16, 20, 24) },

    infoText: { color: THEME.textMuted, fontSize: s(12, 14, 16), textAlign: 'center', lineHeight: s(18, 22, 28), marginBottom: s(10, 12, 16) },

    dateText: { color: THEME.gold, fontSize: s(12, 14, 16), textAlign: 'center' },

    csBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: s(12, 14, 18) },


    csText: { color: THEME.textMuted, fontSize: s(11, 13, 15), marginLeft: s(6, 8, 10), textDecorationLine: 'underline' },


    bottomPanel: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: THEME.bg, paddingHorizontal: s(16, 20, 24), paddingTop: s(12, 15, 20), borderTopWidth: 1, borderTopColor: THEME.borderNormal },

    changeBtn: { flexDirection: 'row', backgroundColor: THEME.gold, height: s(48, 56, 68), borderRadius: s(14, 16, 20), justifyContent: 'center', alignItems: 'center' },

    changeBtnDisabled: { backgroundColor: THEME.inputBg, borderWidth: 1, borderColor: THEME.borderNormal },

    changeBtnText: { color: '#000', fontSize: s(15, 18, 22), fontWeight: 'bold' },
});

