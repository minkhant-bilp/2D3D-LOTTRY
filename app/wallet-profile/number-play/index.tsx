import NumberSelectionGrid from '@/components/wallet-setting/NumberSelectionGrid'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const numberPlay = () => {
    return (
        <SafeAreaView className='flex-1 bg-[#0B132B]'>
            <NumberSelectionGrid />

        </SafeAreaView>
    )
}

export default numberPlay