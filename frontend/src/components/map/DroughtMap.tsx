import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleMarker, GeoJSON, ImageOverlay, MapContainer, ScaleControl, TileLayer, useMapEvents } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import type { FeatureCollection } from 'geojson'
import { FlaskConical, Maximize2, Minimize2, Minus, Plus, Scan } from 'lucide-react'
import { useAnalysis } from '../../hooks/useAnalysis'
import { useAsync } from '../../hooks/useAsync'
import { getDemoRaster, loadBoundary } from '../../services/demoRaster'
import { droughtApi } from '../../services/droughtApi'
import { renderDemoLayer } from '../../utils/rasterRender'
import { STUDY_AREAS, DEFAULT_AREA } from '../../config/studyAreas'
import { LayerSwitcher } from './LayerSwitcher'
import { BASEMAPS, type BasemapId } from '../../config/basemaps'
import { MapLegend } from './MapLegend'
import { PixelInspector, type PixelSelection } from './PixelInspector'
import type { MapLayerDescriptor, StudyArea } from '../../types/drought'

// ---------- layers ----------

function RasterLayer({ desc, area, opacity }: { desc: MapLayerDescriptor; area: StudyArea; opacity: number }) {
  const demo = useAsync(() => (desc.kind === 'demo' ? getDemoRaster(area) : Promise.resolve(null)), [desc.kind, area.id])
  if (desc.kind === 'tile' && desc.url) return <TileLayer url={desc.url} opacity={opacity} zIndex={5} />
  if (desc.kind === 'image' && desc.url && desc.bounds) return <ImageOverlay url={desc.url} bounds={desc.bounds} opacity={opacity} className="pixelated" />
  if (desc.kind === 'demo' && demo.data && desc.id !== 'boundary') {
    return <ImageOverlay key={desc.id} url={renderDemoLayer(demo.data, desc.id)} bounds={demo.data.bounds} opacity={opacity} className="pixelated" />
  }
  return null
}

function BoundaryLayer({ area, onSatellite }: { area: StudyArea; onSatellite: boolean }) {
  const { data } = useAsync(() => loadBoundary(area), [area.id])
  if (!data) return null
  return (
    <GeoJSON
      key={`${area.id}-${onSatellite}`}
      data={data as unknown as FeatureCollection}
      interactive={false}
      style={{ color: onSatellite ? '#ffffff' : '#1f2421', weight: 2, fill: false, dashArray: onSatellite ? undefined : '0' }}
    />
  )
}

function MapEvents({ onClick, onMove }: { onClick: (lat: number, lon: number) => void; onMove: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
    mousemove: (e) => onMove(e.latlng.lat, e.latlng.lng),
  })
  return null
}

// ---------- main component ----------

function ToolButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className="grid size-9 place-items-center text-ink-2 hover:bg-sunken hover:text-ink">
      {children}
    </button>
  )
}

interface DroughtMapProps {
  /** Tailwind height for the map canvas when not in fullscreen. */
  heightClass?: string
}

export function DroughtMap({ heightClass = 'h-[440px] md:h-[540px]' }: DroughtMapProps) {
  const { params, result, setLayer } = useAnalysis()
  const area = STUDY_AREAS.find((a) => a.district === params.district) ?? DEFAULT_AREA
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [rasterVisible, setRasterVisible] = useState(true)
  const [showBoundary, setShowBoundary] = useState(true)
  const [opacity, setOpacity] = useState(0.85)
  const [basemap, setBasemap] = useState<BasemapId>('light')
  const [rawSelection, setSelection] = useState<{ result: typeof result; value: PixelSelection } | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const readoutRef = useRef<HTMLSpanElement>(null)
  const reqId = useRef(0)

  const layers = result?.layers ?? []
  const activeDesc = rasterVisible ? layers.find((l) => l.id === params.layer) : undefined

  const handleClick = useCallback(
    async (lat: number, lon: number) => {
      const id = ++reqId.current
      setSelection({ result, value: { lat, lon, loading: true, info: null } })
      const info = await droughtApi.getPixelInfo(lat, lon, params).catch(() => null)
      if (id === reqId.current) setSelection({ result, value: { lat, lon, loading: false, info } })
    },
    [params, result],
  )

  const showCoords = useCallback((lat: number, lon: number) => {
    if (readoutRef.current) readoutRef.current.textContent = `${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`
  }, [])

  // A selection only belongs to the analysis result it was made against.
  const selection = rawSelection && rawSelection.result === result ? rawSelection.value : null

  useEffect(() => {
    const onChange = () => {
      setFullscreen(document.fullscreenElement === wrapRef.current)
      setTimeout(() => map?.invalidateSize(), 50)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [map])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void wrapRef.current?.requestFullscreen?.()
  }
  const resetView = () => map?.fitBounds(area.bounds, { padding: [24, 24] })

  return (
    <div ref={wrapRef} className={`grid overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-[minmax(0,1fr)_300px] ${fullscreen ? 'h-screen rounded-none' : ''}`}>
      <div className={`relative isolate ${fullscreen ? 'h-full' : heightClass}`}>
        <MapContainer
          ref={setMap}
          bounds={area.bounds}
          boundsOptions={{ padding: [24, 24] }}
          zoomControl={false}
          minZoom={5}
          maxZoom={14}
          className="map-crosshair h-full w-full"
          attributionControl
        >
          <TileLayer key={basemap} url={BASEMAPS[basemap].url} attribution={BASEMAPS[basemap].attribution} />
          {activeDesc && <RasterLayer desc={activeDesc} area={area} opacity={opacity} />}
          {showBoundary && <BoundaryLayer area={area} onSatellite={basemap === 'satellite'} />}
          {selection && (
            <CircleMarker center={[selection.lat, selection.lon]} radius={7} pathOptions={{ color: '#ffffff', weight: 2.5, fillColor: '#1f2421', fillOpacity: 1 }} />
          )}
          <MapEvents onClick={handleClick} onMove={showCoords} />
          <ScaleControl position="bottomright" imperial={false} />
        </MapContainer>

        {/* Toolbar */}
        <div className="absolute top-3 left-3 z-[500] flex flex-col overflow-hidden rounded-md border border-line bg-surface shadow-sm divide-y divide-line">
          <ToolButton label="Zoom in" onClick={() => map?.zoomIn()}>
            <Plus className="size-4" />
          </ToolButton>
          <ToolButton label="Zoom out" onClick={() => map?.zoomOut()}>
            <Minus className="size-4" />
          </ToolButton>
          <ToolButton label="Reset view to study area" onClick={resetView}>
            <Scan className="size-4" />
          </ToolButton>
          <ToolButton label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} onClick={toggleFullscreen}>
            {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </ToolButton>
        </div>

        {/* Layer switcher */}
        <div className="absolute top-3 right-3 z-[500]">
          <LayerSwitcher
            layers={layers}
            active={rasterVisible ? params.layer : null}
            onActive={(id) => {
              if (id && id !== 'boundary') {
                setLayer(id)
                setRasterVisible(true)
              } else setRasterVisible(false)
            }}
            showBoundary={showBoundary}
            onShowBoundary={setShowBoundary}
            opacity={opacity}
            onOpacity={setOpacity}
            basemap={basemap}
            onBasemap={setBasemap}
          />
        </div>

        {/* Demo watermark */}
        {activeDesc?.source === 'demo' && (
          <div className="pointer-events-none absolute top-3 left-16 z-[500] hidden md:block">
            <div className="flex items-center gap-1.5 rounded-full border border-demo/30 bg-[#fff8ec]/95 px-3 py-1 text-[11px] font-semibold text-demo shadow-sm">
              <FlaskConical className="size-3.5" /> DEMO RASTER · synthetic pattern, not MODIS output
            </div>
          </div>
        )}

        {/* Legend + coordinate readout */}
        <div className="absolute bottom-6 left-3 z-[500] flex flex-col items-start gap-2">
          {activeDesc && <MapLegend layer={params.layer} year={params.year} />}
          <span ref={readoutRef} className="tabular hidden rounded bg-surface/90 px-2 py-0.5 font-mono text-[10.5px] text-ink-2 shadow-sm md:inline">
            Move cursor over map
          </span>
        </div>
      </div>

      <aside className="border-t border-line lg:border-t-0 lg:border-l">
        {activeDesc?.source === 'demo' && (
          <p className="demo-stripes border-b border-demo/20 px-4 py-2 text-[11px] leading-snug text-[#6b4000] sm:hidden">
            Map raster is demo data (synthetic pattern).
          </p>
        )}
        <PixelInspector selection={selection} year={params.year} startYear={params.startYear} endYear={params.endYear} />
      </aside>
    </div>
  )
}
