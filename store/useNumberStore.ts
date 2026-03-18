import { create } from 'zustand';

export type TabType = '3D' | '2D' | '1D';

const get3DBox = (str: string) => {
    if (str.length !== 3) return [str];
    const result = new Set<string>();
    const arr = str.split('');
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (i === j) continue;
            for (let k = 0; k < 3; k++) {
                if (i === k || j === k) continue;
                result.add(arr[i] + arr[j] + arr[k]);
            }
        }
    }
    return Array.from(result);
};

export const TRIPLE_3D = [
    '000', '111', '222', '333', '444', 
    '555', '666', '777', '888', '999'
];

export const PATTERN_3D = [
    '012', '123', '234', '345', '456', '567', '678', '789', 
    '987', '876', '765', '654', '543', '432', '321', '210'  
];


interface BetStore {
    numbers: Record<TabType, string[]>;
    modes: Record<TabType, string[]>;
    
    addNumber: (tab: TabType, value: string) => void;
    removeNumber: (tab: TabType, value: string) => void;
    toggleMode: (tab: TabType, modeId: string) => void; 
    clearAll: () => void;

    addComputedBets: (tab: TabType, input: string, is2DRActive: boolean, is3DBoxActive: boolean, maxLen: number) => void;
    addBulkBets: (tab: TabType, nums: string[]) => void;
    setInitialBets: (bets: string[]) => void;
}


export const useNumberStore = create<BetStore>((set) => ({
    numbers: { '3D': [], '2D': [], '1D': [] },
    modes: { '3D': [], '2D': [], '1D': [] },

    addNumber: (tab, value) => set((state) => {
        const currentNumbers = state.numbers[tab];
        if (!currentNumbers.includes(value)) {
            return { numbers: { ...state.numbers, [tab]: [...currentNumbers, value] } };
        }
        return state;
    }),

    removeNumber: (tab, value) => set((state) => ({
        numbers: { 
            ...state.numbers, 
            [tab]: state.numbers[tab].filter((n) => n !== value) 
        }
    })),

    toggleMode: (tab, modeId) => set((state) => {
        const currentModes = state.modes[tab];
        const isCurrentlyActive = currentModes.includes(modeId);
        
        const newModes = isCurrentlyActive 
            ? currentModes.filter(m => m !== modeId) 
            : [...currentModes, modeId];           

        return { modes: { ...state.modes, [tab]: newModes } };
    }),

    clearAll: () => set({
        numbers: { '3D': [], '2D': [], '1D': [] },
        modes: { '3D': [], '2D': [], '1D': [] }
    }),

    addComputedBets: (tab, input, is2DRActive, is3DBoxActive, maxLen) => set((state) => {
        if (input.length !== maxLen) return state;

        let newEntries: string[] = [];
        
        if (tab === '2D') {
            newEntries.push(input);
            if (is2DRActive && input[0] !== input[1]) {
                newEntries.push(input[1] + input[0]); 
            }
        } else if (tab === '3D') {
            if (is3DBoxActive) {
                newEntries = get3DBox(input); 
            } else {
                newEntries.push(input); 
            }
        } else {
             newEntries.push(input);
        }

        const updatedTabBets = Array.from(new Set([...state.numbers[tab], ...newEntries]));
        return { numbers: { ...state.numbers, [tab]: updatedTabBets } };
    }),

    addBulkBets: (tab, nums) => set((state) => {
        const updatedTabBets = Array.from(new Set([...state.numbers[tab], ...nums]));
        return { numbers: { ...state.numbers, [tab]: updatedTabBets } };
    }),

    setInitialBets: (bets) => set({
        numbers: { ...useNumberStore.getState().numbers }
    })
}));