import QRCode from 'qrcode'

// ── Colors ──────────────────────────────────────────────────────────
const YELLOW = '#FFD600'
const CHARCOAL = '#1E293B'
const AMBER_DARK = '#92400E'
const WHITE = '#FFFFFF'
const FONT = 'Plus Jakarta Sans, -apple-system, Helvetica Neue, Arial, sans-serif'

// ── Preset Sizes (width x height in inches, at 96 DPI) ─────────────
// Stored as landscape. Portrait mode swaps w/h.
export const SIGN_SIZES: Record<string, { w: number; h: number; label: string }> = {
  '4x6':     { w: 576,  h: 384,  label: 'Postcard' },
  '5x7':     { w: 672,  h: 480,  label: 'Small flyer' },
  '6x9':     { w: 864,  h: 576,  label: 'Standard sign' },
  '8.5x11':  { w: 1056, h: 816,  label: 'Full letter page' },
  '5.5x8.5': { w: 816,  h: 528,  label: 'Half letter' },
}

function generateQrRects(url: string, size: number, xOff: number, yOff: number): string {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' })
  const n = qr.modules.size
  const m = size / n
  const rects: string[] = []

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.data[r * n + c]) {
        rects.push(
          `<rect x="${(xOff + c * m).toFixed(1)}" y="${(yOff + r * m).toFixed(1)}" ` +
          `width="${m.toFixed(1)}" height="${m.toFixed(1)}" fill="${CHARCOAL}"/>`
        )
      }
    }
  }

  return rects.join('\n      ')
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Approximate text width for Plus Jakarta Sans 800 weight.
// Average char width ≈ 0.58 × fontSize; capitals/wide chars ≈ 0.72.
function estimateTextWidth(text: string, fontSize: number): number {
  let width = 0
  for (const ch of text) {
    if (/[MWQO@]/.test(ch)) width += fontSize * 0.78
    else if (/[A-Z]/.test(ch)) width += fontSize * 0.68
    else if (/[mw]/.test(ch)) width += fontSize * 0.7
    else if (/[ijl.,'!|:]/.test(ch)) width += fontSize * 0.3
    else if (/[ftrs]/.test(ch)) width += fontSize * 0.42
    else if (ch === ' ') width += fontSize * 0.28
    else width += fontSize * 0.55
  }
  return width
}

// Returns SVG text element(s) for the business name, auto-sizing or
// wrapping to 2 lines if the name is too wide for the available space.
function fitBusinessName(
  name: string, x: number, y: number, maxWidth: number,
  baseFontSize: number, minFontSize: number, lineSpacing: number
): { svg: string; bottomY: number } {
  // Try full size, single line
  let fontSize = baseFontSize
  let tw = estimateTextWidth(name, fontSize)

  if (tw <= maxWidth) {
    return {
      svg: `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="${CHARCOAL}">${name}</text>`,
      bottomY: y,
    }
  }

  // Try shrinking down to minFontSize
  while (fontSize > minFontSize) {
    fontSize -= 2
    tw = estimateTextWidth(name, fontSize)
    if (tw <= maxWidth) {
      return {
        svg: `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="${CHARCOAL}">${name}</text>`,
        bottomY: y,
      }
    }
  }

  // Still too long — wrap to 2 lines at the best word boundary
  fontSize = baseFontSize
  const words = name.split(' ')
  let bestSplit = Math.ceil(words.length / 2)
  let bestDiff = Infinity

  for (let i = 1; i < words.length; i++) {
    const line1 = words.slice(0, i).join(' ')
    const line2 = words.slice(i).join(' ')
    const w1 = estimateTextWidth(line1, fontSize)
    const w2 = estimateTextWidth(line2, fontSize)
    const diff = Math.abs(w1 - w2)
    if (Math.max(w1, w2) <= maxWidth && diff < bestDiff) {
      bestDiff = diff
      bestSplit = i
    }
  }

  const line1 = words.slice(0, bestSplit).join(' ')
  const line2 = words.slice(bestSplit).join(' ')

  // Shrink if even 2 lines overflow
  const longerLine = estimateTextWidth(line1, fontSize) > estimateTextWidth(line2, fontSize) ? line1 : line2
  while (fontSize > minFontSize && estimateTextWidth(longerLine, fontSize) > maxWidth) {
    fontSize -= 2
  }

  const y1 = y
  const y2 = y + lineSpacing
  return {
    svg: `<text x="${x}" y="${y1}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="${CHARCOAL}">${line1}</text>
  <text x="${x}" y="${y2}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="${CHARCOAL}">${line2}</text>`,
    bottomY: y2,
  }
}

function svgWrapper(w: number, h: number, r: number, content: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${w} ${h}"
     width="${w}" height="${h}">

  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&amp;display=swap');
    </style>
  </defs>

  <rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${YELLOW}"/>

${content}

</svg>`
}

// ── Landscape layout: business-first, QR right ──────────────────────
function buildLandscape(
  w: number, h: number, safeName: string, safeAddr: string, url: string
): string {
  const r = Math.max(12, Math.floor(h * 0.035))
  const scale = Math.min(w / 864, h / 576)
  const s = (base: number) => base * scale

  const pad = Math.max(28, Math.floor(w * 0.05))
  const colSplit = Math.floor(w * 0.48)
  const leftCx = Math.floor(pad + (colSplit - pad * 2) / 2)
  const rightCx = Math.floor(colSplit + (w - colSplit) / 2)

  // Font sizes — legible from 3 feet on 6x9
  const bizSize = Math.max(40, Math.floor(s(68)))
  const tagSize = Math.max(11, Math.floor(s(14)))
  const logoSize = Math.max(24, Math.floor(s(38)))
  const descriptorSize = Math.max(10, Math.floor(s(12)))
  const benefitSize = Math.max(18, Math.floor(s(24)))
  const taglineSize = Math.max(15, Math.floor(s(20)))
  const urlSize = Math.max(12, Math.floor(s(16)))

  // Left column: fit business name with auto-sizing
  const leftMaxW = colSplit - pad * 2
  const bizY = Math.floor(h * 0.24)
  const bizName = fitBusinessName(safeName, leftCx, bizY, leftMaxW, bizSize, Math.floor(bizSize * 0.5), Math.floor(s(52)))
  const tagY = bizName.bottomY + Math.floor(s(32))
  const logoY = tagY + Math.floor(s(32))
  const descriptorY = logoY + Math.floor(s(18))
  const benefitY = Math.floor(h * 0.72)
  const taglineY = Math.floor(h * 0.92)

  // Right column: QR code — big, vertically centered
  const qrSize = Math.floor(Math.min((w - colSplit) * 0.80, h * 0.62))
  const qrX = Math.floor(rightCx - qrSize / 2)
  const qrY = Math.floor((h - qrSize) / 2 - s(10))
  const qrPad = Math.max(10, Math.floor(s(18)))
  const qrCorner = Math.max(8, Math.floor(s(14)))

  const urlY = qrY + qrSize + qrPad + Math.floor(s(28))

  const qrRects = generateQrRects(url, qrSize, qrX, qrY)

  const content = `  <!-- LEFT COLUMN -->

  ${bizName.svg}

  <text x="${leftCx}" y="${tagY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${tagSize}" font-weight="400"
        fill="${AMBER_DARK}">is now a part of</text>

  <text x="${leftCx}" y="${logoY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${logoSize}" font-weight="800"
        letter-spacing="0.14em" fill="${CHARCOAL}">SWITCHBOARD</text>

  <text x="${leftCx}" y="${descriptorY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${descriptorSize}" font-weight="400"
        fill="${CHARCOAL}" opacity="0.45">the digital network of local bulletin boards</text>

  <text x="${leftCx}" y="${benefitY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${benefitSize}" fill="${CHARCOAL}"><tspan font-weight="800">Scan</tspan><tspan font-weight="400" fill="${AMBER_DARK}"> to see what&#x2019;s posted here &#x2014; from anywhere</tspan></text>

  <text x="${leftCx}" y="${taglineY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${taglineSize}" font-weight="700"
        letter-spacing="0.10em" fill="${CHARCOAL}">Real. Local. Now.</text>

  <!-- RIGHT COLUMN: QR -->

  <rect x="${qrX - qrPad}" y="${qrY - qrPad}"
        width="${qrSize + qrPad * 2}" height="${qrSize + qrPad * 2}"
        rx="${qrCorner}" ry="${qrCorner}"
        fill="${WHITE}"/>

  <g>
      ${qrRects}
  </g>

  <text x="${rightCx}" y="${urlY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${urlSize}" font-weight="600"
        letter-spacing="0.04em" fill="${CHARCOAL}">www.switchboard.town</text>`

  return svgWrapper(w, h, r, content)
}

// ── Portrait layout: business-first, stacked ────────────────────────
function buildPortrait(
  w: number, h: number, safeName: string, safeAddr: string, url: string
): string {
  const r = Math.max(12, Math.floor(w * 0.035))
  const scale = Math.min(w / 576, h / 864)
  const s = (base: number) => base * scale

  const cx = Math.floor(w / 2)

  // Font sizes — legible from 3 feet on 6x9
  const bizSize = Math.max(34, Math.floor(s(58)))
  const tagSize = Math.max(10, Math.floor(s(13)))
  const logoSize = Math.max(20, Math.floor(s(32)))
  const descriptorSize = Math.max(9, Math.floor(s(11)))
  const benefitSize = Math.max(16, Math.floor(s(22)))
  const taglineSize = Math.max(14, Math.floor(s(18)))
  const urlSize = Math.max(11, Math.floor(s(14)))

  // Top: business name + Switchboard lockup with auto-sizing
  const portPad = Math.max(20, Math.floor(w * 0.06))
  const portMaxW = w - portPad * 2
  const bizY = Math.floor(h * 0.09)
  const bizName = fitBusinessName(safeName, cx, bizY, portMaxW, bizSize, Math.floor(bizSize * 0.5), Math.floor(s(46)))
  const tagY = bizName.bottomY + Math.floor(s(28))
  const logoY = tagY + Math.floor(s(28))
  const descriptorY = logoY + Math.floor(s(16))

  // Middle: QR code — big and central
  const qrSize = Math.floor(Math.min(w * 0.65, h * 0.34))
  const qrX = Math.floor(cx - qrSize / 2)
  const qrTopTarget = descriptorY + Math.floor(s(20))
  const qrY = Math.max(Math.floor(h * 0.30), qrTopTarget)
  const qrPad = Math.max(10, Math.floor(s(16)))
  const qrCorner = Math.max(8, Math.floor(s(12)))

  // Below QR: benefit
  const benefitY = qrY + qrSize + qrPad + Math.floor(s(34))

  // Bottom: tagline + url
  const taglineY = Math.floor(h * 0.87)
  const urlY = taglineY + Math.floor(s(24))

  const qrRects = generateQrRects(url, qrSize, qrX, qrY)

  const content = `  <!-- TOP: Business Name -->

  ${bizName.svg}

  <text x="${cx}" y="${tagY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${tagSize}" font-weight="400"
        fill="${AMBER_DARK}">is now a part of</text>

  <text x="${cx}" y="${logoY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${logoSize}" font-weight="800"
        letter-spacing="0.14em" fill="${CHARCOAL}">SWITCHBOARD</text>

  <text x="${cx}" y="${descriptorY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${descriptorSize}" font-weight="400"
        fill="${CHARCOAL}" opacity="0.45">the digital network of local bulletin boards</text>

  <!-- MIDDLE: QR Code -->

  <rect x="${qrX - qrPad}" y="${qrY - qrPad}"
        width="${qrSize + qrPad * 2}" height="${qrSize + qrPad * 2}"
        rx="${qrCorner}" ry="${qrCorner}"
        fill="${WHITE}"/>

  <g>
      ${qrRects}
  </g>

  <!-- Benefit -->

  <text x="${cx}" y="${benefitY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${benefitSize}" fill="${CHARCOAL}"><tspan font-weight="800">Scan</tspan><tspan font-weight="400" fill="${AMBER_DARK}"> to see what&#x2019;s posted here &#x2014; from anywhere</tspan></text>

  <!-- Bottom -->

  <text x="${cx}" y="${taglineY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${taglineSize}" font-weight="700"
        letter-spacing="0.10em" fill="${CHARCOAL}">Real. Local. Now.</text>

  <text x="${cx}" y="${urlY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${urlSize}" font-weight="600"
        letter-spacing="0.04em" fill="${CHARCOAL}">www.switchboard.town</text>`

  return svgWrapper(w, h, r, content)
}

// ── Public API ──────────────────────────────────────────────────────
export function buildSign(
  w: number,
  h: number,
  businessName: string,
  address: string,
  url: string,
): string {
  const safeName = escapeXml(businessName)
  const safeAddr = escapeXml(address)

  if (w >= h) {
    return buildLandscape(w, h, safeName, safeAddr, url)
  } else {
    return buildPortrait(w, h, safeName, safeAddr, url)
  }
}
