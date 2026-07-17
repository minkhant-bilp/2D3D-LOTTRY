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
    email: '',
    password: '',
};

export default function LoginPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [form, setForm] = useState(initialForm);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(async () => {
        Keyboard.dismiss();
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            router.replace('/(tabs)');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [router]);

    const togglePassword = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const updateField = useCallback((field: keyof typeof initialForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
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
                                Sign in and keep your{'\n'}good luck going
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardHeaderTitle}>Welcome</Text>

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

                            <Pressable
                                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#040A1F" />
                                ) : (
                                    <View style={styles.buttonContent}>
                                        <Text style={styles.primaryButtonText}>Sign In</Text>
                                        <Text style={styles.buttonArrow}> -{'>'}</Text>
                                    </View>
                                )}
                            </Pressable>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don`t have an account? </Text>
                                <Pressable onPress={() => router.push('/register')}>
                                    <Text style={styles.footerLink}>Sign up</Text>
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
    primaryButton: {
        backgroundColor: '#00E676',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
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