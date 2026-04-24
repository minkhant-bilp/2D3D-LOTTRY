import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
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
import useTranslation from '@/hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

function s<T>(small: T, medium: T, tablet: T): T {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
}

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

function validateName(name: string, t: any) {
    const v = name.trim();
    if (!v) return t.nameReq || 'Name ထည့်ပေးပါ';
    if (v.length < 2) return t.nameMin || 'Name အနည်းဆုံး 2 လုံး လိုပါတယ်';
    return '';
}
function validateEmail(email: string, t: any) {
    const v = email.trim();
    if (!v) return t.emailReq || 'Email ထည့်ပေးပါ';
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (!ok) return t.emailInvalid || 'Email ပုံစံမမှန်ပါ (ဥပမာ: name@gmail.com)';
    return '';
}
function validatePassword(password: string, t: any) {
    const v = password.trim();
    if (!v) return t.passwordReq || 'Password ထည့်ပေးပါ';
    if (v.length < 6) return t.passwordMin || 'Password အနည်းဆုံး 6 လုံး လိုပါတယ်';
    return '';
}
function validateConfirm(password: string, confirm: string, t: any) {
    const p = password.trim();
    const c = confirm.trim();
    if (!c) return t.confirmReq || 'Confirm Password ထည့်ပေးပါ';
    if (p !== c) return t.passwordMatch || 'Password နှစ်ခု မတူပါ';
    return '';
}

export default function RegisterScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const canSubmit = !!name && !!email && !!password && !!confirm;

    function checkName() {
        const err = validateName(name, t);
        setNameError(err);
        return !err;
    }
    function checkEmail() {
        const err = validateEmail(email, t);
        setEmailError(err);
        return !err;
    }
    function checkPassword() {
        const err = validatePassword(password, t);
        setPasswordError(err);

        if (confirm.trim()) {
            setConfirmError(validateConfirm(password, confirm, t));
        }
        return !err;
    }
    function checkConfirm() {
        const err = validateConfirm(password, confirm, t);
        setConfirmError(err);
        return !err;
    }

    function onRegister() {
        Keyboard.dismiss();

        const ok1 = checkName();
        const ok2 = checkEmail();
        const ok3 = checkPassword();
        const ok4 = checkConfirm();
        if (!ok1 || !ok2 || !ok3 || !ok4) return;

        console.log('REGISTER:', {
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
        });

        router.replace('/');
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

                        <View style={[styles.heroTextArea, { paddingTop: Math.max(insets.top, Number(s(8, 12, 16))) }]}>
                            <View style={styles.textPlate}>
                                <Text style={styles.heroTitle}>{t.signUpTitle || 'Create Account'}</Text>
                                <Text style={styles.heroSubtitle}>{t.signUpSubtitle || 'Sign up to start ordering your favorite items'}</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, Number(s(18, 24, 30))) }}
                    >
                        <View style={styles.card}>
                            <Text style={styles.label}>{t.nameLabel || 'Name'}</Text>
                            <View style={styles.fieldWrap}>
                                <View style={[styles.inputBox, !!nameError && styles.inputBoxError]}>
                                    <View style={styles.iconPill}>
                                        <Ionicons name="person-outline" size={Number(s(16, 18, 22))} color={THEME.textMuted} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        value={name}
                                        onChangeText={(v) => {
                                            setName(v);
                                            if (nameError) setNameError('');
                                        }}
                                        onBlur={checkName}
                                        placeholder={t.namePlaceholder || "Enter your name"}
                                        placeholderTextColor={THEME.textMuted}
                                        autoCapitalize="words"
                                        returnKeyType="next"
                                    />
                                </View>
                                {!!nameError && (
                                    <Text style={styles.inlineError} numberOfLines={1}>
                                        {nameError}
                                    </Text>
                                )}
                            </View>

                            <Text style={styles.label}>{t.emailLabel || 'Email Address'}</Text>
                            <View style={styles.fieldWrap}>
                                <View style={[styles.inputBox, !!emailError && styles.inputBoxError]}>
                                    <View style={styles.iconPill}>
                                        <Ionicons name="mail-outline" size={Number(s(16, 18, 22))} color={THEME.textMuted} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        onChangeText={(v) => {
                                            setEmail(v);
                                            if (emailError) setEmailError('');
                                        }}
                                        onBlur={checkEmail}
                                        placeholder={t.emailPlaceholder || "Enter your email"}
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

                            <Text style={styles.label}>{t.passwordLabel || 'Password'}</Text>
                            <View style={styles.fieldWrap}>
                                <View style={[styles.inputBox, !!passwordError && styles.inputBoxError]}>
                                    <View style={styles.iconPill}>
                                        <Ionicons name="lock-closed-outline" size={Number(s(16, 18, 22))} color={THEME.textMuted} />
                                    </View>

                                    <TextInput
                                        style={styles.input}
                                        value={password}
                                        onChangeText={(v) => {
                                            setPassword(v);
                                            if (passwordError) setPasswordError('');
                                            if (confirmError) setConfirmError('');
                                        }}
                                        onBlur={checkPassword}
                                        placeholder={t.passwordPlaceholder || "Enter your password"}
                                        placeholderTextColor={THEME.textMuted}
                                        secureTextEntry={!showPassword}
                                        returnKeyType="next"
                                    />

                                    <Pressable onPress={() => setShowPassword((p) => !p)} hitSlop={10} style={styles.eyePill}>
                                        <Ionicons
                                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                            size={Number(s(16, 18, 22))}
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

                            <Text style={styles.label}>{t.confirmLabel || 'Confirm Password'}</Text>
                            <View style={styles.fieldWrap}>
                                <View style={[styles.inputBox, !!confirmError && styles.inputBoxError]}>
                                    <View style={styles.iconPill}>
                                        <Ionicons name="shield-checkmark-outline" size={Number(s(16, 18, 22))} color={THEME.textMuted} />
                                    </View>

                                    <TextInput
                                        style={styles.input}
                                        value={confirm}
                                        onChangeText={(v) => {
                                            setConfirm(v);
                                            if (confirmError) setConfirmError('');
                                        }}
                                        onBlur={checkConfirm}
                                        placeholder={t.confirmPlaceholder || "Re-enter your password"}
                                        placeholderTextColor={THEME.textMuted}
                                        secureTextEntry={!showConfirm}
                                        returnKeyType="done"
                                    />

                                    <Pressable onPress={() => setShowConfirm((p) => !p)} hitSlop={10} style={styles.eyePill}>
                                        <Ionicons
                                            name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                                            size={Number(s(16, 18, 22))}
                                            color={THEME.textMuted}
                                        />
                                    </Pressable>
                                </View>

                                {!!confirmError && (
                                    <Text style={styles.inlineError} numberOfLines={1}>
                                        {confirmError}
                                    </Text>
                                )}
                            </View>

                            <Pressable
                                style={[styles.primaryBtn, !canSubmit && { opacity: 0.55 }]}
                                disabled={!canSubmit}
                                onPress={onRegister}
                            >
                                <Text style={styles.primaryText}>{t.signUpBtn || 'Sign Up'}</Text>
                                <View style={styles.arrowPill}>
                                    <Ionicons name="arrow-forward" size={Number(s(14, 16, 20))} color={THEME.bg} />
                                </View>
                            </Pressable>

                            <View style={styles.bottomRow}>
                                <Text style={styles.bottomText}>{t.hasAccount || 'Already have an account? '}</Text>
                                <Pressable onPress={() => router.replace('/')}>
                                    <Text style={styles.bottomLink}>{t.logInLink || 'Log In.'}</Text>
                                </Pressable>
                            </View>
                            <View style={{ height: Number(s(20, 30, 40)) }}></View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: THEME.bg
    },
    flex1: {
        flex: 1
    },

    heroWrap: {
        width: '100%',
        height: Number(s(180, 230, 300)),
        backgroundColor: THEME.bg
    },
    hero: {
        width: '100%',
        height: '100%'
    },
    heroSoftTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(5,10,31,0.08)'
    },

    heroTextArea: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: Number(s(30, 50, 70)),
        alignItems: 'center',
        paddingHorizontal: Number(s(12, 16, 24)),
    },

    textPlate: {
        width: '100%',
        maxWidth: Number(s(520, 520, 700)),
        borderRadius: Number(s(18, 22, 28)),
        paddingVertical: Number(s(10, 14, 20)),
        paddingHorizontal: Number(s(12, 16, 24)),
        backgroundColor: 'rgba(5,10,31,0.38)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },

    heroTitle: {
        color: THEME.textWhite,
        fontSize: Number(s(28, 34, 46)),
        fontWeight: '900',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.35)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: Number(s(4, 6, 8)),
    },
    heroSubtitle: {
        color: "gray",
        fontWeight: "400",
        fontSize: Number(s(12, 14, 18)),
        textAlign: 'center',
        marginTop: Number(s(6, 8, 12))
    },

    card: {
        marginTop: Number(s(-6, -10, -16)),
        marginHorizontal: Number(s(12, 16, 24)),
        alignSelf: 'center',
        width: '100%',
        maxWidth: Number(s(420, 420, 600)),
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        borderWidth: 1,
        borderColor: 'rgba(30, 41, 59, 0.9)',
        borderRadius: Number(s(24, 30, 40)),
        paddingHorizontal: Number(s(14, 18, 26)),
        paddingTop: Number(s(18, 22, 30)),
        paddingBottom: Number(s(14, 18, 26)),
        elevation: Number(s(4, 6, 8)),
    },

    label: {
        color: THEME.textWhite,
        fontSize: Number(s(13, 15, 18)),
        fontWeight: '900',
        marginBottom: Number(s(8, 10, 14)),
        marginLeft: Number(s(2, 2, 4))
    },

    fieldWrap: {
        position: 'relative'
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: Number(s(56, 66, 76)),
        borderRadius: Number(s(16, 20, 24)),
        backgroundColor: 'rgba(5,10,31,0.55)',
        borderWidth: 1,
        borderColor: 'rgba(30,41,59,0.9)',
        paddingHorizontal: Number(s(10, 12, 16)),
        marginBottom: Number(s(16, 20, 28)),
    },
    inputBoxError: {
        borderColor: THEME.danger
    },

    iconPill: {
        width: Number(s(38, 44, 52)),
        height: Number(s(38, 44, 52)),
        borderRadius: Number(s(12, 16, 20)),
        backgroundColor: 'rgba(21,34,67,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Number(s(10, 12, 16)),
        borderWidth: 1,
        borderColor: 'rgba(30,41,59,0.75)',
    },

    input: {
        flex: 1,
        color: THEME.textWhite,
        fontSize: Number(s(13, 15, 18)),
        height: '100%'
    },

    eyePill: {
        width: Number(s(38, 44, 52)),
        height: Number(s(38, 44, 52)),
        borderRadius: Number(s(12, 16, 20)),
        backgroundColor: 'rgba(21,34,67,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Number(s(8, 10, 14)),
        borderWidth: 1,
        borderColor: 'rgba(30,41,59,0.75)',
    },

    inlineError: {
        position: 'absolute',
        left: Number(s(10, 12, 16)),
        right: Number(s(10, 12, 16)),
        bottom: Number(s(2, 3, 5)),
        color: THEME.danger,
        fontSize: Number(s(10, 12, 14)),
        fontWeight: '900',
    },

    primaryBtn: {
        height: Number(s(56, 66, 76)),
        borderRadius: Number(s(18, 22, 28)),
        backgroundColor: THEME.neonGreen,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Number(s(10, 12, 16)),
        marginTop: Number(s(2, 2, 4)),
    },
    primaryText: {
        color: THEME.bg,
        fontSize: Number(s(16, 18, 22)),
        fontWeight: '900'
    },
    arrowPill: {
        width: Number(s(32, 38, 46)),
        height: Number(s(32, 38, 46)),
        borderRadius: Number(s(12, 16, 20)),
        backgroundColor: 'rgba(5,10,31,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Number(s(8, 12, 16))
    },
    bottomText: {
        color: THEME.textMuted,
        fontSize: Number(s(11, 13, 16))
    },
    bottomLink: {
        color: THEME.neonGreen,
        fontSize: Number(s(11, 13, 16)),
        fontWeight: '900'
    },
});