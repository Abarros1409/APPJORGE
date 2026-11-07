import type { L10n } from './i18n'

/**
 * EVP rents only fixed seasonal periods (never per night), per the legal
 * architecture in docs/contexto_maestro_evp.md §3. Season 2026–2027.
 */
export type PeriodId = 'dic' | 'ene1' | 'ene2' | 'ene' | 'feb1' | 'feb2' | 'feb' | 'temporada'

export type Period = {
  id: PeriodId
  name: L10n
  short: L10n
  /** inclusive ISO dates */
  start: string
  end: string
  kind: 'quincena' | 'mes' | 'temporada'
}

export const SEASON_LABEL = '2026 – 2027'

export const PERIODS: Period[] = [
  { id: 'dic', kind: 'mes', start: '2026-12-01', end: '2026-12-31', name: { es: 'Mes de diciembre', pt: 'Mês de dezembro' }, short: { es: 'Diciembre', pt: 'Dezembro' } },
  { id: 'ene1', kind: 'quincena', start: '2027-01-01', end: '2027-01-15', name: { es: '1ª quincena de enero', pt: '1ª quinzena de janeiro' }, short: { es: '1–15 ene', pt: '1–15 jan' } },
  { id: 'ene2', kind: 'quincena', start: '2027-01-16', end: '2027-01-31', name: { es: '2ª quincena de enero', pt: '2ª quinzena de janeiro' }, short: { es: '16–31 ene', pt: '16–31 jan' } },
  { id: 'ene', kind: 'mes', start: '2027-01-01', end: '2027-01-31', name: { es: 'Mes de enero', pt: 'Mês de janeiro' }, short: { es: 'Enero', pt: 'Janeiro' } },
  { id: 'feb1', kind: 'quincena', start: '2027-02-01', end: '2027-02-14', name: { es: '1ª quincena de febrero', pt: '1ª quinzena de fevereiro' }, short: { es: '1–14 feb', pt: '1–14 fev' } },
  { id: 'feb2', kind: 'quincena', start: '2027-02-15', end: '2027-02-28', name: { es: '2ª quincena de febrero', pt: '2ª quinzena de fevereiro' }, short: { es: '15–28 feb', pt: '15–28 fev' } },
  { id: 'feb', kind: 'mes', start: '2027-02-01', end: '2027-02-28', name: { es: 'Mes de febrero', pt: 'Mês de fevereiro' }, short: { es: 'Febrero', pt: 'Fevereiro' } },
  { id: 'temporada', kind: 'temporada', start: '2026-12-01', end: '2027-04-30', name: { es: 'Temporada completa (dic – abr)', pt: 'Temporada completa (dez – abr)' }, short: { es: 'Temporada', pt: 'Temporada' } },
]

export const PERIOD_BY_ID = Object.fromEntries(PERIODS.map((p) => [p.id, p])) as Record<PeriodId, Period>

export function isPeriodId(v: unknown): v is PeriodId {
  return typeof v === 'string' && v in PERIOD_BY_ID
}

export function overlaps(a: PeriodId, b: PeriodId) {
  const A = PERIOD_BY_ID[a]
  const B = PERIOD_BY_ID[b]
  return A.start <= B.end && B.start <= A.end
}

/** A period is available if it does not overlap any booked period. */
export function isAvailable(period: PeriodId, booked: PeriodId[]) {
  return !booked.some((b) => overlaps(period, b))
}

export function nights(p: PeriodId) {
  const { start, end } = PERIOD_BY_ID[p]
  return Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1
}

/** Groups used in the selector UI. */
export const PERIOD_GROUPS: { label: L10n; ids: PeriodId[] }[] = [
  { label: { es: 'Enero', pt: 'Janeiro' }, ids: ['ene1', 'ene2', 'ene'] },
  { label: { es: 'Febrero', pt: 'Fevereiro' }, ids: ['feb1', 'feb2', 'feb'] },
  { label: { es: 'Diciembre y temporada', pt: 'Dezembro e temporada' }, ids: ['dic', 'temporada'] },
]
