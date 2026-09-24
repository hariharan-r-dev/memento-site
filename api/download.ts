import type { IncomingMessage, ServerResponse } from 'http'
import { db } from './_utils/supabase'
import { resolveDownloadUrl, RELEASES_CONFIG } from './_utils/releases'
import { loadEnvFiles } from './_utils/env'

export default async function handler(req: any, res: any) {
  loadEnvFiles()

  try {
    let platform = ''
    let licenseKey = ''
    let isJson = false

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      platform = body.platform || ''
      licenseKey = body.licenseKey || body.key || ''
      isJson = true
    } else if (req.method === 'GET') {
      const query = (req as any).query || {}
      platform = query.platform || ''
      licenseKey = query.license || query.key || query.licenseKey || ''
      const accept = req.headers?.accept || ''
      if (accept.includes('application/json') || query.format === 'json') {
        isJson = true
      }
    } else {
      res.statusCode = 405
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    }

    // Normalize platform
    let targetPlatform: 'windows' | 'macos' | null = null
    const norm = platform.toLowerCase().trim()
    if (norm === 'windows' || norm === 'win' || norm === 'win32' || norm === 'win64') {
      targetPlatform = 'windows'
    } else if (norm === 'macos' || norm === 'mac' || norm === 'darwin' || norm === 'apple') {
      targetPlatform = 'macos'
    }

    if (!targetPlatform) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: 'Invalid or missing platform. Expected "windows" or "macos".' }))
    }

    if (!licenseKey || typeof licenseKey !== 'string') {
      res.statusCode = 401
      res.setHeader('Content-Type', 'application/json')
      return res.end(
        JSON.stringify({
          error: 'Missing license key. You must have a valid Memento license to download the desktop application.',
        })
      )
    }

    // 1. Authorize license & payment status
    const license = await db.getLicenseByKey(licenseKey.trim().toUpperCase())
    if (!license) {
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: 'License key not found or invalid.' }))
    }

    if (license.status !== 'active') {
      res.statusCode = 403
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ error: `License is currently ${license.status}.` }))
    }

    // Verify associated purchase
    if (license.purchase_id) {
      const purchase = await db.getPurchaseById(license.purchase_id)
      if (purchase && purchase.status !== 'paid') {
        res.statusCode = 403
        res.setHeader('Content-Type', 'application/json')
        return res.end(JSON.stringify({ error: 'Purchase has not been marked as paid.' }))
      }
    }

    // 2. Resolve download URL (signed Supabase Storage URL or configured Release URL)
    const result = await resolveDownloadUrl(targetPlatform)

    if (!result.downloadUrl) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      return res.end(
        JSON.stringify({
          error: `${targetPlatform === 'windows' ? 'Windows' : 'macOS'} release file is not currently configured. Please contact support.`,
          fileName: result.fileName,
          version: result.version,
        })
      )
    }

    // 3. Return response (Redirect for direct browser link or JSON payload)
    if (!isJson) {
      res.statusCode = 302
      res.setHeader('Location', result.downloadUrl)
      return res.end()
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    return res.end(
      JSON.stringify({
        success: true,
        platform: targetPlatform,
        downloadUrl: result.downloadUrl,
        fileName: result.fileName,
        version: result.version,
        plan: license.plan,
      })
    )
  } catch (err: any) {
    console.error('[API download error]', err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: 'Failed to process download request.' }))
  }
}
