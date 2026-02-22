# Client Dashboard Specification

## Document Purpose
This document defines the complete UX, UI, interaction, animation, and implementation behavior for the Client Dashboard page.

It is intended for:
- Product planning
- Design alignment
- Frontend implementation
- QA verification

## Page Route and Ownership
- Route: `/dashboard/overview`
- Primary file: `src/app/dashboard/overview/page.tsx`
- Supporting section logic: `src/components/dashboard/client-dashboard-sections.tsx`

## Dashboard Mission
Provide a unified command center where a client can:
- Understand deal progress in seconds
- Identify urgent blockers and next best actions
- Compare market and financial scenarios before committing
- Navigate from summary to action without context switching

## Primary Information Architecture
1. Hero Snapshot Cluster
2. Financial Snapshot Cluster
3. Workflow Overview Cluster
4. Client Intelligence Canvas (Bento)
5. Quarterly Market Reports
6. Dynamic Detailed View

---

## 1) Hero Snapshot Cluster

### Objective
Deliver immediate orientation: what the client should focus on now.

### Components
- `Card`
- `CardHeader`
- `CardTitle`
- `CardDescription`
- `Badge`
- Icon triggers (`Workflow`, `Sparkles`, `TrendingUp`)

### Content Verbiage
- Title: **Client Overview**
- Description: **One command center for journey milestones, deal intelligence, and actionable financial planning.**
- Status chip: **Live Workspace**
- Quick cards:
  - Journey Health: **Search to completion monitoring**
  - Market Matches: **14 qualified properties this week**
  - Financial Clarity: **Scenario-driven payment planning**

### Interactions
- Each quick card updates `detail` state to focus the Detailed View panel.
- Hover style indicates interactivity with border emphasis.

### Animation / Motion Intent
- Entry: subtle fade/translate via parent card transitions.
- Hover: border and background shift only (no aggressive scale).
- Rationale: preserve professional dashboard feel; motion should guide, not distract.

### Accessibility Notes
- Action blocks are `button` elements.
- Each action has deterministic behavior and visible focus states.

---

## 2) Financial Snapshot Cluster

### Objective
Show fast-read financial totals and short-term momentum.

### Components
- `BonusesIncentivesCard` (`animated-dashboard-card.tsx`)
- `MiniChart` (`mini-chart.tsx`)

### Content Verbiage
- Section title: **Incentives & Bonuses**
- Section description: **Interactive total view with drill-down actions.**
- Card internals:
  - Headline: **TOTAL**
  - Breakdown: Bonus and Incentives values
  - CTA: **More Details**

### Behavior Details
- `BonusesIncentivesCard` accepts:
  - values (`bonusesValue`, `incentivesValue`)
  - style overrides (`borderColor`, `backgroundColor`)
  - animation toggle (`enableAnimations`)
  - callback (`onMoreDetails`)
- CTA sets dashboard detail to `what_if_simulator` context.
- `MiniChart` supports hover bars and value tooltip-style focus.

### Animation / Motion Specifications
#### BonusesIncentivesCard
- Uses `framer-motion` with `useReducedMotion` fallback.
- Container spring-in:
  - opacity 0 -> 1
  - y: 20 -> 0
  - scale: 0.95 -> 1
- Dot field animation:
  - circles scale 0 -> 1
  - staggered reveal via variants
- Center metric animation:
  - staged headline then value reveal
- CTA animation:
  - slight hover scale (`1.02`) and tap scale (`0.98`)

#### MiniChart
- Bar emphasis on hover:
  - active bar darkens and slightly scales
  - neighbor bars partially emphasize
  - non-focused bars mute
- Numeric header updates based on hovered bar
- Tooltip appears with translate/opacity transition

### Performance Notes
- Avoid large re-renders; derived values used where possible.
- Reduced-motion users get minimal animation path.

---

## 3) Workflow Overview Cluster

### Objective
Preserve and expose full existing operational logic.

### Component
- `OverviewSection` from `client-dashboard-sections.tsx`

### Included Existing Capabilities (Kept)
- Quick stats cards
- Journey tracker progression
- Priority action center
- AI-driven weekly plan actions
- Deal room snapshot
- Financial clarity callouts

### Verbiage Pattern
- Action copy is operational and directive.
- Highlights use concrete metrics and urgency language.

### Interaction Contract
- `onOpenAI()` dispatches global AI chat event.
- `onExploreDetail(detail)` updates the dynamic detail panel state.

---

## 4) Client Intelligence Canvas (Bento)

### Objective
Summarize operational status using modular, scannable card slots.

### Component
- `BentoGridShowcase` (`bento-grid.tsx`)

### Slot Layout
- `integrations`
- `featureTags`
- `mainFeature`
- `secondaryFeature`
- `statistic`
- `journey`

### Current Verbiage by Slot
- Integrations: **Calendar, CRM, and document sync active.**
- Tags: **Offer Ready**, **Tour Pipeline**, **Budget Safe**
- Main Focus: **Move from Tour to Offer with zero blocker days.**
- Secondary objective: **Close inspection, finalize offer package, confirm escrow timeline.**
- Readiness metric: **92%**
- Journey path: **Search -> Tour -> Offer -> Completion**

### Animation / Motion Specifications
- Container stagger animation:
  - children reveal in sequence (`staggerChildren`)
- Item animation:
  - opacity 0 -> 1
  - y: 20 -> 0
  - spring easing

### Responsiveness
- Mobile: single-column stacking
- Desktop: 3-column, multi-row bento placement

---

## 5) Quarterly Market Reports

### Objective
Allow fast lateral scan of periodic reports and trends.

### Component
- `ShareholderReports` (`carousel.tsx`)

### Data Schema
```ts
interface Report {
  id: string;
  quarter: string;
  period: string;
  imageSrc: string;
  isNew?: boolean;
}
```

### Current Verbiage
- Title: **Quarterly Market Reports**
- Subtitle: **Client-focused pricing and demand movement**

### Interactions
- Horizontal scroll container with snap behavior
- Left/right arrow navigation (desktop)
- Button disabled states based on scroll position
- Optional `NEW` badge on report item

### Animation / Motion
- Card hover:
  - slight upward shift
  - shadow increase
- Scroll movement:
  - smooth scroll by ~80% viewport width per arrow click

### Assets Notes
- Uses Unsplash image URLs currently.
- Replace with first-party marketing/report images for production.

---

## 6) Dynamic Detailed View

### Objective
Provide deeper context and actionable next steps for the selected focus area.

### Components
- `Card` container
- `Badge` for mode label
- Action list (`Button`)
- `IncidentReportHeatmap` visual panel

### Dynamic State Model
- State key: `detail`
- Schema:
```ts
type ClientDetailSelection = {
  key: "journey_tracker" | "weekly_plan" | "deal_room" | "new_matches" | "search_criteria" | "what_if_simulator";
  title: string;
  summary: string;
}
```

### Detail Content Mapping
Each key resolves to:
- Icon
- `highlights[]`
- `actions[]`

### Current Visual Blocks
1. Key Highlights
2. Available Actions
3. Incident Heatmap panel

### IncidentReportHeatmap Notes
- Small, high-contrast, dark-card style visual
- Simulated heatmap grid with value-based color intensity
- Sequential legend (0 to 100)
- Appropriate for compact “risk/volume” trend visualization

---

## Component-by-Component Technical Reference

### `BonusesIncentivesCard`
File: `src/components/ui/animated-dashboard-card.tsx`
- `"use client"`
- Uses `motion`, `useReducedMotion`
- Generates concentric dot rings from trig coordinates
- Exposes callback for CTA action

### `MiniChart`
File: `src/components/ui/mini-chart.tsx`
- `"use client"`
- Local hover index state
- Derived display metric from active bar
- No external context required

### `BentoGridShowcase`
File: `src/components/ui/bento-grid.tsx`
- `"use client"`
- Slot-based API, no internal data coupling
- Ideal for reusable composition patterns

### `ShareholderReports`
File: `src/components/ui/carousel.tsx`
- Forward ref section wrapper
- Internal scroll state (`canScrollLeft`, `canScrollRight`)
- Scroll listener lifecycle managed in `useEffect`

### `IncidentReportHeatmap`
File: `src/components/ui/incident-report-1.tsx`
- Static sample data set
- Lightweight pseudo-chart implementation (no heavy chart lib)
- Good for compact embed, not full BI reporting

---

## Motion and Animation Guidelines (Global)

### Principles
- Motion should communicate hierarchy and response, not ornament.
- Prefer spring + subtle translation over dramatic transforms.
- Always respect reduced-motion contexts.

### Recommended Timing
- Standard entrance: 250ms to 450ms equivalent
- Stagger intervals: 60ms to 120ms
- Hover feedback: 120ms to 220ms

### Reduced Motion Behavior
- Disable non-essential transitions
- Keep opacity-only changes where needed for context

---

## Responsive Behavior

### Desktop
- Multi-column layout for information density
- Hero + financial split layout
- Bento and carousel in paired rows

### Tablet
- Two-column sections collapse to one where needed
- Preserve action visibility above fold as much as possible

### Mobile
- Full vertical stack
- Horizontal scroll for wide cards remains accessible
- Maintain touch-friendly spacing for action buttons

---

## Content Voice and Copy Rules

### Tone
- Confident, operational, concise
- Focus on decisions and next actions

### Writing Style
- Prefer metric-led statements
- Explicit time windows (today, in 72 hours, weekly)
- Avoid vague adjectives without data context

### CTA Language
- Use action verbs:
  - Open
  - Review
  - Generate
  - Compare
  - Run

---

## State, Data, and Integrations

### Current State
- Local component state (`useState`) for selected detail focus
- Mock/static report data for carousel

## Unified Intent-Aware Architecture

### Core Principle
Keep one unified dashboard for each client identity and adapt content by:
- `intentType` (buy/sell/rent_out/renting)
- `listingId` or `propertyId`
- `stage`

Do not split the page by role. Keep sections stable, but filter, label, and prioritize section content based on active journeys.

### Intent and Journey Types
```ts
export type IntentType = "buy" | "sell" | "rent_out" | "renting";

export type JourneyStage =
  | "searching"
  | "touring"
  | "listed"
  | "offers"
  | "under_contract"
  | "leased"
  | "active_tenancy"
  | "closed";

export interface ClientJourney {
  id: string;
  clientId: string;
  propertyId: string;
  intentType: IntentType;
  stage: JourneyStage;
  monetaryImpactEstimate: number;
  urgencyScore: number; // 0-100
  label: string;
  primaryMetrics: Array<{
    label: string;
    value: string;
  }>;
  nextDueDate?: string; // ISO
}
```

### Derived Snapshot Contract
```ts
export interface ClientDashboardSnapshot {
  clientId: string;
  journeys: ClientJourney[];
  intentsSummary: {
    buyCount: number;
    sellCount: number;
    rentOutCount: number;
    rentingCount: number;
  };
  prioritizedJourneys: ClientJourney[];
  totals: {
    potentialPurchaseVolume: number;
    potentialSaleProceeds: number;
    monthlyRentIn: number;
    monthlyRentOut: number;
  };
}
```

### Priority Ordering Rule
Use deterministic ordering for what appears first:
- Primary score input: `urgencyScore`
- Secondary score input: `monetaryImpactEstimate`
- Sort journeys descending by weighted priority
- Show top journey as primary hero context
- Summarize others as secondary context (`+2 more journeys`)

### Dashboard State Model (Extended)
```ts
type ClientDetailSelection = {
  key:
    | "journey_tracker"
    | "weekly_plan"
    | "deal_room"
    | "new_matches"
    | "search_criteria"
    | "what_if_simulator";
  title: string;
  summary: string;
  intentType?: IntentType;
  listingId?: string;
};
```

### Page-Level Prop Flow
```tsx
const snapshot = await getClientDashboardSnapshot(clientId);
const [detail, setDetail] = useState<ClientDetailSelection | null>(null);

<HeroSnapshotCluster snapshot={snapshot} onSelectDetail={setDetail} />
<FinancialSnapshotCluster snapshot={snapshot} onSelectDetail={setDetail} />
<WorkflowOverviewCluster journeys={snapshot.prioritizedJourneys} onSelectDetail={setDetail} />
<ClientIntelligenceCanvas snapshot={snapshot} />
<QuarterlyMarketReports snapshot={snapshot} onSelectDetail={setDetail} />
<DynamicDetailView detail={detail} snapshot={snapshot} />
```

### Cluster Adaptation Rules

#### Hero Snapshot -> Intent Overview
- Keep hero structure unchanged.
- Add intent chips when count > 1:
  - Buying, Selling, Renting Out, Renting
- Copy style examples:
  - `3 active journeys across buy, sell, rent.`
  - `14 buy matches, 2 rental opportunities this week.`
  - `2 purchase scenarios, 1 sale net sheet, 1 rent analysis.`
- Chip click behavior:
  - filters hero metrics
  - seeds detail state with `intentType`

#### Financial Snapshot by Intent Mix
- Render one to three finance cards for dominant active intents.
- Each card receives intent context:
```ts
type IntentFinancialCardProps = {
  intentType: IntentType;
  entityId?: string;
  onMoreDetails: (context: { intentType: IntentType; listingId?: string }) => void;
};
```
- Verbiage examples:
  - Buy: `Purchase capacity`, `Active offers`
  - Sell: `Estimated net proceeds`
  - Rent out: `Rent collected`, `On-time rate`
  - Renting: `Next rent due`, `Autopay status`

#### Workflow Overview as Multi-Journey Timeline
- Render one workflow card per journey instead of one role-centric lane.
- Title examples:
  - `Buying: 123 Main St (Offer stage)`
  - `Renting out: Unit 4B (Renewal in 45 days)`
  - `Renting: Current home (Lease ends Nov 2026)`
- Click updates detail:
```ts
onExploreDetail({
  key: "journey_tracker",
  title: journey.label,
  summary: "Detailed view of this journey",
  intentType: journey.intentType,
  listingId: journey.propertyId,
});
```

#### Intelligence Canvas as Portfolio Readiness
- Keep bento slots unchanged.
- Convert copy to portfolio-level language:
  - `synced across buy, sell, and rent journeys`
  - `multi-intent readiness: 88%`
  - `buy close in ~45 days; renewals in ~60 days`
- Show active-intent tags:
  - `Active Buyer`
  - `Active Seller`
  - `Active Landlord`
  - `Current Tenant`

#### Market Reports Scoped by Intent
- Extend report shape:
```ts
interface Report {
  id: string;
  quarter: string;
  period: string;
  imageSrc: string;
  isNew?: boolean;
  intentTypes?: IntentType[];
}
```
- Add filter chips:
  - `All`
  - `Buying`
  - `Selling`
  - `Renting Out`
  - `Renting`
- Report click can set detail with intent-aware context.

#### Dynamic Detail View as Intent + Listing Console
- Resolve content by `detail.key + intentType + listingId`.
- Action set becomes intent-sensitive:
  - rent_out: include reminders/collections actions
  - buy: include offer/contingency actions
  - sell: include pricing/showings actions
  - renting: include lease/payment actions
- Heatmap context examples:
  - buy: negotiation stalls by stage
  - sell: view-to-offer dropoff
  - rent_out: ticket or payment stress map
  - renting: due-date and issue density

### Animation and Motion Behavior by Intent
- Keep same animation primitives; only vary color accents and emphasis by `intentType`.
- Suggested accent mapping:
  - buy: cyan/blue
  - sell: amber/orange
  - rent_out: green
  - renting: violet
- Motion intensity should remain consistent across intents to avoid visual hierarchy conflicts.

### AI Context Wiring
- `onOpenAI()` should include selected journey context:
  - `intentType`
  - `listingId`
  - `stage`
- This keeps generated guidance scoped to the active lane.

### Server Function Responsibility
Recommended aggregator:
```ts
async function getClientDashboardSnapshot(clientId: string): Promise<ClientDashboardSnapshot> {
  // Query listings, leases, transactions
  // Build ClientJourney[]
  // Compute intentsSummary and totals
  // Compute prioritizedJourneys using urgency + impact scoring
  // Return fully derived snapshot
}
```

### Future Data Integration
- Replace report seed data with API-driven source
- Bind financial and journey metrics to backend entities
- Add loading/skeleton and error states per section

### Suggested API Domains
- `dashboard.summary`
- `dashboard.financials`
- `dashboard.journey`
- `dashboard.reports`
- `dashboard.alerts`

---

## QA Checklist

### Functional
- Detail state updates correctly from all triggers
- AI open event dispatch works
- Carousel arrows enable/disable correctly
- Mini chart hover values map to correct day values
- Bonuses CTA opens financial detail context

### Visual
- No card overlap on desktop/tablet/mobile
- Gradient and border contrasts are legible in theme
- Heatmap remains readable in available column width

### Accessibility
- Keyboard focus on interactive cards and buttons
- Semantic button usage for click targets
- Sufficient contrast for text and badges

---

## Future Enhancements
1. Personalization by journey stage and urgency profile
2. Intent-aware module ordering (without role-based page splits)
3. Persisted dashboard layout preferences
4. Production image/content pipeline
5. Real-time notifications and SLA countdown badges
6. Expand heatmap to selectable time ranges
7. Add per-action confidence scoring visuals

---

## File Map
- `src/app/dashboard/overview/page.tsx`
- `src/components/dashboard/client-dashboard-sections.tsx`
- `src/components/ui/animated-dashboard-card.tsx`
- `src/components/ui/mini-chart.tsx`
- `src/components/ui/bento-grid.tsx`
- `src/components/ui/carousel.tsx`
- `src/components/ui/incident-report-1.tsx`

## Dependencies Used
- `framer-motion`
- `lucide-react`
- `class-variance-authority`
- Tailwind CSS
- TypeScript
