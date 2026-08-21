import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
// 🌟 အစ်ကို့ရဲ့ mmkvStorage ဖိုင်လမ်းကြောင်းကို အတိအကျ ပြင်ပေးပါ
import mmkvStorage from '@/store/mmkvStorage';

import en from './en';
import my from './my';
import th from './th';

// 🌟 ၁။ MMKV ထဲမှ မှတ်ထားသော ဘာသာစကားကို ဆွဲထုတ်ခြင်း
let savedLanguage = 'en'; // ပုံသေ အင်္ဂလိပ်
try {
  const storeData = mmkvStorage.getItem('language-store');
  
  // 🌟 အဓိက ဖြေရှင်းချက်: TypeScript Error မတက်စေရန် typeof ဖြင့် string အစစ်ဖြစ်ကြောင်း စစ်ပေးခြင်း
  if (typeof storeData === 'string') {
    const parsed = JSON.parse(storeData);
    if (parsed?.state?.lang) {
      savedLanguage = parsed.state.lang; 
    }
  }
} catch (error) {
  console.error("MMKV မှ ဘာသာစကား ဖတ်ယူခြင်း ကျရှုံးပါသည်:", error);
}

const resources = {
  en: { translation: en },
  my: { translation: my },
  th: { translation: th },
};

if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage, // 🌟 ၂။ MMKV မှ ရလာသော ဘာသာစကားဖြင့် App ကို စတင်ပါမည်
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
      compatibilityJSON: 'v4',
    });
}

export type LanguageType = 'my' | 'en' | 'th';

const translations = { en, my, th };

export const getTranslation = (lang: LanguageType) => {
   return translations[lang as keyof typeof translations] || en;
};

export default i18next;