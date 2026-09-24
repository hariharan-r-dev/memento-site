import { getPlanConfig, getDownloadUrls } from './_utils/plans'
import { verifyPaymentSignature } from './_utils/razorpay'
import { generateLicenseKey } from './_utils/license'
import { db } from './_utils/supabase'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }))
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'Missing required payment verification parameters' }))
    }

    // 1. Verify Razorpay cryptographic signature
    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })

    if (!isValid) {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'Payment signature verification failed' }))
    }

    // 2. Fetch purchase record from database
    let purchase = await db.getPurchaseByOrderId(razorpay_order_id)
    if (!purchase) {
      res.statusCode = 404
      return res.end(JSON.stringify({ error: 'Order not found' }))
    }

    // 3. Mark purchase as paid (idempotent)
    purchase = await db.markPurchasePaid({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })

    // 4. Generate & store license (idempotent: reuse existing if already fulfilled)
    const newKey = generateLicenseKey()
    const license = await db.createOrGetLicense(purchase, newKey)

    // 5. Get plan entitlements and download links
    const planConfig = getPlanConfig(purchase.plan) || getPlanConfig('memento')!
    const ownedMementos = await db.getOwnedMementos(license.id)
    const downloads = getDownloadUrls()

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    return res.end(
      JSON.stringify({
        success: true,
        licenseKey: license.license_key,
        plan: purchase.plan,
        planName: planConfig.name,
        email: purchase.email,
        entitlements: planConfig.entitlements,
        ownedMementos,
        downloads,
        paidAt: purchase.paid_at || new Date().toISOString(),
      })
    )
  } catch (err: any) {
    console.error('[API verify-payment error]', err)
    res.statusCode = 500
    return res.end(JSON.stringify({ error: 'Payment verification error. Please contact support.' }))
  }
}
