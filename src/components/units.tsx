import { Bathtub, Bed, Car, Heart, PawPrint, Users, Waves, ArrowsOutSimple } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { ArchScene } from './ArchScene'
import { ChannelTag, cx } from './ui'
import { BUILDING_BY_ID, ZONE_NAME, type Building, type Unit } from '../lib/data'
import { breakdown, GUEST_FEE_RATE, minPrice, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { isAvailable, PERIOD_BY_ID, PERIOD_GROUPS, type PeriodId } from '../lib/periods'
import { useStore } from '../lib/store'

export function BuildingVisual({ b, className, kind = 'facade', lit, title }: { b: Building; className?: string; kind?: 'facade' | 'view' | 'pool'; lit?: boolean; title?: string }) {
  return <ArchScene shape={b.scene.shape} time={b.scene.time} seed={b.scene.seed} kind={kind} className={className} lit={lit} title={title} />
}

export function UnitVisual({ u, className, index = 0 }: { u: Unit; className?: string; index?: number }) {
  const b = BUILDING_BY_ID[u.buildingId]
  if (u.photos?.length) {
    return <img src={u.photos[index % u.photos.length]} alt="" className={cx('object-cover', className)} loading="lazy" decoding="async" />
  }
  const time = (['golden', 'day', 'dusk', 'night', 'dawn'] as const)[(b.scene.seed + Number(u.id.replace(/\D/g, '') || 0)) % 5]
  return <ArchScene shape={b.scene.shape} time={index === 0 ? time : b.scene.time} seed={b.scene.seed + index} kind={index === 0 ? 'facade' : index === 1 ? 'view' : 'pool'} className={className} />
}

export function Specs({ u, compact }: { u: Unit; compact?: boolean }) {
  const { t } = useLang()
  const items = [
    { icon: <Bed size={18} weight="light" />, text: `${u.bedrooms} ${u.bedrooms === 1 ? t('dorm.', 'quarto') : t('dorms.', 'quartos')}` },
    { icon: <Bathtub size={18} weight="light" />, text: `${u.baths} ${u.baths === 1 ? t('baño', 'banh.') : t('baños', 'banh.')}` },
    { icon: <Users size={18} weight="light" />, text: `${t('hasta', 'até')} ${u.guests}` },
    ...(compact ? [] : [{ icon: <ArrowsOutSimple size={18} weight="light" />, text: `${u.m2} m²` }]),
  ]
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.875rem] text-mute">
      {items.map((i, k) => (
        <li key={k} className="f-num inline-flex items-center gap-1.5">
          <span aria-hidden className="text-ink">{i.icon}</span>
          {i.text}
        </li>
      ))}
    </ul>
  )
}

export function Features({ u, className }: { u: Unit; className?: string }) {
  const { t } = useLang()
  const f = [
    u.seaView && { icon: <Waves size={16} weight="light" />, label: t('Vista al mar', 'Vista para o mar') },
    u.garage && { icon: <Car size={16} weight="light" />, label: t('Garage', 'Garagem') },
    u.pet && { icon: <PawPrint size={16} weight="light" />, label: 'Pet friendly' },
  ].filter(Boolean) as { icon: React.ReactNode; label: string }[]
  if (!f.length) return null
  return (
    <ul className={cx('flex flex-wrap gap-1.5', className)}>
      {f.map((x) => (
        <li key={x.label} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-[0.75rem] font-medium text-ink">
          <span aria-hidden>{x.icon}</span>
          {x.label}
        </li>
      ))}
    </ul>
  )
}

export function FavoriteButton({ unitId, className }: { unitId: string; className?: string }) {
  const { favorites, toggleFavorite } = useStore()
  const { t } = useLang()
  const on = favorites.includes(unitId)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(unitId)
      }}
      aria-pressed={on}
      aria-label={on ? t('Quitar de guardados', 'Remover dos salvos') : t('Guardar unidad', 'Salvar unidade')}
      className={cx(
        'flex size-10 items-center justify-center rounded-full bg-white/85 text-ink shadow-[0_6px_18px_-8px_oklch(0.205_0.035_240/0.5)] backdrop-blur transition-transform duration-300 ease-[var(--ease-fluid)] hover:scale-105 active:scale-95',
        className,
      )}
    >
      <Heart size={18} weight={on ? 'fill' : 'regular'} className={on ? 'text-[oklch(0.6_0.17_25)]' : ''} />
    </button>
  )
}

export function UnitCard({ u, period, highlight, onHover }: { u: Unit; period?: PeriodId | null; highlight?: boolean; onHover?: (id: string | null) => void }) {
  const { t, lang } = useLang()
  const b = BUILDING_BY_ID[u.buildingId]
  const price = period ? u.prices[period] : undefined
  const available = period ? price !== undefined && isAvailable(period, u.booked) : true
  const href = `/unidades/${u.id}${period ? `?periodo=${period}` : ''}`
  return (
    <article
      className={cx('group/card relative flex flex-col gap-4', !available && 'opacity-70')}
      onMouseEnter={() => onHover?.(u.buildingId)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className={cx('bezel transition-shadow duration-300', highlight && 'shadow-[0_0_0_2px_var(--color-ocaso)]')}>
        <div className="relative aspect-[4/3] overflow-hidden bg-mist">
          <UnitVisual u={u} className="size-full transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover/card:scale-[1.035]" />
          <div className="pointer-events-none absolute inset-x-3 top-3 z-[2] flex items-start justify-between gap-2">
            <ChannelTag channel={u.channel} className="bg-white/90 backdrop-blur" />
            <FavoriteButton unitId={u.id} className="pointer-events-auto" />
          </div>
          {!available && (
            <span className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-3 py-1 text-[0.75rem] font-medium text-on-ink">
              {price === undefined ? t('No se ofrece en este período', 'Não oferecido neste período') : t('Reservado en este período', 'Reservado neste período')}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 px-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="f-h3 text-[1.0625rem]">
            <Link to={href} viewTransition className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {b.name}
            </Link>
          </h3>
          <span className="shrink-0 text-[0.8125rem] text-mute">{ZONE_NAME[b.zone]}</span>
        </div>
        <p className="-mt-1 text-[0.8125rem] text-mute">
          {t('Piso', 'Andar')} {u.floor} · {t('Unidad', 'Unidade')} {u.unit}
        </p>
        <Specs u={u} compact />
        <Features u={u} />
        <div className="mt-1 border-t border-line pt-3">
          {period && price !== undefined ? (
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="f-num text-[1.125rem] font-semibold">{usd(price, lang)}</span>
              <span className="text-[0.8125rem] text-mute">
                {PERIOD_BY_ID[period].short[lang]} · + {Math.round(GUEST_FEE_RATE * 100)}% {t('tarifa', 'taxa')}
              </span>
            </p>
          ) : (
            <p className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-[0.8125rem] text-mute">{t('desde', 'a partir de')}</span>
              <span className="f-num text-[1.125rem] font-semibold">{usd(minPrice(u.prices), lang)}</span>
              <span className="text-[0.8125rem] text-mute">/ {t('quincena', 'quinzena')}</span>
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

/** Fixed-period selector (no date picker — EVP rents only quincena / mes / temporada). */
export function PeriodSelector({
  value,
  onChange,
  unit,
  allowAny,
  name = 'periodo',
  tone = 'light',
}: {
  value: PeriodId | null
  onChange: (p: PeriodId | null) => void
  unit?: Unit
  allowAny?: boolean
  name?: string
  tone?: 'light' | 'ink'
}) {
  const { t, lang } = useLang()
  const ink = tone === 'ink'
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">{t('Período de alquiler', 'Período de aluguel')}</legend>
      {allowAny && (
        <Option
          ink={ink}
          name={name}
          checked={value === null}
          onSelect={() => onChange(null)}
          title={t('Cualquier período', 'Qualquer período')}
          sub={t('Ver todas las unidades', 'Ver todas as unidades')}
        />
      )}
      {PERIOD_GROUPS.map((g) => (
        <div key={g.label.es} className="flex flex-col gap-2">
          <p className={cx('text-[0.75rem] font-semibold', ink ? 'text-on-ink-mute' : 'text-mute')}>{g.label[lang]}</p>
          <div className={cx('grid gap-2', g.ids.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
            {g.ids.map((id) => {
              const p = PERIOD_BY_ID[id]
              const price = unit?.prices[id]
              const offered = !unit || price !== undefined
              const free = !unit || isAvailable(id, unit.booked)
              const disabled = !offered || !free
              return (
                <Option
                  key={id}
                  ink={ink}
                  name={name}
                  checked={value === id}
                  disabled={disabled}
                  onSelect={() => onChange(id)}
                  title={id === 'ene' || id === 'feb' || id === 'dic' ? t('Mes completo', 'Mês inteiro') : id === 'temporada' ? t('Temporada', 'Temporada') : p.short[lang]}
                  sub={
                    unit
                      ? !offered
                        ? t('No disponible', 'Indisponível')
                        : !free
                          ? t('Reservado', 'Reservado')
                          : usd(price!, lang)
                      : id === 'temporada'
                        ? t('dic – abr', 'dez – abr')
                        : id === 'dic'
                          ? t('1–31 dic', '1–31 dez')
                          : id === 'ene' || id === 'feb'
                            ? p.short[lang]
                            : p.kind === 'quincena'
                              ? t('Quincena', 'Quinzena')
                              : ''
                  }
                  strike={!!unit && offered && !free}
                />
              )
            })}
          </div>
        </div>
      ))}
    </fieldset>
  )
}

function Option({ name, checked, disabled, onSelect, title, sub, strike, ink }: { name: string; checked: boolean; disabled?: boolean; onSelect: () => void; title: string; sub?: string; strike?: boolean; ink: boolean }) {
  return (
    <label
      className={cx(
        'relative flex min-h-[3.75rem] flex-col justify-center rounded-[12px] px-3 py-2 ring-1 ring-inset transition-[background-color,box-shadow,color] duration-200 ease-[var(--ease-out)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2',
        ink ? 'has-[:focus-visible]:outline-ocaso' : 'has-[:focus-visible]:outline-marine-strong',
        disabled
          ? ink
            ? 'cursor-not-allowed text-on-ink-mute/60 ring-on-ink-line'
            : 'cursor-not-allowed bg-mist text-mute ring-line'
          : checked
            ? ink
              ? 'bg-on-ink text-ink ring-on-ink'
              : 'bg-ink text-on-ink ring-ink'
            : ink
              ? 'text-on-ink ring-on-ink/25 hover:ring-on-ink/60'
              : 'bg-bg ring-line-strong hover:ring-mute',
      )}
    >
      <input type="radio" name={name} className="sr-only" checked={checked} disabled={disabled} onChange={onSelect} />
      <span className="text-[0.875rem] leading-tight font-semibold">{title}</span>
      {sub && <span className={cx('f-num text-[0.75rem] leading-tight', checked ? 'opacity-80' : ink ? 'text-on-ink-mute' : 'text-mute', strike && 'line-through')}>{sub}</span>}
    </label>
  )
}

export function PriceBreakdown({ net, periodId, className }: { net: number; periodId: PeriodId; className?: string }) {
  const { t, lang } = useLang()
  const { fee, total } = breakdown(net)
  return (
    <div className={cx('flex flex-col gap-3', className)}>
    <dl className="flex flex-col gap-2.5 text-[0.9375rem]">
      <div className="flex justify-between gap-4">
        <dt>{t('Alquiler', 'Aluguel')} · {PERIOD_BY_ID[periodId].name[lang]}</dt>
        <dd className="f-num shrink-0">{usd(net, lang)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="flex flex-col">
          <span>{t('Tarifa de Gestión Digital y Garantía de Reserva VIP', 'Taxa de Gestão Digital e Garantia de Reserva VIP')}</span>
          <span className="text-[0.8125rem] text-mute">
            {Math.round(GUEST_FEE_RATE * 100)}% · {t('contrato, custodia del pago y soporte local', 'contrato, custódia do pagamento e suporte local')}
          </span>
        </dt>
        <dd className="f-num shrink-0">{usd(fee, lang)}</dd>
      </div>
      <div className="mt-1 flex justify-between gap-4 border-t border-line pt-3 text-[1.0625rem] font-semibold">
        <dt>{t('Total', 'Total')}</dt>
        <dd className="f-num">{usd(total, lang)}</dd>
      </div>
    </dl>
      <p className="text-[0.8125rem] text-mute">
        {t(
          'El propietario recibe el 100% del alquiler. EVP retiene el pago en custodia hasta 24–48 h después de tu check-in.',
          'O proprietário recebe 100% do aluguel. A EVP mantém o pagamento em custódia até 24–48 h após o seu check-in.',
        )}
      </p>
    </div>
  )
}
