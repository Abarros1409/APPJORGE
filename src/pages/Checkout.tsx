import { ArrowLeft, CreditCard, Lock, QrCode, ShieldCheck, Copy, Check } from '@phosphor-icons/react'
import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { ContractDoc, RULES_ES, RULES_PT, SignaturePad } from '../components/Contract'
import { PriceBreakdown, UnitVisual } from '../components/units'
import { Button, Field, InfoNote, cx } from '../components/ui'
import { BUILDING_BY_ID, ZONE_NAME } from '../lib/data'
import { bookingCode, breakdown, dateRange, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { isAvailable, isPeriodId, PERIOD_BY_ID } from '../lib/periods'
import { useStore, type Booking, type PaymentMethod } from '../lib/store'
import { useAuth } from '../lib/auth'
import { LoginFlow } from '../components/auth-ui'

type Guest = Booking['guest']

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

function luhn(num: string) {
  const d = num.replace(/\D/g, '')
  if (d.length < 13 || d.length > 19) return false
  let sum = 0
  let alt = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i])
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

function brand(num: string) {
  const d = num.replace(/\D/g, '')
  if (/^4/.test(d)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard'
  if (/^3[47]/.test(d)) return 'American Express'
  return 'Tarjeta'
}

function PixQR({ seed }: { seed: string }) {
  // Decorative demo QR (not a real payment code).
  const n = 25
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const cells: React.ReactNode[] = []
  const finder = (x: number, y: number) => x < 7 && y < 7
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const inFinder = finder(x, y) || finder(n - 1 - x, y) || finder(x, n - 1 - y)
      if (inFinder) continue
      h = (h * 1103515245 + 12345) >>> 0
      if ((h >>> 16) % 2) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />)
    }
  const F = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width={7} height={7} />
      <rect x={1} y={1} width={5} height={5} fill="white" />
      <rect x={2} y={2} width={3} height={3} />
    </g>
  )
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className="size-44 rounded-[10px] bg-white" aria-label="Código QR PIX de demostración" role="img">
      <g fill="oklch(0.205 0.035 240)">
        {cells}
        <F x={0} y={0} />
        <F x={n - 7} y={0} />
        <F x={0} y={n - 7} />
      </g>
    </svg>
  )
}

export default function Checkout() {
  const { id = '' } = useParams()
  const [sp] = useSearchParams()
  const { t, lang } = useLang()
  const { unitById, addBooking } = useStore()
  const { user, updateUser } = useAuth()
  const nav = useNavigate()
  const u = unitById(id)
  const raw = sp.get('periodo')
  const [step, setStep] = useState(0)
  const [attempted, setAttempted] = useState(false)
  const [guest, setGuest] = useState<Guest>({ name: '', email: '', phone: '', doc: '', country: lang === 'pt' ? 'BR' : 'AR', guests: 2, pet: false })
  const [acceptContract, setAcceptContract] = useState(false)
  const [acceptRules, setAcceptRules] = useState(false)
  const [signature, setSignature] = useState('')
  const [method, setMethod] = useState<PaymentMethod>(lang === 'pt' ? 'pix' : 'card')
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvc: '' })
  const [paying, setPaying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [code] = useState(bookingCode)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const done = useRef(false)
  const fid = useId()
  const today = useMemo(() => new Date().toISOString(), [])

  useEffect(() => {
    headingRef.current?.focus()
  }, [step])
  // The booking holder's email is the verified account email (it's what authorizes access to the booking later).
  useEffect(() => {
    if (user) setGuest((g) => ({ ...g, email: user.email, name: g.name || user.name }))
  }, [user])

  if (!u || !isPeriodId(raw)) return <Navigate to={u ? `/unidades/${u.id}` : '/buscar'} replace />
  const period = raw
  const net = u.prices[period]
  if (net === undefined || (!done.current && !isAvailable(period, u.booked))) return <Navigate to={`/unidades/${u.id}`} replace />
  const b = BUILDING_BY_ID[u.buildingId]
  const { fee, total } = breakdown(net)

  const errors1: Partial<Record<keyof Guest, string>> = {}
  if (guest.name.trim().split(/\s+/).length < 2) errors1.name = t('Ingresá nombre y apellido.', 'Informe nome e sobrenome.')
  if (!emailOk(guest.email)) errors1.email = t('Revisá el email: por ejemplo nombre@dominio.com', 'Confira o e-mail: por exemplo nome@dominio.com')
  if (guest.phone.replace(/\D/g, '').length < 8) errors1.phone = t('Incluí el código de país, por ejemplo +54 9 11…', 'Inclua o código do país, por exemplo +55 11…')
  if (guest.doc.trim().length < 5) errors1.doc = t('Ingresá tu documento o pasaporte.', 'Informe seu documento ou passaporte.')
  if (guest.guests < 1 || guest.guests > u.guests) errors1.guests = t(`La unidad admite hasta ${u.guests} huéspedes.`, `A unidade aceita até ${u.guests} hóspedes.`)

  const exp = card.exp.match(/^(\d{2})\/(\d{2})$/)
  const expOk = !!exp && +exp[1] >= 1 && +exp[1] <= 12 && new Date(2000 + +exp[2], +exp[1]) > new Date()
  const errors3: Record<string, string> = {}
  if (method === 'card') {
    if (!luhn(card.number)) errors3.number = t('El número de tarjeta no es válido.', 'O número do cartão não é válido.')
    if (card.name.trim().length < 3) errors3.name = t('Como figura en la tarjeta.', 'Como aparece no cartão.')
    if (!expOk) errors3.exp = t('Usá el formato MM/AA y una fecha futura.', 'Use o formato MM/AA e uma data futura.')
    if (!/^\d{3,4}$/.test(card.cvc)) errors3.cvc = t('3 o 4 dígitos.', '3 ou 4 dígitos.')
  }

  const steps = [t('Tus datos', 'Seus dados'), t('Contrato', 'Contrato'), t('Pago', 'Pagamento')]

  const next = (e: FormEvent) => {
    e.preventDefault()
    setAttempted(true)
    if (step === 0 && Object.keys(errors1).length) return
    if (step === 1 && !(acceptContract && acceptRules && signature)) return
    if (step === 2) {
      if (Object.keys(errors3).length) return
      setPaying(true)
      window.setTimeout(() => {
        const now = new Date().toISOString()
        done.current = true
        if (user && !user.name) updateUser({ name: guest.name.trim() })
        addBooking({
          code,
          unitId: u.id,
          period,
          createdAt: now,
          guest,
          net,
          fee,
          total,
          method,
          methodDetail: method === 'card' ? `${brand(card.number)} •••• ${card.number.replace(/\D/g, '').slice(-4)}` : 'PIX · dLocal / EBANX',
          signature,
          signedAt: now,
        })
        nav(`/reserva/${code}?nueva=1`, { replace: true })
      }, 1400)
      return
    }
    setAttempted(false)
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const err = (k: string, map: Record<string, string | undefined>) => (attempted ? map[k] : undefined)
  const inputProps = (k: string, map: Record<string, string | undefined>) => ({
    id: `${fid}-${k}`,
    'aria-invalid': attempted && !!map[k] ? true : undefined,
    'aria-describedby': attempted && map[k] ? `${fid}-${k}-err` : undefined,
    className: 'field',
  })

  const pixCode = `00020126580014BR.GOV.BCB.PIX0136evp-demo-${code.toLowerCase()}5204000053039865406${total}.005802BR5903EVP6013PUNTADELESTE`

  return (
    <div className="pt-24 pb-24 md:pt-28">
      <div className="shell">
        <Link to={`/unidades/${u.id}?periodo=${period}`} className="mb-6 inline-flex min-h-10 items-center gap-2 text-[0.875rem] text-mute hover:text-ink">
          <ArrowLeft size={16} />
          {t('Volver a la unidad', 'Voltar à unidade')}
        </Link>

        <ol className="mb-10 flex items-center gap-2 sm:gap-3" aria-label={t('Pasos de la reserva', 'Etapas da reserva')}>
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2 sm:gap-3" aria-current={i === step ? 'step' : undefined}>
              <span
                className={cx(
                  'f-num flex size-8 shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-semibold transition-colors duration-300',
                  i < step ? 'bg-ok text-white' : i === step ? 'bg-ink text-on-ink' : 'bg-mist text-mute',
                )}
              >
                {i < step ? <Check size={14} weight="bold" /> : i + 1}
              </span>
              <span className={cx('text-[0.875rem] font-medium', i === step ? 'text-ink' : 'text-mute max-sm:sr-only')}>{s}</span>
              {i < steps.length - 1 && <span aria-hidden className={cx('h-px flex-1', i < step ? 'bg-ok' : 'bg-line')} />}
            </li>
          ))}
        </ol>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
          {step === 0 && !user ? (
            <section className="flex flex-col gap-6" aria-labelledby="gate-title">
              <h1 id="gate-title" className="f-h2 text-[clamp(1.8rem,3.2vw,2.6rem)]">
                {t('Primero, verificá tu email', 'Primeiro, verifique seu e-mail')}
              </h1>
              <p className="max-w-[52ch] text-mute">
                {t(
                  'Es tu cuenta EVP: ahí recibís el contrato y desde ahí accedés a tu reserva. Sin contraseñas: te mandamos un código.',
                  'É sua conta EVP: nela você recebe o contrato e acessa sua reserva. Sem senhas: enviamos um código.',
                )}
              </p>
              <div className="max-w-md">
                <LoginFlow onDone={() => window.scrollTo({ top: 0 })} compact />
              </div>
            </section>
          ) : (
          <form onSubmit={next} noValidate className="flex flex-col gap-8">
            <h1 ref={headingRef} tabIndex={-1} className="f-h2 text-[clamp(1.8rem,3.2vw,2.6rem)] outline-none">
              {step === 0 && t('¿Quién viaja?', 'Quem vai viajar?')}
              {step === 1 && t('Contrato y reglamento', 'Contrato e regulamento')}
              {step === 2 && t('Pago en custodia', 'Pagamento em custódia')}
            </h1>

            {step === 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label={t('Nombre y apellido del titular', 'Nome e sobrenome do titular')} htmlFor={`${fid}-name`} error={err('name', errors1)}>
                    <input {...inputProps('name', errors1)} autoComplete="name" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} />
                  </Field>
                </div>
                <Field label="Email" htmlFor={`${fid}-email`} error={err('email', errors1)} hint={t('Verificado. Ahí te enviamos el contrato firmado.', 'Verificado. Enviaremos o contrato assinado para este e-mail.')}>
                  <input {...inputProps('email', errors1)} type="email" readOnly value={guest.email} className="field bg-mist text-mute" />
                </Field>
                <Field label={t('Teléfono / WhatsApp', 'Telefone / WhatsApp')} htmlFor={`${fid}-phone`} error={err('phone', errors1)}>
                  <input {...inputProps('phone', errors1)} type="tel" inputMode="tel" autoComplete="tel" placeholder={lang === 'pt' ? '+55 11 9…' : '+54 9 11…'} value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
                </Field>
                <Field label={t('País de residencia', 'País de residência')} htmlFor={`${fid}-country`}>
                  <select id={`${fid}-country`} className="field" autoComplete="country" value={guest.country} onChange={(e) => setGuest({ ...guest, country: e.target.value as Guest['country'] })}>
                    <option value="AR">Argentina</option>
                    <option value="BR">Brasil</option>
                    <option value="UY">Uruguay</option>
                    <option value="OTRO">{t('Otro', 'Outro')}</option>
                  </select>
                </Field>
                <Field label={t('Documento o pasaporte', 'Documento ou passaporte')} htmlFor={`${fid}-doc`} error={err('doc', errors1)} hint={t('Lo pide la ley para el contrato y el registro en portería.', 'Exigido por lei para o contrato e o registro na portaria.')}>
                  <input {...inputProps('doc', errors1)} value={guest.doc} onChange={(e) => setGuest({ ...guest, doc: e.target.value })} />
                </Field>
                <Field label={t('Cantidad de huéspedes', 'Quantidade de hóspedes')} htmlFor={`${fid}-guests`} error={err('guests', errors1)} hint={t(`Máximo ${u.guests} en esta unidad.`, `Máximo ${u.guests} nesta unidade.`)}>
                  <input {...inputProps('guests', errors1)} type="number" min={1} max={u.guests} inputMode="numeric" value={guest.guests} onChange={(e) => setGuest({ ...guest, guests: Number(e.target.value) })} />
                </Field>
                <label className={cx('flex items-start gap-3 rounded-[12px] p-4 ring-1 ring-line ring-inset sm:col-span-2', !u.pet && 'opacity-60')}>
                  <input type="checkbox" className="mt-1 size-4 accent-[var(--color-ink)]" disabled={!u.pet} checked={guest.pet} onChange={(e) => setGuest({ ...guest, pet: e.target.checked })} />
                  <span className="flex flex-col">
                    <span className="font-medium">{t('Viajo con mascota', 'Viajo com animal de estimação')}</span>
                    <span className="text-[0.8125rem] text-mute">{u.pet ? t('Esta unidad es pet friendly según el reglamento del edificio.', 'Esta unidade é pet friendly conforme o regulamento.') : t('Esta unidad no admite mascotas.', 'Esta unidade não aceita animais.')}</span>
                  </span>
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div className="max-h-[28rem] overflow-y-auto rounded-[16px] bg-bg p-5 ring-1 ring-line md:p-7" tabIndex={0} aria-label={t('Contrato de arrendamiento', 'Contrato de locação')}>
                  <ContractDoc d={{ unit: u, period, net, fee, guest, date: today, code, signature }} />
                </div>
                <details className="group rounded-[14px] bg-mist p-5">
                  <summary className="flex items-center justify-between font-semibold">
                    {t(`Reglamento de copropiedad · ${b.name}`, `Regulamento do condomínio · ${b.name}`)}
                    <span className="text-[0.8125rem] font-normal text-mute group-open:hidden">{t('Ver', 'Ver')}</span>
                  </summary>
                  <ul className="mt-3 list-disc pl-5 text-[0.9375rem]">
                    {(lang === 'es' ? RULES_ES : RULES_PT).map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </details>
                <fieldset className="flex flex-col gap-3">
                  <legend className="sr-only">{t('Aceptaciones', 'Aceites')}</legend>
                  {[
                    [acceptContract, setAcceptContract, t('Leí y acepto el contrato de arrendamiento de temporada.', 'Li e aceito o contrato de locação por temporada.')],
                    [acceptRules, setAcceptRules, t(`Acepto el reglamento de copropiedad de ${b.name}.`, `Aceito o regulamento do condomínio do ${b.name}.`)],
                  ].map(([v, setV, label], i) => (
                    <label key={i} className={cx('flex items-start gap-3 rounded-[12px] p-4 ring-1 ring-inset', attempted && !v ? 'ring-bad' : 'ring-line')}>
                      <input type="checkbox" className="mt-1 size-4 accent-[var(--color-ink)]" checked={v as boolean} onChange={(e) => (setV as (b: boolean) => void)(e.target.checked)} />
                      <span>{label as string}</span>
                    </label>
                  ))}
                </fieldset>
                <SignaturePad label={t('Firma digital del arrendatario', 'Assinatura digital do locatário')} onChange={setSignature} />
                {attempted && !(acceptContract && acceptRules && signature) && (
                  <p role="alert" className="text-[0.875rem] text-bad">
                    {t('Para continuar, aceptá el contrato y el reglamento y firmá.', 'Para continuar, aceite o contrato e o regulamento e assine.')}
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('Medio de pago', 'Meio de pagamento')}>
                  {(
                    [
                      ['card', <CreditCard key="c" size={22} weight="light" />, t('Tarjeta internacional', 'Cartão internacional'), 'Stripe · dLocal'],
                      ['pix', <QrCode key="q" size={22} weight="light" />, 'PIX', 'dLocal · EBANX'],
                    ] as const
                  ).map(([v, icon, title, sub]) => (
                    <label
                      key={v}
                      className={cx(
                        'flex min-h-20 flex-col justify-center gap-1 rounded-[14px] px-4 py-3 ring-1 ring-inset transition-colors duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-marine-strong',
                        method === v ? 'bg-ink text-on-ink ring-ink' : 'ring-line-strong hover:ring-mute',
                      )}
                    >
                      <input type="radio" name="method" className="sr-only" checked={method === v} onChange={() => setMethod(v)} />
                      <span className="flex items-center gap-2 font-semibold">
                        {icon}
                        {title}
                      </span>
                      <span className={cx('text-[0.8125rem]', method === v ? 'text-on-ink-mute' : 'text-mute')}>{sub}</span>
                    </label>
                  ))}
                </div>

                {method === 'card' ? (
                  <div className="grid gap-5 sm:grid-cols-[2fr_1fr_1fr]">
                    <div className="sm:col-span-3">
                      <Field label={t('Número de tarjeta', 'Número do cartão')} htmlFor={`${fid}-number`} error={err('number', errors3)}>
                        <input
                          {...inputProps('number', errors3)}
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="4242 4242 4242 4242"
                          value={card.number}
                          onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ') })}
                        />
                      </Field>
                    </div>
                    <Field label={t('Nombre en la tarjeta', 'Nome no cartão')} htmlFor={`${fid}-name`} error={err('name', errors3)}>
                      <input {...inputProps('name', errors3)} autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                    </Field>
                    <Field label={t('Vencimiento', 'Validade')} htmlFor={`${fid}-exp`} error={err('exp', errors3)}>
                      <input
                        {...inputProps('exp', errors3)}
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/AA"
                        value={card.exp}
                        onChange={(e) => {
                          const d = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setCard({ ...card, exp: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d })
                        }}
                      />
                    </Field>
                    <Field label="CVC" htmlFor={`${fid}-cvc`} error={err('cvc', errors3)}>
                      <input {...inputProps('cvc', errors3)} inputMode="numeric" autoComplete="cc-csc" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
                    </Field>
                    <p className="text-[0.8125rem] text-mute sm:col-span-3">
                      {t('Se cobra en USD. Si tu tarjeta es argentina, el banco aplica su tipo de cambio e impuestos.', 'Cobrança em USD. O banco emissor aplica o câmbio e o IOF correspondentes.')}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-5 rounded-[16px] bg-mist p-6 text-center sm:flex-row sm:text-left">
                    <PixQR seed={code} />
                    <div className="flex flex-col gap-3">
                      <p className="font-semibold">{t('Escaneá el QR desde la app de tu banco', 'Escaneie o QR no app do seu banco')}</p>
                      <p className="text-[0.875rem] text-mute">
                        {t('El monto se convierte de USD a BRL al tipo de cambio del momento del pago. La acreditación es instantánea.', 'O valor é convertido de USD para BRL pela cotação no momento do pagamento. A confirmação é instantânea.')}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(pixCode).catch(() => {})
                          setCopied(true)
                          window.setTimeout(() => setCopied(false), 2000)
                        }}
                        className="inline-flex min-h-10 items-center gap-2 self-center rounded-full px-4 text-[0.875rem] font-medium ring-1 ring-line-strong ring-inset hover:bg-bg sm:self-start"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? t('Copiado', 'Copiado') : 'PIX copia e cola'}
                      </button>
                    </div>
                  </div>
                )}

                <InfoNote tone="ok">
                  <strong>{t('Tu pago queda en custodia.', 'Seu pagamento fica em custódia.')}</strong>{' '}
                  {t(
                    'EVP lo retiene y se lo transfiere al propietario 24–48 h después de tu check-in, una vez que confirmes el inventario.',
                    'A EVP retém o valor e o transfere ao proprietário 24–48 h após o seu check-in, depois que você confirmar o inventário.',
                  )}
                </InfoNote>
                <p className="flex items-center gap-2 text-[0.8125rem] text-mute">
                  <Lock size={14} />
                  {t('Modo demostración: no se realiza ningún cobro. Probá con 4242 4242 4242 4242.', 'Modo demonstração: nenhuma cobrança é feita. Teste com 4242 4242 4242 4242.')}
                </p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={paying}>
                  {t('Atrás', 'Voltar')}
                </Button>
              ) : (
                <span />
              )}
              <Button type="submit" size="lg" trailing={!paying} loading={paying}>
                {step === 0 && t('Continuar al contrato', 'Continuar para o contrato')}
                {step === 1 && t('Firmar y continuar al pago', 'Assinar e continuar')}
                {step === 2 && (paying ? t('Procesando…', 'Processando…') : method === 'pix' ? t('Ya pagué con PIX', 'Já paguei com PIX') : `${t('Pagar', 'Pagar')} ${usd(total, lang)}`)}
              </Button>
            </div>
          </form>
          )}

          <aside aria-label={t('Resumen de la reserva', 'Resumo da reserva')} className="lg:order-none">
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
              <div className="rounded-[12px] bg-mist px-4 py-3">
                <p className="font-semibold">{PERIOD_BY_ID[period].name[lang]}</p>
                <p className="f-num text-[0.8125rem] text-mute">{dateRange(period, lang)} · {t('check-in 15 h, check-out 11 h', 'check-in 15 h, check-out 11 h')}</p>
              </div>
              <PriceBreakdown net={net} periodId={period} />
              <p className="flex items-center gap-2 text-[0.8125rem] text-mute">
                <ShieldCheck size={16} className="text-ok" />
                {t('Reserva N.º', 'Reserva N.º')} <span className="f-num font-medium text-ink">{code}</span>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
