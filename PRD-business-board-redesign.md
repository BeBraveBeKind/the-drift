# PRD: Business Board Landing Page Redesign

## Executive Summary
Complete redesign of the individual business board page (`/[town]/[slug]`), stripping away existing brand styling in favor of a clean, trust-building, content-first approach that serves rural users who arrive via QR code scan.

## Problem Statement
The current Switchboard UI fails to build immediate trust and clarity for first-time users. When someone scans a QR code at a physical bulletin board, they need instant confirmation they're in the right place, immediate value (seeing the board), and subtle education about community participation—all within 10 seconds.

## Success Metrics
- **Immediate Recognition**: User knows they're viewing the correct business board within 2 seconds
- **Content Visibility**: Board photo visible without scrolling on 90% of mobile devices
- **Participation Understanding**: User comprehends community-maintenance model within 10 seconds
- **Network Discovery**: User notices connection to other local boards without confusion

## User Journey
1. User is standing at physical bulletin board at Magpie Gelato
2. Sees QR code sticker with minimal text
3. Scans code with phone camera
4. Lands on this page—their entire first Switchboard experience
5. Must immediately see value and understand the system

## Design Requirements

### Hierarchy (Priority Order)
1. **Business Identity**: Name and location confirm user landed correctly
2. **Board Content**: Photo is the hero—this is what they came for
3. **Community Participation**: Invitation to help maintain the board
4. **Network Connection**: Subtle reveal of other boards in town

### Mobile-First Constraints
- Primary width: 375px (iPhone SE)
- No horizontal scrolling
- 44px minimum touch targets
- 18px minimum body text
- 4.5:1 contrast ratios

### Content Requirements
- Business name (primary)
- Address (secondary)
- Board photo (hero element)
- Last updated timestamp
- Participation CTA
- Breadcrumb to town view
- Minimal footer

### Copy Voice
- Quirky local zine energy
- Civic invitation, not product feature
- "Real. Local. Now." tagline
- Avoid: platform, content, users, engagement

## Three Design Directions

### Direction A: Photo-First
**Concept**: Board photo dominates immediately, business info overlaid
- Photo starts at very top of viewport
- Semi-transparent header overlay with business name
- Freshness badge in corner of photo
- Participation CTA directly below photo
- Network connection in subtle footer

### Direction B: Business Card Header
**Concept**: Compact business identity card, then immediate photo
- Tight 80px header with name/address/back-arrow
- Board photo immediately follows
- Floating freshness indicator
- Warm participation section with context
- Town connection as breadcrumb

### Direction C: Newspaper Column
**Concept**: Local newspaper aesthetic with strong typography
- Newspaper-style masthead with business name
- Byline-style freshness indicator
- Full-width photo as "lead story"
- Editorial-style participation invitation
- Classified-ad style footer

## Implementation Plan

### Phase 1: Prototype Development
Create three complete React/Tailwind components at 375px width, each fully functional with:
- Actual Magpie Gelato content
- Placeholder board photo
- All required elements
- Mobile-optimized interactions

### Phase 2: Testing Approach
- 5-second test: Can users identify the business?
- 10-second comprehension: Do users understand all four goals?
- Participation clarity: Do users know what the button does?
- Network discovery: Do users notice other boards exist?

### Phase 3: Selection Criteria
Choose direction based on:
1. Speed to business recognition
2. Photo visibility without scroll
3. Participation CTA clarity
4. Subtlety of network reveal

## Technical Considerations
- Server-side rendering for instant load
- Image optimization with Next.js Image
- Progressive enhancement
- Fallback for QR scan failures
- Analytics on scroll depth and CTA interaction

## Risks & Mitigations
- **Risk**: Users don't understand community maintenance
  - **Mitigation**: Contextual copy and freshness indicators
- **Risk**: Users miss network connection
  - **Mitigation**: Breadcrumb navigation and subtle town references
- **Risk**: Business identity not clear enough
  - **Mitigation**: Large type, immediate visibility

## Success Criteria
A grandmother in rural Wisconsin who has never used Switchboard should be able to:
1. Scan the QR code at her local coffee shop
2. Immediately recognize she's viewing that shop's board
3. See the actual bulletin board content
4. Understand that neighbors keep it updated
5. Notice there are other boards in town
All without reading instructions or feeling confused.

## Next Steps
1. Build three prototypes in `/app/demo/board-redesign/`
2. Implement with real Magpie Gelato data
3. Test on actual 375px viewport
4. Gather feedback from rural users if possible
5. Select winning direction for full implementation