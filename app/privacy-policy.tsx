import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>PRIVACY</Text>
                    <Text style={styles.title}>Privacy Policy</Text>
                    <Text style={styles.desc}>
                        Learn how your account and activity data are handled in this app.
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Privacy</Text>
                    <Text style={styles.cardBody}>
                        We collect only the details required to operate your account, process bets, and verify payments. Your data is protected and used only for service, support, and security purposes.
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Policy</Text>
                    <Text style={styles.cardBody}>
                        Users must provide accurate account and payment information. Invalid submissions, abusive behavior, or policy violations may lead to rejected requests, account limits, or suspension.
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#050A1F',
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: {
        marginRight: 16,
        paddingTop: 8,
    },
    headerTextContainer: {
        flex: 1,
    },
    eyebrow: {
        color: '#FBBF24',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    title: {
        color: '#F7F9FF',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    desc: {
        color: '#8A9BB3',
        fontSize: 14,
        lineHeight: 22,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
        gap: 16,
    },

    card: {
        backgroundColor: 'rgba(11, 19, 43, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 24,
    },
    cardTitle: {
        color: '#F7F9FF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },
    cardBody: {
        color: '#8A9BB3',
        fontSize: 14,
        lineHeight: 24,
    },
});