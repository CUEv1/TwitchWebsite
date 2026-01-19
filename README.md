# Twitch Statistics Website - Starter Kit

This repository contains a starter codebase and guidance for building a modern Twitch statistics dashboard. It focuses on scalable structure, data-fetching patterns, and polished UI foundations inspired by contemporary Twitch analytics platforms.

## 1. Recommended architecture

**Front end (this repo)**
- **React + Vite + TypeScript** for fast iteration, static typing, and a modular component system.
- **Feature-based folders**: keep UI components, data access, and shared types isolated for scalability.

```
src/
  components/        # Reusable UI primitives
  data/              # API clients, types, mock data
  styles/            # Global styles and tokens
```

**Back end (future)**
- Build a lightweight **API layer** (Node.js or serverless) to securely handle Twitch API credentials.
- Cache and aggregate data to avoid rate-limit issues.

## 2. UI foundations

The UI blends hero cards, KPI tiles, and data tables in a dark Twitch-inspired palette. The layout uses CSS grid, fluid typography, and responsive breakpoints.

### Example: stat card component

```tsx
const StatCard = ({ label, value, delta, helper }: StatCardType) => (
  <article className="stat-card">
    <div className="stat-card__header">
      <p className="stat-card__label">{label}</p>
      <span className="stat-card__delta">{delta}</span>
    </div>
    <h3 className="stat-card__value">{value}</h3>
    <p className="stat-card__helper">{helper}</p>
  </article>
);
```

## 3. Data fetching and API structure

Keep Twitch credentials out of the browser. Fetch data via a backend or serverless proxy and normalize the response before it reaches the UI.

### Example: client + mock fallback

```ts
export const fetchDashboardData = async () => {
  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
  const accessToken = import.meta.env.VITE_TWITCH_ACCESS_TOKEN;

  if (!clientId || !accessToken) {
    return dashboardMock; // fallback for local development
  }

  const headers = {
    "Client-Id": clientId,
    Authorization: `Bearer ${accessToken}`
  };

  const streamsResponse = await fetch(`${TWITCH_API_BASE}/streams?first=20`, {
    headers
  });

  if (!streamsResponse.ok) {
    return dashboardMock;
  }

  return transformStreams(await streamsResponse.json());
};
```

## 4. Responsive design guidance

Use CSS grid with auto-fit columns and fluid spacing to keep layouts adaptive. Ensure data tables collapse into stacked cards on mobile.

```css
.stat-grid {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

@media (max-width: 900px) {
  .channel-row {
    grid-template-columns: 1fr;
  }
}
```

## 5. Getting started

```bash
npm install
npm run dev
```

> ⚠️ Note: opening `index.html` directly in the browser will show a blank page
> because the TypeScript/JSX bundle is served by Vite. Use `npm run dev` for
> local development or `npm run build` + `npm run preview` for a production
> smoke test.

If you still see the fallback message while running the dev server, open the
browser console and confirm the `main.tsx` bundle is loading without errors.
The fallback should be removed as soon as React mounts.

## 6. Next steps

- Add authentication and secure token exchange for Twitch API.
- Replace mock data with real analytics endpoints and caching.
- Implement charting (e.g., Recharts) for interactive trends.
- Build filter panels and saved report views.

---

If you want deeper guidance (state management, testing setup, or backend scaffolding), share your preferred stack and hosting target.
