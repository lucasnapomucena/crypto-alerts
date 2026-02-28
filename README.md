# Crypto Alerts

Real-time cryptocurrency price monitoring and alert system. Track live trades from Bybit across multiple coins and get notified when prices cross your configured thresholds.

## Features

- **Live trade feed** — real-time transactions streamed via WebSocket
- **Multi-coin support** — BTC, ETH, BNB, SOL, XRP, ADA, DOGE, AVAX
- **Price alerts** — create rules that trigger a notification when price goes above or below a threshold
- **Coin filter** — filter the monitor view by coin
- **Dark/light mode**

## Architecture

```
┌─────────────────┐        WebSocket        ┌──────────────────┐        WebSocket        ┌─────────────┐
│   React Client  │ ◄────────────────────── │  Node.js Proxy   │ ◄────────────────────── │    Bybit    │
│   (Vercel)      │                         │   (Railway)      │                         │  (Exchange) │
└─────────────────┘                         └──────────────────┘                         └─────────────┘
```

The Node.js proxy server connects to Bybit's public WebSocket stream and forwards trade data to connected clients. This avoids CORS issues and centralises the data stream.

## Tech Stack

### Frontend (`/client`)
| | |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Bundler | Vite |
| Routing | React Router 7 |
| State management | Zustand |
| UI components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS v4 |
| Notifications | Sonner |
| Virtualised list | react-virtuoso |
| Tests | Vitest + Testing Library |

### Backend (`/server`)
| | |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| WebSocket | ws |
| Runner | tsx |
| Data source | Bybit public WebSocket |

## Running locally

### Prerequisites

- Node.js 20+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/lucasnapomucena/crypto-alerts.git
cd crypto-alerts
```

### 2. Start the backend

```bash
cd server
npm install
npm run dev
```

The proxy server will start on `ws://localhost:4000`.

### 3. Start the frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

> The frontend connects to `ws://localhost:4000` by default. No environment variables needed for local development.

## Environment variables

### Frontend (`client/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `VITE_WS_URL` | WebSocket server URL | `ws://localhost:4000` |

Only needed if you want to point the frontend at a remote server.

### Backend

No environment variables required. The server connects directly to Bybit's public WebSocket API without an API key.

## Running tests

```bash
cd client
npm test
```

## Deployment

| Service | Platform |
|---|---|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Railway](https://railway.app) |

Set `VITE_WS_URL` in your Vercel project environment variables pointing to your Railway backend URL (e.g. `wss://your-service.up.railway.app`).
