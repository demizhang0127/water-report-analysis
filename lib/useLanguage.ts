'use client';

import { useState, useEffect } from 'react';
import { translations } from './i18n';

export function useLanguage() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    const saved = localStorage.getItem('language') as 'en' | 'zh';
    if (saved) {
      setLang(saved);
    }
    // Default is already 'en', no need to set again
  }, []);

  const switchLanguage = (newLang: 'en' | 'zh') => {
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  return { lang, t: translations[lang], switchLanguage };
}
