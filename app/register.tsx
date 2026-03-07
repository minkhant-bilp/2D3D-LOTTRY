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


function validateName(name: string) {
    const v = name.trim();
    if (!v) return 'Name ထည့်ပေးပါ';
    if (v.length < 2) return 'Name အနည်းဆုံး 2 လုံး လိုပါတယ်';
    return '';
}
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
function validateConfirm(password: string, confirm: string) {
    const p = password.trim();
    const c = confirm.trim();
    if (!c) return 'Confirm Password ထည့်ပေးပါ';
    if (p !== c) return 'Password နှစ်ခု မတူပါ';
    return '';
}

export default function RegisterScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();


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
        const err = validateName(name);
        setNameError(err);
        return !err;
    }
    function checkEmail() {
        const err = validateEmail(email);
        setEmailError(err);
        return !err;
    }
    function checkPassword() {
        const err = validatePassword(password);
        setPasswordError(err);


        if (confirm.trim()) {
            setConfirmError(validateConfirm(password, confirm));
        }
        return !err;
    }
    function checkConfirm() {
        const err = validateConfirm(password, confirm);
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

                        <View style={[styles.heroTextArea, { paddingTop: Math.max(insets.top, 12) }]}>
                            <View style={styles.textPlate}>
                                <Text style={styles.heroTitle}>Create Account</Text>
                                <Text style={styles.heroSubtitle}>Sign up to start ordering your favorite items</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}
                    >
                        <View style={styles.card}>
                            <Text style={styles.label}>Name</Text>
                            <View style={styles.fieldWrap}>
                                <View style={[styles.inputBox, !!nameError && styles.inputBoxError]}>
                                    <View style={styles.iconPill}>
                                        <Ionicons name="person-outline" size={18} color={THEME.textMuted} />
                                    </View>
                                    <TextInput
                                        style={styles.input}
                                        value={name}
                                        onChangeText={(t) => {
                                            setName(t);
                                            if (nameError) setNameError('');
                                        }}
                                        onBlur={checkName}
                                        placeholder="Enter your name"
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
                                            if (confirmError) setConfirmError('');
                                        }}
                                        onBlur={checkPassword}
                                        placeholder="Enter your password"
                                        placeholderTextColor={THEME.textMuted}
                                        secureTextEntry={!showPassword}
                                        returnKeyType="next"
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

                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.fieldWrap}>
                                <View style={[styles.inputBox, !!confirmError && styles.inputBoxError]}>
                                    <View style={styles.iconPill}>
                                        <Ionicons name="shield-checkmark-outline" size={18} color={THEME.textMuted} />
                                    </View>

                                    <TextInput
                                        style={styles.input}
                                        value={confirm}
                                        onChangeText={(t) => {
                                            setConfirm(t);
                                            if (confirmError) setConfirmError('');
                                        }}
                                        onBlur={checkConfirm}
                                        placeholder="Re-enter your password"
                                        placeholderTextColor={THEME.textMuted}
                                        secureTextEntry={!showConfirm}
                                        returnKeyType="done"
                                    />

                                    <Pressable onPress={() => setShowConfirm((p) => !p)} hitSlop={10} style={styles.eyePill}>
                                        <Ionicons
                                            name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                                            size={18}
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
                                <Text style={styles.primaryText}>Sign Up</Text>
                                <View style={styles.arrowPill}>
                                    <Ionicons name="arrow-forward" size={16} color={THEME.bg} />
                                </View>
                            </Pressable>

                            <View style={styles.bottomRow}>
                                <Text style={styles.bottomText}>Already have an account? </Text>
                                <Pressable onPress={() => router.replace('/login')}>
                                    <Text style={styles.bottomLink}>Log In.</Text>
                                </Pressable>
                            </View>
                            <View style={{ height: 30 }}></View>
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
        height: 230,
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
        bottom: 50,
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
        color: "gray",
        fontWeight: "400",
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8
    },

    card: {
        marginTop: -10,
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
        marginLeft: 2
    },

    fieldWrap: {
        position: 'relative'
    },
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
    inputBoxError: {
        borderColor: THEME.danger
    },

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

    input: {
        flex: 1,
        color: THEME.textWhite,
        fontSize: 15,
        height: '100%'
    },

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
    primaryText: {
        color: THEME.bg,
        fontSize: 18,
        fontWeight: '900'
    },
    arrowPill: {
        width: 38,
        height: 38,
        borderRadius: 16,
        backgroundColor: 'rgba(5,10,31,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12
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
});