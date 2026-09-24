import { getSupabaseServerClient } from './supabase.js'
import { loadEnvFiles } from './env.js'

export interface PlatformRelease {
  fileName: string
  version: string
  platform: 'windows' | 'macos'
  mimeType: string
  storagePath: string
}

export const RELEASES_CONFIG: {
  version: string
  bucket: string
  windows: PlatformRelease
  macos: PlatformRelease
} = {
  version: '1.0.0',
  bucket: 'memento-releases',
  windows: {
    fileName: 'Memento-Setup.exe',
    version: '1.0.0',
    platform: 'windows',
    mimeType: 'application/vnd.microsoft.portable-executable',
    storagePath: 'windows/Memento-Setup.exe',
  },
  macos: {
    fileName: 'Memento-macOS.dmg',
    version: '1.0.0',
    platform: 'macos',
    mimeType: 'application/x-apple-diskimage',
    storagePath: 'macos/Memento-macOS.dmg',
  },
}

export async function resolveDownloadUrl(platform: 'windows' | 'macos'): Promise<{
  downloadUrl: string | null
  fileName: string
  version: string
  source: 'storage_signed' | 'env_configured' | 'unavailable'
}> {
  loadEnvFiles()

  const release = platform === 'windows' ? RELEASES_CONFIG.windows : RELEASES_CONFIG.macos

  // 1. Check if direct environment variable is configured (e.g., GitHub Releases / CDN / R2)
  const envUrl =
    platform === 'windows'
      ? process.env.WINDOWS_DOWNLOAD_URL || process.env.VITE_WINDOWS_DOWNLOAD_URL
      : process.env.MACOS_DOWNLOAD_URL || process.env.VITE_MACOS_DOWNLOAD_URL

  if (envUrl && envUrl.trim().length > 0) {
    return {
      downloadUrl: envUrl.trim(),
      fileName: release.fileName,
      version: release.version,
      source: 'env_configured',
    }
  }

  // 2. Check Supabase Storage private bucket if Supabase credentials exist
  const supabase = getSupabaseServerClient()
  if (supabase) {
    try {
      // Create a 15-minute signed URL
      const { data, error } = await supabase.storage
        .from(RELEASES_CONFIG.bucket)
        .createSignedUrl(release.storagePath, 900, {
          download: release.fileName,
        })

      if (data?.signedUrl && !error) {
        return {
          downloadUrl: data.signedUrl,
          fileName: release.fileName,
          version: release.version,
          source: 'storage_signed',
        }
      }
    } catch (err) {
      console.warn('[Memento Release] Supabase storage check error:', err)
    }
  }

  return {
    downloadUrl: null,
    fileName: release.fileName,
    version: release.version,
    source: 'unavailable',
  }
}
