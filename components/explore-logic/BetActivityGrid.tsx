import CardIcon from '@/components/primitives/CardIcon';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const ACTIVITY_ITEMS = [
    {
        id: 'bet-history',
        title: 'လောင်းကြေးမှတ်တမ်း',
        subtitle: 'ယခင်လောင်းကြေးများနှင့် ရလဒ်များ',
        path: '/gambling/gambling-history',
        icon: require('../../assets/icons/noun-history-8057329.svg'),
    },
    {
        id: 'transactions',
        title: 'ငွေကြေးမှတ်တမ်း',
        subtitle: 'အပ်ငွေနှင့် လွှဲပြောင်းမှုများ',
        path: '/gambling/transaction-record',
        icon: require('../../assets/icons/noun-transition-5560166.svg'),
    },
    {
        id: 'tickets',
        title: 'ထီမှတ်တမ်း',
        subtitle: 'ပေါက်မဲများ',
        path: '/results/twoDresult',
        icon: require('../../assets/icons/noun-casino-7694584.svg'),
    },
    {
        id: 'bank-account',
        title: 'ဘဏ်အကောင့်',
        subtitle: 'ချိတ်ဆက်ထားသော ဘဏ်များ',
        path: '/user/bank-info',
        icon: require('../../assets/icons/noun-bank-6761382.svg'),
    }
];

export default function BetActivityGrid() {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>ACTIVITY</Text>
            <View style={styles.grid}>
                {ACTIVITY_ITEMS.map(({ id, title, subtitle, path, icon }) => (
                    <View key={id} style={styles.cardWrapper}>
                        <Link href={path as any} asChild>
                            <Pressable>
                                {({ pressed }) => (
                                    <View style={[styles.outerBorder, pressed && styles.outerBorderPressed]}>
                                        <View style={[styles.innerCard, pressed && styles.innerCardPressed]}>
                                            <View style={styles.iconWrapper}>
                                                <CardIcon src={icon} color="#00e676" size={64} />
                                            </View>
                                            <View style={styles.textContainer}>
                                                <Text style={styles.label}>{title}</Text>
                                                <Text style={styles.caption}>{subtitle}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </Pressable>
                        </Link>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 24 },
    sectionTitle: { color: '#8a9bb3', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, paddingLeft: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
    cardWrapper: { width: '50%', padding: 8 },
    outerBorder: { width: '100%', aspectRatio: 1, backgroundColor: '#2A3A5A', borderRadius: 16, padding: 1 },
    outerBorderPressed: { backgroundColor: '#3D527A', transform: [{ scale: 0.97 }] },
    innerCard: { flex: 1, backgroundColor: '#0F172A', borderRadius: 15, alignItems: 'center', justifyContent: 'center', padding: 12 },
    innerCardPressed: { backgroundColor: '#16223D' },
    iconWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    textContainer: { alignItems: 'center', justifyContent: 'center' },
    label: { color: '#f7f9ff', fontSize: 13, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
    caption: { color: '#8a9bb3', fontSize: 9, textAlign: 'center', lineHeight: 14 },
});