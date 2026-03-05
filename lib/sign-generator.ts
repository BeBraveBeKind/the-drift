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

// ── Landscape layout: side-by-side (copy left, QR right) ────────────
function buildLandscape(
  w: number, h: number, safeName: string, safeAddr: string, url: string
): string {
  const r = Math.max(12, Math.floor(h * 0.035))
  const scale = Math.min(w / 864, h / 576)
  const s = (base: number) => base * scale

  const pad = Math.max(24, Math.floor(w * 0.045))
  const colSplit = Math.floor(w * 0.58)
  const leftCx = Math.floor(colSplit / 2)
  const rightCx = Math.floor(colSplit + (w - colSplit) / 2)

  const headlineSize = Math.max(24, Math.floor(s(44)))
  const subSize = Math.max(11, Math.floor(s(16)))
  const brandSize = Math.max(10, Math.floor(s(14)))
  const bizSize = Math.max(18, Math.floor(s(30)))
  const addrSize = Math.max(11, Math.floor(s(16)))
  const taglineSize = Math.max(10, Math.floor(s(15)))
  const trustSize = Math.max(9, Math.floor(s(12)))
  const urlSize = Math.max(8, Math.floor(s(11)))

  const brandY = Math.floor(h * 0.10)
  const divider1Y = Math.floor(h * 0.155)
  const h1Line1Y = Math.floor(h * 0.32)
  const h1Line2Y = h1Line1Y + Math.floor(s(52))
  const subY = h1Line2Y + Math.floor(s(44))
  const sub2Y = subY + Math.floor(s(22))
  const bizY = Math.floor(h * 0.78)
  const addrY = bizY + Math.floor(s(28))
  const taglineY = Math.floor(h * 0.94)

  const qrSize = Math.floor(Math.min((w - colSplit) * 0.72, h * 0.52))
  const qrX = Math.floor(rightCx - qrSize / 2)
  const qrY = Math.floor((h - qrSize) / 2 - s(16))
  const qrPad = Math.max(10, Math.floor(s(18)))
  const qrCorner = Math.max(8, Math.floor(s(14)))

  const trustY = qrY + qrSize + qrPad + Math.floor(s(30))
  const urlY = trustY + Math.floor(s(18))

  const marginL = pad
  const marginR = colSplit - pad

  const qrRects = generateQrRects(url, qrSize, qrX, qrY)

  const content = `  <!-- LEFT COLUMN: Copy -->

  <text x="${leftCx}" y="${brandY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${brandSize}" font-weight="700"
        letter-spacing="0.18em" fill="${CHARCOAL}">SWITCHBOARD</text>

  <line x1="${marginL}" y1="${divider1Y}" x2="${marginR}" y2="${divider1Y}"
        stroke="${CHARCOAL}" stroke-width="1.5" stroke-opacity="0.2"/>

  <text x="${leftCx}" y="${h1Line1Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${headlineSize}" font-weight="800"
        fill="${CHARCOAL}">Take this board</text>

  <text x="${leftCx}" y="${h1Line2Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${headlineSize}" font-weight="800"
        fill="${CHARCOAL}">home.</text>

  <text x="${leftCx}" y="${subY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${subSize}" font-weight="600"
        fill="${AMBER_DARK}">Scan the code. See what&#8217;s new here</text>

  <text x="${leftCx}" y="${sub2Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${subSize}" font-weight="600"
        fill="${AMBER_DARK}">&#8212; from anywhere.</text>

  <text x="${leftCx}" y="${bizY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${bizSize}" font-weight="700"
        fill="${CHARCOAL}">${safeName}</text>

  <text x="${leftCx}" y="${addrY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${addrSize}" font-weight="400"
        fill="${AMBER_DARK}">${safeAddr}</text>

  <text x="${leftCx}" y="${taglineY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${taglineSize}" font-weight="700"
        letter-spacing="0.08em" fill="${CHARCOAL}">Real. Local. Now.</text>

  <!-- RIGHT COLUMN: QR -->

  <rect x="${qrX - qrPad}" y="${qrY - qrPad}"
        width="${qrSize + qrPad * 2}" height="${qrSize + qrPad * 2}"
        rx="${qrCorner}" ry="${qrCorner}"
        fill="${WHITE}"/>

  <g>
      ${qrRects}
  </g>

  <text x="${rightCx}" y="${trustY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${trustSize}" font-weight="400"
        fill="${AMBER_DARK}">No app. No account. Just your camera.</text>

  <text x="${rightCx}" y="${urlY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${urlSize}" font-weight="600"
        letter-spacing="0.04em" fill="${CHARCOAL}">www.switchboard.town</text>`

  return svgWrapper(w, h, r, content)
}

// ── Portrait layout: stacked (copy top, QR middle, business bottom) ─
function buildPortrait(
  w: number, h: number, safeName: string, safeAddr: string, url: string
): string {
  const r = Math.max(12, Math.floor(w * 0.035))
  const scale = Math.min(w / 576, h / 864)
  const s = (base: number) => base * scale

  const cx = Math.floor(w / 2)
  const pad = Math.max(20, Math.floor(w * 0.06))

  // Font sizes
  const brandSize = Math.max(10, Math.floor(s(13)))
  const headlineSize = Math.max(22, Math.floor(s(38)))
  const subSize = Math.max(11, Math.floor(s(15)))
  const bizSize = Math.max(16, Math.floor(s(26)))
  const addrSize = Math.max(10, Math.floor(s(14)))
  const taglineSize = Math.max(10, Math.floor(s(14)))
  const trustSize = Math.max(9, Math.floor(s(11)))
  const urlSize = Math.max(8, Math.floor(s(10)))

  // Top section: brand + headline + subhead
  const brandY = Math.floor(h * 0.06)
  const dividerY = Math.floor(h * 0.09)
  const h1Line1Y = Math.floor(h * 0.17)
  const h1Line2Y = h1Line1Y + Math.floor(s(46))
  const subY = h1Line2Y + Math.floor(s(36))
  const sub2Y = subY + Math.floor(s(20))

  // Middle section: QR code
  const qrSize = Math.floor(Math.min(w * 0.55, h * 0.30))
  const qrX = Math.floor(cx - qrSize / 2)
  const qrY = Math.floor(h * 0.42)
  const qrPad = Math.max(10, Math.floor(s(16)))
  const qrCorner = Math.max(8, Math.floor(s(12)))

  // Bottom section: business name + address + trust + URL + tagline
  const trustY = qrY + qrSize + qrPad + Math.floor(s(24))
  const bizY = Math.floor(h * 0.82)
  const addrY = bizY + Math.floor(s(24))
  const taglineY = Math.floor(h * 0.93)
  const urlY = taglineY + Math.floor(s(18))

  const qrRects = generateQrRects(url, qrSize, qrX, qrY)

  const content = `  <!-- TOP: Brand + Headline -->

  <text x="${cx}" y="${brandY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${brandSize}" font-weight="700"
        letter-spacing="0.18em" fill="${CHARCOAL}">SWITCHBOARD</text>

  <line x1="${pad}" y1="${dividerY}" x2="${w - pad}" y2="${dividerY}"
        stroke="${CHARCOAL}" stroke-width="1.5" stroke-opacity="0.2"/>

  <text x="${cx}" y="${h1Line1Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${headlineSize}" font-weight="800"
        fill="${CHARCOAL}">Take this board</text>

  <text x="${cx}" y="${h1Line2Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${headlineSize}" font-weight="800"
        fill="${CHARCOAL}">home.</text>

  <text x="${cx}" y="${subY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${subSize}" font-weight="600"
        fill="${AMBER_DARK}">Scan the code. See what&#8217;s new here</text>

  <text x="${cx}" y="${sub2Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${subSize}" font-weight="600"
        fill="${AMBER_DARK}">&#8212; from anywhere.</text>

  <!-- MIDDLE: QR Code -->

  <rect x="${qrX - qrPad}" y="${qrY - qrPad}"
        width="${qrSize + qrPad * 2}" height="${qrSize + qrPad * 2}"
        rx="${qrCorner}" ry="${qrCorner}"
        fill="${WHITE}"/>

  <g>
      ${qrRects}
  </g>

  <text x="${cx}" y="${trustY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${trustSize}" font-weight="400"
        fill="${AMBER_DARK}">No app. No account. Just your camera.</text>

  <!-- BOTTOM: Business + URL -->

  <text x="${cx}" y="${bizY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${bizSize}" font-weight="700"
        fill="${CHARCOAL}">${safeName}</text>

  <text x="${cx}" y="${addrY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${addrSize}" font-weight="400"
        fill="${AMBER_DARK}">${safeAddr}</text>

  <text x="${cx}" y="${taglineY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${taglineSize}" font-weight="700"
        letter-spacing="0.08em" fill="${CHARCOAL}">Real. Local. Now.</text>

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
