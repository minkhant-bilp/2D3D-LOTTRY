import { Feather } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from 'react-i18next';

import { loginUser } from '../api/auth';

const initialForm = {
    email: '',
    password: '',
};

export default function LoginPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { t } = useTranslation();

    const [form, setForm] = useState(initialForm);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loginMutation = useMutation({
        mutationFn: async () => {
            await loginUser({
                email: form.email.trim(),
                password: form.password,
            });
        },
        onSuccess: () => {
            router.replace('/(tabs)');
        },
        onError: (err: any) => {
            const status = err?.response?.status;
            const errorData = err?.response?.data;

            let friendlyMessage = t('auth.login_error_failed', 'အကောင့်ဝင်ခြင်း မအောင်မြင်ပါ။') as string;

            if (status === 401 || errorData?.errors?.credentials) {
                friendlyMessage = t('auth.invalid_credentials', 'အီးမေးလ် (သို့) စကားဝှက် မှားယွင်းနေပါသည်။') as string;
            } else if (status === 403 || errorData?.errors?.authorization) {
                friendlyMessage = t('auth.account_banned', 'သင့်အကောင့်ကို အသုံးပြုခွင့် ပိတ်ပင်ထားပါသည်။') as string;
            } else if (errorData?.message) {
                friendlyMessage = errorData.message;
            } else if (err.message) {
                friendlyMessage = err.message;
            }

            setErrorMessage(friendlyMessage);
        }
    });

    const handleSubmit = () => {
        if (!form.email || !form.password) {
            setErrorMessage(t('auth.login_error_empty', 'ကျေးဇူးပြု၍ အီးမေးလ်နှင့် စကားဝှက်ကို အပြည့်အစုံထည့်ပါ။') as string);
            return;
        }

        Keyboard.dismiss();
        setErrorMessage(null);
        loginMutation.mutate();
    };

    const togglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const updateField = (field: keyof typeof initialForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errorMessage) setErrorMessage(null);
    };

    const isSubmitting = loginMutation.isPending;

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            paddingTop: Math.max(insets.top + 24, 40),
                            paddingBottom: Math.max(insets.bottom + 24, 40)
                        }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onScrollBeginDrag={Keyboard.dismiss}
                    bounces={false}
                >
                    <View style={styles.headerContainer}>
                        <Text style={styles.brandText}>ZARMANI108</Text>
                        <Text style={styles.mainTitle}>
                            {t('auth.login_title', 'Sign in and keep your\ngood luck going') as string}
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.cardHeaderTitle}>{t('auth.login_welcome', 'Welcome') as string}</Text>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>{t('auth.email_label', 'Email Address') as string}</Text>
                            <View style={[styles.inputWrapper, errorMessage && styles.inputErrorBorder]}>
                                <TextInput
                                    style={styles.input}
                                    value={form.email}
                                    onChangeText={(val) => updateField('email', val)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isSubmitting}
                                    placeholderTextColor="#8a9bb3"
                                    placeholder="user@example.com"
                                />
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>{t('auth.password_label', 'Password') as string}</Text>
                            <View style={[styles.inputWrapper, errorMessage && styles.inputErrorBorder]}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={form.password}
                                    onChangeText={(val) => updateField('password', val)}
                                    secureTextEntry={!showPassword}
                                    editable={!isSubmitting}
                                    placeholderTextColor="#8a9bb3"
                                    placeholder="••••••••"
                                />
                                <Pressable
                                    style={styles.eyeButton}
                                    onPress={togglePassword}
                                    hitSlop={10}
                                >
                                    <Feather
                                        name={showPassword ? "eye" : "eye-off"}
                                        size={18}
                                        color="#8a9bb3"
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {errorMessage && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        )}

                        <Pressable
                            style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#040A1F" />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.primaryButtonText}>{t('auth.login_btn', 'Sign In') as string}</Text>
                                    <Text style={styles.buttonArrow}> -{'>'}</Text>
                                </View>
                            )}
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>{t('auth.no_account_text', "Don't have an account? ") as string}</Text>
                            <Pressable onPress={() => router.push('/register')}>
                                <Text style={styles.footerLink}>{t('auth.signup_link', 'Sign up') as string}</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'flex-start', paddingHorizontal: 20 },
    headerContainer: { marginBottom: 32 },
    brandText: { color: '#00E676', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 12 },
    mainTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', lineHeight: 36 },
    card: { backgroundColor: 'rgba(15, 23, 42, 0.88)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1E293B' },
    cardHeaderTitle: { color: '#00E676', fontSize: 16, fontWeight: 'bold', marginBottom: 24 },
    fieldContainer: { marginBottom: 20 },
    label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 10 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(5, 10, 31, 0.55)', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, height: 52 },
    inputErrorBorder: { borderColor: 'rgba(255, 77, 77, 0.45)' },
    input: { flex: 1, height: '100%', paddingHorizontal: 16, color: '#FFFFFF', fontSize: 15 },
    passwordInput: { flex: 1, height: '100%', paddingHorizontal: 16, color: '#FFFFFF', fontSize: 15 },
    eyeButton: { height: '100%', paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { backgroundColor: 'rgba(255, 77, 77, 0.1)', borderColor: 'rgba(255, 77, 77, 0.45)', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 20 },
    errorText: { color: '#ffb3aa', fontSize: 13, textAlign: 'center', lineHeight: 18 },
    primaryButton: { backgroundColor: '#00E676', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
    buttonDisabled: { opacity: 0.7 },
    buttonContent: { flexDirection: 'row', alignItems: 'center' },
    primaryButtonText: { color: '#040A1F', fontSize: 16, fontWeight: 'bold' },
    buttonArrow: { color: '#040A1F', fontSize: 16, fontWeight: 'bold', marginLeft: 4 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
    footerText: { color: '#8A9BB3', fontSize: 14 },
    footerLink: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});