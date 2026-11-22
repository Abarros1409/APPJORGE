import { ChatCircleText, Envelope, FileArrowUp, Phone, Plus, ShieldWarning, WhatsappLogo } from '@phosphor-icons/react'
import { useId, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { StepUpDialog } from '../components/auth-ui'
import { UnitVisual } from '../components/units'
import { Button, ButtonLink, Field, InfoNote, cx } from '../components/ui'
import { maskPhone, useAuth } from '../lib/auth'
import { BUILDING_BY_ID, ZONE_NAME } from '../lib/data'
import { dateTime, longDate, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { isAvailable, PERIODS, PERIOD_BY_ID } from '../lib/periods'
import { useStore, type InquiryStatus } from '../lib/store'

/** Phone/WhatsApp that verified interested tenants see. Changing it is a sensitive action (anti-fraud). */
function ListingContact() {
  const { t, lang } = useLang()
  const { user, updateUser, stepUpFresh, notify } = useAuth()
  const fid = useId()
  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState(true)
  const [error, setError] = useState('')
  const [stepUp, setStepUp] = useState(false)
  if (!user) return null
  const apply = () => {
    updateUser({ contact: { phone: phone.trim(), whatsapp, changedAt: new Date().toISOString() } })
    notify(user.email, t('Cambiaste el teléfono que ven los interesados. Si no fuiste vos, avisá a EVP de inmediato.', 'Você alterou o telefone que os interessados veem. Se não foi você, avise a EVP imediatamente.'))
    setEditing(false)
    setPhone('')
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (phone.replace(/\D/g, '').length < 8) return setError(t('Incluí el código de país, por ejemplo +598 99…', 'Inclua o código do país, por exemplo +55 11…'))
    setError('')
    // A swapped contact is how listing fraud starts: require a fresh second factor even with an open session.
    if (stepUpFresh()) apply()
    else setStepUp(true)
  }
  return (
    <section aria-labelledby="contact-title" className="flex flex-col gap-5 rounded-[20px] p-5 ring-1 ring-line md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Phone size={22} className="text-marine-strong" />
          <h2 id="contact-title" className="f-h3 text-[1.125rem]">{t('Contacto para interesados', 'Contato para interessados')}</h2>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} disabled={!user.mfa}>
            {user.contact ? t('Cambiar', 'Alterar') : t('Agregar', 'Adicionar')}
          </Button>
        )}
      </div>
      {user.contact ? (
        <p className="f-num text-[0.9375rem]">
          {maskPhone(user.contact.phone)} · {user.contact.whatsapp ? t('acepta WhatsApp', 'aceita WhatsApp') : t('solo llamadas', 'só ligações')}
          {user.contact.changedAt && <span className="ml-2 text-[0.8125rem] text-mute">{t(`Actualizado el ${longDate(user.contact.changedAt, lang)}`, `Atualizado em ${longDate(user.contact.changedAt, lang)}`)}</span>}
        </p>
      ) : (
        <p className="text-[0.9375rem] text-mute">{t('Sin teléfono: las consultas te llegan solo por email.', 'Sem telefone: as consultas chegam só por e-mail.')}</p>
      )}
      <p className="text-[0.8125rem] text-mute">
        {t('No es público: solo lo ven personas con email verificado después de enviarte una consulta.', 'Não é público: só é visível para pessoas com e-mail verificado depois de enviarem uma consulta.')}
      </p>
      {!user.mfa && <p className="text-[0.8125rem] text-mute">{t('Para agregarlo o cambiarlo, activá antes la verificación en dos pasos.', 'Para adicionar ou alterar, ative antes a verificação em duas etapas.')}</p>}
      {editing && (
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <Field label={t('Teléfono / WhatsApp', 'Telefone / WhatsApp')} htmlFor={`${fid}-p`} error={error || undefined}>
            <input id={`${fid}-p`} type="tel" inputMode="tel" autoComplete="tel" className="field f-num" placeholder="+598 99 123 456" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!error || undefined} />
          </Field>
          <label className="flex min-h-12 items-center gap-2 text-[0.9375rem]">
            <input type="checkbox" className="size-4 accent-[var(--color-ink)]" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} />
            WhatsApp
          </label>
          <div className="flex gap-2">
            <Button type="submit" variant="ink">{t('Guardar', 'Salvar')}</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>{t('Cancelar', 'Cancelar')}</Button>
          </div>
        </form>
      )}
      <StepUpDialog open={stepUp} onClose={() => setStepUp(false)} onVerified={apply} reason={t('Vas a cambiar el teléfono que ven quienes consultan por tus unidades.', 'Você vai alterar o telefone que veem as pessoas que consultam suas unidades.')} />
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
      <span>{t('Falta el documento de titularidad (título o boleto de compraventa). Hasta validarlo, los interesados no ven la unidad.', 'Falta o documento de titularidade (escritura ou compromisso de compra e venda). Até a validação, os interessados não veem a unidade.')}</span>
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
  const { allUnits, inquiries, setInquiryStatus, toggleRented } = useStore()
  const { user, notify } = useAuth()
  const [filter, setFilter] = useState<'nuevas' | 'todas'>('nuevas')
  // Authorization: an owner only ever sees their own units and the inquiries about them.
  const mine = allUnits.filter((u) => u.ownerId === user?.id)
  const myInquiries = inquiries.filter((q) => mine.some((u) => u.id === q.unitId))
  const fresh = myInquiries.filter((q) => q.status === 'nueva')
  const shown = filter === 'nuevas' ? fresh : myInquiries
  const offered = mine.reduce((a, u) => a + PERIODS.filter((p) => p.kind === 'quincena' && u.prices[p.id] !== undefined).length, 0)
  const rentedQ = mine.reduce((a, u) => a + PERIODS.filter((p) => p.kind === 'quincena' && u.prices[p.id] !== undefined && !isAvailable(p.id, u.booked)).length, 0)
  const freeUntil = user ? new Date(Date.parse(user.createdAt) + 365 * 86_400_000).toISOString() : ''

  const statusLabel: Record<InquiryStatus, [string, string]> = {
    nueva: [t('Nueva', 'Nova'), 'bg-marine-soft text-marine-strong'],
    respondida: [t('Respondida', 'Respondida'), 'bg-warn-soft text-[oklch(0.45_0.11_70)]'],
    alquilado: [t('Alquilado', 'Alugado'), 'bg-ok-soft text-ok'],
    descartada: [t('Descartada', 'Descartada'), 'bg-mist text-mute'],
  }
  const quincenas = PERIODS.filter((p) => p.id !== 'temporada')
  const demo = (what: string) => notify(user?.email ?? '', t(`Demo: en la versión final esto ${what}.`, `Demo: na versão final isto ${what}.`))

  return (
    <div className="pt-28 pb-24 md:pt-32">
      <div className="shell flex flex-col gap-14">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-mute">{t('Panel del propietario', 'Painel do proprietário')}</p>
            <h1 className="f-h2 text-[clamp(2rem,4vw,3.25rem)]">
              {t('Hola', 'Olá')}
              {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
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
                {t(
                  'Es obligatoria para propietarios: evita que alguien que acceda a tu email cambie tu teléfono y engañe a los interesados.',
                  'É obrigatória para proprietários: evita que alguém que acesse seu e-mail troque seu telefone e engane os interessados.',
                )}
              </span>
            </p>
            <ButtonLink to="/cuenta#seguridad" variant="ink" size="sm" className="shrink-0">
              {t('Activar ahora', 'Ativar agora')}
            </ButtonLink>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] bg-line ring-1 ring-line lg:grid-cols-4">
          {[
            [t('Consultas nuevas', 'Consultas novas'), String(fresh.length), t('Respondé rápido: es lo que más convierte', 'Responda rápido: é o que mais converte')],
            [t('Consultas recibidas', 'Consultas recebidas'), String(myInquiries.length), t('Temporada 2026 – 27', 'Temporada 2026 – 27')],
            [t('Quincenas alquiladas', 'Quinzenas alugadas'), `${rentedQ} / ${offered}`, t('Las marcás vos en cada unidad', 'Você marca em cada unidade')],
            [t('Tu plan', 'Seu plano'), t('Gratis', 'Grátis'), t(`Primer año, hasta el ${longDate(freeUntil, lang)}`, `Primeiro ano, até ${longDate(freeUntil, lang)}`)],
          ].map(([k, v, s]) => (
            <div key={k} className="flex flex-col gap-1 bg-bg p-5 md:p-6">
              <dt className="text-[0.8125rem] text-mute">{k}</dt>
              <dd className="f-num text-[1.375rem] font-semibold">{v}</dd>
              <dd className="text-[0.75rem] text-mute">{s}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="inq-title" className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 id="inq-title" className="f-h3 text-[1.375rem]">
              {t('Consultas', 'Consultas')}
            </h2>
            <div className="flex rounded-full bg-mist p-1" role="group" aria-label={t('Filtrar consultas', 'Filtrar consultas')}>
              {(
                [
                  ['nuevas', t(`Nuevas (${fresh.length})`, `Novas (${fresh.length})`)],
                  ['todas', t(`Todas (${myInquiries.length})`, `Todas (${myInquiries.length})`)],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={filter === v}
                  onClick={() => setFilter(v)}
                  className={cx('min-h-9 rounded-full px-4 text-[0.8125rem] font-medium transition-colors', filter === v ? 'bg-bg shadow-[var(--shadow-float)]' : 'text-mute hover:text-ink')}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          {shown.length ? (
            <ul className="flex flex-col gap-4">
              {shown.map((q) => {
                const u = mine.find((x) => x.id === q.unitId)!
                const [label, tone] = statusLabel[q.status]
                return (
                  <li key={q.id} className="flex flex-col gap-4 rounded-[20px] p-5 ring-1 ring-line md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-col gap-0.5">
                        <p className="font-semibold">
                          {q.guest.name} <span className="font-normal text-mute">· {q.guest.country} · {q.guest.guests} {t('personas', 'pessoas')}{q.guest.pet ? t(' · con mascota', ' · com animal') : ''}</span>
                        </p>
                        <p className="text-[0.875rem] text-mute">
                          {BUILDING_BY_ID[u.buildingId].name} · {u.unit} · {q.period ? `${PERIOD_BY_ID[q.period].name[lang]} (${usd(u.prices[q.period] ?? 0, lang)})` : t('sin período definido', 'sem período definido')} · {dateTime(q.createdAt, lang)}
                        </p>
                      </div>
                      <span className={cx('rounded-full px-2.5 py-1 text-[0.75rem] font-medium', tone)}>{label}</span>
                    </div>
                    <p className="prose-evp text-[0.9375rem]">“{q.message}”</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="ink" trailing={<WhatsappLogo size={14} />} onClick={() => { demo(t(`abre WhatsApp con ${q.guest.phone}`, `abre o WhatsApp com ${q.guest.phone}`)); if (q.status === 'nueva') setInquiryStatus(q.id, 'respondida') }}>
                        WhatsApp
                      </Button>
                      <Button size="sm" variant="outline" trailing={<Envelope size={14} />} onClick={() => { demo(t(`abre tu email para responder a ${q.guest.email}`, `abre seu e-mail para responder a ${q.guest.email}`)); if (q.status === 'nueva') setInquiryStatus(q.id, 'respondida') }}>
                        Email
                      </Button>
                      <span className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden />
                      {q.status !== 'alquilado' && q.period && isAvailable(q.period, u.booked) && (
                        <Button size="sm" variant="ghost" onClick={() => setInquiryStatus(q.id, 'alquilado')}>
                          {t('Se lo alquilé', 'Aluguei para essa pessoa')}
                        </Button>
                      )}
                      {q.status !== 'descartada' && q.status !== 'alquilado' && (
                        <Button size="sm" variant="ghost" onClick={() => setInquiryStatus(q.id, 'descartada')}>
                          {t('Descartar', 'Descartar')}
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="flex items-center gap-3 rounded-[16px] bg-mist p-5 text-mute">
              <ChatCircleText size={20} />
              {filter === 'nuevas' ? t('No tenés consultas nuevas.', 'Você não tem consultas novas.') : t('Todavía no recibiste consultas. Cuando lleguen, las vas a ver acá y en tu email.', 'Você ainda não recebeu consultas. Quando chegarem, você as verá aqui e no seu e-mail.')}
            </p>
          )}
        </section>

        <section aria-labelledby="mine-title" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 id="mine-title" className="f-h3 text-[1.375rem]">
              {t('Mis unidades y disponibilidad', 'Minhas unidades e disponibilidade')}
            </h2>
            <p className="text-[0.9375rem] text-mute">{t('Tocá un período para marcarlo como alquilado o volver a ofrecerlo.', 'Toque um período para marcá-lo como alugado ou voltar a oferecê-lo.')}</p>
          </div>
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
                    <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 xl:grid-cols-7" aria-label={t('Disponibilidad por período', 'Disponibilidade por período')}>
                      {quincenas.map((p) => {
                        const price = u.prices[p.id]
                        const marked = u.booked.includes(p.id)
                        const blocked = !marked && !isAvailable(p.id, u.booked)
                        const state = price === undefined ? 'off' : marked ? 'rented' : blocked ? 'blocked' : 'free'
                        return (
                          <li key={p.id}>
                            <button
                              type="button"
                              disabled={state === 'off' || state === 'blocked'}
                              aria-pressed={state === 'rented'}
                              onClick={() => toggleRented(u.id, p.id)}
                              title={state === 'blocked' ? t('Incluido en otro período alquilado', 'Incluído em outro período alugado') : undefined}
                              className={cx(
                                'flex w-full flex-col items-start rounded-[10px] px-2.5 py-2 text-left text-[0.75rem] transition-colors duration-200',
                                state === 'rented' && 'bg-ink text-on-ink hover:bg-ink-2',
                                state === 'blocked' && 'bg-ink/70 text-on-ink',
                                state === 'free' && 'bg-bg ring-1 ring-line-strong ring-inset hover:ring-mute',
                                state === 'off' && 'bg-mist text-mute',
                              )}
                            >
                              <span className="font-semibold">{p.short[lang]}</span>
                              <span className="f-num opacity-80">{state === 'rented' || state === 'blocked' ? t('Alquilado', 'Alugado') : state === 'free' ? usd(price!, lang) : t('Uso propio', 'Uso próprio')}</span>
                            </button>
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

        <ListingContact />

        <InfoNote>
          {t(
            'EVP no intermedia ni cobra comisión: el contrato, la seña y el pago los acordás directamente con el inquilino. Te recomendamos un contrato de arrendamiento de temporada por escrito.',
            'A EVP não intermedeia nem cobra comissão: o contrato, o sinal e o pagamento são acertados diretamente com o inquilino. Recomendamos um contrato de locação por temporada por escrito.',
          )}
        </InfoNote>
      </div>
    </div>
  )
}
