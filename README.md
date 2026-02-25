# Canfusion Site

Monorepo for the Canfusion CanSat real-time tracking platform. It contains:

- `Website-Backend` — NestJS + TypeORM API for ingesting, storing, and serving sensor data (SQLite).
- `Website-Frontend` — Vue 3 + Vite app with Cesium 3D globe for visualizing live telemetry.

## Prerequisites

- Node.js 18+ (recommended) and npm
- WebGL-capable browser for the frontend

## Quick Start

```bash
# from repo root
cd Website-Backend
npm install
npm run start:dev      # API on http://localhost:3000

cd ../Website-Frontend
npm install
npm run dev            # Vite dev server on http://localhost:5173
```

> If you need HTTPS for local Cesium usage, use `npm run dev:https` (requires mkcert) or `npm run preview:https` after building.

## Frontend Notes (`Website-Frontend`)

- Cesium assets are already vendored under `public/cesium`. If you ever update Cesium, run `npm run copy-cesium` to copy fresh assets.
- Optional: create `.env` with `VITE_CESIUM_TOKEN=<your-cesium-ion-token>` if you use Cesium Ion resources.
- Key scripts:
  - `npm run dev` / `npm run dev:https` — start dev server
  - `npm run build` — production build to `dist/`
  - `npm run preview` — preview the built site

## Backend Notes (`Website-Backend`)

- SQLite database file `sensor-data.db` is created in the backend root; schema is synced automatically via TypeORM.
- The server listens on `PORT` env var if set, otherwise `3000`.
- Key scripts:
  - `npm run start:dev` — watch mode
  - `npm run start` / `npm run start:prod` — run compiled build
  - `npm run test`, `npm run test:e2e`, `npm run test:cov` — testing

### REST API

Base URL: `http://localhost:3000`

- `POST /data`
  - Body: `{ "data": "<telemetry-string>", "rssi": <number> }`
  - Example telemetry string: `Time:123,Temp:21.3,Humidity:45.2,Pressure:1012.3,Altitude:120.5,Lat:54.9,Lng:23.9,Gx:0.01,Gy:-0.02,Gz:0.98,Photo:42,LAUNCHED,Beeper on`
  - Response: `{ status, id, receivedAt }`
- `POST /data/clear`
  - Clears all stored telemetry rows. Response includes status and timestamp.
- `GET /data/latest`
  - Returns the most recent entry formatted for the frontend.
- `GET /data/history?limit=50`
  - Returns latest `limit` (1–1000) entries, newest first.

### Data Parsing Rules

- Incoming telemetry is parsed from comma-delimited key/value pairs (see example above).
- `Lat` / `Lng` values of `nan` are stored as null; they are returned as `nan` strings to the frontend.
- `Temp` is adjusted by `-5` during ingestion; `LAUNCHED` and `Beeper on` flags set booleans.

## Project Layout

```
Canfusion site/
├─ Website-Backend/     # NestJS API
└─ Website-Frontend/    # Vue 3 + Cesium client
```

## Production Builds

- Backend: `cd Website-Backend && npm run build && npm run start:prod` (ensure `PORT` is set if needed).
- Frontend: `cd Website-Frontend && npm run build` then serve `dist/` with any static host.

## Testing

- Backend: `npm run test`, `npm run test:e2e`, or `npm run test:cov` in `Website-Backend`.
- Frontend: (no automated tests defined yet).

## Troubleshooting

- **CORS / networking**: configure your deployment proxy to allow the frontend origin to reach the backend port.
- **SQLite file location**: `sensor-data.db` lives in the backend folder; delete it to reset all data (or use `POST /data/clear`).
- **Cesium HTTPS**: if browsers block geolocation or WebGL assets over HTTP, use the HTTPS dev scripts.
