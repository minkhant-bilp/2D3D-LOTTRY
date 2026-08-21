import AsyncStorage from '@react-native-async-storage/async-storage';

const LEGACY_SEEN_ADS_KEY = 'zarmani:popup-ads-seen';

export async function clearLegacySeenAds(): Promise<void> {
    try {
        await AsyncStorage.removeItem(LEGACY_SEEN_ADS_KEY);
    } catch {
    }
}

export function selectShowableAds(ads: any[]): any[] {
    return ads.filter((ad) => ad.image?.exists === true);
}