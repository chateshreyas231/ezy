# Ezriya Platform

**Version:** 2.1.1 (Development Build)
**Status:** Alpha / MVP
**Platform:** React Native (Expo) + Supabase
**License:** Proprietary

---

## 🚀 Executive Summary

**Ezriya** is a modern, mobile-first real estate marketplace designed to streamline the connection between buyers, sellers, and agents.

Built on an **Intent-Based Matching Engine**, it simplifies property discovery through a streamlined "Feed" interface.
While the platform's long-term vision is an "AI-Driven Hybrid Ecosystem," the current implementation focuses on a robust, beautiful **Foundation for Matching and Transaction Management**.

> [!NOTE]
> **Honest Status**: The app currently functions as a rigorous **"Match-and-Chat" platform**. It uses **ARCHIVE/MATCH buttons** (no swipe gestures) for precise control. Advanced AI features (The "Conductor", Visual DNA Quizzes) are in the **Research/Roadmap** phase.

---

## 📱 Implemented Features (Current State)

These features are live in the codebase and functional:

### 1. The Property Feed & Matching
*A "Reels-style" immersive experience for property discovery.*
-   **Button-Based Matching**: Unlike Tinder's swipe gestures, Ezriya uses explicit **ARCHIVE** (red) and **MATCH** (green) buttons. This prevents accidental swipes and ensures intent.
-   **Reels-Style Media**: Listing cards featuring auto-scrolling images and looped videos in the background. Content is king.
-   **Seller Interest Badges**: If a Seller has already matched with your "Buyer Intent," their listing appears with a `SELLER INTERESTED` badge, prioritizing high-probability deals.
-   **Logic**: A "Match" is created **ONLY** when both parties select **MATCH**.

### 2. Smart "Intents" (Search Criteria)
*Structured data that drives the feed.*
-   **Buyer Intent Form**: Users explicitly define their "Buy Box":
    -   **Budget Range** (Min/Max)
    -   **Space Requirements** (Beds, Baths)
    -   **Property Types** (House, Condo, Townhouse)
    -   **Must Haves & Dealbreakers** (Structured tags)
-   **Feed Algorithm**: The feed **only** shows properties that match these hard criteria. It is not a random discovery tool; it is a sniper rifle for finding the right home.
    -   *Code Source*: `useFeed.ts` filters Supabase queries based on the active Intent ID.

### 3. Deal Rooms (Transaction Management)
*Where the work gets done after the match.*
-   **Dedicated Workspace**: When a Match occurs, a "Deal Room" is automatically generated.
-   **Kanban Task Board**: A pre-set list of transaction steps (e.g., "Schedule Viewing", "Submit Offer", "Earnest Money").
    -   *Current State*: Tasks are manually checked off by users.
-   **Real-Time Chat**: Integrated messaging allows Buyers and Sellers (and their Agents) to communicate directly within the context of the deal.
    -   *Powered by*: Supabase Realtime (WebSockets).

### 4. Liquid Glass UI
*A premium, high-performance design language.*
-   **Glassmorphism**: Heavy use of `expo-blur` to create depth and hierarchy (e.g., glass tab bars, floating pills).
-   **Physics-Based Motion**: Animations use `react-native-reanimated` for 120fps smoothness.
-   **Immersive Headers**: Transparent headers that blend into the media content.

---

## 🔮 Roadmap & Vision (Future / In-Progress)

These concepts are part of the strategic pivot but **not yet fully implemented**:

### 🧠 1. The "AI Conductor" (Planned)
*Goal*: An autonomous agent that auto-generates custom tasks based on state laws, chases documents via SMS, and manages the calendar.
*Current State*: We have `supabase/functions/ai-summary` for text processing, but the autonomous "Agentic" behavior is in development.

### 🧬 2. "DNA" Genetic Matchmaking (Planned)
*Goal*: A gamified, visual quiz that infers lifestyle preferences (e.g., showing images of "Modern vs Cottage" to determine taste) rather than just "3 Beds".
*Current State*: The platform currently uses **Explicit Intents** (Forms). The "Genetic" visual quiz is the next evolution of the Intent system.

### 📈 3. AI Market Intelligence (Planned)
*Goal*: Computer-vision based condition analysis (e.g., spotting "dated kitchens" in photos) and dynamic pricing acceptance probability.
*Current State*: Not present in the codebase.

---

## 🏗️ Technical Architecture (Verified)

Ezriya uses a verified, modern heavy-hitter stack designed for scale and performance.

### Tech Stack
| Category | Technology | Version | Usage |
| :--- | :--- | :--- | :--- |
| **Frontend** | **React Native** | 0.81.5 | The core framework interaction layer. |
| | **Expo** | ~54.0.33 | The development runtime and build toolchain. |
| | **Expo Router** | ~6.0.23 | File-based routing (Next.js style) for deep linking. |
| **Animation** | **Reanimated** | ~4.1.1 | Runs animations on the UI thread for 120fps performance. |
| **Backend** | **Supabase** | v2 | The "Backend-as-a-Service" providing the DB, Auth, and API. |
| | **PostgreSQL** | 15+ | The relational database. Uses **PostGIS** for geo-queries. |
| | **Edge Functions** | Deno | Serverless TypeScript functions for matchmaking logic. |

### Project Structure (Audit)
```
ezriya-platform-main/
├── apps/mobile/
│   ├── app/
│   │   ├── (auth)/         # Screens: Logical Flows for Login & Verification
│   │   ├── (buyer)/        # Screens: Feed, Intent Setup (The Buyer Experience)
│   │   ├── (seller)/       # Screens: Listing Management (The Seller Experience)
│   │   └── (pro)/          # Screens: Agent Dashboard (Client Management)
│   ├── components/         # Reusable UI (Cards, Buttons, Glass Pills)
│   └── lib/hooks/          # Business Logic (Separated from UI)
│       ├── useFeed.ts      # Logic: Fetching filtered listings
│       ├── useSwipe.ts     # Logic: Handling ARCHIVE/MATCH actions
│       └── useAuth.ts      # Logic: Session management
├── supabase/
│   ├── functions/          # Serverless Logic (ai-summary)
│   └── migrations/         # Database Schema (SQL)
```

---

## 🔧 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    # Installs Expo 54, RN 0.81, and all UI libraries
    ```

2.  **Environment Setup**
    Map your Supabase project in `.env`. This connects the app to your specific database instance.
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
    ```

3.  **Run the App**
    Start the Metro Bundler to simulate on iOS/Android or Web.
    ```bash
    npm run ios     # iOS Simulator (Recommended for dev)
    npm run android # Android Emulator
    npm run web     # Web Preview (Limited functionality)
    ```

## 📄 License
Proprietary & Confidential.
