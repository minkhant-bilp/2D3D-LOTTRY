import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { JSX } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: any, medium: any, tablet: any) => {
    if (isTablet) return tablet;
    if (isSmall) return small;
    return medium;
};

const ELON_2D_THEME = {
    background: '#0B132B',
    activeColor: '#00E676',
    inactiveColor: '#8A9BB3',
    borderColor: 'rgba(0, 230, 118, 0.15)',
};

interface TabBarItemProps {
    isFocused: boolean;
    onPress: () => void;
    onLongPress: () => void;
    label: string;
    icon: (props: { color: string }) => React.JSX.Element | null;
}

const TabBarItem = ({ isFocused, onPress, onLongPress, label, icon }: TabBarItemProps) => {

    return (
        <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.itemContainer}>

            {isFocused && (
                <View style={styles.staticBubble} />
            )}

            <View style={[styles.contentContainer, isFocused && { transform: [{ translateY: s(-18, -22, -30) }] }]}>
                {icon({ color: isFocused ? ELON_2D_THEME.activeColor : ELON_2D_THEME.inactiveColor })}
                <Text style={[
                    styles.label,
                    {
                        color: isFocused ? ELON_2D_THEME.activeColor : ELON_2D_THEME.inactiveColor,
                        fontWeight: isFocused ? 'bold' : '500'
                    }
                ]}>
                    {label}
                </Text>
            </View>

        </Pressable>
    );
};

export function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    const getIcon = (routeName: string, props: any): JSX.Element | null => {
        switch (routeName) {
            case 'index': return <Ionicons name="pulse" size={s(20, 24, 30)} {...props} />;
            case 'explore': return <MaterialIcons name="receipt-long" size={s(20, 24, 30)} {...props} />;
            case 'setting': return <Ionicons name="wallet" size={s(20, 24, 30)} {...props} />;
            default: return null;
        }
    };

    const getCustomLabel = (routeName: string): string => {
        switch (routeName) {
            case 'index': return 'Live';
            case 'explore': return 'မှတ်တမ်း';
            case 'setting': return 'ပိုက်ဆံအိတ်';
            default: return routeName;
        }
    };

    return (
        <View style={[
            styles.tabBarContainer,
            { marginBottom: insets.bottom > 0 ? insets.bottom + s(8, 10, 14) : s(20, 25, 35) }
        ]}>
            <View style={styles.tabItemsWrapper}>
                {state.routes.map((route, index) => {
                    if (['_sitemap', '+not-found', 'wallet-profile/number-play/select'].includes(route.name)) return null;

                    const isFocused = state.index === index;
                    const customLabel = getCustomLabel(route.name);

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({ type: 'tabLongPress', target: route.key });
                    };

                    return (
                        <TabBarItem
                            key={route.key}
                            isFocused={isFocused}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            label={customLabel}
                            icon={(props: any) => getIcon(route.name, props)}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        marginHorizontal: s(10, 15, 20),
    },
    tabItemsWrapper: {
        flexDirection: 'row',
        backgroundColor: ELON_2D_THEME.background,
        paddingVertical: s(10, 12, 16),
        borderRadius: s(24, 30, 40),
        borderWidth: s(1, 1.5, 2),
        borderColor: ELON_2D_THEME.borderColor,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    itemContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    staticBubble: {
        position: 'absolute',
        top: s(-20, -25, -35),
        width: s(48, 56, 70),
        height: s(48, 56, 70),
        borderRadius: s(24, 28, 35),
        backgroundColor: ELON_2D_THEME.background,
        borderWidth: s(1.5, 2, 3),
        borderColor: ELON_2D_THEME.activeColor,
        zIndex: 0,
        ...Platform.select({
            ios: {
                shadowColor: ELON_2D_THEME.activeColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 8,
            },
            android: {
                elevation: 10,
                shadowColor: ELON_2D_THEME.activeColor,
            },
        }),
    },
    label: {
        fontSize: s(10, 11, 14),
        marginTop: s(2, 4, 6),
    }
});