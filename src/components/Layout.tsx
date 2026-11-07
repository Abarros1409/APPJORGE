import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useLang } from '../lib/i18n'
import { useStore } from '../lib/store'
import { cx } from './ui'

export function Logo({ className, tone = 'ink' }: { className?: string; tone?: 'ink' | 'light' }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
        <rect x="9" y="2" width="8" height="17" rx="1" fill={tone === 'light' ? 'oklch(0.97 0.01 230)' : 'oklch(0.205 0.035 240)'} />
        <path d="M11 6h4M11 9h4M11 12h4M11 15h4" stroke={tone === 'light' ? 'oklch(0.205 0.035 240)' : 'white'} strokeWidth="1" />
        <circle cx="20.5" cy="16" r="3" fill="oklch(0.77 0.13 58)" />
        <path d="M1 21.5h24" stroke={tone === 'light' ? 'oklch(0.97 0.01 230)' : 'oklch(0.205 0.035 240)'} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 24.5h18" stroke="oklch(0.55 0.105 230)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="text-[1.0625rem] leading-none font-[620] tracking-[0.2em]" style={{ fontStretch: '125%' }}>
        EVP
      </span>
    </span>
  )
}

function useNavLinks() {
  const { t } = useLang()
  return [
    { to: '/buscar', label: t('Explorar unidades', 'Explorar unidades') },
    { to: '/edificios', label: t('Edificios', 'Edifícios') },
    { to: '/propietarios', label: t('Propietarios', 'Proprietários') },
    { to: '/administraciones', label: t('Administraciones', 'Administrações') },
  ]
}

function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useLang()
  return (
    <div role="group" aria-label={t('Idioma', 'Idioma')} className={cx('flex rounded-full bg-on-ink/8 p-0.5 text-[0.75rem] font-semibold', className)}>
      {(['es', 'pt'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cx('min-h-8 min-w-9 rounded-full px-2 uppercase tracking-wider transition-colors duration-200', lang === l ? 'bg-on-ink text-ink' : 'text-on-ink hover:bg-on-ink/10')}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function Nav() {
  const { t } = useLang()
  const links = useNavLinks()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()
  const sentinel = useRef<HTMLDivElement>(null)

  useEffect(() => setOpen(false), [loc.pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinel} aria-hidden className="absolute top-0 h-4 w-full" />
      <header className="no-print pointer-events-none fixed inset-x-0 top-0 z-[var(--z-nav)] flex justify-center px-3 pt-3 sm:pt-4">
        <nav
          aria-label={t('Principal', 'Principal')}
          className={cx(
            'on-ink pointer-events-auto flex w-full max-w-[64rem] items-center justify-between gap-4 rounded-full py-2 pr-2 pl-5 text-on-ink backdrop-blur-xl transition-[background-color,box-shadow] duration-500 ease-[var(--ease-out)]',
            scrolled ? 'bg-ink/90 shadow-[0_16px_40px_-20px_oklch(0.205_0.035_240/0.6)]' : 'bg-ink/80',
          )}
        >
          <Link to="/" aria-label="EVP · Edificios VIP Punta del Este" className="rounded-full py-1">
            <Logo tone="light" />
          </Link>
          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    cx('rounded-full px-3.5 py-2 text-[0.875rem] transition-colors duration-200', isActive ? 'bg-on-ink/12 text-on-ink' : 'text-on-ink-mute hover:text-on-ink')
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <LangSwitch className="hidden sm:flex" />
            <Link to="/panel" className="hidden min-h-10 items-center rounded-full bg-on-ink px-4 text-[0.875rem] font-medium text-ink transition-colors duration-200 hover:bg-white sm:inline-flex">
              {t('Mi panel', 'Meu painel')}
            </Link>
            <button
              type="button"
              className="relative flex size-11 items-center justify-center rounded-full bg-on-ink/10 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t('Cerrar menú', 'Fechar menu') : t('Abrir menú', 'Abrir menu')}
              onClick={() => setOpen((o) => !o)}
            >
              <span className={cx('absolute h-[1.5px] w-5 bg-current transition-transform duration-500 ease-[var(--ease-fluid)]', open ? 'rotate-45' : '-translate-y-[4px]')} />
              <span className={cx('absolute h-[1.5px] w-5 bg-current transition-transform duration-500 ease-[var(--ease-fluid)]', open ? '-rotate-45' : 'translate-y-[4px]')} />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className={cx(
          'on-ink no-print fixed inset-0 z-[calc(var(--z-nav)-1)] flex flex-col bg-ink/96 px-6 pt-28 pb-10 text-on-ink backdrop-blur-2xl transition-[opacity,visibility] duration-500 ease-[var(--ease-out)] lg:hidden',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        aria-hidden={!open}
      >
        <ul className="flex flex-col gap-1">
          {[...links, { to: '/panel', label: t('Mi panel de propietario', 'Meu painel de proprietário') }].map((l, i) => (
            <li
              key={l.to}
              className={cx('transition-[opacity,translate] duration-700 ease-[var(--ease-fluid)]', open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0')}
              style={{ transitionDelay: open ? `${80 + i * 55}ms` : '0ms' }}
            >
              <NavLink to={l.to} tabIndex={open ? 0 : -1} className="f-h2 block py-3 text-[2rem]">
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between">
          <LangSwitch />
          <span className="text-[0.8125rem] text-on-ink-mute">Punta del Este · Uruguay</span>
        </div>
      </div>
    </>
  )
}

function Footer() {
  const { t } = useLang()
  const { resetDemo } = useStore()
  return (
    <footer className="on-ink no-print bg-ink text-on-ink">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-20">
        <div className="flex flex-col gap-5">
          <Logo tone="light" />
          <p className="max-w-[34ch] text-[0.9375rem] text-on-ink-mute">
            {t(
              'Edificios VIP Punta del Este. Alquiler temporario por quincena, mes o temporada, solo en torres certificadas de 4 y 5 estrellas.',
              'Edifícios VIP Punta del Este. Aluguel por temporada por quinzena, mês ou temporada completa, só em torres certificadas de 4 e 5 estrelas.',
            )}
          </p>
        </div>
        <div>
          <h2 className="mb-4 text-[0.8125rem] font-semibold text-on-ink-mute">{t('Huéspedes', 'Hóspedes')}</h2>
          <ul className="flex flex-col gap-2.5 text-[0.9375rem]">
            <li><Link className="hover:text-ocaso" to="/buscar">{t('Explorar unidades', 'Explorar unidades')}</Link></li>
            <li><Link className="hover:text-ocaso" to="/edificios">{t('Edificios certificados', 'Edifícios certificados')}</Link></li>
            <li><Link className="hover:text-ocaso" to="/#como-funciona">{t('Pago en custodia', 'Pagamento em custódia')}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-[0.8125rem] font-semibold text-on-ink-mute">{t('Propietarios', 'Proprietários')}</h2>
          <ul className="flex flex-col gap-2.5 text-[0.9375rem]">
            <li><Link className="hover:text-ocaso" to="/propietarios">{t('Por qué EVP', 'Por que EVP')}</Link></li>
            <li><Link className="hover:text-ocaso" to="/propietarios/publicar">{t('Publicar mi unidad', 'Publicar minha unidade')}</Link></li>
            <li><Link className="hover:text-ocaso" to="/panel">{t('Mi panel', 'Meu painel')}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-[0.8125rem] font-semibold text-on-ink-mute">EVP</h2>
          <ul className="flex flex-col gap-2.5 text-[0.9375rem]">
            <li><Link className="hover:text-ocaso" to="/administraciones">{t('Administraciones y portería', 'Administrações e portaria')}</Link></li>
            <li><span className="text-on-ink-mute">Punta del Este, Maldonado · Uruguay</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-on-ink-line">
        <div className="shell flex flex-col gap-3 py-6 text-[0.8125rem] text-on-ink-mute md:flex-row md:items-center md:justify-between">
          <p>
            {t(
              'Prototipo funcional. Los edificios, las unidades y los pagos son de demostración: no se realizan cobros reales.',
              'Protótipo funcional. Os edifícios, as unidades e os pagamentos são de demonstração: nenhuma cobrança real é feita.',
            )}
          </p>
          <button type="button" onClick={resetDemo} className="self-start rounded-full px-3 py-1.5 ring-1 ring-on-ink-line ring-inset hover:text-on-ink md:self-auto">
            {t('Reiniciar datos de demo', 'Reiniciar dados de demo')}
          </button>
        </div>
      </div>
    </footer>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0 })
  }, [pathname])
  return (
    <div className="grain flex min-h-dvh flex-col">
      <a href="#main" className="sr-only z-[var(--z-toast)] rounded-full bg-ink px-4 py-2 text-on-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Saltar al contenido
      </a>
      <Nav />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
