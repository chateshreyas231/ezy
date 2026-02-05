# Ezriya Platform - Complete Documentation

**Version:** 2.0.0  
**Last Updated:** January 2026  
**Platform:** React Native (Expo) + Supabase

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Frontend Architecture](#frontend-architecture)
8. [Backend Architecture](#backend-architecture)
9. [Data Flow](#data-flow)
10. [Core Features](#core-features)
11. [UI/UX System](#uiux-system)
12. [Node Modules & Dependencies](#node-modules--dependencies)
13. [Environment Setup](#environment-setup)
14. [Development Workflow](#development-workflow)
15. [Deployment](#deployment)

---

## Platform Overview

**Ezriya** is a real estate matchmaking platform that connects buyers, sellers, and agents through an intelligent swipe-based interface. The platform facilitates property discovery, matching, and deal management through a mobile-first experience.

### Key Concepts

- **Buyers**: Search for properties by creating intents (budget, location, preferences)
- **Sellers**: List properties and review interested buyers
- **Agents**: Represent buyers or sellers in transactions
- **Swipe Mechanism**: Tinder-style interface for property/buyer discovery
- **Matches**: Created when both parties swipe "yes"
- **Deal Rooms**: Collaborative spaces for matched parties to communicate and transact

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (Expo)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Buyer UI   │  │  Seller UI   │  │   Agent UI   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                          │                                   │
│                  ┌───────▼────────┐                          │
│                  │  Shared Hooks  │                          │
│                  │  & Services    │                          │
│                  └───────┬────────┘                          │
└──────────────────────────┼──────────────────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │  Supabase Client │
                  └────────┬─────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │      │
│  │   Database   │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  Edge Funcs  │  │  Realtime    │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
ezriya-platform-main/
├── apps/
│   └── mobile/                      # Main mobile application
│       ├── app/                     # Expo Router screens
│       │   ├── _layout.tsx          # Root layout with providers
│       │   ├── index.tsx            # Entry point & routing logic
│       │   ├── (auth)/              # Authentication screens
│       │   │   ├── login.tsx        # Login/Signup
│       │   │   ├── role-select.tsx  # Role selection
│       │   │   └── verify.tsx       # Verification flow
│       │   ├── (buyer)/             # Buyer-specific screens
│       │   │   ├── (tabs)/          # Buyer tab navigation
│       │   │   │   ├── feed.tsx     # Property feed
│       │   │   │   ├── matches.tsx  # Buyer matches
│       │   │   │   ├── inbox.tsx    # Messages
│       │   │   │   └── profile.tsx  # Profile settings
│       │   │   └── intent-setup.tsx # Buyer intent configuration
│       │   ├── (seller)/            # Seller-specific screens
│       │   │   ├── (tabs)/
│       │   │   │   ├── leads.tsx    # Buyer leads
│       │   │   │   ├── listings.tsx # Property listings
│       │   │   │   ├── matches.tsx  # Seller matches
│       │   │   │   └── inbox.tsx    # Messages
│       │   │   └── create-listing.tsx
│       │   ├── (pro)/               # Agent screens
│       │   │   └── (tabs)/
│       │   │       ├── dashboard.tsx
│       │   │       ├── clients.tsx
│       │   │       └── pipeline.tsx
│       │   ├── (support)/           # Support screens
│       │   ├── explore.tsx          # Map/location-based view
│       │   └── deal/[dealId].tsx    # Deal room detail
│       ├── components/              # Reusable components
│       │   ├── AnimatedSplashScreen.tsx
│       │   ├── ChatTab.tsx
│       │   ├── TasksTab.tsx
│       │   └── StyledComponents.tsx
│       ├── lib/                     # Core business logic
│       │   ├── hooks/               # Custom React hooks
│       │   │   ├── useAuth.tsx      # Authentication hook
│       │   │   ├── useIntent.ts     # Buyer intent management
│       │   │   ├── useListing.ts    # Listing CRUD
│       │   │   ├── useSwipe.ts      # Swipe actions
│       │   │   ├── useMatches.ts    # Match management
│       │   │   ├── useFeed.ts       # Feed data loading
│       │   │   ├── useDealRoom.ts   # Deal room operations
│       │   │   └── useConversations.ts
│       │   ├── supabaseClient.ts    # Supabase initialization
│       │   ├── ThemeContext.tsx     # Theme provider
│       │   └── utils/
│       │       └── assetLoader.ts   # Media loading utilities
│       ├── src/
│       │   └── ui/                  # UI component library
│       │       ├── tokens.ts        # Design tokens
│       │       ├── ScreenBackground.tsx
│       │       ├── GlassSurface.tsx
│       │       ├── GlassTabBar.tsx  # Custom tab bar
│       │       ├── LiquidGlassCard.tsx
│       │       ├── GlassPill.tsx
│       │       └── LiquidGlassButton.tsx
│       ├── assets/                  # Static assets
│       │   ├── images/
│       │   └── fonts/
│       ├── ios/                     # iOS native project
│       │   ├── Podfile              # CocoaPods dependencies
│       │   ├── .xcode.env           # Xcode environment
│       │   └── Ezriya.xcodeproj/
│       ├── android/                 # Android native project
│       ├── app.config.js            # Expo configuration
│       ├── package.json             # Mobile app dependencies
│       └── tsconfig.json
├── packages/
│   └── shared/                      # Shared TypeScript types
│       ├── types.ts                 # Shared type definitions
│       └── package.json
├── supabase/
│   ├── migrations/                  # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_verification.sql
│   │   └── ...
│   └── functions/                   # Edge functions
│       ├── matchmaking/
│       └── notifications/
├── scripts/                         # Utility scripts
│   ├── seed.ts                      # Database seeding
│   ├── seed-comprehensive.ts        # Full test data
│   └── seed-us-locations.ts         # US location data
├── constants/                       # Shared constants
│   ├── Colors.ts
│   ├── SwipeConfig.ts
│   └── Theme.ts
├── package.json                     # Root package.json
└── tsconfig.json                    # Root TypeScript config
```

---

## Technology Stack

### Frontend (Mobile App)

#### Core Framework
- **React Native**: 0.81.4 - Cross-platform mobile framework
- **Expo**: ^54.0.7 - Development platform and tooling
- **Expo Router**: ~6.0.4 - File-based routing system
- **TypeScript**: ~5.8.3 - Type safety

#### UI & Styling
- **expo-blur**: ~15.0.7 - Blur effects for glassmorphism
- **expo-linear-gradient**: ~15.0.8 - Gradient backgrounds
- **liquid-glass-react**: ^1.1.1 - Glass UI components
- **react-native-reanimated**: ~3.10.1 - Smooth animations
- **react-native-gesture-handler**: ~2.28.0 - Touch gestures
- **@expo/vector-icons**: ^15.0.2 - Icon library

#### Navigation
- **expo-router**: ~6.0.4 - File-based navigation
- **react-native-screens**: ~4.16.0 - Native screen optimization
- **react-native-safe-area-context**: ~5.6.0 - Safe area handling

#### State & Data
- **@supabase/supabase-js**: ^2.57.4 - Backend client
- **@react-native-async-storage/async-storage**: ^2.2.0 - Local storage
- **react-native-url-polyfill**: ^2.0.0 - URL API polyfill

#### Media & Assets
- **expo-image**: ~3.0.8 - Optimized image component
- **expo-video**: ^3.0.15 - Video playback
- **expo-font**: ~14.0.8 - Custom fonts

#### Device Features
- **expo-location**: ^19.0.8 - Location services
- **expo-haptics**: ~15.0.7 - Haptic feedback
- **expo-secure-store**: ^15.0.7 - Secure storage
- **expo-splash-screen**: ~31.0.10 - Splash screen management

### Backend (Supabase)

#### Database
- **PostgreSQL**: 15+ - Relational database
- **PostGIS**: Geographic data extension
- **UUID**: Unique identifiers

#### Services
- **Supabase Auth**: User authentication & sessions
- **Supabase Storage**: Media file storage
- **Supabase Realtime**: WebSocket subscriptions
- **Edge Functions**: Serverless TypeScript functions

#### Security
- **Row Level Security (RLS)**: Database-level authorization
- **JWT**: Token-based authentication
- **API Keys**: Service authentication

---

## Database Schema

### Core Tables

#### 1. **profiles**
User profiles linked to Supabase Auth users.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('buyer', 'seller', 'buyer_agent', 'seller_agent', 'support')),
  display_name TEXT,
  verification_level INTEGER DEFAULT 0,
  buyer_verified BOOLEAN DEFAULT false,
  seller_verified BOOLEAN DEFAULT false,
  readiness_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- 1:1 with `auth.users`
- 1:Many with `buyer_intents`, `listings`, `swipes`, `matches`

---

#### 2. **buyer_intents**
Buyer search criteria and preferences.

```sql
CREATE TABLE buyer_intents (
  id UUID PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id),
  budget_min INTEGER,
  budget_max INTEGER,
  beds_min INTEGER,
  baths_min INTEGER,
  property_types TEXT[],
  must_haves TEXT[],
  dealbreakers TEXT[],
  areas JSONB,              -- Geographic areas
  commute_anchors JSONB,    -- Work/school locations
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- Many:1 with `profiles` (buyer_id)
- Target of swipes from sellers

---

#### 3. **listings**
Property listings created by sellers.

```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address_public TEXT,      -- City, neighborhood
  address_private TEXT,     -- Full address (hidden until match)
  price INTEGER NOT NULL,
  beds INTEGER NOT NULL,
  baths INTEGER NOT NULL,
  sqft INTEGER,
  property_type TEXT NOT NULL,
  features TEXT[],
  status TEXT CHECK (status IN ('draft', 'active', 'pending', 'sold', 'inactive')),
  listing_verified BOOLEAN DEFAULT false,
  freshness_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- Many:1 with `profiles` (seller_id)
- 1:Many with `listing_media`
- Target of swipes from buyers

---

#### 4. **listing_media**
Images and videos for listings.

```sql
CREATE TABLE listing_media (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  storage_path TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- Many:1 with `listings`

---

#### 5. **swipes**
User swipe actions (yes/no).

```sql
CREATE TABLE swipes (
  id UUID PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id),
  target_type TEXT CHECK (target_type IN ('listing', 'buyer_intent')),
  target_id UUID NOT NULL,
  direction TEXT CHECK (direction IN ('yes', 'no')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(actor_id, target_type, target_id)
);
```

**Relationships:**
- Many:1 with `profiles` (actor_id)
- References `listings` or `buyer_intents` (polymorphic via target_type/target_id)

---

#### 6. **matches**
Created when both parties swipe yes.

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  match_score NUMERIC,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)
);
```

**Relationships:**
- Many:1 with `listings`
- Many:1 with `profiles` (buyer_id, seller_id)
- 1:1 with `deal_rooms`

---

#### 7. **deal_rooms**
Collaborative spaces for matched parties.

```sql
CREATE TABLE deal_rooms (
  id UUID PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  status TEXT CHECK (status IN ('matched', 'touring', 'offer_made', 'under_contract', 'closed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- 1:1 with `matches`
- 1:Many with `deal_participants`, `messages`, `tasks`

---

#### 8. **messages**
Chat messages within deal rooms.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  deal_room_id UUID REFERENCES deal_rooms(id),
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- Many:1 with `deal_rooms`
- Many:1 with `profiles` (sender_id)

---

### Database Diagram

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │
       │ 1:1
       │
┌──────▼──────────┐
│   profiles      │
│  - id (PK)      │
│  - role         │
│  - display_name │
└─────┬───────────┘
      │
      ├─── 1:Many ───┐
      │              │
┌─────▼────────┐ ┌──▼──────────┐
│buyer_intents │ │  listings   │
│  - buyer_id  │ │  - seller_id│
└──────────────┘ └─────┬───────┘
      │                │
      │                │ 1:Many
      │                │
      │         ┌──────▼──────────┐
      │         │ listing_media   │
      │         └─────────────────┘
      │
      └──── Both are targets of ────┐
                                    │
                            ┌───────▼──────┐
                            │   swipes     │
                            │  - actor_id  │
                            │  - target_id │
                            └──────────────┘
                                    │
                      When both swipe yes
                                    │
                            ┌───────▼──────┐
                            │   matches    │
                            │  - buyer_id  │
                            │  - seller_id │
                            │  - listing_id│
                            └───────┬──────┘
                                    │ 1:1
                            ┌───────▼──────┐
                            │ deal_rooms   │
                            │  - match_id  │
                            └───────┬──────┘
                                    │ 1:Many
                            ┌───────▼──────┐
                            │  messages    │
                            │  - sender_id │
                            └──────────────┘
```

---

## Authentication & Authorization

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Opens App                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                ┌───────▼────────┐
                │  Splash Screen │
                │  (2.5 seconds) │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │ Check Session  │
                │ (useAuth hook) │
                └───────┬────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
    ┌────▼────┐                  ┌─────▼─────┐
    │ No User │                  │   User    │
    └────┬────┘                  │  Exists   │
         │                       └─────┬─────┘
         │                             │
    ┌────▼─────────┐            ┌─────▼──────┐
    │ Login Screen │            │ Load Profile│
    └────┬─────────┘            └─────┬──────┘
         │                             │
         │ Sign In/Up            ┌─────▼──────┐
         │                       │ Has Role?  │
         └───────────────────────┤            │
                                 └─────┬──────┘
                                       │
                        ┌──────────────┴──────────────┐
                        │                             │
                   ┌────▼────┐                  ┌─────▼─────┐
                   │   No    │                  │    Yes    │
                   └────┬────┘                  └─────┬─────┘
                        │                             │
                 ┌──────▼──────┐           ┌──────────▼──────────┐
                 │ Role Select │           │ Role-Specific Check │
                 └──────┬──────┘           └──────────┬──────────┘
                        │                             │
                 ┌──────▼──────┐           ┌──────────▼──────────┐
                 │   Verify    │           │ Buyer: Has Intent?  │
                 └──────┬──────┘           │ Seller: Verified?   │
                        │                  │ Agent: Onboarded?   │
                        │                  └──────────┬──────────┘
                        │                             │
                        └──────────┬──────────────────┘
                                   │
                          ┌────────▼────────┐
                          │   Main App      │
                          │ (Role-Based UI) │
                          └─────────────────┘
```

### Implementation

#### 1. **Supabase Client** (`lib/supabaseClient.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,      // Persist sessions locally
      autoRefreshToken: true,     // Auto-refresh JWT
      persistSession: true,       // Keep user logged in
      detectSessionInUrl: false,  // Mobile-only (no deep links)
    },
  }
);
```

**Key Features:**
- Sessions stored in AsyncStorage (encrypted on device)
- JWT auto-refresh before expiration
- Survives app restarts

---

#### 2. **Auth Hook** (`lib/hooks/useAuth.tsx`)

```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading, signIn, signUp, signOut };
}
```

**Provides:**
- `user`: Supabase Auth user object
- `profile`: App-specific profile data
- `loading`: Loading state
- `signIn()`, `signUp()`, `signOut()`: Auth methods

---

#### 3. **Authorization (Row Level Security)**

Supabase RLS policies control data access:

```sql
-- Example: Users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Example: Buyers can only see active listings
CREATE POLICY "Buyers can see active listings"
  ON listings FOR SELECT
  USING (status = 'active');

-- Example: Only participants can access deal room messages
CREATE POLICY "Deal participants can read messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deal_participants
      WHERE deal_room_id = messages.deal_room_id
        AND profile_id = auth.uid()
    )
  );
```

---

## Frontend Architecture

### Component Hierarchy

```
App (_layout.tsx)
├── Providers
│   ├── GestureHandlerRootView
│   ├── AuthProvider (useAuth)
│   └── ThemeProvider
├── AnimatedSplashScreen
└── Stack Navigator (Expo Router)
    ├── (auth) Group
    │   ├── login.tsx
    │   ├── role-select.tsx
    │   └── verify.tsx
    ├── (buyer) Group
    │   ├── (tabs) - Bottom Tab Navigator
    │   │   ├── feed.tsx
    │   │   ├── matches.tsx
    │   │   ├── inbox.tsx
    │   │   └── profile.tsx
    │   └── intent-setup.tsx
    ├── (seller) Group
    │   ├── (tabs)
    │   │   ├── leads.tsx
    │   │   ├── listings.tsx
    │   │   ├── matches.tsx
    │   │   └── inbox.tsx
    │   └── create-listing.tsx
    ├── (pro) Group - Agents
    ├── (support) Group - Support staff
    ├── explore.tsx
    └── deal/[dealId].tsx
```

### Routing Logic (`app/index.tsx`)

```typescript
export default function Index() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  // Not authenticated
  if (!user) return <Redirect href="/(auth)/login" />;

  // No role selected
  if (!profile?.role) return <Redirect href="/(auth)/role-select" />;

  // Buyer without intent
  if (profile.role === 'buyer') {
    const intent = await checkBuyerIntent();
    if (!intent) return <Redirect href="/(buyer)/intent-setup" />;
    return <Redirect href="/(buyer)/(tabs)/feed" />;
  }

  // Seller
  if (profile.role === 'seller') {
    return <Redirect href="/(seller)/(tabs)/leads" />;
  }

  // Agent
  if (profile.role.includes('agent')) {
    return <Redirect href="/(pro)/(tabs)/dashboard" />;
  }
}
```

---

### Custom Hooks

All business logic is encapsulated in custom hooks in `lib/hooks/`:

#### **useAuth** - Authentication
- Manages user session and profile
- Provides sign in/up/out methods
- Auto-loads profile on auth change

#### **useIntent** - Buyer Intents
- `createIntent()`: Create buyer search criteria
- `getCurrentIntent()`: Get active intent
- `updateIntent()`: Modify existing intent

#### **useListing** - Listings
- `createListing()`: Create property listing
- `updateListing()`: Edit listing
- `getMyListings()`: Fetch seller's listings

#### **useSwipe** - Swipe Actions
- `swipe()`: Record swipe (yes/no)
- `checkMatch()`: Check if swipe creates match

#### **useMatches** - Matches
- `getMyMatches()`: Fetch user's matches
- `getMatchDetails()`: Get match with listing/buyer info

#### **useFeed** - Feed Data
- `loadFeed()`: Load swipeable items for user
- Filters based on user role and intent

#### **useDealRoom** - Deal Rooms
- `createDealRoom()`: Create from match
- `getDealRoom()`: Fetch deal room data
- `updateStatus()`: Change deal status

#### **useConversations** - Messaging
- `sendMessage()`: Send message in deal room
- `getMessages()`: Fetch conversation history
- Realtime subscriptions for new messages

---

## Backend Architecture

### Supabase Services

#### 1. **PostgreSQL Database**
- Stores all application data
- PostGIS extension for geographic queries
- Full-text search for listings
- JSONB for flexible data (areas, features)

#### 2. **Authentication Service**
- Email/password authentication
- JWT-based sessions
- Password reset flows
- Email verification

#### 3. **Storage Service**
- Stores listing images/videos
- Public buckets for media
- Automatic image optimization
- CDN delivery

#### 4. **Realtime Service**
- WebSocket subscriptions
- Real-time message delivery
- Match notifications
- Presence indicators

#### 5. **Edge Functions**
- Matchmaking algorithm
- Push notifications
- Scheduled tasks (freshness checks)
- Third-party integrations

---

### Data Flow Example: Creating a Match

```
1. Buyer swipes "yes" on listing
   ↓
   Frontend: useSwipe.swipe(listingId, 'yes')
   ↓
   Supabase: INSERT INTO swipes (actor_id, target_id, direction)
   ↓
   Frontend: Check if seller also swiped yes
   ↓
   Supabase: SELECT FROM swipes WHERE...
   ↓
   If both swiped yes:
   ↓
   Supabase: INSERT INTO matches (buyer_id, seller_id, listing_id)
   ↓
   Supabase: INSERT INTO deal_rooms (match_id)
   ↓
   Edge Function: Send push notifications to both parties
   ↓
   Realtime: Broadcast match event to both users
   ↓
   Frontend: Navigate to deal room
```

---

## Data Flow

### Request Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Mobile App (React Native)                  │
│  ┌────────────┐                                               │
│  │   Screen   │                                               │
│  └─────┬──────┘                                               │
│        │ Uses                                                 │
│  ┌─────▼──────┐                                               │
│  │ Custom Hook│ (useAuth, useListing, etc.)                  │
│  └─────┬──────┘                                               │
│        │ Calls                                                │
│  ┌─────▼──────┐                                               │
│  │  Supabase  │                                               │
│  │   Client   │                                               │
│  └─────┬──────┘                                               │
└────────┼────────────────────────────────────────────────────┘
         │ HTTP/WebSocket
         │
┌────────▼────────────────────────────────────────────────────┐
│                      Supabase Backend                         │
│  ┌─────────────┐                                              │
│  │   API       │                                              │
│  │  Gateway    │                                              │
│  └─────┬───────┘                                              │
│        │                                                      │
│  ┌─────▼───────┐     ┌──────────┐     ┌──────────┐          │
│  │     RLS     │────▶│PostgreSQL│────▶│ Storage  │          │
│  │   Policies  │     │ Database │     │ Buckets  │          │
│  └─────────────┘     └──────────┘     └──────────┘          │
│                                                               │
│  ┌──────────────┐    ┌──────────┐                            │
│  │ Edge         │    │ Realtime │                            │
│  │ Functions    │    │ Engine   │                            │
│  └──────────────┘    └──────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

### State Management

**No Redux/MobX** - Uses React hooks and context:

1. **Global State**: `AuthProvider`, `ThemeProvider`
2. **Server State**: Supabase queries (no caching layer)
3. **Local State**: `useState` in components
4. **Derived State**: `useMemo` for computed values

---

## Core Features

### 1. Swipe Feed

**Buyer Feed** (`(buyer)/(tabs)/feed.tsx`):
- Shows active listings matching buyer intent
- Filters by budget, beds, baths, location
- Excludes already-swiped listings
- Tinder-style card interface

**Seller Leads** (`(seller)/(tabs)/leads.tsx`):
- Shows buyer intents matching listing criteria
- Displays buyer verification level
- Shows buyer's budget and preferences

### 2. Matching Algorithm

Located in: `supabase/functions/matchmaking/`

```typescript
function calculateMatchScore(listing, buyerIntent) {
  let score = 0;

  // Price match (40% weight)
  if (listing.price >= intent.budget_min && 
      listing.price <= intent.budget_max) {
    score += 40;
  }

  // Beds/baths match (30% weight)
  if (listing.beds >= intent.beds_min) score += 15;
  if (listing.baths >= intent.baths_min) score += 15;

  // Property type match (20% weight)
  if (intent.property_types.includes(listing.property_type)) {
    score += 20;
  }

  // Location match (10% weight)
  if (isInPreferredArea(listing, intent.areas)) {
    score += 10;
  }

  return score;
}
```

### 3. Deal Rooms

**Features:**
- Real-time chat
- Task management (schedule tours, submit offers)
- Document sharing
- Status tracking (matched → touring → offer → contract → closed)
- Participant management (add agents, inspectors)

### 4. Verification System

**Buyer Verification Levels:**
- Level 0: Email only
- Level 1: Phone verified
- Level 2: Income verified
- Level 3: Pre-approved (mortgage)

**Seller Verification:**
- Property ownership proof
- Listing freshness (updated within 7 days)

### 5. Location Features

**Buyer Intent Areas:**
- Draw on map or search by name
- Multiple areas supported
- Commute time calculations

**Listing Location:**
- Public address (city/neighborhood)
- Private address (revealed after match)
- Coordinates for map display

---

## UI/UX System

### Design System

**Theme: White Glassmorphism**

#### Design Tokens (`src/ui/tokens.ts`)

```typescript
export const glassTokens = {
  colors: {
    text: {
      primary: '#2C1810',        // Dark brown
      secondary: 'rgba(44, 24, 16, 0.7)',
      tertiary: 'rgba(44, 24, 16, 0.5)',
      light: '#FFFFFF',          // For dark backgrounds
    },
    background: {
      dark: '#FFFFFF',           // Pure white
      darkGrey: '#F5F5F5',
      mediumGrey: '#EEEEEE',
      white: '#FFFFFF',
      glassDark: 'rgba(255, 255, 255, 0.75)',
      glassMedium: 'rgba(255, 255, 255, 0.88)',
      glassHeavy: 'rgba(255, 255, 255, 0.95)',
    },
    accent: {
      primary: '#6A1B9A',        // Dark purple
      primaryDark: '#4A148C',
      secondary: '#9C27B0',
      tertiary: '#BA68C8',
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FF9800',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    pill: 999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' },
    h2: { fontSize: 24, fontWeight: '600' },
    h3: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 14, fontWeight: '400' },
    small: { fontSize: 12, fontWeight: '400' },
  },
  glass: {
    blurIntensity: 80,
    borderWidth: 1,
    borderColor: 'rgba(139, 98, 165, 0.2)',
  },
};
```

### Core UI Components

#### **ScreenBackground** (`src/ui/ScreenBackground.tsx`)
- Full-screen gradient background
- Optional image background
- Consistent across all screens

#### **GlassSurface** (`src/ui/GlassSurface.tsx`)
- Base glassmorphism component
- Blur effect with semi-transparent background
- Configurable border and shadow

#### **LiquidGlassCard** (`src/ui/LiquidGlassCard.tsx`)
- Card component with glass effect
- Optional title and subtitle
- Padding and corner radius variants

#### **GlassPill** (`src/ui/GlassPill.tsx`)
- Pill-shaped badge
- Used for status, tags, verification levels
- Color variants (primary, success, warning, error)

#### **LiquidGlassButton** (`src/ui/LiquidGlassButton.tsx`)
- Primary action button
- Glass effect with haptic feedback
- Loading and disabled states

#### **GlassTabBar** (`src/ui/GlassTabBar.tsx`)
- Custom bottom tab bar
- Floating pill design
- Blur effect
- Active state with background highlight

---

## Node Modules & Dependencies

### Root Level (`/package.json`)

**Purpose**: Monorepo scripts and shared dependencies

```json
{
  "scripts": {
    "start": "cd apps/mobile && expo start",
    "seed": "ts-node scripts/seed.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "expo": "^54.0.7",
    "react": "19.1.0",
    "react-native": "0.81.4"
  },
  "devDependencies": {
    "ts-node": "^10.9.2",
    "typescript": "~5.9.2"
  }
}
```

**Key Modules:**
- `ts-node`: Run TypeScript scripts directly
- `dotenv`: Load environment variables
- `@types/node`: TypeScript definitions

---

### Mobile App (`/apps/mobile/package.json`)

**Purpose**: Mobile app dependencies

#### **Core Dependencies**

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ^54.0.7 | Development platform |
| `react` | 19.1.0 | UI library |
| `react-native` | 0.81.4 | Native runtime |
| `expo-router` | ~6.0.4 | File-based routing |
| `typescript` | ~5.8.3 | Type safety |

#### **Backend Integration**

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.57.4 | Supabase client |
| `@react-native-async-storage/async-storage` | ^2.2.0 | Local storage |
| `react-native-url-polyfill` | ^2.0.0 | URL API polyfill |

#### **UI & Styling**

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-blur` | ^15.0.8 | Blur effects |
| `expo-linear-gradient` | ~15.0.8 | Gradients |
| `liquid-glass-react` | ^1.1.1 | Glass UI library |
| `react-native-reanimated` | ~3.10.1 | Animations |
| `react-native-gesture-handler` | ~2.28.0 | Gestures |
| `@expo/vector-icons` | ^15.0.2 | Icons |

#### **Navigation**

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-router` | ~6.0.4 | Routing |
| `react-native-screens` | ~4.16.0 | Native screens |
| `react-native-safe-area-context` | ~5.6.0 | Safe areas |

#### **Media**

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-image` | ~3.0.8 | Optimized images |
| `expo-video` | ^3.0.15 | Video playback |
| `expo-font` | ~14.0.8 | Custom fonts |

#### **Device Features**

| Package | Version | Purpose |
|---------|---------|---------|
| `expo-location` | ^19.0.8 | GPS/location |
| `expo-haptics` | ~15.0.7 | Haptic feedback |
| `expo-secure-store` | ^15.0.7 | Encrypted storage |
| `expo-splash-screen` | ~31.0.10 | Splash screen |

---

### Shared Types (`/packages/shared/package.json`)

**Purpose**: Shared TypeScript types

```json
{
  "name": "@shared/types",
  "main": "types.ts",
  "types": "types.ts"
}
```

**Exports:**
- `Profile`, `BuyerIntent`, `Listing`, `Match`, `DealRoom`, etc.
- Shared across mobile app and backend functions

---

### Node Modules Locations

```
ezriya-platform-main/
├── node_modules/           # Root dependencies (scripts, dev tools)
├── apps/
│   └── mobile/
│       └── node_modules/   # Mobile app dependencies
└── packages/
    └── shared/             # No node_modules (just types)
```

**Why Multiple `node_modules`?**
- Root: Shared tooling (TypeScript, ts-node)
- Mobile: App-specific dependencies (React Native, Expo)
- Prevents version conflicts
- Allows independent updates

---

## Environment Setup

### Required Environment Variables

Create `.env` in project root:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key

# Optional: Google Maps (for explore feature)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

**Note:** `EXPO_PUBLIC_` prefix makes variables available in React Native.

### Supabase Setup

1. **Create Supabase Project**: https://supabase.com
2. **Run Migrations**:
   ```bash
   cd supabase
   supabase db push
   ```
3. **Create Storage Buckets**:
   - `listing-media` (public)
   - `profile-photos` (public)
4. **Enable RLS Policies**: See migration files

### iOS Setup

1. **Install CocoaPods**:
   ```bash
   cd apps/mobile/ios
   pod install
   ```

2. **Configure Xcode**:
   - Open `Ezriya.xcworkspace`
   - Set development team
   - Update bundle identifier

3. **Node.js Path** (`ios/.xcode.env.local`):
   ```bash
   export NODE_BINARY=$(command -v node)
   ```

### Android Setup

1. **Android Studio**: Install and open `apps/mobile/android`
2. **SDK**: Ensure Android SDK 33+ is installed
3. **Emulator**: Create AVD or connect physical device

---

## Development Workflow

### Starting Development

```bash
# Install dependencies
npm install
cd apps/mobile && npm install

# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Development Build (for native modules)

```bash
cd apps/mobile

# Generate native code
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

### Database Seeding

```bash
# Seed basic data
npm run seed

# Seed comprehensive test data
npm run seed:comprehensive
```

### Testing

```bash
# Lint
npm run lint

# Type check
cd apps/mobile && npx tsc --noEmit
```

---

## Deployment

### Mobile App

#### **iOS (App Store)**

1. **Build**:
   ```bash
   cd apps/mobile
   eas build --platform ios
   ```

2. **Submit**:
   ```bash
   eas submit --platform ios
   ```

#### **Android (Play Store)**

1. **Build**:
   ```bash
   cd apps/mobile
   eas build --platform android
   ```

2. **Submit**:
   ```bash
   eas submit --platform android
   ```

### Backend

**Supabase** (already hosted):
- Database: Managed PostgreSQL
- Storage: CDN-backed
- Edge Functions: Deploy via CLI:
  ```bash
  supabase functions deploy matchmaking
  ```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `apps/mobile/app/_layout.tsx` | Root layout, providers |
| `apps/mobile/app/index.tsx` | Entry point, routing logic |
| `apps/mobile/lib/supabaseClient.ts` | Supabase initialization |
| `apps/mobile/lib/hooks/useAuth.tsx` | Authentication hook |
| `apps/mobile/src/ui/tokens.ts` | Design tokens |
| `apps/mobile/src/ui/GlassTabBar.tsx` | Custom tab bar |
| `apps/mobile/app.config.js` | Expo configuration |
| `supabase/migrations/001_initial_schema.sql` | Database schema |
| `packages/shared/types.ts` | Shared TypeScript types |
| `scripts/seed-us-locations.ts` | Test data seeding |

---

## Troubleshooting

### Common Issues

**1. "Missing Supabase environment variables"**
- Ensure `.env` file exists in root
- Variables must start with `EXPO_PUBLIC_`
- Restart Expo dev server after adding

**2. "Module not found: react-native-maps"**
- `react-native-maps` was removed (requires dev build)
- Use list view fallback in explore screen

**3. "No such file or directory: node"**
- Update `apps/mobile/ios/.xcode.env.local`:
  ```bash
  export NODE_BINARY=$(command -v node)
  ```

**4. Build fails with Folly errors**
- Disable new architecture in `app.config.js`:
  ```javascript
  newArchEnabled: false
  ```

**5. Session not persisting**
- Check AsyncStorage permissions
- Verify Supabase client configuration

---

## Architecture Decisions

### Why Expo?
- Faster development
- OTA updates
- Simplified native module integration
- Strong TypeScript support

### Why Supabase?
- PostgreSQL (powerful queries, RLS)
- Real-time out of the box
- Built-in auth and storage
- Edge functions for serverless logic
- No separate backend needed

### Why File-Based Routing (Expo Router)?
- Intuitive folder structure
- Type-safe navigation
- Automatic deep linking
- Simplified code splitting

### Why No State Management Library?
- React hooks sufficient for app size
- Supabase handles server state
- Reduces complexity and bundle size

---

## Future Enhancements

- [ ] Push notifications (Expo Notifications)
- [ ] In-app payments (Stripe)
- [ ] Video tours (Expo AV)
- [ ] AI-powered listing descriptions
- [ ] Advanced search filters
- [ ] Saved searches with alerts
- [ ] Agent commission tracking
- [ ] Transaction timeline
- [ ] Document e-signing

---

## Support & Contact

For questions or issues:
- Check this documentation first
- Review code comments
- Check Supabase dashboard for backend issues
- Review Expo logs for frontend issues

---

**End of Documentation**
