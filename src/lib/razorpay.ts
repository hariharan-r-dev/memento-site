/**
 * Client-side Razorpay checkout loader and handler
 */
import { trackPurchase } from './analytics'

let scriptPromise: Promise<boolean> | null = null

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if ((window as any).Razorpay) return Promise.resolve(true)

  if (!scriptPromise) {
    scriptPromise = new Promise(resolve => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK')
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  return scriptPromise
}

export type PlanId = 'memento_duo' | 'memento_four' | 'memento_complete'

export interface CheckoutParams {
  plan: string
  email: string
  onLoading?: (status: string) => void
  onSuccess: (data: any) => void
  onError: (error: string) => void
  onDismiss?: () => void
}

export async function initiateCheckout({
  plan,
  email,
  onLoading,
  onSuccess,
  onError,
  onDismiss,
}: CheckoutParams) {
  try {
    onLoading?.('Preparing secure checkout…')

    // 1. Load Razorpay script
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      onError('Payment gateway is currently unavailable. Please check your connection.')
      return
    }

    // 2. Call backend to create order
    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, email }),
    })

    if (!orderRes.ok) {
      const errData = await orderRes.json().catch(() => ({}))
      onError(errData.error || 'Failed to initiate checkout.')
      return
    }

    const orderData = await orderRes.json()

    // 3. Configure Razorpay options
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Memento',
      description: `${orderData.planName} — One-time purchase`,
      image: '/assets/charms/ferrari.png',
      order_id: orderData.orderId,
      prefill: {
        email: email,
      },
      theme: {
        color: '#0EA5E9',
        backdrop_color: '#070B14',
      },
      modal: {
        ondismiss: () => {
          onDismiss?.()
        },
        escape: true,
        backdropclose: false,
      },
      handler: async (response: {
        razorpay_payment_id: string
        razorpay_order_id: string
        razorpay_signature: string
      }) => {
        try {
          onLoading?.('Verifying your payment…')

          // 4. Server-side payment verification (Never trust frontend success alone)
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })

          if (!verifyRes.ok) {
            const verifyErr = await verifyRes.json().catch(() => ({}))
            onError(verifyErr.error || 'Payment verification failed. Please contact support.')
            return
          }

          const verifyData = await verifyRes.json()

          // Fire purchase event ONLY after server-side payment verification succeeds
          trackPurchase({
            transactionId: response.razorpay_payment_id || verifyData.licenseKey || response.razorpay_order_id,
            planId: verifyData.plan || plan,
            planName: verifyData.planName,
            value: verifyData.plan === 'memento_four' ? 649 : 349,
          })

          onSuccess(verifyData)
        } catch (err) {
          console.error('Verification error:', err)
          onError('Error verifying payment. If amount was deducted, please contact support.')
        }
      },
    }

    const rzp = new (window as any).Razorpay(options)

    rzp.on('payment.failed', (response: any) => {
      console.error('Payment failed:', response.error)
      onError(response.error?.description || 'Payment was unsuccessful. Please try again.')
    })

    rzp.open()
  } catch (err: any) {
    console.error('Checkout error:', err)
    onError(err.message || 'An unexpected error occurred during checkout.')
  }
}
