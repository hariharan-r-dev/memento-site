export type ActivePlanId = 'memento_duo' | 'memento_four' | 'memento_complete'
export type LegacyPlanId = 'memento' | 'memento_custom'
export type PlanId = ActivePlanId | LegacyPlanId

export interface PlanConfig {
  id: PlanId
  name: string
  price: number // in INR (display)
  amount: number // in INR paise (for Razorpay: 349 = 34900, 649 = 64900, 949 = 94900)
  currency: string
  entitlements: {
    maxMementos: number | null
    customization: boolean
    allCollections: boolean
    surpriseCharm?: boolean
  }
}

export const PLANS: Record<PlanId, PlanConfig> = {
  memento_duo: {
    id: 'memento_duo',
    name: 'Memento Duo',
    price: 349,
    amount: 34900,
    currency: 'INR',
    entitlements: {
      maxMementos: 2,
      customization: false,
      allCollections: false,
      surpriseCharm: false,
    },
  },
  memento_four: {
    id: 'memento_four',
    name: 'Memento Four',
    price: 649,
    amount: 64900,
    currency: 'INR',
    entitlements: {
      maxMementos: 4,
      customization: false,
      allCollections: false,
      surpriseCharm: false,
    },
  },
  memento_complete: {
    id: 'memento_complete',
    name: 'Memento Complete',
    price: 949,
    amount: 94900,
    currency: 'INR',
    entitlements: {
      maxMementos: 4,
      customization: false,
      allCollections: true,
      surpriseCharm: true,
    },
  },
  // Legacy plan compatibility (for previously purchased licenses)
  memento: {
    id: 'memento',
    name: 'Memento (Legacy)',
    price: 289,
    amount: 28900,
    currency: 'INR',
    entitlements: {
      maxMementos: 2,
      customization: false,
      allCollections: false,
      surpriseCharm: false,
    },
  },
  memento_custom: {
    id: 'memento_custom',
    name: 'Memento Custom (Legacy)',
    price: 389,
    amount: 38900,
    currency: 'INR',
    entitlements: {
      maxMementos: 2,
      customization: true,
      allCollections: false,
      surpriseCharm: false,
    },
  },
}

export const REGISTERED_MEMENTO_IDS: readonly string[] = [
  'ferrari',
  'red-car',
  'venkateswara',
  'kandhan',
  'murugan',
  'croissant',
  'chocolate-strawberry',
  'chocolate-strawberries',
  'chocolate-milkshake',
  'pistachio-chocolate-donut',
  'chocolate-pistachio-pastry',
  'matcha-drink',
  'matcha',
  'disco-ball-stars',
  'iron-man',
  'maneki-neko',
  'lucky-cat',
  'evil-eye',
  'hamsa',
  'drishti-bommai',
  'nimbu-mirchi',
  'daruma',
  'lucky-coin',
  'bell',
]

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
