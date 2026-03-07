import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const THEME = {
    cardBg: '#0B132B',
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
    const router = useRouter()
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
                <IconComponent name={iconName} size={24} color={iconColor} />
            </View>
            <Text style={styles.serviceText} numberOfLines={1}>{title}</Text>
        </AnimatedPressable>
    );
};

export default function ServiceCenterCard() {

    const logoutScale = useSharedValue(1);
    const onLogoutPressIn = () => { logoutScale.value = withSpring(0.95, { damping: 12, stiffness: 200 }); };
    const onLogoutPressOut = () => { logoutScale.value = withSpring(1, { damping: 12, stiffness: 200 }); };

    const animatedLogoutStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoutScale.value }]
    }));

    return (
        <View style={styles.container}>

            <Text style={styles.sectionTitle}>ဝန်ဆောင်မှုဌာန</Text>

            <View style={styles.card}>
                <View style={styles.gridWrapper}>



                    <ServiceItem
                        title="ကြေငြာချက်များ"
                        IconComponent={Ionicons} iconName="megaphone-outline"
                        iconColor={THEME.iconPink} onPress={() => router.navigate("/wallet-profile/ad")}
                    />

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
                onPress={() => router.navigate("/login")}
                onPressIn={onLogoutPressIn}
                onPressOut={onLogoutPressOut}
                style={[styles.logoutButton, animatedLogoutStyle]}
            >
                <Ionicons name="power-outline" size={20} color={THEME.redLive} style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>လော့အောက်</Text>
            </AnimatedPressable>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 15,
        marginBottom: 30,
    },
    sectionTitle: {
        color: THEME.textWhite,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
    },

    card: {
        backgroundColor: THEME.cardBg,
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: THEME.cardBorder,
        marginBottom: 15,
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
        justifyContent: 'space-between',
    },
    serviceItem: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceText: {
        color: THEME.textMuted,
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.08)',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 59, 48, 0.4)',
    },
    logoutText: {
        color: THEME.redLive,
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    }
});