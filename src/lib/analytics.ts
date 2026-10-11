/**
 * Google Analytics 4 Helper for Memento
 * Measurement ID: Configured via VITE_GA_MEASUREMENT_ID or fallback G-LM320S7RDS
 *
 * All functions are safely wrapped in try/catch and never block
 * payment, licensing, download, or UI interactions.
 */

export const GA_MEASUREMENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GA_MEASUREMENT_ID) ||
  'G-LM320S7RDS'

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

/**
 * Plan metadata for analytics tracking
 */
export const ANALYTICS_PLANS: Record<
  string,
  { id: string; name: string; value: number }
> = {
  memento_duo: {
    id: 'memento_duo',
    name: 'Memento Duo',
    value: 349,
  },
  memento_four: {
    id: 'memento_four',
    name: 'Memento Four',
    value: 649,
  },
  memento_complete: {
    id: 'memento_complete',
    name: 'Memento Complete',
    value: 949,
  },
}

/**
 * Safe wrapper around window.gtag - never throws or blocks UI
 */
export function gtagSafe(...args: any[]) {
  try {
    if (typeof window === 'undefined') return
    if (typeof window.gtag === 'function') {
      window.gtag(...args)
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(args)
    }
  } catch (err) {
    // Non-blocking: analytics failures must never interrupt application execution
    console.warn('[Analytics non-blocking error]', err)
  }
}

let lastTrackedPath = ''

/**
 * Track SPA Page View on React Router navigation
 * Guards against duplicate page views
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  try {
    if (!pagePath || pagePath === lastTrackedPath) return
    lastTrackedPath = pagePath

    gtagSafe('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || (typeof document !== 'undefined' ? document.title : ''),
    })
  } catch (err) {
    console.warn('[Analytics trackPageView error]', err)
  }
}

export interface DownloadClickParams {
  platform: 'windows' | 'macos'
  release_version?: string
  download_source?: string
  link_destination?: string
  plan?: string
}

/**
 * Track Download button clicks with non-personal context
 */
export function trackDownloadClick(params: DownloadClickParams) {
  try {
    gtagSafe('event', 'download_click', {
      platform: params.platform,
      release_version: params.release_version || 'v1.0.2',
      download_source: params.download_source || 'website',
      link_destination: params.link_destination || 'github',
    })

    // Also send legacy event name for backward-compatibility with existing custom reports
    gtagSafe('event', 'download_clicked', {
      platform: params.platform,
      plan: params.plan || 'free',
      release_version: params.release_version || 'v1.0.2',
    })
  } catch (err) {
    console.warn('[Analytics trackDownloadClick error]', err)
  }
}

/** Backward-compatibility alias */
export const trackDownloadClicked = trackDownloadClick

export interface GithubRedirectParams {
  platform: 'windows' | 'macos'
  release_version?: string
  download_source?: string
  link_destination?: string
  url?: string
}

/**
 * Track when website initiates actual navigation or redirection to GitHub Releases
 */
export function trackGithubRedirect(params: GithubRedirectParams) {
  try {
    gtagSafe('event', 'github_redirect', {
      platform: params.platform,
      release_version: params.release_version || 'v1.0.2',
      download_source: params.download_source || 'website',
      link_destination: params.link_destination || 'github',
      redirect_url: params.url || '',
    })
  } catch (err) {
    console.warn('[Analytics trackGithubRedirect error]', err)
  }
}

export interface NewsletterSignupParams {
  source?: string
}

/**
 * Track newsletter signup event if form submitted (strictly no PII)
 */
export function trackNewsletterSignup(params?: NewsletterSignupParams) {
  try {
    gtagSafe('event', 'newsletter_signup', {
      signup_source: params?.source || 'website',
    })
  } catch (err) {
    console.warn('[Analytics trackNewsletterSignup error]', err)
  }
}

/**
 * Track when checkout modal is opened
 */
export function trackCheckoutStarted(planId: string) {
  try {
    const plan = ANALYTICS_PLANS[planId] || ANALYTICS_PLANS.memento_duo
    gtagSafe('event', 'checkout_started', {
      plan: plan.id,
      plan_name: plan.name,
      value: plan.value,
      currency: 'INR',
    })
  } catch (err) {
    console.warn('[Analytics trackCheckoutStarted error]', err)
  }
}

/**
 * Track when a plan (Duo or Four) is selected
 */
export function trackPlanSelected(planId: string) {
  try {
    const plan = ANALYTICS_PLANS[planId]
    if (!plan) return

    gtagSafe('event', 'plan_selected', {
      plan: plan.id,
      plan_name: plan.name,
      value: plan.value,
      currency: 'INR',
    })
  } catch (err) {
    console.warn('[Analytics trackPlanSelected error]', err)
  }
}

/**
 * Session-level / memory guard to prevent duplicate purchase events
 */
const trackedPurchases = new Set<string>()

function isPurchaseTracked(transactionId: string): boolean {
  if (trackedPurchases.has(transactionId)) return true
  try {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem(`ga_purchase_${transactionId}`)
      if (stored === 'true') return true
    }
  } catch {
    /* ignore storage errors */
  }
  return false
}

function markPurchaseTracked(transactionId: string) {
  trackedPurchases.add(transactionId)
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(`ga_purchase_${transactionId}`, 'true')
    }
  } catch {
    /* ignore storage errors */
  }
}

/**
 * Track Purchase event
 * MUST ONLY fire after /api/verify-payment succeeds.
 * Complete (Coming Soon) is strictly prohibited from generating purchase events.
 */
export function trackPurchase(params: {
  transactionId: string
  planId: string
  planName?: string
  value?: number
}) {
  try {
    const { transactionId, planId } = params

    if (!transactionId) {
      console.warn('[Analytics trackPurchase] Missing transactionId, aborting.')
      return
    }

    // Memento Complete is Coming Soon and must NOT generate purchase events
    if (planId === 'memento_complete') {
      console.warn('[Analytics trackPurchase] Complete plan cannot generate purchase events.')
      return
    }

    // Deduplication guard
    if (isPurchaseTracked(transactionId)) {
      return
    }

    const planMeta = ANALYTICS_PLANS[planId] || ANALYTICS_PLANS.memento_duo
    const finalValue = typeof params.value === 'number' ? params.value : planMeta.value
    const finalPlanName = params.planName || planMeta.name

    gtagSafe('event', 'purchase', {
      transaction_id: transactionId,
      value: finalValue,
      currency: 'INR',
      items: [
        {
          item_id: planMeta.id,
          item_name: finalPlanName,
          price: finalValue,
          quantity: 1,
        },
      ],
    })

    markPurchaseTracked(transactionId)
  } catch (err) {
    console.warn('[Analytics trackPurchase error]', err)
  }
}
