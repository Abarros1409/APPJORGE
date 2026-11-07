import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'es' | 'pt'

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  /** Pick the string for the active language. */
  t: (es: string, pt: string) => string
}

const LangContext = createContext<Ctx | null>(null)

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('evp:lang')
    if (saved === 'es' || saved === 'pt') return saved
  } catch {
    /* storage unavailable */
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('pt')) return 'pt'
  return 'es'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('evp:lang', l)
    } catch {
      /* storage unavailable */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'es' ? 'es-UY' : 'pt-BR'
  }, [lang])

  const t = useCallback((es: string, pt: string) => (lang === 'es' ? es : pt), [lang])
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}

/** Bilingual literal stored in data. */
export type L10n = { es: string; pt: string }
