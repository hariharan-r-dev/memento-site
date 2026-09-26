import { useState, useEffect, useRef } from 'react'
import { Link, Outlet, useLocation } from 'react-router'

const F = "'Plus Jakarta Sans', system-ui, sans-serif"
const BORDER = 'rgba(148,163,184,0.16)'

export default function Root() {
  const [scrolled, setScrolled] = useState(false)
  const [navVisible, setNavVisible] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  const lastScrollYRef = useRef(0)
  const tickingRef = useRef(false)

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo(0, 0)
    setNavVisible(true)
    lastScrollYRef.current = 0
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY
        const lastScrollY = lastScrollYRef.current
        const delta = currentScrollY - lastScrollY
        const threshold = 8 // threshold in px to prevent jitter

        setScrolled(currentScrollY > 8)

        if (mobileOpen) {
          // Keep navigation visible when mobile drawer is open
          setNavVisible(true)
        } else if (currentScrollY <= 15) {
          // Always visible at the top of the page
          setNavVisible(true)
        } else if (delta > threshold && currentScrollY > 60) {
          // Scrolling DOWN -> hide navigation
          setNavVisible(false)
        } else if (delta < -threshold) {
          // Scrolling UP -> show navigation
          setNavVisible(true)
        }

        lastScrollYRef.current = currentScrollY
        tickingRef.current = false
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileOpen])

  return (
    <div style={{ fontFamily: F, background: '#070B14', color: '#F8FAFC', minHeight: '100vh' }}>

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '22px clamp(20px,5vw,64px)',
          background: scrolled || !isHome ? 'rgba(7,11,20,0.72)' : 'rgba(7,11,20,0.72)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${BORDER}`,
          fontFamily: F,
          transform: navVisible || mobileOpen ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease, border-color 200ms ease',
          willChange: 'transform',
        }}
      >
        <Link to="/" style={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: '#F8FAFC', textDecoration: 'none' }}>
          memento
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex" style={{ gap: 36, listStyle: 'none', margin: 0, padding: 0 }}>
          {[
            { label: 'Collections', href: isHome ? '#collections' : '/#collections' },
            { label: 'How it works', href: isHome ? '#how-it-works' : '/#how-it-works' },
            { label: 'Customize', href: isHome ? '#customize' : '/#customize' },
            { label: 'Pricing', href: isHome ? '#pricing' : '/#pricing' },
            { label: 'FAQ', href: '/faq', isRoute: true },
          ].map(({ label, href, isRoute }) => (
            <li key={label}>
              {isRoute ? (
                <Link
                  to={href}
                  style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14.5, fontWeight: 500, transition: 'color .2s', fontFamily: F }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
                >
                  {label}
                </Link>
              ) : (
                <a
                  href={href}
                  style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14.5, fontWeight: 500, transition: 'color .2s', fontFamily: F }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
                >
                  {label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a
            href={isHome ? '#pricing' : '/#pricing'}
            style={{
              background: '#F8FAFC', color: '#050810', border: 'none', borderRadius: 999,
              padding: '10px 20px', fontFamily: F, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              textDecoration: 'none', display: 'inline-block',
            }}
          >
            Download
          </a>
          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(v => !v)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#0D1422', borderBottom: `1px solid ${BORDER}`,
              padding: '20px clamp(20px,5vw,64px)', display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            {[
              { label: 'Collections', href: isHome ? '#collections' : '/#collections' },
              { label: 'How it works', href: isHome ? '#how-it-works' : '/#how-it-works' },
              { label: 'Customize', href: isHome ? '#customize' : '/#customize' },
              { label: 'Pricing', href: isHome ? '#pricing' : '/#pricing' },
              { label: 'FAQ', href: '/faq', isRoute: true },
            ].map(({ label, href, isRoute }) =>
              isRoute ? (
                <Link
                  key={label}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 15, fontFamily: F }}
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 15, fontFamily: F }}
                >
                  {label}
                </a>
              )
            )}
          </div>
        )}
      </nav>

      {/* ── Page ────────────────────────────────────────── */}
      <Outlet />

      {/* ── Footer ──────────────────────────────────────── */}
      <footer
        style={{
          padding: '56px clamp(20px,5vw,64px)', borderTop: `1px solid ${BORDER}`,
          display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between',
          maxWidth: 1240, margin: '0 auto', fontFamily: F,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>memento</div>
          <div style={{ color: '#64748B', fontSize: 13.5 }}>Little things worth keeping.</div>
        </div>
        <ul style={{ display: 'flex', gap: 28, flexWrap: 'wrap', listStyle: 'none', padding: 0, margin: 0 }}>
          {[
            { label: 'Collections', href: '/#collections' },
            { label: 'How it works', href: '/#how-it-works' },
            { label: 'Customize', href: '/#customize' },
            { label: 'Pricing', href: '/#pricing' },
            { label: 'Updates', href: '/updates' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ].map(({ label, href }) => (
            <li key={label}>
              {href.startsWith('/') && !href.startsWith('/#') ? (
                <Link
                  to={href}
                  style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
                >
                  {label}
                </Link>
              ) : (
                <a
                  href={href}
                  style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
                >
                  {label}
                </a>
              )}
            </li>
          ))}
        </ul>
        <div style={{ color: '#64748B', fontSize: 12.5, width: '100%', marginTop: 30 }}>© 2026 Memento</div>
      </footer>
    </div>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      {open ? (
        <><line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" /></>
      ) : (
        <><line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" /></>
      )}
    </svg>
  )
}
