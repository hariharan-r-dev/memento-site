import { useEffect, useRef, useState } from 'react'
import { CharmArt, preloadAllCharms } from './CharmArt'
import { CHARM_VISUALS } from '../data/charm_visuals'
import type { Charm } from '../data/charms'

/* ── Physics constants ──────────────────────────────────────────── */
const N            = 12     // 12 points = 11 flexible rope segments
const ROPE_DEFAULT = 185    // Default rope length in px (Long configuration)
const GRAV         = 0.42   // gravity px / frame²
const DAMP         = 0.982  // velocity damping
const ITER         = 16     // constraint relaxation iterations per frame
const CONNECTOR_H  = -1.5   // -1.5px offset to sit 1.5px higher along the rope

/* ── Point type ─────────────────────────────────────────────────── */
type Pt = { x: number; y: number; px: number; py: number }

/* ── Props ──────────────────────────────────────────────────────── */
export interface InteractiveMementoProps {
  charm: Charm
  anchorRatioX?: number   // fraction of container width (e.g. 0.76 for hero, 0.65 for preview)
  ropeLength?: number     // total rope length in px
  sizeScale?: number      // scaling multiplier for charm display size (e.g. 0.8 - 1.5)
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
  lastMoveTime: number
  prevTargetX: number
  prevTargetY: number
}

/* ── Component ──────────────────────────────────────────────────── */

export function InteractiveMemento({
  charm,
  anchorRatioX = 0.76,
  ropeLength = ROPE_DEFAULT,
  sizeScale = 1.45,
  className = '',
  style = {},
}: InteractiveMementoProps) {
  const containerRef    = useRef<HTMLDivElement>(null)
  const pathShadowRef   = useRef<SVGPathElement>(null)
  const pathCoreRef     = useRef<SVGPathElement>(null)
  const pathBraidRef    = useRef<SVGPathElement>(null)
  const pathHighlightRef = useRef<SVGPathElement>(null)
  const anchorElRef     = useRef<SVGGElement>(null)
  const connectorElRef  = useRef<SVGGElement>(null)
  const charmEl         = useRef<HTMLDivElement>(null)

  /* Physics refs — mutated directly, never via React state */
  const ptsRef    = useRef<Pt[]>([])
  const anchorRef = useRef({ x: 0, y: 0 })
  const rafRef    = useRef(0)
  const szRef     = useRef(80)
  const dragRef   = useRef<DragState | null>(null)
  const segRef    = useRef(ropeLength / (N - 1))
  const scaleRef  = useRef(sizeScale)
  const restingFramesRef = useRef(0)

  /* React state — only for charm artwork swap */
  const dispRef  = useRef<Charm>(charm)
  const [disp, setDisp]   = useState<Charm>(charm)
  const [alpha, setAlpha] = useState(1)

  segRef.current   = ropeLength / (N - 1)
  scaleRef.current = sizeScale

  function getCharmVisual(charmId: string) {
    return CHARM_VISUALS[charmId] ?? CHARM_VISUALS['ferrari']
  }

  function getCharmWidth(charmId: string, containerW: number, scale: number): number {
    const v = getCharmVisual(charmId)
    const base = containerW < 640 ? v.displayWidthSm : v.displayWidth
    return Math.round(base * scale)
  }

  /* ── Verlet physics step ──────────────────────────────────────── */
  function step() {
    const p = ptsRef.current
    if (p.length < N) return

    const d = dragRef.current
    const dragging = d?.active ?? false
    const seg = segRef.current

    let totalKineticEnergy = 0

    /* 1. Verlet integration */
    for (let i = 1; i < N; i++) {
      if (dragging && i === N - 1) continue
      const pt = p[i]
      let vx = (pt.x - pt.px) * DAMP
      let vy = (pt.y - pt.py) * DAMP

      /* Zero-velocity threshold to ensure absolute stillness at rest */
      if (!dragging && Math.abs(vx) < 0.003 && Math.abs(vy) < 0.003) {
        vx = 0
        vy = 0
      }

      pt.px = pt.x
      pt.py = pt.y
      pt.x += vx
      pt.y += vy + GRAV

      totalKineticEnergy += Math.abs(vx) + Math.abs(vy)
    }

    /* 2. Track dragged endpoint */
    if (dragging && d) {
      const L = p[N - 1]
      L.px = d.prevTargetX
      L.py = d.prevTargetY
      L.x  = d.targetX
      L.y  = d.targetY
      restingFramesRef.current = 0
    } else {
      if (totalKineticEnergy < 0.008) {
        restingFramesRef.current++
        if (restingFramesRef.current > 45) {
          /* Equilibrium lock when completely settled */
          const ax = anchorRef.current.x
          const ay = anchorRef.current.y
          for (let i = 0; i < N; i++) {
            p[i].x = ax
            p[i].y = ay + i * seg
            p[i].px = ax
            p[i].py = ay + i * seg
          }
        }
      } else {
        restingFramesRef.current = 0
      }
    }

    /* 3. Constraint iterations (distance constraints between adjacent rope segments) */
    for (let it = 0; it < ITER; it++) {
      p[0].x = anchorRef.current.x
      p[0].y = anchorRef.current.y

      for (let i = 0; i < N - 1; i++) {
        const a = p[i], b = p[i + 1]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy) || 0.0001
        const k = (dist - seg) / dist

        const aPinned = i === 0
        const bPinned = dragging && i === N - 2

        if (!aPinned && !bPinned) {
          a.x += dx * k * 0.5
          a.y += dy * k * 0.5
          b.x -= dx * k * 0.5
          b.y -= dy * k * 0.5
        } else if (aPinned) {
          b.x -= dx * k
          b.y -= dy * k
        } else {
          a.x += dx * k
          a.y += dy * k
        }
      }

      if (dragging && d) {
        p[N - 1].x = d.targetX
        p[N - 1].y = d.targetY
      }
    }

    p[0].x = anchorRef.current.x
    p[0].y = anchorRef.current.y
  }

  /* ── Render rope, connector, and charm (direct DOM transform for 60fps) ── */
  function render() {
    const p = ptsRef.current
    if (p.length < N) return

    const L = p[N - 1]
    const P = p[N - 2]
    const pathD = buildPath(p)

    /* 1. Update SVG Rope Curves */
    pathShadowRef.current?.setAttribute('d', pathD)
    pathCoreRef.current?.setAttribute('d', pathD)
    pathBraidRef.current?.setAttribute('d', pathD)
    pathHighlightRef.current?.setAttribute('d', pathD)

    /* 2. Update Top Anchor Position */
    const ax = anchorRef.current.x
    anchorElRef.current?.setAttribute('transform', `translate(${ax.toFixed(1)}, 0)`)

    /* 3. Calculate Rope Endpoint Angle & Rotation */
    const angRad = Math.atan2(L.x - P.x, L.y - P.y)
    const angDeg = angRad * (180 / Math.PI)
    const rot = Math.max(-48, Math.min(48, angDeg))

    /* 4. Update Physical Connector (Ball / Collar / Loop) at Rope Endpoint (L.x, L.y) */
    connectorElRef.current?.setAttribute(
      'transform',
      `translate(${L.x.toFixed(1)}, ${L.y.toFixed(1)}) rotate(${rot.toFixed(2)})`
    )

    /* 5. Update Charm Position & Alignment with Exact Attachment Point */
    const el = charmEl.current
    if (!el) return

    const visual = getCharmVisual(dispRef.current.id)
    const attachX = visual.attachmentPoint.x // e.g. 0.5
    const attachY = visual.attachmentPoint.y // e.g. 0.0

    const sz = szRef.current

    /* Attachment Point World Position: exactly at connector bottom */
    const rad = (rot * Math.PI) / 180
    const cosR = Math.cos(rad)
    const sinR = Math.sin(rad)

    /* Offset from rope end to connector bottom */
    const mountX = L.x - sinR * CONNECTOR_H
    const mountY = L.y + cosR * CONNECTOR_H

    /* Position the charm div so its attachment point coincides with mountX, mountY */
    el.style.left = `${mountX.toFixed(1)}px`
    el.style.top  = `${mountY.toFixed(1)}px`
    el.style.transformOrigin = `${(attachX * 100).toFixed(1)}% ${(attachY * 100).toFixed(1)}%`
    el.style.transform = `translate(-${(attachX * 100).toFixed(1)}%, -${(attachY * 100).toFixed(1)}%) rotate(${rot.toFixed(2)}deg)`
  }

  /* ── Update charm div dimensions ────────────────────────────── */
  function applyCharmDims(charmId: string, containerW: number, scale: number) {
    const sz = getCharmWidth(charmId, containerW, scale)
    szRef.current = sz
    if (charmEl.current) {
      charmEl.current.style.width  = `${sz}px`
      charmEl.current.style.height = 'auto'
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

    /* Pre-settle into pure vertical rest state */
    for (let i = 0; i < 40; i++) step()
    for (const pt of ptsRef.current) { pt.px = pt.x; pt.py = pt.y }
    restingFramesRef.current = 50
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
      for (let i = 0; i < 40; i++) step()
      for (const pt of ptsRef.current) { pt.px = pt.x; pt.py = pt.y }
      restingFramesRef.current = 50
    }

    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorRatioX, ropeLength, sizeScale])

  /* ── Charm switching — fade out → swap artwork & attachment → fade in ── */
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
      prevTargetX: L.x,
      prevTargetY: L.y,
      pointerId: e.pointerId,
      grabOffsetX: localX - L.x,
      grabOffsetY: localY - L.y,
      lastMoveTime: performance.now(),
    }
    restingFramesRef.current = 0
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

    d.prevTargetX = d.targetX
    d.prevTargetY = d.targetY
    d.targetX = Math.max(sz / 3, Math.min(rect.width - sz / 3, rawX))
    d.targetY = Math.max(20, Math.min(rect.height - sz / 3, rawY))
    d.lastMoveTime = performance.now()
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const d = dragRef.current
    const p = ptsRef.current
    if (p.length >= N) {
      const L = p[N - 1]
      /* Preserve velocity vector on release for natural pendulum swing */
      const dt = Math.max(16, performance.now() - d.lastMoveTime)
      const throwFactor = Math.min(1.2, 24 / dt)
      L.px = L.x - (d.targetX - d.prevTargetX) * throwFactor
      L.py = L.y - (d.targetY - d.prevTargetY) * throwFactor
    }
    dragRef.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    e.currentTarget.style.cursor = 'grab'
  }

  function onPointerCancel() {
    dragRef.current = null
    if (charmEl.current) charmEl.current.style.cursor = 'grab'
  }

  /** Subtle lateral nudge on initial hover */
  function onPointerEnter() {
    if (dragRef.current) return
    const p = ptsRef.current
    if (p.length < N) return
    for (let i = N - 4; i < N; i++) {
      p[i].px += 2.0
    }
    restingFramesRef.current = 0
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none z-20 ${className}`}
      style={{ overflow: 'hidden', ...style }}
    >
      {/* SVG for Rope, Anchors, and Physical Connectors */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'none', overflow: 'visible' }}
        aria-hidden="true"
      >
        <defs>
          {/* Metallic Top Anchor Gradient */}
          <linearGradient id="memento-anchor-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="40%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Polished Gold Connector Bead Gradient */}
          <radialGradient id="memento-gold-bead" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </radialGradient>

          {/* Metallic Collar / Hardware Crimp Gradient */}
          <linearGradient id="memento-crimp-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="45%" stopColor="#FDE68A" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
        </defs>

        {/* 1. FIXED TOP ANCHOR MOUNT */}
        <g ref={anchorElRef}>
          {/* Base plate */}
          <path
            d="M -14 0 L 14 0 L 11 9 L -11 9 Z"
            fill="url(#memento-anchor-grad)"
            stroke="#64748B"
            strokeWidth="0.9"
          />
          {/* Accent rule & screws */}
          <line x1="-12" y1="0.8" x2="12" y2="0.8" stroke="#94A3B8" strokeWidth="0.8" />
          <circle cx="-6.5" cy="4.2" r="1.2" fill="#94A3B8" />
          <circle cx="6.5" cy="4.2" r="1.2" fill="#94A3B8" />
          {/* Top hanging eyelet loop */}
          <path
            d="M -3.5 9 C -3.5 14, 3.5 14, 3.5 9"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>

        {/* 2. THICK BRAIDED PHYSICAL ROPE (Multi-pass rendering for realistic texture) */}
        {/* Layer A: Dark core/ambient shadow */}
        <path
          ref={pathShadowRef}
          fill="none"
          stroke="#450A0A"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        {/* Layer B: Solid rich red rope body */}
        <path
          ref={pathCoreRef}
          fill="none"
          stroke="#991B1B"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        {/* Layer C: Braided woven stitch cord texture */}
        <path
          ref={pathBraidRef}
          fill="none"
          stroke="#F87171"
          strokeWidth="2.0"
          strokeDasharray="4 4"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        {/* Layer D: Subtle highlight sheen */}
        <path
          ref={pathHighlightRef}
          fill="none"
          stroke="#FECDD3"
          strokeWidth="1.0"
          strokeDasharray="2 6"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />

        {/* 3. DIRECT CONNECTION (No extra gold sphere between rope and charm mount) */}
        <g ref={connectorElRef} />
      </svg>

      {/* 4. INTERACTIVE CHARM CONTAINER */}
      <div
        ref={charmEl}
        className="absolute z-30"
        style={{
          position: 'absolute',
          pointerEvents: 'auto',
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          opacity: alpha,
          transition: 'opacity 180ms ease',
          willChange: 'transform, left, top',
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
