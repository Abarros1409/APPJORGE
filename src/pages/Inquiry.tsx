import { ArrowLeft, ChatCircleText, CheckCircle, Phone, ShieldCheck, WhatsappLogo } from '@phosphor-icons/react'
import { useEffect, useId, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import { LoginFlow } from '../components/auth-ui'
import { PeriodPrice, UnitVisual } from '../components/units'
import { Button, ButtonLink, Field, InfoNote, cx } from '../components/ui'
import { maskPhone, useAuth } from '../lib/auth'
import { BUILDING_BY_ID, ZONE_NAME } from '../lib/data'
import { inquiryCode, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { isAvailable, isPeriodId, PERIODS, PERIOD_BY_ID, type PeriodId } from '../lib/periods'
import { useStore, type Inquiry as InquiryT } from '../lib/store'

/**
 * Prototype switch: contact buttons show a notice instead of opening WhatsApp
 * or dialing, so demo data never reaches a real phone number.
 */
const DEMO = true
const MAX_PER_DAY = 10

export function SafetyTips({ className }: { className?: string }) {
  const { t } = useLang()
  const tips = [
    t('Firmá un contrato de arrendamiento de temporada por escrito antes de pagar.', 'Assine um contrato de locação por temporada por escrito antes de pagar.'),
    t('Pedí ver el documento del propietario al firmar: EVP valida la titularidad, pero conviene confirmarlo.', 'Peça para ver o documento do proprietário ao assinar: a EVP valida a titularidade, mas vale confirmar.'),
    t('Desconfiá de precios muy por debajo del resto del edificio o de señas por medios difíciles de rastrear.', 'Desconfie de preços muito abaixo do resto do edifício ou de sinais por meios difíceis de rastrear.'),
    t('EVP nunca cobra alquileres ni señas. Si alguien te pide dinero en nombre de EVP, no pagues y reportalo.', 'A EVP nunca cobra aluguéis nem sinais. Se alguém pedir dinheiro em nome da EVP, não pague e denuncie.'),
  ]
  return (
    <section className={cx('flex flex-col gap-4 rounded-[18px] bg-mist p-5 md:p-6', className)} aria-labelledby="tips-t">
      <h2 id="tips-t" className="flex items-center gap-2 font-semibold">
        <ShieldCheck size={20} className="text-marine-strong" />
        {t('Para alquilar con tranquilidad', 'Para alugar com tranquilidade')}
      </h2>
      <ul className="flex flex-col gap-2.5 text-[0.9375rem]">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2.5">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-marine" />
            {tip}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Inquiry() {
  const { id = '' } = useParams()
  const [sp] = useSearchParams()
  const { t, lang } = useLang()
  const { unitById, addInquiry, inquiries } = useStore()
  const { user, updateUser, allUsers, notify } = useAuth()
  const fid = useId()
  const u = unitById(id)
  const raw = sp.get('periodo')
  const [period, setPeriod] = useState<PeriodId | ''>(isPeriodId(raw) ? raw : '')
  const [guest, setGuest] = useState<InquiryT['guest']>({ name: '', email: '', phone: '', country: lang === 'pt' ? 'BR' : 'AR', guests: 2, pet: false })
  // null = untouched: the message follows the defaults (period, guests) until the user edits it.
  const [message, setMessage] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [sent, setSent] = useState<InquiryT | null>(null)

  useEffect(() => {
    if (user) setGuest((g) => ({ ...g, email: user.email, name: g.name || user.name }))
  }, [user])

  // Unverified units can't be contacted (same 404 behaviour as the unit page).
  if (!u || u.verification) return <Navigate to="/buscar" replace />
  const b = BUILDING_BY_ID[u.buildingId]
  const agency = u.channel.type === 'agency' ? u.channel.agency : null
  const owner = u.ownerId ? allUsers.find((x) => x.id === u.ownerId) : undefined
  const contact = owner?.contact
  const offered = PERIODS.filter((p) => u.prices[p.id] !== undefined)
  const chosen = period || null
  const price = chosen ? u.prices[chosen] : undefined

  const unitLabel = `${b.name} · ${t('unidad', 'unidade')} ${u.unit}`
  const defaultMessage = t(
    `Hola, me interesa ${unitLabel}${chosen ? ` para la ${PERIOD_BY_ID[chosen].name.es.toLowerCase()}` : ''}. Somos ${guest.guests} ${guest.guests === 1 ? 'persona' : 'personas'}. ¿Está disponible?`,
    `Olá, tenho interesse em ${unitLabel}${chosen ? ` para ${PERIOD_BY_ID[chosen].name.pt.toLowerCase()}` : ''}. Somos ${guest.guests} ${guest.guests === 1 ? 'pessoa' : 'pessoas'}. Está disponível?`,
  )
  const body = message ?? defaultMessage

  const errors: Record<string, string> = {}
  if (guest.name.trim().split(/\s+/).length < 2) errors.name = t('Ingresá nombre y apellido.', 'Informe nome e sobrenome.')
  if (guest.phone.replace(/\D/g, '').length < 8) errors.phone = t('Incluí el código de país, por ejemplo +54 9 11…', 'Inclua o código do país, por exemplo +55 11…')
  if (guest.guests < 1 || guest.guests > u.guests) errors.guests = t(`La unidad admite hasta ${u.guests} huéspedes.`, `A unidade aceita até ${u.guests} hóspedes.`)
  if (chosen && !isAvailable(chosen, u.booked)) errors.period = t('Ese período ya está alquilado. Elegí otro o consultá sin período.', 'Esse período já está alugado. Escolha outro ou consulte sem período.')
  if (body.trim().length < 10) errors.message = t('Contale al propietario qué estás buscando.', 'Conte ao proprietário o que você procura.')
  if (!consent) errors.consent = t('Necesitamos tu autorización para enviarle tus datos al anunciante.', 'Precisamos da sua autorização para enviar seus dados ao anunciante.')
  const mine = user ? inquiries.filter((q) => q.guest.email.toLowerCase() === user.email) : []
  const today = mine.filter((q) => Date.now() - Date.parse(q.createdAt) < 86_400_000)
  const duplicate = today.find((q) => q.unitId === u.id && q.period === chosen)
  if (user && u.ownerId === user.id) errors.limit = t('Es tu propia unidad: las consultas de los interesados te llegan al panel.', 'É a sua própria unidade: as consultas dos interessados chegam ao seu painel.')
  else if (today.length >= MAX_PER_DAY) errors.limit = t('Llegaste al máximo de consultas por hoy. Probá de nuevo mañana.', 'Você atingiu o máximo de consultas por hoje. Tente de novo amanhã.')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setAttempted(true)
    if (Object.keys(errors).length) return
    const q: InquiryT = { id: inquiryCode(), unitId: u.id, period: chosen, createdAt: new Date().toISOString(), guest, message: body.trim(), status: 'nueva' }
    addInquiry(q)
    if (user && !user.name) updateUser({ name: guest.name.trim() })
    notify(agency ? agency : owner?.email ?? t('el propietario', 'o proprietário'), t(`Nueva consulta por ${unitLabel}`, `Nova consulta por ${unitLabel}`))
    setSent(q)
    window.scrollTo({ top: 0 })
  }

  const demoContact = (what: string) => notify(guest.email, t(`Demo: en la versión final esto ${what}.`, `Demo: na versão final isto ${what}.`))
  const err = (k: string) => (attempted ? errors[k] : undefined)

  const summary = (
    <aside aria-label={t('Unidad consultada', 'Unidade consultada')}>
      <div className="flex flex-col gap-5 rounded-[22px] p-5 ring-1 ring-line lg:sticky lg:top-28">
        <div className="flex gap-4">
          <div className="bezel w-28 shrink-0">
            <div className="aspect-square">
              <UnitVisual u={u} className="size-full" />
            </div>
          </div>
          <div className="flex min-w-0 flex-col justify-center gap-0.5">
            <p className="f-h3 text-[1rem]">{b.name}</p>
            <p className="text-[0.8125rem] text-mute">
              {t('Piso', 'Andar')} {u.floor} · {u.unit} · {ZONE_NAME[b.zone]}
            </p>
            <p className="text-[0.8125rem] text-mute">
              {u.bedrooms} {t('dorm.', 'quartos')} · {t('hasta', 'até')} {u.guests} {t('huésp.', 'hósp.')}
            </p>
          </div>
        </div>
        {chosen && price !== undefined ? (
          <PeriodPrice price={price} periodId={chosen} />
        ) : (
          <p className="text-[0.875rem] text-mute">{t('Sin período elegido: el propietario te cuenta qué tiene disponible.', 'Sem período escolhido: o proprietário informa o que tem disponível.')}</p>
        )}
        <p className="text-[0.8125rem] text-mute">
          {agency ? t(`Publicado por ${agency}, inmobiliaria.`, `Anunciado por ${agency}, imobiliária.`) : t('Publicado directamente por su propietario, verificado por EVP.', 'Anunciado diretamente pelo proprietário, verificado pela EVP.')}
        </p>
      </div>
    </aside>
  )

  if (sent) {
    return (
      <div className="pt-24 pb-24 md:pt-28">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
          <div className="flex flex-col gap-8">
            <div className="flex items-start gap-4 rounded-[18px] bg-ok-soft p-5 md:p-6" role="status">
              <CheckCircle size={28} weight="fill" className="shrink-0 text-ok" />
              <div>
                <h1 className="f-h3 text-[1.25rem]">{t('Consulta enviada', 'Consulta enviada')}</h1>
                <p className="text-[0.9375rem]">
                  {agency
                    ? t(`${agency} recibió tu consulta y te responde a ${sent.guest.email} o por WhatsApp.`, `${agency} recebeu sua consulta e responde em ${sent.guest.email} ou por WhatsApp.`)
                    : t(`El propietario recibió tu consulta y te responde a ${sent.guest.email} o por WhatsApp.`, `O proprietário recebeu sua consulta e responde em ${sent.guest.email} ou por WhatsApp.`)}
                </p>
              </div>
            </div>

            {contact && (
              <section className="flex flex-col gap-4 rounded-[18px] p-5 ring-1 ring-line md:p-6" aria-labelledby="contact-t">
                <h2 id="contact-t" className="font-semibold">
                  {t('¿Preferís escribirle ahora?', 'Prefere escrever agora?')}
                </h2>
                <p className="f-num text-[1.125rem]">{DEMO ? maskPhone(contact.phone) : contact.phone}</p>
                <div className="flex flex-wrap gap-3">
                  {contact.whatsapp && (
                    <Button variant="ink" trailing={<WhatsappLogo size={16} />} onClick={() => demoContact(t('abre WhatsApp con tu mensaje listo', 'abre o WhatsApp com sua mensagem pronta'))}>
                      WhatsApp
                    </Button>
                  )}
                  <Button variant="outline" trailing={<Phone size={16} />} onClick={() => demoContact(t('inicia la llamada', 'inicia a ligação'))}>
                    {t('Llamar', 'Ligar')}
                  </Button>
                </div>
                <p className="text-[0.8125rem] text-mute">{t('Solo lo ven personas con email verificado que enviaron una consulta.', 'Só é visível para pessoas com e-mail verificado que enviaram uma consulta.')}</p>
              </section>
            )}

            <SafetyTips />

            <div className="flex flex-wrap gap-3">
              <ButtonLink to="/cuenta#consultas" variant="outline">
                {t('Ver mis consultas', 'Ver minhas consultas')}
              </ButtonLink>
              <ButtonLink to="/buscar" variant="ghost">
                {t('Seguir buscando', 'Continuar buscando')}
              </ButtonLink>
            </div>
          </div>
          {summary}
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-24 md:pt-28">
      <div className="shell">
        <Link to={`/unidades/${u.id}${chosen ? `?periodo=${chosen}` : ''}`} className="mb-6 inline-flex min-h-10 items-center gap-2 text-[0.875rem] text-mute hover:text-ink">
          <ArrowLeft size={16} />
          {t('Volver a la unidad', 'Voltar à unidade')}
        </Link>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
          {!user ? (
            <section className="flex flex-col gap-6" aria-labelledby="gate-title">
              <h1 id="gate-title" className="f-h2 text-[clamp(1.8rem,3.2vw,2.6rem)]">
                {t('Primero, verificá tu email', 'Primeiro, verifique seu e-mail')}
              </h1>
              <p className="max-w-[52ch] text-mute">
                {t(
                  'Así el propietario sabe que la consulta es real y vos recibís su respuesta. Tu email no se publica. Sin contraseñas: te mandamos un código.',
                  'Assim o proprietário sabe que a consulta é real e você recebe a resposta. Seu e-mail não é publicado. Sem senhas: enviamos um código.',
                )}
              </p>
              <div className="max-w-md">
                <LoginFlow onDone={() => window.scrollTo({ top: 0 })} compact />
              </div>
            </section>
          ) : (
            <form onSubmit={submit} noValidate className="flex flex-col gap-7">
              <div className="flex flex-col gap-2">
                <h1 className="f-h2 text-[clamp(1.8rem,3.2vw,2.6rem)]">{agency ? t('Consultá a la inmobiliaria', 'Consulte a imobiliária') : t('Consultá al propietario', 'Consulte o proprietário')}</h1>
                <p className="text-mute">{t('Gratis y sin compromiso. EVP no intermedia ni cobra comisión.', 'Grátis e sem compromisso. A EVP não intermedeia nem cobra comissão.')}</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label={t('Período', 'Período')} htmlFor={`${fid}-p`} error={err('period')}>
                    <select id={`${fid}-p`} className="field" value={period} onChange={(e) => setPeriod(e.target.value as PeriodId | '')} aria-invalid={!!err('period') || undefined}>
                      <option value="">{t('Todavía no lo sé: quiero saber qué hay disponible', 'Ainda não sei: quero saber o que há disponível')}</option>
                      {offered.map((p) => {
                        const free = isAvailable(p.id, u.booked)
                        return (
                          <option key={p.id} value={p.id} disabled={!free}>
                            {p.name[lang]} · {free ? usd(u.prices[p.id]!, lang) : t('alquilado', 'alugado')}
                          </option>
                        )
                      })}
                    </select>
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label={t('Nombre y apellido', 'Nome e sobrenome')} htmlFor={`${fid}-n`} error={err('name')}>
                    <input id={`${fid}-n`} className="field" autoComplete="name" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} aria-invalid={!!err('name') || undefined} />
                  </Field>
                </div>
                <Field label="Email" htmlFor={`${fid}-e`} hint={t('Verificado. Ahí te llega la respuesta.', 'Verificado. A resposta chega aqui.')}>
                  <input id={`${fid}-e`} type="email" readOnly value={guest.email} className="field bg-mist text-mute" />
                </Field>
                <Field label={t('Teléfono / WhatsApp', 'Telefone / WhatsApp')} htmlFor={`${fid}-t`} error={err('phone')}>
                  <input id={`${fid}-t`} type="tel" inputMode="tel" autoComplete="tel" className="field" placeholder={lang === 'pt' ? '+55 11 9…' : '+54 9 11…'} value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} aria-invalid={!!err('phone') || undefined} />
                </Field>
                <Field label={t('País de residencia', 'País de residência')} htmlFor={`${fid}-c`}>
                  <select id={`${fid}-c`} className="field" autoComplete="country" value={guest.country} onChange={(e) => setGuest({ ...guest, country: e.target.value as InquiryT['guest']['country'] })}>
                    <option value="AR">Argentina</option>
                    <option value="BR">Brasil</option>
                    <option value="UY">Uruguay</option>
                    <option value="OTRO">{t('Otro', 'Outro')}</option>
                  </select>
                </Field>
                <Field label={t('Cantidad de huéspedes', 'Quantidade de hóspedes')} htmlFor={`${fid}-g`} error={err('guests')} hint={t(`Máximo ${u.guests} en esta unidad.`, `Máximo ${u.guests} nesta unidade.`)}>
                  <input id={`${fid}-g`} type="number" min={1} max={u.guests} inputMode="numeric" className="field" value={guest.guests} onChange={(e) => setGuest({ ...guest, guests: Number(e.target.value) })} aria-invalid={!!err('guests') || undefined} />
                </Field>
                {u.pet && (
                  <label className="flex items-center gap-3 rounded-[12px] p-4 ring-1 ring-line ring-inset sm:col-span-2">
                    <input type="checkbox" className="size-4 accent-[var(--color-ink)]" checked={guest.pet} onChange={(e) => setGuest({ ...guest, pet: e.target.checked })} />
                    <span>{t('Viajo con mascota', 'Viajo com animal de estimação')}</span>
                  </label>
                )}
                <div className="sm:col-span-2">
                  <Field label={t('Mensaje', 'Mensagem')} htmlFor={`${fid}-m`} error={err('message')}>
                    <textarea id={`${fid}-m`} className="field min-h-32" value={body} onChange={(e) => setMessage(e.target.value)} aria-invalid={!!err('message') || undefined} />
                  </Field>
                </div>
              </div>

              <label className={cx('flex items-start gap-3 rounded-[12px] p-4 text-[0.9375rem] ring-1 ring-inset', attempted && !consent ? 'ring-bad' : 'ring-line')}>
                <input type="checkbox" className="mt-1 size-4 accent-[var(--color-ink)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>
                  {agency
                    ? t(`Autorizo a EVP a enviar mi nombre, email y teléfono a ${agency} para responder esta consulta.`, `Autorizo a EVP a enviar meu nome, e-mail e telefone para ${agency} responder esta consulta.`)
                    : t('Autorizo a EVP a enviar mi nombre, email y teléfono al propietario para responder esta consulta.', 'Autorizo a EVP a enviar meu nome, e-mail e telefone ao proprietário para responder esta consulta.')}
                </span>
              </label>
              {(err('consent') || err('limit')) && (
                <p role="alert" className="text-[0.875rem] text-bad">
                  {err('limit') ?? err('consent')}
                </p>
              )}
              {duplicate && (
                <InfoNote>{t('Ya enviaste una consulta igual hoy. Si la mandás de nuevo, el propietario la recibe duplicada.', 'Você já enviou uma consulta igual hoje. Se enviar de novo, o proprietário a recebe em duplicidade.')}</InfoNote>
              )}
              <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.8125rem] text-mute">{t('El contrato y el pago los acordás directamente con el anunciante.', 'O contrato e o pagamento são acertados diretamente com o anunciante.')}</p>
                <Button type="submit" size="lg" trailing={<ChatCircleText size={16} />}>
                  {t('Enviar consulta', 'Enviar consulta')}
                </Button>
              </div>
            </form>
          )}
          {summary}
        </div>
      </div>
    </div>
  )
}
