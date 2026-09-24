import type { IncomingMessage, ServerResponse } from 'http'
import { getPlanConfig } from './_utils/plans'
import { createRazorpayOrder } from './_utils/razorpay'
import { db } from './_utils/supabase'
import { loadEnvFiles } from './_utils/env'

export default async function handler(req: any, res: any) {
  loadEnvFiles()
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }))
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const { plan, email } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'Valid email address is required' }))
    }

    if (!plan || typeof plan !== 'string') {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'Plan identifier is required' }))
    }

    const planConfig = getPlanConfig(plan)
    if (!planConfig) {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'Invalid plan selected' }))
    }

    // Amount is determined strictly SERVER-SIDE
    const amount = planConfig.amount
    const currency = planConfig.currency || 'INR'

    const order = await createRazorpayOrder({
      amount,
      currency,
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: {
        plan: planConfig.id,
        email: email.trim().toLowerCase(),
      },
    })

    // Store pending purchase in Supabase
    await db.savePendingPurchase({
      email: email.trim().toLowerCase(),
      plan: planConfig.id,
      amount,
      currency,
      razorpay_order_id: order.id,
    })

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder'

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    return res.end(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
        plan: planConfig.id,
        planName: planConfig.name,
        email: email.trim().toLowerCase(),
      })
    )
  } catch (err: any) {
    console.error('[API create-order error]', err)
    res.statusCode = 500
    return res.end(JSON.stringify({ error: 'Failed to create payment order. Please try again.' }))
  }
}
