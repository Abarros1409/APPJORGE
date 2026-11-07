import { Check, EyeSlash, Eye, ShieldCheck, Timer, Wallet, CaretDown } from '@phosphor-icons/react'
import { useState } from 'react'
import { ArchScene } from '../components/ArchScene'
import { ButtonLink, Seal, cx } from '../components/ui'
import { GUEST_FEE_RATE, usd } from '../lib/format'
import { useLang } from '../lib/i18n'

function Calculator() {
  const { t, lang } = useLang()
  const [price, setPrice] = useState(3000)
  const guestPays = Math.round(price * (1 + GUEST_FEE_RATE))
  const y2 = Math.round(price * 0.95)
  return (
    <div className="grid gap-8 rounded-[28px] bg-mist p-6 md:grid-cols-[1.1fr_1fr] md:p-12">
      <div className="flex flex-col gap-6">
        <h2 className="f-h2 text-[clamp(1.7rem,3vw,2.5rem)]">{t('Hacé la cuenta.', 'Faça as contas.')}</h2>
        <label className="flex flex-col gap-4">
          <span className="text-[0.9375rem]">{t('Tu tarifa neta por quincena', 'Sua tarifa líquida por quinzena')}</span>
          <span className="f-num f-wide text-[clamp(2rem,4vw,3rem)] font-semibold">{usd(price, lang)}</span>
          <div className="relative h-8">
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-line-strong" />
            <div className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full bg-ink" style={{ width: `${((price - 1000) / 9000) * 100}%` }} />
            <input type="range" min={1000} max={10000} step={100} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="range absolute inset-0" aria-valuetext={usd(price, lang)} />
          </div>
        </label>
      </div>
      <dl className="flex flex-col justify-center gap-px overflow-hidden rounded-[18px] bg-line">
        <div className="flex items-baseline justify-between gap-4 bg-bg p-5">
          <dt className="font-semibold">{t('Vos cobrás · año 1', 'Você recebe · ano 1')}</dt>
          <dd className="f-num text-[1.375rem] font-semibold text-ok">{usd(price, lang)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 bg-bg p-5">
          <dt className="text-mute">{t('El huésped paga (tu tarifa + 5% de gestión)', 'O hóspede paga (sua tarifa + 5% de gestão)')}</dt>
          <dd className="f-num">{usd(guestPays, lang)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 bg-bg p-5">
          <dt className="text-mute">{t('Desde el año 2 (comisión del 5%)', 'A partir do ano 2 (comissão de 5%)')}</dt>
          <dd className="f-num text-mute">{usd(y2, lang)}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function Owners() {
  const { t } = useLang()
  const faqs: [string, string][] = [
    [
      t('¿Puedo reservarme algunos períodos para uso propio?', 'Posso reservar alguns períodos para uso próprio?'),
      t('Sí. Solo publicás los períodos que querés alquilar: si dejás un período sin tarifa, no se ofrece.', 'Sim. Você só publica os períodos que quer alugar: se deixar um período sem tarifa, ele não é oferecido.'),
    ],
    [
      t('¿Cuándo y cómo cobro?', 'Quando e como recebo?'),
      t('EVP cobra el 100% al huésped por adelantado y lo retiene en custodia. Te transferimos el neto entre 24 y 48 horas después de un check-in exitoso, a tu cuenta en Uruguay o en el exterior.', 'A EVP cobra 100% do hóspede antecipadamente e mantém em custódia. Transferimos o valor líquido entre 24 e 48 horas após um check-in bem-sucedido, para sua conta no Uruguai ou no exterior.'),
    ],
    [
      t('¿Qué pasa si hay daños?', 'E se houver danos?'),
      t('El huésped firma el contrato y el inventario digital de ingreso. Cualquier diferencia al salir queda documentada y se gestiona contra la reserva.', 'O hóspede assina o contrato e o inventário digital de entrada. Qualquer diferença na saída fica documentada e é tratada na reserva.'),
    ],
    [
      t('¿Quién ve mis datos?', 'Quem vê meus dados?'),
      t('Solo EVP. En la publicación figuran el edificio, el piso, la distribución, las tarifas y las fotos del interior. Tu nombre y tus datos de contacto nunca se muestran.', 'Só a EVP. No anúncio aparecem o edifício, o andar, a distribuição, as tarifas e as fotos do interior. Seu nome e seus contatos nunca são exibidos.'),
    ],
    [
      t('¿Hasta cuándo dura el 0% de comisión?', 'Até quando vale a comissão de 0%?'),
      t('Durante el primer año. Desde el segundo año, EVP cobra un 5% al propietario en los contratos directos. Te avisamos con anticipación.', 'Durante o primeiro ano. A partir do segundo ano, a EVP cobra 5% do proprietário nos contratos diretos. Avisaremos com antecedência.'),
    ],
  ]
  return (
    <div>
      <section className="pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="shell grid items-end gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-7">
            <Seal className="self-start" />
            <h1 className="f-display max-w-[14ch] text-[clamp(2.5rem,6vw,5rem)]">{t('Alquilá tu unidad VIP sin exponerla.', 'Alugue sua unidade VIP sem expô-la.')}</h1>
            <p className="max-w-[50ch] text-[1.125rem] text-mute">
              {t(
                'Publicás en menos de 3 minutos, cobrás el 100% del alquiler y tu inmueble nunca aparece en portales masivos. El primer año, sin comisión.',
                'Você publica em menos de 3 minutos, recebe 100% do aluguel e seu imóvel nunca aparece em portais de massa. No primeiro ano, sem comissão.',
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink to="/propietarios/publicar" size="lg" trailing>
                {t('Publicar mi unidad', 'Publicar minha unidade')}
              </ButtonLink>
              <ButtonLink to="/panel" variant="outline" size="lg">
                {t('Ver panel de ejemplo', 'Ver painel de exemplo')}
              </ButtonLink>
            </div>
          </div>
          <div className="bezel">
            <div className="relative aspect-[4/5]">
              <ArchScene shape="tower" time="dawn" seed={11} className="size-full" />
              <ul className="absolute inset-x-4 bottom-4 flex flex-col gap-2">
                {[
                  [<Timer key="t" size={18} />, t('Carga en menos de 3 minutos', 'Cadastro em menos de 3 minutos')],
                  [<Wallet key="w" size={18} />, t('100% del neto para vos', '100% do líquido para você')],
                  [<ShieldCheck key="s" size={18} />, t('Pago en custodia y contrato firmado', 'Pagamento em custódia e contrato assinado')],
                ].map(([i, l], k) => (
                  <li key={k} className="flex items-center gap-3 rounded-[12px] bg-white/92 px-4 py-3 text-[0.9375rem] font-medium shadow-[var(--shadow-float)] backdrop-blur">
                    <span className="text-marine-strong">{i}</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="on-ink bg-ink py-24 text-on-ink md:py-32" aria-labelledby="privacy-title">
        <div className="shell flex flex-col gap-12">
          <h2 id="privacy-title" className="f-h2 reveal max-w-[20ch] text-[clamp(1.9rem,3.6vw,3.2rem)]">
            {t('Qué se publica y qué queda entre vos y EVP.', 'O que é publicado e o que fica entre você e a EVP.')}
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                icon: <Eye size={22} weight="light" />,
                title: t('Visible para huéspedes verificados', 'Visível para hóspedes verificados'),
                items: [t('Edificio y su ficha certificada', 'Edifício e sua ficha certificada'), t('Piso y distribución', 'Andar e distribuição'), t('Tarifas por período', 'Tarifas por período'), t('Fotos del interior revisadas por EVP', 'Fotos do interior revisadas pela EVP')],
              },
              {
                icon: <EyeSlash size={22} weight="light" />,
                title: t('Solo lo ve EVP', 'Só a EVP vê'),
                items: [t('Tu nombre y tu documento', 'Seu nome e seu documento'), t('Teléfono y email', 'Telefone e e-mail'), t('Datos bancarios para la liquidación', 'Dados bancários para o repasse'), t('Tus períodos de uso propio', 'Seus períodos de uso próprio')],
              },
            ].map((c) => (
              <div key={c.title} className="flex flex-col gap-5 rounded-[22px] p-7 ring-1 ring-on-ink-line md:p-9">
                <div className="flex items-center gap-3 text-ocaso">
                  {c.icon}
                  <h3 className="f-h3 text-[1.25rem] text-on-ink">{c.title}</h3>
                </div>
                <ul className="flex flex-col">
                  {c.items.map((i) => (
                    <li key={i} className="flex items-center gap-3 border-t border-on-ink-line py-3 text-on-ink-mute">
                      <Check size={16} className="shrink-0 text-ocaso" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="shell flex flex-col gap-20">
          <Calculator />
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <h2 className="f-h2 reveal text-[clamp(1.9rem,3.6vw,3rem)]">{t('Preguntas de propietarios', 'Perguntas de proprietários')}</h2>
            <div className="flex flex-col">
              {faqs.map(([q, a]) => (
                <details key={q} className="group border-t border-line last:border-b">
                  <summary className="flex min-h-16 items-center justify-between gap-6 py-4 text-[1.0625rem] font-semibold [&::-webkit-details-marker]:hidden">
                    {q}
                    <CaretDown size={18} className={cx('shrink-0 transition-transform duration-300 ease-[var(--ease-out)] group-open:rotate-180')} />
                  </summary>
                  <p className="prose-evp pb-6 text-mute">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
