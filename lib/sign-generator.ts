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
  const connectSize = Math.max(20, Math.floor(s(30)))
  const benefitSize = Math.max(18, Math.floor(s(24)))
  const taglineSize = Math.max(15, Math.floor(s(20)))
  const urlSize = Math.max(12, Math.floor(s(16)))

  // Left column positions
  const bizY = Math.floor(h * 0.30)
  const connectY = bizY + Math.floor(s(48))
  const benefitY = Math.floor(h * 0.68)
  const taglineY = Math.floor(h * 0.90)

  // Right column: QR code — big, vertically centered
  const qrSize = Math.floor(Math.min((w - colSplit) * 0.80, h * 0.62))
  const qrX = Math.floor(rightCx - qrSize / 2)
  const qrY = Math.floor((h - qrSize) / 2 - s(10))
  const qrPad = Math.max(10, Math.floor(s(18)))
  const qrCorner = Math.max(8, Math.floor(s(14)))

  const urlY = qrY + qrSize + qrPad + Math.floor(s(28))

  const qrRects = generateQrRects(url, qrSize, qrX, qrY)

  const content = `  <!-- LEFT COLUMN -->

  <text x="${leftCx}" y="${bizY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${bizSize}" font-weight="800"
        fill="${CHARCOAL}">${safeName}</text>

  <text x="${leftCx}" y="${connectY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${connectSize}" font-weight="600"
        fill="${AMBER_DARK}">is now a part of Switchboard</text>

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
  const connectSize = Math.max(18, Math.floor(s(26)))
  const benefitSize = Math.max(16, Math.floor(s(22)))
  const taglineSize = Math.max(14, Math.floor(s(18)))
  const urlSize = Math.max(11, Math.floor(s(14)))

  // Top: business name + connector
  const bizY = Math.floor(h * 0.10)
  const connectY = bizY + Math.floor(s(42))

  // Middle: QR code — big and central
  const qrSize = Math.floor(Math.min(w * 0.65, h * 0.34))
  const qrX = Math.floor(cx - qrSize / 2)
  const qrY = Math.floor(h * 0.27)
  const qrPad = Math.max(10, Math.floor(s(16)))
  const qrCorner = Math.max(8, Math.floor(s(12)))

  // Below QR: benefit
  const benefitY = qrY + qrSize + qrPad + Math.floor(s(34))

  // Bottom: tagline + url
  const taglineY = Math.floor(h * 0.87)
  const urlY = taglineY + Math.floor(s(24))

  const qrRects = generateQrRects(url, qrSize, qrX, qrY)

  const content = `  <!-- TOP: Business Name -->

  <text x="${cx}" y="${bizY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${bizSize}" font-weight="800"
        fill="${CHARCOAL}">${safeName}</text>

  <text x="${cx}" y="${connectY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${connectSize}" font-weight="600"
        fill="${AMBER_DARK}">is now a part of Switchboard</text>

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
