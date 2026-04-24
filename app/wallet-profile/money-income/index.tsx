import RecommendationsScreen from '@/components/brain/RecommedScrean'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Wallet = () => {
    return (
        <SafeAreaView className='flex-1 bg-[#0B132B]'>
            <RecommendationsScreen />
        </SafeAreaView>
    )
}

export default Wallet