export type PlanId = 'memento' | 'memento_custom' | 'memento_complete'

export interface PlanConfig {
  id: PlanId
  name: string
  price: number // in INR (display)
  amount: number // in INR paise (for Razorpay: ₹289 = 28900)
  currency: string
  entitlements: {
    maxMementos: number | null // null means unlimited/all
    customization: boolean
    allCollections: boolean
  }
}

export const PLANS: Record<PlanId, PlanConfig> = {
  memento: {
    id: 'memento',
    name: 'Memento',
    price: 289,
    amount: 28900,
    currency: 'INR',
    entitlements: {
      maxMementos: 2,
      customization: false,
      allCollections: false,
    },
  },
  memento_custom: {
    id: 'memento_custom',
    name: 'Memento Custom',
    price: 389,
    amount: 38900,
    currency: 'INR',
    entitlements: {
      maxMementos: 2,
      customization: true,
      allCollections: false,
    },
  },
  memento_complete: {
    id: 'memento_complete',
    name: 'Memento Complete',
    price: 549,
    amount: 54900,
    currency: 'INR',
    entitlements: {
      maxMementos: null,
      customization: true,
      allCollections: true,
    },
  },
}

export const REGISTERED_MEMENTO_IDS: readonly string[] = ['ferrari', 'venkateswara', 'kandhan']

export function getAllRegisteredMementoIds(): string[] {
  return [...REGISTERED_MEMENTO_IDS]
}

export function isValidMementoId(id: string): boolean {
  return REGISTERED_MEMENTO_IDS.includes(id)
}

export function getPlanConfig(planId: string): PlanConfig | null {
  const normalized = planId.toLowerCase().trim() as PlanId
  return PLANS[normalized] ?? null
}

export function getDownloadUrls() {
  return {
    windows: process.env.WINDOWS_DOWNLOAD_URL || process.env.VITE_WINDOWS_DOWNLOAD_URL || null,
    macOS: process.env.MACOS_DOWNLOAD_URL || process.env.VITE_MACOS_DOWNLOAD_URL || null,
  }
}
