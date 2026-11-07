import { Car, MapTrifold, PawPrint, Rows, SlidersHorizontal, Waves, X } from '@phosphor-icons/react'
import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { MapPunta } from '../components/MapPunta'
import { PeriodSelector, UnitCard } from '../components/units'
import { Button, Stepper, Toggle, cx } from '../components/ui'
import { BUILDINGS, BUILDING_BY_ID, ZONES, ZONE_NAME, type Unit, type ZoneId } from '../lib/data'
import { minPrice, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { isAvailable, isPeriodId, PERIOD_BY_ID, type PeriodId } from '../lib/periods'
import { useStore } from '../lib/store'

type Filters = {
  zonas: ZoneId[]
  edificio: string
  periodo: PeriodId | null
  min: number
  max: number
  dorm: number
  banos: number
  huespedes: number
  pet: boolean
  garage: boolean
  mar: boolean
  canal: 'todos' | 'owner' | 'agency'
  orden: 'recomendados' | 'precio-asc' | 'precio-desc'
  disponibles: boolean
}

const PRICE_FLOOR = 0

function read(sp: URLSearchParams, ceiling: number): Filters {
  const zonas = (sp.get('zona') ?? '').split(',').filter((z): z is ZoneId => ZONES.some((x) => x.id === z))
  const periodo = sp.get('periodo')
  return {
    zonas,
    edificio: BUILDING_BY_ID[sp.get('edificio') ?? ''] ? sp.get('edificio')! : '',
    periodo: isPeriodId(periodo) ? periodo : null,
    min: Math.max(PRICE_FLOOR, Number(sp.get('min')) || PRICE_FLOOR),
    max: Math.min(ceiling, Number(sp.get('max')) || ceiling),
    dorm: Number(sp.get('dorm')) || 0,
    banos: Number(sp.get('banos')) || 0,
    huespedes: Number(sp.get('huespedes')) || 0,
    pet: sp.get('pet') === '1',
    garage: sp.get('garage') === '1',
    mar: sp.get('mar') === '1',
    canal: sp.get('canal') === 'owner' || sp.get('canal') === 'agency' ? (sp.get('canal') as 'owner' | 'agency') : 'todos',
    orden: sp.get('orden') === 'precio-asc' || sp.get('orden') === 'precio-desc' ? (sp.get('orden') as Filters['orden']) : 'recomendados',
    disponibles: sp.get('disponibles') !== '0',
  }
}

function write(f: Filters, ceiling: number) {
  const q = new URLSearchParams()
  if (f.zonas.length) q.set('zona', f.zonas.join(','))
  if (f.edificio) q.set('edificio', f.edificio)
  if (f.periodo) q.set('periodo', f.periodo)
  if (f.min > PRICE_FLOOR) q.set('min', String(f.min))
  if (f.max < ceiling) q.set('max', String(f.max))
  if (f.dorm) q.set('dorm', String(f.dorm))
  if (f.banos) q.set('banos', String(f.banos))
  if (f.huespedes) q.set('huespedes', String(f.huespedes))
  if (f.pet) q.set('pet', '1')
  if (f.garage) q.set('garage', '1')
  if (f.mar) q.set('mar', '1')
  if (f.canal !== 'todos') q.set('canal', f.canal)
  if (f.orden !== 'recomendados') q.set('orden', f.orden)
  if (!f.disponibles) q.set('disponibles', '0')
  return q
}

const priceOf = (u: Unit, p: PeriodId | null) => (p ? u.prices[p] : minPrice(u.prices))

function FilterPanel({ f, set, ceiling, resultCount }: { f: Filters; set: (p: Partial<Filters>) => void; ceiling: number; resultCount: number }) {
  const { t, lang } = useLang()
  const step = ceiling > 10000 ? 500 : 100
  const pct = (n: number) => ((n - PRICE_FLOOR) / (ceiling - PRICE_FLOOR)) * 100
  const h = 'text-[0.9375rem] font-semibold'
  return (
    <div className="flex flex-col divide-y divide-line">
      <section className="flex flex-col gap-3 pb-6">
        <h3 className={h}>{t('Zona', 'Bairro')}</h3>
        <div className="flex flex-wrap gap-2">
          {ZONES.map((z) => (
            <Toggle key={z.id} checked={f.zonas.includes(z.id)} onChange={(v) => set({ zonas: v ? [...f.zonas, z.id] : f.zonas.filter((x) => x !== z.id), edificio: '' })}>
              {z.name}
            </Toggle>
          ))}
        </div>
        <label className="mt-2 flex flex-col gap-1.5">
          <span className="text-[0.8125rem] font-medium text-mute">{t('Edificio VIP', 'Edifício VIP')}</span>
          <select className="field" value={f.edificio} onChange={(e) => set({ edificio: e.target.value })}>
            <option value="">{t('Todos los edificios', 'Todos os edifícios')}</option>
            {BUILDINGS.filter((b) => !f.zonas.length || f.zonas.includes(b.zone)).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · {ZONE_NAME[b.zone]}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="flex flex-col gap-3 py-6">
        <h3 className={h}>{t('Período', 'Período')}</h3>
        <PeriodSelector value={f.periodo} onChange={(p) => set({ periodo: p })} allowAny name="f-periodo" />
        {f.periodo && (
          <label className="mt-1 inline-flex items-center gap-2 text-[0.875rem]">
            <input type="checkbox" className="size-4 accent-[var(--color-ink)]" checked={f.disponibles} onChange={(e) => set({ disponibles: e.target.checked })} />
            {t('Mostrar solo unidades disponibles', 'Mostrar só unidades disponíveis')}
          </label>
        )}
      </section>

      <section className="flex flex-col gap-3 py-6">
        <div className="flex items-baseline justify-between">
          <h3 className={h}>{t('Precio en USD', 'Preço em USD')}</h3>
          <span className="text-[0.75rem] text-mute">{f.periodo ? PERIOD_BY_ID[f.periodo].short[lang] : t('por quincena', 'por quinzena')}</span>
        </div>
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-line" />
          <div className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-ink" style={{ left: `${pct(f.min)}%`, right: `${100 - pct(f.max)}%` }} />
          <input
            type="range"
            className="range absolute inset-0"
            min={PRICE_FLOOR}
            max={ceiling}
            step={step}
            value={f.min}
            aria-label={t('Precio mínimo', 'Preço mínimo')}
            aria-valuetext={usd(f.min, lang)}
            onChange={(e) => set({ min: Math.min(Number(e.target.value), f.max - step) })}
          />
          <input
            type="range"
            className="range absolute inset-0"
            min={PRICE_FLOOR}
            max={ceiling}
            step={step}
            value={f.max}
            aria-label={t('Precio máximo', 'Preço máximo')}
            aria-valuetext={usd(f.max, lang)}
            onChange={(e) => set({ max: Math.max(Number(e.target.value), f.min + step) })}
          />
        </div>
        <div className="f-num flex justify-between text-[0.875rem]">
          <span>{usd(f.min, lang)}</span>
          <span>
            {usd(f.max, lang)}
            {f.max >= ceiling ? '+' : ''}
          </span>
        </div>
      </section>

      <section className="flex flex-col py-4">
        <h3 className={cx(h, 'pt-2 pb-1')}>{t('Distribución', 'Distribuição')}</h3>
        <Stepper label={t('Dormitorios (mín.)', 'Quartos (mín.)')} value={f.dorm} max={5} onChange={(n) => set({ dorm: n })} suffix={t('Todos', 'Todos')} />
        <Stepper label={t('Baños (mín.)', 'Banheiros (mín.)')} value={f.banos} max={5} onChange={(n) => set({ banos: n })} suffix={t('Todos', 'Todos')} />
        <Stepper label={t('Huéspedes', 'Hóspedes')} value={f.huespedes} max={10} onChange={(n) => set({ huespedes: n })} suffix={t('Todos', 'Todos')} />
      </section>

      <section className="flex flex-col gap-3 py-6">
        <h3 className={h}>{t('Confort', 'Conforto')}</h3>
        <div className="flex flex-wrap gap-2">
          <Toggle checked={f.mar} onChange={(v) => set({ mar: v })} icon={<Waves size={16} />}>
            {t('Vista al mar', 'Vista para o mar')}
          </Toggle>
          <Toggle checked={f.garage} onChange={(v) => set({ garage: v })} icon={<Car size={16} />}>
            {t('Garage', 'Garagem')}
          </Toggle>
          <Toggle checked={f.pet} onChange={(v) => set({ pet: v })} icon={<PawPrint size={16} />}>
            Pet friendly
          </Toggle>
        </div>
      </section>

      <section className="flex flex-col gap-3 pt-6">
        <h3 className={h}>{t('Publicado por', 'Publicado por')}</h3>
        <div className="grid grid-cols-3 gap-1 rounded-full bg-mist p-1" role="radiogroup" aria-label={t('Publicado por', 'Publicado por')}>
          {(
            [
              ['todos', t('Todos', 'Todos')],
              ['owner', t('Dueño', 'Dono')],
              ['agency', t('Inmobiliaria', 'Imobiliária')],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={f.canal === v}
              onClick={() => set({ canal: v })}
              className={cx('min-h-10 rounded-full px-2 text-[0.8125rem] font-medium transition-colors duration-200', f.canal === v ? 'bg-bg text-ink shadow-[var(--shadow-float)]' : 'text-mute hover:text-ink')}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {resultCount} {t('resultados', 'resultados')}
        </p>
      </section>
    </div>
  )
}

export default function Results() {
  const { t, lang } = useLang()
  const { units } = useStore()
  const [sp, setSp] = useSearchParams()
  const [view, setView] = useState<'list' | 'map'>('list')
  const [hover, setHover] = useState<string | null>(null)
  const sheet = useRef<HTMLDialogElement>(null)

  const periodParam = sp.get('periodo')
  const ceiling = useMemo(() => {
    const p = isPeriodId(periodParam) ? periodParam : null
    const max = Math.max(...units.map((u) => priceOf(u, p) ?? 0))
    return Math.ceil(max / 1000) * 1000
  }, [units, periodParam])

  const f = read(sp, ceiling)
  const set = (patch: Partial<Filters>) => {
    const next = { ...f, ...patch }
    if ('periodo' in patch) {
      next.min = PRICE_FLOOR
      next.max = Number.MAX_SAFE_INTEGER
    }
    setSp(write(next, 'periodo' in patch ? Number.MAX_SAFE_INTEGER : ceiling), { replace: true, preventScrollReset: true })
  }
  const reset = () => setSp(new URLSearchParams(), { replace: true })

  const results = useMemo(() => {
    const list = units.filter((u) => {
      const b = BUILDING_BY_ID[u.buildingId]
      if (f.zonas.length && !f.zonas.includes(b.zone)) return false
      if (f.edificio && u.buildingId !== f.edificio) return false
      if (f.periodo) {
        if (u.prices[f.periodo] === undefined) return false
        if (f.disponibles && !isAvailable(f.periodo, u.booked)) return false
      }
      const price = priceOf(u, f.periodo) ?? 0
      if (price < f.min || price > f.max) return false
      if (u.bedrooms < f.dorm || u.baths < f.banos || u.guests < f.huespedes) return false
      if (f.pet && !u.pet) return false
      if (f.garage && !u.garage) return false
      if (f.mar && !u.seaView) return false
      if (f.canal !== 'todos' && u.channel.type !== f.canal) return false
      return true
    })
    if (f.orden === 'precio-asc') list.sort((a, b) => (priceOf(a, f.periodo) ?? 0) - (priceOf(b, f.periodo) ?? 0))
    if (f.orden === 'precio-desc') list.sort((a, b) => (priceOf(b, f.periodo) ?? 0) - (priceOf(a, f.periodo) ?? 0))
    return list
  }, [units, f.zonas, f.edificio, f.periodo, f.disponibles, f.min, f.max, f.dorm, f.banos, f.huespedes, f.pet, f.garage, f.mar, f.canal, f.orden])

  const activeCount =
    f.zonas.length + (f.edificio ? 1 : 0) + (f.periodo ? 1 : 0) + (f.min > PRICE_FLOOR || f.max < ceiling ? 1 : 0) + (f.dorm ? 1 : 0) + (f.banos ? 1 : 0) + (f.huespedes ? 1 : 0) + (f.pet ? 1 : 0) + (f.garage ? 1 : 0) + (f.mar ? 1 : 0) + (f.canal !== 'todos' ? 1 : 0)

  const pins = BUILDINGS.map((b) => ({ id: b.id, x: b.map.x, y: b.map.y, label: b.name, sub: ZONE_NAME[b.zone], count: results.filter((u) => u.buildingId === b.id).length })).filter((p) => p.count > 0)

  const title = f.edificio ? BUILDING_BY_ID[f.edificio].name : f.zonas.length === 1 ? ZONE_NAME[f.zonas[0]] : 'Punta del Este'

  const map = (
    <div className="bezel">
      <div className="bg-bg">
        <MapPunta pins={pins} activeId={hover ?? (f.edificio || null)} onSelect={(id) => set({ edificio: f.edificio === id ? '' : id })} onHover={setHover} className="h-auto w-full" />
        <p className="px-4 py-3 text-[0.8125rem] text-mute">{t('Tocá un edificio para filtrar sus unidades. Mapa ilustrativo, no a escala.', 'Toque um edifício para filtrar suas unidades. Mapa ilustrativo, sem escala.')}</p>
      </div>
    </div>
  )

  return (
    <div className="pt-28 pb-24 md:pt-32">
      <div className="shell">
        <header className="flex flex-col gap-6 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="f-h2 text-[clamp(1.9rem,3.6vw,3rem)]">{title}</h1>
            <p className="text-mute" aria-live="polite">
              {results.length} {results.length === 1 ? t('unidad', 'unidade') : t('unidades', 'unidades')}
              {f.periodo ? ` · ${PERIOD_BY_ID[f.periodo].name[lang]}` : ` · ${t('temporada 2026 – 2027', 'temporada 2026 – 2027')}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => sheet.current?.showModal()}>
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal size={16} />
                {t('Filtros', 'Filtros')}
                {activeCount > 0 && <span className="f-num rounded-full bg-ink px-1.5 text-[0.75rem] text-on-ink">{activeCount}</span>}
              </span>
            </Button>
            <div className="flex rounded-full bg-mist p-1 xl:hidden" role="group" aria-label={t('Vista', 'Visualização')}>
              {(
                [
                  ['list', <Rows key="l" size={16} />, t('Lista', 'Lista')],
                  ['map', <MapTrifold key="m" size={16} />, t('Mapa', 'Mapa')],
                ] as const
              ).map(([v, icon, l]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={cx('inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium transition-colors', view === v ? 'bg-bg shadow-[var(--shadow-float)]' : 'text-mute')}
                >
                  {icon}
                  <span className="max-sm:sr-only">{l}</span>
                </button>
              ))}
            </div>
            <label className="sr-only" htmlFor="orden">
              {t('Ordenar', 'Ordenar')}
            </label>
            <select id="orden" className="field min-h-10 w-auto py-1.5 text-[0.875rem]" value={f.orden} onChange={(e) => set({ orden: e.target.value as Filters['orden'] })}>
              <option value="recomendados">{t('Recomendados', 'Recomendados')}</option>
              <option value="precio-asc">{t('Menor precio', 'Menor preço')}</option>
              <option value="precio-desc">{t('Mayor precio', 'Maior preço')}</option>
            </select>
          </div>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)_25rem]">
          <aside className="hidden lg:block" aria-label={t('Filtros', 'Filtros')}>
            <div className="sticky top-28 flex max-h-[calc(100dvh-8rem)] flex-col gap-4 overflow-y-auto pr-2">
              <div className="flex items-center justify-between">
                <h2 className="f-h3 text-[1.125rem]">{t('Filtros', 'Filtros')}</h2>
                {activeCount > 0 && (
                  <button type="button" onClick={reset} className="text-[0.875rem] font-medium text-marine-strong underline-offset-4 hover:underline">
                    {t('Limpiar', 'Limpar')}
                  </button>
                )}
              </div>
              <FilterPanel f={f} set={set} ceiling={ceiling} resultCount={results.length} />
            </div>
          </aside>

          <section aria-label={t('Resultados', 'Resultados')} className={cx(view === 'map' && 'max-xl:hidden')}>
            {results.length ? (
              <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 2xl:grid-cols-3">
                {results.map((u) => (
                  <li key={u.id}>
                    <UnitCard u={u} period={f.periodo} highlight={hover === u.buildingId} onHover={setHover} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-start gap-5 rounded-[18px] bg-mist p-8 md:p-12">
                <h2 className="f-h3 text-[1.375rem]">{t('Ninguna unidad coincide con todos los filtros.', 'Nenhuma unidade corresponde a todos os filtros.')}</h2>
                <p className="max-w-[48ch] text-mute">
                  {f.periodo
                    ? t(
                        'Las quincenas de enero son las primeras en reservarse. Probá con febrero o con el mes completo, o ampliá la zona.',
                        'As quinzenas de janeiro são as primeiras a serem reservadas. Tente fevereiro ou o mês inteiro, ou amplie o bairro.',
                      )
                    : t('Probá quitando algún filtro de confort o ampliando el rango de precio.', 'Tente remover algum filtro de conforto ou ampliar a faixa de preço.')}
                </p>
                <Button variant="ink" onClick={reset}>
                  {t('Ver todas las unidades', 'Ver todas as unidades')}
                </Button>
              </div>
            )}
          </section>

          <aside className={cx('xl:block', view === 'map' ? 'block' : 'hidden')} aria-label={t('Mapa', 'Mapa')}>
            <div className="sticky top-28">{map}</div>
          </aside>
        </div>
      </div>

      <dialog
        ref={sheet}
        className="m-0 mt-auto h-[92dvh] max-h-none w-full max-w-none rounded-t-[24px] bg-bg p-0 text-ink backdrop:bg-ink/50 backdrop:backdrop-blur-sm lg:hidden"
        aria-label={t('Filtros', 'Filtros')}
        onClick={(e) => e.target === e.currentTarget && sheet.current?.close()}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="f-h3 text-[1.125rem]">{t('Filtros', 'Filtros')}</h2>
            <button type="button" onClick={() => sheet.current?.close()} aria-label={t('Cerrar', 'Fechar')} className="flex size-10 items-center justify-center rounded-full hover:bg-mist">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <FilterPanel f={f} set={set} ceiling={ceiling} resultCount={results.length} />
          </div>
          <div className="flex items-center gap-3 border-t border-line px-5 py-4">
            <Button variant="ghost" onClick={reset} disabled={!activeCount}>
              {t('Limpiar', 'Limpar')}
            </Button>
            <Button className="flex-1" onClick={() => sheet.current?.close()}>
              {t(`Ver ${results.length} unidades`, `Ver ${results.length} unidades`)}
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
