import { useState, useRef } from 'react'
import { Link } from 'react-router'
import { collections } from '../data/collections'
import { CharmArt } from '../components/CharmArt'
import type { Charm } from '../data/charms'

const BG      = '#070B14'
const SURFACE = '#111A2B'
const SKY     = '#38BDF8'
const SKY_MID = '#0EA5E9'
const SKY_B   = '#7DD3FC'
const TEXT2   = '#94A3B8'
const MUTED   = '#64748B'
const BORDER  = 'rgba(148,163,184,0.16)'
const F       = "'Plus Jakarta Sans', system-ui, sans-serif"

export default function ActivatePage() {
  const [licenseInput, setLicenseInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [licenseData, setLicenseData] = useState<any>(null)
  const [selectedMementos, setSelectedMementos] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [downloadingWin, setDownloadingWin] = useState(false)
  const [downloadingMac, setDownloadingMac] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [savingMementos, setSavingMementos] = useState(false)
  const inFlightRef = useRef(false)

  const allAvailableCharms = collections.filter(c => !c.comingSoon).flatMap(c => c.charms)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const cleanKey = licenseInput.trim().toUpperCase()

    if (!cleanKey) {
      setError('Please enter your license key.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/license/verify?key=${encodeURIComponent(cleanKey)}`)
      const data = await res.json()

      if (!res.ok || !data.valid) {
        setError(data.error || 'Invalid or inactive license key.')
        setLicenseData(null)
      } else {
        setLicenseData(data)
        setSelectedMementos(data.ownedMementos || [])
      }
    } catch {
      setError('Unable to reach license verification service.')
    } finally {
      setLoading(false)
    }
  }

  const copyLicense = () => {
    if (!licenseData?.licenseKey) return
    navigator.clipboard.writeText(licenseData.licenseKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async (platform: 'windows' | 'macos') => {
    if (!licenseData?.licenseKey) return
    if (platform === 'windows') setDownloadingWin(true)
    else setDownloadingMac(true)
    setDownloadError(null)

    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'memento_download_click', {
          platform,
          plan: licenseData.plan || 'memento',
        })
      }

      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          licenseKey: licenseData.licenseKey,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.downloadUrl) {
        setDownloadError(data.error || `Unable to start ${platform === 'windows' ? 'Windows' : 'macOS'} download.`)
        return
      }

      const a = document.createElement('a')
      a.href = data.downloadUrl
      a.download = data.fileName || (platform === 'windows' ? 'Memento-Setup.exe' : 'Memento-macOS.dmg')
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      setDownloadError('Network error while starting download. Please check your connection.')
    } finally {
      if (platform === 'windows') setDownloadingWin(false)
      else setDownloadingMac(false)
    }
  }

  const handleCharmToggle = async (charmId: string) => {
    if (!licenseData || inFlightRef.current || savingMementos) return
    const maxAllowed = licenseData.entitlements?.maxMementos

    let updated: string[] = []
    if (selectedMementos.includes(charmId)) {
      updated = selectedMementos.filter(id => id !== charmId)
    } else {
      if (maxAllowed !== null && selectedMementos.length >= maxAllowed) return
      updated = [...selectedMementos, charmId]
    }

    inFlightRef.current = true
    setSelectedMementos(updated)
    setSavingMementos(true)

    try {
      const res = await fetch('/api/license/mementos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: licenseData.licenseKey,
          mementoIds: updated,
        }),
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        if (Array.isArray(data.ownedMementos)) {
          setSelectedMementos(data.ownedMementos)
        }
      }
    } catch { /* ignore */ } finally {
      inFlightRef.current = false
      setSavingMementos(false)
    }
  }

  const isCompletePlan = licenseData?.entitlements?.allCollections === true
  const maxMementos = licenseData?.entitlements?.maxMementos ?? (isCompletePlan ? null : 2)

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC', fontFamily: F, padding: '60px 20px 120px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ color: SKY_B, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 12 }}>
            LICENSE & DOWNLOAD PORTAL
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 14px' }}>
            Activate & manage Memento
          </h1>
          <p style={{ color: TEXT2, fontSize: 16, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            Enter your official license key to access downloads, manage your paired Mementos, and verify entitlements.
          </p>
        </div>

        {/* License Input Card */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '28px', marginBottom: 32 }}>
          <form onSubmit={handleVerify} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="text"
              value={licenseInput}
              onChange={e => setLicenseInput(e.target.value)}
              placeholder="MEMENTO-XXXX-XXXX-XXXX-XXXX"
              style={{
                flex: 1,
                minWidth: 260,
                background: '#070B14',
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 15,
                color: '#F8FAFC',
                fontFamily: 'monospace',
                outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = SKY_MID)}
              onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: `linear-gradient(180deg, ${SKY_B}, ${SKY_MID})`,
                color: '#04121C',
                border: 'none',
                borderRadius: 12,
                padding: '14px 24px',
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: F,
              }}
            >
              {loading ? 'Verifying…' : 'Verify License'}
            </button>
          </form>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginTop: 16 }}>
              {error}
            </div>
          )}
        </div>

        {/* Verified License Details */}
        {licenseData && (
          <div>
            <div style={{ background: '#0B111E', border: `1px solid ${BORDER}`, borderRadius: 20, padding: '28px', marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: SKY_B }}>OFFICIAL LICENSE</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>{licenseData.planName}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#34D399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', padding: '4px 10px', borderRadius: 999 }}>
                  Active · One-time purchase
                </span>
              </div>

              <div style={{ background: '#070B14', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, letterSpacing: '0.05em' }}>{licenseData.licenseKey}</span>
                <button
                  onClick={copyLicense}
                  style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`, color: '#FFFFFF', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Downloads */}
              {downloadError && (
                <div style={{ marginTop: 16, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 10, padding: '10px 14px', color: '#FCA5A5', fontSize: 13 }}>
                  ⚠️ {downloadError}
                </div>
              )}

              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <button
                  onClick={() => handleDownload('windows')}
                  disabled={downloadingWin || downloadingMac}
                  style={{
                    background: `linear-gradient(180deg, ${SKY_B}, ${SKY_MID})`,
                    color: '#04121C',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: downloadingWin || downloadingMac ? 'wait' : 'pointer',
                    opacity: downloadingWin || downloadingMac ? 0.8 : 1,
                  }}
                >
                  {downloadingWin ? 'Preparing download…' : 'Download Windows (.exe)'}
                </button>

                <button
                  onClick={() => handleDownload('macos')}
                  disabled={downloadingWin || downloadingMac}
                  style={{
                    background: `linear-gradient(180deg, ${SKY_B}, ${SKY_MID})`,
                    color: '#04121C',
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: downloadingWin || downloadingMac ? 'wait' : 'pointer',
                    opacity: downloadingWin || downloadingMac ? 0.8 : 1,
                  }}
                >
                  {downloadingMac ? 'Preparing download…' : 'Download macOS (.dmg)'}
                </button>
              </div>
            </div>

            {/* Choose Mementos */}
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '28px' }}>
              <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
                    {isCompletePlan ? 'All Mementos Unlocked' : 'Paired Mementos'}
                  </div>
                  <div style={{ fontSize: 13, color: TEXT2 }}>
                    {isCompletePlan ? 'Your plan includes access to all current and future collections.' : `Selected: ${selectedMementos.length} of ${maxMementos}`}
                  </div>
                </div>
                {savingMementos && (
                  <span style={{ fontSize: 12, color: SKY_B, fontWeight: 600 }}>Saving...</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
                {allAvailableCharms.map((ch: Charm) => {
                  const isSelected = isCompletePlan || selectedMementos.includes(ch.id)
                  const disabled = !isCompletePlan && !isSelected && (maxMementos !== null && selectedMementos.length >= maxMementos)
                  return (
                    <button
                      key={ch.id}
                      onClick={() => !isCompletePlan && !savingMementos && handleCharmToggle(ch.id)}
                      disabled={isCompletePlan || disabled || savingMementos}
                      style={{
                        background: isSelected ? 'rgba(56,189,248,0.1)' : 'rgba(7, 11, 20, 0.6)',
                        border: `1px solid ${isSelected ? SKY_MID : BORDER}`,
                        borderRadius: 14,
                        padding: '18px 12px',
                        textAlign: 'center',
                        cursor: isCompletePlan ? 'default' : (disabled || savingMementos) ? 'not-allowed' : 'pointer',
                        opacity: (disabled || (savingMementos && !isSelected)) ? 0.45 : 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        transition: '.18s',
                      }}
                    >
                      <div style={{ width: 50, height: 50, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CharmArt id={ch.id} style={{ width: '100%', height: 'auto' }} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#FFFFFF' : TEXT2 }}>
                        {ch.name}
                      </div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                        {isSelected ? '✓ Active' : 'Select'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link to="/" style={{ color: TEXT2, fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>
            ← Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
