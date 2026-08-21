import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function CustomSplashScreen() {
    const rotation = useSharedValue(0);
    const pulse = useSharedValue(0.95);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(40);
    const barOpacity = useSharedValue(0);

    useEffect(() => {
        rotation.value = 0;
        pulse.value = 0.95;
        textOpacity.value = 0;
        textTranslateY.value = 40;
        barOpacity.value = 0;

        rotation.value = withRepeat(
            withTiming(360, { duration: 4000, easing: Easing.linear }),
            -1,
            false
        );

        pulse.value = withRepeat(
            withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        textOpacity.value = withTiming(1, { duration: 1500 });
        textTranslateY.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.exp) });

        barOpacity.value = withRepeat(
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        return () => {
            cancelAnimation(rotation);
            cancelAnimation(pulse);
            cancelAnimation(textOpacity);
            cancelAnimation(textTranslateY);
            cancelAnimation(barOpacity);
        };
    }, []);

    const outerRingStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `${rotation.value}deg` }],
    }));

    const innerRingStyle = useAnimatedStyle(() => ({
        transform: [{ rotateZ: `-${rotation.value * 1.5}deg` }], // အတွင်းကွင်းက ပိုမြန်မြန်နဲ့ ပြောင်းပြန်လှည့်မည်
    }));

    const coreStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    const textStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    const barStyle = useAnimatedStyle(() => ({
        opacity: barOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#02040A', '#070D1F', '#042F21']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />

            <View style={styles.centerStage}>
                <Animated.View style={[styles.outerRing, outerRingStyle]} />

                <Animated.View style={[styles.innerRing, innerRingStyle]} />

                <Animated.View style={[styles.coreGlow, coreStyle]}>
                    <LinearGradient
                        colors={['#00E676', '#059669']}
                        style={styles.coreGradient}
                    >
                        <Text style={styles.logoZ}>Z</Text>
                    </LinearGradient>
                </Animated.View>
            </View>

            <Animated.View style={[styles.textContainer, textStyle]}>
                <Text style={styles.brandName}>ZARMANI<Text style={styles.brandNumber}>108</Text></Text>

                <View style={styles.taglineContainer}>
                    <View style={styles.line} />
                    <Text style={styles.tagline}>PREMIUM EXCLUSIVE</Text>
                    <View style={styles.line} />
                </View>
            </Animated.View>

            <Animated.View style={[styles.loadingBarContainer, barStyle]}>
                <LinearGradient
                    colors={['transparent', '#00E676', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loadingBar}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#050A1F',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
    },
    centerStage: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
    },
    outerRing: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 2,
        borderColor: '#3B82F6',
        borderStyle: 'dashed',
        opacity: 0.6,
    },
    innerRing: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        borderColor: '#00E676',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        opacity: 0.9,
    },
    coreGlow: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: '#00E676',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#00E676',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 25,
            },
            android: {
                elevation: 25,
                shadowColor: '#00E676',
            },
        }),
    },
    coreGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 42,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoZ: {
        color: '#070D1F',
        fontSize: 52,
        fontWeight: '900',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginTop: Platform.OS === 'ios' ? 0 : -4,
    },
    textContainer: {
        alignItems: 'center',
    },
    brandName: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: 4,
        textShadowColor: 'rgba(0, 230, 118, 0.6)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 15,
    },
    brandNumber: {
        color: '#00E676',
    },
    taglineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        gap: 12,
    },
    line: {
        height: 1,
        width: 40,
        backgroundColor: 'rgba(214, 181, 96, 0.6)',
    },
    tagline: {
        color: '#D6B560',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 3,
        textTransform: 'uppercase',
    },
    loadingBarContainer: {
        position: 'absolute',
        bottom: 60,
        width: width * 0.6,
        height: 2,
        overflow: 'hidden',
    },
    loadingBar: {
        flex: 1,
    }
});