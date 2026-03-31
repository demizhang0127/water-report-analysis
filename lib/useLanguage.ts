'use client';

import { useState, useEffect } from 'react';
import { translations } from './i18n';

export function useLanguage() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as 'en' | 'zh';
    if (saved) {
      setLang(saved);
    } else {
      // Default to English
      setLang('en');
    }
  }, []);

  const switchLanguage = (newLang: 'en' | 'zh') => {
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  return { lang, t: translations[lang], switchLanguage };
}
