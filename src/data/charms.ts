export type CharmCategory = 'Cars' | 'Devotional'

export type Charm = {
  id: string
  name: string
  category: CharmCategory
  description: string
  tags: string[]
}

export const CATEGORIES: Array<'All' | CharmCategory> = [
  'All',
  'Cars',
  'Devotional',
]

export const charms: Charm[] = [
  {
    id: 'ferrari',
    name: 'Red Ferrari F40',
    category: 'Cars',
    description: 'Built for speed. A legend on four wheels.',
    tags: ['Cars', 'Performance', 'Iconic'],
  },
  {
    id: 'venkateswara',
    name: 'Venkateswara',
    category: 'Devotional',
    description: 'Lord of the seven hills. A timeless blessing.',
    tags: ['Devotional', 'Sacred', 'Tirupati'],
  },
  {
    id: 'kandhan',
    name: 'Kandhan Karunai',
    category: 'Devotional',
    description: 'The grace of Murugan. Full of light and love.',
    tags: ['Devotional', 'Tamil', 'Murugan'],
  },
]
