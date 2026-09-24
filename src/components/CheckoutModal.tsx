import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { initiateCheckout } from '../lib/razorpay'

const BG_OVERLAY = 'rgba(3, 7, 18, 0.82)'
const SURFACE    = '#111A2B'
const SKY        = '#38BDF8'
const SKY_MID    = '#0EA5E9'
const SKY_B      = '#7DD3FC'
const TEXT2      = '#94A3B8'
const MUTED      = '#64748B'
const BORDER     = 'rgba(148,163,184,0.16)'
const F          = "'Plus Jakarta Sans', system-ui, sans-serif"

export interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  initialPlan?: 'memento' | 'memento_custom' | 'memento_complete'
}

const PLAN_DATA = {
  memento: {
    id: 'memento',
    name: 'Memento',
    price: '₹289',
    tagline: 'Start your collection',
    features: [
      'Choose any 2 Mementos from available collections',
      'Desktop companion with physics',
      'Windows + macOS included',
      'Future standard updates',
    ],
  },
  memento_custom: {
    id: 'memento_custom',
    name: 'Memento Custom',
    price: '₹389',
    tagline: 'A little more personal',
    badge: 'Make it yours',
    features: [
      'Choose any 2 Mementos from available collections',
      'Personalized custom Memento creation',
      'Desktop companion with physics',
      'Windows + macOS included',
      'Future standard updates',
    ],
  },
  memento_complete: {
    id: 'memento_complete',
    name: 'Memento Complete',
    price: '₹549',
    tagline: 'The complete collection',
    badge: 'Collector',
    features: [
      'Access to all current Memento collections',
      'Personalized custom Memento creation',
      'Desktop companion with physics',
      'Windows + macOS included',
      'Future standard updates',
    ],
  },
}

export function CheckoutModal({ isOpen, onClose, initialPlan = 'memento' }: CheckoutModalProps) {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<'memento' | 'memento_custom' | 'memento_complete'>(initialPlan)
  const [email, setEmail] = useState('')
  const [loadingText, setLoadingText] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setSelectedPlan(initialPlan)
    setErrorMessage(null)
    setLoadingText(null)
  }, [initialPlan, isOpen])

  if (!isOpen) return null

  const plan = PLAN_DATA[selectedPlan] || PLAN_DATA.memento

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    initiateCheckout({
      plan: selectedPlan,
      email: cleanEmail,
      onLoading: status => setLoadingText(status),
      onSuccess: data => {
        setLoadingText(null)
        onClose()
        // Save verified license payload in session storage for immediate viewing
        try {
          sessionStorage.setItem('memento_last_purchase', JSON.stringify(data))
        } catch { /* ignore */ }
        navigate(`/success?key=${encodeURIComponent(data.licenseKey)}`)
      },
      onError: err => {
        setLoadingText(null)
        setErrorMessage(err)
      },
      onDismiss: () => {
        setLoadingText(null)
      },
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: BG_OVERLAY,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget && !loadingText) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: '#0B111E',
          border: `1px solid ${BORDER}`,
          borderRadius: 20,
          maxWidth: 480,
          width: '100%',
          overflow: 'hidden',
          fontFamily: F,
          color: '#F8FAFC',
          position: 'relative',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '22px 26px 18px',
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: SKY_B, marginBottom: 2 }}>
              SECURE CHECKOUT
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              Get {plan.name}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={!!loadingText}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${BORDER}`,
              color: TEXT2,
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loadingText ? 'not-allowed' : 'pointer',
              fontSize: 16,
              transition: '.15s',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 26px 28px' }}>
          {/* Plan Selector Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
            {(['memento', 'memento_custom', 'memento_complete'] as const).map(pKey => {
              const pItem = PLAN_DATA[pKey]
              const isSelected = selectedPlan === pKey
              return (
                <button
                  key={pKey}
                  type="button"
                  onClick={() => {
                    setSelectedPlan(pKey)
                    setErrorMessage(null)
                  }}
                  disabled={!!loadingText}
                  style={{
                    background: isSelected ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? SKY_MID : BORDER}`,
                    borderRadius: 12,
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: loadingText ? 'not-allowed' : 'pointer',
                    transition: '.18s',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#FFFFFF' : TEXT2 }}>
                    {pItem.name}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? SKY_B : '#FFFFFF', marginTop: 2 }}>
                    {pItem.price}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected Plan Summary Card */}
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: '16px 18px',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
                {plan.name}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC' }}>
                {plan.price}
                <span style={{ fontSize: 12, fontWeight: 500, color: MUTED, marginLeft: 4 }}>one-time</span>
              </div>
            </div>

            <div style={{ fontSize: 13, color: TEXT2, marginBottom: 12 }}>
              {plan.tagline}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {plan.features.map((feat, idx) => (
                <div key={idx} style={{ fontSize: 12.5, color: TEXT2, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: SKY, fontWeight: 700 }}>✓</span>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Email Input Field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: TEXT2, marginBottom: 8 }}>
              Email address for license delivery
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              disabled={!!loadingText}
              style={{
                width: '100%',
                background: 'rgba(7, 11, 20, 0.8)',
                border: `1px solid ${BORDER}`,
                borderRadius: 10,
                padding: '12px 14px',
                fontSize: 14,
                color: '#F8FAFC',
                fontFamily: F,
                outline: 'none',
                transition: 'border-color .15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = SKY_MID)}
              onBlur={e => (e.currentTarget.style.borderColor = BORDER)}
            />
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 6 }}>
              Your license key and download links will be linked to this email.
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#FCA5A5',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={!!loadingText}
            style={{
              width: '100%',
              background: `linear-gradient(180deg, ${SKY_B}, ${SKY_MID})`,
              color: '#04121C',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              fontFamily: F,
              fontWeight: 700,
              fontSize: 15,
              cursor: loadingText ? 'wait' : 'pointer',
              opacity: loadingText ? 0.75 : 1,
              transition: 'all .15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loadingText ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: '2px solid #04121C',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span>{loadingText}</span>
              </>
            ) : (
              <span>Pay {plan.price} · Instant Access</span>
            )}
          </button>

          {/* Trust Footnote */}
          <div
            style={{
              marginTop: 14,
              textAlign: 'center',
              fontSize: 12,
              color: MUTED,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>🔒 Encrypted 256-bit Razorpay Checkout</span>
            <span>·</span>
            <span>One-time purchase</span>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
