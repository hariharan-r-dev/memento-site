/**
 * Google Analytics 4 Helper for Memento
 * Measurement ID: G-LM320S7RDS
 *
 * All functions are safely wrapped in try/catch and never block
 * payment, licensing, download, or UI interactions.
 */

export const GA_MEASUREMENT_ID = 'G-LM320S7RDS'

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
 * Safe wrapper around window.gtag
 */
export function gtagSafe(...args: any[]) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag(...args)
    }
  } catch (err) {
    // Non-blocking: analytics failures must never interrupt application execution
    console.warn('[Analytics non-blocking error]', err)
  }
}

/**
 * Track SPA Page View on React Router navigation
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  try {
    gtagSafe('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || (typeof document !== 'undefined' ? document.title : ''),
    })
  } catch (err) {
    console.warn('[Analytics trackPageView error]', err)
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

/**
 * Track authorized Windows download
 */
export function trackDownloadClicked(params: {
  platform: 'windows' | 'macos'
  plan?: string
}) {
  try {
    gtagSafe('event', 'download_clicked', {
      platform: params.platform,
      plan: params.plan || 'memento',
    })
  } catch (err) {
    console.warn('[Analytics trackDownloadClicked error]', err)
  }
}
