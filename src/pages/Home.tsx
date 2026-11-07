import { ArrowRight, Check, X, FileText, ShieldCheck, Buildings as BuildingsIcon } from '@phosphor-icons/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArchScene } from '../components/ArchScene'
import { HeroSearch } from '../components/HeroSearch'
import { MapPunta } from '../components/MapPunta'
import { BuildingVisual } from '../components/units'
import { ButtonLink, Seal, Stars, cx } from '../components/ui'
import { BUILDINGS, BUILDING_BY_ID, ZONES, ZONE_NAME } from '../lib/data'
import { breakdown, usd } from '../lib/format'
import { useLang } from '../lib/i18n'
import { useStore } from '../lib/store'

gsap.registerPlugin(ScrollTrigger)

function Hero() {
  const { t } = useLang()
  const root = useRef<HTMLElement>(null)
  const hero = BUILDING_BY_ID['lobos-tower']

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 768px)' }, (ctx) => {
      const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean }
      if (!motion) return
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 } })
      tl.to('[data-night]', { opacity: 1, ease: 'none' }, 0).to('[data-scene]', { scale: 1.08, yPercent: 6, ease: 'none' }, 0)
      // On desktop the copy drifts away as night falls; on mobile it stays put while the visitor reads.
      if (desktop) tl.to('[data-copy]', { yPercent: -18, opacity: 0.2, ease: 'none' }, 0)
      gsap.from('[data-intro]', { y: 28, opacity: 0, filter: 'blur(8px)', duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: 0.05 })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} className="on-ink relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-ink text-on-ink" aria-labelledby="hero-title">
      <div data-scene className="absolute inset-x-0 top-0 -z-10 h-[46svh] origin-bottom will-change-transform md:inset-0 md:h-auto">
        <div className="absolute inset-y-0 left-0 w-full md:w-[128%]">
          <ArchScene shape={hero.scene.shape} time="golden" seed={hero.scene.seed} className="absolute inset-0 size-full" />
          <div data-night className="absolute inset-0 opacity-0 motion-reduce:opacity-100">
            <ArchScene shape={hero.scene.shape} time="night" seed={hero.scene.seed} lit className="absolute inset-0 size-full" />
          </div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.205_0.035_240/0.5)_0%,oklch(0.205_0.035_240/0)_26%,oklch(0.205_0.035_240/0.15)_55%,oklch(0.205_0.035_240)_100%)] md:bg-[linear-gradient(180deg,oklch(0.205_0.035_240/0.55)_0%,oklch(0.205_0.035_240/0)_28%,oklch(0.205_0.035_240/0.1)_50%,oklch(0.205_0.035_240/0.88)_100%)]" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,oklch(0.205_0.035_240/0.7)_0%,oklch(0.205_0.035_240/0.35)_38%,oklch(0.205_0.035_240/0)_58%)] md:block" />
      </div>

      <div data-copy className="shell mt-auto flex flex-col gap-6 pt-[36svh] pb-7 md:gap-7 md:pt-36 md:pb-10">
        <div data-intro>
          <Seal tone="ink" />
        </div>
        <h1 id="hero-title" data-intro className="f-display max-w-[13ch] text-[clamp(2.25rem,6.2vw,5.25rem)]">
          {t('Enero en la Brava. Solo en torres certificadas.', 'Janeiro na Brava. Só em torres certificadas.')}
        </h1>
        <p data-intro className="max-w-[52ch] text-[1.0625rem] text-on-ink-mute md:text-[1.1875rem]">
          {t(
            'Alquilá por quincena, mes o temporada en los edificios de 4 y 5 estrellas de Punta del Este que EVP verificó uno por uno. Con contrato digital y pago en custodia.',
            'Alugue por quinzena, mês ou temporada nos edifícios 4 e 5 estrelas de Punta del Este que a EVP verificou um a um. Com contrato digital e pagamento em custódia.',
          )}
        </p>
      </div>
      <div className="shell pb-6 md:pb-10" data-intro>
        <HeroSearch />
      </div>
    </section>
  )
}

function BuildingRail() {
  const { t, lang } = useLang()
  const { units } = useStore()
  const rail = useRef<HTMLUListElement>(null)
  const scrollBy = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <section className="py-24 md:py-36" aria-labelledby="rail-title">
      <div className="shell grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-16">
        <div className="reveal flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
          <h2 id="rail-title" className="f-h2 text-[clamp(1.9rem,3.6vw,3.2rem)]">
            {t('Diez torres. Una ficha madre por cada una.', 'Dez torres. Uma ficha técnica para cada uma.')}
          </h2>
          <p className="prose-evp text-[1.0625rem] text-mute">
            {t(
              'Antes de publicar una sola unidad, EVP releva el edificio: arquitectos, antigüedad, amenities y seguridad. Vos elegís la torre; el propietario solo carga su departamento.',
              'Antes de publicar uma única unidade, a EVP vistoria o edifício: arquitetos, idade, amenities e segurança. Você escolhe a torre; o proprietário só cadastra o apartamento.',
            )}
          </p>
          <div className="flex items-center gap-3">
            <ButtonLink to="/edificios" variant="ink" trailing>
              {t('Ver todos los edificios', 'Ver todos os edifícios')}
            </ButtonLink>
            <div className="ml-auto hidden gap-2 lg:flex">
              <button type="button" onClick={() => scrollBy(-1)} aria-label={t('Anterior', 'Anterior')} className="flex size-12 items-center justify-center rounded-full ring-1 ring-line-strong ring-inset hover:bg-mist">
                <ArrowRight size={18} className="rotate-180" />
              </button>
              <button type="button" onClick={() => scrollBy(1)} aria-label={t('Siguiente', 'Próximo')} className="flex size-12 items-center justify-center rounded-full ring-1 ring-line-strong ring-inset hover:bg-mist">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
        <ul ref={rail} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 lg:mx-0 lg:px-0" aria-label={t('Edificios certificados', 'Edifícios certificados')}>
          {BUILDINGS.map((b) => {
            const count = units.filter((u) => u.buildingId === b.id).length
            return (
              <li key={b.id} className="w-[78vw] shrink-0 snap-start sm:w-[22rem]">
                <Link to={`/edificios/${b.id}`} className="group flex flex-col gap-4" viewTransition>
                  <div className="bezel">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <BuildingVisual b={b} className="size-full transition-transform duration-[1100ms] ease-[var(--ease-out)] group-hover:scale-[1.04]" />
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[0.75rem] font-semibold text-ink backdrop-blur">{ZONE_NAME[b.zone]}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="f-h3 text-[1.125rem]">{b.name}</h3>
                      <Stars n={b.stars} />
                    </div>
                    <p className="text-[0.9375rem] text-mute">{b.tagline[lang]}</p>
                    <p className="f-num mt-1 text-[0.8125rem] text-mute">
                      {b.floors} {t('pisos', 'andares')} · {b.year} · {count} {count === 1 ? t('unidad publicada', 'unidade publicada') : t('unidades publicadas', 'unidades publicadas')}
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

function HowItWorks() {
  const { t, lang } = useLang()
  const [step, setStep] = useState(0)
  const refs = useRef<(HTMLLIElement | null)[]>([])
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.step))
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((r) => r && io.observe(r))
    return () => io.disconnect()
  }, [])
  const b = breakdown(3000)
  const steps = [
    {
      icon: <BuildingsIcon size={22} weight="light" />,
      title: t('Elegí la torre y el período', 'Escolha a torre e o período'),
      body: t(
        'Sin calendarios por noche: se alquila por 1ª o 2ª quincena, por mes o por la temporada completa. Así el contrato es claro y el edificio, tranquilo.',
        'Sem calendários por noite: aluga-se por 1ª ou 2ª quinzena, por mês ou pela temporada completa. Assim o contrato é claro e o edifício, tranquilo.',
      ),
    },
    {
      icon: <FileText size={22} weight="light" />,
      title: t('Firmá el contrato digital', 'Assine o contrato digital'),
      body: t(
        'Generamos el contrato de arrendamiento de temporada conforme a la legislación uruguaya. Lo firmás en pantalla junto con el reglamento de copropiedad del edificio.',
        'Geramos o contrato de locação por temporada conforme a legislação uruguaia. Você assina na tela junto com o regulamento do condomínio.',
      ),
    },
    {
      icon: <ShieldCheck size={22} weight="light" />,
      title: t('Pagá en custodia', 'Pague em custódia'),
      body: t(
        'Pagás con tarjeta internacional o con PIX. EVP retiene el dinero y se lo transfiere al propietario recién 24–48 h después de un check-in exitoso.',
        'Pague com cartão internacional ou PIX. A EVP retém o valor e só o transfere ao proprietário 24–48 h após um check-in bem-sucedido.',
      ),
    },
  ]
  return (
    <section id="como-funciona" className="on-ink bg-ink text-on-ink" aria-labelledby="how-title">
      <div className="shell grid gap-12 py-24 md:py-36 lg:grid-cols-2 lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="how-title" className="f-h2 reveal text-[clamp(1.9rem,3.6vw,3.2rem)]">
            {t('Tres pasos. Ninguna sorpresa.', 'Três passos. Nenhuma surpresa.')}
          </h2>
          {/* live visual that follows the active step */}
          <div className="bezel mt-10 hidden lg:block" aria-hidden>
            <div className="relative aspect-[5/4] bg-ink-2">
              <div className={cx('absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out)]', step === 0 ? 'opacity-100' : 'opacity-0')}>
                <ArchScene shape="curved" time="dusk" seed={23} className="size-full" />
                <div className="absolute inset-x-6 bottom-6 grid grid-cols-3 gap-2">
                  {['1–15 ene', '16–31 ene', 'Enero'].map((p, i) => (
                    <span key={p} className={cx('rounded-[10px] px-3 py-2.5 text-[0.8125rem] font-semibold', i === 0 ? 'bg-on-ink text-ink' : 'bg-ink/70 text-on-ink ring-1 ring-on-ink/25 backdrop-blur')}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className={cx('absolute inset-0 flex items-center justify-center p-10 transition-opacity duration-700 ease-[var(--ease-out)]', step === 1 ? 'opacity-100' : 'opacity-0')}>
                <div className="w-full max-w-sm rotate-[-2deg] rounded-[14px] bg-white p-6 text-ink shadow-[var(--shadow-ambient)]">
                  <p className="f-seal text-mute">{t('Contrato de arrendamiento de temporada', 'Contrato de locação por temporada')}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    {[90, 100, 76, 96, 60].map((w, i) => (
                      <span key={i} className="h-2 rounded-full bg-mist" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <svg viewBox="0 0 200 50" className="mt-6 h-12 w-40 text-marine-strong">
                    <path d="M5 35 C 25 5, 35 45, 55 25 S 85 10, 95 30 S 130 40, 150 15 S 180 30, 195 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <p className="mt-1 border-t border-line pt-2 text-[0.75rem] text-mute">{t('Firma digital del huésped', 'Assinatura digital do hóspede')}</p>
                </div>
              </div>
              <div className={cx('absolute inset-0 flex items-center justify-center p-10 transition-opacity duration-700 ease-[var(--ease-out)]', step === 2 ? 'opacity-100' : 'opacity-0')}>
                <div className="w-full max-w-sm rounded-[14px] bg-white p-6 text-ink shadow-[var(--shadow-ambient)]">
                  <p className="text-[0.8125rem] font-semibold text-mute">{t('Ejemplo · 1ª quincena de enero', 'Exemplo · 1ª quinzena de janeiro')}</p>
                  <dl className="f-num mt-4 flex flex-col gap-2 text-[0.9375rem]">
                    <div className="flex justify-between"><dt>{t('Alquiler neto', 'Aluguel líquido')}</dt><dd>{usd(b.net, lang)}</dd></div>
                    <div className="flex justify-between"><dt>{t('Tarifa EVP 5%', 'Taxa EVP 5%')}</dt><dd>{usd(b.fee, lang)}</dd></div>
                    <div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>Total</dt><dd>{usd(b.total, lang)}</dd></div>
                  </dl>
                  <div className="mt-5 flex items-center gap-3 rounded-[10px] bg-ok-soft p-3 text-[0.8125rem]">
                    <ShieldCheck size={20} className="text-ok" weight="fill" />
                    {t('En custodia hasta 48 h después del check-in', 'Em custódia até 48 h após o check-in')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ol className="flex flex-col">
          {steps.map((s, i) => (
            <li
              key={i}
              ref={(el) => {
                refs.current[i] = el
              }}
              data-step={i}
              className={cx('flex flex-col gap-4 border-t border-on-ink-line py-10 transition-opacity duration-500 lg:min-h-[52vh] lg:py-16', step === i ? 'lg:opacity-100' : 'lg:opacity-70')}
            >
              <div className="flex items-center gap-4">
                <span className="f-num flex size-11 items-center justify-center rounded-full bg-on-ink/10 text-[0.9375rem] font-semibold text-ocaso">{i + 1}</span>
                <span className="text-on-ink-mute">{s.icon}</span>
              </div>
              <h3 className="f-h2 text-[clamp(1.5rem,2.4vw,2.1rem)]">{s.title}</h3>
              <p className="max-w-[46ch] text-[1.0625rem] text-on-ink-mute">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Zones() {
  const { t, lang } = useLang()
  const { units } = useStore()
  const nav = useNavigate()
  const [active, setActive] = useState<string | null>(null)
  const pins = BUILDINGS.map((b) => ({ id: b.id, x: b.map.x, y: b.map.y, label: b.name, sub: ZONE_NAME[b.zone], count: units.filter((u) => u.buildingId === b.id).length }))
  return (
    <section className="py-24 md:py-36" aria-labelledby="zones-title">
      <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <h2 id="zones-title" className="f-h2 reveal text-[clamp(1.9rem,3.6vw,3.2rem)]">
            {t('De la Mansa a Manantiales.', 'Da Mansa a Manantiales.')}
          </h2>
          <ul className="flex flex-col">
            {ZONES.map((z) => {
              const n = units.filter((u) => BUILDING_BY_ID[u.buildingId].zone === z.id).length
              return (
                <li key={z.id} className="border-t border-line last:border-b">
                  <Link to={`/buscar?zona=${z.id}`} className="group flex items-center gap-4 py-4">
                    <span className="f-h3 w-32 shrink-0 text-[1.125rem]">{z.name}</span>
                    <span className="flex-1 text-[0.9375rem] text-mute">{z.blurb[lang]}</span>
                    <span className="f-num shrink-0 text-[0.875rem] text-mute">{n}</span>
                    <ArrowRight size={18} className="shrink-0 transition-transform duration-300 ease-[var(--ease-fluid)] group-hover:translate-x-1" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="bezel reveal-soft">
          <MapPunta pins={pins} activeId={active} onHover={setActive} onSelect={(id) => nav(`/edificios/${id}`)} className="h-auto w-full" />
        </div>
      </div>
    </section>
  )
}

function Compare() {
  const { t } = useLang()
  const rows = [
    [t('Edificios', 'Edifícios'), t('Solo torres de 4 y 5 estrellas verificadas por EVP', 'Só torres 4 e 5 estrelas verificadas pela EVP'), t('Cualquier inmueble, sin verificar', 'Qualquer imóvel, sem verificação')],
    [t('Información técnica', 'Informação técnica'), t('Ficha madre certificada: amenities, seguridad, arquitectos', 'Ficha técnica certificada: amenities, segurança, arquitetos'), t('Lo que el anunciante quiera contar', 'O que o anunciante quiser contar')],
    [t('Modalidad', 'Modalidade'), t('Quincena, mes o temporada, con contrato formal', 'Quinzena, mês ou temporada, com contrato formal'), t('Por noche, sin contrato de temporada', 'Por noite, sem contrato de temporada')],
    [t('Tu dinero', 'Seu dinheiro'), t('En custodia hasta después del check-in', 'Em custódia até depois do check-in'), t('Transferencias directas o depósitos previos', 'Transferências diretas ou depósitos prévios')],
    [t('Precio', 'Preço'), t('Neto del propietario + 5% de gestión, siempre desglosado', 'Líquido do proprietário + 5% de gestão, sempre detalhado'), t('Cargos que aparecen al final', 'Taxas que aparecem no final')],
  ]
  return (
    <section className="bg-mist py-24 md:py-32" aria-labelledby="compare-title">
      <div className="shell flex flex-col gap-10">
        <h2 id="compare-title" className="f-h2 reveal max-w-[22ch] text-[clamp(1.9rem,3.6vw,3.2rem)]">
          {t('Lo que un portal masivo no te puede asegurar.', 'O que um portal de massa não pode garantir.')}
        </h2>
        <ul className="flex flex-col gap-3 md:hidden">
          {rows.map(([k, a, b]) => (
            <li key={k} className="flex flex-col gap-3 rounded-[16px] bg-bg p-5 ring-1 ring-line">
              <p className="font-semibold">{k}</p>
              <p className="flex gap-2.5 text-[0.9375rem]"><Check size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden /><span><span className="sr-only">EVP: </span>{a}</span></p>
              <p className="flex gap-2.5 text-[0.9375rem] text-mute"><X size={18} className="mt-0.5 shrink-0" aria-hidden /><span><span className="sr-only">{t('Portales masivos', 'Portais de massa')}: </span>{b}</span></p>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-hidden rounded-[18px] bg-bg ring-1 ring-line md:block">
          <table className="w-full border-collapse text-left text-[0.9375rem]">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="w-[22%] px-6 py-5 font-medium text-mute"><span className="sr-only">{t('Aspecto', 'Aspecto')}</span></th>
                <th scope="col" className="px-6 py-5"><span className="inline-flex items-center gap-2 font-semibold"><span className="size-2 rounded-full bg-ocaso" />EVP</span></th>
                <th scope="col" className="px-6 py-5 font-medium text-mute">{t('Portales masivos', 'Portais de massa')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([k, a, b]) => (
                <tr key={k} className="border-b border-line last:border-0">
                  <th scope="row" className="px-6 py-5 align-top font-semibold">{k}</th>
                  <td className="px-6 py-5 align-top"><span className="flex gap-2.5"><Check size={18} className="mt-0.5 shrink-0 text-ok" aria-hidden />{a}</span></td>
                  <td className="px-6 py-5 align-top text-mute"><span className="flex gap-2.5"><X size={18} className="mt-0.5 shrink-0" aria-hidden />{b}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function Audiences() {
  const { t } = useLang()
  return (
    <section className="py-24 md:py-36" aria-label={t('Propietarios y administraciones', 'Proprietários e administrações')}>
      <div className="shell grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="on-ink relative isolate overflow-hidden rounded-[28px] bg-ink p-8 text-on-ink md:p-14">
          <ArchScene shape="stepped" time="dusk" seed={53} className="absolute inset-0 -z-10 size-full opacity-55" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,oklch(0.205_0.035_240)_25%,oklch(0.205_0.035_240/0.3))]" />
          <div className="flex max-w-[34rem] flex-col gap-6">
            <p className="f-num text-[0.9375rem] font-semibold text-ocaso">{t('0% de comisión el primer año', '0% de comissão no primeiro ano')}</p>
            <h2 className="f-h2 text-[clamp(1.9rem,3.4vw,3rem)]">
              {t('¿Tenés una unidad en una torre VIP? Publicala en menos de 3 minutos.', 'Tem uma unidade em uma torre VIP? Publique em menos de 3 minutos.')}
            </h2>
            <p className="text-[1.0625rem] text-on-ink-mute">
              {t(
                'La ficha del edificio ya la hicimos nosotros. Vos cargás piso, distribución, tarifas y fotos. Cobrás el 100% del alquiler y tu inmueble nunca aparece en canales masivos.',
                'A ficha do edifício nós já fizemos. Você cadastra andar, distribuição, tarifas e fotos. Recebe 100% do aluguel e seu imóvel nunca aparece em canais de massa.',
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink to="/propietarios/publicar" trailing>
                {t('Publicar mi unidad', 'Publicar minha unidade')}
              </ButtonLink>
              <ButtonLink to="/propietarios" variant="outline">
                {t('Cómo funciona para dueños', 'Como funciona para donos')}
              </ButtonLink>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-8 rounded-[28px] p-8 ring-1 ring-line md:p-12">
          <div className="flex flex-col gap-4">
            <h2 className="f-h3 text-[1.5rem]">{t('Administraciones y portería', 'Administrações e portaria')}</h2>
            <p className="text-mute">
              {t(
                'Un servicio para la comunidad del edificio: huéspedes verificados, contrato firmado y reglamento aceptado antes de que lleguen.',
                'Um serviço para a comunidade do edifício: hóspedes verificados, contrato assinado e regulamento aceito antes da chegada.',
              )}
            </p>
          </div>
          <ButtonLink to="/administraciones" variant="ink" trailing className="self-start">
            {t('Proponer mi edificio', 'Propor meu edifício')}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])
  return (
    <>
      <Hero />
      <BuildingRail />
      <HowItWorks />
      <Zones />
      <Compare />
      <Audiences />
    </>
  )
}
