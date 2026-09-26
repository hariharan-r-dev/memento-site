export type CharmCategory = "Cars" | "Devotional" | "Food" | "Marvel"

export type Charm = {
  id: string

  name: string

  category: CharmCategory

  description: string

  tags: string[]
}

export const CATEGORIES: Array<"All" | CharmCategory> = [
  "All",

  "Cars",

  "Devotional",

  "Food",

  "Marvel",
]

export const charms: Charm[] = [
  {
    id: "ferrari",

    name: "Red Ferrari F40",

    category: "Cars",

    description: "Built for speed. A legend on four wheels.",

    tags: ["Cars", "Performance", "Iconic"],
  },

  {
    id: "venkateswara",

    name: "Venkateswara",

    category: "Devotional",

    description: "Lord of the seven hills. A timeless blessing.",

    tags: ["Devotional", "Sacred", "Tirupati"],
  },

  {
    id: "kandhan",

    name: "Kandhan Karunai",

    category: "Devotional",

    description: "The grace of Murugan. Full of light and love.",

    tags: ["Devotional", "Tamil", "Murugan"],
  },

  {
    id: "croissant",

    name: "Croissant",

    category: "Food",

    description: "Golden, flaky, and fresh from the bakery.",

    tags: ["Food", "Bakery", "Pastry"],
  },

  {
    id: "chocolate-strawberry",

    name: "Chocolate Strawberry",

    category: "Food",

    description: "Fresh ripe strawberry dipped in rich melted chocolate.",

    tags: ["Food", "Sweet", "Fruit", "Dessert"],
  },

  {
    id: "chocolate-milkshake",

    name: "Chocolate Milkshake",

    category: "Food",

    description: "Rich chocolate, whipped cream, and pure sweetness.",

    tags: ["Food", "Dessert", "Chocolate"],
  },

  {
    id: "pistachio-chocolate-donut",

    name: "Pistachio Chocolate Donut",

    category: "Food",

    description: "Decadent chocolate pastry filled with rich pistachio cream.",

    tags: ["Food", "Bakery", "Pistachio", "Donut"],
  },

  {
    id: "matcha-drink",

    name: "Matcha",

    category: "Food",

    description: "Refreshing iced matcha with a vibrant green splash.",

    tags: ["Food", "Drink", "Matcha"],
  },

  {
    id: "disco-ball-stars",

    name: "Disco Ball Stars",

    category: "Food",

    description:
      "Mirrored disco ball with sparkling tiles and 3D metallic blue stars.",

    tags: ["Food", "Party", "Celebration", "Shine"],
  },

  {
    id: "iron-man",

    name: "Iron Man",

    category: "Marvel",

    description:
      "Armored superhero collectible with glowing arc reactor and gold faceplate.",

    tags: ["Marvel", "Superhero", "Iron Man", "Collectible"],
  },
]
