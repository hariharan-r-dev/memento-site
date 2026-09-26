import type { IncomingMessage, ServerResponse } from 'http'
import { getPlanConfig } from './_utils/plans.js'
import { createRazorpayOrder } from './_utils/razorpay.js'
import { db } from './_utils/supabase.js'
import { loadEnvFiles } from './_utils/env.js'

function getSupabaseKeyRole(key?: string): string {
  if (!key) return 'missing'
  try {
    const parts = key.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
      return payload.role || 'unknown_jwt'
    }
    return 'non_jwt_format'
  } catch {
    return 'invalid_format'
  }
}

export default async function handler(req: any, res: any) {
  loadEnvFiles()
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }))
  }

  let currentStep = 'parsing_request'

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

    if (planConfig.id === 'memento_complete') {
      res.statusCode = 400
      return res.end(
        JSON.stringify({
          error: 'Memento Complete is coming soon and currently unavailable for new purchases.',
        })
      )
    }

    // Amount is determined strictly SERVER-SIDE
    const amount = planConfig.amount
    const currency = planConfig.currency || 'INR'

    currentStep = 'creating_razorpay_order'
    const order = await createRazorpayOrder({
      amount,
      currency,
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: {
        plan: planConfig.id,
        email: email.trim().toLowerCase(),
      },
    })

    currentStep = 'saving_supabase_pending_purchase'
    // Store pending purchase in Supabase
    await db.savePendingPurchase({
      email: email.trim().toLowerCase(),
      plan: planConfig.id,
      amount,
      currency,
      razorpay_order_id: order.id,
    })

    currentStep = 'finalizing_response'
    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'

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
    const diagnostics = {
      failedStep: currentStep,
      errorMessage: err.message || err.error?.description || String(err),
      errorCode: err.code || err.statusCode || err.error?.code || 'UNKNOWN',
      errorDetails: err.details || null,
      errorHint: err.hint || null,
      hasRazorpayKeyId: Boolean(process.env.RAZORPAY_KEY_ID),
      hasRazorpaySecret: Boolean(process.env.RAZORPAY_KEY_SECRET),
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
      supabaseKeyRole: getSupabaseKeyRole(process.env.SUPABASE_SERVICE_ROLE_KEY),
    }

    console.error('[API create-order error]', diagnostics, err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    return res.end(
      JSON.stringify({
        error: 'Failed to create payment order. Please try again.',
        diagnostics,
      })
    )
  }
}
