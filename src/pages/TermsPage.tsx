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

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Memento Terms'
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'The terms governing the purchase and use of Memento for Windows and macOS.'
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
            Memento terms
            <span style={{ width: 16, height: 1.5, background: SKY, display: 'inline-block' }} />
          </div>

          <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 16px', lineHeight: 1.15 }}>
            One purchase. Your Memento.
          </h1>

          <p style={{ fontSize: 'clamp(16px,2vw,18.5px)', color: TEXT2, lineHeight: 1.7, maxWidth: 700, margin: '0 auto 24px', fontWeight: 400 }}>
            Memento is a desktop companion and collection of digital charms for Windows and macOS.
            These Terms explain the rules for purchasing and using Memento.
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
            By purchasing or using Memento, you agree to these Terms.
          </p>

          {/* Section 1 */}
          <section style={{ marginBottom: 52 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              1. Memento license
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              When you purchase Memento, you receive a personal license to use the software on supported devices that you own or are authorized to use.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              Your purchase does not transfer ownership of the Memento software itself.
            </p>
            <p style={{ margin: '0 0 10px' }}>You may not:</p>
            <ul style={{ paddingLeft: 22, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>resell Memento</li>
              <li>redistribute the application</li>
              <li>modify and redistribute the application</li>
              <li>reverse engineer it except where applicable law expressly permits it</li>
              <li>remove copyright or ownership notices</li>
              <li>use your purchase to provide unauthorized copies to others</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              2. One-time purchase
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              Memento is sold as a <strong>one-time purchase</strong>.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              There is no recurring subscription for the standard Memento purchase.
            </p>
            <p style={{ margin: 0 }}>
              Unless otherwise stated at checkout, your purchase gives you access to the version of Memento associated with that purchase and eligible future updates provided under the applicable product offering.
            </p>
          </section>

          {/* Section 3 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              3. Memento+
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              If you purchase Memento+, the additional features and collections included with Memento+ are those described on the Memento website or at checkout.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              Memento+ is also a <strong>one-time purchase</strong>.
            </p>
            <p style={{ margin: 0 }}>
              It does not automatically create a recurring subscription unless the checkout explicitly says otherwise.
            </p>
          </section>

          {/* Section 4 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              4. Custom Mementos
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              Memento may offer personalized or custom Mementos.
            </p>
            <p style={{ margin: '0 0 10px' }}>Custom Mementos may allow you to use your own:</p>
            <ul style={{ paddingLeft: 22, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>images</li>
              <li>artwork</li>
              <li>colors</li>
              <li>designs</li>
              <li>ideas</li>
            </ul>
            <p style={{ margin: '0 0 14px' }}>
              You are responsible for the material you provide.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              You must have the necessary rights or permission to use artwork, logos, characters, photographs, or other material that you submit.
            </p>
            <p style={{ margin: 0 }}>
              You may not use the customization feature to create unlawful, infringing, abusive, or otherwise prohibited content.
            </p>
          </section>

          {/* Section 5 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              5. Intellectual property
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              Memento, its software, branding, website, original artwork, interface, animations, and other original materials are owned by Memento or its licensors.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              Purchasing the application gives you a license to use the software. It does not give you ownership of Memento's underlying intellectual property.
            </p>
            <p style={{ margin: 0 }}>
              Third-party characters, brands, logos, or artwork remain the property of their respective owners.
            </p>
          </section>

          {/* Section 6 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              6. Updates
            </h2>
            <p style={{ margin: '0 0 10px' }}>We may release updates that include:</p>
            <ul style={{ paddingLeft: 22, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>new Mementos</li>
              <li>new collections</li>
              <li>bug fixes</li>
              <li>performance improvements</li>
              <li>security improvements</li>
              <li>new features</li>
            </ul>
            <p style={{ margin: '0 0 14px' }}>
              We may change, add, or remove features over time.
            </p>
            <p style={{ margin: 0 }}>
              We will make reasonable efforts to keep supported versions functional, but we do not promise that every historical version will remain compatible with future versions of Windows or macOS.
            </p>
          </section>

          {/* Section 7 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              7. Availability
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              We try to keep Memento and its download services available, but we cannot guarantee uninterrupted availability.
            </p>
            <p style={{ margin: '0 0 10px' }}>Temporary interruptions may occur because of:</p>
            <ul style={{ paddingLeft: 22, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>maintenance</li>
              <li>software updates</li>
              <li>hosting problems</li>
              <li>network failures</li>
              <li>third-party service failures</li>
              <li>circumstances outside our control</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <div style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.22)', borderRadius: 16, padding: '24px 28px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: SKY_B, letterSpacing: '-0.02em', margin: '0 0 12px' }}>
                8. No guarantee of luck
              </h2>
              <p style={{ margin: '0 0 12px', color: '#F8FAFC' }}>
                Memento is a digital desktop companion designed for enjoyment, collecting, decoration, and personalization.
              </p>
              <p style={{ margin: '0 0 10px', color: TEXT2 }}>
                Mementos do not guarantee:
              </p>
              <ul style={{ paddingLeft: 20, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 4, color: TEXT2 }}>
                <li>luck</li>
                <li>fortune</li>
                <li>protection</li>
                <li>success</li>
                <li>financial results</li>
                <li>safety</li>
                <li>any particular real-world outcome</li>
              </ul>
              <p style={{ margin: 0, fontStyle: 'italic', color: '#E2E8F0' }}>
                If you buy a lucky charm, enjoy the charm. The luck is up to you.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              9. Refunds
            </h2>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 24px' }}>
              <p style={{ margin: 0, color: '#F8FAFC', fontWeight: 600 }}>
                Purchases are <strong>non-refundable</strong> except where a refund is required by applicable law or expressly provided by Memento.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              10. Acceptable use
            </h2>
            <p style={{ margin: '0 0 10px' }}>You agree not to use Memento to:</p>
            <ul style={{ paddingLeft: 22, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>distribute unauthorized copies</li>
              <li>interfere with the software</li>
              <li>attempt to compromise its security</li>
              <li>distribute malware</li>
              <li>infringe another person's intellectual property</li>
              <li>use Memento for unlawful purposes</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              11. Disclaimer
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              Memento is provided on an "as is" and "as available" basis to the extent permitted by law.
            </p>
            <p style={{ margin: '0 0 10px' }}>
              We make reasonable efforts to keep Memento working properly, but we do not guarantee that:
            </p>
            <ul style={{ paddingLeft: 22, margin: '0 0 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>the software will always be error-free</li>
              <li>every feature will always be available</li>
              <li>Memento will work with every future operating-system version</li>
              <li>the website or download service will always be available</li>
            </ul>
            <p style={{ margin: 0 }}>
              Nothing in these Terms limits rights that cannot legally be limited under applicable law.
            </p>
          </section>

          {/* Section 12 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              12. Limitation of liability
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              To the maximum extent permitted by applicable law, Memento and its operators will not be responsible for indirect, incidental, special, consequential, or other losses arising from your use of the software.
            </p>
            <p style={{ margin: 0 }}>
              Nothing in these Terms excludes liability that cannot legally be excluded.
            </p>
          </section>

          {/* Section 13 */}
          <section style={{ marginBottom: 52, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              13. Changes to these terms
            </h2>
            <p style={{ margin: '0 0 14px' }}>
              We may update these Terms when Memento, its pricing, features, or services change.
            </p>
            <p style={{ margin: 0 }}>
              The latest version will always be published on this page.
            </p>
          </section>

          {/* Section 14 */}
          <section style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em', marginBottom: 18 }}>
              14. Contact
            </h2>
            <p style={{ margin: '0 0 16px' }}>
              Questions about Memento, purchases, or these Terms?
            </p>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 24px', fontSize: 15, lineHeight: 1.8 }}>
              <div><strong style={{ color: '#F8FAFC' }}>Product:</strong> {LEGAL_CONFIG.brandName}</div>
              <div><strong style={{ color: '#F8FAFC' }}>Contact Email:</strong> {LEGAL_CONFIG.supportEmail}</div>
            </div>
          </section>

        </article>
      </main>
    </div>
  )
}
