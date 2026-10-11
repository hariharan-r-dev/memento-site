import React, { useState } from 'react'

const F = "'Plus Jakarta Sans', system-ui, sans-serif"
const BG = '#070B14'
const SURFACE = '#0D1422'
const BORDER = 'rgba(148, 163, 184, 0.14)'
const TEXT_MUTED = '#94A3B8'
const TEXT_WHITE = '#F8FAFC'

// Brand color tokens matching Memento's theme
const BRAND = '#38BDF8'
const BRAND_LIGHT = '#7DD3FC'
const BRAND_BG = 'rgba(56, 189, 248, 0.08)'
const BRAND_BORDER = 'rgba(56, 189, 248, 0.22)'
const BRAND_BORDER_HOVER = 'rgba(56, 189, 248, 0.42)'

export interface SocialCardItem {
  id: string
  name: string
  title: string
  description: string
  cta: string
  url: string
  icon: (props: { size?: number; color?: string }) => React.ReactNode
}

/**
 * Central configuration for social profiles and card copy.
 * Updated with official URLs, titles, descriptions and icons.
 */
export const SOCIAL_PROFILES_CONFIG: SocialCardItem[] = [
  {
    id: 'github',
    name: 'GitHub',
    title: 'Things I’m building',
    description: 'Experiments, side projects & open-source bits',
    cta: 'Explore repos',
    url: 'https://github.com/hariharan-r-dev',
    icon: ({ size = 20, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    title: 'The professional side',
    description: 'Product thinking, design work & career updates',
    cta: 'Connect',
    url: 'https://linkedin.com/in/hariharan-r',
    icon: ({ size = 20, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    title: 'Life between screens',
    description: 'Little moments, creative finds & everyday things',
    cta: 'Take a look',
    url: 'https://www.instagram.com/_single.builder',
    icon: ({ size = 20, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    id: 'behance',
    name: 'Behance',
    title: 'A closer look at the craft',
    description: 'Visual explorations, case studies & design details',
    cta: 'View projects',
    url: 'https://www.behance.net/Designedby26',
    icon: ({ size = 20, color = 'currentColor' }) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M16.969 16.927a2.561 2.561 0 0 0 1.901.677 2.501 2.501 0 0 0 1.531-.475c.362-.235.636-.584.779-.99h2.585a5.091 5.091 0 0 1-1.9 2.896 5.292 5.292 0 0 1-3.091.88 5.839 5.839 0 0 1-2.284-.433 4.871 4.871 0 0 1-1.723-1.211 5.657 5.657 0 0 1-1.08-1.874 7.057 7.057 0 0 1-.383-2.393c-.005-.8.129-1.595.396-2.349a5.313 5.313 0 0 1 5.088-3.604 4.87 4.87 0 0 1 2.376.563c.661.362 1.231.87 1.668 1.485a6.2 6.2 0 0 1 .943 2.133c.194.821.263 1.666.205 2.508h-7.699c-.063.79.184 1.574.688 2.187ZM6.947 4.084a8.065 8.065 0 0 1 1.928.198 4.29 4.29 0 0 1 1.49.638c.418.303.748.711.958 1.182.241.579.357 1.203.341 1.83a3.506 3.506 0 0 1-.506 1.961 3.726 3.726 0 0 1-1.503 1.287 3.588 3.588 0 0 1 2.027 1.437c.464.747.697 1.615.67 2.494a4.593 4.593 0 0 1-.423 2.032 3.945 3.945 0 0 1-1.163 1.413 5.114 5.114 0 0 1-1.683.807 7.135 7.135 0 0 1-1.928.259H0V4.084h6.947Zm-.235 12.9c.308.004.616-.029.916-.099a2.18 2.18 0 0 0 .766-.332c.228-.158.411-.371.534-.619.142-.317.208-.663.191-1.009a2.08 2.08 0 0 0-.642-1.715 2.618 2.618 0 0 0-1.696-.505h-3.54v4.279h3.471Zm13.635-5.967a2.13 2.13 0 0 0-1.654-.619 2.336 2.336 0 0 0-1.163.259 2.474 2.474 0 0 0-.738.62 2.359 2.359 0 0 0-.396.792c-.074.239-.12.485-.137.734h4.769a3.239 3.239 0 0 0-.679-1.785l-.002-.001Zm-13.813-.648a2.254 2.254 0 0 0 1.423-.433c.399-.355.607-.88.56-1.413a1.916 1.916 0 0 0-.178-.891 1.298 1.298 0 0 0-.495-.533 1.851 1.851 0 0 0-.711-.274 3.966 3.966 0 0 0-.835-.073H3.241v3.631h3.293v-.014ZM21.62 5.122h-5.976v1.527h5.976V5.122Z" />
      </svg>
    ),
  },
]

export function BeyondThePixels() {
  return (
    <section
      id="beyond-the-pixels"
      aria-label="Beyond the pixels - Creator and Social Links"
      style={{
        background: BG,
        borderTop: '1px solid ' + BORDER,
        padding: '110px clamp(20px, 5vw, 64px) 120px',
        fontFamily: F,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle brand ambient glow in background */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '25%',
          right: '8%',
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div className="beyond-grid">
          {/* =================================================================
              LEFT COLUMN — Story & Intro
              ================================================================= */}
          <div className="beyond-intro-col">
            {/* Eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: BRAND,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              <span style={{ width: 18, height: 2, background: BRAND, display: 'block', borderRadius: 2 }} />
              A LITTLE BEYOND THE WORK
            </div>

            {/* Headline */}
            <h2
              style={{
                fontSize: 'clamp(32px, 3.8vw, 48px)',
                lineHeight: 1.08,
                letterSpacing: '-0.025em',
                fontWeight: 700,
                color: TEXT_WHITE,
                margin: '0 0 20px',
                fontFamily: F,
              }}
            >
              The work is here.
              <br />
              <span style={{ color: '#E2E8F0' }}>A little more of me is elsewhere.</span>
            </h2>

            {/* Supporting Copy */}
            <p
              style={{
                color: TEXT_MUTED,
                fontSize: 16.5,
                lineHeight: 1.65,
                maxWidth: 520,
                margin: '0 0 28px',
                fontWeight: 400,
              }}
            >
              I design digital experiences, build things on the side, and share bits of the process along the way. Find me wherever your curiosity takes you.
            </p>

            {/* Tagline Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(13, 20, 34, 0.85)',
                border: '1px solid rgba(148, 163, 184, 0.16)',
                borderLeft: '3px solid ' + BRAND,
                borderRadius: 10,
                padding: '10px 16px',
                marginBottom: 36,
              }}
            >
              <span
                style={{
                  color: '#E2E8F0',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                DESIGNER BY DAY. BUILDER BY CURIOSITY.
              </span>
            </div>

            {/* Subtle Divider & Sign-off */}
            <div
              style={{
                paddingTop: 22,
                borderTop: '1px solid rgba(148, 163, 184, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ color: '#64748B', fontSize: 13, fontWeight: 500 }}>
                Always curious, continuously shipping.
              </span>
              <span style={{ color: 'rgba(148, 163, 184, 0.3)', fontSize: 13 }}>•</span>
              <span style={{ color: '#64748B', fontSize: 13, fontWeight: 500 }}>
                Chennai, India
              </span>
            </div>
          </div>

          {/* =================================================================
              RIGHT COLUMN — 4 Distinct Social Link Cards Grid
              ================================================================= */}
          <div className="beyond-cards-col">
            <div
              className="beyond-social-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 16,
              }}
            >
              {SOCIAL_PROFILES_CONFIG.map((profile) => (
                <SocialCard key={profile.id} profile={profile} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive layout styles */}
      <style>{`
        .beyond-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: center;
        }

        @media (min-width: 960px) {
          .beyond-grid {
            grid-template-columns: 1.05fr 1.15fr !important;
            gap: clamp(48px, 6vw, 72px) !important;
          }
        }

        @media (max-width: 640px) {
          .beyond-social-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
        }

        .beyond-card {
          transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 220ms ease,
                      background-color 220ms ease,
                      box-shadow 220ms ease;
        }

        .beyond-card:hover {
          transform: translateY(-3.5px);
          border-color: ${BRAND_BORDER_HOVER} !important;
          background: rgba(17, 26, 43, 0.96) !important;
          box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 189, 248, 0.16);
        }

        .beyond-card:hover .beyond-arrow-icon {
          transform: translate(3px, -3px);
          color: ${BRAND_LIGHT} !important;
        }

        .beyond-card:hover .beyond-icon-box {
          background: rgba(56, 189, 248, 0.15) !important;
          border-color: rgba(56, 189, 248, 0.38) !important;
        }

        .beyond-card:hover .beyond-cta-text {
          color: ${BRAND_LIGHT} !important;
        }

        .beyond-card:focus-visible {
          outline: 2px solid ${BRAND};
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .beyond-card,
          .beyond-arrow-icon {
            transition: none !important;
            transform: none !important;
          }
          .beyond-card:hover {
            transform: none !important;
          }
          .beyond-card:hover .beyond-arrow-icon {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  )
}

function SocialCard({ profile }: { profile: SocialCardItem }) {
  const [focused, setFocused] = useState(false)

  return (
    <a
      href={profile.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={profile.title + ' on ' + profile.name + ' - ' + profile.cta}
      className="beyond-card"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: SURFACE,
        border: '1px solid ' + BORDER,
        borderRadius: 16,
        padding: '24px 22px',
        textDecoration: 'none',
        position: 'relative',
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
    >
      <div>
        {/* Top Header: Platform Icon + Arrow Shift */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div
            className="beyond-icon-box"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: BRAND_BG,
              border: '1px solid ' + BRAND_BORDER,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: BRAND,
              transition: 'background-color 200ms ease, border-color 200ms ease',
            }}
          >
            {profile.icon({ size: 20, color: BRAND })}
          </div>

          <div
            className="beyond-arrow-icon"
            style={{
              color: '#64748B',
              transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), color 200ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </div>
        </div>

        {/* Card Title */}
        <div
          style={{
            color: TEXT_WHITE,
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            marginBottom: 8,
          }}
        >
          {profile.title}
        </div>

        {/* Card Description */}
        <p
          style={{
            color: TEXT_MUTED,
            fontSize: 13.5,
            lineHeight: 1.5,
            margin: 0,
            fontWeight: 400,
            minHeight: 40,
          }}
        >
          {profile.description}
        </p>
      </div>

      {/* Bottom CTA Action Link */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: BRAND,
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: '0.02em',
        }}
        className="beyond-cta-text"
      >
        <span>{profile.cta}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </a>
  )
}
