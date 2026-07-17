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
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        Keyboard.dismiss();
        setError(null);
        setSuccess(null);

        if (form.password !== form.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }

        if (!/^\d{6}$/.test(form.pin)) {
            setError('Security PIN must be exactly 6 digits.');
            return;
        }

        if (form.pin !== form.pin_confirmation) {
            setError('Security PINs do not match.');
            return;
        }

        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setSuccess('Registration successful. Redirecting...');
            setTimeout(() => {
                router.replace('/wallet/bank-setup');
            }, 500);
        } catch (err) {
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [form, router]);

    const updateField = useCallback((field: keyof typeof initialForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const updatePinField = useCallback((field: 'pin' | 'pin_confirmation', value: string) => {
        const numericValue = value.replace(/\D/g, '').slice(0, 6);
        setForm(prev => ({ ...prev, [field]: numericValue }));
    }, []);

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
                                paddingTop: Math.max(insets.top + 24, 40),
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
                                Create an account{'\n'}and join the winning team
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardHeaderTitle}>New Account</Text>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Username</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        value={form.username}
                                        onChangeText={(val) => updateField('username', val)}
                                        autoCapitalize="none"
                                        editable={!loading}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="Enter your username"
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        value={form.email}
                                        onChangeText={(val) => updateField('email', val)}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        editable={!loading}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="Enter your email"
                                    />
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={form.password}
                                        onChangeText={(val) => updateField('password', val)}
                                        secureTextEntry={!showPassword}
                                        editable={!loading}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="At least 8 characters"
                                    />
                                    <Pressable
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword(p => !p)}
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

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={form.password_confirmation}
                                        onChangeText={(val) => updateField('password_confirmation', val)}
                                        secureTextEntry={!showConfirmPassword}
                                        editable={!loading}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="Re-enter password"
                                    />
                                    <Pressable
                                        style={styles.eyeButton}
                                        onPress={() => setShowConfirmPassword(p => !p)}
                                        hitSlop={10}
                                    >
                                        <Feather
                                            name={showConfirmPassword ? "eye" : "eye-off"}
                                            size={18}
                                            color="#8a9bb3"
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Security PIN</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={form.pin}
                                        onChangeText={(val) => updatePinField('pin', val)}
                                        secureTextEntry={!showPin}
                                        keyboardType="numeric"
                                        maxLength={6}
                                        editable={!loading}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="6-digit PIN"
                                    />
                                    <Pressable
                                        style={styles.eyeButton}
                                        onPress={() => setShowPin(p => !p)}
                                        hitSlop={10}
                                    >
                                        <Feather
                                            name={showPin ? "eye" : "eye-off"}
                                            size={18}
                                            color="#8a9bb3"
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <Text style={styles.label}>Confirm Security PIN</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={form.pin_confirmation}
                                        onChangeText={(val) => updatePinField('pin_confirmation', val)}
                                        secureTextEntry={!showConfirmPin}
                                        keyboardType="numeric"
                                        maxLength={6}
                                        editable={!loading}
                                        placeholderTextColor="#8a9bb3"
                                        placeholder="Re-enter 6-digit PIN"
                                    />
                                    <Pressable
                                        style={styles.eyeButton}
                                        onPress={() => setShowConfirmPin(p => !p)}
                                        hitSlop={10}
                                    >
                                        <Feather
                                            name={showConfirmPin ? "eye" : "eye-off"}
                                            size={18}
                                            color="#8a9bb3"
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            {error && (
                                <View style={styles.feedbackError}>
                                    <Text style={styles.feedbackTextError}>{error}</Text>
                                </View>
                            )}
                            {success && (
                                <View style={styles.feedbackSuccess}>
                                    <Text style={styles.feedbackTextSuccess}>{success}</Text>
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
    root: {
        flex: 1,
        backgroundColor: '#050A1F',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
    },
    headerContainer: {
        marginBottom: 32,
    },
    brandText: {
        color: '#00E676',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    mainTitle: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: 'bold',
        lineHeight: 36,
    },
    card: {
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    cardHeaderTitle: {
        color: '#00E676',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(5, 10, 31, 0.55)',
        borderWidth: 1,
        borderColor: '#1E293B',
        borderRadius: 12,
        height: 52,
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        color: '#FFFFFF',
        fontSize: 15,
    },
    passwordInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        color: '#FFFFFF',
        fontSize: 15,
    },
    eyeButton: {
        height: '100%',
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    feedbackError: {
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 77, 77, 0.3)',
    },
    feedbackTextError: {
        color: '#FF4D4D',
        fontSize: 14,
        textAlign: 'center',
    },
    feedbackSuccess: {
        backgroundColor: 'rgba(0, 230, 118, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.3)',
    },
    feedbackTextSuccess: {
        color: '#00E676',
        fontSize: 14,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: '#00E676',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#040A1F',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonArrow: {
        color: '#040A1F',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 28,
    },
    footerText: {
        color: '#8A9BB3',
        fontSize: 14,
    },
    footerLink: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});