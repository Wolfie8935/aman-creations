# Aman Creations — Royal Redesign Spec

**Date:** 2026-06-06
**Goal:** Make the landing page beautiful, mobile-first, and royal; connect the hero to real
products; and make the admin panel beautiful, easy, and phone-friendly — without breaking any
functionality or database.

## Decisions (from brainstorming)

- **Architecture:** Keep the existing React-via-CDN + in-browser Babel + Firestore setup. No rewrite.
  Single `index.html`. All edits are additive.
- **Hero visual:** Auto-pull **real product photos** from admin (not generated SVG art).
- **Featured logic:** New manual `is_featured` toggle per product; hero shows featured products,
  falls back to newest visible products if none are marked, and falls back to SVG art if a featured
  product has no photo.
- **Scope:** Full landing redesign + admin redesign.
- **Mood:** Dark charcoal + gold, elevated ("jewellery-box" royal). Fonts unchanged
  (Playfair Display / Cormorant Garamond / DM Sans).

## Constraints / Safety

- No database migration. Firestore is schemaless; `is_featured` defaults to false for old products.
- Preserve all existing class names, handlers, cart/checkout/WhatsApp/email/admin Firestore wiring.
- Everything degrades gracefully: missing photos, no featured items, legacy products.

## Components affected

| Area | File location (index.html) | Change |
|------|----------------------------|--------|
| Hero | `const Hero` (~2849) | Rewrite visual to use real featured photos + chip; SVG fallback. Mobile-first. |
| Featured data | `loadStorefrontData` (~3835) | Expose featured selection helper; keep padding logic safe. |
| ProductForm | (~4311) | Add `is_featured` to state + save; "Feature on homepage" toggle. |
| ProductsList | (~4244) | One-tap featured star + badge. |
| Admin shell | `AdminApp` (~4805) | Mobile drawer nav, brand polish. |
| CSS | `<style>` head block | Hero, landing-section polish, admin redesign + responsive. |

## Hero design

- Background: charcoal + ambient gold blobs + noise grain (existing) + faint damask ornament.
- Content (centered on mobile): eyebrow → Playfair headline (editable via Tweaks) → subline →
  CTAs (Explore Collection gold, WhatsApp ghost) → trust meta row.
- Visual: gold-framed real product photo(s) with floating name+price chip and glow ring.
  Mobile = single hero card; desktop = 3-photo overlapping stack.
- Selection: `is_featured` products, else newest visible, else SVG art.

## Admin design

- Brand-matched dark+gold, more whitespace, dashboard counts.
- Mobile: sidebar → top bar + slide-in drawer; single-column forms; large tap targets.
- Product form grouped: Basics → Images → Pricing & Options → Visibility.
- Featured controls in form + list (star toggle/badge).

## Out of scope (YAGNI)

- No new backend, auth changes, payment, or analytics.
- No new fonts or framework.
- No changes to offers/sections data model beyond what already exists.

## Verification

Open storefront + admin: hero renders real photos, cart add/qty/remove, checkout → WhatsApp,
floating WhatsApp, product add/edit with featured toggle persists, no console errors, mobile layout
at 390px width.
