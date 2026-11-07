import { CheckCircle, ClipboardText, Handshake, IdentificationCard, Megaphone, Scroll, UsersThree } from '@phosphor-icons/react'
import { useId, useState, type FormEvent } from 'react'
import { ArchScene } from '../components/ArchScene'
import { Button, Field } from '../components/ui'
import { useLang } from '../lib/i18n'
import { useStore } from '../lib/store'

export default function Admins() {
  const { t } = useLang()
  const { addLead } = useStore()
  const fid = useId()
  const [f, setF] = useState({ building: '', name: '', role: 'admin', email: '', phone: '', message: '' })
  const [attempted, setAttempted] = useState(false)
  const [sent, setSent] = useState(false)
  const errors: Record<string, string> = {}
  if (f.building.trim().length < 3) errors.building = t('Indicá el nombre del edificio.', 'Informe o nome do edifício.')
  if (f.name.trim().length < 3) errors.name = t('Indicá tu nombre.', 'Informe seu nome.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) errors.email = t('Revisá el email.', 'Confira o e-mail.')
  const err = (k: string) => (attempted ? errors[k] : undefined)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setAttempted(true)
    if (Object.keys(errors).length) return
    addLead({ id: crypto.randomUUID(), ...f, createdAt: new Date().toISOString() })
    setSent(true)
  }

  const benefits = [
    [<IdentificationCard key="i" size={24} weight="light" />, t('Huéspedes identificados', 'Hóspedes identificados'), t('Cada huésped llega con documento verificado, contrato firmado y registro previo para portería.', 'Cada hóspede chega com documento verificado, contrato assinado e registro prévio para a portaria.')],
    [<Scroll key="s" size={24} weight="light" />, t('Reglamento aceptado por contrato', 'Regulamento aceito em contrato'), t('El reglamento de copropiedad integra el contrato. Incumplirlo tiene consecuencias concretas.', 'O regulamento do condomínio faz parte do contrato. Descumpri-lo tem consequências concretas.')],
    [<UsersThree key="u" size={24} weight="light" />, t('Sin rotación diaria', 'Sem rotatividade diária'), t('Solo estadías por quincena, mes o temporada. Menos movimiento en ascensores, lobby y amenities.', 'Só estadias por quinzena, mês ou temporada. Menos movimento em elevadores, lobby e amenities.')],
    [<ClipboardText key="c" size={24} weight="light" />, t('Reporte de temporada', 'Relatório de temporada'), t('Al cierre, el consejo recibe un informe con ocupación, incidencias y contactos.', 'No encerramento, o conselho recebe um relatório com ocupação, ocorrências e contatos.')],
  ] as const

  const process = [
    [t('Relevamiento', 'Vistoria'), t('Visitamos el edificio y producimos la ficha madre con fotos profesionales.', 'Visitamos o edifício e produzimos a ficha técnica com fotos profissionais.')],
    [t('Acuerdo institucional', 'Acordo institucional'), t('Definimos con la administración el protocolo de ingreso y de registro de huéspedes.', 'Definimos com a administração o protocolo de entrada e de registro de hóspedes.')],
    [t('Presentación a copropietarios', 'Apresentação aos proprietários'), t('Enviamos una carta formal a cada unidad, entregada por recepción.', 'Enviamos uma carta formal a cada unidade, entregue pela recepção.')],
    [t('Temporada', 'Temporada'), t('Canal directo con EVP para portería, de diciembre a abril.', 'Canal direto com a EVP para a portaria, de dezembro a abril.')],
  ]

  return (
    <div>
      <section className="on-ink relative isolate overflow-hidden bg-ink pt-36 pb-20 text-on-ink md:pb-28">
        <ArchScene shape="twin" time="dusk" seed={61} className="absolute inset-0 -z-10 size-full opacity-60" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,oklch(0.205_0.035_240)_20%,oklch(0.205_0.035_240/0.4)_70%,oklch(0.205_0.035_240/0.2))]" />
        <div className="shell flex flex-col gap-6">
          <p className="inline-flex items-center gap-2 text-[0.9375rem] font-medium text-ocaso">
            <Handshake size={20} />
            {t('Para administraciones, consejos y portería', 'Para administrações, conselhos e portaria')}
          </p>
          <h1 className="f-display max-w-[16ch] text-[clamp(2.4rem,5.5vw,4.5rem)]">{t('Un servicio para la comunidad del edificio.', 'Um serviço para a comunidade do edifício.')}</h1>
          <p className="max-w-[54ch] text-[1.125rem] text-on-ink-mute">
            {t(
              'Los alquileres de temporada ya ocurren en tu edificio. Con EVP pasan por un contrato, un registro y un reglamento aceptado, y no por un portal masivo.',
              'Os aluguéis de temporada já acontecem no seu edifício. Com a EVP, passam por um contrato, um registro e um regulamento aceito, e não por um portal de massa.',
            )}
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="shell grid gap-x-10 gap-y-12 md:grid-cols-2">
          {benefits.map(([icon, title, body]) => (
            <div key={title} className="reveal flex gap-5 border-t border-line pt-8">
              <span className="text-marine-strong">{icon}</span>
              <div className="flex flex-col gap-2">
                <h2 className="f-h3 text-[1.25rem]">{title}</h2>
                <p className="max-w-[44ch] text-mute">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-mist py-24 md:py-32">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div className="flex flex-col gap-8">
            <h2 className="f-h2 text-[clamp(1.9rem,3.6vw,3rem)]">{t('Cómo se suma un edificio', 'Como um edifício entra')}</h2>
            <ol className="flex flex-col">
              {process.map(([title, body], i) => (
                <li key={title} className="flex gap-5 border-t border-line-strong py-5">
                  <span className="f-num w-6 shrink-0 pt-0.5 font-semibold text-marine-strong">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-[0.9375rem] text-mute">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="inline-flex items-center gap-2 text-[0.875rem] text-mute">
              <Megaphone size={16} />
              {t('Sin costo para la comunidad ni para el edificio.', 'Sem custo para a comunidade nem para o edifício.')}
            </p>
          </div>

          <div className="rounded-[24px] bg-bg p-6 shadow-[var(--shadow-ambient)] md:p-10">
            {sent ? (
              <div className="flex flex-col items-start gap-4" role="status">
                <CheckCircle size={40} weight="fill" className="text-ok" />
                <h2 className="f-h3 text-[1.5rem]">{t('Gracias. Te contactamos esta semana.', 'Obrigado. Entraremos em contato nesta semana.')}</h2>
                <p className="text-mute">
                  {t(`Vamos a coordinar una visita a ${f.building} para hacer el relevamiento.`, `Vamos agendar uma visita ao ${f.building} para fazer a vistoria.`)}
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="flex flex-col gap-5">
                <h2 className="f-h3 text-[1.375rem]">{t('Proponé tu edificio', 'Proponha seu edifício')}</h2>
                <Field label={t('Edificio', 'Edifício')} htmlFor={`${fid}-b`} error={err('building')}>
                  <input id={`${fid}-b`} className="field" value={f.building} onChange={(e) => setF({ ...f, building: e.target.value })} aria-invalid={!!err('building') || undefined} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t('Nombre', 'Nome')} htmlFor={`${fid}-n`} error={err('name')}>
                    <input id={`${fid}-n`} className="field" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={!!err('name') || undefined} />
                  </Field>
                  <Field label={t('Tu rol', 'Seu papel')} htmlFor={`${fid}-r`}>
                    <select id={`${fid}-r`} className="field" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
                      <option value="admin">{t('Administración', 'Administração')}</option>
                      <option value="consejo">{t('Consejo de copropietarios', 'Conselho de condôminos')}</option>
                      <option value="porteria">{t('Encargado / portería', 'Zelador / portaria')}</option>
                      <option value="propietario">{t('Propietario', 'Proprietário')}</option>
                    </select>
                  </Field>
                  <Field label="Email" htmlFor={`${fid}-e`} error={err('email')}>
                    <input id={`${fid}-e`} type="email" className="field" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={!!err('email') || undefined} />
                  </Field>
                  <Field label={t('Teléfono', 'Telefone')} htmlFor={`${fid}-p`} optional>
                    <input id={`${fid}-p`} type="tel" className="field" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                  </Field>
                </div>
                <Field label={t('Mensaje', 'Mensagem')} htmlFor={`${fid}-m`} optional>
                  <textarea id={`${fid}-m`} className="field min-h-28" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
                </Field>
                <Button type="submit" size="lg" trailing className="self-start">
                  {t('Solicitar relevamiento', 'Solicitar vistoria')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
