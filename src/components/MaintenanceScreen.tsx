import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
    message: string;
};

export default function MaintenanceScreen({ message }: Props) {
    const spin = useSharedValue(0);
    const pulse = useSharedValue(1);
    const fade = useSharedValue(0);
    const slide = useSharedValue(30);

    useEffect(() => {
        spin.value = withRepeat(
            withTiming(360, { duration: 6000, easing: Easing.linear }),
            -1,
            false
        );

        pulse.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        fade.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
        slide.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) });

        return () => {
            cancelAnimation(spin);
            cancelAnimation(pulse);
            cancelAnimation(fade);
            cancelAnimation(slide);
        };
    }, []);


    const contentStyle = useAnimatedStyle(() => ({
        opacity: fade.value,
        transform: [{ translateY: slide.value }],
    }));

    const glowRingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    const bigGearStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `${spin.value}deg` }],
    }));

    const smallGearStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `-${spin.value}deg` }],
    }));

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View style={[styles.content, contentStyle]}>

                <View style={styles.iconSection}>
                    <Animated.View style={[styles.glowRing, glowRingStyle]} />

                    <Animated.View style={bigGearStyle}>
                        <MaterialIcons name="settings" size={100} color="#51e1a5" />
                    </Animated.View>

                    <Animated.View style={[styles.smallGear, smallGearStyle]}>
                        <MaterialIcons name="settings" size={50} color="#2ac48b" opacity={0.9} />
                    </Animated.View>
                </View>

                <Text style={styles.title}>စနစ်အဆင့်မြှင့်တင်နေပါသည်</Text>

                <View style={styles.messageBox}>
                    <View style={styles.messageIconWrap}>
                        <MaterialIcons name="engineering" size={24} color="#FBBF24" />
                    </View>
                    <Text style={styles.message}>{message}</Text>
                </View>

                <Text style={styles.subText}>
                    ပိုမိုကောင်းမွန်သော ဝန်ဆောင်မှုများပေးနိုင်ရန်အတွက်{"\n"}ခေတ္တခဏ စောင့်ဆိုင်းပေးပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။
                </Text>

            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B132B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    iconSection: {
        position: 'relative',
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    glowRing: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(81, 225, 165, 0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(81, 225, 165, 0.3)',
        shadowColor: '#51e1a5',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    smallGear: {
        position: 'absolute',
        bottom: 15,
        right: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 20,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    messageBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.08)',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.25)',
        marginBottom: 28,
        width: '100%',
    },
    messageIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    message: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#FBBF24',
        textAlign: 'left',
        lineHeight: 24,
    },
    subText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        lineHeight: 22,
    },
});