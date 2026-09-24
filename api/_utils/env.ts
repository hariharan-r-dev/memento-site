import fs from 'fs'
import path from 'path'

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
