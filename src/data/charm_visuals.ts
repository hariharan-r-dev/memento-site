import ferrariSrc from '../assets/charms/ferrari.png'
import venkateswaraSrc from '../assets/charms/venkateswara.jpg'
import kandhanSrc from '../assets/charms/kandhan.jpg'

/**
 * Per-charm visual configuration.
 *
 * cropTop – fraction (0–1) of the image height to clip from the top.
 *           This hides the artwork rope/cord that appears in the original
 *           image, leaving only the attachment hardware (gold ball / silver
 *           ring) and the charm body visible.
 *
 * displayWidth / displayWidthSm – the CSS pixel width used when the charm
 *           hangs in the interactive physics system (desktop / mobile).
 *           Height is always auto (preserves natural aspect ratio).
 */
export interface CharmVisual {
  src: string
  cropTop: number
  displayWidth: number
  displayWidthSm: number
}

export const CHARM_VISUALS: Record<string, CharmVisual> = {
  /** Red Ferrari F40 — wide horizontal charm.
   *  cropTop hides the red dotted artwork rope; cut lands at the gold ball. */
  ferrari: {
    src: ferrariSrc,
    cropTop: 0.44,
    displayWidth: 180,
    displayWidthSm: 130,
  },
  /** Lord Venkateswara (Balaji / Tirupati) — tall vertical, complete full artwork */
  venkateswara: {
    src: venkateswaraSrc,
    cropTop: 0,
    displayWidth: 120,
    displayWidthSm: 92,
  },
  /** Kandhan Karunai — baby Murugan, medium portrait, complete full artwork */
  kandhan: {
    src: kandhanSrc,
    cropTop: 0,
    displayWidth: 140,
    displayWidthSm: 108,
  },
}
