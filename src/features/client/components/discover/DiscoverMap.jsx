import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MARKER_COLOR = "#3b82f6";

function createMarkerIcon(color, isSelected = false) {
  const size = isSelected ? 36 : 28;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="3" 
        ${isSelected ? 'filter="drop-shadow(0 2px 6px rgba(0,0,0,0.35))"' : 'filter="drop-shadow(0 1px 3px rgba(0,0,0,0.2))"'} />
      <circle cx="12" cy="12" r="4" fill="white" opacity="0.9" />
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const userIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="8" fill="#3b82f6" stroke="white" stroke-width="3"
        filter="drop-shadow(0 1px 4px rgba(59,130,246,0.5))" />
    </svg>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function formatDistance(km) {
  if (km == null || km <= 0) return null;
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

function ProviderMapPopup({ provider, onSelect }) {
  const distanceLabel = formatDistance(provider.distanceKm);

  return (
    <div className="min-w-[200px] max-w-[240px]">
      <p className="text-[14px] font-bold leading-snug text-text-primary">
        {provider.businessName}
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-text-tertiary">{provider.address}</p>

      <div className="mt-2.5 space-y-1.5 border-t border-gray-100 pt-2.5 text-[12px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted">Rating</span>
          <span className="font-semibold text-text-primary">
            {provider.avgRating > 0 ? (
              <>★ {provider.avgRating.toFixed(1)}</>
            ) : (
              "—"
            )}
            {provider.reviewCount > 0 && (
              <span className="ml-1 font-normal text-text-muted">
                ({provider.reviewCount})
              </span>
            )}
          </span>
        </div>

        {distanceLabel && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-muted">Distance</span>
            <span className="font-semibold text-text-primary">{distanceLabel}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <span className="text-text-muted">Status</span>
          <span className={`font-semibold ${provider.isOpen ? "text-emerald-600" : "text-red-500"}`}>
            {provider.isOpen
              ? provider.operatingHoursToday
                ? `Open · ${provider.operatingHoursToday}`
                : "Open now"
              : provider.operatingHoursToday
              ? `Closed · ${provider.operatingHoursToday}`
              : "Closed"}
          </span>
        </div>
      </div>

      {/* View in list — scrolls the card into view */}
      <button
        type="button"
        onClick={() => onSelect?.(provider.id)}
        className="mt-3 w-full rounded-lg bg-brand-500 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-600 transition-colors"
      >
        View details ↓
      </button>
    </div>
  );
}

function ProviderMarker({ provider, isSelected, onSelect }) {
  const markerRef = useRef(null);
  const icon = useMemo(
    () => createMarkerIcon(MARKER_COLOR, isSelected),
    [isSelected]
  );

  useEffect(() => {
    if (isSelected && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isSelected]);

  return (
    <Marker
      ref={markerRef}
      position={[provider.lat, provider.lng]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{
        click: () => {
          onSelect?.(provider.id);
          markerRef.current?.openPopup();
        },
      }}
    >
      <Popup closeButton className="provider-map-popup">
        <ProviderMapPopup provider={provider} onSelect={onSelect} />
      </Popup>
    </Marker>
  );
}

function FitBounds({ providers, userLocation }) {
  const map = useMap();

  useEffect(() => {
    const points = providers
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => [p.lat, p.lng]);

    if (userLocation) {
      points.push([userLocation.lat, userLocation.lng]);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [providers, userLocation, map]);

  return null;
}

function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 shadow-lg ring-1 ring-black/5 backdrop-blur-sm">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: MARKER_COLOR }} />
      <span className="text-[11px] font-semibold text-text-secondary">Providers</span>
    </div>
  );
}

function ZoomControl() {
  const map = useMap();
  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-1">
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => map.zoomIn()}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-black/5 text-text-tertiary hover:bg-surface-hover transition-colors text-lg font-bold"
      >
        +
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => map.zoomOut()}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md ring-1 ring-black/5 text-text-tertiary hover:bg-surface-hover transition-colors text-lg font-bold"
      >
        −
      </button>
    </div>
  );
}

export default function DiscoverMap({
  providers = [],
  userLocation,
  selectedId,
  onSelectProvider,
}) {
  // Only providers that have valid coordinates
  const mappableProviders = useMemo(
    () => providers.filter((p) => p.lat != null && p.lng != null),
    [providers]
  );

  const center = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lng];
    if (mappableProviders.length > 0) return [mappableProviders[0].lat, mappableProviders[0].lng];
    return null;
  }, [mappableProviders, userLocation]);

  if (!center) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-xl bg-surface-hover text-center ring-1 ring-black/5">
        <p className="max-w-xs text-[13px] font-medium text-text-tertiary">
          Map location is unavailable for these results.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[400px] w-full overflow-hidden rounded-xl ring-1 ring-black/5">
      <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-lg bg-white/95 px-3 py-1.5 shadow-md ring-1 ring-black/5 backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[11px] font-semibold text-text-primary">
          Live{userLocation ? " · Near you" : ""}
        </span>
      </div>

      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
        style={{ minHeight: "400px" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl />
        <FitBounds providers={mappableProviders} userLocation={userLocation} />

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>Your location</Popup>
            </Marker>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={5000}
              pathOptions={{
                color: "#3b82f6",
                weight: 1,
                fillColor: "#3b82f6",
                fillOpacity: 0.06,
              }}
            />
          </>
        )}

        {mappableProviders.map((provider) => (
          <ProviderMarker
            key={provider.id}
            provider={provider}
            isSelected={provider.id === selectedId}
            onSelect={onSelectProvider}
          />
        ))}
      </MapContainer>

      <MapLegend />
    </div>
  );
}
