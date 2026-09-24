import { useEffect, useState } from 'react'
import { CHARM_VISUALS } from '../data/charm_visuals'

/* ── Background removal ─────────────────────────────────────────────
 *
 * BFS flood-fill from every edge pixel.
 *
 * "Background" is defined as any pixel whose colour (R+G+B absolute
 * delta) is within TOLERANCE of one of the colours sampled from the
 * image corners / mid-edges.  This handles:
 *   • Photoshop-style checkerboard (two alternating grey shades) that
 *     is baked into the JPG export of the Kandhan / Venkateswara art.
 *   • The solid-grey background of the Ferrari PNG.
 *
 * Only edge-connected background pixels are removed, so internal grey
 * areas that are part of the artwork are untouched.
 * ─────────────────────────────────────────────────────────────────── */

const BG_TOLERANCE = 72   // sum-of-abs-differences per pixel

function removeBg(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  const { width, height } = canvas
  const imgData = ctx.getImageData(0, 0, width, height)
  const d = imgData.data

  /* Sample reference colours from corners + mid-edges. */
  const refs: [number, number, number][] = [
    [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
    [width >> 1, 0], [0, height >> 1], [width - 1, height >> 1], [width >> 1, height - 1],
  ].map(([x, y]) => {
    const i = (y * width + x) * 4
    return [d[i], d[i + 1], d[i + 2]]
  })

  const isBg = (pi: number): boolean => {
    if (d[pi + 3] < 16) return true                     // already transparent
    const r = d[pi], g = d[pi + 1], b = d[pi + 2]
    return refs.some(([rr, rg, rb]) =>
      Math.abs(r - rr) + Math.abs(g - rg) + Math.abs(b - rb) < BG_TOLERANCE,
    )
  }

  const visited = new Uint8Array(width * height)
  const queue: number[] = []

  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return
    const idx = y * width + x
    if (visited[idx]) return
    if (isBg(idx * 4)) { visited[idx] = 1; queue.push(idx) }
  }

  /* Seed BFS from all four edges. */
  for (let x = 0; x < width; x++)  { enqueue(x, 0); enqueue(x, height - 1) }
  for (let y = 1; y < height - 1; y++) { enqueue(0, y); enqueue(width - 1, y) }

  let qi = 0
  while (qi < queue.length) {
    const idx = queue[qi++]
    d[idx * 4 + 3] = 0                                  // make transparent
    const x = idx % width, y = (idx / width) | 0
    enqueue(x - 1, y); enqueue(x + 1, y)
    enqueue(x, y - 1); enqueue(x, y + 1)
  }

  ctx.putImageData(imgData, 0, 0)
}

/* ── Image loading + processing cache ──────────────────────────────
 *
 * Module-level maps persist across re-renders and hot-reloads.
 * Each charm is processed exactly once per browser session.
 * ─────────────────────────────────────────────────────────────────── */

const urlCache: Record<string, string>                         = {}
const loadingSet = new Set<string>()
const pendingListeners: Record<string, Array<(u: string) => void>> = {}

function processCharm(id: string): void {
  if (urlCache[id] || loadingSet.has(id)) return
  const visual = CHARM_VISUALS[id]
  if (!visual) return

  loadingSet.add(id)

  const img = new Image()
  img.onload = () => {
    const cropPx = Math.round(img.naturalHeight * visual.cropTop)
    const w = img.naturalWidth
    const h = img.naturalHeight - cropPx

    const canvas = document.createElement('canvas')
    canvas.width  = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    /* Draw image shifted up so the artwork rope is above the canvas. */
    ctx.drawImage(img, 0, -cropPx)
    removeBg(canvas, ctx)

    const dataUrl = canvas.toDataURL('image/png')
    urlCache[id] = dataUrl
    loadingSet.delete(id)

    const cbs = pendingListeners[id] ?? []
    delete pendingListeners[id]
    cbs.forEach(fn => fn(dataUrl))
  }
  img.onerror = () => loadingSet.delete(id)
  img.src = visual.src
}

/* Eagerly start loading all charm images (called from App or any early
 * component).  This ensures images are ready before the user clicks. */
export function preloadAllCharms(): void {
  Object.keys(CHARM_VISUALS).forEach(processCharm)
}

/* ── Hook ───────────────────────────────────────────────────────────── */

function useCharmUrl(id: string): string {
  const [url, setUrl] = useState<string>(urlCache[id] ?? '')

  useEffect(() => {
    if (urlCache[id]) { setUrl(urlCache[id]); return }

    /* Register listener then kick off loading. */
    if (!pendingListeners[id]) pendingListeners[id] = []
    pendingListeners[id].push(setUrl)
    processCharm(id)

    return () => {
      if (pendingListeners[id]) {
        pendingListeners[id] = pendingListeners[id].filter(fn => fn !== setUrl)
      }
    }
  }, [id])

  return url
}

/* ── CharmArt component ─────────────────────────────────────────────
 *
 * Renders the processed charm image (background removed, artwork rope
 * cropped) as an <img> element that respects CSS sizing from the caller.
 *
 * Usage in collection cards:  className="w-[72%]"
 * Usage in InteractiveMemento: className="w-full"
 * ─────────────────────────────────────────────────────────────────── */

export function CharmArt({ id, className, style }: {
  id: string
  className?: string
  style?: React.CSSProperties
}) {
  const url = useCharmUrl(id)

  if (!url) {
    /* Skeleton placeholder while image is being processed. */
    return (
      <div
        className={className}
        style={{ background: 'transparent', aspectRatio: '1', ...style }}
      />
    )
  }

  return (
    <img
      src={url}
      alt=""
      draggable={false}
      className={className}
      style={{ display: 'block', height: 'auto', objectFit: 'contain', ...style }}
    />
  )
}
