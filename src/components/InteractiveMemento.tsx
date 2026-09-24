import { useEffect, useRef, useState } from 'react'
import { CharmArt, preloadAllCharms } from './CharmArt'
import { CHARM_VISUALS } from '../data/charm_visuals'
import type { Charm } from '../data/charms'

/* ── Physics constants ──────────────────────────────────────────── */
const N    = 9      // rope points (= 8 segments)
const ROPE_DEFAULT = 135 // total rope length in px
const GRAV = 0.38   // gravity px / frame²
const DAMP = 0.985  // per-frame velocity damping
const ITER = 12     // constraint iterations per frame

/* ── Point type ─────────────────────────────────────────────────── */
type Pt = { x: number; y: number; px: number; py: number }

/* ── Props ──────────────────────────────────────────────────────── */
export interface InteractiveMementoProps {
  charm: Charm
  anchorRatioX?: number   // fraction of container width (e.g. 0.76 for hero, 0.65 for preview)
  ropeLength?: number     // total rope length in px
  sizeScale?: number      // scaling multiplier for charm display size (e.g. 0.8 - 1.3)
  className?: string
  style?: React.CSSProperties
}

/* ── Helpers ────────────────────────────────────────────────────── */

/** Create rope hanging vertically from (ax, ay). */
function makeRope(ax: number, ay: number, seg: number): Pt[] {
  return Array.from({ length: N }, (_, i) => {
    const y = ay + i * seg
    return { x: ax, y, px: ax, py: y }
  })
}

/** Smooth quadratic Bézier path through rope midpoints. */
function buildPath(pts: Pt[]): string {
  if (pts.length < 2) return ''
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = ((pts[i].x + pts[i + 1].x) / 2).toFixed(1)
    const my = ((pts[i].y + pts[i + 1].y) / 2).toFixed(1)
    d += ` Q${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)} ${mx},${my}`
  }
  const L = pts[pts.length - 1]
  d += ` L${L.x.toFixed(1)},${L.y.toFixed(1)}`
  return d
}

/* ── Drag state ─────────────────────────────────────────────────── */
interface DragState {
  active:      boolean
  startX:      number
  startY:      number
  targetX:     number
  targetY:     number
  pointerId:   number
  grabOffsetX: number
  grabOffsetY: number
}

/* ── Component ──────────────────────────────────────────────────── */

export function InteractiveMemento({
  charm,
  anchorRatioX = 0.76,
  ropeLength = ROPE_DEFAULT,
  sizeScale = 1,
  className = '',
  style = {},
}: InteractiveMementoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef      = useRef<SVGPathElement>(null)
  const pathDashRef  = useRef<SVGPathElement>(null)
  const anchorElRef  = useRef<SVGGElement>(null)
  const charmEl      = useRef<HTMLDivElement>(null)

  /* Physics refs — mutated directly, never via React state */
  const ptsRef    = useRef<Pt[]>([])
  const anchorRef = useRef({ x: 0, y: 0 })
  const rafRef    = useRef(0)
  const szRef     = useRef(80)
  const dragRef   = useRef<DragState | null>(null)
  const segRef    = useRef(ropeLength / (N - 1))
  const scaleRef  = useRef(sizeScale)

  /* React state — only for charm artwork swap */
  const dispRef  = useRef<Charm>(charm)
  const [disp, setDisp]   = useState<Charm>(charm)
  const [alpha, setAlpha] = useState(1)

  segRef.current   = ropeLength / (N - 1)
  scaleRef.current = sizeScale

  function getCharmWidth(charmId: string, containerW: number, scale: number): number {
    const v = CHARM_VISUALS[charmId]
    const base = v ? (containerW < 640 ? v.displayWidthSm : v.displayWidth) : 80
    return Math.round(base * scale)
  }

  /* ── Verlet physics step ──────────────────────────────────────── */
  function step() {
    const p = ptsRef.current
    const d = dragRef.current
    const dragging = d?.active ?? false
    const seg = segRef.current

    /* 1. Verlet integration */
    for (let i = 1; i < N; i++) {
      if (dragging && i === N - 1) continue
      const pt = p[i]
      const vx = (pt.x - pt.px) * DAMP
      const vy = (pt.y - pt.py) * DAMP
      pt.px = pt.x;  pt.py = pt.y
      pt.x += vx;    pt.y += vy + GRAV
    }

    /* 2. Pin dragged endpoint */
    if (dragging && d) {
      const L = p[N - 1]
      L.px = L.x;  L.py = L.y
      L.x  = d.targetX;  L.y = d.targetY
    }

    /* 3. Constraint iterations */
    for (let it = 0; it < ITER; it++) {
      p[0].x = anchorRef.current.x
      p[0].y = anchorRef.current.y

      for (let i = 0; i < N - 1; i++) {
        const a = p[i], b = p[i + 1]
        const dx = b.x - a.x, dy = b.y - a.y
        const dist = Math.hypot(dx, dy) || 0.001
        const k = (dist - seg) / dist

        const aPinned = i === 0
        const bPinned = dragging && i === N - 2

        if (!aPinned && !bPinned) {
          a.x += dx * k * 0.5;  a.y += dy * k * 0.5
          b.x -= dx * k * 0.5;  b.y -= dy * k * 0.5
        } else if (aPinned) {
          b.x -= dx * k;  b.y -= dy * k
        } else {
          a.x += dx * k;  a.y += dy * k
        }
      }

      if (dragging && d) {
        p[N - 1].x = d.targetX;  p[N - 1].y = d.targetY
      }
    }

    p[0].x = anchorRef.current.x
    p[0].y = anchorRef.current.y
  }

  /* ── Render rope + charm (DOM mutation) ───────────────────────── */
  function render() {
    const p = ptsRef.current
    if (p.length < N) return
    const L = p[N - 1], P = p[N - 2]
    const pathD = buildPath(p)

    pathRef.current?.setAttribute('d', pathD)
    pathDashRef.current?.setAttribute('d', pathD)

    const ax = anchorRef.current.x
    anchorElRef.current?.setAttribute('transform', `translate(${ax.toFixed(1)}, 0)`)

    const el = charmEl.current
    if (!el) return

    const sz = szRef.current
    const ang = Math.atan2(L.x - P.x, L.y - P.y) * (180 / Math.PI)
    const rot = Math.max(-42, Math.min(42, ang))

    el.style.left      = `${(L.x - sz / 2).toFixed(1)}px`
    el.style.top       = `${L.y.toFixed(1)}px`
    el.style.transform = `rotate(${rot.toFixed(2)}deg)`
  }

  /* ── Update charm div dimensions ────────────────────────────── */
  function applyCharmDims(charmId: string, containerW: number, scale: number) {
    const sz = getCharmWidth(charmId, containerW, scale)
    szRef.current = sz
    if (charmEl.current) {
      charmEl.current.style.width           = `${sz}px`
      charmEl.current.style.height          = 'auto'
      charmEl.current.style.transformOrigin = '50% 0px'
    }
  }

  /* ── Initialize (or reset) physics ────────────────────────────── */
  function init(charmId: string) {
    const container = containerRef.current
    const w = container ? container.clientWidth : window.innerWidth
    const ax = w * anchorRatioX
    anchorRef.current = { x: ax, y: 0 }
    applyCharmDims(charmId, w, sizeScale)
    ptsRef.current = makeRope(ax, 0, segRef.current)

    /* Pre-settle: 30 physics frames → zero velocity */
    for (let i = 0; i < 30; i++) step()
    for (const pt of ptsRef.current) { pt.px = pt.x; pt.py = pt.y }
  }

  /* ── Main mount effect ────────────────────────────────────────── */
  useEffect(() => {
    preloadAllCharms()
    init(charm.id)

    function loop() {
      step()
      render()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    function onResize() {
      const container = containerRef.current
      const w = container ? container.clientWidth : window.innerWidth
      const ax = w * anchorRatioX
      anchorRef.current = { x: ax, y: 0 }
      applyCharmDims(dispRef.current.id, w, scaleRef.current)
      ptsRef.current = makeRope(ax, 0, segRef.current)
      for (let i = 0; i < 30; i++) step()
      for (const pt of ptsRef.current) { pt.px = pt.x; pt.py = pt.y }
    }

    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorRatioX, ropeLength, sizeScale])

  /* ── Charm switching — fade out → swap artwork → fade in ────── */
  useEffect(() => {
    if (charm.id === dispRef.current.id) return
    setAlpha(0)
    const t = setTimeout(() => {
      dispRef.current = charm
      setDisp(charm)
      setAlpha(1)
      const container = containerRef.current
      const w = container ? container.clientWidth : window.innerWidth
      applyCharmDims(charm.id, w, sizeScale)
    }, 180)
    return () => clearTimeout(t)
  }, [charm, sizeScale])

  /* ── Pointer handlers ───────────────────────────────────────── */

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.stopPropagation()
    const p = ptsRef.current
    const rect = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top
    const L = p.length >= N ? p[N - 1] : { x: localX, y: localY }
    
    dragRef.current = {
      active: true,
      startX: localX,
      startY: localY,
      targetX: L.x,
      targetY: L.y,
      pointerId: e.pointerId,
      grabOffsetX: localX - L.x,
      grabOffsetY: localY - L.y,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.style.cursor = 'grabbing'
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragRef.current
    if (!d?.active) return

    const rect = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
    const localX = e.clientX - rect.left
    const localY = e.clientY - rect.top
    const sz = szRef.current
    const rawX = localX - d.grabOffsetX
    const rawY = localY - d.grabOffsetY

    d.targetX = Math.max(sz / 2, Math.min(rect.width - sz / 2, rawX))
    d.targetY = Math.max(0, Math.min(rect.height - sz / 2, rawY))
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    e.currentTarget.style.cursor = 'grab'
  }

  function onPointerCancel() {
    dragRef.current = null
    if (charmEl.current) charmEl.current.style.cursor = 'grab'
  }

  /** Single subtle lateral impulse on hover. */
  function onPointerEnter() {
    if (dragRef.current) return
    const p = ptsRef.current
    if (p.length < N) return
    for (let i = N - 3; i < N; i++) p[i].px += 1.8
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-20 ${className}`}
      style={{ overflow: 'hidden', ...style }}
    >
      {/* SVG for Rope & Top Anchor */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none', overflow: 'visible' }}
        aria-hidden="true"
      >
        <defs>
          {/* Top anchor metallic gradient */}
          <linearGradient id="memento-anchor-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {/* 1. TOP ANCHOR / MOUNTING BRACKET */}
        <g ref={anchorElRef}>
          <path
            d="M -12 0 L 12 0 L 9 8 L -9 8 Z"
            fill="url(#memento-anchor-grad)"
            stroke="#475569"
            strokeWidth="0.8"
          />
          <line x1="-11" y1="0.5" x2="11" y2="0.5" stroke="#64748B" strokeWidth="0.8" />
          <circle cx="-5.5" cy="3.5" r="1.1" fill="#64748B" />
          <circle cx="5.5" cy="3.5" r="1.1" fill="#64748B" />
          <path
            d="M -3 8 C -3 12.5, 3 12.5, 3 8"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>

        {/* 2. BRAIDED RED CORD / ROPE */}
        <path
          ref={pathRef}
          fill="none"
          stroke="#991B1B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          ref={pathDashRef}
          fill="none"
          stroke="#F87171"
          strokeWidth="1.4"
          strokeDasharray="3 3"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      </svg>

      {/* 3. CHARM CONTAINER */}
      <div
        ref={charmEl}
        className="absolute z-30"
        style={{
          pointerEvents: 'auto',
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          opacity: alpha,
          transition: 'opacity 180ms ease',
          willChange: 'transform',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerEnter={onPointerEnter}
        role="img"
        aria-label={`${disp.name} — drag to interact`}
      >
        <CharmArt
          id={disp.id}
          style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
        />
      </div>
    </div>
  )
}



