import type { Lang } from './i18n'
import { PERIOD_BY_ID, type PeriodId } from './periods'
import type { Prices } from './data'

export function usd(n: number, lang: Lang = 'es') {
  const s = new Intl.NumberFormat(lang === 'es' ? 'es-UY' : 'pt-BR', { maximumFractionDigits: 0 }).format(n)
  return `USD ${s}`
}

export function minPrice(prices: Prices) {
  const quincenas = (['ene1', 'ene2', 'feb1', 'feb2'] as PeriodId[]).map((p) => prices[p]).filter((n): n is number => typeof n === 'number')
  const all = quincenas.length ? quincenas : Object.values(prices).filter((n): n is number => typeof n === 'number')
  return all.length ? Math.min(...all) : 0
}

export function dateRange(p: PeriodId, lang: Lang) {
  const { start, end } = PERIOD_BY_ID[p]
  const f = new Intl.DateTimeFormat(lang === 'es' ? 'es-UY' : 'pt-BR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  return `${f.format(new Date(start))} – ${f.format(new Date(end))}`
}

export function longDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-UY' : 'pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export function dateTime(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-UY' : 'pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export function inquiryCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  const rnd = crypto.getRandomValues(new Uint32Array(6))
  for (const n of rnd) s += alphabet[n % alphabet.length]
  return `C-${s}`
}

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}
