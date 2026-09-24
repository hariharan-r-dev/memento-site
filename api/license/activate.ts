import { getPlanConfig } from '../_utils/plans.js'
import { db } from '../_utils/supabase.js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }))
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const { licenseKey, deviceId, platform } = body

    if (!licenseKey || typeof licenseKey !== 'string') {
      res.statusCode = 400
      return res.end(JSON.stringify({ valid: false, error: 'License key is required' }))
    }

    const license = await db.getLicenseByKey(licenseKey)

    if (!license) {
      res.statusCode = 404
      return res.end(JSON.stringify({ valid: false, error: 'Invalid license key' }))
    }

    if (license.status !== 'active') {
      res.statusCode = 403
      return res.end(JSON.stringify({ valid: false, error: `License is ${license.status}` }))
    }

    // Record or update device activation
    if (deviceId) {
      await db.recordActivation(license.id, deviceId, platform || 'Unknown')
    }

    const planConfig = getPlanConfig(license.plan) || getPlanConfig('memento')!
    const ownedMementos = await db.getOwnedMementos(license.id)

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    return res.end(
      JSON.stringify({
        valid: true,
        licenseKey: license.license_key,
        plan: license.plan,
        planName: planConfig.name,
        entitlements: planConfig.entitlements,
        ownedMementos,
      })
    )
  } catch (err: any) {
    console.error('[API license-activate error]', err)
    res.statusCode = 500
    return res.end(JSON.stringify({ valid: false, error: 'Internal activation error' }))
  }
}
