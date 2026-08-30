import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Nairobi-area points, illustrative only. Nothing in our data model has real
// coordinates - no address in Reflex has ever been geocoded - so this map is
// a genuine, real Leaflet + OpenStreetMap render, but the positions on it
// are fixed illustration, not derived from actual order/rider locations.
const ROUTE = [
  [-1.2833, 36.8172],
  [-1.2864, 36.823],
  [-1.2921, 36.8296],
  [-1.3, 36.835],
];

function riderIcon(color, label) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:600;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function destinationIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50% 50% 50% 0;background:#EF4444;transform:rotate(-45deg);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 16],
  });
}

export default function LiveMap({ riders = [] }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 relative" style={{ height: 260 }}>
      <MapContainer
        center={[-1.2905, 36.826]}
        zoom={13}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {riders.map((r, i) => {
          const pos = ROUTE[i % ROUTE.length];
          const initials = r.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0])
            .join("");
          return (
            <Marker key={r.id} position={pos} icon={riderIcon(r.color, initials)}>
              <Tooltip permanent direction="right" offset={[12, 0]} className="!text-xs !font-medium">
                {r.name}
              </Tooltip>
            </Marker>
          );
        })}
        <Marker position={ROUTE[ROUTE.length - 1]} icon={destinationIcon()} />
        <Polyline positions={ROUTE} pathOptions={{ color: "#16A34A", weight: 3, opacity: 0.75 }} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-[10px] text-slate-500 font-mono pointer-events-none">
        Illustrative positions, not live GPS
      </div>
    </div>
  );
}
