import { getPlanConfig, isValidMementoId } from '../_utils/plans.js'
import { db } from '../_utils/supabase.js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }))
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const { licenseKey, mementoIds } = body

    if (!licenseKey || typeof licenseKey !== 'string') {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'License key is required' }))
    }

    if (!Array.isArray(mementoIds)) {
      res.statusCode = 400
      return res.end(JSON.stringify({ error: 'mementoIds must be an array' }))
    }

    // Validate that all submitted IDs belong to the official registered Memento list
    const invalidIds = mementoIds.filter(id => typeof id !== 'string' || !isValidMementoId(id))
    if (invalidIds.length > 0) {
      res.statusCode = 400
      return res.end(
        JSON.stringify({
          error: `Invalid Memento ID(s): ${invalidIds.join(', ')}.`,
        })
      )
    }

    // Deduplicate while preserving order
    const sanitizedIds = Array.from(new Set(mementoIds))

    const license = await db.getLicenseByKey(licenseKey)

    if (!license) {
      res.statusCode = 404
      return res.end(JSON.stringify({ error: 'Invalid license key' }))
    }

    if (license.status !== 'active') {
      res.statusCode = 403
      return res.end(JSON.stringify({ error: 'License is not active' }))
    }

    const planConfig = getPlanConfig(license.plan) || getPlanConfig('memento')!
    const maxAllowed = planConfig.entitlements.maxMementos

    // Server-side enforcement of maximum allowed Mementos
    if (maxAllowed !== null && sanitizedIds.length > maxAllowed) {
      res.statusCode = 400
      return res.end(
        JSON.stringify({
          error: `Your ${planConfig.name} plan allows choosing a maximum of ${maxAllowed} Mementos.`,
        })
      )
    }

    const updated = await db.saveOwnedMementos(license.id, sanitizedIds)

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    return res.end(
      JSON.stringify({
        success: true,
        licenseKey: license.license_key,
        plan: license.plan,
        ownedMementos: updated,
      })
    )
  } catch (err: any) {
    console.error('[API license-mementos error]', err)
    res.statusCode = 500
    return res.end(JSON.stringify({ error: 'Failed to update selected Mementos' }))
  }
}
