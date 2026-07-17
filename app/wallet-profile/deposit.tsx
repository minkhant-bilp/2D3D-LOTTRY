import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DepositScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // 🌟 Form States
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [proofUri, setProofUri] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currency = 'THB';
    const balance = 0;
    const bankInfo = {
        name: 'KBANK',
        accountName: 'Zarmani 108',
        accountNumber: '1111111111'
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setProofUri(result.assets[0].uri);
        }
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
                    <Text style={styles.eyebrow}>ပိုက်ဆံအိတ် ဖြည့်သွင်းခြင်း</Text>
                    <Text style={styles.title}>ငွေအပ်ခြင်း</Text>
                    <Text style={styles.desc}>ယုံကြည်ရသောချန်နယ်များမှတဆင့် ငွေပမာဏ ဖြည့်ပါ</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.infoBox}>
                    <MaterialIcons name="account-balance-wallet" size={20} color="#10B981" />
                    <Text style={styles.infoText}>
                        Transfers must be in <Text style={{ fontWeight: 'bold', color: '#FFF' }}>{currency}</Text>. Transfer to our account, then upload your payment proof.
                    </Text>
                </View>

                <View style={styles.transferBox}>
                    <Text style={styles.transferEyebrow}>TRANSFER TO</Text>
                    <Text style={styles.bankName}>{bankInfo.name}</Text>
                    <Text style={styles.accountName}>{bankInfo.accountName}</Text>
                    <Text style={styles.accountNumber}>{bankInfo.accountNumber}</Text>
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
                    <Text style={styles.balanceText}>Current balance: {balance.toLocaleString()} {currency}</Text>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>
                        လွှဲပြောင်းမှတ်ချက် <Text style={styles.optionalText}>(optional)</Text>
                    </Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="နောက်ဆုံး ၆ လုံး သို့မဟုတ် ကိုးကားနံပါတ်"
                            placeholderTextColor="#4B5563"
                            value={note}
                            onChangeText={setNote}
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>ငွေပေးချေမှု အထောက်အထား</Text>
                    <Pressable style={styles.uploadArea} onPress={pickImage}>
                        {proofUri ? (
                            <Image source={{ uri: proofUri }} style={styles.previewImage} resizeMode="contain" />
                        ) : (
                            <>
                                <MaterialIcons name="cloud-upload" size={40} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.uploadText}>
                                    ငွေပေးချေမှု slip တင်ပါ (JPG/PNG/WEBP,{'\n'}10MB ထိ)
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.submitBtnOuter}
                    disabled={isSubmitting || !amount || !proofUri}
                    onPress={handleSubmit}
                >
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.submitBtnInner, (isSubmitting || !amount || !proofUri) && { opacity: 0.6 }]}
                    >
                        <Text style={styles.submitBtnText}>
                            {isSubmitting ? 'လုပ်ဆောင်နေပါသည်...' : 'ငွေသွင်းမည်'}
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
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1.5,
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

    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    infoText: {
        flex: 1,
        color: '#8A9BB3',
        fontSize: 13,
        marginLeft: 12,
        lineHeight: 20,
    },

    transferBox: {
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    transferEyebrow: {
        color: '#10B981',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 8,
    },
    bankName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    accountName: {
        color: '#8A9BB3',
        fontSize: 13,
        marginBottom: 4,
    },
    accountNumber: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },

    /* 🌟 Form Fields */
    formGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#9CA3AF',
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    optionalText: {
        color: '#6B7280',
        fontWeight: 'normal',
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
    balanceText: {
        color: '#8A9BB3',
        fontSize: 12,
        marginTop: 8,
    },

    uploadArea: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 140,
    },
    uploadText: {
        color: '#8A9BB3',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
    },
    previewImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
    },

    submitBtnOuter: {
        marginTop: 10,
        borderRadius: 16,
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
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});