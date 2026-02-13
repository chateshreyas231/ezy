
Complete Screen Connectivity for All Roles
Prepared for: UI/UX Implementation and Navigation Architecture
Date: February 5, 2026
Location: Chicago, Illinois
This document maps every screen, connection, and navigation path for all five user roles in
the Ezriya platform (Agent, Buyer, Seller, Vendor, Admin). Each role's journey is documented
with screen hierarchies, navigation patterns, state transitions, and deep linking structures
for both web and mobile platforms.
Purpose: Provide developers and designers with a complete UI flow reference to
implement navigation, routing, and state management consistently across web (Next.js)
and mobile (React Native + Expo Router).
File-Based Routing Structure:
apps/web/app/
├── (public)/ # Unauthenticated routes
│ ├── page.tsx # Landing page
│ ├── login/page.tsx # Login screen
│ ├── signup/page.tsx # Signup screen
│ ├── buy/page.tsx # Public buyer portal
│ └── sell/page.tsx # Public seller portal
│
├── (agent)/ # Agent-authenticated routes
│ ├── layout.tsx # Agent layout wrapper
│ ├── dashboard/page.tsx # Agent home
│ ├── deals/
│ │ ├── page.tsx # Deal list
│ │ └── [id]/page.tsx # Deal detail/room
│ ├── clients/page.tsx # Client management
│ ├── leads/page.tsx # Lead inbox
│ ├── analytics/page.tsx # Analytics dashboard
│ └── settings/page.tsx # Agent settings
│
├── (buyer)/ # Buyer-authenticated routes
│ ├── layout.tsx
│ ├── home/page.tsx # Property feed
│ ├── property/[id]/page.tsx # Property detail
Ezriya UI Screen Flow and Navigation Map
Executive Summary
Navigation Architecture Overview
Web Navigation Pattern (Next.js App Router)
│ ├── favorites/page.tsx # Saved properties
│ ├── showings/page.tsx # Showing schedule
│ └── deal/[id]/page.tsx # Deal room (post-offer)
│
├── (seller)/ # Seller-authenticated routes
│ ├── layout.tsx
│ ├── dashboard/page.tsx # Seller dashboard
│ ├── listing/
│ │ ├── create/page.tsx # New listing wizard
│ │ └── [id]/page.tsx # Listing management
│ └── deal/[id]/page.tsx # Deal room (post-contract)
│
├── (vendor)/ # Vendor-authenticated routes
│ ├── layout.tsx
│ ├── jobs/page.tsx # Active jobs
│ └── deal/[id]/page.tsx # Deal room access
│
└── (admin)/ # Admin-authenticated routes
├── layout.tsx
├── users/page.tsx # User management
├── deals/page.tsx # Deal oversight
└── analytics/page.tsx # Platform analytics
File-Based Routing Structure:
apps/mobile/app/
├── index.tsx # App entry point (auth router)
├── (auth)/
│ ├── login.tsx
│ └── signup.tsx
│
├── (agent)/ # Agent tab navigator
│ ├── _layout.tsx # Bottom tab bar
│ ├── home.tsx # Dashboard
│ ├── deals.tsx # Deal list
│ ├── clients.tsx # Client list
│ ├── leads.tsx # Lead inbox
│ └── more.tsx # Settings/profile
│
├── (buyer)/ # Buyer tab navigator
│ ├── _layout.tsx
│ ├── home.tsx # Property feed
│ ├── chat.tsx # AI assistant
│ ├── saved.tsx # Favorites
│ └── profile.tsx # Settings
│
├── (seller)/ # Seller tab navigator
│ ├── _layout.tsx
│ ├── dashboard.tsx # Demand metrics
│ ├── listing.tsx # Listing management
Mobile Navigation Pattern (Expo Router)
│ ├── showings.tsx # Showing requests
│ └── profile.tsx
│
├── (vendor)/ # Vendor tab navigator
│ ├── _layout.tsx
│ ├── jobs.tsx # Active jobs
│ ├── tasks.tsx # Task list
│ └── profile.tsx
│
└── deal/[id].tsx # Universal deal room (all roles)
Landing Page (/)
↓
[Login Button] → /login
↓
Email/Password Form
↓
Authentication Success
↓
Role Detection: Agent
↓
Redirect → /agent/dashboard
Screen Components:
Top Navigation Bar
Logo (links to /agent/dashboard)
Deal count badge (links to /agent/deals)
Lead count badge (links to /agent/leads)
Notification icon (opens notification dropdown)
Profile menu (dropdown)
Settings → /agent/settings
Billing → /agent/billing
Help Center → /help
Logout → / (clear session)
Left Sidebar
Dashboard (active) → /agent/dashboard
Deals → /agent/deals
Clients → /agent/clients
Leads → /agent/leads
Analytics → /agent/analytics
Settings → /agent/settings
Main Content Area
Urgent Tasks Widget
Role 1: Agent UI Flow
Agent Web Application Flow
Entry Point: Login/Signup
Agent Dashboard Home (/agent/dashboard)
Each task clickable → /agent/deals/[dealId]#task-[taskId]
Active Deals Kanban
Deal cards clickable → /agent/deals/[dealId]
[Create New Deal] button → /agent/deals/create
This Week's Metrics Widget
[View Full Analytics] → /agent/analytics
Right Panel (Floating)
AI Assistant Chat
Persistent across pages
Minimizes to corner icon
Navigation Paths:
1. View Deal Details:
Dashboard → Click Deal Card → /agent/deals/[dealId]
2. Create New Deal:
Dashboard → [Create New Deal] → /agent/deals/create
↓
Deal Creation Form
- Property address autocomplete
- Buyer email invitation
- Seller email invitation
- Estimated close date
↓
[Create Deal] button
↓
Deal Created → Redirect to /agent/deals/[newDealId]
↓
Invitation emails sent to parties
3. Check Urgent Tasks:
Dashboard → Urgent Tasks Widget → Click Task
↓
/agent/deals/[dealId]#task-[taskId]
↓
Task highlighted in Kanban board
↓
[Complete Task] → Task marked done
↓
Auto-notify assigned parties
Screen Layout:
Top Bar
Back arrow → /agent/deals
Property address (breadcrumb)
Deal status badge
[Export Compliance Log] button → Download PDF
Left Panel (30% width)
Deal Overview Card
Property details
Deal Room (/agent/deals/[dealId])
Parties list (clickable)
Click party → Opens party profile modal
Key dates
[Upload Contract] button → File picker
On upload → Show processing spinner
After 20 seconds → AI extraction complete
Modal: "Review Extracted Data"
Close date: [editable]
Contingencies: [editable list]
Parties: [editable list]
[Generate Tasks] button
↓
35 tasks created in Kanban
↓
Success toast: "35 tasks created"
Main Panel (50% width)
Kanban Task Board
Columns: To Do, In Progress, Completed, Overdue
Drag-and-drop enabled
Task cards show:
Title
Due date
Assigned party
Dependencies (if any)
Click task card → Opens task detail modal
Task description
Assigned to (dropdown to reassign)
Due date (date picker)
Dependencies (multi-select)
Attachment area
Comment thread
[Mark Complete] / [Delete] buttons
Right Panel (20% width)
Real-time Chat
Message list (auto-scroll to bottom)
All deal parties in chat
Typing indicators
File attachment button
Send message input
Navigation Paths:
1. Upload and Process Contract:
Deal Room → [Upload Contract]
↓
File Picker → Select "Purchase_Agreement.pdf"
↓
Upload Progress Bar
↓
Processing: "AI extracting contract data..." (15-30 sec)
↓
Modal: "Review Extracted Data"
- Shows close date, contingencies, parties
- Editable fields
↓
[Generate Tasks] button
↓
Background: API call to /api/ai/generate-tasks
↓
35 tasks appear in Kanban "To Do" column
↓
Success notification
↓
Automated reminders scheduled in background
2. Assign Task to Party:
Deal Room → Kanban Board → Click Task Card
↓
Task Detail Modal Opens
↓
"Assigned to" dropdown → Select "John Buyer"
↓
[Save] button
↓
Task updated
↓
Email notification sent to John Buyer
↓
John sees task in his deal room view
3. Send Message in Chat:
Deal Room → Right Panel Chat
↓
Type message: "Inspection scheduled for Friday 10 AM"
↓
[Send] button (or Enter key)
↓
Message appears immediately (optimistic UI)
↓
Background: WebSocket sends to Supabase Realtime
↓
All parties receive message in real-time
↓
Unread badge appears for offline parties
Screen Layout:
Filter Bar
[All Leads] [Buyers] [Sellers] tabs
Sort by: [Score] [Date] [Location]
Search box
Lead List (Left 40%)
Lead Inbox (/agent/leads)
Lead cards showing:
Score badge (85/100 with color coding)
Lead type: FSBO Seller or Buyer
Property/Intent summary
Time ago (e.g., "2 hours ago")
Click lead → Details panel opens
Lead Detail Panel (Right 60%)
Header: Score breakdown
Property/Intent details
AI analysis summary
Contact information
[Claim Lead] button (primary CTA)
[Dismiss] button
Navigation Paths:
1. Claim FSBO Lead:
/agent/leads → Lead List → Click Lead Card
↓
Lead Detail Panel Opens
↓
Review:
- Property: 789 Pine St, $449K
- Score: 85/100 (High Priority)
- AI Insight: "Priced 3% below comps"
↓
[Claim Lead] button
↓
Confirmation: "Send intro email to seller?"
↓
[Yes, Claim Lead]
↓
Background: AI generates personalized email
↓
Email sent to seller
↓
Lead moved to "Claimed" section
↓
Success toast: "Lead claimed. Email sent."
↓
Lead now appears in /agent/clients (pending acceptance)
2. Dismiss Lead:
Lead Detail Panel → [Dismiss] button
↓
Confirmation: "Why dismiss?" (optional feedback)
- Not interested
- Outside service area
- Unrealistic expectations
↓
[Confirm Dismiss]
↓
Lead removed from inbox
↓
Next lead auto-loads in detail panel
Screen Layout:
Tab Bar: [Active] [Past] [Pending]
Client List (Grid or Table view toggle)
Client cards showing:
Name
Client type: Buyer or Seller
Active deal status (if any)
Last contact date
[View Profile] button
Click client → /agent/clients/[clientId]
Client Profile Page:
Header
Client name
Contact info (phone, email)
Client since date
[Message] [Call] [Email] quick actions
Tabs: [Overview] [Deals] [Intent/Listings] [Documents] [Activity]
Navigation Paths:
1. View Client's Active Deal:
/agent/clients → Client List → Click Client Card
↓
/agent/clients/[clientId] → Overview Tab
↓
Active Deal Widget: "123 Oak St - Under Contract"
↓
[View Deal Room] button
↓
/agent/deals/[dealId]
2. View Client's Intent (Buyer) or Listing (Seller):
Client Profile → [Intent/Listings] Tab
↓
BUYER: Shows intent criteria with compatibility match count
- Budget: $350K-$500K
- Beds: 3+, Baths: 2+
- Location: Lincoln Park
- 12 matching properties available
↓
[View Matches] → /agent/properties?intent=[intentId]
SELLER: Shows listing details and demand metrics
- 789 Pine St listing
- 12 interested buyers
Client Management (/agent/clients)
- 8 showings last week
↓
[View Listing Dashboard] → /agent/listings/[listingId]
Screen Layout:
Time Range Selector: [This Week] [This Month] [Last 3 Months] [Custom]
KPI Cards (Top Row)
Time Saved This Month: 48.5 hours
Active Deals: 12
Tasks Automated: 87%
Client Satisfaction: 4.8/5.0
Charts (Main Area)
Deal Velocity Chart (line graph)
Task Completion Rate (bar chart)
AI Usage by Feature (pie chart)
Revenue by Month (bar chart)
Recent Activity Feed (Right Sidebar)
Navigation Paths:
Click KPI card → Drills down to detailed view
Click chart segment → Filters data by that segment
Export button → Download CSV or PDF report
App Opens → Check Auth State
↓
Not Authenticated → /login screen
↓
Email/Password Form
↓
Login Success
↓
Role Detection: Agent
↓
Navigate to → (agent)/home
┌─────────────────────────────────────┐
│ [ Home] [ Deals] [ Clients] │
│ [ Leads] [⋯ More] │
└─────────────────────────────────────┘
Analytics Dashboard (/agent/analytics)
Agent Mobile Application Flow
Entry Point: App Launch
Bottom Tab Bar (Always Visible)
Screen Layout:
Header
"Ezriya Agent"
Notification bell icon (badge count)
Urgent Tasks Section
Card list (vertical scroll)
Each task card shows:
Task title
Property address
Due date/time with urgency color
[Complete] [Snooze] buttons
Quick Stats Grid (3 columns)
Active Deals count
New Leads count
Tasks Auto-Created count
Active Deals Section
Card list (vertical scroll)
Each deal card shows:
Property address
Deal status badge
Close date
[View Deal Room] button
Navigation Paths:
1. Complete Urgent Task:
Home Tab → Urgent Tasks → Task Card
↓
[Complete] button
↓
Haptic feedback
↓
Confirmation modal: "Mark 'Review inspection' complete?"
↓
[Yes, Complete]
↓
API call → Update task status
↓
Card animates out (fade + slide)
↓
Success toast: "Task completed"
↓
Next task auto-loads or "All caught up!" message
2. View Deal Room:
Home Tab → Active Deals → Deal Card
↓
[View Deal Room] button
↓
Navigate to → /deal/[dealId]
Home Tab (agent)/home
↓
Deal Room Screen (Full Screen)
Screen Layout:
Search bar at top
Filter chips: [All] [Initiated] [In Progress] [Under Contract] [Closing Soon]
Deal list (vertical scroll)
Each card shows mini deal summary
Tap card → /deal/[dealId]
Deal Room Screen (/deal/[dealId])
Layout (Full Screen):
Top Bar
Back arrow → Returns to previous screen
Property address
Deal status badge
Three-dot menu
Export compliance log
Share deal summary
Mark deal as closed
Tabs: [Tasks] [Chat] [Documents] [Details]
Tasks Tab:
Kanban board (horizontal scroll columns)
To Do | In Progress | Completed
Task cards (vertical scroll within columns)
Tap task → Bottom sheet with task details
Title, description, due date, assigned party
[Mark Complete] button
[Add Comment] input
Attachment list
Chat Tab:
Message list (auto-scroll to bottom)
All deal parties
Typing indicators
Camera icon → Attach photo
Microphone icon → Voice message (future)
Text input + Send button
Documents Tab:
Category sections (collapsible)
Contracts
Disclosures
Inspection Reports
Appraisals
Deals Tab (agent)/deals
Title Documents
Each document shows:
File name
Upload date
Uploaded by
Tap → Preview (PDF viewer)
Details Tab:
Property information
All parties with contact cards
Tap phone → Call
Tap email → Email app
Key dates (close date, contingency dates)
Timeline (audit log)
Navigation Paths:
1. Complete Task from Mobile:
Deal Room → Tasks Tab → Tap Task Card
↓
Bottom Sheet Opens (slides up from bottom)
↓
Task Details Displayed
↓
[Mark Complete] button
↓
Haptic feedback
↓
Bottom sheet dismisses
↓
Task card animates to "Completed" column
↓
All parties receive real-time notification
2. Upload Document from Field:
Deal Room → Documents Tab
↓
[+] Upload button
↓
Action Sheet: [Take Photo] [Choose from Library] [Browse Files]
↓
Select "Take Photo"
↓
Camera opens
↓
Capture photo (e.g., signed disclosure)
↓
Preview screen with crop/rotate tools
↓
[Use Photo] button
↓
Upload Progress Bar
↓
Success: Document appears in "Disclosures" section
↓
Push notification sent to all parties
Screen Layout:
Filter bar: [All] [Buyers] [Sellers]
Sort dropdown: [Score] [Date] [Location]
Lead cards (vertical scroll)
Score badge
Lead type icon
Summary text
Time ago
[View Details] button
Lead Detail Screen:
Full-screen modal (slides in from right)
Header: Score breakdown with color-coded sections
Property/Intent details
AI analysis card
Contact info
[Claim Lead] button (prominent)
[Dismiss] button (subtle)
Navigation Paths:
1. Claim Lead from Mobile:
Leads Tab → Lead Card → [View Details]
↓
Lead Detail Screen Opens
↓
Review details
↓
[Claim Lead] button
↓
Confirmation Alert: "Send intro email?"
↓
[Yes, Claim Lead]
↓
Loading indicator (2-3 seconds)
↓
Success animation (checkmark)
↓
Screen dismisses
↓
Lead removed from list
↓
Success toast: "Lead claimed. Email sent."
Leads Tab (agent)/leads
Screen Layout:
Search bar
Tab bar: [Active] [Past] [Pending]
Client cards (vertical scroll)
Client name
Client type badge
Active deal status
Quick action icons (call, message)
Client Profile Screen:
Header with client photo/initials
Contact buttons (call, email, message)
Sections (vertical scroll):
Active Deal Card (if exists) → Tap → /deal/[dealId]
Intent/Listing Summary
Recent Activity Timeline
Documents Count
Navigation Paths:
Clients Tab → Client Card → Client Profile Screen
Client Profile → Active Deal Card → /deal/[dealId]
Screen Layout:
Profile section
Agent photo/name
License number
Brokerage name
[Edit Profile] button → Profile edit screen
Menu Items (List)
Analytics → Analytics screen
Settings → Settings screen
Billing → Billing screen
Help & Support → Help screen
Terms & Privacy → Web view
Logout → Confirmation alert → Return to /login
Analytics Screen (Full Screen):
Time range tabs
KPI cards (scroll horizontal)
Charts (vertical scroll)
Export button
Settings Screen:
Notification preferences
Clients Tab (agent)/clients
More Tab (agent)/more
Language selection
Theme (Light/Dark/Auto)
Data & Privacy
Connected accounts
Landing Page (/) → [I'm Looking to Buy]
↓
/buy (Public page)
↓
Marketing content + [Get Started] CTA
↓
/signup?role=buyer
↓
Email/Password signup
↓
Account created
↓
Redirect to /buyer/onboarding
Step 1: Welcome Screen
"Find Your Perfect Home with AI"
[Start My Search] button
Step 2: Intent Creation Form (Multi-Step)
Step 2a: Budget
- Slider: $100K - $1M
- Pre-approval status: [Yes] [No] [In Progress]
- [Next] button
↓
Step 2b: Location
- City/Neighborhood search (autocomplete)
- Map with radius selector
- [Next]
↓
Step 2c: Property Basics
- Bedrooms: Dropdown (1-5+)
- Bathrooms: Dropdown (1-4+)
- Property types: [House] [Condo] [Townhouse] (multi-select)
- [Next]
↓
Step 2d: Must-Haves
- Checkbox list:
☐ Garage
Role 2: Buyer UI Flow
Buyer Web Application Flow
Entry Point: Public Buyer Portal
Onboarding Flow (/buyer/onboarding)
☐ Yard/Outdoor Space
☐ Updated Kitchen
☐ Hardwood Floors
☐ Central Air
☐ Basement
- [Next]
↓
Step 2e: Dealbreakers
- Similar checkbox list (things to exclude)
- [Next]
↓
Step 2f: Timeline
- Radio buttons:
○ Ready to buy now (0-3 months)
○ Exploring (3-6 months)
○ Planning ahead (6+ months)
- [Create My Intent] button
↓
Processing: "Finding compatible properties..." (3-5 seconds)
↓
Intent created → Redirect to /buyer/home
Screen Layout:
Top Navigation
Ezriya logo → /buyer/home
Search box (location search)
[My Favorites] link → /buyer/favorites
Profile menu
My Intent → /buyer/intent (edit)
Showings → /buyer/showings
Settings → /buyer/settings
Logout
Main Content
Filter bar
Quick filters: [Price] [Beds] [Baths] [Property Type]
[More Filters] → Expands full filter panel
Property Grid (3 columns on desktop)
Property cards showing:
Hero image (carousel if multiple)
Price
Beds/Baths/SqFt
Address
Compatibility badge (e.g., "92% Match")
Quick actions: ❤️ Save | Schedule Showing
Click card → /buyer/property/[propertyId]
Right Sidebar (Floating)
AI Chat Assistant (collapsible)
Suggested questions:
Buyer Home (/buyer/home)
"Can I afford this area?"
"What's the buying process?"
"How do I make an offer?"
Navigation Paths:
1. Browse Properties and Save Favorite:
/buyer/home → Property Grid → Hover Property Card
↓
❤️ Save icon appears
↓
Click ❤️
↓
Haptic feedback (web vibration)
↓
Icon fills with color (saved state)
↓
Toast: "Saved to favorites"
↓
Property now in /buyer/favorites
2. View Property Details:
/buyer/home → Click Property Card
↓
/buyer/property/[propertyId]
Screen Layout:
Hero Section
Image gallery (full-width)
Arrow navigation
Thumbnail strip below
[❤️ Save] button (top-right overlay)
[Share] button (top-right overlay)
Property Overview Section
Price (large, prominent)
Address
Beds | Baths | SqFt | Lot Size
Property type
Compatibility score badge
Tabs: [Overview] [AI Analysis] [Neighborhood] [Showing Info]
Overview Tab:
Property description
Key features (bulleted list)
Interior details
Exterior details
Utilities & Appliances
AI Analysis Tab:
Property Detail Page (/buyer/property/[propertyId])
Condition Score Card
Overall: 8.5/10
Kitchen: 8/10
Bathrooms: 9/10
Flooring: 8/10
Exterior: 8.5/10
Issues detected: "Dated kitchen cabinets"
Recommendations: "Consider updating hardware"
Sunlight Exposure Card
Primary exposure: South-West
Peak hours: 6.5 hrs/day
Morning sun rooms: Kitchen, Dining
Afternoon sun rooms: Living, Master Bedroom
Visualization: Sun path diagram
Privacy Analysis Card
Room-by-room privacy scores
Master Bedroom: 9/10 (2nd floor, tree coverage)
Living Room: 7/10 (front-facing windows)
Backyard: 8/10 (fenced, neighbor distance)
Neighborhood Tab:
Walk Score / Transit Score / Bike Score
Schools (elementary, middle, high)
Ratings
Distance
Nearby Amenities
Restaurants, Coffee, Groceries
Parks, Gyms
Commute Calculator
"Enter your work address" → Shows commute time
Showing Info Tab:
Showing availability
Agent contact info (if MLS listing)
[Request Showing] button (Primary CTA)
CTAs at Bottom:
[Request Showing] (Primary button)
[Ask AI About This Property] (Secondary button)
[Compare with Saved] (if 2+ favorites exist)
Navigation Paths:
1. Request Showing:
Property Detail → [Request Showing] button
↓
Modal: "Schedule a Showing"
- Calendar date picker
- Time slots (10 AM, 2 PM, 5 PM options)
- Message to seller/agent (optional)
↓
[Submit Request] button
↓
Loading: "Sending request..."
↓
Success: "Request sent! You'll hear back within 24 hours."
↓
Modal closes
↓
Showing appears in /buyer/showings with "Pending" status
2. Ask AI About Property:
Property Detail → [Ask AI About This Property]
↓
AI Chat panel expands
↓
Pre-filled context: Property address + AI analysis data
↓
Buyer types: "Is this a good deal?"
↓
AI Response (appears in 2-3 seconds):
"Based on comparable sales within 0.5 miles, this property
is priced competitively. Recent sales ranged from $445K-$465K
for similar 3-bed homes. This is listed at $449K (middle of range).
Given the condition score (8.5/10) and strong sunlight exposure
(6.5 hrs), this represents good value. However, you may want to
budget $3-5K for kitchen updates within the first year.
Want me to calculate your monthly payment for this property?"
↓
Buyer: "Yes, calculate monthly payment"
↓
AI: "Based on your $400K budget (from your intent):
• Purchase price: $449K
• Down payment (20%): $89.8K
• Loan amount: $359.2K
• Interest rate (estimated 7%):
• Monthly P&I: $2,390
• Property taxes (est): $625/mo
• Insurance (est): $120/mo
• Total monthly: $3,135
This is above your indicated budget. Would you like to:
1. Adjust your budget
2. Consider a lower down payment (10%)
3. Connect with a lender to explore options"
Accessed via:
Favorites page → [Compare] button (when 2-4 properties selected)
Property detail → [Compare with Saved] button
Screen Layout:
Side-by-side columns (2-4 properties)
Rows for each attribute:
Images (carousel preview)
Price
Price per SqFt (with winner badge ✅)
Beds/Baths
SqFt / Lot Size
Condition Score (AI)
Sunlight Hours (AI)
Commute Time (if destination set)
Days on Market
Estimated Monthly Payment
5-Year Appreciation (AI prediction)
AI Recommendation box at bottom:
"Based on your priorities and market data, 789 Pine St offers
the best value with lowest price ($439K), highest predicted
appreciation (+22%), and shortest commute (22 min). However,
123 Oak St has superior condition (8.5 vs 8.1). Consider your
priorities: value vs move-in ready condition."
Navigation:
Click any property column → /buyer/property/[propertyId]
[Remove from Comparison] button → Removes column
[Export to PDF] → Downloads comparison report
Screen Layout:
Grid view of saved properties
Each card shows:
Thumbnail
Price
Beds/Baths
Compatibility %
[Remove from Favorites] X icon
Checkbox (for comparison selection)
Actions:
[Compare Selected] button (appears when 2-4 checked)
Compare Properties (/buyer/compare)
Favorites Page (/buyer/favorites)
Sort by: [Date Saved] [Price] [Compatibility] [Recently Viewed]
Navigation:
Click card → /buyer/property/[propertyId]
[Compare Selected] → /buyer/compare?ids=[id1,id2,id3]
Trigger 1: After 10 Properties Viewed
View 10th Property Detail Page
↓
Modal appears (overlay):
"Ready to See Homes in Person?"
"You've explored 10 properties. Connect with a buyer agent
who specializes in [neighborhood] to see homes and make offers."
[See Matched Agents] button
[Keep Browsing] button
↓
If [See Matched Agents]:
→ /buyer/agent-matching
Trigger 2: After Saving 5+ Properties
Save 5th Property
↓
Toast notification with CTA:
"You've found properties you love! A buyer agent can help you
make competitive offers."
[See Matched Agents] button in toast
↓
Click button → /buyer/agent-matching
Trigger 3: After Requesting 3 Showings
Submit 3rd Showing Request
↓
Success modal:
"Showing request sent!"
Below success message:
"You're serious about buying! Agents can unlock more listings
and negotiate on your behalf. See your matched agents?"
Conversion Trigger Points
[Yes, Show Me Agents] [Maybe Later]
↓
If Yes → /buyer/agent-matching
Screen Layout:
Header: "Your Matched Agents"
Subheader: "Based on your search area and preferences, these agents
are best suited to help you."
Agent Cards (vertical scroll)
Agent photo
Name
Brokerage
Specialties (badges): Lincoln Park, First-Time Buyers, Condos
Stats:
96% offer acceptance rate
Avg $8K below asking
23 deals closed (last 12 months)
Client rating: 4.9/5 (127 reviews)
[Request Introduction] button
Navigation Path:
Agent Matching Page → Click [Request Introduction] for "Sarah Chen"
↓
Modal: "Introduce Me to Sarah Chen"
- "Tell Sarah a bit about what you're looking for"
- Text area (optional message)
- Checkbox: "Share my intent criteria"
- Checkbox: "Share my saved properties"
↓
[Send Introduction Request] button
↓
Loading: "Connecting you..."
↓
Success: "Request sent! Sarah will reach out within 24 hours."
↓
Background:
- Notification sent to Sarah (Agent lead inbox)
- Email sent to Sarah with buyer's profile
- Email sent to buyer with Sarah's contact info
↓
Sarah accepts lead in her agent dashboard
↓
Buyer receives notification: "Sarah Chen accepted your request!
She'll contact you at [buyer email]"
Agent Matching Page (/buyer/agent-matching)
↓
Platform earns referral fee when buyer closes with Sarah
App Opens → Check Auth State
↓
Not Authenticated → /login screen
↓
Signup as Buyer → Role: buyer
↓
Navigate to → Onboarding Flow
Swipeable Wizard:
Screen 1: Welcome
"Find Your Perfect Home with AI"
[Get Started] → Swipe left or button
↓
Screen 2-7: Intent Form (same steps as web, mobile-optimized)
- Uses native pickers for dropdowns
- Map selector for location
- Swipe gestures to navigate
↓
Final Screen: "Finding Your Matches..."
Loading animation
↓
Navigate to → (buyer)/home
┌────────────────────────────────────┐
│ [ Home] [ Chat] [❤️ Saved] │
│ [ Profile] │
└────────────────────────────────────┘
Screen Layout:
Header
Location text (from intent)
Filter icon → Opens filter bottom sheet
Property Feed (Vertical scroll)
Property cards (full width)
Hero image (swipeable if multiple photos)
Price badge (overlay top-left)
Compatibility badge (overlay top-right: "92% Match")
Property details below image:
Address
Beds | Baths | SqFt
Buyer Mobile Application Flow
Entry Point: App Launch
Onboarding (Mobile)
Bottom Tab Bar
Home Tab (buyer)/home
Action buttons:
❤️ Save
Schedule Showing
[View Details] → Property detail screen
Navigation Paths:
1. Save Property:
Home Tab → Property Card → Tap ❤️ icon
↓
Haptic feedback (impact light)
↓
Icon animates (fills with color + small bounce)
↓
Property added to Saved Tab
↓
Toast: "Saved to favorites"
2. View Property Details:
Home Tab → Property Card → [View Details] or Tap Card
↓
Navigate to → /property/[propertyId] (full-screen)
Full-Screen Layout:
Header (Fixed at top)
Back arrow → Returns to Home Tab
❤️ Save icon
Share icon
Content (Scrollable)
Image Gallery
Horizontal swipe carousel
Page indicators (dots)
Full-screen zoom on double-tap
Property Info Card
Price (large)
Address
Beds | Baths | SqFt
Compatibility badge
AI Analysis Section (Collapsible cards)
Condition Analysis Card
Overall score: 8.5/10
[View Details] → Expands breakdown
Sunlight & Privacy Card
Peak hours: 6.5
Privacy scores by room
Neighborhood Card
Walk Score: 85
Schools nearby
[View Full Neighborhood Info] → Bottom sheet
Description Section
Property Detail Screen (Mobile)
[Schedule Showing] button (Sticky at bottom)
Navigation Paths:
1. Schedule Showing:
Property Detail → [Schedule Showing] button
↓
Bottom Sheet slides up
↓
Showing Request Form:
- Date picker (calendar)
- Time slots (chips to select)
- Message (optional text input)
↓
[Submit Request] button
↓
Bottom sheet dismisses
↓
Loading indicator (2 seconds)
↓
Success animation (checkmark)
↓
Toast: "Request sent! You'll hear back within 24 hours."
↓
Showing appears in Profile → Showings with "Pending" status
2. Ask AI About Property:
Property Detail → [Ask AI] button (floating action button)
↓
Navigate to → Chat Tab with property context pre-loaded
↓
Suggested questions appear:
- "Is this a good deal?"
- "What's the monthly payment?"
- "Tell me about the neighborhood"
Screen Layout:
Header: "AI Buying Coach"
Message list (scrollable)
Alternating user/AI messages
AI messages include suggested follow-up buttons
Input bar (bottom)
Text input
Camera icon (attach image)
Send button
Conversation Context:
AI knows:
User's intent criteria
Chat Tab (buyer)/chat
Properties user has viewed/saved
Current property (if navigated from property detail)
Example Conversation:
USER: "Can I afford a $450K home?"
↓
AI: "Let me calculate based on your $400K budget:
$450K home with 20% down ($90K):
• Monthly payment: $3,135 (P&I + taxes + insurance)
• This is above your $2,500 target
Options:
1️⃣ Increase down payment to 25% ($112.5K)
→ Monthly: $2,940 ✅
2️⃣ Stick to $400-420K range
3️⃣ Talk to lender about income-based qualification
[Connect with Lender] button"
↓
USER taps [Connect with Lender]
↓
AI: "I can introduce you to pre-approved lenders:
Quicken Loans - 6.9% rate, fast approval
Better.com - 7.0% rate, all online
Local Credit Union - 6.8% rate, Chicago-based
Which would you like an introduction to?"
↓
USER taps "Quicken Loans"
↓
AI: "Great choice! I'll connect you with Quicken Loans.
Next steps:
1. You'll receive an email with their contact info
2. They'll reach out within 24 hours
3. Get pre-approved before making offers
✉️ Email sent!
Anything else I can help with?"
Conversion Triggers in Chat:
After 5+ questions answered by AI:
↓
AI: "You're asking great questions! Many buyers at this stage
benefit from connecting with a local buyer agent who can:
• Show you properties in person
• Help you make competitive offers
• Navigate the buying process
Want to see agents matched to your needs?"
[Yes, Show Me Agents] [Keep Researching]
Screen Layout:
Header
"Saved Properties" title
Filter icon
Grid/List view toggle
Property Cards (Grid, 2 columns)
Thumbnail image
Price
Beds/Baths
Compatibility %
Tap card → Property detail
[Compare] button (appears when 2-4 selected)
Tap to enter "Select mode"
Checkboxes appear on cards
Select 2-4 properties
[Compare Selected] → Comparison screen
Comparison Screen (Mobile):
Horizontal swipe between properties
Current property highlighted
Stats listed vertically
Swipe left/right to switch properties
[View Full Details] button for each
AI recommendation card at end
Saved Tab (buyer)/saved
Screen Layout:
Profile header
User initials/photo
Name
Email
Menu sections:
My Intent
[Edit Search Criteria] → Intent form
Shows current criteria summary
Showings
List of showing requests
Status: Pending / Confirmed / Completed
Tap showing → Showing detail modal
Property info
Date/Time
Status
[Cancel Request] (if pending)
[Navigate to Property] (maps integration)
Agent Connection
If not connected: [Find an Agent] → Agent matching
If connected: Agent profile card
Name, photo, contact buttons
Settings
Notifications
Account
Privacy
Help & Support
Logout
Showing Detail Modal:
Showings List → Tap Showing Card
↓
Bottom Sheet slides up
↓
Showing Details:
- Property: 123 Oak St
- Status: Confirmed ✅
- Date: Friday, March 15
- Time: 2:00 PM
- Agent: Sarah Chen
- Phone: (312) 555-0123
↓
Action Buttons:
[Get Directions] → Opens Maps app
[Call Agent]
[Cancel Showing] (if applicable)
↓
On showing day (via push notification):
Profile Tab (buyer)/profile
"Reminder: Showing at 123 Oak St today at 2 PM"
[Navigate] [Reschedule]
Landing Page (/) → [I Want to Sell]
↓
/sell (Public page)
↓
Marketing content:
- "List Your Property for Free"
- "AI-Powered Pricing"
- "Verified Buyer Interest"
↓
[Create Free Listing] CTA
↓
/signup?role=seller
↓
Email/Password signup
↓
Account created
↓
Redirect to /seller/listing/create
Step 1: Property Address
"Where is your property located?"
↓
Address autocomplete input
↓
AI pulls public records in background
↓
[Next] button
Step 2: Auto-Populated Property Details
"Confirm Your Property Details"
↓
AI pre-filled fields (editable):
- Bedrooms: 3
- Bathrooms: 2
- Square Feet: 1,920
- Lot Size: 4,200 sqft
- Year Built: 1995
- Property Type: Single Family
↓
[Looks Good] or [Edit Details]
Role 3: Seller UI Flow
Seller Web Application Flow
Entry Point: Public Seller Portal
Listing Creation Wizard (/seller/listing/create)
↓
[Next]
Step 3: Photo Upload
"Upload Property Photos"
↓
Drag-and-drop area or [Browse Files]
↓
Upload 5-10 photos
↓
As each uploads:
- AI enhances (brightness, straightening)
- Shows before/after preview
- [Use Enhanced] or [Use Original]
↓
Reorder photos by dragging
↓
[Next]
Step 4: AI-Generated Description
"Review Your Listing Description"
↓
AI analyzes photos and generates:
"Charming 3-bed, 2-bath home in Lincoln Park with
southern exposure and private fenced yard. Recently
updated kitchen features stainless appliances and
granite counters. Original hardwood floors throughout.
Walking distance to CTA Brown Line."
↓
Editable text area
↓
[Regenerate Description] button (if not satisfied)
↓
[Next]
Step 5: AI Pricing Analysis
"Let's Price Your Home"
↓
Loading: "Analyzing comparable sales..." (5-10 seconds)
↓
Pricing Report:
- Comparable Sales (Last 90 days, 0.5 mile):
• 123 Main St: $445K (sold 15 days ago)
• 456 Oak Ave: $465K (sold 30 days ago)
• 789 Elm St: $452K (sold 45 days ago)
- Price Recommendation:
$449,000
(Middle of comparable range)
- Confidence: High (12 comparable sales)
- Price Range:
Conservative: $439K (sell fast)
Recommended: $449K (balanced)
Optimistic: $459K (test market)
↓
Editable price input
↓
[Use Recommended] or enter custom price
↓
[Next]
Step 6: Listing Preferences
"Showing Preferences"
↓
Checkboxes:
☑ Require verified buyer pre-approval
☑ Allow virtual showings
☐ Require 24-hour notice
☑ GPS check-in required
↓
Contact preferences:
○ Platform messages only
○ Email + Platform
○ Phone + Email + Platform
↓
[Create Listing] button
↓
Processing: "Creating your listing..." (3-5 seconds)
↓
Success: "Listing Created!"
↓
Redirect to /seller/dashboard
Screen Layout:
Top Navigation
Ezriya logo → /seller/dashboard
Notifications icon
Profile menu
My Listing → /seller/listing/[listingId]
Settings → /seller/settings
Logout
Main Content Area
Seller Dashboard (/seller/dashboard)
Buyer Interest Summary Card (Prominent)
┌────────────────────────────────────────────┐
│ Buyer Interest Summary │
├────────────────────────────────────────────┤
│ 12 Verified Buyers Match Your Property │
│ ├─ 5 buyers: 90-100% compatible ⭐⭐⭐ │
│ ├─ 4 buyers: 80-89% compatible ⭐⭐ │
│ └─ 3 buyers: 70-79% compatible ⭐ │
│ │
│ [View Buyer Details] button │
└────────────────────────────────────────────┘
Showing Activity Card
┌────────────────────────────────────────────┐
│ Showing Activity (Last 14 Days) │
├────────────────────────────────────────────┤
│ Week 1: ███ 3 showings │
│ Week 2: ████████ 8 showings ↗️ +167% │
│ │
│ [Manage Showing Requests] button │
└────────────────────────────────────────────┘
AI Pricing Insights Card
┌────────────────────────────────────────────┐
│ AI Insights │
├────────────────────────────────────────────┤
│ "Your property is performing ABOVE average│
│ for Lincoln Park. Similar homes average │
│ 5 showings in first 2 weeks. You've had │
│ 11 showings with strong compatibility │
│ scores. │
│ │
│ Recommendation: Hold current price. High-│
│ quality buyers are actively viewing. │
│ Expect offer within 7-10 days." │
│ │
│ Days on Market: 14 │
│ Current Price: $449,000 │
│ │
│ [Request Price Analysis] button │
└────────────────────────────────────────────┘
Showing Requests Section
┌────────────────────────────────────────────┐
│ Pending Showing Requests (3) │
├────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ John Buyer • 92% Match │ │
│ │ Requested: Friday, Mar 15 at 2 PM │ │
│ │ Verification: ✅ Pre-approved │ │
│ │ │ │
│ │ [Approve] [Deny] [Propose Different] │ │
│ └──────────────────────────────────────┘ │
│ │
│ │
│ [View All Requests] │
└────────────────────────────────────────────┘
Quick Actions
[Edit Listing] → /seller/listing/[listingId]/edit
[Request AI Video] → /seller/video/generate
[View Listing Preview] → Opens public view in new tab
Navigation Paths:
1. View Buyer Interest Details:
Dashboard → Buyer Interest Card → [View Buyer Details]
↓
/seller/buyer-interest
↓
Buyer Match List:
┌─────────────────────────────────────────┐
│ Buyer 1: Anonymous (until after showing)│
│ Match Score: 95% │
│ Budget: $440K-$480K ✅ │
│ Pre-approval: Verified ✅ │
│ Timeline: Ready now ✅ │
│ Must-haves: Garage ✅, Yard ✅ │
│ Viewed: Yes (3 days ago) │
│ Showing requested: No │
└─────────────────────────────────────────┘
[Note: Full buyer identity revealed only after
approved showing to protect privacy]
2. Approve Showing Request:
Dashboard → Showing Requests → [Approve] button
↓
Confirmation modal:
"Approve showing for John Buyer?"
Showing Details:
- Date: Friday, March 15
- Time: 2:00 PM
- Duration: 30 minutes
- Buyer verification: ✅ Pre-approved
- GPS check-in: ✅ Required
↓
[Confirm Approval] button
↓
Email sent to buyer with confirmation
↓
Calendar invite sent to seller
↓
Showing moved to "Confirmed" section
↓
Success toast: "Showing approved and confirmed"
3. Request Pricing Analysis (After 30 Days):
Dashboard → [Request Price Analysis] button
↓
Modal: "Updated Pricing Analysis"
↓
Loading: "Analyzing current market..." (10 seconds)
↓
Report:
Current Price: $449,000
Days on Market: 30
Showings: 11
Offers: 0
Market Update:
- Recent comps: $435K-$455K (tighter range)
- New inventory: +15% (more competition)
AI Recommendation:
"Your showing activity is strong (11 vs 7 avg),
but no offers suggests price resistance.
Reduce to $439K (2.2% decrease)
Expected: Offer within 7-14 days
Predicted final: $435K-$438K
Alternative: Hold for 14 more days if not
time-sensitive. Risk: More inventory coming."
↓
[Adjust Price] or [Keep Current Price] buttons
↓
If [Adjust Price]:
→ Price update form
→ Confirms new price
→ Listing updated
→ Notifications sent to interested buyers
Conversion Triggers:
Day 30 Conversion Prompt:
Dashboard loads on Day 30
↓
Banner appears at top:
" Market Update: Similar homes with agents sell 28% faster
and achieve 2% higher prices on average.
Connect with a listing agent to expand your reach to MLS
and provide professional marketing."
[See Matched Agents] [Dismiss]
↓
If [See Matched Agents]:
→ /seller/agent-matching
Day 60 Conversion Prompt:
Dashboard loads on Day 60
↓
Modal (cannot dismiss):
"60 Days on Market - Time for Professional Help?"
"After 60 days, FSBO success rate drops to 12%.
73% of sellers in your position hire agents and
close within 30 days.
Top agents in your area:
- Sarah Chen: Sold 3 homes on your street last year
- 98% of asking price achieved
- Average 22 days to close
[Connect with Sarah] [See Other Agents] [Dismiss for 7 days]"
Screen Layout:
Tabs: [Pending] [Confirmed] [Completed]
Pending Tab:
Showing request cards
Buyer info (limited until approved)
Requested date/time
Match score badge
Showing Management (/seller/showings)
Verification status
[Approve] [Deny] [Propose Different Time]
Confirmed Tab:
Upcoming showing cards
Full buyer info (post-approval)
Date/Time
GPS check-in status (live on showing day)
[Get Directions] [Contact Buyer] [Cancel]
Completed Tab:
Past showing cards
Date/Time
Buyer name
GPS check-in log (proof of attendance)
[Request Feedback] (sends survey to buyer)
Live Showing Tracking (Showing Day):
Confirmed Showing: Today at 2:00 PM
↓
1:55 PM: Push notification to seller
"Showing starts in 5 minutes.
You'll receive a notification when buyer checks in."
↓
2:02 PM: Buyer scans QR code at property
↓
GPS verifies location match
↓
Push notification to seller:
"✅ John Buyer checked in at 2:02 PM via GPS verification."
↓
Showing card shows "In Progress" status
↓
2:35 PM: Showing marked complete (automated after 30 min)
↓
Seller receives post-showing survey notification:
"How did the showing go? [Leave Feedback]"
App Opens → Check Auth State
↓
Not Authenticated → /login screen
↓
Signup as Seller → Role: seller
↓
Navigate to → Listing Creation Wizard (mobile-optimized)
Seller Mobile Application Flow
Entry Point: App Launch
Multi-Step Bottom Sheet Flow:
Step 1: Address Input
↓
Step 2: Property Details (pre-filled, editable)
↓
Step 3: Photo Upload
- Camera integration
- Gallery picker
- AI enhancement previews
↓
Step 4: Description (AI-generated, editable)
↓
Step 5: Pricing (AI analysis)
↓
Step 6: Preferences
↓
[Create Listing] button
↓
Navigate to → (seller)/dashboard
┌────────────────────────────────────┐
│ [ Dashboard] [ Showings] │
│ [ Analytics] [ Profile] │
└────────────────────────────────────┘
Screen Layout:
Header
Property address
Days on market badge
Edit icon → Edit listing screen
Scroll Content:
Buyer Interest Card
"12 Verified Buyers Match Your Property"
Compatibility breakdown (visual bars)
[View Details] → Buyer interest screen
Showing Activity Card
Week-over-week chart
Total showings count
[Manage Requests] → Showings tab
AI Insights Card
Current recommendation
Pricing feedback
[Request Analysis] → Pricing analysis bottom sheet
Pending Showing Requests
Request cards (swipeable)
Swipe right → Approve
Listing Creation (Mobile)
Bottom Tab Bar
Dashboard Tab (seller)/dashboard
Swipe left → Deny
Tap card → Request details
Navigation Paths:
1. Approve Showing (Swipe Gesture):
Dashboard → Pending Request Card
↓
Swipe right (green background appears)
↓
Haptic feedback
↓
Card animates off screen
↓
Confirmation toast: "Showing approved"
↓
Email sent to buyer
↓
Showing moves to Showings Tab → Confirmed
2. View Buyer Interest Details:
Dashboard → Buyer Interest Card → [View Details]
↓
Full-screen: Buyer Match List
↓
Buyer cards (vertical scroll)
- Match score
- Compatibility factors
- Activity status
↓
Tap buyer card → Buyer detail bottom sheet
Screen Layout:
Segment control: [Pending] [Confirmed] [Completed]
Pending:
Request cards
Tap card → Request detail bottom sheet
Buyer info
Requested time
Match details
[Approve] [Deny] [Propose Time]
Confirmed:
Upcoming showing cards
Date/Time countdown
Buyer name
[Get Directions] → Maps app
[Contact Buyer] → Phone/message
Showings Tab (seller)/showings
[Cancel Showing]
On Showing Day:
Confirmed Showing Today
↓
Card shows countdown: "Starting in 32 minutes"
↓
Push notification at T-5 minutes
↓
Buyer checks in via QR
↓
Push notification: "✅ Buyer checked in"
↓
Card updates to "In Progress" with live timer
↓
After 30 minutes → Auto-completes
↓
Moves to Completed tab
Completed:
Past showing cards
Date/Time
Duration
GPS verification log
[View Attendance Report] → PDF download
Screen Layout:
Property Summary Card
Thumbnail
Address
Price
Status
[Edit Listing]
Performance Metrics
Total views
Showings
Interested buyers
Agent Matching (if conversion trigger)
"Ready for Professional Help?"
[Find an Agent]
Settings
Help & Support
Logout
Profile Tab (seller)/profile
Vendor receives email:
"You've been added to a transaction on Ezriya"
↓
[Accept Invitation] button in email
↓
If no account:
→ /signup?role=vendor&invite=[token]
→ Create account
↓
If has account:
→ /login
↓
After auth:
→ /vendor/deal/[dealId]
Screen Layout:
Top Navigation
Logo
Active Jobs badge
Notifications
Profile menu
Main Content
Active Jobs List
Job cards showing:
Property address
Transaction party (agent name)
Your role (Lender / Inspector / Title / etc.)
Pending tasks count
[View Deal Room]
Navigation:
Click job card → /vendor/deal/[dealId]
Screen Layout:
Header
Property address
Your role badge
Deal status
Left Panel: Your Tasks
Only shows tasks assigned to vendor
Role 4: Vendor UI Flow
Vendor Web Application
Entry Point: EmailInvitation
Vendor Dashboard (/vendor/dashboard)
Vendor Deal Room (/vendor/deal/[dealId])
Task cards with:
Title
Due date
Dependencies
[Mark Complete] button
[Upload Deliverable] button
Center Panel: Documents
Upload area for vendor deliverables
Uploaded documents list
Right Panel: Chat
Communication with agent and parties
Vendor-Specific Features by Type:
Lender Interface:
Tasks visible:
- Issue pre-approval letter (Day 1)
- Submit loan application (Day 5-10)
- Order appraisal (Day 15-20)
- Provide loan commitment (Day 25-30)
- Clear to close (Day 35-40)
↓
Each task has upload button for documents
↓
Upload "Pre-Approval_Letter.pdf"
↓
Task auto-marked complete
↓
All parties notified
Inspector Interface:
Tasks visible:
- Schedule inspection (Day 5-7)
- Complete inspection (Day 8-10)
- Deliver report (Day 10-12)
↓
Inspection Report Upload:
- PDF report
- Photo gallery (auto-organized)
- Issue categorization:
☑ Major issues
☑ Minor issues
☑ Safety concerns
↓
Submit report
↓
Buyer and agents notified
Title Company Interface:
Tasks visible:
- Open title order (Day 1)
- Complete title search (Day 7-10)
- Deliver title commitment (Day 12-15)
- Coordinate closing (Day 35-45)
↓
Title Commitment Upload:
- PDF document
- Exception notes
- Closing cost estimate
┌──────────────────────────────┐
│ [ Jobs] [✓ Tasks] [ Me] │
└──────────────────────────────┘
Screen Layout:
Active jobs list
Job cards
Property address
Agent name
Pending tasks badge
Tap → Deal room
Navigation:
Tap job → /deal/[dealId] (vendor view)
Screen Layout:
Header
Property address
Back arrow
Tabs: [My Tasks] [Documents] [Chat]
My Tasks Tab:
Task list (only vendor's tasks)
Tap task → Task detail bottom sheet
Description
Due date
[Upload Document] button
Camera option
Gallery option
File browser
[Mark Complete]
Documents Tab:
Vendor's uploaded documents
Vendor Mobile Application
Bottom Tab Bar
Jobs Tab (vendor)/jobs
Deal Room (Vendor Mobile)
Upload button (+)
Chat Tab:
Transaction chat access
Field Workflow Example (Inspector):
Inspector arrives at property
↓
Opens Ezriya app → Jobs Tab → Active job
↓
Deal Room → My Tasks
↓
Task: "Complete inspection"
↓
During inspection:
- Take photos with in-app camera
- Photos auto-upload to deal documents
- Add notes to each photo
↓
After inspection:
- Tap task
- [Upload Report] → Select PDF from device
- Upload progress bar
- [Mark Complete]
↓
Task marked done
↓
All parties receive notification
↓
Inspector moves to next job
Access Control:
Only users with role: admin can access /admin/* routes
Redirect others to their role-appropriate dashboard
Screen Layout:
Top Navigation
Ezriya Admin logo
Environment badge (Staging / Production)
Admin user profile
Left Sidebar
Dashboard
Users → /admin/users
Deals → /admin/deals
Listings → /admin/listings
Role 5: Admin UI Flow
Admin Dashboard (/admin/dashboard)
Analytics → /admin/analytics
Content Moderation → /admin/moderation
Support → /admin/support
System → /admin/system
Main Content (Dashboard Home)
Platform Metrics (KPI Cards)
Total Users: 1,247
Active Deals: 67
Tasks Automated: 12,458
Revenue (MTD): $28,450
System Health
API Latency: 245ms (p95)
Error Rate: 0.08%
AI Uptime: 99.97%
DB Connections: 45/100
Recent Activity Feed
User signups
Deal creations
Flagged content
Support tickets
Screen Layout:
Filter bar
Role: [All] [Agent] [Buyer] [Seller] [Vendor]
Status: [All] [Active] [Suspended] [Pending Verification]
Search by email/name
User table
Columns: Name, Email, Role, Status, Joined Date, Actions
Click row → User detail modal
User Detail Modal:
User info
Name, email, phone
Role
Status
Registration date
Last active
Activity summary
Deals participated in
Messages sent
Documents uploaded
Admin actions
[Edit User]
[Suspend User] / [Activate User]
[Reset Password]
[Verify License] (for agents)
[View Audit Log]
User Management (/admin/users)
Agent Verification Flow:
Admin → Users → Filter: Role=Agent, Status=Pending
↓
List of agents awaiting verification
↓
Click agent row → User Detail Modal
↓
Agent info displayed:
- License Number: ABC123456
- License State: Illinois
- Brokerage: XYZ Realty
- Verification docs: [View uploaded license PDF]
↓
[View License Document] → PDF viewer opens
↓
Admin verifies:
✓ License number matches
✓ License is active (cross-check state database)
✓ Photo matches
↓
[Verify Agent] button
↓
Confirmation: "Approve agent Sarah Chen?"
↓
[Confirm]
↓
Agent status → Verified
↓
Email sent to agent: "Your account is now verified!"
↓
Agent can now access full platform features
Screen Layout:
Filter bar
Status: [All] [Active] [Completed] [Disputed]
Date range picker
Search by property address
Deal table
Columns: Property, Parties, Status, Tasks, Created, Actions
Click row → Deal detail view
Deal Detail View (Admin):
Full deal overview
All parties
All tasks (all statuses)
All messages (full chat log)
All documents
Timeline (complete audit trail)
Deal Oversight (/admin/deals)
Admin actions
[Export Compliance Log]
[Resolve Dispute] (if flagged)
[Extend Deadlines] (if requested)
Dispute Resolution Flow:
Deals → Filter: Status=Disputed
↓
Disputed deal appears (flagged by user)
↓
Click deal → Deal Detail View
↓
Dispute Details:
- Flagged by: John Buyer
- Reason: "Agent not responding to messages"
- Date flagged: 2 days ago
- Messages: [View dispute thread]
↓
Admin reviews:
- Chat logs (agent last active 3 days ago)
- Task status (3 overdue tasks assigned to agent)
↓
Admin actions:
1. [Contact Agent] → Sends priority notification
2. [Reassign Tasks] → Transfers to backup agent
3. [Mark Resolved] → Closes dispute
↓
Admin adds resolution note:
"Contacted agent via phone. Tasks reassigned to backup
agent. Buyer notified of resolution."
↓
[Save Resolution]
↓
Status → Active
↓
Both parties receive notification
Screen Layout:
Time range selector
Chart sections:
User Growth Chart
Line graph: Users by role over time
Deal Funnel
Funnel viz: Leads → Created → Active → Closed
AI Usage Metrics
Task automation usage
Chat message volume
Property analysis requests
Document extraction calls
Analytics Dashboard (/admin/analytics)
Revenue Metrics
Subscription MRR
Referral revenue
Revenue by role
Performance Metrics
API response times (p50, p95, p99)
Error rates by endpoint
AI model latency
Export Options:
[Export to CSV]
[Export to PDF]
[Schedule Report] → Email weekly/monthly
Screen Layout:
Tabs: [Flagged Listings] [Flagged Messages] [Flagged Users]
Flagged Listings Tab:
Listing cards with flag reason
"Inappropriate photos"
"Misleading description"
"Duplicate listing"
Click → Listing review modal
Listing Review Modal:
Listing details
Flag reason and reporter
[Approve Listing] (dismiss flag)
[Remove Listing] → Confirmation → Email to seller
[Suspend User] (if repeat offense)
Flagged Messages Tab:
Message cards
Context: Deal room chat where flagged
Flag reason (harassment, spam, inappropriate)
[Dismiss Flag]
[Remove Message]
[Warn User]
[Suspend User]
Screen Layout:
Filter: [Open] [In Progress] [Resolved]
Ticket list
Subject
Content Moderation (/admin/moderation)
Support Tickets (/admin/support)
User
Priority
Created date
Assigned to
Ticket Detail View:
Ticket info
User: John Buyer
Subject: "Cannot upload documents"
Priority: Medium
Status: Open
Created: 2 hours ago
Conversation thread
User's initial message
Admin responses
Internal notes (not visible to user)
Admin actions
Reply to user (email sent + platform notification)
Change priority
Assign to specialist
[Mark Resolved]
Ticket Response Flow:
Support → Open Tickets → Click ticket
↓
Ticket Detail View
↓
User message:
"I'm trying to upload my pre-approval letter but
keep getting an error. Help!"
↓
Admin reviews:
- Checks user's account (no issues)
- Checks error logs (sees 500 error on upload endpoint)
- Identifies bug in file size validation
↓
Admin actions:
1. Reply to user:
"Thanks for reporting this. We've identified a bug
in our upload system. Our team is fixing it now.
Expected resolution: 2 hours. I'll notify you when
it's fixed. In the meantime, you can email the
document to your agent."
2. Internal note:
"Bug in file upload endpoint. Ticket#1234 opened
with engineering."
3. Assign to: Engineering Team
↓
2 hours later:
Bug fixed, deployed
↓
Admin updates ticket:
"Issue resolved. Upload functionality restored.
Please try uploading again and let us know if
you encounter any issues."
↓
[Mark Resolved]
↓
User receives email notification
Web (Next.js):
/ → Landing page
/login → Login
/signup → Signup
/agent/dashboard → Agent home
/agent/deals → Deal list
/agent/deals/[dealId] → Deal room
/agent/deals/[dealId]#task-[id] → Jump to specific task
/buyer/home → Buyer property feed
/buyer/property/[propertyId] → Property detail
/seller/dashboard → Seller dashboard
/vendor/dashboard → Vendor jobs
/admin/users → Admin user management
Mobile (Expo Router):
(agent)/home → Agent dashboard
deal/[dealId] → Deal room (universal)
property/[propertyId] → Property detail (universal)
(buyer)/home → Buyer feed
(seller)/dashboard → Seller dashboard
Push Notification Deep Links:
Push: "Task due in 2 hours"
→ ezriya://deal/[dealId]?tab=tasks&highlight=[taskId]
↓
App opens → Navigates to deal room → Tasks tab → Scrolls to highlighted task
Push: "New showing request"
→ ezriya://showings/[requestId]
↓
App opens → Showings screen → Request highlighted
Universal Screen Patterns
Deep Linking Structure
Push: "New message in deal room"
→ ezriya://deal/[dealId]?tab=chat
↓
App opens → Deal room → Chat tab
Web Modals:
Overlay with backdrop blur
Centered on screen
ESC key to close
Click outside to close (unless form with unsaved changes)
Mobile Modals:
Bottom sheets (slide up from bottom)
Draggable handle at top
Swipe down to dismiss
Haptic feedback on open/close
Skeleton Screens:
Loading property list:
→ Show card skeletons with shimmer animation
→ Maintain layout (prevent layout shift)
Loading property detail:
→ Show image skeleton
→ Show text line skeletons
→ Load real content, fade in
Optimistic UI:
User marks task complete:
→ Instantly move task to "Completed" column
→ Show subtle loading indicator
→ If API fails, rollback with error toast
Network Errors:
API call fails
↓
Error toast: "Connection lost. Retrying..."
↓
Auto-retry 3 times with exponential backoff
↓
If still failing:
"Cannot connect. Check your internet connection."
[Retry] button
Modal Patterns
Loading States
Error Handling
Validation Errors:
Form submission with invalid data
↓
Highlight fields with errors (red border)
↓
Show inline error messages below fields
↓
Scroll to first error
↓
Focus on first invalid field
Subtle Success:
Task marked complete
→ Green checkmark animation (Lottie)
→ Haptic feedback
→ Toast: "Task completed"
→ Auto-dismiss after 3 seconds
Prominent Success:
Deal closed
→ Full-screen success animation
→ Confetti effect
→ " Deal Closed Successfully!"
→ [View Summary] button
1. Login/Signup
2. Dashboard Home
3. Deal List
4. Deal Room (with Tasks/Chat/Docs tabs)
5. Deal Creation Form
6. Client List
7. Client Profile
8. Lead Inbox
9. Lead Detail
10. Analytics Dashboard
11. Settings
12. Billing
13. Property Analysis Results
14. Contract Upload & AI Processing
15. Compliance Log Export
Success Feedback
Screen Flow Summary by Role
Agent (15 Core Screens)
1. Login/Signup
2. Onboarding (Intent Creation)
3. Property Feed (Home)
4. Property Detail
5. Property Comparison
6. Favorites
7. AI Chat Assistant
8. Showing Schedule
9. Agent Matching
10. Profile/Settings
1. Login/Signup
2. Listing Creation Wizard
3. Seller Dashboard
4. Listing Editor
5. Buyer Interest Details
6. Showing Management
7. Pricing Analysis
8. Agent Matching (conversion)
9. Profile/Settings
1. Login/Signup (via invitation)
2. Jobs Dashboard
3. Deal Room (Vendor View)
4. Task Upload Interface
5. Profile/Settings
1. Login
2. Admin Dashboard
3. User Management
4. Deal Oversight
5. Analytics Dashboard
6. Content Moderation
7. Support Tickets
8. System Configuration
This UI flow map provides the complete navigation architecture for all five roles across web
and mobile platforms. Each screen connection, state transition, and user journey is
documented to ensure consistent implementation.
Key Takeaways:
Buyer (10 Core Screens)
Seller (9 Core Screens)
Vendor (5 Core Screens)
Admin (8 Core Screens)
Conclusion
1. Unified Deal Room: All roles access the same /deal/[dealId] structure but see roleappropriate views
2. Conversion Funnels: Buyers and sellers have clear paths from free tools to agent
referrals
3. Mobile-First: Bottom tab navigation for primary user flows, with full-screen modals
for focused tasks
4. Deep Linking: Push notifications and email links navigate directly to relevant
screens
5. Optimistic UI: Instant feedback with background API calls for perceived zero
latency
6. Progressive Disclosure: Complex features revealed progressively to reduce
cognitive load
Implementation Priority:
1. Agent Deal Room (core business value)
2. Buyer Property Feed (user acquisition)
3. Seller Dashboard (conversion funnel)
4. Vendor Interface (transaction support)
5. Admin Tools (operations)
Next Steps: Use this flow map to create detailed wireframes, then implement routing
structure in Next.js (web) and Expo Router (mobile).

Web UI Pages Documentation
This document provides a comprehensive overview of all UI pages currently implemented in the apps/web application. It details the specific purpose, functionality, and user flow for each page.

1. Public & Authentication
Landing Page
Route: /
File: apps/web/app/page.tsx
Purpose: The Landing Page serves as the primary entry point and marketing front for the Ezriya platform. Its main goal is to convert visitors into users by showcasing the platform's value proposition: an AI-first, modern real estate experience.
Functionality:
Visual Engagement: Uses an AmbientOrb background effect to create a premium, "glass-morphic" aesthetic immediately upon load.
Navigation: The GlassNavbar provides easy access to login, signup, and key sections.
Hero Section: Delivers the core message and a primary call-to-action (CTA) to get started.
Listing Preview: The ListingGrid component displays a curated selection of properties to demonstrate the platform's high-quality aesthetic and inventory.
Login
Route: /login
File: apps/web/app/(auth)/login/page.tsx
Purpose: A secure gateway for existing users (Agents, Buyers, Sellers, Vendors) to access their personalized dashboards.
Functionality:
Authentication: Accepts email and password credentials.
Role Redirection: Upon successful authentication via the useAuth hook, the system identifies the user's role and redirects them to the appropriate portal (currently defaults to /agent for demonstration).
Error Handling: Provides real-time feedback for incorrect credentials or system errors.
Signup
Route: /signup
File: apps/web/app/(auth)/signup/page.tsx
Purpose: The onboarding hub for new users, allowing them to create an account and define their role within the ecosystem.
Functionality:
Role Selection: Users must self-identify as an Agent, Buyer, or Seller. This selection dictates their subsequent user experience and dashboard access.
Account Creation: Collects email and password to establish a new identity in the auth system.
Immediate Access: Automatically logs the user in and redirects them to their specific dashboard upon successful registration.
2. Agent Portal
Base Route: /agent Target User: Real Estate Agents Core Value: A "Command Center" for managing their entire business in one place.

Dashboard
Route: /agent
File: apps/web/app/agent/page.tsx
Purpose: The central operational hub for agents. It aggregates critical information to help agents prioritize their day.
Functionality:
KPI Monitoring: Displays high-level metrics like "Active Leads," "Commission Pipeline," and "Actions Needed" to give a snapshot of business health.
Task Automation: Lists prioritized tasks (e.g., "Send Offer," "Follow up") that are often AI-generated or system-triggered, ensuring no deadline is missed.
Lead Insight: Highlights "High-Intent Leads" with AI-calculated scores, allowing agents to focus on clients ready to transact.
Quick Actions: Provides immediate access to common tasks like "Import Leads" or creating a "New Deal."
Analytics
Route: /agent/analytics
File: apps/web/app/agent/analytics/page.tsx
Purpose: To provide agents with deep insights into their performance and market trends.
Functionality:
Performance Tracking: (Planned) revenue, deal velocity, and conversion rates.
Market Analysis: (Planned) local market trends to help agents advise clients.
Current Status: Placeholder awaiting data integration.
AI Chat (Copilot)
Route: /agent/chat
File: apps/web/app/agent/chat/page.tsx
Purpose: An always-available AI assistant dedicated to helping the agent.
Functionality:
Context-Aware Assistance: (Planned) Agents can ask questions like "Draft an email to Sarah regarding 123 Main St" or "What's the market trend in Austin?".
Current Status: Placeholder interface.
Clients
Route: /agent/clients
File: apps/web/app/agent/clients/page.tsx
Purpose: A CRM (Customer Relationship Management) interface for organizing buyer and seller relationships.
Functionality:
Client Directory: Displays a list of all clients with their type (Buyer/Seller) and status.
Status Tracking: Shows when a client was last contacted and their current engagement level.
Communication: Quick buttons to message or view detailed profiles.
Deals (Deal Room)
Route: /agent/deals
File: apps/web/app/agent/deals/page.tsx
Purpose: A dedicated space for managing active transactions from contract to close.
Functionality:
Kanban Visualization: A drag-and-drop board allowing agents to move deals through stages (New -> Negotiation -> Under Contract -> Closed).
List View: An alternative tabular view for detailed sorting and filtering.
Deal Details: Clicking a card opens detailed transaction info (mocked).
Leads
Route: /agent/leads
File: apps/web/app/agent/leads/page.tsx
Purpose: Top-of-funnel management for potential clients who haven't yet transacted.
Functionality:
Lead Scoring: (Planned) AI qualification of incoming leads.
Outreach Management: (Planned) Tools for nurturing leads into clients.
Current Status: Placeholder.
Settings
Route: /agent/settings
File: apps/web/app/agent/settings/page.tsx
Purpose: Configuration area for the agent's personal and professional profile.
Functionality:
Profile Management: Editing contact info, bio, and headshot.
Notification Preferences: Toggling email and push notifications for various events.
3. Buyer Portal
Base Route: /buy & /(buyer) Target User: Home Buyers Core Value: A personalized, AI-guided home buying journey.

Search
Route: /buy
File: apps/web/app/buy/page.tsx
Purpose: The primary interface for discovering properties. Unlike traditional search, this is AI-driven.
Functionality:
Natural Language Search: Users can type complex queries like "3 bed in Lincoln Park under $500k with a backyard."
AI Match Scoring: Listings show a percentage match score based on the user's "Buyer DNA."
Smart Insights: Cards highlight specific reasons for a match (e.g., "Investment potential," "School district").
Preferences (Buyer DNA)
Route: /buy/preferences
File: apps/web/app/buy/preferences/page.tsx
Purpose: To build a comprehensive profile of the buyer's needs, wants, and financial situation.
Functionality:
Quiz Interface: A step-by-step interactive questionnaire (QuizContainer) that captures data to fuel the AI matching algorithms.
Roadmap
Route: /buy/roadmap
File: apps/web/app/buy/roadmap/page.tsx
Purpose: An educational and tracking tool to demystify the complex home buying process.
Functionality:
Process Timeline: Visualizes the journey from "Financial Readiness" to "Closing Day."
Affordability Calculator: A dynamic tool for estimating purchasing power based on income and debts.
Checklist: Specific tasks for the buyer to complete (e.g., "Get Pre-Approved").
Cost Estimator: Breakdown of potential closing costs.
Deal Details
Route: /buyer/deals/[id]
File: apps/web/app/(buyer)/deals/[id]/page.tsx
Purpose: A transparent view into a specific active transaction.
Functionality:
Status Tracker: Shows exactly where the deal stands (e.g., "Appraisal" stage).
Document Repository: Access to signed and pending documents (Purchase Agreement, Disclosures).
Team Contacts: Easy access to the professionals involved (Agent, Lender, Attorney).
Favorites
Route: /buyer/favorites
File: apps/web/app/(buyer)/favorites/page.tsx
Purpose: A personal collection of listings the buyer is interested in.
Functionality:
Saved Listings: Grid view of properties the user has bookmarked.
Showings
Route: /buyer/showings
File: apps/web/app/(buyer)/showings/page.tsx
Purpose: A calendar management tool for property tours.
Functionality:
Itinerary: List of upcoming confirmed showings with time, location, and agent details.
Scheduling: Ability to request or reschedule tours (mocked).
4. Seller Portal
Base Route: /sell Target User: Home Owners Core Value: maximizing home value through AI analysis and streamlined listing.

Listing Wizard
Route: /sell
File: apps/web/app/sell/page.tsx
Purpose: A comprehensive, step-by-step workflow to prepare and list a property for sale.
Flow & Functionality:
Details: Captures basic property facts (address, beds, baths) to pull public records.
Media: Upload interface for photos and videos, which serve as input for AI analysis.
Location AI: Analyzes the neighborhood data to provide a "Market Value" estimate and SWOT analysis (Strengths, Weaknesses, Opportunities, Threats).
Condition AI: Uses computer vision (mocked) to analyze photos and suggest improvements (e.g., "Update cabinets to white for +$6.5k value").
Pro Hub: Marketplace to connect with necessary vendors (Inspectors, Photographers).
Publish: Final review screen presenting the listing price and strength before going live.
Preferences (Seller DNA)
Route: /sell/preferences
File: apps/web/app/sell/preferences/page.tsx
Purpose: Captures the seller's timeline, motivation, and financial goals.
Functionality:
Quiz Interface: Similar to the buyer side, this builds a profile to tailor the selling strategy (SellerQuizContainer).
5. Admin Portal
Base Route: /admin (Group (admin)) Target User: Platform Administrators Core Value: System-wide oversight and management.

Dashboard
Route: /admin
File: apps/web/app/(admin)/page.tsx
Purpose: High-level health check of the entire Ezriya platform.
Functionality:
Global Metrics: Snapshot of Total Users, Active Deals, and total Platform Revenue.
Analytics
Route: /admin/analytics
File: apps/web/app/(admin)/analytics/page.tsx
Purpose: Deep dive into platform growth and usage statistics.
Functionality:
Charts: (Planned) visualizations of user acquisition and revenue over time.
Deals Oversight
Route: /admin/deals
File: apps/web/app/(admin)/deals/page.tsx
Purpose: Monitoring capabilities for all transactions on the platform to ensure compliance and resolve disputes.
Functionality:
Global Deal List: View every active deal, its value, status, and the assigned agent.
User Management
Route: /admin/users
File: apps/web/app/(admin)/users/page.tsx
Purpose: Administration of user accounts.
Functionality:
User Table: Management interface for banning/approving users, verifying identities, and managing role permissions.
6. Vendor Portal
Base Route: /vendors Target User: Service Providers (Lenders, Inspectors, Contractors) Core Value: Recruitment and lead generation.

Landing Page
Route: /vendors
File: apps/web/app/vendors/page.tsx
Purpose: A dedicated recruitment page to attract service professionals to the Ezriya Partner Network.
Functionality:
Value Prop: Explains the benefits of joining (access to ready-to-buy clients).
Categories: detailed breakdown of the types of vendors needed (Lenders, Movers, etc.).
Onboarding Info: Explains the "Free to join" model and referral fee structure.

Comment
⌥⌘M
