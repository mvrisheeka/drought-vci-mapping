# Drought Monitoring & VCI Analysis — frontend

React + Vite + TypeScript + Tailwind v4 + React-Leaflet + Recharts dashboard for the
VCI pipeline in `../drought_vci_mapping.ipynb` (the notebook itself is not modified).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

## Data provenance

Every value carries a `DataSource` badge:

| Badge | Meaning |
|---|---|
| **Live** | Returned by the FastAPI backend |
| **Notebook output** | Real values copied from the executed notebook's recorded outputs (`src/data/notebookSnapshot.ts`) |
| **Demo data** | Synthetic data generated in the browser (`src/data/mockDroughtData.ts`): map rasters, pixel values and the interactive histogram |

Without a backend, only Jodhpur 2023 with the 2015–2023 baseline can be selected, because that is the only run the notebook recorded.

## Connecting the backend

1. Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL=/api` and `VITE_API_PROXY_TARGET=http://localhost:8000`.
2. Implement the endpoints in `../BACKEND_CONTRACT.md`.
3. Restart `npm run dev`. The status chip in the header changes to *Live backend*. If the backend is unreachable, the app falls back to the snapshot and labels it.

## Structure

```
src/
  types/drought.ts          API/domain types (the backend contract)
  config/                   methodology constants, class thresholds & palettes, study areas, basemaps
  data/notebookSnapshot.ts  REAL notebook outputs (static)
  data/mockDroughtData.ts   DEMO synthetic raster / pixels / histogram
  services/                 apiClient (fetch), droughtApi (live → fallback), demoRaster, config
  context/ hooks/           shared analysis state (params, run, reset, result)
  components/map/           DroughtMap, LayerSwitcher, MapLegend, PixelInspector
  components/charts/        class bar chart, share bar, VCI histogram, NDVI trend
  components/sections/      panels composed from charts + provenance badges
  pages/                    Overview, Drought Map, Historical Trends, Statistics, Reports
public/data/                Jodhpur boundary (GADM 4.1, record 499, simplified)
public/notebook-figures/    PNG figures extracted from the notebook outputs
```
