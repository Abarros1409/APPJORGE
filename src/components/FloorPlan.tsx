import { memo } from 'react'
import { useLang } from '../lib/i18n'

type Props = { bedrooms: number; baths: number; m2: number; seaView: boolean; className?: string }

/** Schematic floor plan generated from the unit's real distribution. */
function FloorPlanImpl({ bedrooms, baths, m2, seaView, className }: Props) {
  const { t } = useLang()
  const X0 = 60
  const X1 = 740
  const Y0 = 50
  const YM = 250
  const Y1 = 430
  const ink = 'oklch(0.205 0.035 240)'
  const soft = 'oklch(0.55 0.105 230 / 0.08)'
  const furn = 'oklch(0.205 0.035 240 / 0.28)'

  // Bottom row (sea façade): living + master suite
  const livingW = (X1 - X0) * (bedrooms >= 3 ? 0.58 : 0.62)
  const masterX = X0 + livingW

  // Top row: kitchen, other bedrooms, baths (one bath is en-suite in master)
  const kitchenW = 170
  const others = Math.max(0, bedrooms - 1)
  const extraBaths = Math.max(0, baths - 1)
  const avail = X1 - X0 - kitchenW
  const bathW = 92
  const bedW = others ? (avail - extraBaths * bathW) / others : 0
  type Room = { x: number; w: number; label: string; kind: 'bed' | 'bath' | 'kitchen' }
  const top: Room[] = [{ x: X0, w: kitchenW, label: t('Cocina', 'Cozinha'), kind: 'kitchen' }]
  const seq: ('bed' | 'bath')[] = []
  let bathsLeft = extraBaths
  for (let i = 0; i < others; i++) {
    seq.push('bed')
    if (bathsLeft > 0) {
      seq.push('bath')
      bathsLeft--
    }
  }
  while (bathsLeft-- > 0) seq.push('bath')
  let cx = X0 + kitchenW
  let b = 2
  for (const kind of seq) {
    if (kind === 'bath') {
      top.push({ x: cx, w: bathW, label: t('Baño', 'Banho'), kind: 'bath' })
      cx += bathW
    } else {
      top.push({ x: cx, w: bedW, label: `${t('Dorm.', 'Quarto')} ${b++}`, kind: 'bed' })
      cx += bedW
    }
  }
  if (!others && !extraBaths) top[0].w = X1 - X0
  else if (cx < X1) top[top.length - 1].w += X1 - cx

  const door = (x: number, y: number, dir: 1 | -1, key: string) => (
    <g key={key}>
      <path d={`M${x} ${y} L${x + 34} ${y}`} stroke="white" strokeWidth={8} />
      <path d={`M${x} ${y} L${x} ${y + 34 * dir} M${x} ${y + 34 * dir} A34 34 0 0 ${dir === 1 ? 0 : 1} ${x + 34} ${y}`} stroke={ink} strokeWidth={1.2} fill="none" />
    </g>
  )

  return (
    <svg viewBox="0 0 800 540" className={className} role="img" aria-label={t(`Plano esquemático: ${bedrooms} dormitorios, ${baths} baños, ${m2} m²`, `Planta esquemática: ${bedrooms} quartos, ${baths} banheiros, ${m2} m²`)}>
      <rect width="800" height="540" fill="oklch(0.985 0.004 230)" />
      {/* grid */}
      {Array.from({ length: 21 }).map((_, i) => (
        <path key={`gx${i}`} d={`M${i * 40} 0 V540`} stroke="oklch(0.55 0.105 230 / 0.07)" />
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <path key={`gy${i}`} d={`M0 ${i * 40} H800`} stroke="oklch(0.55 0.105 230 / 0.07)" />
      ))}

      {/* terrace */}
      <rect x={X0} y={Y1} width={X1 - X0} height={62} fill={soft} stroke={ink} strokeWidth={1.2} strokeDasharray="6 5" />
      <text x={X0 + 16} y={Y1 + 38} fontSize="15" fill={ink} style={{ fontStretch: '118%' }} fontWeight={500}>
        {t('Terraza', 'Terraço')}
        {seaView ? t(' · vista al mar', ' · vista para o mar') : ''}
      </text>

      {/* rooms fill */}
      <rect x={X0} y={YM} width={livingW} height={Y1 - YM} fill={soft} />

      {/* furniture: living */}
      <rect x={X0 + 40} y={Y1 - 92} width={200} height={54} rx={10} fill="none" stroke={furn} strokeWidth={2} />
      <rect x={X0 + 70} y={YM + 50} width={130} height={60} rx={6} fill="none" stroke={furn} strokeWidth={2} />
      <circle cx={X0 + livingW - 90} cy={YM + 90} r={42} fill="none" stroke={furn} strokeWidth={2} />
      {/* master bed */}
      <rect x={masterX + 40} y={YM + 50} width={110} height={130} rx={6} fill="none" stroke={furn} strokeWidth={2} />
      <rect x={masterX + 48} y={YM + 58} width={42} height={22} rx={4} fill="none" stroke={furn} strokeWidth={1.5} />
      <rect x={masterX + 100} y={YM + 58} width={42} height={22} rx={4} fill="none" stroke={furn} strokeWidth={1.5} />
      {/* en-suite */}
      <rect x={X1 - 104} y={YM} width={104} height={92} fill="none" stroke={ink} strokeWidth={3} />
      <text x={X1 - 90} y={YM + 54} fontSize="13" fill={ink}>
        {t('Baño', 'Banho')}
      </text>

      {top.map((r, i) => (
        <g key={i}>
          {r.kind === 'bed' && <rect x={r.x + r.w / 2 - 42} y={Y0 + 40} width={84} height={110} rx={6} fill="none" stroke={furn} strokeWidth={2} />}
          {r.kind === 'kitchen' && <rect x={r.x + 14} y={Y0 + 14} width={r.w - 28} height={34} fill="none" stroke={furn} strokeWidth={2} />}
          {i > 0 && <path d={`M${r.x} ${Y0} V${YM}`} stroke={ink} strokeWidth={3} />}
          <text x={r.x + 14} y={YM - 18} fontSize="14" fill={ink} fontWeight={500}>
            {r.label}
          </text>
          {i > 0 && door(r.x + 18, YM, -1, `d${i}`)}
        </g>
      ))}

      {/* interior walls */}
      <path d={`M${X0} ${YM} H${X1}`} stroke={ink} strokeWidth={3} />
      <path d={`M${masterX} ${YM} V${Y1}`} stroke={ink} strokeWidth={3} />
      {door(masterX - 50, YM, 1, 'dm')}
      <text x={X0 + 16} y={Y1 - 18} fontSize="15" fill={ink} fontWeight={600} style={{ fontStretch: '118%' }}>
        {t('Living · comedor', 'Sala · jantar')}
      </text>
      <text x={masterX + 16} y={Y1 - 18} fontSize="14" fill={ink} fontWeight={500}>
        {t('Dorm. principal', 'Suíte principal')}
      </text>

      {/* outer walls with sea-façade glazing */}
      <path d={`M${X0} ${Y0} H${X1} V${Y1} M${X0} ${Y0} V${Y1}`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="square" />
      <path d={`M${X0} ${Y1} H${X1}`} stroke={ink} strokeWidth={2} />
      <path d={`M${X0} ${Y1 - 5} H${X1}`} stroke={ink} strokeWidth={1} />

      {/* north + scale */}
      <g transform="translate(760 505)">
        <text x={-60} y={6} fontSize="13" fill={ink} textAnchor="end" className="f-num">
          {m2} m²
        </text>
        <path d="M-40 -6 L-28 6 L-40 2 L-52 6 Z" fill={ink} />
      </g>
    </svg>
  )
}

export const FloorPlan = memo(FloorPlanImpl)
