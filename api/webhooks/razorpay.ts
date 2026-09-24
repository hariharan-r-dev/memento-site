import { verifyWebhookSignature } from '../_utils/razorpay'
import { generateLicenseKey } from '../_utils/license'
import { db } from '../_utils/supabase'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }))
  }

  try {
    const signature = req.headers['x-razorpay-signature']
    if (!signature || typeof signature !== 'string') {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'Missing webhook signature' }))
    }

    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const isValid = verifyWebhookSignature(rawBody, signature)

    if (!isValid) {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'Invalid webhook signature' }))
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const event = payload.event

    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity
      const orderId = paymentEntity?.order_id || payload.payload?.order?.entity?.id

      if (orderId) {
        let purchase = await db.getPurchaseByOrderId(orderId)
        if (purchase && purchase.status !== 'paid') {
          purchase = await db.markPurchasePaid({
            orderId,
            paymentId: paymentEntity?.id || 'webhook_captured',
            signature: signature,
          })
          const newKey = generateLicenseKey()
          await db.createOrGetLicense(purchase, newKey)
        }
      }
    }

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    return res.end(JSON.stringify({ status: 'ok', received: true }))
  } catch (err: any) {
    console.error('[API Razorpay Webhook error]', err)
    res.statusCode = 500
    return res.end(JSON.stringify({ error: 'Webhook processing error' }))
  }
}
