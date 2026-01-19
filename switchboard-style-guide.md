# Switchboard — Design Style Guide

## Brand Overview

**App Name:** Switchboard  
**Tagline:** "Real. Local. Now."  
**Concept:** A digital community board that captures the nostalgic feel of physical bulletin boards — cork textures, pushpins, and polaroid-style cards.

---

## Visual Direction

### Core Aesthetic
- Physical bulletin board metaphor
- Tactile, nostalgic, warm
- Analog textures in a digital space
- "Found in a coffee shop" energy

### Mood Keywords
- Community-driven
- Local & hyperlocal
- Trustworthy
- Approachable
- Nostalgic but not dated

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Cork | `#C4A574` | Background texture base |
| Cork Shadow | `#A68B5B` | Depth/shadows on cork |
| Cream | `#FDF6E3` | Polaroid frame, paper elements |
| Warm White | `#FFFEF9` | Card backgrounds, text areas |

### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| Pushpin Red | `#D94F4F` | Primary pushpin, alerts, CTAs |
| Pushpin Yellow | `#F4D03F` | Secondary pushpin, highlights |
| Pushpin Blue | `#5B9BD5` | Tertiary pushpin, links |
| Pushpin Green | `#6BBF59` | Success states, active indicators |

### Neutral Colors
| Name | Hex | Usage |
|------|-----|-------|
| Ink Black | `#2C2C2C` | Primary text |
| Pencil Gray | `#6B6B6B` | Secondary text, timestamps |
| Paper Shadow | `#00000015` | Drop shadows on cards |

---

## Typography

### Primary Font
**Font Family:** `'Quicksand'`, `'Nunito'`, or similar rounded sans-serif  
**Fallback:** `system-ui, -apple-system, sans-serif`

| Element | Weight | Size | Line Height |
|---------|--------|------|-------------|
| App Title "The Drift" | 700 (Bold) | 32px | 1.2 |
| Tagline | 500 (Medium) | 16px | 1.4 |
| Section Headers | 600 (Semi-bold) | 20px | 1.3 |
| Business Name (Card) | 600 (Semi-bold) | 14px | 1.3 |
| Date Stamp | 400 (Regular) | 11px | 1.2 |
| Body Text | 400 (Regular) | 14px | 1.5 |

### Optional Accent Font
**Font Family:** `'Caveat'`, `'Patrick Hand'`, or similar handwritten style  
**Usage:** Decorative labels, "pinned" notes, section dividers  
**Use sparingly** — only for small accent text, not body copy.

---

## Components

### Polaroid-Style Business Card

The core content unit. Each listing appears as a polaroid photo pinned to the board.

```
┌─────────────────────────┐
│  ┌───────────────────┐  │
│  │                   │  │
│  │    [THUMBNAIL]    │  │
│  │      IMAGE        │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  Business Name          │
│  Updated: Dec 24        │
│                         │
└─────────────────────────┘
        📌 (pushpin overlay at top)
```

#### Specifications

| Property | Value |
|----------|-------|
| Card Width | 160px (mobile) / 200px (desktop) |
| Card Padding | 8px |
| Border Radius | 2px (subtle, paper-like) |
| Background | `#FFFEF9` (Warm White) |
| Shadow | `0 4px 8px rgba(0,0,0,0.15)` |
| Rotation | Random between `-3deg` to `3deg` for organic feel |

#### Thumbnail Image
| Property | Value |
|----------|-------|
| Aspect Ratio | 1:1 (square) |
| Border Radius | 0px (sharp, like actual photo) |
| Border | `1px solid #E5E5E5` |

#### Business Name
| Property | Value |
|----------|-------|
| Font Size | 14px |
| Font Weight | 600 |
| Color | `#2C2C2C` |
| Max Lines | 2 (truncate with ellipsis) |

#### Date Stamp
| Property | Value |
|----------|-------|
| Font Size | 11px |
| Font Weight | 400 |
| Color | `#6B6B6B` |
| Format | "Updated: MMM DD" or "3 days ago" |

#### Pushpin
| Property | Value |
|----------|-------|
| Position | Top center, overlapping card edge |
| Size | 20px diameter |
| Colors | Randomly assigned from accent palette |
| Style | Subtle 3D effect (gradient + shadow) |

---

### Cork Board Background

The main canvas behind all content.

| Property | Value |
|----------|-------|
| Base Color | `#C4A574` |
| Texture | Cork texture overlay (subtle noise pattern) |
| Texture Opacity | 30-40% |
| Vignette | Subtle darker edges (optional) |

**Implementation options:**
1. CSS: Noise texture via SVG filter + base color
2. Image: Tileable cork texture PNG (512x512)
3. Gradient: Subtle radial gradient for depth

---

### Navigation & UI Elements

#### Buttons (Primary CTA)
| Property | Value |
|----------|-------|
| Background | `#D94F4F` (Pushpin Red) |
| Text Color | `#FFFFFF` |
| Border Radius | 8px |
| Padding | 12px 24px |
| Font Weight | 600 |
| Hover | Darken 10% |

#### Buttons (Secondary)
| Property | Value |
|----------|-------|
| Background | `#FFFEF9` |
| Text Color | `#2C2C2C` |
| Border | `2px solid #C4A574` |
| Border Radius | 8px |

#### Toggle/Filter Pills
Style as small paper tags or index card tabs.

---

## Layout Guidelines

### Grid System
- **Mobile:** 2 columns of polaroid cards
- **Tablet:** 3 columns
- **Desktop:** 4-5 columns
- **Gap:** 16px (minimum to allow pin overlap)

### Card Arrangement
- Apply subtle random rotation (`-3deg` to `3deg`) to each card
- Slight overlap is acceptable for organic feel
- Masonry layout optional for varied content heights

### Spacing Scale
| Token | Value |
|-------|-------|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |

---

## Iconography

Use simple, slightly rounded line icons. Avoid overly polished or corporate icon sets.

**Recommended style:** Phosphor Icons (regular weight) or Feather Icons

**Key icons needed:**
- Camera (for photo capture)
- Pin / Pushpin
- Map marker (locations)
- Clock (timestamps)
- Grid / List (view toggles)
- Search
- Plus (add new)

---

## Motion & Interaction

### Card Hover (Desktop)
- Slight lift: `transform: translateY(-4px)`
- Shadow increase: `box-shadow: 0 8px 16px rgba(0,0,0,0.2)`
- Transition: `200ms ease-out`

### Card Tap (Mobile)
- Brief scale: `transform: scale(0.98)` on press
- Haptic feedback if available

### Page Transitions
- Subtle fade or slide
- Avoid harsh cuts

### Loading State
- Skeleton cards with cork-toned placeholder
- Or: animated "pinning" effect

---

## Content Guidelines

### Business Card Content
Each polaroid card displays:

1. **Thumbnail Photo** — User-uploaded image of the business/flyer/posting
2. **Business Name** — Primary identifier, 2 lines max
3. **Date Stamp** — "Updated: [Date]" or relative time ("3 days ago")

### Optional Future Fields
- Location/neighborhood tag
- Category badge
- "Fresh" indicator for recent posts

---

## Accessibility

- Maintain 4.5:1 contrast ratio for all text
- Pushpin colors are decorative; don't rely on color alone for meaning
- Card rotation should be subtle enough to not impair readability
- Provide alt text for all thumbnail images
- Touch targets minimum 44x44px

---

## Asset Checklist

For implementation, you'll need:

- [ ] Cork texture (tileable PNG or SVG pattern)
- [ ] Pushpin graphic (SVG, in 4 color variants)
- [ ] Polaroid frame component
- [ ] Icon set (camera, pin, map, clock, grid, list, search, plus)
- [ ] Placeholder/skeleton card graphic
- [ ] Logo wordmark "The Drift"

---

## Reference

**Selected Design Direction:** Bulletin board metaphor with polaroid-style cards  
**Inspiration:** Physical coffee shop bulletin boards, vintage polaroids, community center postings  
**Avoid:** Overly digital/tech aesthetic, harsh colors, sterile minimalism
