import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('kitobhon_lang') || 'uz'
  })

  useEffect(() => {
    localStorage.setItem('kitobhon_lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = (key) => {
    const dict = translations[lang] || translations.uz
    return dict[key] || translations.uz[key] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
