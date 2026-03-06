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
- **Copyright Safe Harbor Aggregation**:
  - **AI Synthesized Briefings**: Transformative AI abstracts acting strictly within Fair Use protocols.
  - **Direct Publisher Referencing**: Links to full stories explicitly route out to the original publications.
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
   # News API Providers (Required - At least one)
   NEWS_API_KEY=your_key_here
   GNEWS_API_KEY=your_key_here
   PERIGON_API_KEY=your_key_here

   # Weather Data (Optional)
   WEATHER_API_KEY=your_key_here
   ```

   > 🚨 **SECURITY WARNING**:
   > NEVER commit your `.env.local` or any API keys to version control. The `.gitignore` has been strictly configured to block `.env` files, but you must remain vigilant. Always rotate leaked keys immediately.

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
- **Search Engine**: Refined logic to prioritize direct user queries, bypassing default filters for unrestricted keyword searching.
- **Weather Expansion**: Increased tracking to 10 strategic global cities with extended mock data coverage.
- **Reliability**: Added robust fallback data generation for Ground News feed to prevent empty states.
- **Security & Compliance**: Removed all full-text article scraping functions to mathematically guarantee DMCA / Copyright compliance. Enforced strict cross-origin tab-nabbing protections (`rel="noopener noreferrer"`).
- **Advanced WAF**: Integrated Edge-native API Rate Limiting (DE.CM-06) natively intercepting all deep routes to mitigate Denial of Wallet attacks.
- **Data Density**: Expanded the unified intelligence payload capacity to process and layout 60 concurrent live-feed articles across adaptive desktop/mobile grids.
- **Micro-Interactions**: Enhanced hover states, card animations, and modal transitions.
