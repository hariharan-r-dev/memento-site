import { useEffect } from 'react'
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

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Memento Privacy Policy'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Learn how Memento handles information across the Memento desktop app and website.'
      )
    }
  }, [])

  return (
    <div style={{ background: BG, color: '#F8FAFC', minHeight: '100vh', fontFamily: F }}>
      {/* ── Editorial Legal Hero ── */}
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
        {/* Subtle Decorative Grid Pattern */}
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

        {/* Subtle Sky-Blue Decorative Framing Accents */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 40,
            left: '8%',
            width: 44,
            height: 44,
            background: 'rgba(56,189,248,0.06)',
            border: '1px solid rgba(56,189,248,0.16)',
            borderRadius: 8,
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 30,
            right: '10%',
            width: 56,
            height: 56,
            background: 'rgba(14,165,233,0.05)',
            border: '1px solid rgba(14,165,233,0.14)',
            borderRadius: 12,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: SKY_B, fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', marginBottom: 16 }}>
            <span style={{ width: 16, height: 1.5, background: SKY, display: 'inline-block' }} />
            Memento privacy
            <span style={{ width: 16, height: 1.5, background: SKY, display: 'inline-block' }} />
          </div>

          <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.15 }}>
            Little things worth keeping. Your data too.
          </h1>

          <p style={{ fontSize: 'clamp(16px,2vw,18.5px)', color: TEXT2, lineHeight: 1.7, maxWidth: 700, margin: '0 auto 24px', fontWeight: 400 }}>
            Memento is a desktop companion made to live on your screen.
            We designed the app to keep your Mementos, settings, and personal creations on your device wherever possible. We don't need to know what you're doing on your computer for a charm to hang from your desktop.
          </p>

          <div style={{ display: 'inline-block', background: 'rgba(148,163,184,0.08)', border: `1px solid ${BORDER}`, borderRadius: 999, padding: '6px 18px', fontSize: 13, color: MUTED }}>
            Last updated: <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{LEGAL_CONFIG.lastUpdated}</span>
          </div>
        </div>
      </header>

      {/* ── Document Body ── */}
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '64px clamp(20px,5vw,48px) 120px' }}>
        <article style={{ fontSize: 'clamp(16px,1.5vw,17.5px)', lineHeight: 1.78, color: TEXT2 }}>
          
          <p style={{ fontSize: 18, color: '#E2E8F0', marginBottom: 44, lineHeight: 1.7 }}>
            This Privacy Policy explains what information Memento may collect through the app and website, why we use it, and what we don't collect.
          </p>

          {/* Section 1 */}
          <section style={{ marginBottom: 52 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 20 }}>
              1. What Memento collects
            </h2>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: SKY_B, margin: '0 0 12px' }}>
              The Memento app
            </h3>
            <p style={{ margin: '0 0 14px' }}>
              Memento is designed to work primarily on your computer.
            </p>
            <p style={{ margin: '0 0 10px' }}>Your:</p>
            <ul style={{ paddingLeft: 22, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>selected Mementos</li>
              <li>Memento collection</li>
              <li>charm position and settings</li>
              <li>rope settings</li>
              <li>charm size</li>
              <li>customization preferences</li>
              <li>locally created Mementos</li>
            </ul>
            <p style={{ margin: '0 0 24px' }}>
              are stored locally by the application unless a specific feature explicitly requires otherwise.
            </p>
            <p style={{ margin: '0 0 28px' }}>
              Memento does not need access to the contents of your other applications, documents, or files to provide its core desktop companion functionality.
            </p>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: SKY_B, margin: '0 0 12px' }}>
              Your custom Mementos
            </h3>
            <p style={{ margin: '0 0 14px' }}>
              If you create a custom Memento, the artwork and customization information are intended to remain on your device.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              Memento does not need to upload your personal artwork simply for you to use it as a desktop charm.
            </p>
            <p style={{ margin: 0 }}>
              If a future feature requires an upload or cloud service, we will explain what is being sent before that feature is used.
            </p>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              2. Website
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              Our website may receive limited information when you visit it.
            </p>
            <p style={{ margin: '0 0 10px' }}>
              Depending on the services currently enabled on the website, this may include:
            </p>
            <ul style={{ paddingLeft: 22, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>basic technical information required to serve the website</li>
              <li>website analytics</li>
              <li>information associated with a purchase</li>
              <li>information you voluntarily provide to us</li>
            </ul>
            <p style={{ margin: 0 }}>
              We do not use your website visit to inspect your desktop, your Memento collection, or the contents of your computer.
            </p>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              3. Purchases
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              Memento is sold as a <strong>one-time purchase</strong>.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              When you purchase Memento, payment information is processed by our payment provider (<span style={{ color: SKY_B }}>{LEGAL_CONFIG.paymentProvider}</span>).
            </p>
            <p style={{ margin: '0 0 14px' }}>
              We do not need to store your complete card number or payment credentials on our own servers.
            </p>
            <p style={{ margin: '0 0 10px' }}>
              The payment provider may process information such as:
            </p>
            <ul style={{ paddingLeft: 22, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>name</li>
              <li>email address</li>
              <li>billing information</li>
              <li>payment information</li>
              <li>transaction information</li>
            </ul>
            <p style={{ margin: 0 }}>
              according to its own privacy policy.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <div style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.20)', borderRadius: 16, padding: '28px 30px' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: SKY_B, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                4. What we don't collect
              </h2>
              <p style={{ margin: '0 0 12px', color: '#F8FAFC', fontWeight: 600 }}>
                Memento does not need to know:
              </p>
              <ul style={{ paddingLeft: 20, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 6, color: TEXT2 }}>
                <li>what applications you use</li>
                <li>what websites you visit</li>
                <li>what is displayed on your screen</li>
                <li>what you type</li>
                <li>your keystrokes</li>
                <li>the contents of your files</li>
                <li>your private documents</li>
                <li>your passwords</li>
                <li>your desktop activity</li>
                <li>where you place your Mementos</li>
              </ul>
              <p style={{ margin: 0, color: '#E2E8F0', fontWeight: 600 }}>
                We don't use the app to monitor what you do on your computer.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              5. Analytics
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              The Memento <strong>website</strong> uses Google Analytics 4 (GA4).
            </p>
            <p style={{ margin: '0 0 14px' }}>
              GA4 is used to understand how visitors use the website and to improve the website experience.
            </p>
            <p style={{ margin: '0 0 10px' }}>
              Website analytics may involve information such as:
            </p>
            <ul style={{ paddingLeft: 22, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>pages visited</li>
              <li>interactions with the website</li>
              <li>technical/device information</li>
              <li>traffic/referral information</li>
              <li>general website usage information</li>
            </ul>
            <p style={{ margin: '0 0 14px', color: '#F8FAFC', fontWeight: 600 }}>
              This applies strictly to the website.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              The Memento desktop application currently does <strong>not</strong> use in-app analytics or telemetry.
            </p>
            <p style={{ margin: 0, fontSize: 15 }}>
              For more information on Google's privacy practices, refer to <span style={{ color: SKY, textDecoration: 'underline' }}>[Google Analytics privacy information]</span>.
            </p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              6. Updates
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              Memento may check whether a newer version of the application is available.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              The update system may make a request to our update server to determine whether a newer release exists.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              The update request is used to deliver software updates and security fixes.
            </p>
            <p style={{ margin: 0 }}>
              We do not use the update mechanism to inspect your Memento collection or desktop activity.
            </p>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              7. Your information
            </h2>
            <p style={{ margin: '0 0 10px' }}>
              If you contact us, we will receive the information you choose to provide, such as your:
            </p>
            <ul style={{ paddingLeft: 22, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>name</li>
              <li>email address</li>
              <li>message</li>
              <li>purchase information, if relevant to your request</li>
            </ul>
            <p style={{ margin: '0 0 14px' }}>
              We use this information to respond to you and provide customer support.
            </p>
            <p style={{ margin: 0, color: '#F8FAFC', fontWeight: 600 }}>
              We don't sell your personal information.
            </p>
          </section>

          {/* Section 8 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              8. Third-party services
            </h2>
            <p style={{ margin: '0 0 10px' }}>
              Memento may rely on third-party services for things such as:
            </p>
            <ul style={{ paddingLeft: 22, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>payment processing (<span style={{ color: SKY_B }}>{LEGAL_CONFIG.paymentProvider}</span>)</li>
              <li>website hosting</li>
              <li>email</li>
              <li>analytics (Google Analytics 4 for website)</li>
              <li>software distribution</li>
              <li>update delivery</li>
            </ul>
            <p style={{ margin: 0 }}>
              Those services process information according to their own policies and only receive information necessary for the service they provide.
            </p>
          </section>

          {/* Section 9 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              9. Children's privacy
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              Memento is not designed specifically for children.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              We do not knowingly collect personal information from children through the Memento app.
            </p>
            <p style={{ margin: 0 }}>
              If you believe a child has provided personal information to us, contact us and we will review the request.
            </p>
          </section>

          {/* Section 10 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              10. Changes to this policy
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              We may update this Privacy Policy when Memento's features or services change.
            </p>
            <p style={{ margin: 0 }}>
              When we make changes, we will update the date at the top of this page.
            </p>
          </section>

          {/* Section 11 */}
          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              11. Contact
            </h2>
            <p style={{ margin: '0 0 16px' }}>
              Questions about privacy?
            </p>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 24px', fontSize: 15, lineHeight: 1.8 }}>
              <div><strong style={{ color: '#F8FAFC' }}>Product:</strong> {LEGAL_CONFIG.brandName}</div>
              <div>
                <strong style={{ color: '#F8FAFC' }}>Support:</strong>{' '}
                <a
                  href={`mailto:${LEGAL_CONFIG.supportEmail}`}
                  style={{ color: SKY, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {LEGAL_CONFIG.supportEmail}
                </a>
              </div>
            </div>
          </section>

        </article>
      </main>
    </div>
  )
}
