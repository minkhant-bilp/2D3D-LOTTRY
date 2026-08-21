import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import useLanguageStore from '@/store/useLanguageStore';
import { useTranslation } from 'react-i18next';

const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'th', label: 'Thai' },
    { code: 'my', label: 'Myanmar' }
];

export default function MenuSettingsCard() {
    const { t, i18n } = useTranslation();
    const [modalVisible, setModalVisible] = useState(false);

    const setLanguage = useLanguageStore((state) => state.setLanguage);

    const currentLangLabel = languageOptions.find(lang => lang.code === i18n?.language)?.label || 'English';

    const handleLanguageChange = (code: string) => {
        if (i18n && typeof i18n.changeLanguage === 'function') {
            i18n.changeLanguage(code);
        }
        setLanguage(code as 'en' | 'th' | 'my');
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{t('settings.menu', 'မီနူး ဆက်တင်') as string}</Text>

            <LinearGradient
                colors={['rgba(11, 19, 43, 0.94)', 'rgba(7, 15, 35, 0.88)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={styles.card}
            >
                <Pressable
                    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                    onPress={() => setModalVisible(true)}
                >
                    <View style={styles.leftContent}>
                        <MaterialIcons name="language" size={24} color="#8a9bb3" />
                        <View style={styles.textContent}>
                            <Text style={styles.titleText} numberOfLines={1}>
                                {t('settings.language_title', 'ဘာသာစကား:') as string}
                            </Text>
                            <Text style={styles.subtitleText} numberOfLines={1}>
                                {t('settings.language_subtitle', 'ပြသသောဘာသာစကား ရွေးချယ်ပါ') as string}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.rightContent}>
                        <Text style={styles.selectedLangText}>{currentLangLabel}</Text>
                        <MaterialIcons name="keyboard-arrow-down" size={24} color="#00e676" />
                    </View>
                </Pressable>
            </LinearGradient>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{t('settings.select_language', 'ဘာသာစကား ရွေးချယ်ပါ') as string}</Text>
                        {languageOptions.map((lang) => (
                            <Pressable
                                key={lang.code}
                                style={styles.modalOption}
                                onPress={() => handleLanguageChange(lang.code)}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    i18n?.language === lang.code && styles.modalOptionTextActive
                                ]}>
                                    {lang.label}
                                </Text>
                                {i18n?.language === lang.code && (
                                    <MaterialIcons name="check" size={20} color="#00e676" />
                                )}
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 10 },
    sectionTitle: { color: '#8a9bb3', fontSize: 13, fontWeight: 'bold', paddingLeft: 10, marginBottom: 20 },
    card: { borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 16 },
    rowPressed: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
    leftContent: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
    textContent: { marginLeft: 14, justifyContent: 'center', gap: 12 },
    titleText: { top: 4, padding: 2, fontSize: 16, fontWeight: 'bold', color: '#f7f9ff' },
    subtitleText: { fontSize: 12, color: '#8a9bb3' },
    rightContent: { flexDirection: 'row', alignItems: 'center', top: -20, justifyContent: 'flex-end' },
    selectedLangText: { fontSize: 14, fontWeight: 'bold', color: '#00e676', marginRight: 2 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(4, 10, 31, 0.56)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', maxWidth: 320, backgroundColor: '#0f1d38', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.16)' },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#f5f8ff', marginBottom: 16 },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
    modalOptionText: { fontSize: 15, color: '#a7b4cb' },
    modalOptionTextActive: { color: '#00e676', fontWeight: 'bold' },
});