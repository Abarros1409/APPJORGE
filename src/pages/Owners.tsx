import { Check, EyeSlash, Eye, Timer, CaretDown, ChatCircleText, Handshake, LockKey } from '@phosphor-icons/react'
import { ArchScene } from '../components/ArchScene'
import { ButtonLink, Seal, cx } from '../components/ui'
import { useLang } from '../lib/i18n'

function HowItWorksForOwners() {
  const { t } = useLang()
  const steps = [
    [t('Publicá en 3 minutos', 'Anuncie em 3 minutos'), t('La ficha del edificio ya la cargó EVP. Vos sumás piso, distribución, tarifas por período y fotos.', 'A ficha do edifício a EVP já cadastrou. Você adiciona andar, distribuição, tarifas por período e fotos.')],
    [t('Recibí consultas verificadas', 'Receba consultas verificadas'), t('Te llegan a tu email y a tu panel. Solo consulta quien verificó su email; si cargaste teléfono, también te escriben por WhatsApp.', 'Chegam no seu e-mail e no painel. Só consulta quem verificou o e-mail; se você cadastrou telefone, também escrevem pelo WhatsApp.')],
    [t('Cerrá el alquiler vos', 'Feche o aluguel você mesmo'), t('El contrato, la seña y el pago se acuerdan entre vos y el inquilino. EVP no intermedia ni cobra comisión.', 'O contrato, o sinal e o pagamento são acertados entre você e o inquilino. A EVP não intermedeia nem cobra comissão.')],
  ]
  return (
    <div className="grid gap-10 rounded-[28px] bg-mist p-6 md:p-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
      <div className="flex flex-col gap-5">
        <h2 className="f-h2 text-[clamp(1.7rem,3vw,2.5rem)]">{t('Así funciona.', 'Funciona assim.')}</h2>
        <div className="flex flex-col gap-2 rounded-[18px] bg-bg p-5 ring-1 ring-line">
          <p className="font-semibold">{t('Primer año: publicación gratis', 'Primeiro ano: anúncio grátis')}</p>
          <p className="text-[0.9375rem] text-mute">
            {t(
              'Después, un plan de publicación con costo fijo, nunca una comisión sobre tu alquiler. Te avisamos antes de que termine el año gratis y decidís si seguís.',
              'Depois, um plano de anúncio com custo fixo, nunca uma comissão sobre o seu aluguel. Avisamos antes de terminar o ano grátis e você decide se continua.',
            )}
          </p>
        </div>
      </div>
      <ol className="flex flex-col">
        {steps.map(([title, body], i) => (
          <li key={title} className="flex gap-5 border-t border-line-strong py-5 first:border-t-0 first:pt-0">
            <span className="f-num flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-[0.875rem] font-semibold text-on-ink">{i + 1}</span>
            <div>
              <h3 className="f-h3 text-[1.125rem]">{title}</h3>
              <p className="mt-1 text-mute">{body}</p>
            </div>
          </li>
        ))}
      </ol>
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
      t('¿EVP cobra comisión?', 'A EVP cobra comissão?'),
      t('No. EVP es una plataforma de promoción de unidades en edificios VIP: no es una inmobiliaria, no intermedia en el alquiler ni cobra comisión.', 'Não. A EVP é uma plataforma de divulgação de unidades em edifícios VIP: não é imobiliária, não intermedeia o aluguel nem cobra comissão.'),
    ],
    [
      t('¿Cómo me contactan los interesados?', 'Como os interessados me contatam?'),
      t('Envían una consulta desde la publicación y te llega a tu email y a tu panel. Si cargaste un teléfono, también pueden escribirte por WhatsApp, pero solo quienes verificaron su email y te consultaron.', 'Enviam uma consulta pelo anúncio, que chega no seu e-mail e no painel. Se você cadastrou telefone, também podem escrever pelo WhatsApp, mas só quem verificou o e-mail e consultou.'),
    ],
    [
      t('¿Quién hace el contrato y cobra el alquiler?', 'Quem faz o contrato e recebe o aluguel?'),
      t('Vos, directamente con el inquilino. Te recomendamos un contrato de arrendamiento de temporada por escrito, una seña documentada y el inventario de la unidad firmado al ingreso.', 'Você, diretamente com o inquilino. Recomendamos um contrato de locação por temporada por escrito, um sinal documentado e o inventário da unidade assinado na entrada.'),
    ],
    [
      t('¿Quién ve mis datos?', 'Quem vê meus dados?'),
      t('En la publicación figuran el edificio, el piso, la distribución, las tarifas y las fotos del interior. Tu teléfono solo lo ve quien te consulta con su email verificado. Tu documento y el título de propiedad, solo EVP.', 'No anúncio aparecem o edifício, o andar, a distribuição, as tarifas e as fotos do interior. Seu telefone só é visto por quem consulta com e-mail verificado. Seu documento e a escritura, só a EVP.'),
    ],
    [
      t('¿Qué pasa después del primer año?', 'O que acontece depois do primeiro ano?'),
      t('Publicar es gratis durante el primer año. Después habrá un plan de publicación con costo fijo, nunca una comisión sobre el alquiler. Te avisamos con anticipación y decidís si seguís.', 'Anunciar é grátis no primeiro ano. Depois haverá um plano de anúncio com custo fixo, nunca uma comissão sobre o aluguel. Avisamos com antecedência e você decide se continua.'),
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
                'Publicás en menos de 3 minutos, recibís consultas directas de interesados verificados y cerrás el alquiler vos, sin comisiones. Tu inmueble nunca aparece en portales masivos. El primer año, publicar es gratis.',
                'Você anuncia em menos de 3 minutos, recebe consultas diretas de interessados verificados e fecha o aluguel você mesmo, sem comissões. Seu imóvel nunca aparece em portais de massa. No primeiro ano, anunciar é grátis.',
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
                  [<ChatCircleText key="w" size={18} />, t('Consultas directas, sin intermediarios', 'Consultas diretas, sem intermediários')],
                  [<Handshake key="s" size={18} />, t('Sin comisiones · gratis el primer año', 'Sem comissões · grátis no primeiro ano')],
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
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              {
                icon: <Eye size={22} weight="light" />,
                title: t('En la publicación', 'No anúncio'),
                items: [t('Edificio y su ficha certificada', 'Edifício e sua ficha certificada'), t('Piso y distribución', 'Andar e distribuição'), t('Tarifas por período', 'Tarifas por período'), t('Fotos del interior revisadas por EVP', 'Fotos do interior revisadas pela EVP')],
              },
              {
                icon: <LockKey size={22} weight="light" />,
                title: t('Solo para quien te consulta', 'Só para quem consulta'),
                items: [t('Tu teléfono o WhatsApp, si lo cargaste', 'Seu telefone ou WhatsApp, se cadastrou'), t('Visible tras verificar su email y enviar la consulta', 'Visível após verificar o e-mail e enviar a consulta'), t('Nunca indexado por buscadores', 'Nunca indexado por buscadores')],
              },
              {
                icon: <EyeSlash size={22} weight="light" />,
                title: t('Solo lo ve EVP', 'Só a EVP vê'),
                items: [t('Tu documento y el título de propiedad', 'Seu documento e a escritura'), t('Tu email', 'Seu e-mail'), t('Tus períodos de uso propio', 'Seus períodos de uso próprio')],
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
          <HowItWorksForOwners />
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
