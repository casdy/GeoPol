# 🌐 GeoPolitical Pulse (GEOPOL) - Real-Time Intelligence Dashboard

GeoPolitical Pulse is a Next.js-based situational awareness dashboard designed for tracking real-time geopolitical events. It aggregates disparate data sources, normalizes them into a unified intelligence stream, and presents them in a professional "Command Center" interface.

## ⚡ Key Features

- **Real-Time "Live Wire"**: A scrolling ticker component that mimics newsroom telemetry.
- **Unified 3-Column Command Layout**:
    - **Sector A (Left)**: Live Weather Intelligence Strip (Strategic Cities).
    - **Sector B (Center)**: Main Headline Grid (Normalization of NewsAPI).
    - **Sector C (Right)**: Ground News Feed Grid (GNews.io Integration).
- **Advanced Weather Intelligence**:
    - Real-time weather for strategic locations.
    - Interactive "Atmo-Data" nodes with detailed pop-up modals (Pressure, Visibility, Feels Like).
    - Visual indicators for conditions (Rain, Clear, Haze).
- **Robust Data Pipeline**:
    - **Provider Rotation**: Automatic failover logic (NewsAPI -> GNews -> Mock Data) to handle rate limits.
    - **Deterministic Mocking**: Stability-focused data generation for dev/demo modes.
- **Premium Intelligence Features**:
    - **AI Analysis Paywall**: Mock subscription gating for premium AI summaries of articles.
    - **Full Content Extraction**: Server-side parsing of article content for read-mode.
- **🚨 Crisis Mode**: Global override prioritizing high-impact events (War, Nuclear Alerts) and re-theming the UI to Red Alert status.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion (for smooth layout transitions)
- **State Management**: React Query (TanStack Query)
- **Data Sources**: NewsAPI, GNews.io, OpenWeatherMap

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- API Keys for:
    - [NewsAPI](https://newsapi.org)
    - [GNews.io](https://gnews.io)
    - [OpenWeatherMap](https://openweathermap.org/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/geopolitical-pulse.git
   cd geopolitical-pulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment:
   Create a `.env.local` file:
   ```env
   # News Providers
   NEXT_PUBLIC_NEWS_API_KEY=your_news_key_here
   G_NEWS_API=your_glines_key_here
   
   # Weather Data
   OPEN_WEATHER_API_KEY=your_weather_key_here

   # Development Settings
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

4. Run Development Server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🔄 Recent Updates (Changelog)

- **Feature**: Added "Strategic Weather Widget" with modal details to the left sidebar.
- **Layout**: Refactored Dashboard to a dense 3-Column Grid (Weather / Main / GNews).
- **Backend**: Implemented "Provider Rotation" service to handle API limits gracefully.
- **Monetization**: Integrated "Premium Paywall" modal for AI Summary generation.
- **UI Architecture**: Implemented React Portals for modal rendering to ensure correct stacking contexts and Z-index layering.
- **Micro-Interactions**: Enhanced hover states, card animations, and modal transitions.
