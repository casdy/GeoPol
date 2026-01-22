<<<<<<< HEAD
# 🌐 GeoPolitical Pulse (GEOPOL)- Real-Time Intelligence Dashboard

GeoPolitical Pulse is a Next.js-based situational awareness dashboard designed for tracking real-time geopolitical events. It aggregates disparate data sources (news articles and video feeds), normalizes them into a unified intelligence stream, and presents them in a professional "Command Center" interface.

## ⚡ Key Features

- **Real-Time "Live Wire"**: A scrolling ticker component that mimics newsroom telemetry.
- **Unified Data Architecture**: A custom "Normalizer" pattern for NewsAPI and YouTube API data.
- **Geospatial Filtering**: Interactive map selection for filtered intelligence feeds.
- **Video Intelligence Grid**: Dedicated video feed with embedded modal player.
- **🚨 Crisis Mode**: Global override prioritizing high-impact events (War, Nuclear Alerts) and re-theming the UI.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI (Concepts)
- **State Management**: React Query (TanStack Query)
- **Data Sources**: NewsAPI, YouTube Data API v3

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- API Keys for [NewsAPI](https://newsapi.org) and [Google/YouTube API](https://console.cloud.google.com)

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
   NEXT_PUBLIC_NEWS_API_KEY=your_news_key_here
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_key_here
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

4. Run Development Server:
   ```bash
   npm run dev
   ```

=======
🌐 GeoPolitical Pulse (GEOPOL)- Real-Time Intelligence Dashboard
GeoPolitical Pulse is a Next.js-based situational awareness dashboard designed for tracking real-time geopolitical events. It aggregates disparate data sources (news articles and video feeds), normalizes them into a unified intelligence stream, and presents them in a professional "Command Center" interface.

⚡ Key Features
Real-Time "Live Wire": A scrolling ticker component that mimics newsroom telemetry.
Unified Data Architecture: A custom "Normalizer" pattern for NewsAPI and YouTube API data.
Geospatial Filtering: Interactive map selection for filtered intelligence feeds.
Video Intelligence Grid: Dedicated video feed with embedded modal player.
🚨 Crisis Mode: Global override prioritizing high-impact events (War, Nuclear Alerts) and re-theming the UI.
🛠 Tech Stack
Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: Tailwind CSS + Shadcn/UI (Concepts)
State Management: React Query (TanStack Query)
Data Sources: NewsAPI, YouTube Data API v3
🚀 Getting Started
Prerequisites
Node.js 18+
API Keys for NewsAPI and Google/YouTube API
Installation
Clone the repository:

git clone https://github.com/yourusername/geopolitical-pulse.git
cd geopolitical-pulse
Install dependencies:

npm install
Configure Environment: Create a .env.local file:

NEXT_PUBLIC_NEWS_API_KEY=your_news_key_here
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_key_here
NEXT_PUBLIC_USE_MOCK_DATA=true
Run Development Server:

npm run dev
>>>>>>> 4296bd7cd239e4cbb4ddb338713681c3f1157aaa
Open http://localhost:3000 to view the dashboard.
