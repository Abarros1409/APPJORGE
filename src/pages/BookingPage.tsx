import { Check, CheckCircle, ClipboardText, FileText, Printer, ShieldCheck, Wallet } from '@phosphor-icons/react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { UnitVisual } from '../components/units'
import { Button, ButtonLink, InfoNote, cx } from '../components/ui'
import { BUILDING_BY_ID, ZONE_NAME } from '../lib/data'
import { dateRange, dateTime, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { PERIOD_BY_ID } from '../lib/periods'
import { bookingStatus, useStore } from '../lib/store'
import NotFound from './NotFound'

export function useInventoryItems(garage: boolean) {
  const { t } = useLang()
  return [
    t('Llaves, tarjetas y medios de acceso', 'Chaves, cartões e meios de acesso'),
    ...(garage ? [t('Control remoto de la cochera', 'Controle remoto da garagem')] : []),
    t('Vajilla, cristalería y utensilios de cocina', 'Louças, copos e utensílios de cozinha'),
    t('Ropa blanca y toallas para todos los huéspedes', 'Roupa de cama e toalhas para todos os hóspedes'),
    t('Electrodomésticos funcionando', 'Eletrodomésticos funcionando'),
    t('Aire acondicionado y calefacción', 'Ar-condicionado e aquecimento'),
    t('Mobiliario interior sin daños', 'Mobiliário interno sem danos'),
    t('Terraza y mobiliario exterior', 'Terraço e mobiliário externo'),
  ]
}

export default function BookingPage() {
  const { code = '' } = useParams()
  const [sp] = useSearchParams()
  const { t, lang } = useLang()
  const { bookings, unitById, completeCheckin } = useStore()
  const bk = bookings.find((b) => b.code === code)
  const u = bk ? unitById(bk.unitId) : undefined
  const items = useInventoryItems(!!u?.garage)
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState('')
  if (!bk || !u) return <NotFound />
  const b = BUILDING_BY_ID[u.buildingId]
  const status = bookingStatus(bk)
  const checked = items.map((it) => !!checkedMap[it])
  const allChecked = checked.every(Boolean)

  const timeline = [
    { icon: <FileText size={18} />, title: t('Contrato firmado', 'Contrato assinado'), sub: dateTime(bk.signedAt, lang), done: true },
    { icon: <ShieldCheck size={18} />, title: t('Pago en custodia de EVP', 'Pagamento em custódia da EVP'), sub: `${usd(bk.total, lang)} · ${bk.methodDetail}`, done: true },
    { icon: <ClipboardText size={18} />, title: t('Check-in con inventario', 'Check-in com inventário'), sub: bk.checkin ? dateTime(bk.checkin.at, lang) : t(`Desde el ${dateRange(bk.period, lang).split(' – ')[0]}, 15 h`, `A partir de ${dateRange(bk.period, lang).split(' – ')[0]}, 15 h`), done: !!bk.checkin },
    {
      icon: <Wallet size={18} />,
      title: t('Fondos liberados al propietario', 'Valores liberados ao proprietário'),
      sub: status === 'liberado' ? t('Transferencia realizada', 'Transferência realizada') : bk.releaseAt ? t(`Programada para ${dateTime(bk.releaseAt, lang)}`, `Programada para ${dateTime(bk.releaseAt, lang)}`) : t('24–48 h después del check-in', '24–48 h após o check-in'),
      done: status === 'liberado',
    },
  ]
  const current = timeline.findIndex((s) => !s.done)

  return (
    <div className="pt-24 pb-24 md:pt-28">
      <div className="shell flex flex-col gap-10">
        {sp.get('nueva') && (
          <div className="flex items-start gap-4 rounded-[18px] bg-ok-soft p-5 md:p-6" role="status">
            <CheckCircle size={28} weight="fill" className="shrink-0 text-ok" />
            <div>
              <p className="f-h3 text-[1.125rem]">{t('Reserva confirmada', 'Reserva confirmada')}</p>
              <p className="text-[0.9375rem]">
                {t(`Te enviamos el contrato firmado a ${bk.guest.email}. Tu pago quedó en custodia de EVP.`, `Enviamos o contrato assinado para ${bk.guest.email}. Seu pagamento ficou em custódia da EVP.`)}
              </p>
            </div>
          </div>
        )}

        <header className="flex flex-col gap-3">
          <p className="f-num text-[0.875rem] text-mute">
            {t('Reserva', 'Reserva')} {bk.code}
          </p>
          <h1 className="f-h2 text-[clamp(1.9rem,3.6vw,3rem)]">
            {b.name} · {PERIOD_BY_ID[bk.period].name[lang]}
          </h1>
          <p className="text-mute">
            {t('Piso', 'Andar')} {u.floor} · {t('Unidad', 'Unidade')} {u.unit} · {ZONE_NAME[b.zone]} · {dateRange(bk.period, lang)}
          </p>
        </header>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
          <div className="flex flex-col gap-12">
            <section aria-labelledby="tl-title">
              <h2 id="tl-title" className="f-h3 mb-6 text-[1.25rem]">
                {t('Estado', 'Status')}
              </h2>
              <ol className="relative flex flex-col">
                {timeline.map((s, i) => (
                  <li key={i} className="relative flex gap-4 pb-7 last:pb-0" aria-current={i === current ? 'step' : undefined}>
                    {i < timeline.length - 1 && <span aria-hidden className={cx('absolute top-10 left-[19px] h-[calc(100%-2.75rem)] w-px', s.done ? 'bg-ok' : 'bg-line')} />}
                    <span className={cx('flex size-10 shrink-0 items-center justify-center rounded-full', s.done ? 'bg-ok text-white' : i === current ? 'bg-ink text-on-ink' : 'bg-mist text-mute')}>{s.done ? <Check size={16} weight="bold" /> : s.icon}</span>
                    <div className="pt-1.5">
                      <p className="font-semibold">{s.title}</p>
                      <p className="f-num text-[0.875rem] text-mute">{s.sub}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="inv-title" className="flex flex-col gap-5 rounded-[22px] p-6 ring-1 ring-line md:p-8">
              <div className="flex flex-col gap-2">
                <h2 id="inv-title" className="f-h3 text-[1.25rem]">
                  {t('Inventario digital de ingreso', 'Inventário digital de entrada')}
                </h2>
                <p className="text-[0.9375rem] text-mute">
                  {t(
                    'Al llegar, revisá cada punto. Cuando confirmes, EVP programa la liberación del pago al propietario. Si algo no está bien, dejalo anotado: queda en el registro de la reserva.',
                    'Ao chegar, confira cada item. Quando você confirmar, a EVP programa a liberação do pagamento ao proprietário. Se algo não estiver certo, anote: fica registrado na reserva.',
                  )}
                </p>
              </div>
              {bk.checkin ? (
                <InfoNote tone="ok">
                  {t(`Check-in confirmado el ${dateTime(bk.checkin.at, lang)}.`, `Check-in confirmado em ${dateTime(bk.checkin.at, lang)}.`)} {bk.checkin.notes && <>“{bk.checkin.notes}”</>}
                </InfoNote>
              ) : (
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (allChecked) completeCheckin(bk.code, notes)
                  }}
                >
                  <fieldset className="flex flex-col">
                    <legend className="sr-only">{t('Ítems del inventario', 'Itens do inventário')}</legend>
                    {items.map((it, i) => (
                      <label key={it} className="flex min-h-12 items-center gap-3 border-b border-line py-2 last:border-0">
                        <input
                          type="checkbox"
                          className="size-5 accent-[var(--color-ok)]"
                          checked={checked[i]}
                          onChange={(e) => setCheckedMap((m) => ({ ...m, [it]: e.target.checked }))}
                        />
                        <span className={cx('text-[0.9375rem]', checked[i] && 'text-mute')}>{it}</span>
                      </label>
                    ))}
                  </fieldset>
                  <label className="flex flex-col gap-1.5 text-[0.875rem] font-medium">
                    {t('Observaciones', 'Observações')} <span className="font-normal text-mute">{t('(opcional)', '(opcional)')}</span>
                    <textarea className="field min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('Ej.: falta una toalla de playa', 'Ex.: falta uma toalha de praia')} />
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button type="submit" disabled={!allChecked} trailing>
                      {t('Confirmar check-in', 'Confirmar check-in')}
                    </Button>
                    <span className="f-num text-[0.875rem] text-mute" aria-live="polite">
                      {checked.filter(Boolean).length}/{items.length} {t('verificados', 'conferidos')}
                    </span>
                  </div>
                  <p className="text-[0.8125rem] text-mute">{t('Demo: el inventario se habilita desde el día de ingreso; acá podés probarlo ahora.', 'Demo: o inventário é liberado no dia da entrada; aqui você pode testar agora.')}</p>
                </form>
              )}
            </section>
          </div>

          <aside className="flex flex-col gap-5">
            <div className="bezel">
              <div className="aspect-[4/3]">
                <UnitVisual u={u} className="size-full" />
              </div>
            </div>
            <dl className="f-num flex flex-col gap-2 text-[0.9375rem]">
              <div className="flex justify-between"><dt className="text-mute">{t('Titular', 'Titular')}</dt><dd>{bk.guest.name}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">{t('Huéspedes', 'Hóspedes')}</dt><dd>{bk.guest.guests}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">{t('Alquiler', 'Aluguel')}</dt><dd>{usd(bk.net, lang)}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">{t('Tarifa EVP', 'Taxa EVP')}</dt><dd>{usd(bk.fee, lang)}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>{t('Total pagado', 'Total pago')}</dt><dd>{usd(bk.total, lang)}</dd></div>
            </dl>
            <ButtonLink to={`/contrato/${bk.code}`} variant="ink" trailing={<Printer size={16} />}>
              {t('Ver y descargar contrato', 'Ver e baixar contrato')}
            </ButtonLink>
            <Link to={`/unidades/${u.id}`} className="text-center text-[0.875rem] font-medium text-marine-strong underline-offset-4 hover:underline">
              {t('Ver la unidad', 'Ver a unidade')}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}
