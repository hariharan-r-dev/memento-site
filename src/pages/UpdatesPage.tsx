import { useState } from 'react'
import { MEMENTO_UPDATES } from '../data/updates'

const F = "'Plus Jakarta Sans', system-ui, sans-serif"
const BG = '#070B14'
const SURFACE = '#111A2B'
const SKY = '#38BDF8'
const SKY_B = '#7DD3FC'
const TEXT2 = '#94A3B8'
const MUTED = '#64748B'
const BORDER = 'rgba(148,163,184,0.16)'

type PlatformFilter = 'all' | 'windows' | 'macos'

export default function UpdatesPage() {
  const [filter, setFilter] = useState<PlatformFilter>('all')

  const filteredUpdates = MEMENTO_UPDATES.filter(u => {
    if (filter === 'all') return true
    return u.platforms.includes(filter)
  })

  return (
    <div style={{ background: BG, minHeight: '80vh', padding: '100px clamp(20px,5vw,64px) 140px', fontFamily: F }}>
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: SKY_B, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 18 }}>
          <span style={{ width: 22, height: 1, background: SKY, display: 'block', flexShrink: 0 }} />
          Memento
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 16px', color: '#F8FAFC' }}>
          Updates
        </h1>
        <p style={{ color: TEXT2, fontSize: 18, lineHeight: 1.6, margin: '0 0 40px' }}>
          Keep your Memento up to date.
        </p>

        {/* Platform Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 50 }}>
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'windows', label: 'Windows' },
              { id: 'macos', label: 'macOS' },
            ] as const
          ).map(tab => {
            const active = filter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  background: active ? SKY : 'transparent',
                  border: `1px solid ${active ? SKY : BORDER}`,
                  color: active ? '#04121C' : TEXT2,
                  borderRadius: 999,
                  padding: '8px 22px',
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all .18s ease',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Updates List */}
        {filteredUpdates.length === 0 ? (
          <div style={{ padding: '48px 0', color: MUTED, fontSize: 16 }}>
            No updates yet for this platform.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {filteredUpdates.map(update => {
              const platformLabel =
                update.platforms.includes('windows') && update.platforms.includes('macos')
                  ? 'Windows + macOS'
                  : update.platforms.includes('windows')
                  ? 'Windows'
                  : 'macOS'

              return (
                <article
                  key={update.version}
                  style={{
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 18,
                    padding: '32px clamp(20px,4vw,36px)',
                  }}
                >
                  {/* Card Header: Version, Platform Badge & Date */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
                        {update.version}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          color: SKY_B,
                          background: 'rgba(56,189,248,0.12)',
                          border: '1px solid rgba(56,189,248,0.25)',
                          borderRadius: 6,
                          padding: '3px 8px',
                        }}
                      >
                        {platformLabel}
                      </span>
                    </div>
                    <span style={{ fontSize: 13.5, color: MUTED, fontWeight: 500 }}>
                      {update.date}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', margin: '0 0 8px', lineHeight: 1.4 }}>
                    {update.title}
                  </h2>
                  {update.description && (
                    <p style={{ color: TEXT2, fontSize: 14.5, lineHeight: 1.6, margin: '0 0 16px' }}>
                      {update.description}
                    </p>
                  )}

                  {/* Bullet points */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {update.notes.map((note, i) => (
                      <li key={i} style={{ color: TEXT2, fontSize: 14.5, lineHeight: 1.5, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: SKY, fontWeight: 700, flexShrink: 0 }}>•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
