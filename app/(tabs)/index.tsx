import { HomeHeader } from '@/components/header/HomeHeader';
import { LiveNumberCard } from '@/components/livenumber/LiveNumberCard';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';


const Home = () => {
    return (
        <SafeAreaView className='flex-1 bg-[#0B132B]'>
            <HomeHeader />
            <LiveNumberCard />
        </SafeAreaView>
    )
}

export default Home;