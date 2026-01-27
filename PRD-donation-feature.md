# Product Requirements Document: Donation/Support Feature

## Executive Summary
Add a donation/support mechanism to Switchboard to help sustain the platform and cover operational costs while maintaining free access for all users.

## Background & Motivation

### Problem Statement
- Switchboard provides free community bulletin board services
- Platform incurs costs: hosting (Netlify), database (Supabase), domain, maintenance
- Need sustainable funding model without charging businesses or users
- Want to maintain accessibility while allowing supporters to contribute

### Goals
1. Generate revenue to cover operational costs (~$50-100/month)
2. Keep platform free for all users and businesses
3. Maintain clean, non-intrusive user experience
4. Build community support and investment

## User Stories

### As a grateful business owner
- I want to support the platform that hosts my bulletin board for free
- I want a simple, trusted way to contribute
- I want to know my donation helps the community

### As a community member
- I want to support local digital infrastructure
- I want the platform to remain free for everyone
- I want transparency about how donations are used

### As a platform administrator
- I need to track donation metrics
- I want minimal payment processing overhead
- I need simple tax/accounting integration

## Proposed Solution

### Phase 1: Simple Integration (Week 1)
**Platform: Buy Me a Coffee**

#### Implementation
1. Create Buy Me a Coffee account for "Switchboard"
2. Add donation buttons in three locations:
   - Footer (all pages): "Support Switchboard ☕"
   - About page: Dedicated section with explanation
   - Post-upload success: "Love Switchboard? Buy us a coffee!"

#### Button Design
```tsx
// Component: DonationButton.tsx
<a 
  href="https://www.buymeacoffee.com/switchboard"
  target="_blank"
  rel="noopener noreferrer"
  className="donation-button"
>
  <span className="coffee-icon">☕</span>
  Support Switchboard
</a>
```

#### Styling
- Subtle, warm colors matching cork board theme
- Small size in footer (text link)
- Medium size on About page (button)
- Optional: Floating button on desktop (bottom-right)

### Phase 2: Native Integration (Month 2-3)
**Platform: Stripe Checkout**

#### Features
- Custom donation amounts ($3, $5, $10, custom)
- Monthly recurring option
- On-site checkout experience
- Donor recognition page (optional)

#### Technical Implementation
```tsx
// API Route: /api/create-donation
POST /api/create-donation
Body: { amount: number, recurring?: boolean }
Response: { checkoutUrl: string }

// Frontend: Donation Modal
<DonationModal 
  amounts={[3, 5, 10]}
  allowCustom={true}
  allowRecurring={true}
/>
```

## Messaging & Copy

### Value Proposition
"Keep Switchboard Free for Everyone"

### Donation Page Copy
```
Switchboard connects communities with free digital bulletin boards. 
Your support helps us:
• Keep the platform free for all businesses
• Maintain and improve the service
• Add new towns and features
• Cover hosting and operational costs

100% of donations go toward running Switchboard.
```

### Suggested Amounts
- ☕ Coffee: $3 - "Keep us caffeinated"
- 🥪 Lunch: $10 - "Feed the servers"
- 📌 Board Sponsor: $25 - "Support a whole bulletin board"
- 🏘️ Town Champion: $100 - "Bring Switchboard to new communities"

## Success Metrics

### Primary KPIs
- Monthly Recurring Revenue (MRR)
- Donation Conversion Rate (donors/users)
- Average Donation Amount
- Cost Coverage Percentage

### Target Metrics (6 months)
- 50+ unique donors
- $200+ monthly donations
- 2% visitor-to-donor conversion
- 100% operational cost coverage

## Design Considerations

### Placement Principles
- Never block core functionality
- No donation walls or paywalls
- Subtle presence, not aggressive
- Thank donors without creating tiers

### Visual Design
- Match existing cork board aesthetic
- Warm, community-focused imagery
- Coffee/community themes
- No flashing or animated CTAs

## Technical Requirements

### Phase 1 (Buy Me a Coffee)
- Add BMC button component
- Add BMC widget script (optional)
- Track button clicks with analytics
- No backend changes required

### Phase 2 (Stripe)
- Stripe account setup
- Environment variables:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Database table: `donations` (optional)
- Webhook endpoint for confirmations
- Email receipts via Stripe

## Privacy & Compliance

### Data Handling
- No donor data stored locally (Phase 1)
- Optional donor recognition (opt-in only)
- Comply with payment platform ToS
- Clear refund policy

### Tax Considerations
- Not a registered nonprofit
- Donations are NOT tax-deductible
- Clear disclaimer required
- Consider LLC/nonprofit status if successful

## Rollout Plan

### Week 1
1. Create Buy Me a Coffee account
2. Add button to Footer component
3. Deploy and monitor

### Week 2-4
1. Add About page section
2. Create dedicated /support page
3. Add post-upload prompt
4. Monitor conversion rates

### Month 2
1. Evaluate Phase 1 success
2. If >$100/month, implement Stripe
3. Add recurring donations
4. Create donor dashboard

## Alternative Approaches Considered

### Rejected: Advertising
- Compromises clean design
- Poor user experience
- Minimal revenue potential

### Rejected: Paid Tiers
- Creates inequality
- Reduces community access
- Complex to implement

### Rejected: Mandatory Fees
- Barriers to entry
- Reduces adoption
- Against mission

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low donation rate | Platform unsustainable | Start with low costs, seek grants |
| Payment platform fees | Reduced revenue | Choose lowest fee option |
| Donor fatigue | Decreasing donations | Vary messaging, show impact |
| Tax complexity | Legal issues | Consult accountant, clear disclaimers |

## Future Enhancements

### Potential Features (Year 2)
- Business sponsorships
- Town-specific fundraising
- Grant applications
- Nonprofit registration
- Donor perks (stickers, recognition)
- Annual fundraising campaigns

## Implementation Checklist

### Phase 1 Launch
- [ ] Create Buy Me a Coffee account
- [ ] Design donation button component
- [ ] Add button to Footer
- [ ] Create /support page
- [ ] Add analytics tracking
- [ ] Write donation page copy
- [ ] Test payment flow
- [ ] Deploy to production
- [ ] Announce to community
- [ ] Monitor metrics

### Success Criteria
- At least 10 donations in first month
- Cover hosting costs within 3 months
- Maintain or improve user satisfaction
- No negative impact on core metrics

## Conclusion

A donation feature via Buy Me a Coffee provides a low-friction way to generate sustainable funding while maintaining Switchboard's mission of free, accessible community bulletin boards. The phased approach allows testing donor interest before investing in more complex payment infrastructure.

---

*Document Version: 1.0*  
*Last Updated: January 21, 2026*  
*Author: Switchboard Team*  
*Status: Draft - Ready for Review*