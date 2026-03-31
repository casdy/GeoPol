# 🌐 GEOPOL — Tactical Geopolitical Intelligence Terminal

A high-density situational awareness dashboard built with **Next.js 15**, aggregating 32 curated live global news channels, satellite telemetry, and AI-driven intelligence synthesis into a responsive command-center interface.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)
![Vercel KV](https://img.shields.io/badge/Storage-Vercel%20KV-red?logo=redis)

---

## ⚡ Core Systems

| System | Description |
|---|---|
| **Tactical News Grid** | 32 verified live streams categorized by continent (Europe, Asia, Middle East, NA, Africa, Oceania) |
| **Fusion Engine v2** | Triple-batch data pipeline executing 3x daily AI synthesis via OpenRouter + Vercel KV |
| **Strategic Theater Map** | Interactive tactical map with live overlays (NASA EONET, OpenSky, USGS Seismology) |
| **Crisis Mode** | Instant Red Alert override re-theming the terminal for high-intensity monitoring |
| **Intelligence Briefing** | AI-generated summaries for localized global events with bias-detection metadata |

## 🛠 Tech Stack

- **Framework**: Next.js 15 (Turbopack)
- **State**: TanStack React Query + Vercel KV (Redis)
- **Styling**: Tailwind CSS 4 + Framer Motion (Glassmorphism + Tactical HUD)
- **AI**: OpenRouter (Llama 3.3 70B / DeepSeek-V3)
- **Feeds**: NewsAPI, GNews, NASA, OpenSky, YouTube Data API

## 🚀 Development & Operations

### Local Development

1.  **Clone & Install**:
    ```bash
    git clone <repository-url>
    cd GeoPol
    npm install
    ```
2.  **Environment Setup**:
    Create a `.env.local` file with the keys listed below.
3.  **Run Development Server**:
    ```bash
    npm run dev
    # Terminal starts at http://localhost:3000
    ```

### Environment Configuration (`.env.local`)

```env
# Intelligence Providers
NEWS_API_KEY=your_key
GNEWS_API_KEY=your_key

# Database (Vercel KV)
KV_URL=your_url
KV_REST_API_URL=your_rest_url
KV_REST_API_TOKEN=your_token

# AI Intelligence
OPENROUTER_API_KEY=your_key
```

### Strategic Cron Jobs
The Fusion Engine runs at `00:00`, `08:00`, and `16:00` UTC to refresh the tactical global state without exceeding rate limits. These can be triggered via `/api/fusion` if authorized.

## 🧪 Intelligence Verification (Testing)

The system uses **Vitest** for tactical unit testing and data validation.

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui
```

## 📁 Project Structure

```
src/
├── app/              # Tactical Routing & Edge Functions (Cron, Fusion, Proxy)
├── components/       # Interface Modules
│   ├── dashboard/    # StrategicTheaterMap, LiveNewsViewer, GlobalCamGrid
│   └── layout/       # CommandCenterLayout, CategoryNav, HamburgerMenu
├── hooks/            # Reactive State Modules (useWebcams, useAnimations)
├── lib/              # Core Logic (FusionEngine, Ingestor, Sanitizer)
└── tests/            # Automated Validation Suites
```

## 📜 License
MIT
