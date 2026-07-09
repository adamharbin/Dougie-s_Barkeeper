# BarKeeper — Build Prompt (v4)

Paste this into Claude Code to scaffold the app. This version supersedes v3 — the headline change is **labor costing**: prime cost per recipe is now driven by a labor-time field on each recipe × an hourly rate, not a period labor $ figure split evenly across recipes. Everything else carries forward from v3 unless noted.

---

## Overview

Build a full-stack web application called **BarKeeper** — an internal inventory, recipe, vendor, and cost-management tool for **Dougie's Dog Bar** (Orlando, FL Packing District). This is a leaner, purpose-built alternative to xtraCHEF: it lets a small team manage inventory, build costed recipes, track vendors, and see food cost / labor / prime cost / margin at a glance — for both the **food (kitchen)** and **bar** sides of the business.

**Stack:** Next.js (React) frontend, Supabase for auth + Postgres database + storage, deployed on Vercel. Mirrors the architecture of the existing Slobberbones "Costing Counter" app, so shared patterns (recipe costing engine, weighted-average ingredient pricing) can carry over.

**Reference prototype:** A working React prototype (`BarKeeper.jsx`) already implements the costing math, dashboard layout, permission model, upload flow, and the labor-time costing described below, using in-browser storage instead of a real database. Treat it as the source of truth for exact UI layout, copy/voice, and interaction details — this document is the source of truth for data model, architecture, and anything that needs real backend logic (auth, roles, persistence, file storage).

**Users:** Adam (owner/admin) + a couple of managers. Real email/password auth via Supabase, 2 roles: **Admin** (full access, can edit prices/recipes/vendors/settings/users, can delete) and **Manager** (can view everything, log invoices/counts/vendor info, cannot delete or manage users/settings/recipes).

**Navigation:** Top nav with five tabs — **Dashboard, Inventory, Recipes, Vendors, Settings** — matching the current prototype. There is **no separate Upload tab** — invoice upload lives inside Inventory, recipe upload lives inside Recipes (see Module 4). **Below ~760px width**, the tab bar collapses into a hamburger icon that opens a vertical dropdown menu (see Navigation & Responsive Behavior).

---

## Brand Guidelines — Exact Specs (Dougie's Dog Bar)

**Logo:** Use the actual Dougie's Barkeeper wordmark asset (attached: `logo.png`, cream/`#F0E6D8` on transparent background) in the nav header, sized around 44–56px tall depending on breakpoint. No paw-print icon, no text-based fallback logo, no tagline in the header — keep the header clean, logo only.

**Tagline (for use elsewhere — empty states, footer, marketing surfaces, not the header):** "Unleash The Fun!"

**Mascot:** "Dougie" — a poodle/goldendoodle in sunglasses holding a beer. Use sparingly (empty states, loading screens, success confirmations) — never in the header, never as a functional icon.

### Colors

**Primary:**
- Blue Heeler (deep teal): `#0D5257` — nav/header, primary buttons, primary UI color
- Poodle (cream): `#F0E6D8` — page background, light surfaces

**Secondary (accents, not dominant fills):**
- Golden Retriever (gold): `#E0A526` — highlights, badges, warnings, secondary CTAs, Shared-tag pills
- Vizsla (orange): `#E35205` — alerts, over-budget/negative cost indicators, expiring-soon flags, low-margin flags
- Baby Blue Heeler (mint teal): `#86C8BC` — success states, positive indicators, Bar-tag pills
- Greyhound (charcoal): `#3D3935` — body text
- Chow Chow (peach): `#FFB990` — Food-tag pills, soft card fills

**Applied convention (confirmed in prototype):**
- App background: Poodle `#F0E6D8`
- Nav/header bar: Blue Heeler with cream logo, active tab shown as a cream pill with teal text
- Category tag pills: Food = Chow Chow bg / dark-orange text, Bar = Baby Blue Heeler bg / dark-teal text, Shared = Golden Retriever bg / dark-gold text
- Health indicators (food cost %, prime cost %, margin): Baby Blue Heeler = on target/good, Golden Retriever = caution, Vizsla = over budget/negative
- Expiring-soon flags in Inventory: Vizsla-colored text on a soft peach row highlight
- Computed/read-only values (e.g. calculated labor cost next to a labor-time input): mint-tinted background chip with teal text, matching the "computed value" treatment in the prototype's Recipe form

### Typography
- **Headlines/nav/labels:** bold sans-serif, ALL CAPS, wide tracking — free-font stand-in for Futura PT: "Oswald" or "Archivo Black" (Google Fonts)
- **Body/table copy:** serif — free-font stand-in for Superclarendon: "Noto Serif" (Google Fonts)
- **Accent/script (sparing — empty states only, not the header):** free-font stand-in for Filmotype Keynote: "Caveat" (Google Fonts)

Note: Futura PT, Superclarendon, and Filmotype Keynote are Adobe Fonts. If you have web-licensed access to the real fonts, swap those in; otherwise use the Google Fonts stand-ins above.

### Voice
Playful, dog-pun-friendly for empty states and confirmations (e.g. "No recipes yet — let's dig one up"). Keep all functional labels, buttons, and data displays clean and unambiguous — never sacrifice clarity in cost/inventory numbers for cuteness.

---

## Navigation & Responsive Behavior

- Desktop/tablet: horizontal tab bar (Dashboard, Inventory, Recipes, Vendors, Settings) in the nav, plus the authenticated user's role shown/derived from Supabase Auth (no manual role switcher in production — that was a prototype-only convenience).
- **Below ~760px width:** collapse the tab bar into a hamburger icon (animates to an X when open) that reveals a vertical dropdown menu with all tabs. Tapping a tab navigates and closes the menu.
- Logo stays visible at all breakpoints; only the tab bar collapses.

---

## Core Modules

### 1. Dashboard

Layout, top to bottom (matches prototype exactly):

1. **Stat card row** (4 cards): Food cost %, Bar cost %, Prime cost $ (all recipes, ingredient cost + time-based labor cost), Prime cost % of sales — each color-coded (Baby Blue Heeler/Golden Retriever/Vizsla) against the targets set in Settings. The Prime cost $ card should call out how many recipes are still missing a labor-time value (those are treated as $0 labor until set, never silently estimated) so the number's completeness is obvious at a glance.
2. **Best margins / Lowest margins — side by side.** Two cards in a row: left card is the top 5 recipes by margin (menu price − ingredient cost, both $ and %), right card is the bottom 5. Recipes missing a menu price or with unpriced ingredients are excluded from both until fully costed. Color-code rows: best-margin rows in mint/good tones, negative-margin rows flagged in Vizsla orange. (Margin here is ingredient-cost-based, deliberately not netting out labor — it answers "how much room is in the menu price," separate from the labor-inclusive Prime cost stat above.)
3. **Needs attention** (full width, below the margin row): combines two kinds of flags — inventory items with no price update in 90+ days, and inventory items expiring within 3 days (pulled from expiration tracking in Inventory).
4. **Top 5 highest-cost recipes** (full width, below Needs attention): ranked by ingredient cost.

Every number should be traceable — clicking a dashboard row should route to the underlying recipe or inventory item.

### 2. Inventory
- Single inventory list, each item tagged **Food**, **Bar**, or **Shared**
- Fields: name, category tag, unit of measure, weighted-average cost per unit (calculated from purchase history), par level (optional)
- **Prices drawer** per item: log every purchase (vendor, date, quantity, unit, cost) — feeds the weighted-average cost
- **Checked-in date:** the date the most recent delivery of this item was received/logged into inventory
- **Estimated expiration date:** calculated from checked-in date + a shelf-life value set per item (editable — e.g. "ground beef: 5 days," "well vodka: no expiry"). Display a clear disclaimer that this is an estimate based on typical shelf life, not a food-safety guarantee, and should never replace a manager's own visual/smell check
- Items expiring within 3 days are visually flagged (Vizsla-colored text) in the table and surfaced on the Dashboard
- Filterable/sortable table by category tag, vendor, or expiration proximity
- Toolbar action row includes **"+ Add item"** and **"Upload invoice"** buttons side by side (see Module 4 — upload lives here, not in a separate tab)

### 3. Recipes
- Two recipe types: **Food** and **Bar**, same underlying structure, filtered by tag
- Each recipe: name, category tag, yield, ingredient lines pulled from Inventory (ingredient, quantity, unit), prep notes, **menu/selling price**, and **labor time in minutes** (time to make/prep one yield of the recipe)
- Recipe table columns: Recipe name, Tag, **Menu price**, **Labor time / labor $** (minutes and calculated cost together, or a "no time set" flag if missing), **Food cost %** (ingredient cost ÷ menu price), **Prime cost $**, **Prime cost %**
- **Per-recipe labor cost** = `(labor_minutes ÷ 60) × hourly_rate`, where `hourly_rate` is the Food or Bar rate from Settings depending on the recipe's category tag. **Per-recipe prime cost** = ingredient cost + labor cost. This fully replaces the old period-labor / even-split model — no `labor_entries` or `sales_entries` table is needed for this calculation.
- In the recipe edit form, show a **live-calculated, read-only "Labor cost" value** next to the labor-time input, so the user sees the $ impact immediately (styled as a computed chip, not an editable field) — include which hourly rate it's using in a small caption.
- Recipes with no labor time set are treated as **$0 labor**, never estimated or defaulted — flag them clearly in the table and on the Dashboard so it's obvious the prime cost is incomplete, not actually zero-labor.
- Unknown ingredients from an uploaded/pasted recipe are auto-created as inventory stubs with no price, clearly flagged so nothing silently prices at $0
- Toolbar action row includes **"+ Add recipe"** and **"Upload recipe"** buttons side by side, both **Admin-only** — Managers get read-only recipe rows (no edit, no upload, no delete)

### 4. Upload & Parsing (Invoices + Recipes) — lives inside Inventory and Recipes, not a standalone tab
- **Invoice upload** is triggered from the Inventory tab's "Upload invoice" button (available to both Admin and Manager, matching their purchase-logging permission). **Recipe upload** is triggered from the Recipes tab's "Upload recipe" button (Admin only, matching recipe-edit permission).
- Each opens a modal with:
  - A **drag-and-drop zone** (dashed border, hover/drag-active states) for a photo or PDF, that is also click-to-browse
  - A "— or —" divider
  - A paste-text fallback field
- Claude API (or equivalent structured-extraction call) extracts structured data (invoice line items, or recipe name/ingredients/yield/prep notes). The model won't reliably infer menu price, category tag, or labor time — the review screen must let the user set all three before saving.
- **Always show a review/confirm screen before saving** — no auto-save of parsed data. The review screen is a second view within the same modal flow (not a separate page), and for recipes includes a **labor time (minutes)** field alongside menu price and category tag.
- Invoice line items match to existing inventory (fuzzy match) or flag as new; matched items log a new price entry AND update the checked-in date for that item. New items are created as inventory stubs on confirm, never silently.
- Recipe parsing follows the same match-or-create-stub pattern for ingredients.
- Closing/canceling the modal at any point discards the parse — nothing persists until "Confirm & save."

### 5. Vendors
- Vendor list: name, contact (person/phone/email or "order portal only"), order deadline (day + time), delivery day(s), what they supply (free text or tags matching inventory categories)
- Add/edit vendor (Admin + Manager); delete is **Admin only**
- Vendor should be selectable when logging a Prices-drawer purchase on an inventory item, so purchase history links back to a vendor record, and selectable in the invoice-upload review screen
- Table view, sortable, with an "Add vendor" action

### 6. Settings
- **Labor rates:** two fields — **Food hourly rate** and **Bar hourly rate** — manual entry, **Admin only** to edit (Managers see this tab read-only end to end). This is the only labor input the app needs; there's no period-based labor $ entry anymore. A short inline note should explain how the rate is used: "Used with each recipe's labor time (set on the Recipes tab) to calculate labor cost: minutes ÷ 60 × hourly rate."
- **Goal margins:** target food cost %, target bar cost %, target prime cost % — these targets drive the color-coding on the Dashboard and Recipes tab. Admin only to edit.

### 7. Table Views (Inventory, Recipes, Vendors)
- Standard table UX: column sort, search/filter bar, category tag filter where applicable (Food/Bar/Shared/All), CSV export

---

## Permission Matrix (confirmed in prototype — build auth/RLS to match exactly)

| Action | Admin | Manager |
|---|---|---|
| View Dashboard, Inventory, Recipes, Vendors | ✅ | ✅ |
| Add/edit inventory items | ✅ | ✅ |
| Delete inventory items | ✅ | ❌ |
| Log a purchase (Prices drawer) | ✅ | ✅ |
| Upload/parse an invoice | ✅ | ✅ |
| Add/edit recipes (incl. labor time) | ✅ | ❌ (view only) |
| Delete recipes | ✅ | ❌ |
| Upload/parse a recipe | ✅ | ❌ |
| Add/edit vendors | ✅ | ✅ |
| Delete vendors | ✅ | ❌ |
| View Settings | ✅ | ✅ (read-only) |
| Edit labor rates / goal margins | ✅ | ❌ |
| Manage users | ✅ | ❌ |

---

## Data Model (suggested Supabase tables)

- `inventory_items` — id, name, category_tag, unit, par_level, shelf_life_days, created_at
- `inventory_prices` — id, item_id (fk), vendor_id (fk), date, quantity, unit, cost, source (manual/upload), checked_in_date
- `vendors` — id, name, contact_name, contact_method, order_deadline, delivery_days, supplies_notes
- `recipes` — id, name, category_tag, yield, menu_price, **labor_minutes**, prep_notes, created_at
- `recipe_ingredients` — id, recipe_id (fk), item_id (fk), quantity, unit
- `goal_settings` — id, target_food_cost_pct, target_bar_cost_pct, target_prime_cost_pct, **food_hourly_rate, bar_hourly_rate**, updated_at
- `uploads` — id, file_type (invoice/recipe), original_filename, parsed_status, uploaded_by, created_at
- `users` — handled via Supabase Auth, role field (admin/manager)

**Removed from v3:** `labor_entries` (period labor $ tracking) and `sales_entries` (units-sold allocation) are no longer needed — labor cost is now computed directly per recipe from `labor_minutes` and the hourly rate, with no period or sales-volume dependency.

**Derived, not stored:**
- `labor_cost = (labor_minutes / 60) * (category_tag === 'Food' ? food_hourly_rate : bar_hourly_rate)`
- `prime_cost = ingredient_cost + labor_cost`
- `margin_$ = menu_price - ingredient_cost`, `margin_% = margin_$ / menu_price * 100` (ingredient-cost-based, not prime-cost-based — see Dashboard Module 1)

---

## UX Requirements
- Mobile-friendly throughout (managers may check inventory/log counts/vendor info from the floor), with the collapsing hamburger nav described above
- Every number that drives food cost/prime cost/margin should be traceable — click through from a dashboard metric or recipe row to the underlying ingredients/purchases
- No fake or placeholder cost numbers — show "—" or "needs pricing" (ingredients) / "no time set" (labor) rather than defaulting to $0 silently
- Expiration estimates are clearly labeled as estimates, never presented as a guarantee
- Loading/empty states can use the brand voice and Dougie mascot touches; functional screens (tables, forms, cost breakdowns) stay clean and businesslike
- Drag-and-drop upload zones should show a clear hover/drag-active state and support click-to-browse as a fallback

---

## Open Questions Before Building
1. **Single vs. multiple hourly rates:** the current model uses one blended hourly rate per category (Food, Bar). If Adam wants labor cost to reflect specific employees or skill-level rates (e.g. a lead cook vs. a prep cook), that needs an `employees` table with per-employee rates and a way to assign a rate (or a blended default) per recipe — confirm before building if that level of granularity is wanted now or later.
2. **Labor time source:** confirm whether labor time per recipe will be estimated by Adam/managers up front, or eventually timed/validated against real kitchen data — this affects whether the field should support a "confidence" flag or revision history down the line.
3. **Margin panel scope:** confirm whether the Dashboard's best/worst margin panel should factor in labor cost (i.e. use prime cost instead of ingredient cost) or stay as menu price minus ingredient cost only, as it is in the prototype.

## Out of Scope (for this version)
- POS/payroll integration (labor rates are manual entry only)
- Per-employee labor rates (see Open Question 1)
- Multi-location support (single Dougie's Orlando location only)
- Public-facing anything — this is fully internal
- Manual role switcher in the UI — that was a prototype-only convenience; production roles come from Supabase Auth
