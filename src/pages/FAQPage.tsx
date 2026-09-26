import { useState, useEffect } from 'react'
import { LEGAL_CONFIG } from '../data/legal_config'

const F = "'Plus Jakarta Sans', system-ui, sans-serif"
const BG = '#070B14'
const BG2 = '#0D1422'
const SURFACE = '#111A2B'
const SKY = '#38BDF8'
const SKY_B = '#7DD3FC'
const TEXT2 = '#94A3B8'
const MUTED = '#64748B'
const BORDER = 'rgba(148,163,184,0.16)'

interface FAQItemData {
  id: string
  question: string
  answer: React.ReactNode
  category: 'plans' | 'platform' | 'updates' | 'app' | 'purchase'
}

const FAQ_CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'plans', label: 'Plans & Pricing' },
  { id: 'platform', label: 'Windows & macOS' },
  { id: 'updates', label: 'Updates' },
  { id: 'app', label: 'App & Features' },
  { id: 'purchase', label: 'Purchase & License' },
] as const

const FAQ_SECTIONS: {
  category: 'plans' | 'platform' | 'updates' | 'app' | 'purchase'
  title: string
  items: FAQItemData[]
}[] = [
  {
    category: 'plans',
    title: 'Plan FAQs',
    items: [
      {
        id: 'faq-plan-duo',
        category: 'plans',
        question: 'What is Memento Duo?',
        answer: (
          <p style={{ margin: 0 }}>
            Memento Duo includes 2 Mementos of your choice for a one-time purchase of ₹349. It includes the Memento desktop companion and access to standard future updates.
          </p>
        ),
      },
      {
        id: 'faq-plan-four',
        category: 'plans',
        question: 'What is Memento Four?',
        answer: (
          <p style={{ margin: 0 }}>
            Memento Four includes 4 Mementos of your choice for a one-time purchase of ₹649. It includes the Memento desktop companion and access to standard future updates.
          </p>
        ),
      },
      {
        id: 'faq-plan-complete',
        category: 'plans',
        question: 'What is Memento Complete?',
        answer: (
          <p style={{ margin: 0 }}>
            Memento Complete is planned to include access to the full Memento collection, 4 Mementos, and a Surprise Charm. It is currently Coming Soon and cannot be purchased yet.
          </p>
        ),
      },
      {
        id: 'faq-plan-complete-buy',
        category: 'plans',
        question: 'Can I purchase Memento Complete right now?',
        answer: (
          <p style={{ margin: 0 }}>
            Not yet. Memento Complete is currently Coming Soon. Existing Complete licenses continue to be supported.
          </p>
        ),
      },
    ],
  },
  {
    category: 'platform',
    title: 'Windows & macOS Availability',
    items: [
      {
        id: 'faq-platform-windows',
        category: 'platform',
        question: 'Is Memento available on Windows?',
        answer: (
          <p style={{ margin: 0 }}>
            Yes. Memento is currently available for Windows, and the Windows installer is provided after purchase.
          </p>
        ),
      },
      {
        id: 'faq-platform-macos',
        category: 'platform',
        question: 'Is Memento available on macOS?',
        answer: (
          <p style={{ margin: 0 }}>
            Not yet. The macOS version is currently Launching Soon. The Mac download is disabled until the macOS release is ready.
          </p>
        ),
      },
      {
        id: 'faq-platform-macos-license',
        category: 'platform',
        question: 'Will my purchase work on macOS when it launches?',
        answer: (
          <p style={{ margin: 0 }}>
            Your Memento license is associated with your purchase. macOS support will become available when the macOS version launches.
          </p>
        ),
      },
    ],
  },
  {
    category: 'updates',
    title: 'Updates & Maintenance',
    items: [
      {
        id: 'faq-updates-future',
        category: 'updates',
        question: 'Will Memento receive future updates?',
        answer: (
          <p style={{ margin: 0 }}>
            Yes. Memento is designed to receive future standard updates, including improvements and new content.
          </p>
        ),
      },
      {
        id: 'faq-updates-repurchase',
        category: 'updates',
        question: 'Will I need to purchase Memento again for future standard updates?',
        answer: (
          <p style={{ margin: 0 }}>
            No. Standard future updates are included with your Memento purchase.
          </p>
        ),
      },
    ],
  },
  {
    category: 'app',
    title: 'App & Usage',
    items: [
      {
        id: 'faq-app-what-is',
        category: 'app',
        question: 'What is Memento?',
        answer: (
          <p style={{ margin: 0 }}>
            Memento is a desktop companion built around small collectible Mementos that hang from your screen and react naturally with real-time rope physics.
          </p>
        ),
      },
      {
        id: 'faq-app-what-are-mementos',
        category: 'app',
        question: 'What are Mementos?',
        answer: (
          <p style={{ margin: 0 }}>
            Mementos are collectible desktop charms that you can choose and keep on your screen as part of your personal collection.
          </p>
        ),
      },
      {
        id: 'faq-app-change-memento',
        category: 'app',
        question: 'Can I change my Memento?',
        answer: (
          <p style={{ margin: 0 }}>
            Yes. Your Memento collection can be managed through the desktop app, where you can choose from the Mementos available to your license.
          </p>
        ),
      },
      {
        id: 'faq-app-continuous',
        category: 'app',
        question: 'Does Memento run continuously?',
        answer: (
          <p style={{ margin: 0 }}>
            Memento is designed to live quietly on your desktop. Its hanging companion remains part of your desktop experience without requiring constant interaction.
          </p>
        ),
      },
      {
        id: 'faq-app-internet',
        category: 'app',
        question: 'Do I need an internet connection to use Memento?',
        answer: (
          <p style={{ margin: 0 }}>
            An internet connection may be required for activation, license verification, downloads, and certain online features. The desktop companion itself is designed to run locally.
          </p>
        ),
      },
    ],
  },
  {
    category: 'purchase',
    title: 'Purchase & Licensing',
    items: [
      {
        id: 'faq-purchase-subscription',
        category: 'purchase',
        question: 'Is Memento a subscription?',
        answer: (
          <p style={{ margin: 0 }}>
            No. The current Memento plans are one-time purchases.
          </p>
        ),
      },
      {
        id: 'faq-purchase-receive',
        category: 'purchase',
        question: 'How do I receive Memento after purchasing?',
        answer: (
          <p style={{ margin: 0 }}>
            After a successful purchase, you receive your license information and access to the Windows installer.
          </p>
        ),
      },
      {
        id: 'faq-purchase-help',
        category: 'purchase',
        question: 'Where can I get help with my purchase or license?',
        answer: (
          <p style={{ margin: 0 }}>
            Contact us at{' '}
            <a
              href={`mailto:${LEGAL_CONFIG.supportEmail}`}
              style={{ color: SKY, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              {LEGAL_CONFIG.supportEmail}
            </a>{' '}
            and include the email address used for your purchase and a description of the issue.
          </p>
        ),
      },
    ],
  },
]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-plan-duo': true,
  })

  useEffect(() => {
    document.title = 'Frequently Asked Questions · Memento'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Frequently Asked Questions about Memento desktop companion, plans, Windows & macOS availability, updates, and licensing.'
      )
    }
  }, [])

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const filteredSections = FAQ_SECTIONS.map(section => {
    if (selectedCategory === 'all' || section.category === selectedCategory) {
      return section
    }
    return null
  }).filter(Boolean) as typeof FAQ_SECTIONS

  return (
    <div style={{ background: BG, color: '#F8FAFC', minHeight: '100vh', fontFamily: F }}>
      {/* ── Hero ── */}
      <header
        style={{
          position: 'relative',
          padding: '120px clamp(20px,5vw,64px) 70px',
          borderBottom: `1px solid ${BORDER}`,
          overflow: 'hidden',
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.12) 0%, transparent 60%),
            ${BG2}
          `,
        }}
      >
        {/* Subtle Decorative Grid */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: SKY_B, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 16 }}>
            <span style={{ width: 16, height: 1.5, background: SKY, display: 'inline-block' }} />
            Memento FAQ
            <span style={{ width: 16, height: 1.5, background: SKY, display: 'inline-block' }} />
          </div>

          <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.15 }}>
            Frequently Asked Questions
          </h1>

          <p style={{ fontSize: 'clamp(16px,2vw,18.5px)', color: TEXT2, lineHeight: 1.7, maxWidth: 640, margin: '0 auto 32px', fontWeight: 400 }}>
            Everything you need to know about Memento.
          </p>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {FAQ_CATEGORIES.map(cat => {
              const active = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    background: active ? SKY : 'rgba(148,163,184,0.08)',
                    border: `1px solid ${active ? SKY : BORDER}`,
                    color: active ? '#04121C' : TEXT2,
                    borderRadius: 999,
                    padding: '8px 18px',
                    fontFamily: F,
                    fontWeight: 600,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.color = '#F8FAFC'
                      e.currentTarget.style.borderColor = 'rgba(148,163,184,0.3)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.color = TEXT2
                      e.currentTarget.style.borderColor = BORDER
                    }
                  }}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── FAQ Body ── */}
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '64px clamp(20px,5vw,48px) 120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          {filteredSections.map(section => (
            <section key={section.category} aria-labelledby={`section-${section.category}`}>
              <h2
                id={`section-${section.category}`}
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: SKY_B,
                  letterSpacing: '-0.02em',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: SKY, display: 'inline-block' }} />
                {section.title}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {section.items.map(item => {
                  const isOpen = !!openItems[item.id]
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: SURFACE,
                        border: `1px solid ${isOpen ? 'rgba(56,189,248,0.35)' : BORDER}`,
                        borderRadius: 16,
                        overflow: 'hidden',
                        transition: 'border-color 0.2s ease, background-color 0.2s ease',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        aria-expanded={isOpen}
                        aria-controls={`${item.id}-content`}
                        id={`${item.id}-header`}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16,
                          padding: '20px 24px',
                          background: 'transparent',
                          border: 'none',
                          color: '#F8FAFC',
                          fontFamily: F,
                          fontSize: 16.5,
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{item.question}</span>
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: isOpen ? 'rgba(56,189,248,0.15)' : 'rgba(148,163,184,0.08)',
                            color: isOpen ? SKY_B : MUTED,
                            flexShrink: 0,
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease, background-color 0.2s ease',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="4 6 8 10 12 6" />
                          </svg>
                        </span>
                      </button>

                      {isOpen && (
                        <div
                          id={`${item.id}-content`}
                          role="region"
                          aria-labelledby={`${item.id}-header`}
                          style={{
                            padding: '0 24px 22px 24px',
                            color: TEXT2,
                            fontSize: 15.5,
                            lineHeight: 1.75,
                            borderTop: '1px solid rgba(148,163,184,0.08)',
                            paddingTop: 16,
                          }}
                        >
                          {item.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* ── Help / Contact Card at Bottom ── */}
        <div
          style={{
            marginTop: 64,
            padding: '32px clamp(20px,4vw,36px)',
            background: `linear-gradient(135deg, rgba(56,189,248,0.06) 0%, rgba(14,165,233,0.02) 100%), ${SURFACE}`,
            border: '1px solid rgba(56,189,248,0.22)',
            borderRadius: 20,
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', margin: '0 0 10px' }}>
            Still have questions?
          </h3>
          <p style={{ color: TEXT2, fontSize: 15.5, margin: '0 0 20px', lineHeight: 1.6 }}>
            Our team is happy to help with any inquiries regarding your purchase, collection, or license.
          </p>
          <a
            href={`mailto:${LEGAL_CONFIG.supportEmail}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#F8FAFC',
              color: '#050810',
              padding: '10px 24px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14.5,
              textDecoration: 'none',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Contact Support ({LEGAL_CONFIG.supportEmail})
          </a>
        </div>
      </main>
    </div>
  )
}
