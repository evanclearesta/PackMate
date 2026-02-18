# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PackMate is a cross-platform packing organizer app (mobile + web) built with React Native + Expo (managed workflow), Expo Router for navigation, Convex for the real-time backend, and Clerk for authentication.

## Stack

- **Framework:** React Native + Expo (managed), TypeScript
- **Navigation:** Expo Router (file-based routing)
- **Backend:** Convex (real-time queries, mutations, file storage)
- **Auth:** Clerk (`@clerk/clerk-expo`) integrated with Convex via `ConvexProviderWithClerk`
- **Forms:** react-hook-form + zod validation
- **Date handling:** date-fns + `@react-native-community/datetimepicker`

## Commands

```bash
npx expo start          # Start dev server (web + mobile)
npx expo start --web    # Web only
npx convex dev          # Start Convex dev server (run alongside expo)
npx convex deploy       # Deploy Convex to production
npx tsc --noEmit        # Type check
```

## Architecture

### Routing (`app/`)
- `app/_layout.tsx` — Root layout: wraps app in Clerk + Convex providers, handles auth guard
- `app/(app)/_layout.tsx` — Tab navigator (My Trips, Templates, Account)
- `app/(app)/trips/[id]/` — Dynamic trip routes (packing list, bags, assign items)
- `app/(app)/moving/[id].tsx` — Moving/shipment flow (reuses packing list with `variant="moving"`)

### Backend (`convex/`)
- `convex/schema.ts` — Table definitions: profiles, trips, bags, packingCategories, packingItems, itemBagAssignments, templates, templateCategories, templateItems
- `convex/trips.ts`, `convex/bags.ts`, `convex/packingItems.ts` — CRUD with auth checks
- `convex/templates.ts` — System template management
- All Convex queries are real-time by default (`useQuery` auto-subscribes). No manual subscriptions or client state management needed for server data.

### Design Tokens (`lib/constants.ts`)
- Green: `#4CAF50`, Beige: `#F5F4F1`, Orange: `#FF9800`
- Moving/shipment screens use orange theme variant; standard trips use green

### Key Patterns
- **Shared components with variant prop:** Moving screen reuses packing list components with color/label swaps (e.g., "bags" → "boxes", green → orange)
- **Convex optimistic updates** for mutations (toggle packed, add item) — no loading spinners needed
- **Responsive layout:** Components adapt between mobile and desktop widths using `useWindowDimensions`
- **Clerk token cache** uses `expo-secure-store` for secure token persistence

## Environment Variables

```
EXPO_PUBLIC_CONVEX_URL=        # Convex deployment URL
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=  # Clerk publishable key
```
