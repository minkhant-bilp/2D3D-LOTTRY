import ActionGrid from '@/components/setting/ActionGrid';
import MenuSettingsCard from '@/components/setting/MenuSettingsCard';
import ProfileWalletCard from '@/components/setting/ProfileWalletCard';
import ServiceCenterCard from '@/components/setting/ServiceCenterCard';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WalletScrean = () => {
    return (
        <SafeAreaView className='flex-1 bg-[#0B132B]'>
            <ScrollView>
                <ProfileWalletCard />
                <ActionGrid />
                <MenuSettingsCard />
                <ServiceCenterCard />
                <View className='h-20'>

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default WalletScrean;