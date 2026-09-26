import { useState, useEffect, useRef, useCallback } from 'react'
import { InteractiveMemento } from '../components/InteractiveMemento'
import { CharmArt } from '../components/CharmArt'
import { CheckoutModal } from '../components/CheckoutModal'
import type { PlanId } from '../lib/razorpay'
import { trackPlanSelected } from '../lib/analytics'
import { collections } from '../data/collections'
import type { Charm } from '../data/charms'

/* ── Design tokens (mirrors the HTML :root) ───────────────────── */
const BG = '#070B14'
const BG2 = '#0D1422'
const SURFACE = '#111A2B'
const SKY = '#38BDF8'
const SKY_MID = '#0EA5E9'
const SKY_B = '#7DD3FC'
const TEXT2 = '#94A3B8'
const MUTED = '#64748B'
const BORDER = 'rgba(148,163,184,0.16)'
const F = "'Plus Jakarta Sans', system-ui, sans-serif"

/* ── useInView ────────────────────────────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect() } }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return { ref, inView: v }
}

/* ── Reveal ───────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(24px)',
        transition: `opacity .75s ${delay}ms ease, transform .75s ${delay}ms ease`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ── Eyebrow (with rule line, matches HTML .eyebrow) ─────────── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: SKY_B, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 18 }}>
      <span style={{ width: 22, height: 1, background: SKY_MID, display: 'block', flexShrink: 0 }} />
      {children}
    </div>
  )
}

/* ── FeelCard (matches HTML .card) ───────────────────────────── */
function FeelCard({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ color: MUTED, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em' }}>{label}</div>
      <h3 style={{ fontSize: 21, margin: 0, letterSpacing: '-0.01em', fontFamily: F }}>{title}</h3>
      <p style={{ color: TEXT2, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{body}</p>
    </div>
  )
}

/* ── CharmShowcase (Authentic hanging Memento showcase with real cord and charm art) ─── */
function CharmShowcase({ charmId, size = 120, ropeH = 130 }: { charmId: string; size?: number; ropeH?: number }) {
  return (
    <div style={{ position: 'relative', height: ropeH + size + 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 20 }}>
      {/* Top anchor mount */}
      <div style={{
        position: 'absolute', top: 11, width: 24, height: 9,
        background: 'linear-gradient(180deg, #475569, #0F172A)',
        border: '1px solid #64748B', borderRadius: '3px 3px 0 0',
      }} />
      {/* Braided red cord */}
      <div style={{
        width: 3.5, height: ropeH,
        background: '#991B1B',
        borderLeft: '1.2px dashed #F87171',
        margin: '0 auto',
      }} />
      {/* Physical connector gold bead */}
      <div style={{
        position: 'absolute', top: 20 + ropeH - 4, width: 10, height: 10, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #FEF08A, #F59E0B 40%, #92400E 100%)',
        border: '0.8px solid #78350F',
      }} />
      {/* Real charm artwork */}
      <div style={{ position: 'absolute', top: 20 + ropeH + 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CharmArt
          id={charmId}
          style={{ width: size, height: 'auto' }}
        />
      </div>
    </div>
  )
}

/* ── PricingCard ──────────────────────────────────────────────── */
type PCProps = {
  badge?: string
  name: string
  subtitle?: string
  amount: string
  unit: string
  features: string[]
  cta: string
  primary?: boolean
  highlighted?: boolean
  disabled?: boolean
  onSelect?: () => void
}
function PricingCard({ badge, name, subtitle, amount, unit, features, cta, primary, highlighted, disabled, onSelect }: PCProps) {
  return (
    <div
      style={{
        background: highlighted ? 'rgba(17,26,43,0.95)' : SURFACE,
        border: highlighted ? `1.5px solid ${SKY}` : `1px solid ${BORDER}`,
        borderRadius: 20,
        padding: '36px 30px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        boxSizing: 'border-box',
        transform: highlighted ? 'translateY(-4px)' : 'none',
        transition: 'transform .2s ease, border-color .2s ease',
      }}
    >
      {/* Badge container with consistent minHeight so titles & prices align */}
      <div style={{ minHeight: 28, marginBottom: 12, display: 'flex', alignItems: 'center' }}>
        {badge && (
          <span
            style={{
              display: 'inline-block',
              color: SKY_B,
              background: 'rgba(56,189,248,0.12)',
              border: '1px solid rgba(56,189,248,0.3)',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div style={{ fontWeight: 700, fontSize: 20, color: '#F8FAFC', marginBottom: 4 }}>
        {name}
      </div>

      {subtitle && (
        <div style={{ color: TEXT2, fontSize: 13.5, marginBottom: 18, minHeight: 20 }}>
          {subtitle}
        </div>
      )}

      {/* Price */}
      <div style={{ margin: '6px 0 4px' }}>
        <span style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', color: '#F8FAFC', fontFamily: F }}>
          {amount}
        </span>
      </div>

      <div style={{ color: MUTED, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 26 }}>
        {unit}
      </div>

      {/* Feature list */}
      <ul style={{ listStyle: 'none', margin: '0 0 32px', padding: 0, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {features.map((f, i) => (
          <li key={i} style={{ color: TEXT2, fontSize: 14, lineHeight: 1.5, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: SKY, fontWeight: 700, flexShrink: 0 }}>✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button pinned to bottom */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={disabled ? undefined : onSelect}
          disabled={disabled}
          style={{
            width: '100%',
            fontFamily: F,
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 12,
            padding: '15px 24px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all .18s ease',
            ...(disabled
              ? {
                  background: 'rgba(255,255,255,0.03)',
                  color: MUTED,
                  border: `1px solid ${BORDER}`,
                }
              : primary
              ? {
                  background: `linear-gradient(180deg, ${SKY_B}, ${SKY_MID})`,
                  color: '#04121C',
                  border: 'none',
                }
              : {
                  background: 'rgba(255,255,255,0.04)',
                  color: '#F8FAFC',
                  border: `1px solid ${BORDER}`,
                }),
          }}
        >
          {cta}
        </button>
      </div>
    </div>
  )
}

/* ── Collection charm grid card ───────────────────────────────── */
function CollectionCard({ charm, selected, onSelect }: { charm: Charm; selected: boolean; onSelect: (c: Charm) => void }) {
  return (
    <button
      onClick={() => onSelect(charm)}
      style={{
        background: selected ? `rgba(56,189,248,0.07)` : SURFACE,
        border: `1px solid ${selected ? SKY_MID : BORDER}`,
        borderRadius: 16, padding: '30px 16px', textAlign: 'center',
        cursor: 'pointer', transition: '.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
        transform: selected ? 'translateY(-3px)' : 'none',
        fontFamily: F,
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = SKY_MID; e.currentTarget.style.transform = 'translateY(-3px)' } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = 'none' } }}
    >
      <div style={{ width: 60, height: 60, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CharmArt id={charm.id} style={{ width: '100%', height: 'auto' }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#F8FAFC' }}>{charm.name}</div>
      <div style={{ color: MUTED, fontSize: 11.5, letterSpacing: '0.04em', marginTop: 2 }}>{charm.category}</div>
    </button>
  )
}

/* ── Coming-soon placeholder card ─────────────────────────────── */
function ComingSoonCard({ name }: { name: string }) {
  return (
    <div style={{
      background: `rgba(56,189,248,0.03)`, border: `1px dashed ${BORDER}`,
      borderRadius: 16, padding: '30px 16px', textAlign: 'center', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(56,189,248,0.06)', marginBottom: 10 }} />
      <div style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>{name}</div>
      <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.04em' }}>Coming soon</div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  /* ── Charms data setup ─────────────────────────────────────────── */
  const allCharms = collections.flatMap(c => c.charms)
  const ferrariCharm = allCharms.find(c => c.id === 'ferrari') ?? allCharms[0]
  const ferrariCollId = collections.find(c => c.charms.some(ch => ch.id === 'ferrari'))?.id
    ?? collections.find(c => !c.comingSoon && c.charms.length > 0)?.id
    ?? collections[0].id

  const pastryCharm = allCharms.find(c => c.id === 'pistachio-chocolate-donut' || c.id === 'chocolate-pistachio-pastry') ?? allCharms[0]

  /* Hero charm set to Pastry Bun */
  const [heroCharm] = useState<Charm>(pastryCharm)
  /* Desktop preview section has its own independent charm & physics state */
  const [demoCharm, setDemoCharm] = useState<Charm>(ferrariCharm)
  const [demoRopeLen, setDemoRopeLen] = useState<number>(135)
  const [demoCharmScale, setDemoCharmScale] = useState<number>(1)
  const [activeColl, setActiveColl] = useState(ferrariCollId)
  const [checkoutPlan, setCheckoutPlan] = useState<PlanId | null>(null)

  const collRef = useRef<HTMLElement>(null)
  const pricingRef = useRef<HTMLElement>(null)
  const customRef = useRef<HTMLElement>(null)

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const handleCharmSelect = useCallback((charm: Charm) => {
    setDemoCharm(charm)
  }, [])

  const handleCollSelect = (id: string) => {
    setActiveColl(id)
    const coll = collections.find(c => c.id === id)
    if (coll && !coll.comingSoon && coll.charms.length > 0) setDemoCharm(coll.charms[0])
  }

  const currentColl = collections.find(c => c.id === activeColl) ?? collections[0]

  const sec = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    maxWidth: 1240, margin: '0 auto', padding: '120px clamp(20px,5vw,64px)', ...extra,
  })

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          HERO — Hero charm is scoped strictly inside this section
          ════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          background: '#070B14',
          overflow: 'hidden',
          minHeight: 'calc(100vh - 73px)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Right-Side Atmospheric Blue Artwork Backdrop */}
        <div
          aria-hidden="true"
          className="hero-artwork-layer"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '52%',
            pointerEvents: 'none',
            zIndex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Blue ring artwork */}
          <img
            src="/assets/hero-rings.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 40%',
              display: 'block',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.65) 35%, black 60%, black 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 15%, rgba(0,0,0,0.65) 35%, black 60%, black 100%)',
            }}
          />

          {/* Left blend overlay to guarantee zero hard edges into hero background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, #070B14 0%, rgba(7,11,20,0.85) 12%, rgba(7,11,20,0.3) 30%, transparent 55%)',
            }}
          />

          {/* Bottom fade into #070B14 */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 220,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(7,11,20,0.4) 40%, rgba(7,11,20,0.85) 75%, #070B14 100%)',
            }}
          />
        </div>

        {/* Subtle radial ambient blue glow for lighting harmony */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '20%',
            right: '8%',
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.14) 0%, rgba(56,189,248,0.03) 50%, transparent 75%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Global Bottom Transition into Next Section (#070B14) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -1,
            height: 180,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(7, 11, 20, 0.4) 40%, #070B14 100%)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Scoped Hero Hanging Charm — draggable with real physics (Long rope, 1.45x visual size) */}
        <InteractiveMemento
          charm={heroCharm}
          anchorRatioX={0.76}
          ropeLength={190}
          sizeScale={1.45}
          className="z-20"
        />

        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'grid',
            gridTemplateColumns: '1fr',
            alignItems: 'center',
            padding: '60px clamp(20px,5vw,64px) 80px',
            gap: 40,
            maxWidth: 1440,
            width: '100%',
            margin: '0 auto',
            pointerEvents: 'none',
          }}
          className="hero-grid"
        >
          {/* Left: copy (pointerEvents: 'auto' so buttons & links are interactive) */}
          <div style={{ pointerEvents: 'auto' }}>
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: SKY_B, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 22 }}>
              <span style={{ width: 22, height: 1, background: SKY_MID, display: 'block' }} />
              A desktop companion
            </div>

            <h1 style={{ fontSize: 'clamp(40px,6vw,72px)', lineHeight: 0.98, letterSpacing: '-0.03em', fontWeight: 700, margin: '0 0 22px', fontFamily: F, color: '#F8FAFC' }}>
              <span style={{ display: 'block' }}>Little things</span>
              <span style={{ display: 'block' }}>worth keeping.</span>
            </h1>

            <p style={{ color: TEXT2, fontSize: 18, lineHeight: 1.55, maxWidth: 440, margin: '0 0 34px', fontWeight: 400 }}>
              Collect charming companions and let them live on your desktop.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 26 }}>
              <button
                onClick={() => scrollTo(collRef)}
                style={{
                  background: `linear-gradient(180deg,${SKY_B},${SKY_MID})`,
                  color: '#04121C', border: 'none', borderRadius: 12, padding: '15px 26px',
                  fontFamily: F, fontWeight: 700, fontSize: 15, cursor: 'pointer',
                }}
              >
                Explore Mementos
              </button>
              <button
                onClick={() => scrollTo(pricingRef)}
                style={{
                  background: 'rgba(7, 11, 20, 0.40)', backdropFilter: 'blur(8px)', color: '#F8FAFC', border: `1px solid ${BORDER}`,
                  borderRadius: 12, padding: '15px 26px', fontFamily: F, fontWeight: 600, fontSize: 15, cursor: 'pointer',
                }}
              >
                Get Memento
              </button>
            </div>

            <div style={{ color: MUTED, fontSize: 13.5 }}>Windows available · macOS launching soon · One-time purchase</div>
          </div>

          {/* Right spacer for 2-col hero grid on desktop */}
          <div className="hero-stage-spacer" aria-hidden="true" />
        </div>
      </section>

      {/* Hero grid responsive CSS */}
      <style>{`
        @media(min-width:960px){
          .hero-grid{ grid-template-columns:1.05fr 1fr !important; padding-top:0 !important; }
          .hero-stage-spacer{ display:block; height:620px; }
        }
        @media(max-width:959px){
          .hero-stage-spacer{ display:none; }
          .hero-artwork-layer{ width: 65% !important; opacity: 0.65 !important; }
        }
        @media(max-width:640px){
          .hero-artwork-layer{ width: 85% !important; opacity: 0.4 !important; }
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════
          INTRO — "A little presence on your desktop."
          ════════════════════════════════════════════════════════ */}
      {/* <section id="how-it-works" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={{ ...sec(), display: 'grid', gridTemplateColumns: '1fr', gap: 56, alignItems: 'center' }}
          className="intro-grid">
          <Reveal>
            <Eyebrow>Not just pixels</Eyebrow>
            <h2 style={{ fontSize: 'clamp(32px,4.4vw,52px)', lineHeight: 1.04, letterSpacing: '-0.025em', fontWeight: 700, margin: '0 0 20px', fontFamily: F }}>
              A little presence<br />on your desktop.
            </h2>
            <p style={{ color: TEXT2, fontSize: 17, lineHeight: 1.6, maxWidth: 460 }}>
              Memento brings small, physical-feeling objects into your digital space. They hang. They move. They react. They stay with you.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <CharmShowcase charmId="venkateswara" size={130} ropeH={130} />
          </Reveal>
        </div>
        <style>{`@media(min-width:900px){.intro-grid{grid-template-columns:1fr 0.9fr!important;}}`}</style>
      </section> */}

      {/* ════════════════════════════════════════════════════════
          FEELS REAL — 3 feature cards
          ════════════════════════════════════════════════════════ */}
      <section>
        <div style={sec()}>
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 30, marginBottom: 64 }}>
              <div>
                <Eyebrow>Not just pixels. A little presence.</Eyebrow>
                <h2 style={{ fontSize: 'clamp(32px,4.4vw,52px)', lineHeight: 1.04, letterSpacing: '-0.025em', fontWeight: 700, margin: 0, fontFamily: F }}>
                  Designed to<br /><span style={{ color: TEXT2, fontWeight: 700 }}>feel real.</span>
                </h2>
              </div>
              <p style={{ color: TEXT2, fontSize: 17, lineHeight: 1.6, maxWidth: 460, alignSelf: 'flex-end' }}>
                That familiar weight. That gentle sway. The little details that make a digital object feel wonderfully physical.
              </p>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 22 }}>
            <Reveal delay={0}>
              <FeelCard label="Natural physics" title="It actually hangs." body="Real rope physics, momentum and movement make every Memento feel like something hanging from your screen." />
            </Reveal>
            <Reveal delay={80}>
              <FeelCard label="Made for your desktop" title="A little less ordinary." body="Your desktop is where you spend your time. Give it something worth keeping." />
            </Reveal>
            <Reveal delay={160}>
              <FeelCard label="Always something to collect" title="Build your collection." body="Start with one Memento. Discover another. Keep the ones that mean something to you." />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          DESKTOP VIEW INTERACTIVE PREVIEW
          "GO ON. GIVE IT A LITTLE NUDGE."
          ════════════════════════════════════════════════════════ */}
      <section style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={sec()}>
          <Reveal>
            <Eyebrow>Go on. Give it a little nudge.</Eyebrow>
            <h2 style={{ fontSize: 'clamp(32px,4.4vw,52px)', lineHeight: 1.04, letterSpacing: '-0.025em', fontWeight: 700, margin: '0 0 16px', fontFamily: F }}>See how it moves.</h2>
            <p style={{ color: TEXT2, fontSize: 17, lineHeight: 1.6, maxWidth: 520, margin: 0 }}>
              Grab a Memento in this desktop simulator. Swing it, fling it, and watch the real Verlet physics settle naturally.
            </p>
          </Reveal>

          {/* Realistic Mac Desktop Simulation Window */}
          <div
            style={{
              marginTop: 44,
              background: '#0B111E',
              border: `1px solid ${BORDER}`,
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            {/* Window Outer Titlebar: Memento */}
            <div
              style={{
                height: 38,
                background: '#0D1322',
                borderBottom: `1px solid ${BORDER}`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                userSelect: 'none',
              }}
            >
              {/* Window Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginRight: 16 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', opacity: 0.85 }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', opacity: 0.85 }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', opacity: 0.85 }} />
              </div>

              {/* Title: Memento ONLY */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.02em', fontFamily: F }}>
                Memento
              </div>
            </div>

            {/* macOS Desktop Simulation Area */}
            <div
              style={{
                position: 'relative',
                height: 480,
                backgroundImage: `url('/assets/wallpaper.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 42%',
                overflow: 'hidden',
              }}
            >
              {/* Subtle Dark Overlay to preserve Memento's dark aesthetic and charm contrast */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(7, 12, 22, 0.35) 0%, rgba(7, 12, 22, 0.15) 45%, rgba(7, 12, 22, 0.40) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* macOS Top Menu Bar */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 20,
                  height: 28,
                  background: 'rgba(10, 15, 26, 0.65)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 14px',
                  fontSize: 12,
                  color: 'rgba(255, 255, 255, 0.88)',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Inter, sans-serif',
                }}
              >
                {/* Left Side: Apple Logo + Standard Menu Items */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  {/* Apple Icon */}
                  <svg width="12" height="14" viewBox="0 0 170 170" fill="currentColor" style={{ opacity: 0.9 }}>
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.77-11.72-14.19-6.19-9.69-10.9-20.73-14.13-33.12-3.23-12.39-4.85-24.16-4.85-35.31 0-14.28 3.51-26.06 10.53-35.35 7.02-9.29 16.03-14.07 27.03-14.34 4.58 0 9.87 1.25 15.87 3.75 6 2.5 10.15 3.82 12.45 3.96 1.8.14 6.23-1.29 13.3-4.29 7.07-3 13.06-4.32 17.98-3.96 13.62 1.07 23.95 6.31 30.98 15.72-12.02 7.29-17.9 17.3-17.65 30.03.26 10.01 4.13 18.35 11.61 25.02 7.48 6.67 16.32 10.42 26.52 11.25-2.22 6.81-4.91 13.69-8.08 20.63zM119.22 33.64c0-7.39 2.65-14.43 7.95-21.11 5.3-6.68 11.89-11.13 19.77-13.35.98 7.39-1.28 14.54-6.79 21.45-5.51 6.91-12.22 11.37-20.13 13.38-.27-.12-.8-.37-.8-.37z" />
                  </svg>
                  <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Finder</span>
                  <span style={{ opacity: 0.88 }}>File</span>
                  <span style={{ opacity: 0.88 }}>Edit</span>
                  <span style={{ opacity: 0.88 }}>View</span>
                  <span style={{ opacity: 0.88 }}>Go</span>
                  <span style={{ opacity: 0.88 }}>Window</span>
                  <span style={{ opacity: 0.88 }}>Help</span>
                </div>

                {/* Right Side: Battery + Wi-Fi + Date & Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Battery */}
                  <svg width="18" height="10" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ opacity: 0.85 }}>
                    <rect x="1" y="1" width="19" height="10" rx="3" />
                    <path d="M22 4v4" strokeLinecap="round" strokeWidth="2" />
                    <rect x="3" y="3" width="13" height="6" rx="1.5" fill="currentColor" />
                  </svg>
                  {/* Wi-Fi */}
                  <svg width="13" height="10" viewBox="0 0 16 12" fill="currentColor" style={{ opacity: 0.85 }}>
                    <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4.24-2.83a6 6 0 0 1 8.48 0 .8.8 0 1 1-1.13 1.13 4.4 4.4 0 0 0-6.22 0 .8.8 0 1 1-1.13-1.13zm-2.83-2.83a10 10 0 0 1 14.14 0 .8.8 0 0 1-1.13 1.13 8.4 8.4 0 0 0-11.88 0 .8.8 0 0 1-1.13-1.13z" />
                  </svg>
                  {/* Time */}
                  <span style={{ fontWeight: 500, letterSpacing: '-0.01em', opacity: 0.9 }}>Mon 9:41 AM</span>
                </div>
              </div>

              {/* Hanging Memento Canvas — starts directly BELOW the 28px macOS menu bar */}
              <div style={{ position: 'absolute', top: 28, left: 0, right: 0, bottom: 0 }}>
                <InteractiveMemento
                  charm={demoCharm}
                  anchorRatioX={0.65}
                  ropeLength={demoRopeLen}
                  sizeScale={demoCharmScale}
                />
              </div>

              {/* macOS Floating Dock */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 15,
                  pointerEvents: 'none',
                  userSelect: 'none',
                  background: 'rgba(15, 23, 42, 0.52)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 18,
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {/* 1. Finder */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="4" />
                      <circle cx="8.5" cy="9.5" r="1.5" fill="#FFFFFF" />
                      <circle cx="15.5" cy="9.5" r="1.5" fill="#FFFFFF" />
                      <path d="M8 15s1.5 2 4 2 4-2 4-2" />
                    </svg>
                  </div>
                  <span style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }} />
                </div>

                {/* 2. Safari */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#EF4444" stroke="#EF4444" />
                    </svg>
                  </div>
                  <span style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }} />
                </div>

                {/* 3. Messages */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                  </div>
                  <span style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'rgba(255,255,255,0.75)' }} />
                </div>

                {/* 4. Mail */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <span style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'transparent' }} />
                </div>

                {/* 5. Music */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: 'linear-gradient(135deg, #F87171 0%, #E11D48 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                  <span style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'transparent' }} />
                </div>

                {/* 6. Photos */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24">
                      <circle cx="12" cy="7" r="3.5" fill="#F59E0B" opacity="0.9" />
                      <circle cx="17" cy="12" r="3.5" fill="#EF4444" opacity="0.9" />
                      <circle cx="12" cy="17" r="3.5" fill="#8B5CF6" opacity="0.9" />
                      <circle cx="7" cy="12" r="3.5" fill="#10B981" opacity="0.9" />
                    </svg>
                  </div>
                  <span style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'transparent' }} />
                </div>

                {/* 7. Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: 'linear-gradient(135deg, #94A3B8 0%, #475569 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </div>
                  <span style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'transparent' }} />
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.18)', margin: '0 2px' }} />

                {/* 8. Trash */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: 'rgba(255,255,255,0.12)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </div>
                  <span style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: 'transparent' }} />
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar: Rope Length + Charm Size ONLY */}
            <div
              style={{
                background: '#0B111E',
                borderTop: `1px solid ${BORDER}`,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 20,
              }}
            >
              {/* Rope Length */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>
                  Rope length
                </span>
                <div style={{ display: 'flex', background: 'rgba(17,26,43,0.9)', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 3, gap: 4 }}>
                  {[
                    { label: 'Compact', len: 100 },
                    { label: 'Standard', len: 135 },
                    { label: 'Long', len: 175 },
                  ].map(opt => (
                    <button
                      key={opt.len}
                      onClick={() => setDemoRopeLen(opt.len)}
                      style={{
                        background: demoRopeLen === opt.len ? SKY_MID : 'transparent',
                        color: demoRopeLen === opt.len ? '#04121C' : TEXT2,
                        border: 'none',
                        borderRadius: 6,
                        padding: '5px 12px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: F,
                        transition: 'all .15s ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Charm Size */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>
                  Charm size
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => setDemoCharmScale(s => Math.max(0.75, Number((s - 0.1).toFixed(2))))}
                    style={{
                      background: 'rgba(17,26,43,0.9)',
                      border: `1px solid ${BORDER}`,
                      color: TEXT2,
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                    aria-label="Decrease size"
                  >
                    −
                  </button>
                  <input
                    type="range"
                    min="0.75"
                    max="1.35"
                    step="0.05"
                    value={demoCharmScale}
                    onChange={e => setDemoCharmScale(parseFloat(e.target.value))}
                    style={{
                      width: 120,
                      accentColor: SKY_MID,
                      cursor: 'pointer',
                    }}
                    aria-label="Charm size slider"
                  />
                  <button
                    onClick={() => setDemoCharmScale(s => Math.min(1.35, Number((s + 0.1).toFixed(2))))}
                    style={{
                      background: 'rgba(17,26,43,0.9)',
                      border: `1px solid ${BORDER}`,
                      color: TEXT2,
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                    aria-label="Increase size"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Charm Collection Selector — OUTSIDE and BELOW Desktop Preview */}
          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', color: MUTED, marginBottom: 16 }}>
              All Mementos
            </div>
            <div
              style={{
                display: 'flex',
                gap: 16,
                overflowX: 'auto',
                paddingBottom: 10,
                scrollbarWidth: 'none',
              }}
            >
              {allCharms.map(c => {
                const isSelected = demoCharm.id === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => handleCharmSelect(c)}
                    aria-label={c.name}
                    title={c.name}
                    style={{
                      width: 100,
                      height: 100,
                      background: isSelected ? 'rgba(56,189,248,0.08)' : SURFACE,
                      border: `${isSelected ? '1.5px' : '1px'} solid ${isSelected ? SKY_MID : BORDER}`,
                      borderRadius: 18,
                      padding: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'border-color .18s ease, background-color .18s ease',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CharmArt
                        id={c.id}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          COLLECTION — tabs + charm grid (Temporarily commented out)
          ════════════════════════════════════════════════════════ */}
      {/* <section id="collections" ref={collRef} style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={sec()}>
          <Reveal>
            <Eyebrow>The collection</Eyebrow>
            <h2 style={{ fontSize: 'clamp(32px,4.4vw,52px)', lineHeight: 1.04, letterSpacing: '-0.025em', fontWeight: 700, margin: '0 0 20px', fontFamily: F }}>
              Something for<br />every kind of you.
            </h2>
            <p style={{ color: TEXT2, fontSize: 17, lineHeight: 1.6, maxWidth: 460 }}>
              Some are lucky. Some are nostalgic. Some are just too good to leave behind.
            </p>
          </Reveal>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '34px 0 40px' }}>
            {collections.map(coll => (
              <button
                key={coll.id}
                onClick={() => handleCollSelect(coll.id)}
                style={{
                  background: activeColl === coll.id ? SKY : 'transparent',
                  border: `1px solid ${activeColl === coll.id ? SKY : BORDER}`,
                  color: activeColl === coll.id ? '#04121C' : TEXT2,
                  borderRadius: 999, padding: '10px 20px',
                  fontFamily: F, fontWeight: 600, fontSize: 13.5, cursor: 'pointer', transition: '.2s',
                }}
              >
                {coll.name}
                {coll.comingSoon && <span style={{ marginLeft: 6, opacity: 0.55, fontSize: 11 }}>· Soon</span>}
              </button>
            ))}
          </div>

          <div key={activeColl} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))',
            gap: 16,
            animation: 'fade-up 0.4s ease forwards',
          }}>
            {currentColl.comingSoon ? (
              <div style={{ gridColumn: '1/-1' }}>
                <div style={{
                  background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18,
                  padding: '48px 32px', textAlign: 'center', color: TEXT2,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Coming soon</p>
                  <p style={{ fontSize: 14, color: MUTED }}>The {currentColl.name} collection is on its way.</p>
                </div>
              </div>
            ) : (
              currentColl.charms.map(charm => (
                <CollectionCard
                  key={charm.id}
                  charm={charm}
                  selected={demoCharm.id === charm.id}
                  onSelect={handleCharmSelect}
                />
              ))
            )}
          </div>

          {!currentColl.comingSoon && (
            <Reveal>
              <p style={{ marginTop: 32, color: MUTED, fontSize: 13.5, lineHeight: 1.6 }}>
                {currentColl.description}
              </p>
            </Reveal>
          )}
        </div>
      </section> */}

      {/* ════════════════════════════════════════════════════════
          CUSTOMIZE
          ════════════════════════════════════════════════════════ */}
      <section id="customize" ref={customRef} style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={sec()}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 56, alignItems: 'center' }}
            className="customize-grid">
            <Reveal>
              <Eyebrow>Custom Memento</Eyebrow>
              <h2 style={{ fontSize: 'clamp(32px,4.4vw,52px)', lineHeight: 1.04, letterSpacing: '-0.025em', fontWeight: 700, margin: '0 0 20px', fontFamily: F }}>
                Make one<br />that's yours.
              </h2>
              <p style={{ color: TEXT2, fontSize: 17, lineHeight: 1.6, maxWidth: 460, marginBottom: 32 }}>
                Your car. Your bike. Your pet. Your favorite thing.
                Turn something meaningful into a Memento that lives on your desktop.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <button
                  disabled
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color: MUTED,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    padding: '15px 26px',
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'not-allowed',
                    opacity: 0.7,
                  }}
                >
                  Customisation — Coming Soon
                </button>
                <span style={{ color: MUTED, fontSize: 13.5 }}>Coming soon in Complete plan</span>
              </div>
            </Reveal>

            {/* Steps */}
            <Reveal delay={100}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { n: '01', title: 'Choose', body: 'Pick something meaningful — a car, a person, a pet, a symbol, anything worth keeping.' },
                  { n: '02', title: 'Customize', body: 'Our team turns your idea into a Memento with custom colors, details, and character.' },
                  { n: '03', title: 'Hang', body: 'Your custom Memento arrives ready to hang. Keep it close on your desktop.' },
                ].map((step, i) => (
                  <div key={step.n}>
                    <div style={{ display: 'flex', gap: 20, padding: '28px 0' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `rgba(56,189,248,0.1)`, color: SKY_B,
                        fontSize: 12, fontWeight: 700, border: `1px solid rgba(56,189,248,0.2)`,
                      }}>{step.n}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#F8FAFC' }}>{step.title}</div>
                        <div style={{ color: TEXT2, fontSize: 14, lineHeight: 1.6 }}>{step.body}</div>
                      </div>
                    </div>
                    {i < 2 && <div style={{ height: 1, background: BORDER }} />}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <style>{`@media(min-width:900px){.customize-grid{grid-template-columns:1fr 0.9fr!important;}}`}</style>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PRICING — matches HTML .price-row
          ════════════════════════════════════════════════════════ */}
      <section id="pricing" ref={pricingRef} style={{ borderTop: `1px solid ${BORDER}` }}>
        <div style={sec()}>
          <Reveal>
            <Eyebrow>Pricing</Eyebrow>
            <h2 style={{ fontSize: 'clamp(32px,4.4vw,52px)', lineHeight: 1.04, letterSpacing: '-0.025em', fontWeight: 700, margin: '0 0 20px', fontFamily: F }}>
              Choose your starting point.
            </h2>
            <p style={{ color: TEXT2, fontSize: 17, lineHeight: 1.6, maxWidth: 520 }}>
              Collect a couple, make one yours, or get the complete collection.
            </p>
          </Reveal>

          <div
            className="pricing-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
              marginTop: 44,
              alignItems: 'stretch',
            }}
          >
            <Reveal delay={0} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <PricingCard
                name="Memento Duo"
                subtitle="Start your collection."
                amount="₹349"
                unit="One-time purchase"
                features={[
                  'Choose any 2 Mementos',
                  'Desktop companion with physics',
                  'Windows available · macOS launching soon',
                  'Future standard updates',
                ]}
                cta="Get Memento Duo"
                onSelect={() => {
                  trackPlanSelected('memento_duo')
                  setCheckoutPlan('memento_duo')
                }}
              />
            </Reveal>
            <Reveal delay={80} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <PricingCard
                badge="Popular"
                name="Memento Four"
                subtitle="Our most popular companion pack."
                amount="₹649"
                unit="One-time purchase"
                features={[
                  'Choose any 4 Mementos',
                  'Desktop companion with physics',
                  'Windows available · macOS launching soon',
                  'Future standard updates',
                ]}
                cta="Get Memento Four"
                primary
                highlighted
                onSelect={() => {
                  trackPlanSelected('memento_four')
                  setCheckoutPlan('memento_four')
                }}
              />
            </Reveal>
            <Reveal delay={160} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <PricingCard
                badge="Coming Soon"
                name="Memento Complete"
                subtitle="The complete collection."
                amount="₹949"
                unit="One-time purchase"
                features={[
                  'Access all Mementos / collections',
                  'Choose 4 Mementos',
                  '1 Surprise Charm',
                  'Desktop companion with physics',
                  'Windows available · macOS launching soon',
                  'Future standard updates',
                  'Customisation — Coming Soon',
                ]}
                cta="Coming Soon"
                disabled
              />
            </Reveal>
          </div>

          {/* Pricing Bottom Microcopy */}
          <Reveal delay={200}>
            <div
              style={{
                textAlign: 'center',
                marginTop: 52,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
                One purchase. No recurring subscription.
              </div>
              <div style={{ color: TEXT2, fontSize: 14.5 }}>
                Windows available · macOS launching soon.
              </div>
              <div style={{ color: MUTED, fontSize: 13.5, marginTop: 4 }}>
                Choose your Mementos. Make them yours. Keep them on your desktop.
              </div>
            </div>
          </Reveal>

          <style>{`@media(min-width:960px){.pricing-grid{grid-template-columns:repeat(3, 1fr)!important;}}`}</style>
        </div>
      </section>

      {checkoutPlan && (
        <CheckoutModal
          isOpen={!!checkoutPlan}
          onClose={() => setCheckoutPlan(null)}
          initialPlan={checkoutPlan}
        />
      )}
    </>
  )
}
