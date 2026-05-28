import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef } from "react";

// Fix Leaflet's broken default icon path in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onChange }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      onChange?.({ lat, lng });
    },
  });
  return null;
}

/** Flies the map to a new center when the coords change. */
function FlyToCenter({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 14, { duration: 1.2 });
    }
  }, [center, map]);

  return null;
}

export default function BranchLocationPicker({ value, onChange, error }) {
  const [userCenter, setUserCenter] = useState(null);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState(false);

  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  // Keep refs up-to-date
  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
  }, [onChange, value]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      setLocationError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCenter(detected);
        setLocating(false);
        // Automatically set the form value if it hasn't been set yet
        if (!valueRef.current) {
          onChangeRef.current?.(detected);
        }
      },
      () => {
        setLocating(false);
        setLocationError(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  const position = value?.lat != null && value?.lng != null ? value : null;

  // Don't render the map until we've resolved the user's location (or failed)
  if (locating) {
    return (
      <div className="space-y-1.5">
        <label className="px-0.5 text-[13px] font-semibold text-text-secondary">Location</label>
        <div className="flex h-52 w-full items-center justify-center rounded-xl border border-border-form bg-gray-50">
          <p className="text-[12px] font-medium text-text-muted animate-pulse">
            Detecting your location…
          </p>
        </div>
      </div>
    );
  }

  // Use the selected position, or the detected user location, or a world-level fallback
  const initialCenter = position ?? userCenter ?? { lat: 0, lng: 0 };
  const initialZoom = position ? 14 : userCenter ? 13 : 2;

  return (
    <div className="space-y-1.5">
      <label className="px-0.5 text-[13px] font-semibold text-text-secondary">Location</label>
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={initialZoom}
        scrollWheelZoom={true}
        className="h-52 w-full rounded-xl border border-border-form"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        <FlyToCenter center={position} />
        {position ? <Marker position={[position.lat, position.lng]} /> : null}
      </MapContainer>

      {locationError ? (
        <p className="px-1 text-[11px] font-medium text-amber-600">
          Could not detect your location. Pan the map and click to set your branch.
        </p>
      ) : (
        <p className="px-1 text-[11px] font-medium text-text-tertiary">
          Click the map to pin your branch location.
        </p>
      )}

      {error ? (
        <p className="px-1 text-[11px] font-semibold text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
