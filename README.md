# PackMate

A cross-platform packing organizer app for trips, travel, and moving — built with React Native, Expo, and real-time sync.

## Features

- **Trip Management** — Create trips with cover images, dates, and destinations
- **Packing Lists** — Organize items by category with checkboxes and quantity tracking
- **Bag Management** — Create bags, assign items to bags, filter by bag
- **Live Progress** — Real-time progress bars showing packed vs total items
- **Templates** — Start from pre-built templates (Beach, Hiking, Business, Winter, Moving)
- **Moving Mode** — Orange-themed variant with box/room terminology and "Shipped" badges
- **Cross-Platform** — Runs on iOS, Android, and Web
- **Real-Time Sync** — All data syncs instantly across devices via Convex

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo (managed) |
| Navigation | Expo Router (file-based) |
| Backend | Convex (real-time queries & mutations) |
| Auth | Clerk |
| Forms | react-hook-form + zod |
| Language | TypeScript |

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Convex account](https://convex.dev)
- [Clerk account](https://clerk.com)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Convex URL and Clerk publishable key in `.env`.

3. **Initialize Convex**
   ```bash
   npx convex dev
   ```
   This generates the `convex/_generated/` types and starts the dev backend.

4. **Seed templates** (first time only)
   ```bash
   npx convex run seed:seedTemplates
   ```

5. **Start the app**
   ```bash
   npx expo start
   ```
   Press `w` for web, `a` for Android, or `i` for iOS.

## Project Structure

```
app/                    # Expo Router screens
├── _layout.tsx         # Root layout (Clerk + Convex providers)
├── sign-in.tsx         # Auth screens
├── sign-up.tsx
└── (app)/
    ├── (tabs)/         # Tab navigator (My Trips, Templates, Account)
    ├── trips/          # Trip CRUD & packing list screens
    └── moving/         # Moving/shipment variant

components/
├── ui/                 # Button, Card, Checkbox, ProgressBar, Badge, Modal, TextInput
└── layout/             # ScreenHeader

convex/                 # Backend (schema, queries, mutations)
lib/                    # Shared constants, types, auth helpers
```

## License

MIT
