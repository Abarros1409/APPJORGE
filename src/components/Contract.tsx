import { useEffect, useRef, useState } from 'react'
import { BUILDING_BY_ID, type Unit } from '../lib/data'
import { dateRange, longDate, usd } from '../lib/format'
import { PERIOD_BY_ID, type PeriodId } from '../lib/periods'
import { useLang } from '../lib/i18n'
import { cx } from './ui'

export const RULES_ES = [
  'Horario de descanso de 23:00 a 08:00 h en unidades y áreas comunes.',
  'Registro obligatorio de todos los huéspedes en portería al ingresar.',
  'Uso de piscinas, spa y gimnasio según los horarios y el aforo del edificio.',
  'Prohibidas las fiestas, los eventos y el ingreso de visitas no registradas.',
  'Mascotas solo en unidades habilitadas, con correa en las áreas comunes.',
  'Estacionamiento exclusivamente en la cochera asignada a la unidad.',
]
export const RULES_PT = [
  'Horário de silêncio das 23:00 às 08:00 h nas unidades e áreas comuns.',
  'Registro obrigatório de todos os hóspedes na portaria ao chegar.',
  'Uso de piscinas, spa e academia conforme horários e capacidade do edifício.',
  'Proibidas festas, eventos e entrada de visitas não registradas.',
  'Animais apenas em unidades habilitadas, com guia nas áreas comuns.',
  'Estacionamento exclusivamente na vaga atribuída à unidade.',
]

export type ContractData = {
  unit: Unit
  period: PeriodId
  net: number
  fee: number
  guest: { name: string; doc: string; country: string; email: string; guests: number; pet: boolean }
  date: string
  code?: string
  signature?: string
  signedAt?: string
}

const COUNTRY: Record<string, string> = { AR: 'Argentina', BR: 'Brasil', UY: 'Uruguay', OTRO: '—' }

/**
 * Seasonal lease draft (Uruguay). Legal text is kept in Spanish, the
 * governing language. MODEL DRAFT — must be reviewed by a Uruguayan
 * escribano/abogado before production use.
 */
export function ContractDoc({ d, className }: { d: ContractData; className?: string }) {
  const { lang, t } = useLang()
  const b = BUILDING_BY_ID[d.unit.buildingId]
  const p = PERIOD_BY_ID[d.period]
  const blank = (v: string | number | undefined) => (v ? <strong className="font-semibold">{v}</strong> : <span className="text-mute">__________</span>)
  const clauses: [string, React.ReactNode][] = [
    ['PRIMERO · Objeto', <>El ARRENDADOR da en arrendamiento de temporada al ARRENDATARIO la unidad {blank(d.unit.unit)}, piso {d.unit.floor}, del edificio {blank(b.name)}, sito en {b.address}, Punta del Este, departamento de Maldonado, con el mobiliario y el equipamiento detallados en el inventario digital (Anexo I).</>],
    ['SEGUNDO · Plazo y destino', <>El arrendamiento comprende el período {blank(p.name.es)}: desde el {new Date(p.start).toLocaleDateString('es-UY', { timeZone: 'UTC' })} a las 15:00 h hasta el {new Date(p.end).toLocaleDateString('es-UY', { timeZone: 'UTC' })} a las 11:00 h. Las partes declaran que se trata de un arrendamiento de temporada con destino exclusivo de descanso, celebrado conforme a la legislación uruguaya aplicable (Ley N.º 14.219 y normas concordantes), sin derecho a prórroga.</>],
    ['TERCERO · Precio', <>El precio total del arrendamiento es de {blank(usd(d.net, 'es'))}. Además, el ARRENDATARIO abona a EVP la Tarifa de Gestión Digital y Garantía de Reserva VIP de {blank(usd(d.fee, 'es'))}. Ambos importes se pagan por adelantado y en su totalidad a través de la plataforma EVP.</>],
    ['CUARTO · Custodia del pago', <>EVP recibe el pago en custodia en calidad de agente de cobro y lo transfiere al ARRENDADOR entre 24 y 48 horas después del check-in exitoso, que se acredita con el inventario digital conforme firmado por el ARRENDATARIO.</>],
    ['QUINTO · Capacidad', <>La unidad será ocupada por un máximo de {blank(d.guest.guests)} personas. {d.guest.pet ? 'El ARRENDATARIO ingresará con mascota, de acuerdo con el reglamento del edificio.' : 'No se autoriza el ingreso de mascotas.'}</>],
    ['SEXTO · Reglamento de copropiedad', <>El ARRENDATARIO declara conocer y aceptar el reglamento de copropiedad de {b.name}, que integra el presente contrato como Anexo II. Su incumplimiento grave habilita la rescisión del contrato.</>],
    ['SÉPTIMO · Estado e inventario', <>Al ingresar, el ARRENDATARIO verifica el inventario digital de la unidad y deja constancia de cualquier observación. Responde por los daños causados durante su estadía, salvo el desgaste por uso normal.</>],
    ['OCTAVO · Prohibiciones', <>Queda prohibido subarrendar, ceder el contrato, destinar la unidad a un uso distinto del pactado, realizar eventos y superar la capacidad máxima.</>],
    ['NOVENO · Restitución', <>Al vencer el plazo, el ARRENDATARIO restituye la unidad en el mismo estado en que la recibió, con las llaves y los medios de acceso entregados.</>],
    ['DÉCIMO · Domicilios y jurisdicción', <>Las partes constituyen domicilio electrónico en los correos registrados en EVP (ARRENDATARIO: {blank(d.guest.email)}). Para cualquier controversia se someten a los tribunales competentes de Maldonado, República Oriental del Uruguay.</>],
  ]
  return (
    <article className={cx('font-sans text-[0.875rem] leading-relaxed text-ink', className)} lang="es">
      <header className="flex flex-col gap-1 border-b border-line pb-4">
        <p className="f-seal text-mute">EVP · Edificios VIP Punta del Este</p>
        <h3 className="f-h3 text-[1.125rem]">Contrato de arrendamiento de temporada</h3>
        <p className="text-[0.8125rem] text-mute">
          {d.code ? `N.º ${d.code} · ` : ''}Punta del Este, {longDate(d.date, 'es')}
        </p>
        {lang === 'pt' && <p className="mt-1 text-[0.8125rem] text-marine-strong">{t('', 'Contrato redigido em espanhol, idioma oficial da jurisdição uruguaia.')}</p>}
      </header>
      <p className="mt-4">
        Entre, por una parte, el <strong>ARRENDADOR</strong>, titular de la unidad, debidamente identificado ante EVP, que interviene representado por EVP como intermediario; y por otra parte, el <strong>ARRENDATARIO</strong> {blank(d.guest.name)}, documento {blank(d.guest.doc)}, con residencia en {blank(COUNTRY[d.guest.country] ?? d.guest.country)}, se celebra el presente contrato:
      </p>
      <ol className="mt-4 flex flex-col gap-3">
        {clauses.map(([h, body]) => (
          <li key={h}>
            <p className="font-semibold">{h}</p>
            <p>{body}</p>
          </li>
        ))}
      </ol>
      <section className="mt-5 rounded-[10px] bg-mist p-4">
        <p className="font-semibold">Anexo II · Reglamento de copropiedad (resumen)</p>
        <ul className="mt-2 list-disc pl-5">
          {RULES_ES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
      <footer className="mt-6 grid gap-6 border-t border-line pt-5 sm:grid-cols-2">
        <div>
          <div className="flex h-20 items-end border-b border-ink/40">{d.signature ? <img src={d.signature} alt="Firma del arrendatario" className="max-h-20" /> : null}</div>
          <p className="mt-1 text-[0.75rem] text-mute">
            ARRENDATARIO · {d.guest.name || '—'}
            {d.signedAt ? ` · firmado digitalmente el ${new Date(d.signedAt).toLocaleString('es-UY')}` : ''}
          </p>
        </div>
        <div>
          <div className="flex h-20 items-end border-b border-ink/40">
            <span className="f-seal pb-2 text-marine-strong">EVP · firma electrónica</span>
          </div>
          <p className="mt-1 text-[0.75rem] text-mute">Por el ARRENDADOR, EVP como intermediario</p>
        </div>
      </footer>
      <p className="mt-5 text-[0.75rem] text-mute">Período: {dateRange(d.period, 'es')}. Borrador modelo: debe ser validado por un escribano o abogado uruguayo antes de su uso.</p>
    </article>
  )
}

/** Pointer-based signature pad with typed-name alternative for keyboard users. */
export function SignaturePad({ onChange, label }: { onChange: (dataUrl: string) => void; label: string }) {
  const { t } = useLang()
  const canvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [empty, setEmpty] = useState(true)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ratio = window.devicePixelRatio || 1
    const rect = c.getBoundingClientRect()
    c.width = rect.width * ratio
    c.height = rect.height * ratio
    const ctx = c.getContext('2d')!
    ctx.scale(ratio, ratio)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#183a5a'
    ctx.lineWidth = 2.2
  }, [])

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const down = (e: React.PointerEvent) => {
    canvas.current!.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pos(e)
  }
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return
    const ctx = canvas.current!.getContext('2d')!
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (empty) setEmpty(false)
  }
  const up = () => {
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    onChange(canvas.current!.toDataURL('image/png'))
  }
  const clear = () => {
    const c = canvas.current!
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    setEmpty(true)
    setTyped('')
    onChange('')
  }
  const fromTyped = (v: string) => {
    setTyped(v)
    const c = canvas.current!
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    if (!v.trim()) {
      setEmpty(true)
      onChange('')
      return
    }
    const r = c.getBoundingClientRect()
    ctx.save()
    ctx.fillStyle = '#183a5a'
    ctx.font = `italic 500 ${Math.min(42, r.height * 0.42)}px "Archivo Variable", sans-serif`
    ctx.textBaseline = 'middle'
    ctx.fillText(v, 18, r.height / 2)
    ctx.restore()
    setEmpty(false)
    onChange(c.toDataURL('image/png'))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.875rem] font-medium">{label}</span>
        <button type="button" onClick={clear} className="text-[0.8125rem] font-medium text-marine-strong underline-offset-4 hover:underline" disabled={empty}>
          {t('Borrar', 'Apagar')}
        </button>
      </div>
      <div className="relative">
        <canvas
          ref={canvas}
          className="h-36 w-full touch-none rounded-[12px] bg-bg ring-1 ring-line-strong ring-inset"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label={t('Área de firma: dibujá tu firma con el dedo o el mouse', 'Área de assinatura: desenhe com o dedo ou o mouse')}
          role="img"
        />
        {empty && <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[0.875rem] text-mute">{t('Firmá aquí', 'Assine aqui')}</span>}
        <span className="pointer-events-none absolute inset-x-6 bottom-8 border-b border-dashed border-line-strong" />
      </div>
      <label className="flex flex-col gap-1 text-[0.8125rem] text-mute">
        {t('O escribí tu nombre completo como firma', 'Ou digite seu nome completo como assinatura')}
        <input className="field min-h-11 text-[0.9375rem] text-ink" value={typed} onChange={(e) => fromTyped(e.target.value)} autoComplete="name" />
      </label>
    </div>
  )
}
