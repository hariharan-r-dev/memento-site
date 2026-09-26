import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { loadEnvFiles } from './env.js'

let supabaseInstance: SupabaseClient | null = null

export function getRequiredSupabaseClient(): SupabaseClient {
  loadEnvFiles()
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured for this environment. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return supabaseInstance
}

export function getSupabaseServerClient(): SupabaseClient | null {
  try {
    return getRequiredSupabaseClient()
  } catch {
    return null
  }
}

export const db = {
  async savePendingPurchase(purchase: {
    email: string
    plan: string
    amount: number
    currency: string
    razorpay_order_id: string
  }) {
    const supabase = getRequiredSupabaseClient()
    const { data, error } = await supabase
      .from('purchases')
      .insert({
        email: purchase.email,
        plan: purchase.plan,
        amount: purchase.amount,
        currency: purchase.currency,
        razorpay_order_id: purchase.razorpay_order_id,
        status: 'pending',
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getPurchaseByOrderId(orderId: string) {
    const supabase = getRequiredSupabaseClient()
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async getPurchaseById(purchaseId: string) {
    const supabase = getRequiredSupabaseClient()
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async markPurchasePaid(params: {
    orderId: string
    paymentId: string
    signature: string
  }) {
    const supabase = getRequiredSupabaseClient()
    const paidAt = new Date().toISOString()
    const { data, error } = await supabase
      .from('purchases')
      .update({
        status: 'paid',
        razorpay_payment_id: params.paymentId,
        razorpay_signature: params.signature,
        paid_at: paidAt,
      })
      .eq('razorpay_order_id', params.orderId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async createOrGetLicense(purchase: {
    id: string
    email: string
    plan: string
  }, licenseKey: string) {
    const supabase = getRequiredSupabaseClient()
    // Check if license already exists for this purchase (idempotency)
    const { data: existing } = await supabase
      .from('licenses')
      .select('*')
      .eq('purchase_id', purchase.id)
      .single()

    if (existing) return existing

    const { data, error } = await supabase
      .from('licenses')
      .insert({
        purchase_id: purchase.id,
        email: purchase.email,
        plan: purchase.plan,
        license_key: licenseKey,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getLicenseByKey(licenseKey: string) {
    const cleanKey = licenseKey.trim().toUpperCase()
    const supabase = getRequiredSupabaseClient()
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', cleanKey)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async getOwnedMementos(licenseId: string): Promise<string[]> {
    const supabase = getRequiredSupabaseClient()
    const { data, error } = await supabase
      .from('owned_mementos')
      .select('memento_id')
      .eq('license_id', licenseId)
    if (error) throw error
    return (data || []).map((r: { memento_id: string }) => r.memento_id)
  },

  async saveOwnedMementos(licenseId: string, mementoIds: string[]): Promise<string[]> {
    const supabase = getRequiredSupabaseClient()
    if (mementoIds.length === 0) {
      const { error: delErr } = await supabase
        .from('owned_mementos')
        .delete()
        .eq('license_id', licenseId)
      if (delErr) throw delErr
      return []
    }

    // 1. Delete existing selections for this license that are not in the new selection list
    const { error: delErr } = await supabase
      .from('owned_mementos')
      .delete()
      .eq('license_id', licenseId)
      .not('memento_id', 'in', `(${mementoIds.join(',')})`)
    if (delErr) throw delErr

    // 2. Insert/upsert selected mementos idempotently using unique constraint (license_id, memento_id)
    const rows = mementoIds.map(id => ({ license_id: licenseId, memento_id: id }))
    const { error: upsertErr } = await supabase
      .from('owned_mementos')
      .upsert(rows, { onConflict: 'license_id,memento_id', ignoreDuplicates: true })

    // If a concurrent transaction already inserted the same row (code 23505), treat as idempotent success
    if (upsertErr && (upsertErr as any).code !== '23505') {
      throw upsertErr
    }

    return mementoIds
  },

  async recordActivation(licenseId: string, deviceId: string, platform: string) {
    const supabase = getRequiredSupabaseClient()
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('license_activations')
      .upsert({
        license_id: licenseId,
        device_id: deviceId,
        platform: platform || 'Unknown',
        last_seen_at: now,
        status: 'active',
      }, { onConflict: 'license_id,device_id' })
      .select()
      .single()
    if (error) throw error
    return data
  },
}
