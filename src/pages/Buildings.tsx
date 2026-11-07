import { Check, MapPin, ArrowUpRight, Minus } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { BuildingVisual, UnitCard } from '../components/units'
import { ButtonLink, Seal, Stars, Toggle } from '../components/ui'
import { AMENITIES, BUILDINGS, BUILDING_BY_ID, ZONES, ZONE_NAME, type AmenityId, type ZoneId } from '../lib/data'
import { longDate } from '../lib/format'
import { useLang } from '../lib/i18n'
import { useStore } from '../lib/store'
import NotFound from './NotFound'

export function BuildingsIndex() {
  const { t, lang } = useLang()
  const { units } = useStore()
  const [zones, setZones] = useState<ZoneId[]>([])
  const list = BUILDINGS.filter((b) => !zones.length || zones.includes(b.zone))
  return (
    <div className="pt-28 pb-24 md:pt-36">
      <div className="shell flex flex-col gap-10">
        <header className="flex flex-col gap-5">
          <Seal className="self-start" />
          <h1 className="f-display max-w-[18ch] text-[clamp(2.4rem,5.5vw,4.5rem)]">{t('Edificios certificados por EVP', 'Edifícios certificados pela EVP')}</h1>
          <p className="prose-evp text-[1.0625rem] text-mute">
            {t(
              'Cada torre fue relevada por nuestro equipo. Verificamos sus amenities, su seguridad y su estado de mantenimiento antes de aceptar una sola unidad.',
              'Cada torre foi vistoriada pela nossa equipe. Verificamos amenities, segurança e estado de conservação antes de aceitar uma única unidade.',
            )}
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('Filtrar por zona', 'Filtrar por bairro')}>
            {ZONES.map((z) => (
              <Toggle key={z.id} checked={zones.includes(z.id)} onChange={(v) => setZones(v ? [...zones, z.id] : zones.filter((x) => x !== z.id))}>
                {z.name}
              </Toggle>
            ))}
          </div>
        </header>
        <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b, i) => {
            const n = units.filter((u) => u.buildingId === b.id).length
            return (
              <li key={b.id} className={i % 3 === 1 ? 'lg:translate-y-12' : ''}>
                <Link to={`/edificios/${b.id}`} viewTransition className="group flex flex-col gap-4">
                  <div className="bezel">
                    <div className="aspect-[4/5] overflow-hidden">
                      <BuildingVisual b={b} className="size-full transition-transform duration-[1100ms] ease-[var(--ease-out)] group-hover:scale-[1.04]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="f-h3 text-[1.1875rem]">{b.name}</h2>
                      <Stars n={b.stars} />
                    </div>
                    <p className="text-[0.9375rem] text-mute">{b.tagline[lang]}</p>
                    <p className="f-num mt-1 text-[0.8125rem] text-mute">
                      {ZONE_NAME[b.zone]} · {b.floors} {t('pisos', 'andares')} · {n} {n === 1 ? t('unidad', 'unidade') : t('unidades', 'unidades')}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export function BuildingPage() {
  const { id = '' } = useParams()
  const { t, lang } = useLang()
  const { units } = useStore()
  const b = BUILDING_BY_ID[id]
  if (!b) return <NotFound />
  const list = units.filter((u) => u.buildingId === b.id)
  const age = new Date().getFullYear() - b.year
  const facts: [string, React.ReactNode][] = [
    [t('Zona', 'Bairro'), ZONE_NAME[b.zone]],
    [t('Dirección', 'Endereço'), b.address],
    [t('Coordenadas', 'Coordenadas'), <span className="f-num">{b.lat.toFixed(4)}, {b.lng.toFixed(4)}</span>],
    [t('Año de construcción', 'Ano de construção'), <span className="f-num">{b.year} · {age} {age === 1 ? t('año', 'ano') : t('años', 'anos')}</span>],
    [t('Pisos', 'Andares'), <span className="f-num">{b.floors}</span>],
    [t('Unidades totales', 'Unidades totais'), <span className="f-num">{b.units}</span>],
    [t('Arquitectura', 'Arquitetura'), b.architects],
    [t('Categoría', 'Categoria'), <Stars n={b.stars} />],
  ]
  return (
    <div>
      <section className="on-ink relative isolate flex min-h-[78dvh] flex-col justify-end overflow-hidden bg-ink text-on-ink">
        <BuildingVisual b={b} className="absolute inset-0 -z-10 size-full" title={t(`Ilustración de ${b.name}`, `Ilustração de ${b.name}`)} />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.205_0.035_240/0.5)_0%,transparent_30%,transparent_45%,oklch(0.205_0.035_240/0.9)_100%)]" />
        <div className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,oklch(0.205_0.035_240/0.55)_0%,oklch(0.205_0.035_240/0.2)_40%,transparent_60%)] md:block" />
        <div className="shell flex flex-col gap-5 pt-36 pb-12 md:pb-16">
          <div className="flex flex-wrap items-center gap-3">
            <Seal tone="ink" />
            <span className="text-[0.875rem] text-on-ink-mute">
              {ZONE_NAME[b.zone]} · Punta del Este
            </span>
          </div>
          <h1 className="f-display text-[clamp(2.6rem,6.5vw,5.25rem)]">{b.name}</h1>
          <p className="max-w-[46ch] text-[1.1875rem] text-on-ink-mute">{b.tagline[lang]}</p>
        </div>
      </section>

      <section className="shell grid gap-14 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <div className="flex flex-col gap-8">
          <h2 className="f-h2 text-[clamp(1.7rem,3vw,2.5rem)]">{t('Ficha madre', 'Ficha técnica')}</h2>
          <p className="prose-evp text-[1.0625rem]">{b.description[lang]}</p>
          <dl className="grid grid-cols-1 border-t border-line sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1 border-b border-line py-4 sm:odd:pr-6">
                <dt className="text-[0.8125rem] text-mute">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 self-start text-[0.9375rem] font-medium text-marine-strong underline-offset-4 hover:underline"
          >
            <MapPin size={18} />
            {t('Ver ubicación exacta', 'Ver localização exata')}
            <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="flex flex-col gap-8">
          <div className="rounded-[22px] bg-mist p-6 md:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="f-h3 text-[1.25rem]">{t('Amenities verificados', 'Amenities verificados')}</h2>
              <span className="f-num text-[0.875rem] text-mute">
                {b.amenities.length}/{Object.keys(AMENITIES).length}
              </span>
            </div>
            <ul className="mt-5 grid gap-x-6 sm:grid-cols-2">
              {(Object.keys(AMENITIES) as AmenityId[]).map((a) => {
                const has = b.amenities.includes(a)
                return (
                  <li key={a} className={`flex items-center gap-2.5 border-b border-line py-2.5 text-[0.9375rem] ${has ? '' : 'text-mute'}`}>
                    {has ? <Check size={16} className="shrink-0 text-ok" weight="bold" aria-label={t('Disponible', 'Disponível')} /> : <Minus size={16} className="shrink-0" aria-label={t('No disponible', 'Indisponível')} />}
                    <span className={has ? '' : 'line-through decoration-line-strong'}>{AMENITIES[a][lang]}</span>
                  </li>
                )
              })}
            </ul>
            <p className="mt-5 text-[0.8125rem] text-mute">
              {t('Relevado y certificado por EVP el', 'Vistoriado e certificado pela EVP em')} {longDate(b.certifiedAt, lang)}.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <figure className="bezel">
              <div className="aspect-[4/3]">
                <BuildingVisual b={b} kind="pool" className="size-full" />
              </div>
            </figure>
            <figure className="bezel">
              <div className="aspect-[4/3]">
                <BuildingVisual b={b} kind="view" className="size-full" />
              </div>
            </figure>
            <figcaption className="col-span-2 text-[0.8125rem] text-mute">
              {t('Áreas comunes y vistas. Ilustraciones: las fotos profesionales las produce EVP en el relevamiento.', 'Áreas comuns e vistas. Ilustrações: as fotos profissionais são produzidas pela EVP na vistoria.')}
            </figcaption>
          </div>
        </div>
      </section>

      <section className="bg-mist py-20 md:py-28" aria-labelledby="units-title">
        <div className="shell flex flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="units-title" className="f-h2 text-[clamp(1.7rem,3vw,2.5rem)]">
              {list.length} {list.length === 1 ? t('unidad disponible', 'unidade disponível') : t('unidades disponibles', 'unidades disponíveis')}
            </h2>
            <ButtonLink to={`/buscar?edificio=${b.id}`} variant="outline" size="sm" trailing>
              {t('Filtrar por período', 'Filtrar por período')}
            </ButtonLink>
          </div>
          {list.length ? (
            <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((u) => (
                <li key={u.id}>
                  <UnitCard u={u} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-mute">{t('Todavía no hay unidades publicadas en este edificio.', 'Ainda não há unidades publicadas neste edifício.')}</p>
          )}
        </div>
      </section>
    </div>
  )
}
