import { ArrowUpRight, Minus, Plus, SealCheck, Info } from '@phosphor-icons/react'
import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { useLang } from '../lib/i18n'
import type { Channel } from '../lib/data'

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

type Variant = 'primary' | 'ink' | 'light' | 'outline' | 'ghost'

const base =
  'group relative inline-flex select-none items-center justify-center gap-3 rounded-full font-medium transition-[transform,background-color,color,box-shadow,opacity] duration-300 ease-[var(--ease-fluid)] active:scale-[0.98] disabled:opacity-45 disabled:active:scale-100'
const variants: Record<Variant, string> = {
  primary: 'bg-ocaso text-ink hover:bg-[oklch(0.8_0.13_60)] shadow-[0_10px_30px_-12px_oklch(0.7_0.14_52/0.7)]',
  ink: 'bg-ink text-on-ink hover:bg-ink-2',
  light: 'bg-on-ink text-ink hover:bg-white',
  outline: 'bg-transparent text-current ring-1 ring-inset ring-current/25 hover:ring-current/60',
  ghost: 'bg-transparent text-current hover:bg-current/[0.06]',
}
const sizes = {
  md: 'min-h-12 px-6 text-[0.9375rem]',
  lg: 'min-h-14 px-7 text-base',
  sm: 'min-h-10 px-4 text-sm',
}

function Trailing({ variant, icon }: { variant: Variant; icon?: ReactNode }) {
  return (
    <span
      aria-hidden
      className={cx(
        '-mr-3 flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ease-[var(--ease-fluid)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105',
        variant === 'primary' ? 'bg-ink/10' : variant === 'ink' ? 'bg-on-ink/12' : 'bg-current/10',
      )}
    >
      {icon ?? <ArrowUpRight size={16} weight="regular" />}
    </span>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof sizes; trailing?: boolean | ReactNode; loading?: boolean }

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = 'primary', size = 'md', trailing, loading, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={cx(base, variants[variant], sizes[size], className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />}
      <span>{children}</span>
      {trailing && !loading && <Trailing variant={variant} icon={trailing === true ? undefined : trailing} />}
    </button>
  )
})

export function ButtonLink({ variant = 'primary', size = 'md', trailing, className, children, ...rest }: LinkProps & { variant?: Variant; size?: keyof typeof sizes; trailing?: boolean | ReactNode }) {
  return (
    <Link className={cx(base, variants[variant], sizes[size], className)} {...rest}>
      <span>{children}</span>
      {trailing && <Trailing variant={variant} icon={trailing === true ? undefined : trailing} />}
    </Link>
  )
}

export function Seal({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'ink' }) {
  const { t } = useLang()
  return (
    <span
      className={cx(
        'f-seal inline-flex items-center gap-1.5 rounded-full py-1.5 pr-3 pl-2',
        tone === 'ink' ? 'bg-on-ink/10 text-ocaso ring-1 ring-ocaso/40 ring-inset' : 'bg-ocaso-soft text-[oklch(0.42_0.1_50)] ring-1 ring-ocaso/50 ring-inset',
        className,
      )}
    >
      <SealCheck size={14} weight="fill" aria-hidden />
      {t('Certificado EVP', 'Certificado EVP')}
    </span>
  )
}

export function ChannelTag({ channel, className }: { channel: Channel; className?: string }) {
  const { t } = useLang()
  const owner = channel.type === 'owner'
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-medium',
        owner ? 'bg-marine-soft text-marine-strong' : 'bg-mist text-mute ring-1 ring-line ring-inset',
        className,
      )}
      title={owner ? undefined : channel.agency}
    >
      <span aria-hidden className={cx('size-1.5 rounded-full', owner ? 'bg-marine' : 'bg-mute')} />
      {owner ? t('Directo de Dueño', 'Direto do Proprietário') : t('Inmobiliaria Aliada', 'Imobiliária Parceira')}
    </span>
  )
}

export function Stepper({ label, value, min = 0, max = 12, onChange, suffix }: { label: string; value: number; min?: number; max?: number; onChange: (n: number) => void; suffix?: string }) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span id={id} className="text-[0.9375rem]">
        {label}
      </span>
      <div role="group" aria-labelledby={id} className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`− ${label}`}
          className="flex size-10 items-center justify-center rounded-full ring-1 ring-line-strong ring-inset transition-colors duration-200 hover:bg-mist disabled:opacity-35"
        >
          <Minus size={16} />
        </button>
        <output aria-live="polite" className="f-num w-12 text-center font-medium">
          {value === 0 && suffix ? suffix : value}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`+ ${label}`}
          className="flex size-10 items-center justify-center rounded-full ring-1 ring-line-strong ring-inset transition-colors duration-200 hover:bg-mist disabled:opacity-35"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

export function Toggle({ checked, onChange, children, icon }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; icon?: ReactNode }) {
  return (
    <label
      className={cx(
        'inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[0.875rem] font-medium ring-1 ring-inset transition-[background-color,color,box-shadow] duration-200 ease-[var(--ease-out)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-marine-strong',
        checked ? 'bg-ink text-on-ink ring-ink' : 'bg-bg text-ink ring-line-strong hover:ring-mute',
      )}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {icon}
      {children}
    </label>
  )
}

export function Field({ label, hint, error, children, htmlFor, optional }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor: string; optional?: boolean }) {
  const { t } = useLang()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2 text-[0.875rem] font-medium">
        {label}
        {optional && <span className="text-[0.8125rem] font-normal text-mute">{t('Opcional', 'Opcional')}</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-err`} className="text-[0.8125rem] text-bad" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-[0.8125rem] text-mute">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function InfoNote({ children, tone = 'mist' }: { children: ReactNode; tone?: 'mist' | 'ocaso' | 'ok' }) {
  return (
    <div
      className={cx(
        'flex gap-3 rounded-[14px] p-4 text-[0.875rem] leading-relaxed',
        tone === 'mist' && 'bg-mist text-ink',
        tone === 'ocaso' && 'bg-ocaso-soft text-ink',
        tone === 'ok' && 'bg-ok-soft text-ink',
      )}
    >
      <Info size={18} className="mt-0.5 shrink-0 text-marine-strong" aria-hidden />
      <div>{children}</div>
    </div>
  )
}

export function Stars({ n }: { n: number }) {
  const { t } = useLang()
  return (
    <span role="img" className="inline-flex items-center gap-0.5 text-ocaso-strong" aria-label={t(`${n} estrellas`, `${n} estrelas`)}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" aria-hidden>
          <path fill="currentColor" d="M12 2l2.9 6.9L22 10l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.2L2 10l7.1-1.1z" />
        </svg>
      ))}
    </span>
  )
}
