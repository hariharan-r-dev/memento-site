import ferrariSrc from "../assets/charms/ferrari.png"
import venkateswaraSrc from "../assets/charms/venkateswara.png"
import kandhanSrc from "../assets/charms/kandhan.png"
import croissantSrc from "../assets/charms/croissant.png"
import chocolateMilkshakeSrc from "../assets/charms/chocolate-milkshake.png"
import chocolateStrawberrySrc from "../assets/charms/chocolate-strawberry.png"
import pistachioChocolateDonutSrc from "../assets/charms/pistachio-chocolate-donut.png"
import matchaDrinkSrc from "../assets/charms/matcha-drink.png"
import discoBallStarsSrc from "../assets/charms/disco-ball-stars.png"
import ironManSrc from "../assets/charms/iron-man.png"

export interface CharmVisual {
  src: string
  cropTop: number
  displayWidth: number
  displayWidthSm: number
  attachmentPoint: {
    x: number // 0.5 = horizontal center
    y: number // 0 = top edge
  }
}

export const CHARM_VISUALS: Record<string, CharmVisual> = {
  ferrari: {
    src: ferrariSrc,
    cropTop: 0,
    displayWidth: 175,
    displayWidthSm: 125,
    attachmentPoint: {
      x: 0.494,
      y: 0.08,
    },
  },
  "red-car": {
    src: ferrariSrc,
    cropTop: 0,
    displayWidth: 175,
    displayWidthSm: 125,
    attachmentPoint: {
      x: 0.494,
      y: 0.08,
    },
  },
  venkateswara: {
    src: venkateswaraSrc,
    cropTop: 0,
    displayWidth: 125,
    displayWidthSm: 96,
    attachmentPoint: {
      x: 0.5,
      y: 0.015,
    },
  },
  kandhan: {
    src: kandhanSrc,
    cropTop: 0,
    displayWidth: 112,
    displayWidthSm: 88,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
  murugan: {
    src: kandhanSrc,
    cropTop: 0,
    displayWidth: 112,
    displayWidthSm: 88,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
  croissant: {
    src: croissantSrc,
    cropTop: 0,
    displayWidth: 150,
    displayWidthSm: 115,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
  "chocolate-strawberry": {
    src: chocolateStrawberrySrc,
    cropTop: 0,
    displayWidth: 140,
    displayWidthSm: 110,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
  "chocolate-strawberries": {
    src: chocolateStrawberrySrc,
    cropTop: 0,
    displayWidth: 140,
    displayWidthSm: 110,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
  "chocolate-milkshake": {
    src: chocolateMilkshakeSrc,
    cropTop: 0,
    displayWidth: 135,
    displayWidthSm: 105,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
  "pistachio-chocolate-donut": {
    src: pistachioChocolateDonutSrc,
    cropTop: 0,
    displayWidth: 155,
    displayWidthSm: 120,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
  "chocolate-pistachio-pastry": {
    src: pistachioChocolateDonutSrc,
    cropTop: 0,
    displayWidth: 155,
    displayWidthSm: 120,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
  "matcha-drink": {
    src: matchaDrinkSrc,
    cropTop: 0,
    displayWidth: 112,
    displayWidthSm: 88,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
  matcha: {
    src: matchaDrinkSrc,
    cropTop: 0,
    displayWidth: 112,
    displayWidthSm: 88,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
  "disco-ball-stars": {
    src: discoBallStarsSrc,
    cropTop: 0,
    displayWidth: 150,
    displayWidthSm: 115,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
  "iron-man": {
    src: ironManSrc,
    cropTop: 0,
    displayWidth: 135,
    displayWidthSm: 105,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
}
