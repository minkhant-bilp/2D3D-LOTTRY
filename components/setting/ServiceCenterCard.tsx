import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const THEME = {
    bg: '#050A1F',
    cardBg: '#0B132B',
    inputBg: '#152243',
    cardBorder: 'rgba(255, 255, 255, 0.05)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    redLive: '#FF3B30',
    iconSilver: '#C0C0C0',
    iconOrange: '#FF9500',
    iconPink: '#FF2D55',
    iconBlue: '#32ADE6',
    iconGreen: '#34C759',
    iconPurple: '#AF52DE',
};

interface ServiceItemProps {
    title: string;
    IconComponent: any;
    iconName: any;
    iconColor: string;
    onPress: () => void;
}

const ServiceItem = ({ title, IconComponent, iconName, iconColor, onPress }: ServiceItemProps) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => { scale.value = withSpring(0.9, { damping: 15, stiffness: 300 }); };
    const handlePressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.serviceItem, animatedStyle]}
        >
            <View style={[styles.iconBox, { backgroundColor: `${iconColor}15` }]}>
                <IconComponent name={iconName} size={s(20, 24, 30)} color={iconColor} />
            </View>
            <Text style={styles.serviceText} numberOfLines={1}>{title}</Text>
        </AnimatedPressable>
    );
};

export default function ServiceCenterCard() {
    const router = useRouter();

    const [showLogoutAlert, setShowLogoutAlert] = useState(false);

    const logoutScale = useSharedValue(1);
    const onLogoutPressIn = () => { logoutScale.value = withSpring(0.95, { damping: 12, stiffness: 200 }); };
    const onLogoutPressOut = () => { logoutScale.value = withSpring(1, { damping: 12, stiffness: 200 }); };

    const animatedLogoutStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoutScale.value }]
    }));

    const confirmLogout = () => {
        setShowLogoutAlert(false);
        router.replace("/login");
    };

    return (
        <View style={styles.container}>

            <Modal visible={showLogoutAlert} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Ionicons name="log-out-outline" size={s(40, 48, 60)} color={THEME.redLive} style={{ marginBottom: 15 }} />
                        <Text style={styles.modalTitle}>အကောင့်ထွက်မည်လား?</Text>
                        <Text style={styles.modalText}>ယခုအကောင့်မှ ထွက်လိုက်ပါက နောက်တစ်ကြိမ် ပြန်လည်ဝင်ရောက်ရန် လိုအပ်ပါမည်။</Text>

                        <View style={styles.modalActionsRow}>
                            <Pressable
                                style={[styles.modalBtnCancel, { flex: 1, marginRight: 10 }]}
                                onPress={() => setShowLogoutAlert(false)}
                            >
                                <Text style={styles.modalBtnCancelText}>မထွက်ပါ</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalBtnConfirm, { flex: 1 }]}
                                onPress={confirmLogout}
                            >
                                <Text style={styles.modalBtnConfirmText}>ထွက်မည်</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Text style={styles.sectionTitle}>ဝန်ဆောင်မှုဌာန</Text>

            <View style={styles.card}>
                <View style={styles.gridWrapper}>
                    <ServiceItem
                        title="လူညီဝန်ဆောင်မှု"
                        IconComponent={Ionicons} iconName="headset-outline"
                        iconColor={THEME.iconBlue} onPress={() => router.navigate("/wallet-profile/help-center")}
                    />

                    <ServiceItem
                        title="အကြောင်း"
                        IconComponent={Ionicons} iconName="cube-outline"
                        iconColor={THEME.iconPurple} onPress={() => router.navigate("/wallet-profile/about")}
                    />
                </View>
            </View>

            <AnimatedPressable
                onPress={() => setShowLogoutAlert(true)}
                onPressIn={onLogoutPressIn}
                onPressOut={onLogoutPressOut}
                style={[styles.logoutButton, animatedLogoutStyle]}
            >
                <Ionicons name="power-outline" size={s(18, 20, 24)} color={THEME.redLive} style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>လော့အောက်</Text>
            </AnimatedPressable>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: s(12, 16, 24),
        marginTop: s(10, 15, 20),
        marginBottom: s(20, 30, 40),
    },
    sectionTitle: {
        color: THEME.textWhite,
        fontSize: s(14, 16, 20),
        fontWeight: 'bold',
        marginBottom: s(10, 12, 16),
        marginLeft: s(2, 4, 6),
    },

    card: {
        backgroundColor: THEME.cardBg,
        borderRadius: s(12, 16, 22),
        paddingVertical: s(15, 20, 30),
        paddingHorizontal: s(8, 10, 14),
        borderWidth: 1,
        borderColor: THEME.cardBorder,
        marginBottom: s(10, 15, 20),
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5
            },
            android: { elevation: 4 },
        }),
    },
    gridWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    serviceItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: s(15, 20, 30),
    },
    iconBox: {
        width: s(40, 48, 60),
        height: s(40, 48, 60),
        borderRadius: s(12, 14, 18),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: s(6, 8, 12),
    },
    serviceText: {
        color: THEME.textMuted,
        fontSize: s(9, 11, 13),
        fontWeight: '500',
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.08)',
        paddingVertical: s(12, 14, 18),
        borderRadius: s(12, 16, 22),
        borderWidth: 1.5,
        borderColor: 'rgba(255, 59, 48, 0.4)',
    },
    logoutText: {
        color: THEME.redLive,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: s(15, 20, 30)
    },
    modalBox: {
        backgroundColor: THEME.cardBg,
        borderRadius: s(20, 24, 32),
        padding: s(20, 25, 35),
        alignItems: 'center',
        width: '100%',
        maxWidth: s(340, 400, 500),
        borderWidth: 1,
        borderColor: THEME.cardBorder
    },
    modalTitle: {
        color: THEME.textWhite,
        fontSize: s(16, 18, 24),
        fontWeight: 'bold',
        marginBottom: s(8, 10, 14)
    },
    modalText: {
        color: THEME.textMuted,
        fontSize: s(12, 14, 18),
        textAlign: 'center',
        lineHeight: s(18, 22, 28),
        marginBottom: s(20, 25, 35)
    },
    modalActionsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    modalBtnCancel: {
        backgroundColor: THEME.inputBg,
        paddingVertical: s(12, 15, 18),
        borderRadius: s(10, 14, 18),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.cardBorder
    },
    modalBtnCancelText: {
        color: THEME.textWhite,
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },
    modalBtnConfirm: {
        backgroundColor: THEME.redLive,
        paddingVertical: s(12, 15, 18),
        borderRadius: s(10, 14, 18),
        alignItems: 'center'
    },
    modalBtnConfirmText: {
        color: '#FFF',
        fontSize: s(13, 15, 18),
        fontWeight: 'bold'
    },
});