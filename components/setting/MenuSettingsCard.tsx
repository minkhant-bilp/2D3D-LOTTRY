import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Language = 'English' | 'Thai' | 'Myanmar';
const languageOptions: Language[] = ['English', 'Thai', 'Myanmar'];

export default function MenuSettingsCard() {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');

    const handleLanguageChange = (lang: Language) => {
        setSelectedLanguage(lang);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>မီနူး ဆက်တင်</Text>

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
                            <Text style={styles.titleText} numberOfLines={1}>ဘာသာစကား:</Text>
                            <Text style={styles.subtitleText} numberOfLines={1}>
                                ပြသသောဘာသာစကား ရွေးချယ်ပါ
                            </Text>
                        </View>
                    </View>

                    <View style={styles.rightContent}>
                        <Text style={styles.selectedLangText}>{selectedLanguage}</Text>
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
                        <Text style={styles.modalTitle}>ဘာသာစကား ရွေးချယ်ပါ</Text>
                        {languageOptions.map((language) => (
                            <Pressable
                                key={language}
                                style={styles.modalOption}
                                onPress={() => handleLanguageChange(language)}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    selectedLanguage === language && styles.modalOptionTextActive
                                ]}>
                                    {language}
                                </Text>
                                {selectedLanguage === language && (
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
    container: {
        marginBottom: 10,
    },
    sectionTitle: {
        color: '#8a9bb3',
        fontSize: 13,
        fontWeight: 'bold',
        paddingLeft: 10,
        marginBottom: 20,
    },
    card: {
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 16,
    },
    rowPressed: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingRight: 10,
    },
    textContent: {
        marginLeft: 14,
        justifyContent: 'center',
        gap: 12,
    },
    titleText: {
        top: 4,
        padding: 2,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f7f9ff',
    },
    subtitleText: {
        fontSize: 12,
        color: '#8a9bb3',
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        top: -20,
        justifyContent: 'flex-end',
    },
    selectedLangText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#00e676',
        marginRight: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(4, 10, 31, 0.56)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: '#0f1d38',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.16)',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f5f8ff',
        marginBottom: 16,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    modalOptionText: {
        fontSize: 15,
        color: '#a7b4cb',
    },
    modalOptionTextActive: {
        color: '#00e676',
        fontWeight: 'bold',
    },
});