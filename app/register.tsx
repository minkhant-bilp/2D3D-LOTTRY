import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { registerUser } from '../api/auth';

const initialForm = {
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    pin: '',
    pin_confirmation: '',
};

export default function RegisterPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [form, setForm] = useState(initialForm);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        Keyboard.dismiss();
        setError(null);

        if (!form.username || !form.email || !form.password) {
            setError('ကျေးဇူးပြု၍ အချက်အလက်များကို အပြည့်အစုံထည့်ပါ။');
            return;
        }

        if (form.password !== form.password_confirmation) {
            setError('စကားဝှက်များ တူညီမှုမရှိပါ။ (Passwords do not match)');
            return;
        }

        if (!/^\d{6}$/.test(form.pin)) {
            setError('လုံခြုံရေး PIN သည် ဂဏန်း (၆) လုံး အတိအကျ ဖြစ်ရပါမည်။');
            return;
        }

        if (form.pin !== form.pin_confirmation) {
            setError('လုံခြုံရေး PIN များ တူညီမှုမရှိပါ။ (PINs do not match)');
            return;
        }

        setLoading(true);

        try {
            await registerUser({
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
                password_confirmation: form.password_confirmation,
                pin: form.pin,
                pin_confirmation: form.pin_confirmation,
            });

            router.replace('/wallet/bank-setup');

        } catch (err: any) {
            setError(err.message || 'အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ။');
        } finally {
            setLoading(false);
        }
    }, [form, router]);

    const updateField = useCallback((field: keyof typeof initialForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (error) setError(null);
    }, [error]);

    return (
        <View style={styles.root}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            {
                                paddingTop: Math.max(insets.top + 16, 20),
                                paddingBottom: Math.max(insets.bottom + 24, 40)
                            }
                        ]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                    >
                        <View style={styles.headerContainer}>
                            <Text style={styles.brandText}>ZARMANI108</Text>
                            <Text style={styles.mainTitle}>
                                Join us and start{'\n'}winning today
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardHeaderTitle}>Create New Account</Text>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Username</Text>
                                <View style={[styles.inputWrapper, error && styles.inputErrorBorder]}>
                                    <TextInput
                                        style={styles.input}
                                        value={form.username}
                                        onChangeText={(val) => updateField('username', val)}
                                        autoCapitalize="none"
                                        editable={!loading}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="e.g. aungkoko"
                                        maxLength={255}
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={[styles.inputWrapper, error && styles.inputErrorBorder]}>
                                    <TextInput
                                        style={styles.input}
                                        value={form.email}
                                        onChangeText={(val) => updateField('email', val)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        editable={!loading}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="user@example.com"
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Password</Text>
                                <View style={[styles.inputWrapper, error && styles.inputErrorBorder]}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={form.password}
                                        onChangeText={(val) => updateField('password', val)}
                                        secureTextEntry={!showPassword}
                                        editable={!loading}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="At least 8 characters"
                                    />
                                    <Pressable style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                                        <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#8a9bb3" />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={[styles.inputWrapper, error && styles.inputErrorBorder]}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={form.password_confirmation}
                                        onChangeText={(val) => updateField('password_confirmation', val)}
                                        secureTextEntry={!showConfirmPassword}
                                        editable={!loading}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="Re-enter password"
                                    />
                                    <Pressable style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)} hitSlop={10}>
                                        <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={18} color="#8a9bb3" />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Security PIN</Text>
                                <View style={[styles.inputWrapper, error && styles.inputErrorBorder]}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={form.pin}
                                        onChangeText={(val) => updateField('pin', val.replace(/\D/g, '').slice(0, 6))}
                                        keyboardType="number-pad"
                                        secureTextEntry={!showPin}
                                        editable={!loading}
                                        maxLength={6}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="6-digit PIN for placing bets"
                                    />
                                    <Pressable style={styles.eyeButton} onPress={() => setShowPin(!showPin)} hitSlop={10}>
                                        <Feather name={showPin ? "eye" : "eye-off"} size={18} color="#8a9bb3" />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Confirm Security PIN</Text>
                                <View style={[styles.inputWrapper, error && styles.inputErrorBorder]}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={form.pin_confirmation}
                                        onChangeText={(val) => updateField('pin_confirmation', val.replace(/\D/g, '').slice(0, 6))}
                                        keyboardType="number-pad"
                                        secureTextEntry={!showConfirmPin}
                                        editable={!loading}
                                        maxLength={6}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="Re-enter 6-digit PIN"
                                    />
                                    <Pressable style={styles.eyeButton} onPress={() => setShowConfirmPin(!showConfirmPin)} hitSlop={10}>
                                        <Feather name={showConfirmPin ? "eye" : "eye-off"} size={18} color="#8a9bb3" />
                                    </Pressable>
                                </View>
                            </View>

                            {error && (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}

                            <Pressable
                                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#040A1F" />
                                ) : (
                                    <View style={styles.buttonContent}>
                                        <Text style={styles.primaryButtonText}>Create Account</Text>
                                        <Text style={styles.buttonArrow}> -{'>'}</Text>
                                    </View>
                                )}
                            </Pressable>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <Pressable onPress={() => router.push('/login')}>
                                    <Text style={styles.footerLink}>Sign in</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050A1F' },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'flex-start', paddingHorizontal: 20 },
    headerContainer: { marginBottom: 24 },
    brandText: { color: '#00E676', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 8 },
    mainTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold', lineHeight: 36 },
    card: { backgroundColor: 'rgba(15, 23, 42, 0.88)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#1E293B' },
    cardHeaderTitle: { color: '#00E676', fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
    fieldContainer: { marginBottom: 16 },
    label: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(5, 10, 31, 0.55)', borderWidth: 1, borderColor: '#1E293B', borderRadius: 12, height: 50 },
    inputErrorBorder: { borderColor: 'rgba(255, 77, 77, 0.45)' },
    input: { flex: 1, height: '100%', paddingHorizontal: 16, color: '#FFFFFF', fontSize: 15 },
    passwordInput: { flex: 1, height: '100%', paddingHorizontal: 16, color: '#FFFFFF', fontSize: 15 },
    eyeButton: { height: '100%', paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { backgroundColor: 'rgba(255, 77, 77, 0.1)', borderColor: 'rgba(255, 77, 77, 0.45)', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
    errorText: { color: '#ffb3aa', fontSize: 13, textAlign: 'center', lineHeight: 18 },
    primaryButton: { backgroundColor: '#00E676', height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
    buttonDisabled: { opacity: 0.7 },
    buttonContent: { flexDirection: 'row', alignItems: 'center' },
    primaryButtonText: { color: '#040A1F', fontSize: 16, fontWeight: 'bold' },
    buttonArrow: { color: '#040A1F', fontSize: 16, fontWeight: 'bold', marginLeft: 4 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { color: '#8A9BB3', fontSize: 14 },
    footerLink: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});