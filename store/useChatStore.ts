import { create } from 'zustand';

export interface ChatMessage {
    id: string;
    userName: string;
    avatar: string;
    message: string;
    role: 'user' | 'vip' | 'admin';
}

const INITIAL_CHATS: ChatMessage[] = [
    { id: '1', userName: 'Aung Lay', avatar: 'https://i.pravatar.cc/150?u=1', message: 'ဒီနေ့ 2D ဘာထွက်နိုင်လဲဗျ?', role: 'user' },
    { id: '2', userName: 'Kyaw Kyaw', avatar: 'https://i.pravatar.cc/150?u=2', message: '၈ ပတ်သီး လိုက်ထားတယ် 🔥', role: 'user' },
    { id: '3', userName: 'System Admin', avatar: 'https://i.pravatar.cc/150?u=admin', message: 'Live လွှင့်ချိန်တွင် ယဉ်ကျေးစွာ ပြောဆိုပေးကြပါရန် မေတ္တာရပ်ခံအပ်ပါသည်။', role: 'admin' },
];

interface ChatStore {
    chats: ChatMessage[];
    addMessage: (msg: ChatMessage) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
    chats: INITIAL_CHATS,
    
    addMessage: (msg) => set((state) => ({ 
        chats: [...state.chats, msg] 
    })),
}));