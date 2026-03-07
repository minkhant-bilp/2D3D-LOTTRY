import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const THEME = {
    cardBg: '#0B132B',
    cardBorder: 'rgba(255, 255, 255, 0.05)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    divider: 'rgba(255, 255, 255, 0.08)',
    neonGreen: '#00E676',

    pinkGlow: '#FF2D55',
    orangeGlow: '#FF9500',
    blueGlow: '#32ADE6',
    redGlow: '#FF3B30',

    backdrop: 'rgba(0,0,0,0.55)',
    modalBg: '#0B132B',
    modalBorder: 'rgba(255,255,255,0.08)',
};

interface MenuItemProps {
    title: string;
    rightText?: string;
    IconComponent: any;
    iconName: any;
    iconColor: string;
    hasDivider?: boolean;
    onPress: () => void;
}

const MenuItem = ({
    title,
    rightText,
    IconComponent,
    iconName,
    iconColor,
    hasDivider = true,
    onPress,
}: MenuItemProps) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 250 });
    };
    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 250 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[animatedStyle]}
        >
            <View style={styles.menuItemRow}>
                <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}15` }]}>
                    <IconComponent name={iconName} size={20} color={iconColor} />
                </View>

                <Text style={styles.menuTitle}>{title}</Text>

                <View style={styles.rightSection}>
                    {rightText && <Text style={styles.rightText}>{rightText}</Text>}
                    <Feather name="chevron-right" size={20} color={THEME.textMuted} />
                </View>
            </View>

            {hasDivider && <View style={styles.divider} />}
        </AnimatedPressable>
    );
};

type Language = 'Thailand' | 'English' | 'မြန်မာ';

export default function MenuSettingsCard() {
    const [language, setLanguage] = useState<Language>('မြန်မာ');
    const [showLangModal, setShowLangModal] = useState(false);

    const languages: Language[] = ['Thailand', 'English', 'မြန်မာ'];

    function openLanguageModal() {
        setShowLangModal(true);
    }

    function closeLanguageModal() {
        setShowLangModal(false);
    }

    function chooseLanguage(lang: Language) {
        setLanguage(lang);
        setShowLangModal(false);
    }

    return (
        <View style={styles.cardContainer}>
            <MenuItem
                title="အသိပေးချက်များ"
                IconComponent={MaterialCommunityIcons}
                iconName="email-open-outline"
                iconColor={THEME.pinkGlow}
                onPress={() => console.log('Notifications')}
            />

            <MenuItem
                title="ဂိမ်းအခြေအနေများ"
                IconComponent={Ionicons}
                iconName="bar-chart-outline"
                iconColor={THEME.blueGlow}
                onPress={() => console.log('Game Status')}
            />

            <MenuItem
                title="ဘာသာစကားပြောင်းလဲမှု"
                rightText={language}
                IconComponent={Ionicons}
                iconName="globe-outline"
                iconColor={THEME.redGlow}
                hasDivider={false}
                onPress={openLanguageModal}
            />

            <Modal
                visible={showLangModal}
                transparent
                animationType="fade"
                onRequestClose={closeLanguageModal}
            >
                <Pressable style={styles.backdrop} onPress={closeLanguageModal}>
                    <Pressable style={styles.modalCard} onPress={() => { }}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Language</Text>
                            <Pressable onPress={closeLanguageModal} hitSlop={10}>
                                <Ionicons name="close" size={20} color={THEME.textMuted} />
                            </Pressable>
                        </View>

                        <Text style={styles.modalSub}>Select one language</Text>

                        <View style={styles.langList}>
                            {languages.map((lang) => {
                                const active = lang === language;
                                return (
                                    <Pressable
                                        key={lang}
                                        onPress={() => chooseLanguage(lang)}
                                        style={[
                                            styles.langRow,
                                            active && styles.langRowActive,
                                        ]}
                                    >
                                        <View style={[styles.langDot, active && styles.langDotActive]} />
                                        <Text style={[styles.langText, active && styles.langTextActive]}>
                                            {lang}
                                        </Text>

                                        {active ? (
                                            <Ionicons name="checkmark-circle" size={20} color={THEME.neonGreen} />
                                        ) : (
                                            <Ionicons name="chevron-forward" size={18} color={THEME.textMuted} />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View style={styles.modalFooter}>
                            <Pressable style={styles.cancelBtn} onPress={closeLanguageModal}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: THEME.cardBg,
        marginHorizontal: 16,
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: THEME.cardBorder,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
            android: { elevation: 4 },
        }),
    },

    menuItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuTitle: {
        flex: 1,
        color: THEME.textWhite,
        fontSize: 14,
        fontWeight: '500',
    },
    rightSection: { flexDirection: 'row', alignItems: 'center' },
    rightText: { color: THEME.textMuted, fontSize: 13, marginRight: 8 },

    divider: {
        height: 1,
        backgroundColor: THEME.divider,
        marginLeft: 50,
    },

    backdrop: {
        flex: 1,
        backgroundColor: THEME.backdrop,
        justifyContent: 'center',
        paddingHorizontal: 18,
    },
    modalCard: {
        backgroundColor: THEME.modalBg,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: THEME.modalBorder,
        padding: 14,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.35,
                shadowRadius: 18,
            },
            android: { elevation: 8 },
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalTitle: { color: THEME.textWhite, fontSize: 16, fontWeight: '700' },
    modalSub: { color: THEME.textMuted, fontSize: 12, marginTop: 6, marginBottom: 12 },

    langList: {
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: THEME.divider,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    langRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: THEME.divider,
    },
    langRowActive: {
        backgroundColor: 'rgba(0,230,118,0.08)',
    },
    langDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: THEME.textMuted,
        marginRight: 10,
    },
    langDotActive: {
        borderColor: THEME.neonGreen,
    },
    langText: {
        flex: 1,
        color: THEME.textWhite,
        fontSize: 14,
        fontWeight: '600',
    },
    langTextActive: {
        color: THEME.neonGreen,
    },

    modalFooter: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: THEME.divider,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    cancelText: { color: THEME.textWhite, fontWeight: '700', fontSize: 13 },
});