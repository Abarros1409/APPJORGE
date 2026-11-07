import { MagnifyingGlass } from '@phosphor-icons/react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { BUILDINGS, ZONES } from '../lib/data'
import { useLang } from '../lib/i18n'
import { PERIODS, type PeriodId } from '../lib/periods'
import { Button, cx } from './ui'

export function HeroSearch({ className }: { className?: string }) {
  const { t, lang } = useLang()
  const nav = useNavigate()
  const [dest, setDest] = useState('')
  const [period, setPeriod] = useState<PeriodId | ''>('')
  const [guests, setGuests] = useState('2')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams()
    if (dest.startsWith('z:')) q.set('zona', dest.slice(2))
    if (dest.startsWith('b:')) q.set('edificio', dest.slice(2))
    if (period) q.set('periodo', period)
    if (+guests > 1) q.set('huespedes', guests)
    nav(`/buscar${q.size ? `?${q}` : ''}`)
  }

  const label = 'text-[0.75rem] font-semibold text-mute'
  const sel = 'select-caret w-full appearance-none bg-transparent pr-6 text-[0.9875rem] font-medium text-ink outline-none'
  return (
    <form onSubmit={submit} className={cx('bezel bezel-ink', className)} role="search" aria-label={t('Buscar unidades', 'Buscar unidades')}>
      <div className="grid grid-cols-[1.4fr_1fr] gap-px overflow-hidden bg-line lg:grid-cols-[1.3fr_1.2fr_0.7fr_auto]">
        <label className="col-span-2 flex flex-col gap-0.5 bg-bg px-5 py-3.5 focus-within:bg-mist has-[:focus-visible]:shadow-[inset_0_0_0_2px_var(--color-marine-strong)] lg:col-span-1">
          <span className={label}>{t('Zona o edificio', 'Bairro ou edifício')}</span>
          <select value={dest} onChange={(e) => setDest(e.target.value)} className={sel}>
            <option value="">{t('Todo Punta del Este', 'Toda Punta del Este')}</option>
            <optgroup label={t('Zonas', 'Bairros')}>
              {ZONES.map((z) => (
                <option key={z.id} value={`z:${z.id}`}>
                  {z.name}
                </option>
              ))}
            </optgroup>
            <optgroup label={t('Edificios VIP', 'Edifícios VIP')}>
              {BUILDINGS.map((b) => (
                <option key={b.id} value={`b:${b.id}`}>
                  {b.name}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className="flex flex-col gap-0.5 bg-bg px-5 py-3.5 focus-within:bg-mist has-[:focus-visible]:shadow-[inset_0_0_0_2px_var(--color-marine-strong)]">
          <span className={label}>{t('Período', 'Período')}</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value as PeriodId | '')} className={sel}>
            <option value="">{t('Cualquier período', 'Qualquer período')}</option>
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name[lang]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5 bg-bg px-5 py-3.5 focus-within:bg-mist has-[:focus-visible]:shadow-[inset_0_0_0_2px_var(--color-marine-strong)]">
          <span className={label}>{t('Huéspedes', 'Hóspedes')}</span>
          <select value={guests} onChange={(e) => setGuests(e.target.value)} className={sel}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n === 8 ? '8+' : n}
              </option>
            ))}
          </select>
        </label>
        <div className="col-span-2 flex items-center bg-bg p-2.5 lg:col-span-1">
          <Button type="submit" size="lg" className="w-full lg:w-auto" trailing={<MagnifyingGlass size={16} />}>
            {t('Buscar', 'Buscar')}
          </Button>
        </div>
      </div>
    </form>
  )
}
