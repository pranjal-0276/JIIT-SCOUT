import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { Location } from "@/lib/types";

// Fix default marker icons in Leaflet + Vite
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const highlightIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:hsl(231,70%,56%);width:18px;height:18px;border-radius:9999px;border:3px solid white;box-shadow:0 0 0 3px hsl(231 70% 56% / 0.4)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 18);
    } else {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

interface Props {
  locations: Location[];
  highlightId?: string | null;
  route?: Location[];
  onSelect?: (loc: Location) => void;
  height?: string;
}

export const CampusMap = ({ locations, highlightId, route, onSelect, height = "500px" }: Props) => {
  const center = useMemo<[number, number]>(() => {
    if (locations.length > 0) return [locations[0].latitude, locations[0].longitude];
    return [28.6019, 77.3614]; // JIIT Noida default
  }, [locations]);

  const routePoints = useMemo<[number, number][]>(
    () => (route ?? []).map((l) => [l.latitude, l.longitude]),
    [route]
  );

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden border border-border shadow-card">
      <MapContainer center={center} zoom={17} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={highlightId === loc.id ? highlightIcon : defaultIcon}
            eventHandlers={{ click: () => onSelect?.(loc) }}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{loc.name}</div>
                {loc.description && <div className="text-xs text-muted-foreground">{loc.description}</div>}
                <div className="text-xs uppercase tracking-wide text-primary">{loc.category}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {routePoints.length > 1 && (
          <Polyline positions={routePoints} pathOptions={{ color: "hsl(231, 70%, 56%)", weight: 5, opacity: 0.8 }} />
        )}
        {(routePoints.length > 0 || highlightId) && (
          <FitBounds
            points={
              routePoints.length > 0
                ? routePoints
                : locations.filter((l) => l.id === highlightId).map((l) => [l.latitude, l.longitude] as [number, number])
            }
          />
        )}
      </MapContainer>
    </div>
  );
};