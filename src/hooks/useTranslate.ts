import { useCallback, useState } from 'react';
import type { Language } from '@/types/chat';
import { t, TranslationKey } from '@/lib/i18n';

export function useTranslate(initialLanguage: Language = 'en') {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  const translate = useCallback(
    (key: TranslationKey): string => {
      return t(key, language);
    },
    [language],
  );

  return {
    translate,
    language,
    setLanguage,
  };
}
