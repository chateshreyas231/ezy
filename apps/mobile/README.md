# Ezriya Mobile App

React Native + Expo Router mobile client connected to the same Supabase backend used by web.

## Features Implemented

- Role-based auth portals: `client`, `agent`, `broker/vendor`
- Auth flows: login, signup, forgot password, reset password
- AI-first workspace (Supabase Edge Function `ai-summary`)
- Listings:
  - Client: browse active listings
  - Agent/Broker/Vendor: manage own listings + create listing
- Matches and deal rooms
- Deal room tasks and chat messages
- Unified network directory pages for agents, clients, brokers, vendors
- Role-specific bottom-tab navigation

## Run

1. Ensure env vars are available to Expo:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

2. Start app:

```bash
npm run dev --workspace @ezriya/mobile
```

## Notes

- Password reset deep link uses `ezriya://reset-password`.
- DB role mapping:
  - client -> buyer
  - agent -> buyer_agent
  - broker/vendor -> seller_agent
- Portal identity is retained via `user_metadata.app_portal`.
