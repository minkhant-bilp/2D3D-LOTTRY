import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WithdrawalRequestScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // 🌟 Form States
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currency = 'THB';
    const availableBalance = 0;
    const userBank = {
        name: 'KBZ',
        accountName: 'Min Khant',
        accountNumber: '09425965658'
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            router.back();
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={20} color="#9CA3AF" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.eyebrow}>ပိုက်ဆံအိတ်</Text>
                    <Text style={styles.title}>ငွေထုတ်ခြင်း</Text>
                    <Text style={styles.desc}>သင်၏ မှတ်ပုံတင်ထားသောဘဏ်အကောင့်သို့ ငွေထုတ်တောင်းဆိုပါ</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.bankBoxOuter}>
                    <View style={styles.bankBoxInner}>
                        <Text style={styles.bankBoxLabel}>လွှဲပြောင်းမည့်နေရာ</Text>
                        <View style={styles.bankDetailRow}>
                            <MaterialIcons name="account-balance" size={22} color="#10B981" style={styles.bankIcon} />
                            <View>
                                <Text style={styles.bankName}>{userBank.name}</Text>
                                <Text style={styles.accountInfo}>{userBank.accountName} · {userBank.accountNumber}</Text>
                            </View>
                        </View>
                        <Text style={styles.bankFooterText}>
                            Funds will be sent to your registered bank account.
                        </Text>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>ပမာဏ ({currency})</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            keyboardType="number-pad"
                            placeholder="e.g. 50000"
                            placeholderTextColor="#4B5563"
                            value={amount}
                            onChangeText={(val) => setAmount(val.replace(/\D/g, ''))}
                        />
                    </View>
                    <Text style={styles.helperText}>Available: {availableBalance.toLocaleString()} {currency}</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>လုံခြုံရေး PIN</Text>
                    <View style={styles.pinInputContainer}>
                        <TextInput
                            style={styles.pinInput}
                            keyboardType="number-pad"
                            placeholder="••••••"
                            placeholderTextColor="#4B5563"
                            secureTextEntry={!showPin}
                            maxLength={6}
                            value={pin}
                            onChangeText={(val) => setPin(val.replace(/\D/g, ''))}
                        />
                        <Pressable onPress={() => setShowPin(!showPin)} style={styles.eyeIcon}>
                            <MaterialIcons
                                name={showPin ? "visibility" : "visibility-off"}
                                size={20}
                                color="#6B7280"
                            />
                        </Pressable>
                    </View>
                    <Text style={styles.helperText}>အတည်ပြုရန် သင်၏ ဂဏန်း ၆ လုံး PIN ထည့်ပါ</Text>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.submitBtnOuter}
                    disabled={isSubmitting || !amount || pin.length !== 6}
                    onPress={handleSubmit}
                >
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.submitBtnInner, (isSubmitting || !amount || pin.length !== 6) && { opacity: 0.5 }]}
                    >
                        <Text style={styles.submitBtnText}>
                            {isSubmitting ? 'လုပ်ဆောင်နေပါသည်...' : 'ငွေထုတ်တောင်းဆိုမှု တင်မည်'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
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
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backBtn: {
        marginRight: 16,
        paddingTop: 4,
    },
    headerTextContainer: {
        flex: 1,
    },
    eyebrow: {
        color: '#93C5FD',
        fontSize: 12,
        marginBottom: 4,
    },
    title: {
        color: '#F7F9FF',
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    desc: {
        color: '#8A9BB3',
        fontSize: 13,
        lineHeight: 20,
    },
    scrollContent: {
        padding: 20,
    },

    bankBoxOuter: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        marginBottom: 24,
    },
    bankBoxInner: {
        padding: 16,
    },
    bankBoxLabel: {
        color: '#8A9BB3',
        fontSize: 12,
        marginBottom: 12,
    },
    bankDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    bankIcon: {
        marginRight: 12,
    },
    bankName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    accountInfo: {
        color: '#9CA3AF',
        fontSize: 13,
    },
    bankFooterText: {
        color: '#8A9BB3',
        fontSize: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },

    formGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    inputContainer: {
        backgroundColor: 'rgba(5, 10, 31, 0.68)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 12,
    },
    input: {
        height: 52,
        paddingHorizontal: 16,
        color: '#F7F9FF',
        fontSize: 16,
    },

    pinInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(5, 10, 31, 0.68)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 12,
    },
    pinInput: {
        flex: 1,
        height: 52,
        paddingHorizontal: 16,
        color: '#F7F9FF',
        fontSize: 16,
        letterSpacing: 2,
    },
    eyeIcon: {
        padding: 14,
    },

    helperText: {
        color: '#8A9BB3',
        fontSize: 12,
        marginTop: 8,
    },

    submitBtnOuter: {
        marginTop: 10,
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitBtnInner: {
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        color: '#003824',
        fontSize: 16,
        fontWeight: 'bold',
    },
});