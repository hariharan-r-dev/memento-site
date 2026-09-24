export interface MementoUpdate {
  version: string
  date: string
  platforms: ('windows' | 'macos')[]
  title: string
  description?: string
  notes: string[]
}

export const MEMENTO_UPDATES: MementoUpdate[] = [
  {
    version: 'v1.2.0',
    date: 'September 2026',
    platforms: ['windows', 'macos'],
    title: 'A smoother Memento experience.',
    description: 'Major physics enhancements and support for new charm attachments.',
    notes: [
      'Added new charm collection support',
      'Improved Verlet rope hanging physics and momentum settling',
      'Refined direct-grab charm dragging and collision boundaries',
      'Performance and memory optimizations for continuous desktop usage',
    ],
  },
  {
    version: 'v1.1.2',
    date: 'August 2026',
    platforms: ['macos'],
    title: 'macOS Sonoma and Sequoia desktop improvements.',
    notes: [
      'Improved multi-monitor and Stage Manager window handling',
      'Fixed transparent overlay positioning beneath the menu bar',
      'Optimized Metal rendering backend for lower idle CPU consumption',
    ],
  },
  {
    version: 'v1.1.1',
    date: 'August 2026',
    platforms: ['windows'],
    title: 'Windows 11 transparency and tray behavior.',
    notes: [
      'Improved startup behavior and system tray minimization',
      'Fixed acrylic and layered window transparency on multi-DPI displays',
      'Resolved background cursor pass-through during full-screen apps',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'July 2026',
    platforms: ['windows', 'macos'],
    title: 'Initial public release of Memento.',
    notes: [
      'Digital collectibles living on your desktop',
      'Real-time physics engine with interactive rope physics',
      'Customizable rope lengths and display sizing',
    ],
  },
]
