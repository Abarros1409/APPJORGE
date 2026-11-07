import { memo, useId } from 'react'
import type { SceneShape, SceneTime } from '../lib/data'

/**
 * Procedural architectural illustration (elevation of a tower on the rambla,
 * the Atlantic in front). Deterministic from `seed`. Used until EVP's
 * professional photography is loaded into `unit.photos` / building files.
 */

type Kind = 'facade' | 'view' | 'pool'

type Props = {
  shape?: SceneShape
  time?: SceneTime
  seed?: number
  kind?: Kind
  floors?: number
  className?: string
  title?: string
  /** Render lit windows independent of time (used by the hero night layer). */
  lit?: boolean
}

type Pal = {
  sky: [string, string, string]
  sea: [string, string]
  haze: string
  sun: string
  sunGlow: string
  sunY: number
  sunR: number
  land: string
  landTop: string
  face: string
  side: string
  slab: string
  glassTop: string
  glassBottom: string
  mullion: string
  light: string
  litChance: number
  shimmer: string
  stars: boolean
  far: string
}

const PAL: Record<SceneTime, Pal> = {
  dawn: {
    sky: ['oklch(0.6 0.06 255)', 'oklch(0.8 0.05 320)', 'oklch(0.91 0.06 65)'],
    sea: ['oklch(0.62 0.05 260)', 'oklch(0.4 0.05 245)'],
    haze: 'oklch(0.72 0.04 290)',
    sun: 'oklch(0.97 0.05 80)',
    sunGlow: 'oklch(0.92 0.09 65)',
    sunY: 0.66,
    sunR: 34,
    land: 'oklch(0.52 0.03 260)',
    landTop: 'oklch(0.7 0.03 300)',
    face: 'oklch(0.9 0.02 300)',
    side: 'oklch(0.7 0.03 270)',
    slab: 'oklch(0.96 0.015 80)',
    glassTop: 'oklch(0.72 0.05 300)',
    glassBottom: 'oklch(0.5 0.05 255)',
    mullion: 'oklch(0.96 0.02 80 / 0.35)',
    light: 'oklch(0.9 0.1 80)',
    litChance: 0.08,
    shimmer: 'oklch(0.95 0.05 70 / 0.5)',
    stars: false,
    far: 'oklch(0.66 0.035 280)',
  },
  day: {
    sky: ['oklch(0.66 0.1 240)', 'oklch(0.8 0.07 232)', 'oklch(0.93 0.03 220)'],
    sea: ['oklch(0.6 0.1 222)', 'oklch(0.4 0.085 238)'],
    haze: 'oklch(0.84 0.03 225)',
    sun: 'oklch(0.99 0.02 95)',
    sunGlow: 'oklch(0.97 0.04 95)',
    sunY: 0.18,
    sunR: 26,
    land: 'oklch(0.86 0.025 85)',
    landTop: 'oklch(0.95 0.015 85)',
    face: 'oklch(0.97 0.006 230)',
    side: 'oklch(0.82 0.02 235)',
    slab: 'oklch(0.99 0.003 230)',
    glassTop: 'oklch(0.74 0.07 232)',
    glassBottom: 'oklch(0.42 0.08 238)',
    mullion: 'oklch(1 0 0 / 0.35)',
    light: 'oklch(0.9 0.08 85)',
    litChance: 0,
    shimmer: 'oklch(1 0 0 / 0.45)',
    stars: false,
    far: 'oklch(0.78 0.035 230)',
  },
  golden: {
    sky: ['oklch(0.6 0.08 250)', 'oklch(0.79 0.09 65)', 'oklch(0.88 0.12 72)'],
    sea: ['oklch(0.58 0.08 240)', 'oklch(0.34 0.06 245)'],
    haze: 'oklch(0.78 0.08 60)',
    sun: 'oklch(0.97 0.09 85)',
    sunGlow: 'oklch(0.88 0.14 65)',
    sunY: 0.52,
    sunR: 40,
    land: 'oklch(0.7 0.07 60)',
    landTop: 'oklch(0.84 0.08 70)',
    face: 'oklch(0.93 0.04 75)',
    side: 'oklch(0.68 0.06 50)',
    slab: 'oklch(0.97 0.03 80)',
    glassTop: 'oklch(0.82 0.09 70)',
    glassBottom: 'oklch(0.45 0.06 245)',
    mullion: 'oklch(0.98 0.03 80 / 0.35)',
    light: 'oklch(0.9 0.11 78)',
    litChance: 0.05,
    shimmer: 'oklch(0.95 0.1 75 / 0.6)',
    stars: false,
    far: 'oklch(0.7 0.06 55)',
  },
  dusk: {
    sky: ['oklch(0.3 0.06 262)', 'oklch(0.55 0.1 330)', 'oklch(0.76 0.14 52)'],
    sea: ['oklch(0.42 0.06 280)', 'oklch(0.22 0.04 250)'],
    haze: 'oklch(0.58 0.09 20)',
    sun: 'oklch(0.9 0.13 60)',
    sunGlow: 'oklch(0.74 0.16 45)',
    sunY: 0.69,
    sunR: 44,
    land: 'oklch(0.3 0.04 270)',
    landTop: 'oklch(0.48 0.06 320)',
    face: 'oklch(0.55 0.05 300)',
    side: 'oklch(0.36 0.05 275)',
    slab: 'oklch(0.75 0.06 340)',
    glassTop: 'oklch(0.62 0.1 20)',
    glassBottom: 'oklch(0.28 0.05 265)',
    mullion: 'oklch(0.9 0.05 40 / 0.25)',
    light: 'oklch(0.86 0.13 75)',
    litChance: 0.32,
    shimmer: 'oklch(0.85 0.13 55 / 0.6)',
    stars: false,
    far: 'oklch(0.42 0.07 320)',
  },
  night: {
    sky: ['oklch(0.15 0.03 255)', 'oklch(0.21 0.045 250)', 'oklch(0.32 0.06 245)'],
    sea: ['oklch(0.22 0.04 245)', 'oklch(0.12 0.025 250)'],
    haze: 'oklch(0.3 0.05 245)',
    sun: 'oklch(0.96 0.02 90)',
    sunGlow: 'oklch(0.5 0.05 240)',
    sunY: 0.2,
    sunR: 18,
    land: 'oklch(0.16 0.025 250)',
    landTop: 'oklch(0.27 0.04 245)',
    face: 'oklch(0.3 0.035 248)',
    side: 'oklch(0.2 0.03 250)',
    slab: 'oklch(0.42 0.04 245)',
    glassTop: 'oklch(0.27 0.045 248)',
    glassBottom: 'oklch(0.16 0.03 250)',
    mullion: 'oklch(0.7 0.04 240 / 0.18)',
    light: 'oklch(0.86 0.12 78)',
    litChance: 0.46,
    shimmer: 'oklch(0.85 0.04 240 / 0.35)',
    stars: true,
    far: 'oklch(0.22 0.035 250)',
  },
}

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t >>> 0) / 4294967296)
  }
}

const W = 1600
const H = 1000
const HORIZON = 690

type Box = { x: number; y: number; w: number; h: number; floors: number; curve?: number; top?: 'flat' | 'round' }

function Facade({ b, p, r, gid, lit, timber }: { b: Box; p: Pal; r: () => number; gid: string; lit: boolean; timber?: boolean }) {
  const fh = b.h / b.floors
  const sideW = Math.max(10, b.w * 0.17)
  const items: React.ReactNode[] = []
  const curve = b.curve ?? 0
  for (let i = 0; i < b.floors; i++) {
    const y = b.y + i * fh
    // glass band
    items.push(<rect key={`g${i}`} x={b.x + 2} y={y + fh * 0.18} width={b.w - 4} height={fh * 0.82} fill={`url(#${gid}-glass)`} />)
    // lit window segments
    const chance = lit ? Math.max(p.litChance, 0.42) : p.litChance
    if (chance > 0) {
      const cols = 6
      for (let c = 0; c < cols; c++) {
        if (r() < chance) {
          const cw = (b.w - 4) / cols
          items.push(
            <rect
              key={`l${i}-${c}`}
              x={b.x + 2 + c * cw + cw * 0.08}
              y={y + fh * 0.3}
              width={cw * (0.6 + r() * 0.3)}
              height={fh * 0.62}
              fill={p.light}
              opacity={0.55 + r() * 0.4}
            />,
          )
        }
      }
    }
    // slab / balcony edge (curved balconies bow outward)
    if (curve) {
      const mid = b.x + b.w / 2
      items.push(
        <path
          key={`s${i}`}
          d={`M${b.x - 6} ${y} Q ${mid} ${y + curve * 2.2} ${b.x + b.w + 6} ${y} L ${b.x + b.w + 6} ${y + fh * 0.2} Q ${mid} ${y + fh * 0.2 + curve * 2.2} ${b.x - 6} ${y + fh * 0.2} Z`}
          fill={p.slab}
        />,
      )
    } else {
      items.push(<rect key={`s${i}`} x={b.x - 6} y={y} width={b.w + 12} height={Math.max(3, fh * 0.18)} fill={p.slab} />)
    }
  }
  // mullions
  const mull: React.ReactNode[] = []
  const cols = timber ? 18 : 6
  for (let c = 1; c < cols; c++) {
    const x = b.x + (b.w / cols) * c
    mull.push(<rect key={`m${c}`} x={x} y={b.y} width={timber ? 3 : 1.4} height={b.h} fill={timber ? 'oklch(0.55 0.06 60 / 0.75)' : p.mullion} />)
  }
  const radius = b.top === 'round' ? Math.min(b.w * 0.5, 120) : 0
  const clip = `${gid}-clip-${Math.round(b.x)}`
  return (
    <g>
      {/* side face for depth */}
      <path d={`M${b.x + b.w} ${b.y + radius * 0.3} L${b.x + b.w + sideW} ${b.y + 14 + radius * 0.3} L${b.x + b.w + sideW} ${b.y + b.h} L${b.x + b.w} ${b.y + b.h} Z`} fill={p.side} />
      <clipPath id={clip}>
        <rect x={b.x - 8} y={b.y} width={b.w + 16} height={b.h + 2} rx={radius} ry={radius} />
        <rect x={b.x - 8} y={b.y + radius} width={b.w + 16} height={b.h - radius} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={p.face} />
        {items}
        {mull}
        {/* sky reflection sweep */}
        <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={`url(#${gid}-sweep)`} />
      </g>
      {/* roof crown */}
      {b.top !== 'round' && <rect x={b.x - 8} y={b.y - 8} width={b.w + 16 + sideW} height={8} fill={p.slab} />}
    </g>
  )
}

function Pine({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <g fill={color}>
      <rect x={x - 3 * s} y={y - 60 * s} width={6 * s} height={60 * s} />
      <ellipse cx={x} cy={y - 78 * s} rx={46 * s} ry={22 * s} />
      <ellipse cx={x - 22 * s} cy={y - 62 * s} rx={30 * s} ry={14 * s} />
      <ellipse cx={x + 24 * s} cy={y - 66 * s} rx={32 * s} ry={15 * s} />
    </g>
  )
}

function ArchSceneImpl({ shape = 'tower', time = 'golden', seed = 7, kind = 'facade', className, title, lit = false }: Props) {
  const gid = useId().replace(/:/g, '')
  const p = PAL[time]
  const r = rng(seed * 9973 + (kind === 'facade' ? 0 : kind === 'view' ? 17 : 31))
  const sunX = kind === 'facade' ? W * (0.18 + r() * 0.1) : W * (0.3 + r() * 0.4)
  const horizon = kind === 'facade' ? HORIZON : kind === 'view' ? 560 : 520
  const sunY = Math.min(horizon - 30, H * p.sunY)

  // --- distant coast and background towers
  const farTowers: React.ReactNode[] = []
  if (kind === 'facade' && shape !== 'lowrise' && shape !== 'stepped') {
    let x = 980
    while (x < W + 40) {
      const w = 40 + r() * 70
      const h = 90 + r() * 210
      farTowers.push(<rect key={x} x={x} y={horizon - h + 18} width={w} height={h} fill={p.far} opacity={0.85} />)
      if (p.litChance > 0.2) {
        for (let k = 0; k < 6; k++) {
          if (r() < 0.5) farTowers.push(<rect key={`${x}-${k}`} x={x + 6 + r() * (w - 16)} y={horizon - h + 30 + r() * (h - 50)} width={6} height={4} fill={p.light} opacity={0.6} />)
        }
      }
      x += w + 30 + r() * 90
    }
  }

  // --- main building geometry
  const boxes: Box[] = []
  const ground = horizon + 40
  const landX = shape === 'lowrise' || shape === 'stepped' ? 470 : 560
  if (kind === 'facade') {
    if (shape === 'tower') boxes.push({ x: 820, y: 150, w: 240, h: ground - 150, floors: 30 })
    if (shape === 'curved') boxes.push({ x: 720, y: 260, w: 400, h: ground - 260, floors: 22, curve: 10, top: 'round' })
    if (shape === 'slab') boxes.push({ x: 640, y: 360, w: 560, h: ground - 360, floors: 16 })
    if (shape === 'twin') {
      boxes.push({ x: 740, y: 190, w: 190, h: ground - 190, floors: 28 })
      boxes.push({ x: 1010, y: 230, w: 190, h: ground - 230, floors: 26 })
    }
    if (shape === 'stepped') {
      boxes.push({ x: 640, y: 470, w: 600, h: ground - 470, floors: 4 })
      boxes.push({ x: 720, y: 330, w: 440, h: 140, floors: 3 })
      boxes.push({ x: 800, y: 210, w: 280, h: 120, floors: 3 })
    }
    if (shape === 'lowrise') {
      boxes.push({ x: 600, y: 520, w: 720, h: ground - 520, floors: 3 })
      boxes.push({ x: 760, y: 430, w: 420, h: 90, floors: 1 })
    }
  }

  const stars: React.ReactNode[] = []
  if (p.stars) {
    for (let i = 0; i < 70; i++) {
      stars.push(<circle key={i} cx={r() * W} cy={r() * horizon * 0.7} r={r() < 0.85 ? 1.2 : 2} fill="oklch(0.97 0.01 230)" opacity={0.3 + r() * 0.6} />)
    }
  }

  const shimmer: React.ReactNode[] = []
  for (let i = 0; i < 46; i++) {
    const y = horizon + 8 + Math.pow(r(), 1.6) * (H - horizon)
    const w = 30 + r() * 180 * ((y - horizon) / (H - horizon) + 0.2)
    shimmer.push(<rect key={i} x={r() * W} y={y} width={w} height={1.2 + ((y - horizon) / (H - horizon)) * 2.4} fill={p.shimmer} opacity={0.18 + r() * 0.3} />)
  }
  const reflection: React.ReactNode[] = []
  if (time !== 'day') {
    for (let i = 0; i < 18; i++) {
      const y = horizon + 6 + i * ((H - horizon) / 18)
      const spread = 20 + i * 9
      reflection.push(<rect key={i} x={sunX - spread / 2 + (r() - 0.5) * 30} y={y} width={spread * (0.4 + r() * 0.8)} height={2 + i * 0.25} fill={p.sunGlow} opacity={0.55 - i * 0.022} />)
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={`${gid}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="0.62" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <linearGradient id={`${gid}-sea`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.sea[0]} />
          <stop offset="1" stopColor={p.sea[1]} />
        </linearGradient>
        <radialGradient id={`${gid}-glow`}>
          <stop offset="0" stopColor={p.sunGlow} stopOpacity="0.9" />
          <stop offset="0.35" stopColor={p.sunGlow} stopOpacity="0.35" />
          <stop offset="1" stopColor={p.sunGlow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${gid}-glass`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.glassTop} />
          <stop offset="1" stopColor={p.glassBottom} />
        </linearGradient>
        <linearGradient id={`${gid}-sweep`} x1="0" x2="1" y1="0" y2="0.4">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.14" />
          <stop offset="0.55" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gid}-vig`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.55" stopColor="black" stopOpacity="0" />
          <stop offset="1" stopColor="black" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${gid}-pool`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="oklch(0.78 0.08 205)" />
          <stop offset="1" stopColor="oklch(0.52 0.09 220)" />
        </linearGradient>
        <linearGradient id={`${gid}-rail`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="oklch(0.95 0.02 220)" stopOpacity="0.16" />
          <stop offset="1" stopColor="oklch(0.95 0.02 220)" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${gid}-sky)`} />
      {stars}
      <circle cx={sunX} cy={sunY} r={p.sunR * 7} fill={`url(#${gid}-glow)`} />
      <circle cx={sunX} cy={sunY} r={p.sunR} fill={p.sun} />

      {/* Punta Ballena silhouette on the far left horizon */}
      <path d={`M0 ${horizon} L0 ${horizon - 38} C 120 ${horizon - 60}, 220 ${horizon - 30}, 330 ${horizon - 12} C 380 ${horizon - 4}, 420 ${horizon}, 460 ${horizon} Z`} fill={p.haze} opacity={0.75} />

      <rect y={horizon} width={W} height={H - horizon} fill={`url(#${gid}-sea)`} />
      {reflection}
      {shimmer}

      {kind === 'facade' && (
        <g>
          {farTowers}
          {/* rambla: a thin coastal strip, the Atlantic in the foreground */}
          <path d={`M${landX} ${ground - 4} L ${W} ${ground - 10} L ${W} ${ground + 58} L ${landX - 70} ${ground + 58} Z`} fill={p.land} />
          <path d={`M${landX - 70} ${ground + 58} L ${W} ${ground + 58} L ${W} ${ground + 74} L ${landX - 96} ${ground + 74} Z`} fill={p.landTop} opacity={0.9} />
          <rect x={landX} y={ground - 6} width={W} height={3} fill={p.landTop} />
          <path d={`M${landX - 110} ${ground + 82} L ${W} ${ground + 80}`} stroke={p.slab} strokeOpacity={0.55} strokeWidth={2.5} />
          {(shape === 'lowrise' || shape === 'stepped') && (
            <g>
              <Pine x={560} y={ground + 4} s={1.5} color={p.side} />
              <Pine x={1380} y={ground} s={1.9} color={p.side} />
              <Pine x={1500} y={ground + 6} s={1.4} color={p.side} />
            </g>
          )}
          {boxes.map((b, i) => (
            <Facade key={i} b={b} p={p} r={r} gid={gid} lit={lit} timber={shape === 'lowrise'} />
          ))}
          {shape === 'twin' && <rect x={930} y={ground - (ground - 190) * 0.5} width={80} height={26} fill={p.glassBottom} stroke={p.slab} strokeWidth={4} />}
        </g>
      )}

      {kind === 'view' && (
        <g>
          {/* terrace deck */}
          <path d={`M0 ${H * 0.78} L ${W} ${H * 0.74} L ${W} ${H} L 0 ${H} Z`} fill={p.land} />
          {Array.from({ length: 14 }).map((_, i) => (
            <path key={i} d={`M${i * 130 - 60} ${H} L ${W * 0.5 + (i - 7) * 46} ${H * 0.76}`} stroke={p.landTop} strokeOpacity={0.35} strokeWidth={2} />
          ))}
          {/* glass railing */}
          <rect x={0} y={H * 0.6} width={W} height={H * 0.17} fill={`url(#${gid}-rail)`} />
          <rect x={0} y={H * 0.6} width={W} height={6} fill={p.slab} opacity={0.85} />
          {Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={i * 266 + 40} y={H * 0.6} width={5} height={H * 0.16} fill={p.slab} opacity={0.6} />
          ))}
          {/* lounge chair silhouette */}
          <path d={`M1080 ${H * 0.92} L1180 ${H * 0.86} L1400 ${H * 0.87} L1420 ${H * 0.9} L1100 ${H * 0.94} Z`} fill={p.side} />
          <path d={`M1100 ${H * 0.94} L1096 ${H * 0.98} M1400 ${H * 0.9} L1404 ${H * 0.95}`} stroke={p.side} strokeWidth={6} />
        </g>
      )}

      {kind === 'pool' && (
        <g>
          <rect x={0} y={horizon + 30} width={W} height={H * 0.24} fill={`url(#${gid}-pool)`} opacity={0.92} />
          {Array.from({ length: 22 }).map((_, i) => (
            <rect key={i} x={r() * W} y={horizon + 40 + r() * H * 0.22} width={40 + r() * 120} height={2} fill="white" opacity={0.25} />
          ))}
          <rect x={0} y={horizon + 26} width={W} height={5} fill={p.slab} />
          <path d={`M0 ${horizon + 30 + H * 0.24} L ${W} ${horizon + 30 + H * 0.24} L ${W} ${H} L 0 ${H} Z`} fill={p.landTop} />
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x={0} y={horizon + 34 + H * 0.24 + i * 14} width={W} height={1.5} fill={p.land} opacity={0.4} />
          ))}
        </g>
      )}

      <rect width={W} height={H} fill={`url(#${gid}-vig)`} />
    </svg>
  )
}

export const ArchScene = memo(ArchSceneImpl)
