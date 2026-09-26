import { getPlanConfig, getDownloadUrls, getAllRegisteredMementoIds } from '../_utils/plans.js'
import { db } from '../_utils/supabase.js'

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.statusCode = 200
    return res.end()
  }

  if (req.method !== 'GET') {
    res.statusCode = 405
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }))
  }

  try {
    const url = new URL(req.url || '', 'http://localhost')
    const key = url.searchParams.get('key') || (req.query && req.query.key)

    if (!key || typeof key !== 'string') {
      res.statusCode = 400
      return res.end(JSON.stringify({ valid: false, error: 'License key is required' }))
    }

    const license = await db.getLicenseByKey(key)

    if (!license) {
      res.statusCode = 404
      return res.end(JSON.stringify({ valid: false, error: 'License key not found' }))
    }

    const planConfig = getPlanConfig(license.plan) || getPlanConfig('memento')!
    let ownedMementos: string[]

    if (planConfig.entitlements.allCollections) {
      ownedMementos = getAllRegisteredMementoIds()
    } else {
      ownedMementos = await db.getOwnedMementos(license.id)
    }
    const downloads = getDownloadUrls()

    res.setHeader('Content-Type', 'application/json')
    res.statusCode = 200
    return res.end(
      JSON.stringify({
        valid: license.status === 'active',
        status: license.status,
        licenseKey: license.license_key,
        plan: license.plan,
        planName: planConfig.name,
        email: license.email,
        entitlements: planConfig.entitlements,
        ownedMementos,
        downloads,
        createdAt: license.created_at,
      })
    )
  } catch (err: any) {
    console.error('[API license-verify error]', err)
    res.statusCode = 500
    return res.end(JSON.stringify({ valid: false, error: 'Verification error' }))
  }
}
