import useLanguageStore from "@/store/useLanguageStore";
import { getTranslation } from "@/constants/translation/i18n";

const useTranslation = () => {
  const lang = useLanguageStore((state) => state.lang);
  const t = getTranslation(lang);

  return { t, lang };
};

export default useTranslation;