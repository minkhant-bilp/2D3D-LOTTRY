import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

export const GLOBAL_THEME = {
    screenBg: '#050A1F',
    headerBg: '#0B132B',
    textPrimary: '#FFFFFF',
    textSecondary: '#8A9BB3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    notiRed: '#FF3B30'
};

export function HomeHeader() {
    const router = useRouter()
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.headerContainer,
            { paddingTop: insets.top > 0 ? insets.top + 5 : s(15, 20, 30) }
        ]}>

            <Pressable style={styles.leftSection} onPress={() => console.log('Profile Pressed')}>
                <View style={styles.profileRing}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                        style={styles.profileImage}
                    />
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.greetingText}>မင်္ဂလာပါ,</Text>
                    <Text style={styles.userName}>Aung Kyaw <MaterialCommunityIcons name="check-decagram" size={s(12, 14, 18)} color={GLOBAL_THEME.gold} /></Text>
                </View>
            </Pressable>

            <View style={styles.rightSection}>

                <Pressable
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.iconPressed]}
                    onPress={() => router.navigate("/wallet-profile/ad")}
                >
                    <View>
                        <Ionicons name="notifications-outline" size={s(22, 26, 32)} color={GLOBAL_THEME.textPrimary} />
                        <View style={styles.notiBadge} />
                    </View>
                </Pressable>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: GLOBAL_THEME.headerBg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: s(12, 16, 24),
        paddingBottom: s(12, 15, 20),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        marginTop: s(-8, -10, -14),
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileRing: {
        width: s(38, 44, 54),
        height: s(38, 44, 54),
        borderRadius: s(19, 22, 27),
        borderWidth: s(1.5, 2, 3),
        borderColor: GLOBAL_THEME.neonGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(8, 10, 14),
    },
    profileImage: {
        width: s(30, 36, 46),
        height: s(30, 36, 46),
        borderRadius: s(15, 18, 23),
    },
    userInfo: {
        justifyContent: 'center',
    },
    greetingText: {
        color: GLOBAL_THEME.textSecondary,
        fontSize: s(10, 12, 15),
        fontWeight: '500',
        marginBottom: s(1, 2, 4),
    },
    userName: {
        color: GLOBAL_THEME.textPrimary,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold',
    },

    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        padding: s(15, 20, 30),
        marginRight: s(-20, -30, -40)
    },
    iconPressed: {
        opacity: 0.6,
    },
    notiBadge: {
        position: 'absolute',
        top: s(1.5, 2, 3),
        right: s(1.5, 2, 3),
        width: s(8, 10, 12),
        height: s(8, 10, 12),
        borderRadius: s(4, 5, 6),
        backgroundColor: GLOBAL_THEME.notiRed,
        borderWidth: s(1, 1.5, 2),
        borderColor: GLOBAL_THEME.headerBg,
    },
});