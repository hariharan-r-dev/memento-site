import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router'
import { collections } from '../data/collections'
import { CharmArt } from '../components/CharmArt'
import type { Charm } from '../data/charms'

const BG      = '#070B14'
const BG2     = '#0D1422'
const SURFACE = '#111A2B'
const SKY     = '#38BDF8'
const SKY_MID = '#0EA5E9'
const SKY_B   = '#7DD3FC'
const TEXT2   = '#94A3B8'
const MUTED   = '#64748B'
const BORDER  = 'rgba(148,163,184,0.16)'
const F       = "'Plus Jakarta Sans', system-ui, sans-serif"

export default function SuccessPage() {
  const [searchParams] = useSearchParams()
  const keyParam = searchParams.get('key')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [licenseData, setLicenseData] = useState<any>(null)
  const [selectedMementos, setSelectedMementos] = useState<string[]>([])
  const [savingMementos, setSavingMementos] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloadingWin, setDownloadingWin] = useState(false)
  const [downloadingMac, setDownloadingMac] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const inFlightRef = useRef(false)

  const allAvailableCharms = collections.filter(c => !c.comingSoon).flatMap(c => c.charms)

  useEffect(() => {
    async function loadLicense() {
      // 1. Check session storage for immediate cached payload
      let initialPayload: any = null
      try {
        const cached = sessionStorage.getItem('memento_last_purchase')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (!keyParam || parsed.licenseKey === keyParam) {
            initialPayload = parsed
          }
        }
      } catch { /* ignore */ }

      if (initialPayload) {
        setLicenseData(initialPayload)
        setSelectedMementos(initialPayload.ownedMementos || [])
      }

      // 2. Fetch verified license data from backend
      const keyToFetch = keyParam || initialPayload?.licenseKey
      if (!keyToFetch) {
        setError('No license key found. Please check your purchase confirmation link.')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/license/verify?key=${encodeURIComponent(keyToFetch)}`)
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}))
          if (!initialPayload) {
            setError(errJson.error || 'Failed to verify license.')
          }
        } else {
          const data = await res.json()
          setLicenseData(data)
          setSelectedMementos(data.ownedMementos || [])
        }
      } catch {
        if (!initialPayload) {
          setError('Unable to contact verification server.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadLicense()
  }, [keyParam])

  const copyLicense = () => {
    if (!licenseData?.licenseKey) return
    navigator.clipboard.writeText(licenseData.licenseKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
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
      a.style.display = 'none'
      a.href = data.downloadUrl
      a.download = data.fileName || (platform === 'windows' ? 'Memento-Setup.exe' : 'Memento-macOS.dmg')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err: any) {
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
      if (maxAllowed !== null && selectedMementos.length >= maxAllowed) {
        return // reached maximum
      }
      updated = [...selectedMementos, charmId]
    }

    inFlightRef.current = true
    setSelectedMementos(updated)
    setSavingMementos(true)
    setSaveSuccess(false)
    setDownloadError(null)

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
        const resData = await res.json().catch(() => ({}))
        const savedIds = Array.isArray(resData.ownedMementos) ? resData.ownedMementos : updated
        setSelectedMementos(savedIds)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3500)

        // Synchronize sessionStorage only after backend confirms success
        try {
          const cached = sessionStorage.getItem('memento_last_purchase')
          if (cached) {
            const parsed = JSON.parse(cached)
            parsed.ownedMementos = savedIds
            sessionStorage.setItem('memento_last_purchase', JSON.stringify(parsed))
          }
        } catch {
          /* ignore */
        }
      } else {
        const errJson = await res.json().catch(() => ({}))
        setDownloadError(errJson.error || 'Failed to save selected Mementos.')
      }
    } catch {
      setDownloadError('Network error while saving Mementos.')
    } finally {
      inFlightRef.current = false
      setSavingMementos(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, color: TEXT2 }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: `3px solid ${BORDER}`,
              borderTopColor: SKY,
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div>Verifying your Memento purchase…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !licenseData) {
    return (
      <div style={{ minHeight: '70vh', padding: '100px 20px', maxWidth: 640, margin: '0 auto', textAlign: 'center', fontFamily: F }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>
          License Verification
        </h1>
        <p style={{ color: TEXT2, fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}>
          {error || 'Unable to retrieve license information.'}
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            color: '#F8FAFC',
            borderRadius: 10,
            padding: '12px 24px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Return to Home
        </Link>
      </div>
    )
  }

  const isCompletePlan = licenseData.entitlements?.allCollections === true
  const maxMementos = licenseData.entitlements?.maxMementos ?? (isCompletePlan ? null : 2)
  const winUrl = licenseData.downloads?.windows
  const macUrl = licenseData.downloads?.macOS

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#F8FAFC', fontFamily: F, padding: '60px 20px 120px' }}>
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Success Header Banner */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(56,189,248,0.12)',
              border: `1px solid rgba(56,189,248,0.3)`,
              borderRadius: 999,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 700,
              color: SKY_B,
              marginBottom: 20,
              letterSpacing: '0.04em',
            }}
          >
            <span>✓ PAYMENT SUCCESSFUL</span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 14px' }}>
            Your Memento is ready.
          </h1>

          <p style={{ color: TEXT2, fontSize: 17, margin: '0 auto', maxWidth: 480, lineHeight: 1.6 }}>
            Thank you for purchasing <strong style={{ color: '#FFFFFF' }}>{licenseData.planName || 'Memento'}</strong>. You now own your desktop companion forever.
          </p>
        </div>

        {/* License Key Display Card */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 20,
            padding: '32px',
            marginBottom: 36,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: SKY_B }}>
                YOUR OFFICIAL LICENSE KEY
              </div>
              <div style={{ fontSize: 13, color: TEXT2, marginTop: 2 }}>
                Linked to {licenseData.email}
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#34D399',
                background: 'rgba(52,211,153,0.12)',
                border: '1px solid rgba(52,211,153,0.3)',
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              Active · One-time purchase
            </span>
          </div>

          {/* License Key Box */}
          <div
            style={{
              background: '#070B14',
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 'clamp(17px, 3.2vw, 22px)',
                fontWeight: 700,
                color: '#F8FAFC',
                letterSpacing: '0.08em',
                userSelect: 'all',
              }}
            >
              {licenseData.licenseKey}
            </div>

            <button
              onClick={copyLicense}
              style={{
                background: copied ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${copied ? '#34D399' : BORDER}`,
                color: copied ? '#34D399' : '#FFFFFF',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: F,
                cursor: 'pointer',
                transition: '.15s',
              }}
            >
              {copied ? '✓ Copied' : 'Copy Key'}
            </button>
          </div>

          <div style={{ fontSize: 12.5, color: MUTED, marginTop: 14, lineHeight: 1.5 }}>
            💡 Keep this license key safe. You will enter this key when opening the Memento desktop app on Windows or macOS.
          </div>
        </div>

        {/* Download Section */}
        <div
          style={{
            background: '#0B111E',
            border: `1px solid ${BORDER}`,
            borderRadius: 20,
            padding: '32px',
            marginBottom: 36,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
              Download Memento Desktop App
            </div>
            <div style={{ fontSize: 13.5, color: TEXT2 }}>
              Install Memento on your computer and activate it with your license key.
            </div>
          </div>

          {downloadError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#FCA5A5',
                fontSize: 13.5,
                marginBottom: 16,
              }}
            >
              ⚠️ {downloadError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {/* Windows Download */}
            <div
              style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
                  Windows 10 / 11
                </div>
                <div style={{ fontSize: 12.5, color: MUTED }}>
                  Official .exe standalone installer · v1.0.2
                </div>
              </div>

              <button
                onClick={() => handleDownload('windows')}
                disabled={downloadingWin || downloadingMac || savingMementos}
                style={{
                  background: `linear-gradient(180deg, ${SKY_B}, ${SKY_MID})`,
                  color: '#04121C',
                  borderRadius: 10,
                  padding: '12px 18px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: downloadingWin || downloadingMac || savingMementos ? 'wait' : 'pointer',
                  opacity: downloadingWin || downloadingMac || savingMementos ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {downloadingWin ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(4,18,28,0.3)',
                        borderTopColor: '#04121C',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }}
                    />
                    <span>Preparing download…</span>
                  </>
                ) : savingMementos ? (
                  <span>Saving selection…</span>
                ) : (
                  'Download for Windows'
                )}
              </button>
            </div>

            {/* macOS Download */}
            <div
              style={{
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: 14,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
                  macOS (Apple Silicon & Intel)
                </div>
                <div style={{ fontSize: 12.5, color: MUTED }}>
                  Universal .dmg disk image · v1.0.2
                </div>
              </div>

              <button
                onClick={() => handleDownload('macos')}
                disabled={downloadingWin || downloadingMac || savingMementos}
                style={{
                  background: `linear-gradient(180deg, ${SKY_B}, ${SKY_MID})`,
                  color: '#04121C',
                  borderRadius: 10,
                  padding: '12px 18px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: downloadingWin || downloadingMac || savingMementos ? 'wait' : 'pointer',
                  opacity: downloadingWin || downloadingMac || savingMementos ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {downloadingMac ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(4,18,28,0.3)',
                        borderTopColor: '#04121C',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }}
                    />
                    <span>Preparing download…</span>
                  </>
                ) : savingMementos ? (
                  <span>Saving selection…</span>
                ) : (
                  'Download for macOS'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Choose your Mementos Selection (for Plan 1 and Plan 2) / All Unlocked (for Plan 3) */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 20,
            padding: '32px',
            marginBottom: 36,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>
                {isCompletePlan ? 'All Memento Collections Unlocked' : 'Choose Your Mementos'}
              </div>
              <div style={{ fontSize: 13.5, color: TEXT2 }}>
                {isCompletePlan
                  ? 'Your Memento Complete license grants unlimited access to all charms and future collections.'
                  : `Select up to ${maxMementos} Mementos to pair with your license.`}
              </div>
            </div>

            {!isCompletePlan && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {saveSuccess && (
                  <span
                    style={{
                      fontSize: 12.5,
                      color: '#34D399',
                      fontWeight: 600,
                      background: 'rgba(52,211,153,0.12)',
                      border: '1px solid rgba(52,211,153,0.3)',
                      padding: '4px 10px',
                      borderRadius: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>✓</span>
                    <span>{selectedMementos.length} Mementos paired with your license</span>
                  </span>
                )}
                {savingMementos && (
                  <span style={{ fontSize: 12, color: SKY_B, fontWeight: 600 }}>Saving selections…</span>
                )}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: selectedMementos.length === maxMementos ? SKY_B : TEXT2,
                    background: 'rgba(7,11,20,0.6)',
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    padding: '6px 12px',
                  }}
                >
                  {selectedMementos.length} of {maxMementos} selected
                </span>
              </div>
            )}
          </div>

          {/* Charms Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 16,
            }}
          >
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
                    borderRadius: 16,
                    padding: '24px 16px',
                    textAlign: 'center',
                    cursor: isCompletePlan ? 'default' : (disabled || savingMementos) ? 'not-allowed' : 'pointer',
                    opacity: (disabled || (savingMementos && !isSelected)) ? 0.45 : 1,
                    transition: '.18s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ width: 60, height: 60, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CharmArt id={ch.id} style={{ width: '100%', height: 'auto' }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? '#FFFFFF' : TEXT2 }}>
                    {ch.name}
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
                    {isSelected ? '✓ Chosen' : disabled ? 'Limit reached' : 'Click to choose'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Return Button */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              color: TEXT2,
              fontSize: 14,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            ← Return to Memento Home
          </Link>
        </div>
      </div>
    </div>
  )
}
