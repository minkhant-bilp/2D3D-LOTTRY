import CardIcon from '@/components/primitives/CardIcon';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const CARDS = [
    {
        type: '2D',
        path: '/bets/twoD',
        label: '2D',
        caption: 'Two-digit · Instant rounds',
        icon: require('../../assets/icons/noun-two-7144005.svg'),
        accentColor: '#51e1a5',
    },
    {
        type: '3D',
        path: '/bets/threeD',
        label: '3D',
        caption: 'Three-digit · Higher odds',
        icon: require('../../assets/icons/noun-three-7144024.svg'),
        accentColor: '#93c5fd',
    },
];

export default function BetTypeSelector() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>SELECT GAME</Text>
            <View style={styles.grid}>
                {CARDS.map(({ type, path, label, caption, icon, accentColor }) => (
                    <View key={type} style={styles.cardWrapper}>
                        <Pressable onPress={() => router.push({ pathname: path } as any)}>
                            {({ pressed }) => (
                                <View style={[styles.outerBorder, pressed && styles.outerBorderPressed]}>
                                    <View style={[styles.innerCard, pressed && styles.innerCardPressed]}>
                                        <View style={styles.iconWrapper}>
                                            <CardIcon src={icon} color={accentColor} size={80} />
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
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48%',
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
        height: 60,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: '#f7f9ff',
        fontSize: 18,
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