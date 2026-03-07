import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { JSX } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

            <View style={[styles.contentContainer, isFocused && { transform: [{ translateY: -22 }] }]}>
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
            case 'index': return <Ionicons name="pulse" size={24} {...props} />;
            case 'explore': return <MaterialIcons name="receipt-long" size={24} {...props} />;
            case 'setting': return <Ionicons name="wallet" size={24} {...props} />;
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
            { marginBottom: insets.bottom > 0 ? insets.bottom + 10 : 25 }
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
        marginHorizontal: 15,
    },
    tabItemsWrapper: {
        flexDirection: 'row',
        backgroundColor: ELON_2D_THEME.background,
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1.5,
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
        top: -25,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: ELON_2D_THEME.background,
        borderWidth: 2,
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
        fontSize: 11,
        marginTop: 4,
    }
});