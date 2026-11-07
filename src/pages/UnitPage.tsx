import { ArrowLeft, Check, FileText, ShieldCheck, ClipboardText, CalendarBlank } from '@phosphor-icons/react'
import { useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { FloorPlan } from '../components/FloorPlan'
import { ArchScene } from '../components/ArchScene'
import { Features, FavoriteButton, PeriodSelector, PriceBreakdown, Specs, UnitVisual } from '../components/units'
import { Button, ChannelTag, Seal, Stars, cx } from '../components/ui'
import { AMENITIES, BUILDING_BY_ID, ZONE_NAME } from '../lib/data'
import { breakdown, minPrice, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { isAvailable, isPeriodId, PERIOD_BY_ID, type PeriodId } from '../lib/periods'
import { useStore } from '../lib/store'
import NotFound from './NotFound'

export default function UnitPage() {
  const { id = '' } = useParams()
  const { t, lang } = useLang()
  const { unitById } = useStore()
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()
  const selectorRef = useRef<HTMLDivElement>(null)
  const u = unitById(id)
  if (!u) return <NotFound />
  const b = BUILDING_BY_ID[u.buildingId]
  const raw = sp.get('periodo')
  const period: PeriodId | null = isPeriodId(raw) && u.prices[raw] !== undefined && isAvailable(raw, u.booked) ? raw : null
  const setPeriod = (p: PeriodId | null) => {
    const q = new URLSearchParams(sp)
    if (p) q.set('periodo', p)
    else q.delete('periodo')
    setSp(q, { replace: true, preventScrollReset: true })
  }
  const net = period ? u.prices[period]! : 0
  const reserve = () => {
    if (!period) {
      selectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      selectorRef.current?.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus({ preventScroll: true })
      return
    }
    nav(`/reservar/${u.id}?periodo=${period}`)
  }
  const photoCount = u.photos?.length ?? 0

  const description = t(
    `Departamento de ${u.bedrooms} ${u.bedrooms === 1 ? 'dormitorio' : 'dormitorios'} y ${u.baths} ${u.baths === 1 ? 'baño' : 'baños'} en el piso ${u.floor} de ${b.name}, con ${u.m2} m² y capacidad para ${u.guests} huéspedes. ${u.seaView ? 'El living y la terraza miran al mar.' : 'Orientación ' + (u.view === 'parque' ? 'al parque y al pinar.' : 'lateral, con luz de la mañana.')}${u.garage ? ' Incluye cochera.' : ''}${u.pet ? ' Se aceptan mascotas, según el reglamento del edificio.' : ''}`,
    `Apartamento de ${u.bedrooms} ${u.bedrooms === 1 ? 'quarto' : 'quartos'} e ${u.baths} ${u.baths === 1 ? 'banheiro' : 'banheiros'} no ${u.floor}º andar do ${b.name}, com ${u.m2} m² e capacidade para ${u.guests} hóspedes. ${u.seaView ? 'A sala e o terraço têm vista para o mar.' : 'Orientação ' + (u.view === 'parque' ? 'para o parque e o pinheiral.' : 'lateral, com luz da manhã.')}${u.garage ? ' Inclui vaga de garagem.' : ''}${u.pet ? ' Aceita animais de estimação, conforme o regulamento do edifício.' : ''}`,
  )

  return (
    <div className="pt-24 pb-32 md:pt-28 lg:pb-24">
      <div className="shell">
        <Link to="/buscar" className="mb-5 inline-flex min-h-10 items-center gap-2 text-[0.875rem] text-mute hover:text-ink">
          <ArrowLeft size={16} />
          {t('Volver a resultados', 'Voltar aos resultados')}
        </Link>

        {/* Gallery */}
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:grid-rows-2 md:overflow-visible md:px-0">
          <div className="bezel relative w-[88vw] shrink-0 snap-start md:col-span-2 md:row-span-2 md:w-auto">
            <div className="aspect-[4/3] md:aspect-auto md:h-full" style={{ viewTransitionName: 'unit-hero' }}>
              <UnitVisual u={u} className="size-full" />
            </div>
            <FavoriteButton unitId={u.id} className="absolute top-4 right-4" />
          </div>
          <div className="bezel w-[70vw] shrink-0 snap-start md:w-auto">
            <div className="relative aspect-[4/3]">
              {photoCount > 1 ? <UnitVisual u={u} index={1} className="size-full" /> : <ArchScene kind="view" time={b.scene.time} seed={b.scene.seed + 1} className="size-full" />}
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[0.75rem] font-medium">{u.seaView ? t('Vista desde la terraza', 'Vista do terraço') : t('Terraza', 'Terraço')}</span>
            </div>
          </div>
          <div className="bezel w-[70vw] shrink-0 snap-start md:w-auto">
            <div className="relative aspect-[4/3]">
              {photoCount > 2 ? <UnitVisual u={u} index={2} className="size-full" /> : <ArchScene kind="pool" time="day" seed={b.scene.seed + 2} className="size-full" />}
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[0.75rem] font-medium">{t('Piscina del edificio', 'Piscina do edifício')}</span>
            </div>
          </div>
          <div className="bezel w-[70vw] shrink-0 snap-start md:col-span-2 md:w-auto">
            <div className="relative aspect-[4/3] bg-white md:aspect-[2.1/1]">
              <FloorPlan bedrooms={u.bedrooms} baths={u.baths} m2={u.m2} seaView={u.seaView} className="size-full" />
            </div>
          </div>
        </div>
        {!photoCount && (
          <p className="mt-3 text-[0.8125rem] text-mute">
            {t('Ilustraciones y plano esquemático. Las fotos del interior las carga el propietario y las revisa EVP.', 'Ilustrações e planta esquemática. As fotos do interior são enviadas pelo proprietário e revisadas pela EVP.')}
          </p>
        )}

        <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-16">
          <div className="flex flex-col gap-12">
            <header className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <ChannelTag channel={u.channel} />
                <Seal />
              </div>
              <h1 className="f-h2 text-[clamp(2rem,4vw,3.25rem)]">
                {b.name}
                <span className="block text-[0.5em] font-[460] text-mute" style={{ fontStretch: '100%' }}>
                  {t('Piso', 'Andar')} {u.floor} · {t('Unidad', 'Unidade')} {u.unit} · {ZONE_NAME[b.zone]}
                </span>
              </h1>
              <Specs u={u} />
              <Features u={u} />
              {u.channel.type === 'agency' && (
                <p className="text-[0.875rem] text-mute">
                  {t('Gestionado por', 'Gerenciado por')} {u.channel.agency}, {t('inmobiliaria aliada de EVP.', 'imobiliária parceira da EVP.')}
                </p>
              )}
            </header>

            <section className="flex flex-col gap-4">
              <h2 className="f-h3 text-[1.25rem]">{t('La unidad', 'A unidade')}</h2>
              <p className="prose-evp text-[1.0625rem]">{description}</p>
            </section>

            <section className="flex flex-col gap-5 rounded-[22px] bg-mist p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="f-h3 text-[1.25rem]">{b.name}</h2>
                <Stars n={b.stars} />
              </div>
              <p className="text-mute">{b.tagline[lang]}</p>
              <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {b.amenities.slice(0, 8).map((a) => (
                  <li key={a} className="flex items-center gap-2 text-[0.9375rem]">
                    <Check size={16} weight="bold" className="text-ok" aria-hidden />
                    {AMENITIES[a][lang]}
                  </li>
                ))}
              </ul>
              <Link to={`/edificios/${b.id}`} viewTransition className="self-start text-[0.9375rem] font-medium text-marine-strong underline-offset-4 hover:underline">
                {t('Ver ficha madre completa del edificio', 'Ver ficha técnica completa do edifício')}
              </Link>
            </section>

            <section className="flex flex-col gap-6">
              <h2 className="f-h3 text-[1.25rem]">{t('Cómo se alquila', 'Como se aluga')}</h2>
              <ul className="grid gap-6 sm:grid-cols-2">
                {[
                  [<CalendarBlank key="c" size={22} weight="light" />, t('Solo períodos fijos', 'Só períodos fixos'), t('Quincena, mes o temporada completa. Entrada a las 15 h y salida a las 11 h.', 'Quinzena, mês ou temporada completa. Entrada às 15 h e saída às 11 h.')],
                  [<FileText key="f" size={22} weight="light" />, t('Contrato digital', 'Contrato digital'), t('Arrendamiento de temporada según la legislación uruguaya, firmado antes del check-in.', 'Locação por temporada conforme a legislação uruguaia, assinada antes do check-in.')],
                  [<ShieldCheck key="s" size={22} weight="light" />, t('Pago en custodia', 'Pagamento em custódia'), t('EVP retiene el pago y lo libera al propietario 24–48 h después de tu check-in.', 'A EVP retém o pagamento e o libera ao proprietário 24–48 h após o seu check-in.')],
                  [<ClipboardText key="i" size={22} weight="light" />, t('Inventario digital', 'Inventário digital'), t('Al ingresar revisás el checklist de la unidad y aceptás el reglamento del edificio.', 'Na entrada você confere o checklist da unidade e aceita o regulamento do edifício.')],
                ].map(([icon, title, body], i) => (
                  <li key={i} className="flex gap-4">
                    <span className="mt-0.5 text-marine-strong">{icon}</span>
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="text-[0.9375rem] text-mute">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Booking panel */}
          <aside aria-label={t('Reservar', 'Reservar')}>
            <div ref={selectorRef} className="flex flex-col gap-6 rounded-[22px] p-6 shadow-[var(--shadow-ambient)] ring-1 ring-line lg:sticky lg:top-28">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="f-h3 text-[1.125rem]">{t('Elegí tu período', 'Escolha seu período')}</h2>
                <span className="text-[0.75rem] text-mute">{t('Temporada 2026 – 27', 'Temporada 2026 – 27')}</span>
              </div>
              <PeriodSelector value={period} onChange={setPeriod} unit={u} name={`p-${u.id}`} />
              {period ? (
                <PriceBreakdown net={net} periodId={period} />
              ) : (
                <p className="rounded-[12px] bg-mist p-4 text-[0.875rem] text-mute">
                  {t('Desde', 'A partir de')} <span className="f-num font-semibold text-ink">{usd(minPrice(u.prices), lang)}</span> {t('por quincena. Elegí un período para ver el desglose completo.', 'por quinzena. Escolha um período para ver o detalhamento completo.')}
                </p>
              )}
              <Button size="lg" onClick={reserve} trailing className="w-full">
                {period ? t('Reservar este período', 'Reservar este período') : t('Elegí un período', 'Escolha um período')}
              </Button>
              <p className="text-center text-[0.8125rem] text-mute">{t('No se cobra nada hasta firmar el contrato.', 'Nada é cobrado até assinar o contrato.')}</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="no-print fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-line bg-bg/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col">
            {period ? (
              <>
                <span className="f-num font-semibold">{usd(breakdown(net).total, lang)} <span className="text-[0.75rem] font-normal text-mute">{t('total', 'total')}</span></span>
                <span className="truncate text-[0.75rem] text-mute">{PERIOD_BY_ID[period].name[lang]}</span>
              </>
            ) : (
              <>
                <span className="text-[0.75rem] text-mute">{t('desde', 'a partir de')}</span>
                <span className="f-num font-semibold">{usd(minPrice(u.prices), lang)} <span className="text-[0.75rem] font-normal text-mute">/ {t('quincena', 'quinzena')}</span></span>
              </>
            )}
          </div>
          <Button onClick={reserve} className={cx('shrink-0')}>
            {period ? t('Reservar', 'Reservar') : t('Elegir período', 'Escolher período')}
          </Button>
        </div>
      </div>
    </div>
  )
}
