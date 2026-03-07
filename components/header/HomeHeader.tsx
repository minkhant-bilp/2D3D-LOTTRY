import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.headerContainer,
            { paddingTop: insets.top > 0 ? insets.top + 5 : 20 }
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
                    <Text style={styles.userName}>Aung Kyaw <MaterialCommunityIcons name="check-decagram" size={14} color={GLOBAL_THEME.gold} /></Text>
                </View>
            </Pressable>

            <View style={styles.rightSection}>

                <Pressable
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.iconPressed]}
                    onPress={() => console.log('Noti Pressed')}
                >
                    <View>
                        <Ionicons name="notifications-outline" size={26} color={GLOBAL_THEME.textPrimary} />
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
        paddingHorizontal: 16,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        marginTop: -10,
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
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: GLOBAL_THEME.neonGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    profileImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    userInfo: {
        justifyContent: 'center',
    },
    greetingText: {
        color: GLOBAL_THEME.textSecondary,
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    userName: {
        color: GLOBAL_THEME.textPrimary,
        fontSize: 15,
        fontWeight: 'bold',
    },

    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        padding: 20,
        marginRight: -30
    },
    iconPressed: {
        opacity: 0.6,
    },
    notiBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: GLOBAL_THEME.notiRed,
        borderWidth: 1.5,
        borderColor: GLOBAL_THEME.headerBg,
    },
});