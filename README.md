# ADSS Trading Demo

A small React Native / Expo trading application created as a technical assessment.

The app demonstrates a **dark-themed market watchlist**, **self-contained real-time mock market data**, an **instrument detail/order screen**, mock **BUY/SELL order execution**, and a focused automated test suite.

> **Assessment note:** Market prices and order execution are intentionally mocked. No real brokerage, market-data provider, authentication service, or external trading API is used.

---

## 1. What this project demonstrates

- React Native + Expo application development
- TypeScript with typed navigation and domain models
- React Navigation native stack
- Real-time UI updates through a lightweight subscription-based mock socket
- `FlatList` for the market watchlist
- Component memoization with `React.memo`
- Proper subscription cleanup with `useEffect`
- Independent Bid / Ask price movement indicators
- BUY / SELL order flow
- BUY execution at **Ask** price
- SELL execution at **Bid** price
- Quantity validation
- Loading, success, rejection, and error states
- Jest + React Native Testing Library
- 100% global Jest coverage threshold configured for the covered source files

---

## 2. Tech stack

| Technology | Version / Usage |
|---|---|
| React Native | `0.86.3` |
| Expo | `~57.0.24` |
| React | `19.2.3` |
| TypeScript | `~6.0.3` |
| React Navigation | `7.x` |
| Jest | via `jest-expo` |
| React Native Testing Library | `^14.0.1` |
| Node package manager | npm |

Exact dependency versions are defined in `package.json` and `package-lock.json`.

---

## 3. High-level architecture

The project intentionally keeps the architecture simple because the assessment is a small, self-contained trading demo.

```text
                         ┌──────────────────────┐
                         │      App.tsx         │
                         │ NavigationContainer  │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
          ┌──────────────────┐            ┌────────────────────┐
          │ Market Watch     │            │ Symbol Details     │
          │ Screen           │            │ / Order Screen     │
          └────────┬─────────┘            └─────────┬──────────┘
                   │                                │
                   │ subscribe                     │ subscribe
                   │                                │
                   └──────────────┬─────────────────┘
                                  ▼
                       ┌────────────────────┐
                       │    mockSocket      │
                       │                    │
                       │ Market data state  │
                       │ Price simulation   │
                       │ Pub/Sub listeners  │
                       │ 600ms updates      │
                       └──────────┬─────────┘
                                  │
                                  │
                                  ▼
                       ┌────────────────────┐
                       │    SymbolTick      │
                       │ bid / ask / digits │
                       │ direction fields   │
                       └────────────────────┘

 Symbol Details
       │
       │ BUY / SELL
       ▼
 ┌────────────────────┐
 │     tradeApi       │
 │                    │
 │ simulated latency  │
 │ validation/reject  │
 └────────────────────┘
```

### Why a mock socket instead of Redux/global state?

The assignment only requires a small self-contained real-time data flow. A dedicated subscription service is sufficient and keeps transport concerns separate from UI concerns.

The screens subscribe to market data and clean up their subscriptions when they unmount. A production WebSocket implementation could replace the mock service while keeping the screen-level contract largely unchanged.

A global state library such as Redux or Zustand was intentionally not introduced because it would add complexity without providing a meaningful benefit for this small two-screen assessment.

---

## 4. Project structure

```text
ADSS-Demo/
├── App.tsx
├── index.ts
├── app.json
├── package.json
├── tsconfig.json
├── jest.config.js
│
├── src/
│   ├── common/
│   │   ├── colors.ts
│   │   ├── helper.ts
│   │   └── helper.test.ts
│   │
│   ├── screens/
│   │   ├── MarketWatchScreen.tsx
│   │   ├── MarketWatchScreen.test.tsx
│   │   ├── SymbolDetailsScreen.tsx
│   │   └── SymbolDetailsScreen.test.tsx
│   │
│   ├── services/
│   │   ├── mockSocket.ts
│   │   ├── mockSocket.test.ts
│   │   ├── tradeApi.ts
│   │   └── tradeApi.test.ts
│   │
│   └── types/
│       └── trading.ts
│
└── README.md
```

### Folder responsibilities

#### `src/screens`
Contains screen-level UI and interaction logic.

- `MarketWatchScreen` — renders the live instrument list and navigates to details.
- `SymbolDetailsScreen` — renders the selected instrument, subscribes to live prices, validates quantity, and starts BUY/SELL execution.

#### `src/services`
Contains non-UI application services.

- `mockSocket.ts` — generates and publishes simulated market ticks.
- `tradeApi.ts` — simulates order execution and latency.

#### `src/types`
Contains shared TypeScript domain and navigation types.

#### `src/common`
Contains reusable UI constants and helper functions.

---

## 5. Market data flow

The market data service keeps an in-memory list of instruments.

Every **600 ms** it:

1. Iterates through the current instruments.
2. Generates a small simulated Bid movement.
3. Generates a small simulated Ask movement independently.
4. Rounds each price according to the instrument's `digits` value.
5. Calculates movement direction.
6. Publishes the updated snapshot to subscribers.

Each instrument contains fields such as:

```ts
{
  symbol: 'EUR/USD',
  name: 'Euro / US Dollar',
  bid: 1.08425,
  ask: 1.08440,
  digits: 5,
  direction: 'neutral',
  bidDirection: 'up',
  askDirection: 'down'
}
```

### Independent Bid / Ask movement

Bid and Ask are generated independently. This means the UI does not assume that both sides of the quote must move in the same direction.

For example:

```text
Bid: 1.08425 → 1.08427  ↑
Ask: 1.08440 → 1.08438  ↓
```

The Market Watch UI can therefore represent the movement of each side separately.

---

## 6. Trading flow

When an instrument is selected:

```text
Market Watch
     │
     │ tap instrument
     ▼
Symbol Details
     │
     ├── live Bid / Ask updates
     │
     ├── quantity input
     │
     ├── BUY → execute at Ask
     │
     └── SELL → execute at Bid
              │
              ▼
          tradeApi
              │
              ├── simulated 500ms latency
              ├── success
              └── rejection when quantity > 100
```

The current implementation intentionally uses a simple mock rule for rejected orders:

```text
quantity > 100
        ↓
trade rejected
```

This is only a demonstration rule and is not intended to represent real brokerage margin/risk logic.

---

## 7. Prerequisites

Before running the project, install:

- Node.js — use a current LTS release.
- npm — included with Node.js.
- For iOS native development: macOS + Xcode + an iOS Simulator.
- For Android native development: Android Studio + Android SDK + an Android Emulator.
- Alternatively, Expo Go can be used on a physical device for development.

Check Node/npm:

```bash
node --version
npm --version
```

---

## 8. Installation

Clone or copy the project and enter the project directory:

```bash
cd ADSS-Demo
```

Install dependencies:

```bash
npm install
```

Because `package-lock.json` is committed, `npm ci` can also be used for a clean, reproducible installation:

```bash
npm ci
```

---

## 9. Run the application

### Start Expo

```bash
npm start
```

or:

```bash
npx expo start
```

Expo will display the development server and available launch options.

### iOS Simulator

On macOS with Xcode and an iOS Simulator installed:

```bash
npm run ios
```

You can also start Expo first and press `i` in the Expo CLI.

### Android Emulator

With Android Studio and an emulator running/configured:

```bash
npm run android
```

You can also start Expo first and press `a` in the Expo CLI.

### Web

The project also includes the Expo web command:

```bash
npm run web
```

The primary assessment target is React Native mobile; web support is provided through Expo where supported by the dependencies.

### Physical device

Install **Expo Go** on the device, start the development server with:

```bash
npm start
```

Then scan the QR code displayed by Expo.

For a physical device, make sure the computer and device can reach the Expo development server over the network.

---

## 10. Available npm scripts

| Command | Purpose |
|---|---|
| `npm start` | Start Expo development server |
| `npm run ios` | Start Expo and open iOS |
| `npm run android` | Start Expo and open Android |
| `npm run web` | Start Expo web |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Run Jest with coverage |

---

## 11. Testing

The project uses **Jest + Jest Expo + React Native Testing Library**.

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

Run the test suite with coverage:

```bash
npm run test:coverage
```

The Jest configuration defines a **100% global threshold** for branches, functions, lines, and statements across the configured source files.

### What is tested?

#### Helpers

- Price formatting
- Decimal precision
- Invalid numeric values

#### Mock market socket

- Subscription
- Immediate snapshot delivery
- Periodic price updates
- Bid/Ask movement direction
- Unsubscription
- Start/stop behavior
- Protection against duplicate intervals

#### Trade API

- Successful order
- BUY/SELL request behavior
- Quantity rejection
- Simulated latency

#### Market Watch screen

- Instrument rendering
- Price rendering
- Navigation interaction
- Market-data subscription behavior

#### Symbol Details screen

- Initial selected instrument
- Live market updates
- Quantity validation
- BUY execution at Ask
- SELL execution at Bid
- Loading state
- Successful order
- Rejected order
- API failure handling

---

## 12. Creating a development build

For this assessment, **Expo Go / Expo development mode is sufficient for normal development**.

If a native development build is required, install the EAS CLI:

```bash
npm install --global eas-cli
```

Log in to your Expo account:

```bash
eas login
```

Configure EAS for the project if required:

```bash
eas build:configure
```

Create a development build:

```bash
eas build --profile development
```

The exact EAS configuration may vary depending on the target platform and Expo account/project configuration.

> The assessment project does not require a production backend or external market-data service, so a development build is mainly useful when validating native-device behavior outside Expo Go.

---

## 13. Creating a production build

For an Expo/EAS managed project, production builds can be generated with:

```bash
eas build --platform android --profile production
```

or:

```bash
eas build --platform ios --profile production
```

For both platforms:

```bash
eas build --platform all --profile production
```

Before creating a production build, verify the Expo project configuration and EAS credentials for the target environment.

The assessment itself does not require publishing the application to the App Store or Google Play.

---

## 14. Creating local native projects

If native project directories are needed for local native builds/custom native configuration, Expo can generate them with:

```bash
npx expo prebuild
```

Then native projects can be opened/built using the platform tooling.

### iOS

```bash
npx expo run:ios
```

### Android

```bash
npx expo run:android
```

Only use `prebuild` when native project generation is actually required. For normal assessment development, keeping the project in the managed Expo workflow is simpler.

---

## 15. Resetting the development environment

If Metro or Expo caching causes unexpected behavior, try:

```bash
npx expo start -c
```

For a clean dependency installation:

```bash
rm -rf node_modules
npm ci
```

Then restart Expo:

```bash
npm start
```

> Avoid deleting `package-lock.json` unless there is a specific dependency-resolution problem. Keeping the lock file helps maintain reproducible installations.

---

## 16. Important implementation decisions

### No external market-data API

The assessment asks for a self-contained real-time simulation, so market data is generated locally. This makes the application deterministic from an environment/setup perspective and avoids network/API dependencies.

### Subscription-based market data

`mockSocket` exposes a small publish/subscribe interface:

```ts
const unsubscribe = mockSocket.subscribe(callback);

return () => unsubscribe();
```

This keeps screens decoupled from the internal timer and data-generation implementation.

### Initial snapshot

A subscriber receives the current snapshot immediately. This avoids rendering an empty detail screen while waiting for the next simulated tick.

### Navigation passes the selected tick

The Market Watch screen passes the selected instrument and current tick to the detail screen. The detail screen can therefore render immediately and then continue receiving live updates.

### BUY / SELL price semantics

The implementation follows standard quote semantics for this demo:

- **BUY → Ask**
- **SELL → Bid**

### FlatList

`FlatList` is used instead of mapping the full array directly into a `ScrollView`, because it is the appropriate React Native primitive for a potentially larger market list and provides virtualization.

### Memoized row

The market row uses `React.memo` to avoid unnecessary child renders when the row's props have not changed.

---

## 17. Known scope limitations

This is an assessment/demo application rather than a production trading platform. It intentionally does not implement:

- Real WebSocket connectivity
- Real exchange/broker integration
- Authentication or authorization
- Secure credential storage
- Real order routing
- Portfolio/account state
- Real margin calculation
- Order history
- Persistence/database
- Offline synchronization
- Production market-data normalization
- Reconnection/backoff strategy for a real network socket
- Production-grade observability/analytics

These would be additional concerns in a production trading application.

---

## 18. Production evolution

If this application were extended into a production trading product, the next architectural steps would be to isolate the transport and domain layers more explicitly:

```text
                 Real WebSocket / FIX / Broker API
                              │
                              ▼
                     Market Data Adapter
                              │
                              ▼
                       Normalized Tick
                              │
                              ▼
                 Market Data Store / Cache
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Watchlist UI        Detail UI

Order UI
   │
   ▼
Order Service / Repository
   │
   ▼
Broker / Trading API
```

For high-frequency market data, the production implementation would also need careful consideration of update frequency, batching/throttling, normalization, rendering strategy, stale-data handling, reconnection, backpressure, and observability.

Those concerns are intentionally outside the scope of this small assessment.

---

## 19. Troubleshooting quick reference

### App does not start

```bash
npm ci
npx expo start -c
```

### Tests fail after dependency changes

```bash
rm -rf node_modules
npm ci
npm test
```

### Android does not launch

Check that:

- Android Studio is installed.
- An Android emulator is running.
- Android SDK environment variables are configured correctly.
- `npm run android` is being run from the project root.

### iOS does not launch

Check that:

- Xcode is installed.
- An iOS Simulator is available.
- Xcode command-line tools are configured.
- `npm run ios` is being run from the project root.

### Prices appear static

The mock socket starts when `MarketWatchScreen` mounts. Confirm the app is running normally and allow a couple of seconds for simulated ticks to become visible.

---

## 20. Quick start

For someone reviewing the project for the first time:

```bash
# 1. Enter project
cd ADSS-Demo

# 2. Install dependencies
npm ci

# 3. Run tests
npm test

# 4. Optional: run coverage
npm run test:coverage

# 5. Start application
npm start
```

Then open the app in Expo Go, iOS Simulator, or Android Emulator.

---

## 21. LLM-assisted development

An LLM was used as a coding assistant during development. Code was generated as text and manually integrated into the project rather than allowing an LLM to directly modify project files.

A reconstructed prompt history is included separately in:

```text
LLM_CONVERSATION.md
```

That document describes the main development iterations, including the initial implementation, engineering review, test coverage, Bid/Ask movement refinement, and final review.

---

## 22. Assessment summary

The application is intentionally small but demonstrates the key engineering concepts expected from a React Native trading UI:

- typed navigation
- componentized UI
- real-time subscription handling
- proper lifecycle cleanup
- efficient list rendering
- independent market-price movement
- clear service boundaries
- order execution semantics
- error/loading handling
- automated tests

The implementation favors **clarity and maintainability over unnecessary architectural complexity**, which is appropriate for the scope of the assessment.
