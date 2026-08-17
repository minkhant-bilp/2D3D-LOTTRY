import { create } from 'zustand';
import {
    getTwoDLive,
    listTwoDResultsLastFiveDays,
    listTwoDSideNumbersLastFiveDays
} from '../api/main';

interface SessionResult {
    label: string;
    time: string;
    value?: string;
    modern?: string;
    internet?: string;
    kind: 'single' | 'indicator';
}

interface LiveState {
    liveNumber: string;
    lastUpdatedTimeText: string | null;
    error: string | null;
    sessionStats: SessionResult[];
    fetchLive: () => Promise<void>;
    fetchResults: () => Promise<void>;
}

export const useLiveStore = create<LiveState>((set) => ({
    liveNumber: '--',
    lastUpdatedTimeText: null,
    error: null,
    sessionStats: [],

    fetchLive: async () => {
        try {
            const response = await getTwoDLive();
            const twod = response.data?.live?.twod;
            
            const digits = (twod ?? '').replace(/\D/g, '');
            const formatted = digits.length > 0 ? digits.slice(-2).padStart(2, '0') : '--';
            
            set({ 
                liveNumber: formatted, 
                lastUpdatedTimeText: response.data?.live?.time ?? new Date().toLocaleTimeString(),
                error: null 
            });
        } catch (error) {
            set({ error: 'ချိတ်ဆက်မှု မအောင်မြင်ပါ' });
        }
    },

    fetchResults: async () => {
        try {
            const [resultsRes, sideNumbersRes] = await Promise.all([
                listTwoDResultsLastFiveDays(),
                listTwoDSideNumbersLastFiveDays()
            ]);
            
            const results = resultsRes.data?.two_d_results || [];
            const sideNumbers = sideNumbersRes.data?.two_d_side_numbers || [];
            
            const noonResult = results.find((r: any) => r.open_time?.includes('12:01'))?.twod || '--';
            const eveningResult = results.find((r: any) => r.open_time?.includes('16:30'))?.twod || '--';

            const morningSide = sideNumbers.find((s: any) => s.slot === 'morning') || { modern: '--', internet: '--' };
            const afternoonSide = sideNumbers.find((s: any) => s.slot === 'evening') || { modern: '--', internet: '--' };

            const stats: SessionResult[] = [
                { label: 'Morning', time: '09:30:00', kind: 'indicator', modern: morningSide.modern, internet: morningSide.internet },
                { label: 'Noon', time: '12:01:00', kind: 'single', value: noonResult },
                { label: 'Afternoon', time: '14:00:00', kind: 'indicator', modern: afternoonSide.modern, internet: afternoonSide.internet },
                { label: 'Evening', time: '16:30:00', kind: 'single', value: eveningResult },
            ];
            
            set({ sessionStats: stats });
        } catch (error) {
        }
    }
}));