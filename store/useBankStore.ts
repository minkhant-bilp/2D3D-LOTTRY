import { create } from 'zustand';

interface BoundBankData {
    bankId: string;
    bankName: string;
    bankColor: string;
    bankIcon: string;
    bankType: string;
    accName: string;
    accNumber: string;
    nextChangeDate: string;
}

interface BankStore {
    boundBank: BoundBankData | null;
    bindBank: (data: BoundBankData) => void;
    unbindBank: () => void;
}

export const useBankStore = create<BankStore>((set) => ({
    boundBank: null,
    bindBank: (data) => set({ boundBank: data }),
    unbindBank: () => set({ boundBank: null }),
}));