import { charms } from './charms'
import type { Charm } from './charms'

/* ── Collection type ─────────────────────────────────────────
 *
 * The data model is intentionally flat and extensible.
 * Adding a new collection (Anime, Nature, Football, etc.)
 * requires only a new entry here — no page code changes.
 * ─────────────────────────────────────────────────────────── */

export type Collection = {
  id: string
  number: string          // display number e.g. "01"
  name: string
  description: string     // long copy used in collection sections
  shortDesc: string       // one-liner used in tab/card previews
  charms: Charm[]
  comingSoon?: boolean    // hides charm grid, shows teaser
  accentHex?: string      // per-collection accent (defaults to sky blue)
}

export const collections: Collection[] = [
  {
    id: 'devotional',
    number: '01',
    name: 'Devotional',
    description: 'Sacred symbols, familiar stories, and things that feel close to home.',
    shortDesc: 'Sacred symbols and familiar stories.',
    charms: charms.filter(c => c.category === 'Devotional'),
    comingSoon: false,
  },
  {
    id: 'cars',
    number: '02',
    name: 'Cars',
    description: 'For the machines you never get tired of looking at.',
    shortDesc: 'Machines you never get tired of looking at.',
    charms: charms.filter(c => c.category === 'Cars'),
    comingSoon: false,
  },
  {
    id: 'dc',
    number: '03',
    name: 'DC',
    description: 'Icons that belong on every desk.',
    shortDesc: 'Icons that belong on every desk.',
    charms: [],
    comingSoon: true,
  },
  {
    id: 'marvel',
    number: '04',
    name: 'Marvel',
    description: 'A little hero for the everyday.',
    shortDesc: 'A little hero for the everyday.',
    charms: [],
    comingSoon: true,
  },
]
