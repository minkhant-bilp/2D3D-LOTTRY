import { create } from 'zustand';

export type BetNumberRow = { id: string; number: string; amount: string };

interface BetState {
    step: number;
    targetOpenTime: string;
    betRows: BetNumberRow[];
    pin: string;
    walletBalance: number;
    isTwoDType: boolean;
    currency: string;
    
    setStep: (step: number) => void;
    setTargetOpenTime: (time: string) => void;
    addBetRow: () => void;
    removeBetRow: (id: string) => void;
    updateBetRow: (id: string, field: 'number' | 'amount', value: string) => void;
    updateBetRowFields: (id: string, patch: Partial<Pick<BetNumberRow, 'number' | 'amount'>>) => void;
    removeBetRows: (ids: string[]) => void;
    clearBetRows: () => void;
    setBetRowsBulk: (rows: BetNumberRow[]) => void;
    setPin: (pin: string) => void;
    getValidAmountTotal: () => number;
    addMultipleBets: (newBets: { number: string; amount: string }[]) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const createEmptyRow = (): BetNumberRow => ({ id: generateId(), number: '', amount: '' });

export const useBetStore = create<BetState>((set, get) => ({
    step: 2,
    targetOpenTime: '12:01:00',
    betRows: [createEmptyRow()],
    pin: '',
    walletBalance: 50000, 
    isTwoDType: true,
    currency: 'MMK',

    setStep: (step) => set({ step }),
    setTargetOpenTime: (time) => set({ targetOpenTime: time }),
    
    addBetRow: () => set((state) => ({ betRows: [...state.betRows, createEmptyRow()] })),
    
    removeBetRow: (id) => set((state) => ({ 
        betRows: state.betRows.filter(row => row.id !== id) 
    })),
    
    updateBetRow: (id, field, value) => set((state) => ({
        betRows: state.betRows.map(row => row.id === id ? { ...row, [field]: value } : row)
    })),

    // Commits number + amount as one store write so an edit never lands half-applied.
    updateBetRowFields: (id, patch) => set((state) => ({
        betRows: state.betRows.map(row => row.id === id ? { ...row, ...patch } : row)
    })),

    // Bulk delete in one set(): looping removeBetRow re-renders N times and reads
    // stale state between calls. Only ids in the set are dropped; every other row
    // keeps its identity, amount and position.
    removeBetRows: (ids) => set((state) => {
        const drop = new Set(ids);
        const kept = state.betRows.filter(row => !drop.has(row.id));
        // Same contract as clearBetRows(): never leave the list literally empty,
        // or the row-card form below the pills has nothing to render.
        return { betRows: kept.length > 0 ? kept : [createEmptyRow()] };
    }),
    
    clearBetRows: () => set({ betRows: [createEmptyRow()] }),
    
    setBetRowsBulk: (newRows) => set((state) => {
        const filled = state.betRows.filter(r => r.number !== '' || r.amount !== '');
        return { betRows: filled.length > 0 ? [...filled, ...newRows] : newRows };
    }),

    setPin: (pin) => set({ pin }),

    getValidAmountTotal: () => {
        const rows = get().betRows;
        return rows.reduce((total, row) => {
            const amt = Number(row.amount);
            if (/^\d+$/.test(row.amount.trim()) && Number.isInteger(amt) && amt >= 1) {
                return total + amt;
            }
            return total;
        }, 0);
    },
    
    addMultipleBets: (newBets) => set((state) => {
        const rowsToAdd = newBets.map(bet => ({
            id: Math.random().toString(36).substr(2, 9), 
            number: bet.number,
            amount: bet.amount
        }));

        const existingRows = state.betRows.length === 1 && state.betRows[0].number === '' && state.betRows[0].amount === ''
            ? []
            : state.betRows;

        return { betRows: [...existingRows, ...rowsToAdd] };
    }),
}));