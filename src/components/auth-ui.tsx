import { ChatCircleText, EnvelopeSimple, LockKey, ShieldCheck, X } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { emailValid, isOwner, maskPhone, useAuth, type CodeResult, type Role } from '../lib/auth'
import { useLang } from '../lib/i18n'
import { Button, ButtonLink, Field, cx } from './ui'

export function useCodeError() {
  const { t } = useLang()
  return (r: CodeResult | { ok: true; next: string }): string => {
    if (r.ok) return ''
    switch (r.reason) {
      case 'invalid':
        return t(`Código incorrecto. Te quedan ${r.remaining} intentos.`, `Código incorreto. Restam ${r.remaining} tentativas.`)
      case 'expired':
        return t('El código venció. Pedí uno nuevo.', 'O código expirou. Peça um novo.')
      case 'locked': {
        const min = Math.max(1, Math.ceil(((r.retryAt ?? 0) - Date.now()) / 60_000))
        return t(`Demasiados intentos. Por seguridad, probá de nuevo en ${min} min.`, `Muitas tentativas. Por segurança, tente de novo em ${min} min.`)
      }
      case 'cooldown': {
        const s = Math.max(1, Math.ceil(((r.retryAt ?? 0) - Date.now()) / 1000))
        return t(`Podés pedir otro código en ${s} s.`, `Você pode pedir outro código em ${s} s.`)
      }
      default:
        return t('Pedí un código nuevo.', 'Peça um novo código.')
    }
  }
}

export function CodeInput({ id, value, onChange, invalid, describedBy }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean; describedBy?: string }) {
  return (
    <input
      id={id}
      className="field f-num h-16 text-center text-[1.75rem] font-semibold tracking-[0.5em]"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]*"
      maxLength={6}
      value={value}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
      autoFocus
    />
  )
}

function ResendButton() {
  const { t } = useLang()
  const { resend, pending } = useAuth()
  const [now, setNow] = useState(Date.now())
  const [msg, setMsg] = useState('')
  const err = useCodeError()
  useEffect(() => {
    const i = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(i)
  }, [])
  const wait = pending ? Math.max(0, Math.ceil((pending.sentAt + 30_000 - now) / 1000)) : 0
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={wait > 0}
        onClick={() => {
          const r = resend()
          setMsg(r.ok ? t('Te enviamos un código nuevo.', 'Enviamos um novo código.') : err(r))
        }}
        className="self-start text-[0.875rem] font-medium text-marine-strong underline-offset-4 hover:underline disabled:text-mute disabled:no-underline"
      >
        {wait > 0 ? t(`Reenviar código en ${wait} s`, `Reenviar código em ${wait} s`) : t('Reenviar código', 'Reenviar código')}
      </button>
      {msg && <p className="text-[0.8125rem] text-mute" aria-live="polite">{msg}</p>}
    </div>
  )
}

/**
 * Passwordless sign-in: email → 6-digit code → (owners) SMS second factor.
 * Embeddable: used by /ingresar and inline in the checkout.
 */
export function LoginFlow({ onDone, initialEmail = '', compact }: { onDone: () => void; initialEmail?: string; compact?: boolean }) {
  const { t } = useLang()
  const { requestLogin, verifyLogin, verifyMfa, pending, cancelPending, allUsers } = useAuth()
  const fid = useId()
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code' | 'mfa'>(pending?.purpose === 'login' ? 'code' : pending?.purpose === 'mfa' ? 'mfa' : 'email')
  const [error, setError] = useState('')
  const err = useCodeError()

  const submitEmail = (e: FormEvent) => {
    e.preventDefault()
    if (!emailValid(email)) {
      setError(t('Revisá el email: por ejemplo nombre@dominio.com', 'Confira o e-mail: por exemplo nome@dominio.com'))
      return
    }
    const r = requestLogin(email)
    if (!r.ok) return setError(err(r))
    setError('')
    setCode('')
    setStep('code')
  }
  const submitCode = (e: FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) return setError(t('El código tiene 6 dígitos.', 'O código tem 6 dígitos.'))
    const r = step === 'code' ? verifyLogin(code) : verifyMfa(code)
    if (!r.ok) {
      setError(err(r))
      if (r.reason === 'locked' || r.reason === 'expired') setCode('')
      return
    }
    setError('')
    setCode('')
    if (r.next === 'mfa') return setStep('mfa')
    onDone()
  }

  const target = pending?.target ?? email
  const mfaPhone = allUsers.find((u) => u.email === normalize(email))?.phone

  if (step === 'email') {
    return (
      <form onSubmit={submitEmail} noValidate className="flex flex-col gap-5">
        <Field label="Email" htmlFor={`${fid}-email`} error={error || undefined} hint={t('Te enviamos un código de un solo uso. No usamos contraseñas.', 'Enviamos um código de uso único. Não usamos senhas.')}>
          <input
            id={`${fid}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            className="field"
            value={email}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? `${fid}-email-err` : `${fid}-email-hint`}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus={!compact}
          />
        </Field>
        <Button type="submit" size="lg" trailing={<EnvelopeSimple size={16} />} className={compact ? 'self-start' : 'w-full'}>
          {t('Enviarme el código', 'Enviar o código')}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={submitCode} noValidate className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-[12px] bg-mist p-4 text-[0.9375rem]">
        {step === 'code' ? <EnvelopeSimple size={20} className="mt-0.5 shrink-0 text-marine-strong" /> : <ChatCircleText size={20} className="mt-0.5 shrink-0 text-marine-strong" />}
        <p>
          {step === 'code'
            ? t(`Te enviamos un código a ${target}. Vence en 10 minutos.`, `Enviamos um código para ${target}. Expira em 10 minutos.`)
            : t(`Tu cuenta tiene verificación en dos pasos. Te enviamos un SMS a ${maskPhone(mfaPhone ?? target)}.`, `Sua conta tem verificação em duas etapas. Enviamos um SMS para ${maskPhone(mfaPhone ?? target)}.`)}
        </p>
      </div>
      <Field label={step === 'code' ? t('Código del email', 'Código do e-mail') : t('Código del SMS', 'Código do SMS')} htmlFor={`${fid}-code`} error={error || undefined}>
        <CodeInput id={`${fid}-code`} value={code} onChange={setCode} invalid={!!error} describedBy={error ? `${fid}-code-err` : undefined} />
      </Field>
      <Button type="submit" size="lg" trailing={<LockKey size={16} />} className={compact ? 'self-start' : 'w-full'}>
        {t('Verificar e ingresar', 'Verificar e entrar')}
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ResendButton />
        {step === 'code' && (
          <button
            type="button"
            onClick={() => {
              cancelPending()
              setStep('email')
              setError('')
            }}
            className="text-[0.875rem] text-mute underline-offset-4 hover:underline"
          >
            {t('Usar otro email', 'Usar outro e-mail')}
          </button>
        )}
      </div>
    </form>
  )
}

const normalize = (e: string) => e.trim().toLowerCase()

/** Re-verification dialog for sensitive actions. Calls onVerified only after a fresh code. */
export function StepUpDialog({ open, onClose, onVerified, reason }: { open: boolean; onClose: () => void; onVerified: () => void; reason: string }) {
  const { t } = useLang()
  const { requestStepUp, verifyStepUp, user } = useAuth()
  const ref = useRef<HTMLDialogElement>(null)
  const fid = useId()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const err = useCodeError()
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      setCode('')
      setError('')
      const r = requestStepUp()
      if (!r.ok) setError(err(r))
      d.showModal()
    }
    if (!open && d.open) d.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  return (
    <dialog ref={ref} onClose={onClose} className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-[22px] bg-bg p-0 text-ink shadow-[var(--shadow-ambient)] backdrop:bg-ink/55 backdrop:backdrop-blur-sm">
      <form
        className="flex flex-col gap-5 p-6 md:p-8"
        onSubmit={(e) => {
          e.preventDefault()
          const r = verifyStepUp(code)
          if (!r.ok) return setError(err(r))
          onVerified()
          onClose()
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={26} className="text-marine-strong" />
            <h2 className="f-h3 text-[1.25rem]">{t('Confirmá que sos vos', 'Confirme que é você')}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t('Cerrar', 'Fechar')} className="flex size-9 items-center justify-center rounded-full hover:bg-mist">
            <X size={18} />
          </button>
        </div>
        <p className="text-[0.9375rem] text-mute">
          {reason}{' '}
          {user?.mfa && user.phone ? t(`Te enviamos un SMS a ${maskPhone(user.phone)}.`, `Enviamos um SMS para ${maskPhone(user.phone)}.`) : t(`Te enviamos un código a ${user?.email}.`, `Enviamos um código para ${user?.email}.`)}
        </p>
        <Field label={t('Código de verificación', 'Código de verificação')} htmlFor={`${fid}-c`} error={error || undefined}>
          <CodeInput id={`${fid}-c`} value={code} onChange={setCode} invalid={!!error} />
        </Field>
        <Button type="submit" size="lg" className="w-full">
          {t('Confirmar', 'Confirmar')}
        </Button>
      </form>
    </dialog>
  )
}

/** Visible stand-in for the email/SMS provider: shows codes and security notices in the prototype. */
export function DemoInbox() {
  const { t } = useLang()
  const { inbox, dismissMessage } = useAuth()
  if (!inbox.length) return null
  return (
    <div className="no-print fixed top-[5.25rem] right-3 z-[var(--z-toast)] flex w-[min(22rem,calc(100%-1.5rem))] flex-col gap-2 sm:top-auto sm:bottom-3" role="log" aria-live="polite" aria-label={t('Bandeja de demostración', 'Caixa de demonstração')}>
      {inbox.slice(0, 2).map((m, i) => (
        <div key={m.id} className={cx('on-ink flex gap-3 rounded-[16px] bg-ink p-4 text-on-ink shadow-[var(--shadow-float)] motion-safe:animate-rise', i > 0 && 'max-sm:hidden')}>
          <span className="mt-0.5 text-ocaso">{m.channel === 'sms' ? <ChatCircleText size={20} /> : <EnvelopeSimple size={20} />}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-[0.75rem] text-on-ink-mute">
              {m.channel === 'sms' ? 'SMS' : 'Email'} · {m.channel === 'sms' ? maskPhone(m.to) : m.to}
            </p>
            <p className="text-[0.875rem] font-medium">{m.subject}</p>
            {m.code && <p className="f-num text-[1.5rem] font-semibold tracking-[0.3em] text-ocaso">{m.code}</p>}
            <p className="text-[0.6875rem] text-on-ink-mute">{t('Bandeja de demo: en producción esto llega por email o SMS.', 'Caixa de demo: em produção isto chega por e-mail ou SMS.')}</p>
          </div>
          <button type="button" onClick={() => dismissMessage(m.id)} aria-label={t('Descartar', 'Descartar')} className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-on-ink/10">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}

/** Route guard. Production equivalent: server rejects the request (401/403), never just the UI. */
export function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { user } = useAuth()
  const { t } = useLang()
  const loc = useLocation()
  if (!user) return <Navigate to={`/ingresar?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  if (role === 'owner' && !isOwner(user)) {
    return (
      <section className="shell flex min-h-[70dvh] flex-col items-start justify-center gap-5 pt-28 pb-16">
        <LockKey size={36} className="text-marine-strong" />
        <h1 className="f-h2 text-[clamp(1.8rem,3.4vw,2.6rem)]">{t('Este panel es para propietarios.', 'Este painel é para proprietários.')}</h1>
        <p className="max-w-[48ch] text-mute">
          {t('Tu cuenta todavía no tiene unidades publicadas. Cuando publiques la primera, se habilita el panel.', 'Sua conta ainda não tem unidades publicadas. Ao publicar a primeira, o painel é liberado.')}
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/propietarios/publicar" trailing>
            {t('Publicar mi unidad', 'Publicar minha unidade')}
          </ButtonLink>
          <ButtonLink to="/cuenta" variant="outline">
            {t('Ir a mi cuenta', 'Ir para minha conta')}
          </ButtonLink>
        </div>
      </section>
    )
  }
  return <>{children}</>
}

export function Initial({ name, email, className }: { name?: string; email: string; className?: string }) {
  const ch = (name || email).trim()[0]?.toUpperCase() ?? '·'
  return <span className={cx('flex size-8 shrink-0 items-center justify-center rounded-full bg-ocaso text-[0.875rem] font-semibold text-ink', className)}>{ch}</span>
}
