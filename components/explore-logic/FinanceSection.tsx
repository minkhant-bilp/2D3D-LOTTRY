import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import CardIcon from '@/components/primitives/CardIcon';

const FINANCE_ITEMS = [
    {
        id: 'deposit',
        path: '/wallet-profile/deposit',
        label: 'Deposit',
        caption: 'Top up balance',
        icon: require('../../assets/icons/noun-deposit-7804216.svg'),
        accentColor: '#00e676',
    },
    {
        id: 'withdrawal-history',
        path: '/withdrawal/withdrawal-history',
        label: 'Withdrawal',
        caption: 'View past payouts',
        icon: require('../../assets/icons/noun-withdraw-7548534.svg'),
        accentColor: '#93c5fd',
    },
];

export default function FinanceSection() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>FINANCE</Text>
            <View style={styles.grid}>
                {FINANCE_ITEMS.map(({ id, path, label, caption, icon, accentColor }) => (
                    <View key={id} style={styles.cardWrapper}>
                        <Pressable
                            onPress={() => router.push(path as any)}
                        >
                            {({ pressed }) => (
                                <View style={[styles.outerBorder, pressed && styles.outerBorderPressed]}>
                                    <View style={[styles.innerCard, pressed && styles.innerCardPressed]}>
                                        <View style={styles.iconWrapper}>
                                            <CardIcon src={icon} color={accentColor} size={64} />
                                        </View>
                                        <View style={styles.textContainer}>
                                            <Text style={styles.label}>{label}</Text>
                                            <Text style={styles.caption}>{caption}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </Pressable>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#8a9bb3',
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
        paddingLeft: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    cardWrapper: {
        width: '50%',
        padding: 8,
    },
    outerBorder: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#2A3A5A',
        borderRadius: 16,
        padding: 1,
    },
    outerBorderPressed: {
        backgroundColor: '#3D527A',
        transform: [{ scale: 0.97 }],
    },
    innerCard: {
        flex: 1,
        backgroundColor: '#0F172A',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
    },
    innerCardPressed: {
        backgroundColor: '#16223D',
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: '#f7f9ff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
    },
    caption: {
        color: '#8a9bb3',
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 14,
    },
});