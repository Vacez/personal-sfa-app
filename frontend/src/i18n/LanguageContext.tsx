import React, { createContext, useContext, useEffect, useState } from 'react';
import { id } from './id';
import { ja } from './ja';
import { Language, TranslationDictionary } from './types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString?: string | null) => string;
}

const STORAGE_KEY = 'personal_sfa_language_pref';

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedLang = window.localStorage.getItem(STORAGE_KEY);
        if (savedLang === 'id' || savedLang === 'ja') {
          setLanguageState(savedLang);
        }
      }
    } catch (e) {
      // Ignore storage errors on non-web environments
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, lang);
      }
    } catch (e) {
      // Ignore
    }
  };

  const t = language === 'ja' ? ja : id;

  const formatCurrency = (amount: number) => {
    const rounded = Math.round(amount || 0);
    const locale = language === 'ja' ? 'ja-JP' : 'id-ID';
    return `¥${rounded.toLocaleString(locale)}`;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return language === 'ja' ? '未設定' : 'Belum tercatat';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const locale = language === 'ja' ? 'ja-JP' : 'id-ID';
      return d.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
