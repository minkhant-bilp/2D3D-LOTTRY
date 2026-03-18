import React from 'react';
import { Dimensions, Pressable, StyleSheet, } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
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

interface TabBarItemProps {
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
    label: string | React.ReactNode;
    icon: (props: { color: string }) => React.JSX.Element;
    colorText: string;
}

export function TabBarItem({ isFocused, onPress, onLongPress, label, icon, colorText }: TabBarItemProps) {
    const pressedScale = useSharedValue(1);

    const handlePressIn = () => {
        pressedScale.value = withSpring(0.85, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
        pressedScale.value = withSpring(1, { damping: 10, stiffness: 150 });
    };

    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: withSpring(isFocused ? 1.25 : 1, { damping: 12, stiffness: 150 }) },
                { translateY: withSpring(isFocused ? s(-4, -6, -8) : 0, { damping: 12, stiffness: 150 }) },
                { scale: pressedScale.value },
            ],
        };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isFocused ? 1 : 0.5, { duration: 200 }),
            transform: [
                { translateY: withTiming(isFocused ? s(1, 2, 3) : s(8, 10, 14), { duration: 200 }) },
                { scale: pressedScale.value }
            ],
        };
    });

    return (
        <AnimatedPressable
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.itemContainer}
        >
            <Animated.View style={animatedIconStyle}>
                {icon({ color: isFocused ? "#673ab7" : "#888" })}
            </Animated.View>

            <Animated.Text style={[
                styles.label,
                animatedTextStyle,
                { color: isFocused ? "#673ab7" : colorText }
            ]}>
                {label as React.ReactNode}
            </Animated.Text>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: s(10, 12, 16),
        fontWeight: '600',
        marginTop: s(2, 4, 6),
    }
});