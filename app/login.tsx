import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const THEME = {
    bg: '#050A1F',
    headerBg: '#0F172A',
    surface: '#152243',
    border: '#1E293B',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    danger: '#FF4D4D',
};

function validateEmail(email: string) {
    const v = email.trim();
    if (!v) return 'Email ထည့်ပေးပါ';
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!ok) return 'Email ပုံစံမမှန်ပါ (ဥပမာ: name@gmail.com)';
    return '';
}
function validatePassword(password: string) {
    const v = password.trim();
    if (!v) return 'Password ထည့်ပေးပါ';
    if (v.length < 6) return 'Password အနည်းဆုံး 6 လုံး လိုပါတယ်';
    return '';
}

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const canSubmit = !!email && !!password;

    function checkEmail() {
        const err = validateEmail(email);
        setEmailError(err);
        return !err;
    }
    function checkPassword() {
        const err = validatePassword(password);
        setPasswordError(err);
        return !err;
    }

    function onLogin() {
        Keyboard.dismiss();
        const ok1 = checkEmail();
        const ok2 = checkPassword();
        if (!ok1 || !ok2) return;

        console.log('LOGIN:', { email: email.trim(), password: password.trim() });
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.root}>
                <View style={styles.heroWrap}>
                    <ImageBackground
                        source={require('../assets/images/header.png')}
                        style={styles.hero}
                        resizeMode="cover"
                    >
                        <View style={styles.heroSoftTint} />

                        <View style={[styles.heroTextArea, { paddingTop: Math.max(insets.top, 16) }]}>
                            <View style={styles.textPlate}>
                                <Text style={styles.heroTitle}>Sign In To K Shop</Text>
                                <Text style={styles.heroSubtitle}>Let’s personalize your shopping with Lottery</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 22) }}
                    >
                        <View style={styles.card}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.fieldWrap}>
                                <View style={[styles.inputBox, !!emailError && styles.inputBoxError]}>
                                    <View style={styles.iconPill}>
                                        <Ionicons name="mail-outline" size={18} color={THEME.textMuted} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        onChangeText={(t) => {
                                            setEmail(t);
                                            if (emailError) setEmailError('');
                                        }}
                                        onBlur={checkEmail}
                                        placeholder="Enter your email"
                                        placeholderTextColor={THEME.textMuted}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        returnKeyType="next"
                                    />
                                </View>

                                {!!emailError && (
                                    <Text style={styles.inlineError} numberOfLines={1}>
                                        {emailError}
                                    </Text>
                                )}
                            </View>

                            <Text style={styles.label}>Password</Text>
                            <View style={styles.fieldWrap}>
                                <View style={[styles.inputBox, !!passwordError && styles.inputBoxError]}>
                                    <View style={styles.iconPill}>
                                        <Ionicons name="lock-closed-outline" size={18} color={THEME.textMuted} />
                                    </View>

                                    <TextInput
                                        style={styles.input}
                                        value={password}
                                        onChangeText={(t) => {
                                            setPassword(t);
                                            if (passwordError) setPasswordError('');
                                        }}
                                        onBlur={checkPassword}
                                        placeholder="Enter your password"
                                        placeholderTextColor={THEME.textMuted}
                                        secureTextEntry={!showPassword}
                                        returnKeyType="done"
                                    />

                                    <Pressable onPress={() => setShowPassword((p) => !p)} hitSlop={10} style={styles.eyePill}>
                                        <Ionicons
                                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                            size={18}
                                            color={THEME.textMuted}
                                        />
                                    </Pressable>
                                </View>

                                {!!passwordError && (
                                    <Text style={styles.inlineError} numberOfLines={1}>
                                        {passwordError}
                                    </Text>
                                )}
                            </View>

                            <Pressable
                                style={[styles.primaryBtn, !canSubmit && { opacity: 0.55 }]}
                                disabled={!canSubmit}
                                onPress={onLogin}
                            >
                                <Text style={styles.primaryText}>Sign In</Text>
                                <View style={styles.arrowPill}>
                                    <Ionicons name="arrow-forward" size={16} color={THEME.bg} />
                                </View>
                            </Pressable>
                            <View style={styles.dividerRow}>
                                <View style={styles.line} />
                                <Text style={styles.dividerText}>Or continue with</Text>
                                <View style={styles.line} />
                            </View>

                            <Pressable style={styles.googleBtn} hitSlop={10}>
                                <View style={styles.googleIcon}>
                                    <Ionicons name="logo-google" size={18} color="#EA4335" />
                                </View>
                                <Text style={styles.googleText}>Continue with Google</Text>
                                <Ionicons name="chevron-forward" size={18} color={THEME.textMuted} />
                            </Pressable>


                            <View style={styles.bottomRow}>
                                <Text style={styles.bottomText}>Don’t have an account? </Text>
                                <Pressable onPress={() => router.replace('/(tabs)')}>
                                    <Text style={styles.bottomLink}>Sign Up.</Text>
                                </Pressable>
                            </View>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: THEME.bg },
    flex1: { flex: 1 },

    heroWrap: { width: '100%', height: 320, backgroundColor: THEME.bg },
    hero: { width: '100%', height: '100%' },

    heroSoftTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(5,10,31,0.08)',
    },

    heroTextArea: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 18,
        alignItems: 'center',
        paddingHorizontal: 16,
    },

    textPlate: {
        width: '100%',
        maxWidth: 520,
        borderRadius: 22,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(5,10,31,0.38)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },

    heroTitle: {
        color: THEME.textWhite,
        fontSize: 34,
        fontWeight: '900',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.35)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    heroSubtitle: {
        color: THEME.textMuted,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },

    card: {
        marginTop: -24,
        marginHorizontal: 16,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 420,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        borderWidth: 1,
        borderColor: 'rgba(30, 41, 59, 0.9)',
        borderRadius: 30,
        paddingHorizontal: 18,
        paddingTop: 22,
        paddingBottom: 18,
        elevation: 6,
    },

    label: {
        color: THEME.textWhite,
        fontSize: 15,
        fontWeight: '900',
        marginBottom: 10,
        marginLeft: 2,
    },

    fieldWrap: { position: 'relative' },

    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 66,
        borderRadius: 20,
        backgroundColor: 'rgba(5,10,31,0.55)',
        borderWidth: 1,
        borderColor: 'rgba(30,41,59,0.9)',
        paddingHorizontal: 12,
        marginBottom: 20,
    },
    inputBoxError: { borderColor: THEME.danger },

    iconPill: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: 'rgba(21,34,67,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(30,41,59,0.75)',
    },

    input: { flex: 1, color: THEME.textWhite, fontSize: 15, height: '100%' },

    eyePill: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: 'rgba(21,34,67,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        borderWidth: 1,
        borderColor: 'rgba(30,41,59,0.75)',
    },

    inlineError: {
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 3,
        color: THEME.danger,
        fontSize: 12,
        fontWeight: '900',
    },

    primaryBtn: {
        height: 66,
        borderRadius: 22,
        backgroundColor: THEME.neonGreen,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        marginTop: 2,
    },
    primaryText: { color: THEME.bg, fontSize: 18, fontWeight: '900' },
    arrowPill: {
        width: 38,
        height: 38,
        borderRadius: 16,
        backgroundColor: 'rgba(5,10,31,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 14,
        marginTop: 18,
        marginBottom: 12,
    },
    socialBtn: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: 'rgba(5,10,31,0.55)',
        borderWidth: 1,
        borderColor: 'rgba(30,41,59,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6
    },
    bottomText: {
        color: THEME.textMuted,
        fontSize: 13
    },
    bottomLink: {
        color: THEME.neonGreen,
        fontSize: 13,
        fontWeight: '900'
    },

    forgotWrap: {
        alignSelf: 'center',
        marginTop: 10
    },
    forgot: {
        color: THEME.neonGreen,
        fontSize: 14,
        fontWeight: '900',
        textDecorationLine: 'underline',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 14
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)'
    },
    dividerText: {
        color: THEME.textMuted,
        paddingHorizontal: 12,
        fontSize: 13,
        fontWeight: '800'
    },

    googleBtn: {
        height: 75,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderWidth: 1,
        borderColor: THEME.border,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 10,
    },
    googleIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: 'rgba(0,230,118,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(0,230,118,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        left: 60
    },
    googleText: {
        flex: 1,
        color: THEME.textWhite,
        fontSize: 14,
        fontWeight: '900',
        marginLeft: 65
    },
});