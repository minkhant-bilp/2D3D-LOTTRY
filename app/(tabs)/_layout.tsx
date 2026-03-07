import { MyTabBar } from '@/components/tab/TabBar';
import { Tabs } from 'expo-router';
import React from 'react';

const Tablayout = () => {
    return (
        <Tabs
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <MyTabBar {...props} />}
        >
            <Tabs.Screen name='index' />
            <Tabs.Screen name='explore' />

            <Tabs.Screen name='setting' />
        </Tabs>
    );
};

export default Tablayout;