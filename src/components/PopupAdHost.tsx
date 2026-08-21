import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

import { downloadPopupAdImageAPI, listActivePopupAdsAPI } from '@/api/main';
import { clearLegacySeenAds, selectShowableAds } from '../lib/popupAdQueue';
import { PopupAdModal } from './PopupAdModal';

export function PopupAdHost() {
    const [index, setIndex] = useState(0);

    const { data: queue = [] } = useQuery({
        queryKey: ['popupAdsQueue'],
        queryFn: async () => {
            clearLegacySeenAds();
            const response = await listActivePopupAdsAPI();
            let ads: any[] = [];

            if (Array.isArray(response)) {
                ads = response;
            } else if (response?.data?.popup_ads) {
                ads = response.data.popup_ads;
            } else if (response?.popup_ads) {
                ads = response.popup_ads;
            }
            return selectShowableAds(ads);
        },
        staleTime: 1000 * 60 * 15,
    });

    const currentAd = queue[index] ?? null;

    const { data: imageUrl } = useQuery({
        queryKey: ['popupAdImage', currentAd?.id],
        queryFn: async () => {
            if (!currentAd) return null;

            const bufferData = await downloadPopupAdImageAPI(currentAd.id);
            if (!bufferData) throw new Error("Image data is null or undefined");

            return new Promise<string>((resolve, reject) => {
                setTimeout(async () => {
                    try {
                        const { Buffer } = await import('buffer');
                        let base64Str = '';

                        if (typeof bufferData === 'string') {
                            base64Str = Buffer.from(bufferData, 'binary').toString('base64');
                        } else {
                            base64Str = Buffer.from(bufferData).toString('base64');
                        }

                        const mimeType = currentAd.image?.mime_type || 'image/jpeg';
                        resolve(`data:${mimeType};base64,${base64Str}`);
                    } catch (err) {
                        console.error("Base64 ပြောင်းလဲခြင်း ကျရှုံးပါသည်:", err);
                        reject(err);
                    }
                }, 0);
            });
        },
        enabled: !!currentAd,
        staleTime: Infinity,
    });

    const dismiss = () => {
        setIndex((prev) => prev + 1);
    };

    if (!currentAd || !imageUrl) return null;

    return <PopupAdModal ad={currentAd} imageUrl={imageUrl} onClose={dismiss} />;
}