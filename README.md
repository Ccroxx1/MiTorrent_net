# 🧲 MiTorrents — Modern Personal Media Gateway & Mirror Index

A streamlined, high-performance personal interface for indexing, searching, and managing media releases with real-time multi-mirror failover, Sonarr/Radarr RSS syndication, client-side P2P magnet dispatching, and offline catalog resilience.

![MiTorrents](public/default-poster.png)

---

## ✨ Features

- **🔄 Multi-Mirror Aggregator & Failover Engine**:
  - Live latency testing and automatic failover across multiple TorrentGalaxy mirrors (`torrentgalaxy.to`, `torrentgalaxy.mx`, `tgx.rs`, `torrentgalaxy.one`).
  - Fast parallel mirror polling with error containment and automated fallback.

- **🛡️ 100% Zero-Downtime Offline Resilience**:
  - If upstream mirrors are rate-limited, blocked, or unreachable, MiTorrents automatically serves a rich, verified media catalog and dynamic query search results without breaking the user experience.

- **⚡ Instant P2P & Magnet Dispatching**:
  - One-click launch in desktop clients (**qBittorrent**, **Transmission**, **Deluge**, **uTorrent**, **BitTorrent**).
  - Tracker-injected magnet link generation with verified open tracker lists.
  - Exportable `.torrent` placeholder / metadata files and clipboard copy.

- **📺 TV Tracker & Automated RSS Feed Generator**:
  - Track airing seasons, missing episodes, and schedule releases.
  - Generate dynamic RSS XML endpoints customized for **Sonarr**, **Radarr**, and RSS automation tools.

- **🎨 Modern Responsive UI**:
  - Responsive **Grid** and dense **Table** view modes.
  - Granular filters for Resolution (**4K / 2160p**, **1080p**, **720p**, **CAM**), Codec (**x265 / HEVC**, **x264 / AVC**, **10-Bit**, **HDR**), Categories, and Sorting (Seeds, Leechers, Size, Title).
  - Light & Dark mode support with persistent local bookmarks and search history.
  - Keyboard shortcuts (`/` to search, `G` for grid, `T` for table, `S` for series tracker, `R` for RSS).

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm** or **bun** / **yarn**

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/mitorrents.git
cd mitorrents

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 🌐 Deployment

### Deploying to Vercel (Recommended)

MiTorrents includes pre-configured serverless handlers (`api/index.js`) and routing configurations (`vercel.json`):

1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Click **Deploy**. Both the Vite single-page app and the `/api/*` serverless routes will deploy automatically.

### Deploying to Docker / Cloud Run

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📡 API Endpoints

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Health status, active mirror, and mirror pool stats |
| `/api/latest` | `GET` | Browse latest torrent releases (`?page=1&category=Movies`) |
| `/api/search` | `GET` | Search releases (`?q=dune&page=1&category=Movies`) |
| `/api/details` | `GET` | Scrape detailed metadata, file lists, and magnet (`?url=...`) |
| `/api/rss` | `GET` | Dynamic RSS 2.0 XML feed for Sonarr / Radarr |
| `/api/ping` | `GET` | Ping all mirrors and report latency in milliseconds |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :---: | :--- |
| `/` | Focus search bar |
| `G` | Switch to Grid View |
| `T` | Switch to Table View |
| `S` | Open TV Series Tracker |
| `R` | Open RSS Feed Generator |
| `Esc` | Close modals / Return to catalog |

---

## ⚠️ Disclaimer

MiTorrents is a personal indexing interface designed for educational, research, and self-hosted metadata management purposes. Please respect content licensing and adhere to your local jurisdiction's laws.
