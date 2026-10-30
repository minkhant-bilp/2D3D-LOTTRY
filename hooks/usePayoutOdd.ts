import { useQuery } from '@tanstack/react-query';

import { getOddSettingsAPI } from '@/api/main';
import { useAppStore } from '@/store/useAppStore';

/** The admin-set payout multiplier for this bet type in the wallet's currency; null until known. */
export function usePayoutOdd(betType: '2D' | '3D'): number | null {
    const currency = useAppStore((state: any) => state.wallet?.currency ?? 'MMK');
    const { data } = useQuery({
        queryKey: ['oddSettings'],
        queryFn: getOddSettingsAPI,
        staleTime: 5 * 60 * 1000,
    });

    const row = data?.odd_settings?.find((s: any) => s.is_active && s.bet_type === betType && s.currency === currency);
    const odd = Number(row?.odd);
    return row && Number.isFinite(odd) ? odd : null;
}
