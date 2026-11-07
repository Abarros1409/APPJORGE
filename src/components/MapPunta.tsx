import { useLang } from '../lib/i18n'

export type MapPin = { id: string; x: number; y: number; label: string; sub?: string; count?: number }

type Props = {
  pins: MapPin[]
  activeId?: string | null
  onSelect?: (id: string) => void
  onHover?: (id: string | null) => void
  className?: string
  tone?: 'light' | 'ink'
}

/** Illustrated map of the Punta del Este coast (not to scale). */
export function MapPunta({ pins, activeId, onSelect, onHover, className, tone = 'light' }: Props) {
  const { t } = useLang()
  const ink = tone === 'ink'
  const sea = ink ? 'oklch(0.24 0.04 240)' : 'oklch(0.93 0.03 230)'
  const land = ink ? 'oklch(0.3 0.045 238)' : 'oklch(1 0 0)'
  const coast = ink ? 'oklch(0.97 0.01 230 / 0.35)' : 'oklch(0.55 0.105 230 / 0.55)'
  const label = ink ? 'oklch(0.8 0.025 235)' : 'oklch(0.47 0.025 240)'
  const coastPath =
    'M0 262 C 60 278, 130 302, 240 334 C 330 360, 400 384, 452 404 C 470 412, 474 430, 470 452 C 464 486, 448 516, 452 546 C 456 562, 486 562, 498 540 C 508 512, 508 478, 514 456 C 520 432, 534 422, 560 412 C 640 384, 720 352, 790 318 C 830 298, 852 286, 868 278 L 884 272 C 920 258, 960 240, 1000 226'
  return (
    <svg viewBox="0 0 1000 640" className={className} role="group" aria-label={t('Mapa ilustrativo de Punta del Este con los edificios certificados', 'Mapa ilustrativo de Punta del Este com os edifícios certificados')}>
      <rect width="1000" height="640" fill={sea} />
      {/* sea texture */}
      {Array.from({ length: 22 }).map((_, i) => (
        <path key={i} d={`M${(i * 137) % 1000} ${430 + ((i * 53) % 200)} h${40 + ((i * 29) % 70)}`} stroke={coast} strokeOpacity={0.35} strokeWidth={1.2} />
      ))}
      <path d={`${coastPath} L1000 0 L0 0 Z`} fill={land} />
      <path d={coastPath} fill="none" stroke={coast} strokeWidth={2} />
      {/* arroyo Maldonado */}
      <path d="M876 275 C 866 230, 858 180, 840 130 C 826 92, 812 60, 806 0" fill="none" stroke={coast} strokeWidth={5} strokeLinecap="round" />
      {/* islands */}
      <ellipse cx="372" cy="474" rx="30" ry="12" fill={land} stroke={coast} strokeWidth={1.5} />
      <ellipse cx="724" cy="548" rx="16" ry="8" fill={land} stroke={coast} strokeWidth={1.5} />
      <g fontSize="13" fill={label} style={{ fontStretch: '110%' }}>
        <text x="372" y="502" textAnchor="middle">Isla Gorriti</text>
        <text x="724" y="576" textAnchor="middle">Isla de Lobos</text>
        <text x="40" y="222">Punta Ballena</text>
      </g>
      <g fontSize="15" fill={ink ? 'oklch(0.97 0.01 230)' : 'oklch(0.205 0.035 240)'} fontWeight={600} style={{ fontStretch: '125%', letterSpacing: '0.12em' }}>
        <text x="190" y="372">MANSA</text>
        <text x="520" y="610">PENÍNSULA</text>
        <text x="640" y="438">BRAVA</text>
        <text x="836" y="322">LA BARRA</text>
        <text x="990" y="190" textAnchor="end">MANANTIALES</text>
      </g>

      {pins.map((p) => {
        const active = p.id === activeId
        return (
          <g
            key={p.id}
            transform={`translate(${p.x} ${p.y})`}
            role="button"
            tabIndex={0}
            aria-label={`${p.label}${p.sub ? ` · ${p.sub}` : ''}`}
            aria-pressed={active}
            onClick={() => onSelect?.(p.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect?.(p.id)
              }
            }}
            onMouseEnter={() => onHover?.(p.id)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(p.id)}
            onBlur={() => onHover?.(null)}
            style={{ cursor: 'pointer', outline: 'none' }}
            className="group"
          >
            <circle r={active ? 26 : 18} fill="oklch(0.77 0.13 58)" opacity={active ? 0.28 : 0} style={{ transition: 'all 240ms cubic-bezier(0.22,1,0.36,1)' }} />
            <circle r={active ? 11 : 8} fill={active ? 'oklch(0.77 0.13 58)' : ink ? 'oklch(0.97 0.01 230)' : 'oklch(0.205 0.035 240)'} stroke={ink ? 'oklch(0.205 0.035 240)' : 'white'} strokeWidth={3} style={{ transition: 'all 240ms cubic-bezier(0.22,1,0.36,1)' }} />
            {typeof p.count === 'number' && (
              <text y={4} textAnchor="middle" fontSize="10" fontWeight={700} fill={active ? 'oklch(0.205 0.035 240)' : ink ? 'oklch(0.205 0.035 240)' : 'white'} className="f-num" style={{ pointerEvents: 'none' }}>
                {p.count}
              </text>
            )}
            {active && (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={-p.label.length * 4.6 - 14} y={-58} width={p.label.length * 9.2 + 28} height={p.sub ? 40 : 28} rx={8} fill="oklch(0.205 0.035 240)" />
                <text y={p.sub ? -40 : -39} textAnchor="middle" fontSize="13" fontWeight={600} fill="white">
                  {p.label}
                </text>
                {p.sub && (
                  <text y={-25} textAnchor="middle" fontSize="11" fill="oklch(0.8 0.025 235)">
                    {p.sub}
                  </text>
                )}
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
