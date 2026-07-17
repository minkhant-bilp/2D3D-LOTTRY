import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LogoutButton from './LogOut';

type ServiceItem = {
    id: string;
    title: string;
    path: string;
    icon: keyof typeof MaterialIcons.glyphMap;
};

const serviceItems: ServiceItem[] = [
    {
        id: 'notifications',
        title: 'အကြောင်းကြားချက်များ',
        path: '/noti/notifications',
        icon: 'notifications-none',
    },
    {
        id: 'about',
        title: 'ကိုယ်ရေးလုံခြုံမှု မူဝါဒ',
        path: '/privacy-policy',
        icon: 'info-outline',
    },
];

export default function ServiceCenterCard() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>ဝန်ဆောင်မှုစင်တာ</Text>

            <View style={styles.cardWrapper}>
                <LinearGradient
                    colors={['rgba(11, 19, 43, 0.94)', 'rgba(7, 15, 35, 0.88)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={styles.cardGradient}
                >
                    {serviceItems.map((item, index) => (
                        <Pressable
                            key={item.id}
                            style={({ pressed }) => [
                                styles.row,
                                index !== serviceItems.length - 1 && styles.rowBorder,
                                pressed && styles.rowPressed
                            ]}
                            onPress={() => router.push({ pathname: item.path } as any)}
                        >
                            <View style={styles.leftContent}>
                                <MaterialIcons
                                    name={item.icon}
                                    size={24}
                                    color="#8a9bb3"
                                    style={styles.iconStyle}
                                />
                                <Text style={styles.rowText}>{item.title}</Text>
                            </View>

                            <View style={styles.rightContent}>
                                <MaterialIcons name="chevron-right" size={24} color="#8a9bb3" />
                            </View>
                        </Pressable>
                    ))}
                </LinearGradient>
            </View>
            <LogoutButton />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        gap: 14,
    },
    sectionTitle: {
        color: '#f7f9ff',
        fontSize: 14,
        fontWeight: 'bold',
        paddingLeft: 4,
        marginBottom: 14,
    },
    cardWrapper: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
    },
    cardGradient: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 24,
        paddingHorizontal: 22,
        width: '100%',
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    rowPressed: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        left: 10
    },
    iconStyle: {
        marginRight: 16,
    },
    rowText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#f7f9ff',
        includeFontPadding: false,
        textAlignVertical: 'center',
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        top: -20,
        right: 20
    }
});