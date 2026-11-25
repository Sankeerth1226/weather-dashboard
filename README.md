# Atmos — Weather & Environmental Telemetry

A responsive React + TypeScript dashboard for live global weather and air-quality readings. It uses Open-Meteo's keyless Geocoding, Forecast, and Air Quality APIs; no API keys or secrets are required.

## Features

- Global city autocomplete, debounced by 300 ms, with coordinates and country context to distinguish similarly named places.
- TanStack Query v5 request deduplication/caching (10-minute stale time) and AbortSignal propagation for stale search cancellation.
- Parallel forecast and air-quality requests, with graceful air-quality fallback if that endpoint is unavailable.
- Pure TypeScript normalization of Open-Meteo's columnar arrays into typed current, hourly, daily, and air-quality models.
- Day/night appearance is driven by the selected location's `current.is_day`, not the browser clock.
- In-memory metric/imperial conversion without additional network requests.
- 24-hour temperature and precipitation-probability visualization, plus a 5-day min/max outlook.
- Responsive layout, accessible labels, loading skeletons, no-results and network error states, and reduced-motion support.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`, then preview it with `npm run preview`.

## Data attribution

Weather, geocoding, and air-quality data are provided by [Open-Meteo](https://open-meteo.com/) under its published terms and CC BY 4.0 attribution requirements. This client makes requests directly to public Open-Meteo endpoints and contains no credentials.
