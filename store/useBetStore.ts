import { create } from 'zustand';

interface BetItem {
    num: string;
    amount: string; 
}

interface BetStore {
    bets: BetItem[];
    setInitialBets: (numbers: string[]) => void;
    updateAmount: (num: string, amount: string) => void;
    updateAllAmounts: (amount: string) => void;
    removeBet: (num: string) => void;
    clearBets: () => void;
}

export const useBetStore = create<BetStore>((set) => ({
    bets: [],
    setInitialBets: (numbers) => set(() => ({
        bets: numbers.map(num => ({ num, amount: '' })) 
    })),
    updateAmount: (num, amount) => set((state) => ({
        bets: state.bets.map(bet => bet.num === num ? { ...bet, amount } : bet)
    })),
    updateAllAmounts: (amount) => set((state) => ({
        bets: state.bets.map(bet => ({ ...bet, amount }))
    })),
    removeBet: (num) => set((state) => ({
        bets: state.bets.filter(bet => bet.num !== num)
    })),
    clearBets: () => set({ bets: [] }),
}));