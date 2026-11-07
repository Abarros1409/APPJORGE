import { Bank, FileArrowUp, Plus, ShieldWarning } from '@phosphor-icons/react'
import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { StepUpDialog } from '../components/auth-ui'
import { UnitVisual } from '../components/units'
import { Button, ButtonLink, Field, InfoNote, cx } from '../components/ui'
import { useAuth } from '../lib/auth'
import { BUILDING_BY_ID, ZONE_NAME } from '../lib/data'
import { dateTime, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { isAvailable, PERIODS, PERIOD_BY_ID } from '../lib/periods'
import { bookingStatus, useStore, type BookingStatus } from '../lib/store'

function PayoutAccount() {
  const { t, lang } = useLang()
  const { user, updateUser, stepUpFresh, notify } = useAuth()
  const fid = useId()
  const [editing, setEditing] = useState(false)
  const [bank, setBank] = useState('BROU')
  const [account, setAccount] = useState('')
  const [error, setError] = useState('')
  const [stepUp, setStepUp] = useState(false)
  if (!user) return null
  const apply = () => {
    const digits = account.replace(/\D/g, '')
    const holdUntil = new Date(Date.now() + 48 * 3_600_000).toISOString()
    updateUser({ payout: { bank, masked: `•••• ${digits.slice(-4)}`, holdUntil } })
    notify(user.email, t('Cambiaste tu cuenta de cobro. Si no fuiste vos, contactá a EVP de inmediato.', 'Você alterou sua conta de recebimento. Se não foi você, contate a EVP imediatamente.'))
    setEditing(false)
    setAccount('')
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (account.replace(/\D/g, '').length < 6) return setError(t('Revisá el número de cuenta.', 'Confira o número da conta.'))
    setError('')
    // Sensitive action: requires a fresh second-factor check even with an open session.
    if (stepUpFresh()) apply()
    else setStepUp(true)
  }
  const hold = user.payout?.holdUntil && Date.parse(user.payout.holdUntil) > Date.now()
  return (
    <section aria-labelledby="payout-title" className="flex flex-col gap-5 rounded-[20px] p-5 ring-1 ring-line md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Bank size={22} className="text-marine-strong" />
          <h2 id="payout-title" className="f-h3 text-[1.125rem]">{t('Cuenta para liquidaciones', 'Conta para repasses')}</h2>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} disabled={!user.mfa}>
            {user.payout ? t('Cambiar cuenta', 'Alterar conta') : t('Agregar cuenta', 'Adicionar conta')}
          </Button>
        )}
      </div>
      {user.payout ? (
        <p className="f-num text-[0.9375rem]">
          {user.payout.bank} · {user.payout.masked}
          {hold && <span className="ml-2 rounded-full bg-warn-soft px-2.5 py-1 text-[0.75rem] font-medium text-[oklch(0.45_0.11_70)]">{t(`Habilitada desde ${dateTime(user.payout.holdUntil!, lang)}`, `Habilitada a partir de ${dateTime(user.payout.holdUntil!, lang)}`)}</span>}
        </p>
      ) : (
        <p className="text-[0.9375rem] text-mute">{t('Todavía no cargaste una cuenta.', 'Você ainda não cadastrou uma conta.')}</p>
      )}
      {!user.mfa && <p className="text-[0.8125rem] text-mute">{t('Para cargar o cambiar la cuenta, activá antes la verificación en dos pasos.', 'Para cadastrar ou alterar a conta, ative antes a verificação em duas etapas.')}</p>}
      {editing && (
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
          <Field label={t('Banco', 'Banco')} htmlFor={`${fid}-b`}>
            <select id={`${fid}-b`} className="field" value={bank} onChange={(e) => setBank(e.target.value)}>
              {['BROU', 'Itaú', 'Santander', 'BBVA', 'Scotiabank', 'HSBC', t('Banco del exterior', 'Banco no exterior')].map((b) => <option key={b}>{b}</option>)}
            </select>
          </Field>
          <Field label={t('Número de cuenta en USD', 'Número da conta em USD')} htmlFor={`${fid}-a`} error={error || undefined}>
            <input id={`${fid}-a`} className="field f-num" inputMode="numeric" autoComplete="off" value={account} onChange={(e) => setAccount(e.target.value)} aria-invalid={!!error || undefined} />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" variant="ink">{t('Guardar', 'Salvar')}</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>{t('Cancelar', 'Cancelar')}</Button>
          </div>
          <p className="text-[0.8125rem] text-mute sm:col-span-3">
            {t('Por seguridad, te pedimos un código y la nueva cuenta recibe pagos recién 48 h después del cambio. Te avisamos por email.', 'Por segurança, pedimos um código e a nova conta só recebe pagamentos 48 h após a alteração. Avisamos por e-mail.')}
          </p>
        </form>
      )}
      <StepUpDialog open={stepUp} onClose={() => setStepUp(false)} onVerified={apply} reason={t('Vas a cambiar la cuenta donde EVP te transfiere los alquileres.', 'Você vai alterar a conta onde a EVP transfere os aluguéis.')} />
    </section>
  )
}

function TitleVerification({ unitId, state, doc }: { unitId: string; state: 'titulo' | 'revision'; doc?: string }) {
  const { t } = useLang()
  const { submitTitleDoc, approveUnit } = useStore()
  const fid = useId()
  if (state === 'revision') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-warn-soft p-4 text-[0.875rem]">
        <span>{t(`EVP está revisando «${doc}». Suele tardar menos de 24 h hábiles.`, `A EVP está revisando «${doc}». Costuma levar menos de 24 h úteis.`)}</span>
        <button type="button" onClick={() => approveUnit(unitId)} className="font-medium text-marine-strong underline-offset-4 hover:underline">
          {t('Simular aprobación de EVP', 'Simular aprovação da EVP')}
        </button>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3 rounded-[12px] bg-ocaso-soft p-4 text-[0.875rem] sm:flex-row sm:items-center sm:justify-between">
      <span>{t('Falta el documento de titularidad (título o boleto de compraventa). Hasta validarlo, los huéspedes no ven la unidad.', 'Falta o documento de titularidade (escritura ou compromisso de compra e venda). Até a validação, os hóspedes não veem a unidade.')}</span>
      <label htmlFor={`${fid}-f`} className="inline-flex min-h-10 shrink-0 items-center gap-2 self-start rounded-full bg-ink px-4 font-medium text-on-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-marine-strong sm:self-auto">
        <FileArrowUp size={16} />
        {t('Subir documento', 'Enviar documento')}
        <input id={`${fid}-f`} type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && submitTitleDoc(unitId, e.target.files[0].name)} />
      </label>
    </div>
  )
}

export default function Panel() {
  const { t, lang } = useLang()
  const { allUnits, bookings, completeCheckin, releaseNow } = useStore()
  const { user } = useAuth()
  // Authorization: an owner only ever sees their own units and the bookings on them.
  const mine = allUnits.filter((u) => u.ownerId === user?.id)
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
              {t('Hola', 'Olá')}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
          </div>
          <ButtonLink to="/propietarios/publicar" variant="ink" trailing={<Plus size={16} />}>
            {t('Publicar otra unidad', 'Publicar outra unidade')}
          </ButtonLink>
        </header>

        {user && !user.mfa && (
          <div className="flex flex-col gap-4 rounded-[18px] bg-ocaso-soft p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-3">
              <ShieldWarning size={22} className="mt-0.5 shrink-0 text-ocaso-strong" />
              <span>
                <strong>{t('Activá la verificación en dos pasos.', 'Ative a verificação em duas etapas.')}</strong>{' '}
                {t('Es obligatoria para propietarios: protege tus cobros si alguien accede a tu email.', 'É obrigatória para proprietários: protege seus recebimentos se alguém acessar seu e-mail.')}
              </span>
            </p>
            <ButtonLink to="/cuenta#seguridad" variant="ink" size="sm" className="shrink-0">
              {t('Activar ahora', 'Ativar agora')}
            </ButtonLink>
          </div>
        )}

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
                      <span className={cx('rounded-full px-2.5 py-1 text-[0.75rem] font-medium', u.verification ? 'bg-warn-soft text-[oklch(0.45_0.11_70)]' : 'bg-ok-soft text-ok')}>
                        {u.verification === 'titulo' ? t('Falta titularidad', 'Falta titularidade') : u.verification === 'revision' ? t('En revisión EVP', 'Em revisão EVP') : t('Publicada', 'Publicada')}
                      </span>
                    </div>
                    {u.verification && <TitleVerification unitId={u.id} state={u.verification} doc={u.titleDoc?.name} />}
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

        <PayoutAccount />

        <section aria-labelledby="bk-title" className="flex flex-col gap-6">
          <h2 id="bk-title" className="f-h3 text-[1.375rem]">
            {t('Reservas y liquidaciones', 'Reservas e repasses')}
          </h2>
          {myBookings.length ? (
            <div className="relative overflow-x-auto rounded-[18px] ring-1 ring-line">
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
                    const u = allUnits.find((x) => x.id === bk.unitId)!
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
