import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeHeader() {
    const router = useRouter();

    const displayName = "Min Khant";
    const avatarText = "MK";
    const balanceText = "MMK 50,000";
    const unreadCount = 3;

    return (
        <View style={styles.header}>
            <View style={styles.leftSection}>
                <Pressable
                    style={styles.avatarButton}
                    onPress={() => router.push('/user/profile')}
                >
                    <Text style={styles.avatarText}>{avatarText}</Text>
                </Pressable>

                <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {displayName}
                    </Text>
                    <View style={styles.balanceContainer}>
                        <MaterialIcons name="account-balance-wallet" size={13} color="#51e1a5" />
                        <Text style={styles.balanceText}>{balanceText}</Text>
                    </View>
                </View>
            </View>

            <Pressable
                style={({ pressed }) => [
                    styles.notificationButton,
                    pressed && styles.notificationButtonPressed
                ]}
                onPress={() => router.push('/noti/notifications')}
            >
                <MaterialIcons name="notifications" size={22} color="#51e1a5" />
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                    </View>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#0c1324',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        shadowColor: '#070d1f',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 32,
        elevation: 8,
        zIndex: 50,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(81, 225, 165, 0.3)',
        backgroundColor: '#121c38',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#51e1a5',
        fontSize: 14,
        fontWeight: 'bold',
    },
    userInfo: {
        justifyContent: 'center',
    },
    userName: {
        color: '#51e1a5',
        fontSize: 20,
        fontWeight: 'bold',
        fontStyle: 'italic',
        letterSpacing: -0.5,
        marginBottom: 2,
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceText: {
        color: 'rgba(81, 225, 165, 0.8)',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#23293c',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notificationButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ef4444',
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});