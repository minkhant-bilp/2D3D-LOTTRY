import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import mmkvStorage from './mmkvStorage';

type LanguageType = 'my' | 'en' | 'th';

interface LangagueStoreState {
  lang: LanguageType;
  setLanguage: (lang: LanguageType) => void;
}

const useLanguageStore = create<LangagueStoreState>()(
  persist(
    (set) => ({
      lang: 'en',
      setLanguage: (lang) => set(() => ({ lang })),
    }),
    {
      name: 'language-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

export default useLanguageStore;
