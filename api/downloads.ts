import type { IncomingMessage, ServerResponse } from 'http'
import fs from 'fs'
import path from 'path'

export interface ReleaseAssetInfo {
  name: string
  downloadCount: number
  isSetupInstaller: boolean
  downloadUrl: string
}

export interface ReleaseVersionInfo {
  version: string
  name: string
  publishedAt: string | null
  setupDownloads: number
  totalDownloads: number
  assets: ReleaseAssetInfo[]
}

export interface DownloadsResponse {
  success: boolean
  totalSetupDownloads: number | null
  totalAllDownloads: number | null
  latestVersion: string | null
  latestReleaseDate: string | null
  releases: ReleaseVersionInfo[]
  updatedAt: string
  stale: boolean
  error?: string
}

// In-memory cache for serverless invocation reuse and fallback
let memoryCache: {
  data: DownloadsResponse
  timestamp: number
} | null = null

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

let envLoaded = false
export function loadEnvFiles() {
  if (envLoaded) return
  envLoaded = true

  try {
    const envPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8')
      const lines = content.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim()
          const val = trimmed.substring(eqIdx + 1).trim()
          if (!process.env[key]) {
            process.env[key] = val
          }
        }
      }
    }
  } catch {
    // Ignore error in serverless read-only contexts
  }
}

/**
 * Checks if a release asset is the official Windows setup installer.
 * Excludes standalone portable executable (Memento.exe) as strictly requested.
 */
export function isSetupInstaller(assetName: string): boolean {
  if (!assetName) return false
  const lower = assetName.toLowerCase().trim()
  if (lower === 'memento.exe') return false
  return (
    /^memento[-_]?setup.*\.exe$/i.test(lower) ||
    (lower.includes('setup') && lower.endsWith('.exe'))
  )
}

/**
 * Fetch all published, non-prerelease releases from GitHub with pagination support.
 */
export async function fetchGitHubReleases(): Promise<any[]> {
  loadEnvFiles()

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  const headers: Record<string, string> = {
    'User-Agent': 'Memento-Website (https://memento.hariharan.dev)',
    Accept: 'application/vnd.github+json',
  }
  if (token && token.trim().length > 0) {
    headers['Authorization'] = `Bearer ${token.trim()}`
  }

  const allReleases: any[] = []
  let page = 1
  const maxPages = 5 // Safety cap for pagination

  while (page <= maxPages) {
    const url = `https://api.github.com/repos/hariharan-r-dev/Memento/releases?per_page=100&page=${page}`
    const res = await fetch(url, { headers })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`GitHub API returned status ${res.status}: ${errText}`)
    }

    const data = await res.json()
    if (!Array.isArray(data)) {
      throw new Error('Malformed GitHub releases response (expected array)')
    }

    allReleases.push(...data)

    if (data.length < 100) {
      break
    }

    const linkHeader = res.headers.get('Link') || ''
    if (!linkHeader.includes('rel="next"')) {
      break
    }

    page++
  }

  return allReleases
}

/**
 * Parse releases and calculate accurate setup download metrics
 */
export function processReleases(rawReleases: any[]): DownloadsResponse {
  // Exclude drafts and prereleases
  const validReleases = rawReleases.filter(
    (r) => r && !r.draft && !r.prerelease
  )

  let totalSetupDownloads = 0
  let totalAllDownloads = 0
  const releasesList: ReleaseVersionInfo[] = []
  const seenAssetIds = new Set<number>()

  for (const rel of validReleases) {
    let relSetupDownloads = 0
    let relAllDownloads = 0
    const assetList: ReleaseAssetInfo[] = []

    const rawAssets: any[] = Array.isArray(rel.assets) ? rel.assets : []
    for (const asset of rawAssets) {
      if (asset.id && seenAssetIds.has(asset.id)) {
        continue
      }
      if (asset.id) {
        seenAssetIds.add(asset.id)
      }

      const count = typeof asset.download_count === 'number' ? asset.download_count : 0
      const isInstaller = isSetupInstaller(asset.name || '')

      if (isInstaller) {
        relSetupDownloads += count
      }
      relAllDownloads += count

      assetList.push({
        name: asset.name || '',
        downloadCount: count,
        isSetupInstaller: isInstaller,
        downloadUrl: asset.browser_download_url || '',
      })
    }

    totalSetupDownloads += relSetupDownloads
    totalAllDownloads += relAllDownloads

    releasesList.push({
      version: rel.tag_name || '',
      name: rel.name || rel.tag_name || '',
      publishedAt: rel.published_at || null,
      setupDownloads: relSetupDownloads,
      totalDownloads: relAllDownloads,
      assets: assetList,
    })
  }

  const latest = releasesList[0] || null

  return {
    success: true,
    totalSetupDownloads,
    totalAllDownloads,
    latestVersion: latest?.version || null,
    latestReleaseDate: latest?.publishedAt || null,
    releases: releasesList,
    updatedAt: new Date().toISOString(),
    stale: false,
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  loadEnvFiles()

  // Set Vercel Edge caching headers: 10 minutes cache, 20 minutes stale-while-revalidate
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=600, stale-while-revalidate=1200'
  )
  res.setHeader('Content-Type', 'application/json')

  // Check in-memory cache
  const now = Date.now()
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return res.end(JSON.stringify(memoryCache.data))
  }

  try {
    const rawReleases = await fetchGitHubReleases()
    const result = processReleases(rawReleases)

    // Store in memory cache
    memoryCache = {
      data: result,
      timestamp: now,
    }

    return res.end(JSON.stringify(result))
  } catch (err: any) {
    console.error('[API /api/downloads error]', err?.message || err)

    // Fallback to previous in-memory cache if GitHub is rate-limited or unavailable
    if (memoryCache) {
      const staleData: DownloadsResponse = {
        ...memoryCache.data,
        stale: true,
      }
      return res.end(JSON.stringify(staleData))
    }

    // Graceful fallback response: never show misleading 0 or fake counts
    const fallbackResponse: DownloadsResponse = {
      success: false,
      totalSetupDownloads: null,
      totalAllDownloads: null,
      latestVersion: null,
      latestReleaseDate: null,
      releases: [],
      updatedAt: new Date().toISOString(),
      stale: false,
      error: 'GitHub release counts temporarily unavailable',
    }
    return res.end(JSON.stringify(fallbackResponse))
  }
}
