import { create } from 'zustand';

export type SessionResult = {
    label: string;
    time: string;
    value: string;
};

const LIVE_API_URL = 'https://api.zarmani108.com/live-proxy';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function sanitizeTwod(value: unknown): string {
    if (typeof value !== 'string' && typeof value !== 'number') return '--';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length === 0) return '--';
    return digits.slice(-2).padStart(2, '0');
}

function readTwodValue(payload: unknown): string | null {
    if (!isRecord(payload)) return null;

    const live = payload.live;
    if (isRecord(live) && (typeof live.twod === 'string' || typeof live.twod === 'number')) {
        const digits = String(live.twod).replace(/\D/g, '');
        return digits.length > 0 ? digits.slice(-2).padStart(2, '0') : '--';
    }

    const payout = payload.payout;
    if (!isRecord(payout)) return null;
    const payoutLive = payout.live;
    if (!isRecord(payoutLive)) return null;
    const twod = payoutLive.twod;
    if (!isRecord(twod)) return null;
    const value = twod.value;
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const digits = String(value).replace(/\D/g, '');
    return digits.length > 0 ? digits.slice(-2).padStart(2, '0') : null;
}

function readUpdatedTimeText(payload: unknown): string | null {
    if (!isRecord(payload)) return null;
    const live = payload.live;
    if (isRecord(live) && typeof live.time === 'string') return live.time;
    if (typeof payload.server_time === 'string') return payload.server_time;
    return null;
}

function formatOpenTime(openTime: string): string {
    const parts = openTime.split(':');
    const hour = parseInt(parts[0] ?? '0', 10);
    const min = parts[1] ?? '00';
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${min} ${suffix}`;
}

function sessionLabel(openTime: string): string {
    const hour = parseInt(openTime.split(':')[0] ?? '0', 10);
    if (hour < 12) return 'Morning';
    if (hour < 14) return 'Noon';
    if (hour < 17) return 'Evening';
    return 'Night';
}

const EXCLUDED_HOURS = new Set([11, 15]);
const MMT_OFFSET_MINUTES = 6 * 60 + 30;
const EVENING_CUTOFF_MINUTES = 16 * 60 + 30;

function isAfterEveningCutoffMMT(): boolean {
    const now = new Date();
    const mmtMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + MMT_OFFSET_MINUTES) % (24 * 60);
    return mmtMinutes >= EVENING_CUTOFF_MINUTES;
}

function readSessionStats(payload: unknown): SessionResult[] {
    if (!isRecord(payload) || !Array.isArray(payload.result)) return [];
    return (payload.result as unknown[])
        .filter(isRecord)
        .filter((r) => {
            const hour = parseInt((typeof r.open_time === 'string' ? r.open_time : '').split(':')[0] ?? '0', 10);
            return !EXCLUDED_HOURS.has(hour);
        })
        .map((r) => ({
            label: sessionLabel(typeof r.open_time === 'string' ? r.open_time : ''),
            time: formatOpenTime(typeof r.open_time === 'string' ? r.open_time : ''),
            value: sanitizeTwod(r.twod),
        }));
}

interface LiveStoreState {
    liveNumber: string;
    lastUpdatedTimeText: string | null;
    error: string | null;
    sessionStats: SessionResult[];
    fetchLive: () => Promise<void>;
}

export const useLiveStore = create<LiveStoreState>((set) => ({
    liveNumber: '--',
    lastUpdatedTimeText: null,
    error: null,
    sessionStats: [],
    fetchLive: async () => {
        try {
            const response = await fetch(LIVE_API_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Live request failed (${response.status})`);

            const payload = await response.json();
            const next = readTwodValue(payload);
            const updatedAt = readUpdatedTimeText(payload);
            const stats = readSessionStats(payload);

            if (next == null) throw new Error('Unexpected live response shape');

            if (isAfterEveningCutoffMMT()) {
                const eveningIdx = stats.findIndex((s) => s.label === 'Evening');
                if (eveningIdx !== -1 && stats[eveningIdx].value === '--') {
                    stats[eveningIdx] = { ...stats[eveningIdx], value: next };
                }
            }

            set({
                liveNumber: next,
                lastUpdatedTimeText: updatedAt ?? new Date().toLocaleTimeString(),
                sessionStats: stats,
                error: null,
            });
        } catch {
            set({ error: 'Live data unavailable at the moment.' });
        }
    },
}));