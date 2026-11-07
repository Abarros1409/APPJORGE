import { Plus } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { UnitVisual } from '../components/units'
import { ButtonLink, InfoNote, cx } from '../components/ui'
import { BUILDING_BY_ID, DEMO_OWNER, ZONE_NAME } from '../lib/data'
import { dateTime, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { isAvailable, PERIODS, PERIOD_BY_ID } from '../lib/periods'
import { bookingStatus, useStore, type BookingStatus } from '../lib/store'

export default function Panel() {
  const { t, lang } = useLang()
  const { units, bookings, completeCheckin, releaseNow } = useStore()
  const mine = units.filter((u) => u.ownerId === DEMO_OWNER.id)
  const myBookings = bookings.filter((b) => mine.some((u) => u.id === b.unitId))
  const sum = (s: BookingStatus[]) => myBookings.filter((b) => s.includes(bookingStatus(b))).reduce((a, b) => a + b.net, 0)
  const nextRelease = myBookings
    .filter((b) => bookingStatus(b) === 'checkin' && b.releaseAt)
    .sort((a, b) => a.releaseAt!.localeCompare(b.releaseAt!))[0]
  const offered = mine.reduce((a, u) => a + PERIODS.filter((p) => p.kind === 'quincena' && u.prices[p.id] !== undefined).length, 0)
  const bookedQ = mine.reduce((a, u) => a + PERIODS.filter((p) => p.kind === 'quincena' && u.prices[p.id] !== undefined && !isAvailable(p.id, u.booked)).length, 0)

  const statusLabel: Record<BookingStatus, string> = {
    custodia: t('En custodia', 'Em custódia'),
    checkin: t('Check-in hecho · liberación programada', 'Check-in feito · liberação programada'),
    liberado: t('Transferido', 'Transferido'),
  }
  const statusTone: Record<BookingStatus, string> = {
    custodia: 'bg-marine-soft text-marine-strong',
    checkin: 'bg-warn-soft text-[oklch(0.45_0.11_70)]',
    liberado: 'bg-ok-soft text-ok',
  }
  const quincenas = PERIODS.filter((p) => p.id !== 'temporada')

  return (
    <div className="pt-28 pb-24 md:pt-32">
      <div className="shell flex flex-col gap-14">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-mute">{t('Panel del propietario', 'Painel do proprietário')}</p>
            <h1 className="f-h2 text-[clamp(2rem,4vw,3.25rem)]">
              {t('Hola,', 'Olá,')} {DEMO_OWNER.name.split(' ')[0]}
            </h1>
          </div>
          <ButtonLink to="/propietarios/publicar" variant="ink" trailing={<Plus size={16} />}>
            {t('Publicar otra unidad', 'Publicar outra unidade')}
          </ButtonLink>
        </header>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] bg-line ring-1 ring-line lg:grid-cols-4">
          {[
            [t('En custodia', 'Em custódia'), usd(sum(['custodia', 'checkin']), lang), t('Se libera 24–48 h después de cada check-in', 'Liberado 24–48 h após cada check-in')],
            [t('Transferido', 'Transferido'), usd(sum(['liberado']), lang), t('100% neto · año 1 sin comisión', '100% líquido · ano 1 sem comissão')],
            [t('Próxima liberación', 'Próxima liberação'), nextRelease ? dateTime(nextRelease.releaseAt!, lang) : '—', nextRelease ? nextRelease.code : t('Sin check-ins pendientes de liquidar', 'Sem check-ins a liquidar')],
            [t('Quincenas reservadas', 'Quinzenas reservadas'), `${bookedQ} / ${offered}`, t('Temporada 2026 – 27', 'Temporada 2026 – 27')],
          ].map(([k, v, s]) => (
            <div key={k} className="flex flex-col gap-1 bg-bg p-5 md:p-6">
              <dt className="text-[0.8125rem] text-mute">{k}</dt>
              <dd className="f-num text-[1.375rem] font-semibold">{v}</dd>
              <dd className="text-[0.75rem] text-mute">{s}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="mine-title" className="flex flex-col gap-6">
          <h2 id="mine-title" className="f-h3 text-[1.375rem]">
            {t('Mis unidades', 'Minhas unidades')}
          </h2>
          <ul className="flex flex-col gap-4">
            {mine.map((u) => {
              const b = BUILDING_BY_ID[u.buildingId]
              return (
                <li key={u.id} className="grid gap-5 rounded-[20px] p-4 ring-1 ring-line md:grid-cols-[9rem_1fr] md:p-5">
                  <Link to={`/unidades/${u.id}`} className="block overflow-hidden rounded-[12px]" aria-label={`${b.name} · ${u.unit}`}>
                    <div className="aspect-[4/3] md:aspect-square">
                      <UnitVisual u={u} className="size-full" />
                    </div>
                  </Link>
                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <div>
                        <Link to={`/unidades/${u.id}`} className="f-h3 text-[1.0625rem] hover:underline">
                          {b.name} · {u.unit}
                        </Link>
                        <p className="text-[0.8125rem] text-mute">
                          {ZONE_NAME[b.zone]} · {t('Piso', 'Andar')} {u.floor} · {u.bedrooms} {t('dorm.', 'quartos')}
                        </p>
                      </div>
                      <span className={cx('rounded-full px-2.5 py-1 text-[0.75rem] font-medium', u.createdAt ? 'bg-warn-soft text-[oklch(0.45_0.11_70)]' : 'bg-ok-soft text-ok')}>
                        {u.createdAt ? t('Publicada · fotos en revisión', 'Publicada · fotos em revisão') : t('Publicada', 'Publicada')}
                      </span>
                    </div>
                    <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-7" aria-label={t('Ocupación por período', 'Ocupação por período')}>
                      {quincenas.map((p) => {
                        const price = u.prices[p.id]
                        const free = isAvailable(p.id, u.booked)
                        const state = price === undefined ? 'off' : free ? 'free' : 'booked'
                        return (
                          <li
                            key={p.id}
                            className={cx(
                              'flex flex-col rounded-[10px] px-2.5 py-2 text-[0.75rem]',
                              state === 'booked' && 'bg-ink text-on-ink',
                              state === 'free' && 'bg-bg ring-1 ring-line-strong ring-inset',
                              state === 'off' && 'bg-mist text-mute',
                            )}
                          >
                            <span className="font-semibold">{p.short[lang]}</span>
                            <span className="f-num opacity-80">{state === 'booked' ? t('Reservado', 'Reservado') : state === 'free' ? usd(price!, lang) : t('Uso propio', 'Uso próprio')}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="bk-title" className="flex flex-col gap-6">
          <h2 id="bk-title" className="f-h3 text-[1.375rem]">
            {t('Reservas y liquidaciones', 'Reservas e repasses')}
          </h2>
          {myBookings.length ? (
            <div className="overflow-x-auto rounded-[18px] ring-1 ring-line">
              <table className="w-full min-w-[46rem] text-left text-[0.9375rem]">
                <thead className="bg-mist text-[0.8125rem] text-mute">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">{t('Reserva', 'Reserva')}</th>
                    <th scope="col" className="px-5 py-3 font-medium">{t('Unidad y período', 'Unidade e período')}</th>
                    <th scope="col" className="px-5 py-3 font-medium">{t('Huésped', 'Hóspede')}</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">{t('Tu neto', 'Seu líquido')}</th>
                    <th scope="col" className="px-5 py-3 font-medium">{t('Estado', 'Status')}</th>
                    <th scope="col" className="px-5 py-3 font-medium"><span className="sr-only">{t('Acciones', 'Ações')}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map((bk) => {
                    const u = units.find((x) => x.id === bk.unitId)!
                    const st = bookingStatus(bk)
                    const [first, ...rest] = bk.guest.name.split(' ')
                    return (
                      <tr key={bk.code} className="border-t border-line align-top">
                        <td className="f-num px-5 py-4 font-medium">{bk.code}</td>
                        <td className="px-5 py-4">
                          {BUILDING_BY_ID[u.buildingId].name} · {u.unit}
                          <span className="block text-[0.8125rem] text-mute">{PERIOD_BY_ID[bk.period].name[lang]}</span>
                        </td>
                        <td className="px-5 py-4">
                          {first} {rest.length ? `${rest[rest.length - 1][0]}.` : ''}
                          <span className="block text-[0.8125rem] text-mute">
                            {bk.guest.guests} {t('huéspedes', 'hóspedes')} · {bk.guest.country}
                          </span>
                        </td>
                        <td className="f-num px-5 py-4 text-right font-semibold">{usd(bk.net, lang)}</td>
                        <td className="px-5 py-4">
                          <span className={cx('inline-block rounded-full px-2.5 py-1 text-[0.75rem] font-medium', statusTone[st])}>{statusLabel[st]}</span>
                          {st === 'checkin' && bk.releaseAt && <span className="f-num mt-1 block text-[0.75rem] text-mute">{dateTime(bk.releaseAt, lang)}</span>}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {st === 'custodia' && (
                            <button type="button" onClick={() => completeCheckin(bk.code, '')} className="text-[0.8125rem] font-medium whitespace-nowrap text-marine-strong underline-offset-4 hover:underline">
                              {t('Simular check-in', 'Simular check-in')}
                            </button>
                          )}
                          {st === 'checkin' && (
                            <button type="button" onClick={() => releaseNow(bk.code)} className="text-[0.8125rem] font-medium whitespace-nowrap text-marine-strong underline-offset-4 hover:underline">
                              {t('Simular liberación', 'Simular liberação')}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-mute">{t('Todavía no tenés reservas. Cuando entren, vas a ver acá el estado de cada pago.', 'Você ainda não tem reservas. Quando chegarem, verá aqui o status de cada pagamento.')}</p>
          )}
          <InfoNote>
            {t(
              'Los botones «Simular» existen solo en esta demo: en producción, el check-in lo confirma el huésped con el inventario digital y la liberación es automática.',
              'Os botões «Simular» existem só nesta demo: em produção, o check-in é confirmado pelo hóspede com o inventário digital e a liberação é automática.',
            )}
          </InfoNote>
        </section>
      </div>
    </div>
  )
}
