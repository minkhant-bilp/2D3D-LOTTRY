import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
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
    cardBg: '#0B132B',
    cardBorder: 'rgba(255, 255, 255, 0.05)',
    textWhite: '#FFFFFF',
    textMuted: '#8A9BB3',
    neonGreen: '#00E676',
    gold: '#FFD700',
    blueGlow: '#3B82F6',
    redGlow: '#FF3B30',
};

interface ActionCardProps {
    title: string;
    subtitle: string;
    iconName: any;
    IconComponent: any;
    iconColor: string;
    onPress: () => void;
}

const ActionCard = ({ title, subtitle, iconName, IconComponent, iconColor, onPress }: ActionCardProps) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => { scale.value = withSpring(0.92, { damping: 12, stiffness: 200 }); };
    const handlePressOut = () => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.card, animatedStyle]}
        >
            <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}15` }]}>
                <IconComponent name={iconName} size={s(18, 22, 28)} color={iconColor} />
            </View>

            <View style={styles.textWrapper}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
            </View>
        </AnimatedPressable>
    );
};

export default function ActionGrid() {
    const router = useRouter()
    return (
        <View style={styles.gridContainer}>

            <View style={styles.row}>
                <ActionCard
                    title="အလောင်းအစား"
                    subtitle="ကျွန်ုပ်၏အလောင်းအစား မှတ်တမ်း"
                    IconComponent={MaterialCommunityIcons}
                    iconName="file-document-outline"
                    iconColor={THEME.blueGlow}
                    onPress={() => router.navigate("/gambling/gambling-history")}
                />
                <ActionCard
                    title="ငွေစာရင်း မှတ်တမ်း"
                    subtitle="ကျွန်ုပ်၏ငွေစာရင်း မှတ်တမ်း"
                    IconComponent={MaterialCommunityIcons}
                    iconName="swap-horizontal"
                    iconColor={THEME.neonGreen}
                    onPress={() => router.navigate("/gambling/transaction-record")}
                />
            </View>

            <View style={styles.row}>
                <ActionCard
                    title="ထီမှတ်တမ်း"
                    subtitle="ကျွန်ုပ်၏ ထီမှတ်တမ်း"
                    IconComponent={MaterialCommunityIcons}
                    iconName="cash-plus"
                    iconColor={THEME.redGlow}
                    onPress={() => router.navigate("/gambling/despoit-history")}
                />
                <ActionCard
                    title="ငွေထုတ်"
                    subtitle="ကျွန်ုပ်၏ ငွေထုတ် မှတ်တမ်း"
                    IconComponent={Ionicons}
                    iconName="wallet-outline"
                    iconColor={THEME.gold}
                    onPress={() => router.navigate("/gambling/withdrawal-history")}
                />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    gridContainer: {
        paddingHorizontal: s(12, 16, 24),
        marginTop: s(10, 15, 20),
        marginBottom: s(15, 20, 30),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: s(8, 12, 16),
    },
    card: {
        width: '48%',
        backgroundColor: THEME.cardBg,
        borderRadius: s(12, 16, 22),
        padding: s(10, 14, 20),
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: THEME.cardBorder,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    iconWrapper: {
        width: s(32, 38, 48),
        height: s(32, 38, 48),
        borderRadius: s(10, 12, 16),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: s(8, 10, 14),
    },
    textWrapper: {
        flex: 1,
    },
    title: {
        color: THEME.textWhite,
        fontSize: s(11, 13, 16),
        fontWeight: 'bold',
        marginBottom: s(2, 4, 6),
    },
    subtitle: {
        color: THEME.textMuted,
        fontSize: s(9, 10, 12),
        lineHeight: s(12, 14, 18),
    }
});