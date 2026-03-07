import { HomeHeader } from '@/components/header/HomeHeader';
import LiveChatSection from '@/components/livenumber/HistoryList';
import { LiveNumberCard } from '@/components/livenumber/LiveNumberCard';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';


const Home = () => {
    return (
        <SafeAreaView className='flex-1 bg-[#0B132B]'>
            <HomeHeader />
            <LiveNumberCard />
            <LiveChatSection />
        </SafeAreaView>
    )
}

export default Home;