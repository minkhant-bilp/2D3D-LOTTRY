import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTranslation from '@/hooks/useTranslation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmall = SCREEN_WIDTH < 360;
const isTablet = SCREEN_WIDTH >= 768;

const s = (small: number, medium: number, tablet: number) => {
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
    route: any;
    navigation: any;
    label: string;
    IconComponent: any;
    iconName: any;
}

const TabBarItem = ({ isFocused, route, navigation, label, IconComponent, iconName }: TabBarItemProps) => {

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

    const iconColor = isFocused ? ELON_2D_THEME.activeColor : ELON_2D_THEME.inactiveColor;

    return (
        <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.itemContainer}>

            {isFocused && (
                <View style={styles.staticBubble} />
            )}

            <View style={[styles.contentContainer, isFocused && styles.contentContainerFocused]}>

                {IconComponent && (
                    <IconComponent name={iconName} size={s(20, 24, 30)} color={iconColor} />
                )}

                <Text style={[
                    styles.label,
                    isFocused ? styles.labelFocused : styles.labelUnfocused
                ]}>
                    {label}
                </Text>
            </View>

        </Pressable>
    );
};

export function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const dynamicTabBarContainerStyle = [
        styles.tabBarContainer,
        { marginBottom: insets.bottom > 0 ? insets.bottom + s(8, 10, 14) : s(20, 25, 35) }
    ];

    const getCustomLabel = (routeName: string): string => {
        switch (routeName) {
            case 'index': return t.tabLive || 'Live';
            case 'explore': return t.tabHistory || 'မှတ်တမ်း';
            case 'setting': return t.tabWallet || 'ပိုက်ဆံအိတ်';
            default: return routeName;
        }
    };

    return (
        <View style={dynamicTabBarContainerStyle}>
            <View style={styles.tabItemsWrapper}>
                {state.routes.map((route, index) => {
                    if (['_sitemap', '+not-found', 'wallet-profile/number-play/select'].includes(route.name)) return null;

                    const isFocused = state.index === index;
                    const customLabel = getCustomLabel(route.name);

                    let IconComponent = null;
                    let iconName = '';
                    if (route.name === 'index') {
                        IconComponent = Ionicons;
                        iconName = 'pulse';
                    } else if (route.name === 'explore') {
                        IconComponent = MaterialIcons;
                        iconName = 'receipt-long';
                    } else if (route.name === 'setting') {
                        IconComponent = Ionicons;
                        iconName = 'wallet';
                    }

                    return (
                        <TabBarItem
                            key={route.key}
                            isFocused={isFocused}
                            route={route}
                            navigation={navigation}
                            label={customLabel}
                            IconComponent={IconComponent}
                            iconName={iconName}
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
    contentContainerFocused: {
        transform: [{ translateY: s(-18, -22, -30) }],
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
    },
    labelFocused: {
        color: ELON_2D_THEME.activeColor,
        fontWeight: 'bold',
    },
    labelUnfocused: {
        color: ELON_2D_THEME.inactiveColor,
        fontWeight: '500',
    }
});