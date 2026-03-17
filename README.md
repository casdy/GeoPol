# 🌐 GEOPOL — Real-Time Geopolitical Intelligence Terminal

A high-density situational awareness dashboard built with **Next.js 16**, aggregating live global news, weather intelligence, and 46 YouTube live streams into a single command-center interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)

---

## ⚡ Features

| Feature | Description |
|---|---|
| **Live Wire Ticker** | Scrolling real-time headline telemetry across the top bar |
| **3-Column Command Grid** | Hero story + compact cards in a newspaper-style desktop layout |
| **Live Intelligence Feed** | 46 embedded YouTube live news streams from 6 global regions, switchable via hamburger menu |
| **Interactive World Map** | Region-based filtering with click-to-zoom geopolitical zones |
| **Weather Intelligence** | Real-time weather for strategic global cities (Open-Meteo) |
| **Crisis Mode** | One-click Red Alert override re-theming the entire UI |
| **Newsletter System** | Resend-powered email subscription with preview API |
| **Visitor Counter** | Persistent localStorage-backed counter starting at 50 |

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + Framer Motion
- **State**: TanStack React Query
- **News APIs**: NewsAPI, GNews.io, World News API
- **Weather**: Open-Meteo (free, no key required)
- **Email**: Resend
- **AI**: Google Gemini (optional, for article synthesis)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- API keys for at least one news provider

### Install & Run

```bash
git clone https://github.com/yourusername/geopolitical-pulse.git
cd geopolitical-pulse
npm install
```

Create `.env.local`:

```env
# News (at least one required)
NEWS_API_KEY=your_key
GNEWS_API_KEY=your_key
WORLD_NEWS_API_KEY=your_key

# Optional
GEMINI_API_KEY=your_key
RESEND_API_KEY=your_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> ⚠️ **Never commit `.env.local`** — it is gitignored by default.

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router (page, layout, API routes)
├── components/
│   ├── dashboard/    # ItemCard, LiveNewsViewer, WorldMap, NewsModal
│   ├── layout/       # Footer, Header, CategoryNav
│   └── shared/       # NewsletterForm, WeatherWidget, CrisisToggle
└── lib/              # Types, API helpers, utilities
```

## 📜 License

MIT
