"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import L, {
  latLngBounds,
  type LatLngBoundsExpression,
  type Map as LeafletMap,
} from "leaflet"
import "leaflet/dist/leaflet.css"
import { ArrowRight } from "lucide-react"
import { gpx } from "@tmcw/togeojson"
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "@/hooks/use-translations"
import type { LocationDetailsMap, RawSpeciesEntry } from "@/lib/types"

const DEFAULT_CENTER: [number, number] = [37.6364, -7.669]
const DEFAULT_ZOOM = 11

const LOCATIONS = [
  { name: "Azenhas do Guadiana", coords: [37.6462, -7.6525] as [number, number] },
  { name: "Ribeira de Oeiras", coords: [37.6253, -7.8103099] as [number, number] },
  { name: "Vila de Mértola", coords: [37.6372, -7.6633] as [number, number] },
]

const TRACKS = [
  {
    name: "PR3 MTL - As Margens do Guadiana",
    file: "/tracks/PR3%20MTL%20-%20As%20margens%20do%20Guadiana.gpx",
  },
  {
    name: "PR5 MTL - Ao Ritmo das Águas do Vascão",
    file: "/tracks/PR5%20MTL%20-%20Ao%20Ritmo%20das%20Águas%20do%20Vascão.gpx",
  },
  {
    name: "PR8 MTL - Moinho do Alferes um Percurso Ribeirinho",
    file: "/tracks/PR8%20MTL%20-%20Moinho%20do%20Alferes_%20um%20Percurso%20Ribeirinho.gpx",
  },
]

const TILE_LAYERS: Record<
  string,
  { name: string; url: string; attribution?: string }
> = {
  cartoLight: {
    name: "Carto Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://carto.com/attributions">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  cartoDark: {
    name: "Carto Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
  },
  esri: {
    name: "Esri Streets",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
}

type TrackGeometry = {
  coordinates: [number, number][][]
  bounds: LatLngBoundsExpression
}

L.Marker.prototype.options.icon = L.icon({
  iconUrl: "/images/marker.svg",
  iconRetinaUrl: "/images/marker.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 31],
  popupAnchor: [0, -28],
})

export default function MapPage() {
  const { t, language } = useTranslations("map")
  const [details, setDetails] = useState<LocationDetailsMap>({})
  const [species, setSpecies] = useState<RawSpeciesEntry[]>([])
  const [selectedTrack, setSelectedTrack] = useState<string>("all")
  const [baseLayer, setBaseLayer] = useState<keyof typeof TILE_LAYERS>("cartoLight")
  const [trackGeometries, setTrackGeometries] = useState<Record<string, TrackGeometry>>({})
  const mapRef = useRef<LeafletMap | null>(null)

  const fitToBounds = useCallback((bounds: LatLngBoundsExpression) => {
    if (mapRef.current && bounds) {
      mapRef.current.fitBounds(bounds, { padding: [80, 80] })
    }
  }, [])

  useEffect(() => {
    fetch("/api/details")
      .then((res) => res.json())
      .then((data: LocationDetailsMap) => setDetails(data))
      .catch((error) => console.error("Failed to load location details", error))

    fetch("/api/species")
      .then((res) => res.json())
      .then((data: RawSpeciesEntry[]) => setSpecies(data))
      .catch((error) => console.error("Failed to load species data", error))
  }, [])

  useEffect(() => {
    if (selectedTrack === "all") {
      fitToBounds(latLngBounds(LOCATIONS.map((location) => location.coords)))
      return
    }

    if (trackGeometries[selectedTrack]) {
      fitToBounds(trackGeometries[selectedTrack].bounds)
      return
    }

    const track = TRACKS.find((item) => item.name === selectedTrack)
    if (!track) return

    fetch(track.file)
      .then((res) => res.text())
      .then((text) => {
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, "application/xml")
        const geojson = gpx(xml)
        const coordinates: [number, number][][] = []

        geojson.features.forEach((feature) => {
          if (
            feature.geometry.type === "LineString" ||
            feature.geometry.type === "MultiLineString"
          ) {
            const lines =
              feature.geometry.type === "LineString"
                ? [feature.geometry.coordinates]
                : feature.geometry.coordinates
            lines.forEach((line) => {
              coordinates.push(
                line.map(([lng, lat]) => [lat, lng] as [number, number]),
              )
            })
          }
        })

        if (!coordinates.length) return

        const bounds = latLngBounds(coordinates.flat())
        setTrackGeometries((prev) => ({
          ...prev,
          [selectedTrack]: { coordinates, bounds },
        }))
        fitToBounds(bounds)
      })
      .catch((error) => console.error("Failed to load track", error))
  }, [selectedTrack, trackGeometries, fitToBounds])

  const locationDetails = useMemo(() => {
    return LOCATIONS.map((location) => {
      const entry = details[location.name]
      const description =
        entry?.[`description-${language}` as const] ??
        entry?.["description-PT"] ??
        ""
      return { ...location, description }
    })
  }, [details, language])

  const filteredSpecies = useMemo(() => {
    if (selectedTrack === "all") return []
    return species
      .filter((entry) => entry.association === selectedTrack)
      .slice(0, 5)
  }, [species, selectedTrack])

  const resetView = () => {
    setSelectedTrack("all")
    fitToBounds(latLngBounds(LOCATIONS.map((location) => location.coords)))
  }

  const trackCoordinates =
    selectedTrack !== "all"
      ? trackGeometries[selectedTrack]?.coordinates ?? []
      : []

  const handleMapReady = useCallback(
    (map: LeafletMap) => {
      mapRef.current = map
      fitToBounds(latLngBounds(LOCATIONS.map((location) => location.coords)))
    },
    [fitToBounds],
  )

  return (
    <div className="space-y-8">
      <HeaderSection
        title={t("title")}
        description={t(
          "description",
          "Explore trilhos, localizações e espécies sonoras do Parque Natural do Vale do Guadiana.",
        )}
        selectedTrack={selectedTrack}
        onTrackChange={setSelectedTrack}
        onReset={resetView}
      />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="relative min-h-[540px] overflow-hidden rounded-lg border border-border/40 bg-muted/10">
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              scrollWheelZoom
              className="h-full w-full"
            >
              <MapInitializer onReady={handleMapReady} />
              <TileLayer
                url={TILE_LAYERS[baseLayer].url}
                attribution={TILE_LAYERS[baseLayer].attribution}
              />

              {locationDetails.map((location) => (
                <Marker key={location.name} position={location.coords}>
                  <Popup>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="rounded-none bg-foreground text-background">
                          {t("location_badge", "Local")}
                        </Badge>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em]">
                          {location.name}
                        </h3>
                      </div>
                      <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                        {location.description}
                      </p>
                      <Button asChild variant="outline" className="w-full border-border/60 uppercase">
                        <Link href={`/recordings?location=${encodeURIComponent(location.name)}`}>
                          {t("view_recordings")}
                        </Link>
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {trackCoordinates.map((line, index) => (
                <Polyline
                  key={`${selectedTrack}-${index}`}
                  positions={line}
                  pathOptions={{ color: "#0d0d0d", weight: 5, opacity: 0.9 }}
                />
              ))}

              <MapViewportSync boundsKey={`${selectedTrack}-${baseLayer}`} />
              <TileLayerControls
                baseLayer={baseLayer}
                onChange={setBaseLayer}
                tileLayers={TILE_LAYERS}
              />
              <ZoomControls />
              <LocateButton />
            </MapContainer>
          </div>

          <SpeciesSidebar
            selectedTrack={selectedTrack}
            speciesList={filteredSpecies}
            language={language}
            translate={t}
          />
        </div>
    </div>
  )
}

function HeaderSection({
  title,
  description,
  selectedTrack,
  onTrackChange,
  onReset,
}: {
  title: string
  description: string
  selectedTrack: string
  onTrackChange: (value: string) => void
  onReset: () => void
}) {
  const { t } = useTranslations("map")

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold uppercase tracking-[0.35em] text-foreground">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            {t("selectlocation")}
          </label>
          <Select value={selectedTrack} onValueChange={onTrackChange}>
            <SelectTrigger className="w-64 border-border/60 uppercase">
              <SelectValue placeholder={t("selectlocation")} />
            </SelectTrigger>
            <SelectContent className="border-border/40 bg-background">
              <SelectItem value="all" className="uppercase">
                {t("allloc", "Todas as localizações")}
              </SelectItem>
              {LOCATIONS.map((location) => (
                <SelectItem key={location.name} value={location.name} className="uppercase">
                  {location.name}
                </SelectItem>
              ))}
              {TRACKS.map((track) => (
                <SelectItem key={track.name} value={track.name} className="uppercase">
                  {track.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" className="border-border/60 uppercase" onClick={onReset}>
          {t("reset_view", "Repor vista")}
        </Button>
      </div>
    </div>
  )
}

function MapInitializer({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap() as unknown as LeafletMap

  useEffect(() => {
    onReady(map)
  }, [map, onReady])

  return null
}

function MapViewportSync({ boundsKey }: { boundsKey: string }) {
  const map = useMap() as unknown as LeafletMap

  useEffect(() => {
    map.invalidateSize()
  }, [map, boundsKey])

  return null
}

function TileLayerControls({
  baseLayer,
  onChange,
  tileLayers,
}: {
  baseLayer: keyof typeof TILE_LAYERS
  onChange: (value: keyof typeof TILE_LAYERS) => void
  tileLayers: typeof TILE_LAYERS
}) {
  return (
    <div className="absolute left-3 top-3 z-[1000] flex flex-col gap-2 rounded-md border border-border/40 bg-background/90 p-3 uppercase">
      <p className="text-[11px] font-semibold tracking-[0.3em] text-muted-foreground">
        Map
      </p>
      <div className="grid gap-2 text-xs tracking-[0.25em]">
        {Object.entries(tileLayers).map(([key, layer]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key as keyof typeof TILE_LAYERS)}
            className={`flex items-center justify-between border px-3 py-2 transition-colors ${
              baseLayer === key
                ? "border-foreground bg-foreground text-background"
                : "border-border/40 text-muted-foreground hover:border-foreground"
            }`}
          >
            <span>{layer.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ZoomControls() {
  const map = useMap() as unknown as LeafletMap
  return (
    <div className="absolute right-3 top-3 z-[1000] flex flex-col rounded-md border border-border/40 bg-background/90">
      <Button
        variant="ghost"
        className="h-10 w-10 rounded-none border-b border-border/40 text-lg font-semibold"
        onClick={() => map.zoomIn()}
        aria-label="Zoom in"
      >
        +
      </Button>
      <Button
        variant="ghost"
        className="h-10 w-10 rounded-none text-lg font-semibold"
        onClick={() => map.zoomOut()}
        aria-label="Zoom out"
      >
        −
      </Button>
    </div>
  )
}

function LocateButton() {
  const map = useMap() as unknown as LeafletMap
  const [tracking, setTracking] = useState(false)
  const [position, setPosition] = useState<L.LatLng | null>(null)

  useEffect(() => {
    if (!tracking) return

    const handleFound = (event: L.LocationEvent) => {
      setPosition(event.latlng)
    }

    const handleError = () => {
      setTracking(false)
      setPosition(null)
    }

    map.on("locationfound", handleFound)
    map.on("locationerror", handleError)
    map.locate({ setView: true, maxZoom: 15, watch: true })

    return () => {
      map.stopLocate()
      map.off("locationfound", handleFound)
      map.off("locationerror", handleError)
    }
  }, [map, tracking])

  const toggleTracking = () => {
    if (tracking) {
      setTracking(false)
      setPosition(null)
      map.stopLocate()
    } else {
      setTracking(true)
    }
  }

  return (
    <div className="absolute right-3 bottom-3 z-[1000] flex rounded-md border border-border/40 bg-background/90">
      <Button
        variant={tracking ? "default" : "ghost"}
        className="h-10 w-10 rounded-none"
        onClick={toggleTracking}
        aria-label="Toggle location tracking"
      >
        {position ? "●" : "◎"}
      </Button>
    </div>
  )
}

function SpeciesSidebar({
  selectedTrack,
  speciesList,
  language,
  translate,
}: {
  selectedTrack: string
  speciesList: RawSpeciesEntry[]
  language: string
  translate: (key: string, fallback?: string) => string
}) {
  return (
    <aside className="space-y-6 rounded-lg border border-border/40 bg-muted/10 p-6">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          {selectedTrack === "all"
            ? translate(
                "side_panel_title_all",
                "Escolha um trilho para ver detalhes",
              )
            : translate("side_panel_title_track", "Espécies em destaque")}
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {selectedTrack === "all"
            ? translate(
                "side_panel_description_all",
                "Explore os diferentes trilhos e localizações usando os controlos acima.",
              )
            : translate(
                "side_panel_description",
                "Algumas espécies emblemáticas que pode ouvir neste percurso.",
              )}
        </p>
      </div>
      {selectedTrack === "all" ? (
        <div className="text-xs text-muted-foreground">
          <p>
            {translate(
              "map_instructions",
              "Utilize a seleção para centrar o mapa num trilho ou local.",
            )}
          </p>
          <p className="mt-2">
            {translate(
              "map_instructions_secondary",
              "O botão de localização mostra a sua posição aproximada para facilitar a navegação.",
            )}
          </p>
        </div>
      ) : speciesList.length ? (
        <ul className="space-y-4">
          {speciesList.map((entry) => (
            <li
              key={entry.id}
              className="space-y-1 border-b border-border/20 pb-4 last:border-none"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em]">
                    {language === "PT" ? entry["nome-PT"] : entry["nome-EN"]}
                  </p>
                  <p className="text-xs italic text-muted-foreground">
                    {entry.scientific_name}
                  </p>
                </div>
                <Link
                  href={`/species/${encodeURIComponent(entry["nome-PT"])}`}
                  className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {translate("view_species", "Ver")}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                <span>
                  {language === "PT"
                    ? entry["quando-PT"]
                    : entry["quando-EN"] ?? entry.epocaEN}
                </span>
                <span>•</span>
                <span>
                  {language === "PT" ? entry["grupo-PT"] : entry["grupo-EN"]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          {translate(
            "no_species",
            "Ainda não há espécies em destaque para este percurso.",
          )}
        </p>
      )}
    </aside>
  )
}
