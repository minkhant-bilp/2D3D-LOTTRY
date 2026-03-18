import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

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
                    <IconComponent name={iconName} size={s(18, 20, 24)} color={iconColor} />
                </View>

                <Text style={styles.menuTitle}>{title}</Text>

                <View style={styles.rightSection}>
                    {rightText && <Text style={styles.rightText}>{rightText}</Text>}
                    <Feather name="chevron-right" size={s(18, 20, 24)} color={THEME.textMuted} />
                </View>
            </View>

            {hasDivider && <View style={styles.divider} />}
        </AnimatedPressable>
    );
};

type Language = 'English' | 'မြန်မာ';

export default function MenuSettingsCard() {
    const router = useRouter()
    const [language, setLanguage] = useState<Language>('မြန်မာ');
    const [showLangModal, setShowLangModal] = useState(false);

    const languages: Language[] = ['English', 'မြန်မာ'];

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
                onPress={() => router.navigate("/wallet-profile/ad")}
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
                                <Ionicons name="close" size={s(18, 20, 26)} color={THEME.textMuted} />
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
                                            <Ionicons name="checkmark-circle" size={s(18, 20, 24)} color={THEME.neonGreen} />
                                        ) : (
                                            <Ionicons name="chevron-forward" size={s(16, 18, 22)} color={THEME.textMuted} />
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
        marginHorizontal: s(12, 16, 24),
        borderRadius: s(12, 16, 22),
        paddingVertical: s(6, 8, 12),
        paddingHorizontal: s(12, 16, 24),
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
        paddingVertical: s(10, 12, 16),
    },
    iconWrapper: {
        width: s(30, 36, 44),
        height: s(30, 36, 44),
        borderRadius: s(8, 10, 14),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(10, 14, 18),
    },
    menuTitle: {
        flex: 1,
        color: THEME.textWhite,
        fontSize: s(12, 14, 16),
        fontWeight: '500',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    rightText: {
        color: THEME.textMuted,
        fontSize: s(11, 13, 15),
        marginRight: s(6, 8, 12)
    },

    divider: {
        height: 1,
        backgroundColor: THEME.divider,
        marginLeft: s(40, 50, 60),
    },

    backdrop: {
        flex: 1,
        backgroundColor: THEME.backdrop,
        justifyContent: 'center',
        paddingHorizontal: s(14, 18, 26),
    },
    modalCard: {
        backgroundColor: THEME.modalBg,
        borderRadius: s(14, 18, 24),
        borderWidth: 1,
        borderColor: THEME.modalBorder,
        padding: s(12, 14, 20),
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
    modalTitle: {
        color: THEME.textWhite,
        fontSize: s(14, 16, 20),
        fontWeight: '700'
    },
    modalSub: {
        color: THEME.textMuted,
        fontSize: s(10, 12, 14),
        marginTop: s(4, 6, 8),
        marginBottom: s(10, 12, 16)
    },

    langList: {
        borderRadius: s(10, 14, 18),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: THEME.divider,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    langRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: s(10, 12, 16),
        paddingHorizontal: s(10, 12, 16),
        borderBottomWidth: 1,
        borderBottomColor: THEME.divider,
    },
    langRowActive: {
        backgroundColor: 'rgba(0,230,118,0.08)',
    },
    langDot: {
        width: s(8, 10, 12),
        height: s(8, 10, 12),
        borderRadius: s(4, 5, 6),
        borderWidth: 2,
        borderColor: THEME.textMuted,
        marginRight: s(8, 10, 14),
    },
    langDotActive: {
        borderColor: THEME.neonGreen,
    },
    langText: {
        flex: 1,
        color: THEME.textWhite,
        fontSize: s(12, 14, 16),
        fontWeight: '600',
    },
    langTextActive: {
        color: THEME.neonGreen,
    },

    modalFooter: {
        marginTop: s(10, 12, 16),
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelBtn: {
        paddingVertical: s(8, 10, 14),
        paddingHorizontal: s(12, 14, 20),
        borderRadius: s(10, 12, 16),
        borderWidth: 1,
        borderColor: THEME.divider,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    cancelText: {
        color: THEME.textWhite,
        fontWeight: '700',
        fontSize: s(11, 13, 15)
    },
});