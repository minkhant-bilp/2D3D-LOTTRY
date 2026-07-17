import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BankInfoScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [bankName, setBankName] = useState('SCB — Siam Commercial Bank');
    const [accountName, setAccountName] = useState('Ko Khant');
    const [accountNumber, setAccountNumber] = useState('0985659874');
    const [isSaved, setIsSaved] = useState(true);

    return (
        <View style={styles.root}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>WALLET</Text>
                    <Text style={styles.title}>Bank Info</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <MaterialIcons name="account-balance" size={20} color="#93C5FD" />
                            <Text style={styles.cardTitle}>Bank account</Text>
                        </View>
                        {isSaved && (
                            <View style={styles.savedBadge}>
                                <MaterialIcons name="check-circle" size={14} color="#00e676" />
                                <Text style={styles.savedText}>SAVED</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>BANK</Text>
                        <Pressable style={styles.dropdownInput}>
                            <Text style={styles.dropdownText}>{bankName}</Text>
                            <MaterialIcons name="keyboard-arrow-down" size={20} color="#8A9BB3" />
                        </Pressable>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ACCOUNT NAME</Text>
                        <TextInput
                            style={styles.textInput}
                            value={accountName}
                            onChangeText={setAccountName}
                            placeholder="e.g. Aung Ko Ko"
                            placeholderTextColor="#4A5D7A"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>ACCOUNT NUMBER</Text>
                        <TextInput
                            style={styles.textInput}
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                            keyboardType="numeric"
                            placeholder="e.g. 09123456789"
                            placeholderTextColor="#4A5D7A"
                        />
                    </View>

                    <Pressable style={({ pressed }) => [styles.submitBtnWrapper, pressed && { opacity: 0.8 }]}>
                        <LinearGradient
                            colors={['#3B82F6', '#6366F1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.submitBtn}
                        >
                            <MaterialIcons name="save" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <Text style={styles.submitBtnText}>Update Bank Info</Text>
                        </LinearGradient>
                    </Pressable>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: { marginRight: 16, paddingTop: 6 },
    headerTextContainer: { flex: 1 },
    eyebrow: { color: '#93C5FD', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
    title: { color: '#F7F9FF', fontSize: 24, fontWeight: 'bold' },
    scrollContent: { padding: 20, paddingBottom: 40 },

    card: {
        backgroundColor: 'rgba(11, 19, 43, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    cardTitle: { color: '#F7F9FF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
    savedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 230, 118, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.25)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    savedText: { color: '#00e676', fontSize: 10, fontWeight: 'bold', marginLeft: 4, letterSpacing: 0.5 },

    inputGroup: { marginBottom: 20 },
    label: { color: '#4A5D7A', fontSize: 11, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 8 },
    textInput: {
        backgroundColor: 'rgba(5, 10, 31, 0.68)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#F7F9FF',
        fontSize: 15,
    },
    dropdownInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(5, 10, 31, 0.68)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownText: { color: '#F7F9FF', fontSize: 15 },

    submitBtnWrapper: { marginTop: 10, borderRadius: 12, overflow: 'hidden' },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});