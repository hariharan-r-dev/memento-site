import crypto from 'crypto'

/**
 * Generate a cryptographically secure Memento license key.
 * Format: MEMENTO-XXXX-XXXX-XXXX-XXXX
 * Uses unambiguous characters (excluding easily confused 0, O, 1, I, L)
 */
const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

export function generateLicenseKey(): string {
  const bytes = crypto.randomBytes(16)
  const parts: string[] = []

  let current = ''
  for (let i = 0; i < 16; i++) {
    const char = CHARSET[bytes[i] % CHARSET.length]
    current += char
    if (current.length === 4) {
      parts.push(current)
      current = ''
    }
  }

  return `MEMENTO-${parts.join('-')}`
}

export function isValidLicenseKeyFormat(key: string): boolean {
  if (!key || typeof key !== 'string') return false
  const clean = key.trim().toUpperCase()
  return /^MEMENTO-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/.test(clean)
}
