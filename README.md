# SkillHub — Service Marketplace Mobile App

SkillHub is a React Native / Expo mobile app connecting clients with skilled service providers. Users can browse services, book providers, chat in real time, and manage payments through an integrated wallet.

## Features

- **Authentication** — Login, registration, OTP verification, and KYC onboarding
- **Service Discovery** — Browse by category, full-text search, and detailed provider profiles with ratings
- **Bookings** — Schedule, confirm, and track service bookings with time-slot selection
- **Real-time Chat** — Socket.IO-powered messaging between clients and providers
- **Wallet** — In-app balance, top-up flow, and transaction history
- **Profile** — User and provider profile management

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React Native 0.81 + Expo 54 |
| Language | TypeScript 5.9 |
| Navigation | React Navigation 7 (stack + bottom tabs) |
| Server state | TanStack React Query 5 |
| Client state | Zustand 5 |
| HTTP | Axios |
| Real-time | Socket.IO client 4 |
| Forms | React Hook Form + Zod |
| Storage | AsyncStorage |

## Project Structure

```
src/
├── navigation/       # Stack and tab navigators, deep-link config
├── screens/          # One folder per feature (auth, home, booking, chat, wallet, profile)
├── components/       # Shared UI (common/) and feature-specific components
├── hooks/            # Custom React hooks (useAuth, useBooking, useChat, useWallet, …)
├── store/            # Zustand stores (auth, booking, chat, wallet, ui)
├── service/          # API layer (authService, bookingService, chatService, walletService, socket)
├── types/            # TypeScript types per domain
├── constants/        # Colors, typography, spacing, API endpoints, app config
├── utils/            # Formatters, validators, error handler, permissions, storage
└── mock/             # Mock data for development
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator **or** the Expo Go app on a physical device

### Installation

```bash
git clone https://github.com/DILHT/Skillhub_frontend.git
cd Skillhub_frontend
npm install
```

### Environment

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### Running

```bash
# Start the Expo dev server
npm start

# Open on Android
npm run android

# Open on iOS
npm run ios

# Open in browser (limited)
npm run web
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Launch on Android |
| `npm run ios` | Launch on iOS |
| `npm run web` | Launch in browser |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request against `main`
