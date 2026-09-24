import ferrariSrc from '../assets/charms/ferrari.png'
import venkateswaraSrc from '../assets/charms/venkateswara.jpg'
import kandhanSrc from '../assets/charms/kandhan.jpg'

/**
 * Per-charm visual configuration & explicit attachment coordinates.
 *
 * cropTop – fraction (0–1) of the image height to clip from the top.
 * attachmentPoint – normalized { x, y } coordinates (0..1) on the cropped image
 *                   where the hardware connector attaches to the charm.
 * displayWidth / displayWidthSm – the CSS pixel width used when the charm
 *           hangs in the interactive physics system (desktop / mobile).
 */
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
  /** Red Ferrari F40 — wide horizontal charm.
   *  cropTop hides the red dotted artwork rope; attachment point is the top gold mount. */
  ferrari: {
    src: ferrariSrc,
    cropTop: 0.44,
    displayWidth: 180,
    displayWidthSm: 130,
    attachmentPoint: {
      x: 0.5,
      y: 0.0,
    },
  },
  /** Lord Venkateswara (Balaji / Tirupati) — tall vertical, attachment at the top crown mount. */
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
  /** Kandhan Karunai — baby Murugan, attachment at the top halo/ornament ring. */
  kandhan: {
    src: kandhanSrc,
    cropTop: 0,
    displayWidth: 145,
    displayWidthSm: 112,
    attachmentPoint: {
      x: 0.5,
      y: 0.01,
    },
  },
}
