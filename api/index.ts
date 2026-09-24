import type { IncomingMessage, ServerResponse } from 'http'
import createOrderHandler from './create-order'
import verifyPaymentHandler from './verify-payment'
import webhookHandler from './webhooks/razorpay'
import activateHandler from './license/activate'
import verifyLicenseHandler from './license/verify'
import mementosHandler from './license/mementos'
import downloadHandler from './download'

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const pathname = parsedUrl.pathname.replace(/\/$/, '')
  ;(req as any).query = Object.fromEntries(parsedUrl.searchParams.entries())

  let handler: ((req: any, res: any) => Promise<any>) | null = null

  if (pathname === '/api/create-order') handler = createOrderHandler
  else if (pathname === '/api/verify-payment') handler = verifyPaymentHandler
  else if (pathname === '/api/webhooks/razorpay') handler = webhookHandler
  else if (pathname === '/api/license/activate') handler = activateHandler
  else if (pathname === '/api/license/verify') handler = verifyLicenseHandler
  else if (pathname === '/api/license/mementos') handler = mementosHandler
  else if (pathname === '/api/download' || pathname.startsWith('/api/download/')) {
    if (pathname === '/api/download/windows') {
      ;(req as any).query = { ...(req as any).query, platform: 'windows' }
    } else if (pathname === '/api/download/macos') {
      ;(req as any).query = { ...(req as any).query, platform: 'macos' }
    }
    handler = downloadHandler
  }

  if (!handler) return false

  // Parse body for JSON requests
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    let rawBody = ''
    req.on('data', chunk => { rawBody += chunk })
    await new Promise<void>(resolve => {
      req.on('end', () => {
        try {
          ;(req as any).body = JSON.parse(rawBody)
        } catch {
          ;(req as any).body = rawBody
        }
        resolve()
      })
    })
  }

  ;(req as any).query = Object.fromEntries(parsedUrl.searchParams.entries())

  await handler(req, res)
  return true
}
