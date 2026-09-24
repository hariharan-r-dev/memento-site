import crypto from 'crypto'
import Razorpay from 'razorpay'
import { loadEnvFiles } from './env'

let razorpayInstance: Razorpay | null = null

export function getRazorpayClient(): Razorpay | null {
  loadEnvFiles()
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    return null
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  }

  return razorpayInstance
}

export async function createRazorpayOrder(params: {
  amount: number // in paise
  currency: string
  receipt: string
  notes?: Record<string, string>
}): Promise<{ id: string; amount: number; currency: string }> {
  const client = getRazorpayClient()

  if (client) {
    const order = await client.orders.create({
      amount: params.amount,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes,
    })
    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    }
  }

  // Local test order generator if keys are pending in development
  const dummyId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  return {
    id: dummyId,
    amount: params.amount,
    currency: params.currency || 'INR',
  }
}

export function verifyPaymentSignature(params: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  loadEnvFiles()
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  // In test mode without secret key configured
  if (!keySecret) {
    console.warn('[MEMENTO RAZORPAY] RAZORPAY_KEY_SECRET not set. Allowing test payment verification.')
    return Boolean(params.orderId && params.paymentId && params.signature)
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex')

  if (!params.signature || generatedSignature.length !== params.signature.length) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, 'utf-8'),
    Buffer.from(params.signature, 'utf-8')
  )
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  loadEnvFiles()
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.warn('[MEMENTO WEBHOOK] RAZORPAY_WEBHOOK_SECRET not set.')
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')

  if (!signature || expectedSignature.length !== signature.length) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf-8'),
    Buffer.from(signature, 'utf-8')
  )
}
