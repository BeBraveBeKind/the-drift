import QRCode from 'qrcode'

// ── Colors ──────────────────────────────────────────────────────────
const YELLOW = '#FFD600'
const CHARCOAL = '#1E293B'
const AMBER_DARK = '#92400E'
const WHITE = '#FFFFFF'
const FONT = 'Plus Jakarta Sans, -apple-system, Helvetica Neue, Arial, sans-serif'

// ── Preset Sizes (width x height in inches, at 96 DPI) ─────────────
export const SIGN_SIZES: Record<string, { w: number; h: number; label: string }> = {
  '4x6':     { w: 576,  h: 384,  label: 'Postcard' },
  '5x7':     { w: 672,  h: 480,  label: 'Small flyer' },
  '6x9':     { w: 864,  h: 576,  label: 'Standard sign' },
  '8.5x11':  { w: 1056, h: 816,  label: 'Full letter page' },
  '5.5x8.5': { w: 816,  h: 528,  label: 'Half letter' },
}

// ── Helpers ─────────────────────────────────────────────────────────

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

function fitBusinessName(
  name: string, x: number, y: number, maxWidth: number,
  baseFontSize: number, minFontSize: number, lineSpacing: number
): { svg: string; bottomY: number } {
  let fontSize = baseFontSize
  let tw = estimateTextWidth(name, fontSize)

  if (tw <= maxWidth) {
    return {
      svg: `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="${CHARCOAL}">${name}</text>`,
      bottomY: y,
    }
  }

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
  const longerLine = estimateTextWidth(line1, fontSize) > estimateTextWidth(line2, fontSize) ? line1 : line2
  while (fontSize > minFontSize && estimateTextWidth(longerLine, fontSize) > maxWidth) {
    fontSize -= 2
  }
  return {
    svg: `<text x="${x}" y="${y}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="${CHARCOAL}">${line1}</text>
    <text x="${x}" y="${y + lineSpacing}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" font-weight="800" fill="${CHARCOAL}">${line2}</text>`,
    bottomY: y + lineSpacing,
  }
}

// 4-point star (✦) as SVG path
function star4(cx: number, cy: number, size: number, fill: string, opacity: number = 0.45): string {
  const s = size / 2
  const p = size * 0.15 // pinch for the diamond points
  return `<path d="M ${cx},${(cy - s).toFixed(1)} Q ${(cx + p).toFixed(1)},${(cy - p).toFixed(1)} ${(cx + s).toFixed(1)},${cy} Q ${(cx + p).toFixed(1)},${(cy + p).toFixed(1)} ${cx},${(cy + s).toFixed(1)} Q ${(cx - p).toFixed(1)},${(cy + p).toFixed(1)} ${(cx - s).toFixed(1)},${cy} Q ${(cx - p).toFixed(1)},${(cy - p).toFixed(1)} ${cx},${(cy - s).toFixed(1)} Z" fill="${fill}" opacity="${opacity}"/>`
}

function dotDivider(cx: number, y: number, lineWidth: number, scale: number): string {
  const dotR = Math.max(2, 3 * scale)
  const gap = dotR * 4
  const sw = Math.max(1, 1.5 * scale)
  return `<line x1="${(cx - lineWidth / 2).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(cx - gap).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${CHARCOAL}" stroke-width="${sw.toFixed(1)}" opacity="0.2"/>
    <circle cx="${cx}" cy="${y.toFixed(1)}" r="${dotR.toFixed(1)}" fill="${AMBER_DARK}" opacity="0.5"/>
    <line x1="${(cx + gap).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(cx + lineWidth / 2).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${CHARCOAL}" stroke-width="${sw.toFixed(1)}" opacity="0.2"/>`
}

// Scan/upload instruction block with bold verbs
function instructionBlock(cx: number, y1: number, y2: number, fontSize: number): string {
  return `<text x="${cx}" y="${y1}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" fill="${CHARCOAL}"><tspan font-weight="800">Scan</tspan><tspan font-weight="400" opacity="0.65"> to see what\u2019s posted.</tspan></text>
  <text x="${cx}" y="${y2}" text-anchor="middle" font-family="${FONT}" font-size="${fontSize}" fill="${AMBER_DARK}"><tspan font-weight="800" font-style="italic">Upload a photo</tspan><tspan font-weight="400" opacity="0.65"> to refresh.</tspan></text>`
}

// Viewfinder corners around QR + "SCAN WITH YOUR PHONE" label
function scanAffordance(
  cx: number, qrX: number, qrY: number, qrSize: number, qrPad: number,
  labelY: number, labelSize: number
): string {
  // Viewfinder L-brackets on QR white card corners
  const inset = qrPad * 0.3
  const x1 = qrX - qrPad + inset
  const y1 = qrY - qrPad + inset
  const x2 = qrX + qrSize + qrPad - inset
  const y2 = qrY + qrSize + qrPad - inset
  const cl = Math.max(8, qrSize * 0.12) // corner arm length
  const sw = Math.max(2, qrSize * 0.025)

  return `<g stroke="${CHARCOAL}" stroke-width="${sw.toFixed(1)}" fill="none" stroke-linecap="round" opacity="0.3">
    <path d="M ${x1.toFixed(1)},${(y1+cl).toFixed(1)} L ${x1.toFixed(1)},${y1.toFixed(1)} L ${(x1+cl).toFixed(1)},${y1.toFixed(1)}"/>
    <path d="M ${(x2-cl).toFixed(1)},${y1.toFixed(1)} L ${x2.toFixed(1)},${y1.toFixed(1)} L ${x2.toFixed(1)},${(y1+cl).toFixed(1)}"/>
    <path d="M ${x1.toFixed(1)},${(y2-cl).toFixed(1)} L ${x1.toFixed(1)},${y2.toFixed(1)} L ${(x1+cl).toFixed(1)},${y2.toFixed(1)}"/>
    <path d="M ${(x2-cl).toFixed(1)},${y2.toFixed(1)} L ${x2.toFixed(1)},${y2.toFixed(1)} L ${x2.toFixed(1)},${(y2-cl).toFixed(1)}"/>
  </g>
  <text x="${cx}" y="${labelY.toFixed(1)}" text-anchor="middle" font-family="${FONT}" font-size="${labelSize}" font-weight="700" letter-spacing="0.14em" fill="${CHARCOAL}" opacity="0.5">SCAN WITH YOUR PHONE</text>`
}

function svgWrapper(w: number, h: number, r: number, content: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 ${w} ${h}"
     width="${w}" height="${h}">

  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;1,600;1,700&amp;display=swap');
    </style>
  </defs>

  <rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${YELLOW}"/>

${content}

</svg>`
}

// ── Portrait ────────────────────────────────────────────────────────
function buildPortrait(
  w: number, h: number, safeName: string, townName: string, url: string
): string {
  const r = Math.max(12, Math.floor(w * 0.035))
  const scale = Math.min(w / 576, h / 864)
  const s = (base: number) => base * scale
  const cx = Math.floor(w / 2)
  const divW = Math.floor(w * 0.48)
  const pad = Math.max(20, Math.floor(w * 0.07))

  // Lockup (3–10%) — ✦ SWITCHBOARD ✦ + URL
  const div1Y         = Math.floor(h * 0.035)
  const logoY         = Math.floor(h * 0.07)
  const logoSize      = Math.max(14, Math.floor(s(20)))
  const starSize      = Math.max(8, Math.floor(logoSize * 0.6))
  const logoTextW     = estimateTextWidth('SWITCHBOARD', logoSize) + 11 * 0.16 * logoSize // add letter-spacing
  const logoHalfW     = Math.floor(logoTextW / 2)
  const starGap       = Math.floor(logoSize * 0.6)
  const urlLockupY    = logoY + Math.floor(s(15))
  const urlLockupSize = Math.max(7, Math.floor(s(10)))

  // Business (14–22%)
  const bizSize  = Math.max(28, Math.floor(s(48)))
  const bizY     = Math.floor(h * 0.17)
  const bizMaxW  = w - pad * 2
  const bizName  = fitBusinessName(safeName, cx, bizY, bizMaxW, bizSize, Math.floor(bizSize * 0.5), Math.floor(s(38)))
  const townY    = bizName.bottomY + Math.floor(s(18))
  const townSize = Math.max(9, Math.floor(s(12)))

  // Divider (25%)
  const div2Y = Math.floor(h * 0.25)

  // CTA (29–36%)
  const cta1Size = Math.max(16, Math.floor(s(24)))
  const cta2Size = Math.max(20, Math.floor(s(30)))
  const cta1Y    = Math.floor(h * 0.30)
  const cta2Y    = Math.floor(h * 0.36)

  // Action card (40–73%) — white card with viewfinder QR + instructions
  const qrSize       = Math.floor(Math.min(w * 0.38, h * 0.16))
  const qrPad        = Math.max(8, Math.floor(s(10)))
  const instrSize     = Math.max(10, Math.floor(s(13)))
  const labelSize     = Math.max(7, Math.floor(s(9)))
  const cardPadV      = Math.floor(s(14))
  const labelH        = labelSize * 1.4
  const cardGap1      = Math.floor(s(8))
  const cardGap2      = Math.floor(s(12))
  const instrGap      = Math.floor(s(6))
  const cardH         = cardPadV + labelH + cardGap1 + qrSize + qrPad * 2 + cardGap2 + instrSize + instrGap + instrSize + cardPadV
  const cardW         = Math.min(w - pad * 2, Math.max(qrSize + qrPad * 6, w * 0.65))
  const cardX         = Math.floor(cx - cardW / 2)
  const cardTopY      = Math.floor(h * 0.40)
  const cardCorner    = Math.max(10, Math.floor(s(14)))

  // Position elements inside card
  let cy = cardTopY + cardPadV
  const labelY = Math.floor(cy + labelH * 0.8)
  cy += labelH + cardGap1
  const qrTopY = cy + qrPad
  const qrX = Math.floor(cx - qrSize / 2)
  cy += qrSize + qrPad * 2 + cardGap2
  const instr1Y = Math.floor(cy + instrSize * 0.8)
  cy += instrSize + instrGap
  const instr2Y = Math.floor(cy + instrSize * 0.8)

  // Bottom (80–90%)
  const taglineSize = Math.max(14, Math.floor(s(18)))
  const botUrlSize  = Math.max(9, Math.floor(s(11)))
  const tagline1Y   = Math.floor(h * 0.81)
  const tagline2Y   = tagline1Y + Math.floor(s(20))
  const botUrlY     = tagline2Y + Math.floor(s(16))

  const qrRects = generateQrRects(url, qrSize, qrX, qrTopY)

  const starCy = logoY - logoSize * 0.35

  const content = `  <!-- LOCKUP -->
  ${dotDivider(cx, div1Y, divW, scale)}
  ${star4(cx - logoHalfW - starGap, starCy, starSize, CHARCOAL)}
  <text x="${cx}" y="${logoY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${logoSize}" font-weight="800"
        letter-spacing="0.16em" fill="${CHARCOAL}">SWITCHBOARD</text>
  ${star4(cx + logoHalfW + starGap, starCy, starSize, CHARCOAL)}
  <text x="${cx}" y="${urlLockupY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${urlLockupSize}" font-weight="600"
        letter-spacing="0.08em" fill="${AMBER_DARK}" opacity="0.55">www.switchboard.town</text>

  <!-- BUSINESS -->
  ${bizName.svg}
  <text x="${cx}" y="${townY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${townSize}" font-weight="600"
        letter-spacing="0.18em" fill="${AMBER_DARK}">${escapeXml(townName.toUpperCase())}</text>

  ${dotDivider(cx, div2Y, divW, scale)}

  <!-- CTA -->
  <text x="${cx}" y="${cta1Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${cta1Size}" font-weight="700"
        fill="${CHARCOAL}">The board you\u2019re looking at?</text>
  <text x="${cx}" y="${cta2Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${cta2Size}" font-weight="700"
        font-style="italic" fill="${AMBER_DARK}">It\u2019s also online.</text>

  <!-- ACTION CARD -->
  <rect x="${cardX}" y="${cardTopY}"
        width="${cardW}" height="${cardH}"
        rx="${cardCorner}" ry="${cardCorner}" fill="${WHITE}"/>
  ${scanAffordance(cx, qrX, qrTopY, qrSize, qrPad, labelY, labelSize)}
  <g>
      ${qrRects}
  </g>
  ${instructionBlock(cx, instr1Y, instr2Y, instrSize)}

  <!-- BOTTOM -->
  <text x="${cx}" y="${tagline1Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${taglineSize}" font-weight="700"
        letter-spacing="0.06em" fill="${CHARCOAL}">Every board in town.</text>
  <text x="${cx}" y="${tagline2Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${taglineSize}" font-weight="700"
        letter-spacing="0.06em" fill="${CHARCOAL}">One scan away.</text>
  <text x="${cx}" y="${botUrlY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${botUrlSize}" font-weight="600"
        letter-spacing="0.04em" fill="${AMBER_DARK}" opacity="0.55">www.switchboard.town</text>`

  return svgWrapper(w, h, r, content)
}

// ── Landscape ───────────────────────────────────────────────────────
// Flows: lockup → business → divider → CTA → action card → tagline
function buildLandscape(
  w: number, h: number, safeName: string, townName: string, url: string
): string {
  const r = Math.max(12, Math.floor(h * 0.035))
  const scale = Math.min(w / 864, h / 576)
  const s = (base: number) => base * scale
  const cx = Math.floor(w / 2)
  const pad = Math.max(24, Math.floor(w * 0.04))
  const divW = Math.floor(w * 0.35)

  // Font sizes — landscape: readable but compact
  const logoSize      = Math.max(12, Math.floor(s(18)))
  const starSize      = Math.max(6, Math.floor(logoSize * 0.55))
  const logoTextW     = estimateTextWidth('SWITCHBOARD', logoSize) + 11 * 0.16 * logoSize
  const logoHalfW     = Math.floor(logoTextW / 2)
  const starGap       = Math.floor(logoSize * 0.55)
  const urlLockupSize = Math.max(6, Math.floor(s(8)))
  const bizSize       = Math.max(24, Math.floor(s(38)))
  const townSize      = Math.max(8, Math.floor(s(10)))
  const cta1Size      = Math.max(14, Math.floor(s(18)))
  const cta2Size      = Math.max(16, Math.floor(s(22)))
  const instrSize     = Math.max(8, Math.floor(s(9)))
  const taglineSize   = Math.max(10, Math.floor(s(13)))
  const labelSize     = Math.max(5, Math.floor(s(6)))

  // QR size — landscape-appropriate
  const qrSize   = Math.floor(Math.min(w * 0.14, h * 0.18))
  const qrPad    = Math.max(5, Math.floor(s(6)))

  // Action card dimensions
  const cardPadV  = Math.floor(s(6))
  const labelH    = labelSize * 1.4
  const cardGap1  = Math.floor(s(3))
  const cardGap2  = Math.floor(s(4))
  const instrGap  = Math.floor(s(3))
  const cardH     = cardPadV + labelH + cardGap1 + qrSize + qrPad * 2 + cardGap2 + instrSize + instrGap + instrSize + cardPadV
  const cardW     = Math.min(w - pad * 4, Math.max(qrSize + qrPad * 6, w * 0.45))
  const cardCorner = Math.max(8, Math.floor(s(10)))

  // Measure content heights for dynamic spacing
  const bizMaxW = w - pad * 4
  const bizTest = fitBusinessName(safeName, cx, 0, bizMaxW, bizSize, Math.floor(bizSize * 0.45), Math.floor(s(28)))
  const bizLines = bizTest.bottomY > 0 ? 2 : 1

  const lockupH = logoSize + s(2) + urlLockupSize
  const bizH    = (bizLines === 2 ? bizSize + s(28) : bizSize) + s(12) + townSize
  const divLineH = s(2)
  const ctaH    = cta1Size + s(6) + cta2Size
  const taglineBlockH = taglineSize + Math.floor(taglineSize + s(4)) + Math.floor(s(14)) + Math.max(8, Math.floor(s(10)))
  const bottomH = taglineBlockH

  const totalContent = lockupH + bizH + divLineH + ctaH + cardH + bottomH
  const margin = h * 0.04
  const freeSpace = h - totalContent - margin * 2
  const gap = Math.max(s(4), freeSpace / 5) // 5 gaps between 6 groups

  // Position top-down from y=0, then center vertically
  let y = 0

  // Lockup
  const logoY_raw = Math.floor(y + logoSize * 0.8)
  y += logoSize + Math.floor(s(2))
  const urlLockupY_raw = Math.floor(y + urlLockupSize * 0.8)
  y += urlLockupSize + Math.floor(gap)

  // Business
  const bizY_raw = Math.floor(y + bizSize * 0.8)
  const bizName_raw = fitBusinessName(safeName, cx, bizY_raw, bizMaxW, bizSize, Math.floor(bizSize * 0.45), Math.floor(s(28)))
  const townY_raw = bizName_raw.bottomY + Math.floor(s(12))
  y = townY_raw + Math.floor(townSize * 0.2)

  // Divider
  y += Math.floor(gap * 0.35)
  const div1Y_raw = y
  y += Math.floor(gap * 0.65)

  // CTA
  const cta1Y_raw = Math.floor(y + cta1Size * 0.8)
  y += cta1Size + Math.floor(s(6))
  const cta2Y_raw = Math.floor(y + cta2Size * 0.8)
  y += cta2Size + Math.floor(gap)

  // Action card
  const cardTopY_raw = y
  let cy_raw = cardTopY_raw + cardPadV
  const labelY_raw = Math.floor(cy_raw + labelH * 0.8)
  cy_raw += labelH + cardGap1
  const qrTopY_raw = cy_raw + qrPad
  cy_raw += qrSize + qrPad * 2 + cardGap2
  const instr1Y_raw = Math.floor(cy_raw + instrSize * 0.8)
  cy_raw += instrSize + instrGap
  const instr2Y_raw = Math.floor(cy_raw + instrSize * 0.8)
  y += cardH + Math.floor(gap)

  // Bottom
  const botUrlSize = Math.max(8, Math.floor(s(10)))
  const tagline1Y_raw = Math.floor(y + taglineSize * 0.8)
  const tagline2Y_raw = tagline1Y_raw + Math.floor(taglineSize + s(4))
  const botUrlY_raw   = tagline2Y_raw + Math.floor(s(14))
  const contentBottom = botUrlY_raw + botUrlSize * 0.3

  // Center vertically
  const vOffset = Math.floor((h - contentBottom) / 2)
  const logoY = logoY_raw + vOffset
  const urlLockupY = urlLockupY_raw + vOffset
  const bizY = bizY_raw + vOffset
  const bizName = fitBusinessName(safeName, cx, bizY, bizMaxW, bizSize, Math.floor(bizSize * 0.45), Math.floor(s(28)))
  const townY = bizName.bottomY + Math.floor(s(12))
  const div1Y = div1Y_raw + vOffset
  const cta1Y = cta1Y_raw + vOffset
  const cta2Y = cta2Y_raw + vOffset
  const cardTopY = cardTopY_raw + vOffset
  const cardX = Math.floor(cx - cardW / 2)
  const labelY = labelY_raw + vOffset
  const qrTopY = qrTopY_raw + vOffset
  const qrX = Math.floor(cx - qrSize / 2)
  const instr1Y = instr1Y_raw + vOffset
  const instr2Y = instr2Y_raw + vOffset
  const tagline1Y = tagline1Y_raw + vOffset
  const tagline2Y = tagline2Y_raw + vOffset
  const botUrlY = botUrlY_raw + vOffset

  const qrRects = generateQrRects(url, qrSize, qrX, qrTopY)

  const starCy = logoY - logoSize * 0.35

  const content = `  <!-- LOCKUP -->
  ${star4(cx - logoHalfW - starGap, starCy, starSize, CHARCOAL)}
  <text x="${cx}" y="${logoY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${logoSize}" font-weight="800"
        letter-spacing="0.16em" fill="${CHARCOAL}">SWITCHBOARD</text>
  ${star4(cx + logoHalfW + starGap, starCy, starSize, CHARCOAL)}
  <text x="${cx}" y="${urlLockupY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${urlLockupSize}" font-weight="600"
        letter-spacing="0.08em" fill="${AMBER_DARK}" opacity="0.55">www.switchboard.town</text>

  <!-- BUSINESS -->
  ${bizName.svg}
  <text x="${cx}" y="${townY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${townSize}" font-weight="600"
        letter-spacing="0.18em" fill="${AMBER_DARK}">${escapeXml(townName.toUpperCase())}</text>

  ${dotDivider(cx, div1Y, divW * 0.8, scale)}

  <!-- CTA -->
  <text x="${cx}" y="${cta1Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${cta1Size}" font-weight="700"
        fill="${CHARCOAL}">The board you\u2019re looking at?</text>
  <text x="${cx}" y="${cta2Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${cta2Size}" font-weight="700"
        font-style="italic" fill="${AMBER_DARK}">It\u2019s also online.</text>

  <!-- ACTION CARD -->
  <rect x="${cardX}" y="${cardTopY}"
        width="${cardW}" height="${cardH}"
        rx="${cardCorner}" ry="${cardCorner}" fill="${WHITE}"/>
  ${scanAffordance(cx, qrX, qrTopY, qrSize, qrPad, labelY, labelSize)}
  <g>
      ${qrRects}
  </g>
  ${instructionBlock(cx, instr1Y, instr2Y, instrSize)}

  <!-- BOTTOM -->
  <text x="${cx}" y="${tagline1Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${taglineSize}" font-weight="700"
        letter-spacing="0.06em" fill="${CHARCOAL}">Every board in town.</text>
  <text x="${cx}" y="${tagline2Y}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${taglineSize}" font-weight="700"
        letter-spacing="0.06em" fill="${CHARCOAL}">One scan away.</text>
  <text x="${cx}" y="${botUrlY}"
        text-anchor="middle" font-family="${FONT}"
        font-size="${botUrlSize}" font-weight="600"
        letter-spacing="0.04em" fill="${AMBER_DARK}" opacity="0.55">www.switchboard.town</text>`

  return svgWrapper(w, h, r, content)
}

// ── Public API ──────────────────────────────────────────────────────
export function buildSign(
  w: number,
  h: number,
  businessName: string,
  address: string,
  url: string,
  townName: string = '',
): string {
  const safeName = escapeXml(businessName)
  const safeTown = townName || address

  if (w >= h) {
    return buildLandscape(w, h, safeName, safeTown, url)
  } else {
    return buildPortrait(w, h, safeName, safeTown, url)
  }
}
