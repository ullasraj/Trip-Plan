"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapRouteProps {
  dayPlan: any;
}

function MapUpdater({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  return null;
}

export default function MapRoute({ dayPlan }: MapRouteProps) {
  if (!dayPlan || !dayPlan.activities || dayPlan.activities.length === 0) return null;

  const positions: [number, number][] = dayPlan.activities
      .filter((a: any) => a.coordinates && a.coordinates.lat && a.coordinates.lng)
      .map((a: any) => [a.coordinates.lat, a.coordinates.lng]);

  const center = positions.length > 0 ? positions[0] : [0, 0];

  const createNumberedIcon = (number: number) => {
    return L.divIcon({
      className: "custom-numbered-marker",
      html: `<div style="background-color: var(--accent-color); color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; justify-content: center; align-items: center; font-weight: bold; font-family: sans-serif; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 14px;">${number}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  return (
    <div style={{ height: "100%", minHeight: "500px", width: "100%", borderRadius: "16px", overflow: "hidden", border: "1px solid var(--border-color)", zIndex: 1 }}>
      <MapContainer center={center as [number, number]} zoom={13} style={{ height: "100%", width: "100%", zIndex: 1 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {dayPlan.activities.map((activity: any, idx: number) => {
          if (!activity.coordinates) return null;
          return (
            <Marker key={idx} position={[activity.coordinates.lat, activity.coordinates.lng]} icon={createNumberedIcon(idx + 1)}>
              <Popup>
                <strong>{idx + 1}. {activity.name}</strong><br/>
                {activity.start_time} - {activity.end_time}
              </Popup>
            </Marker>
          );
        })}
        {positions.length > 1 && <Polyline positions={positions} color="var(--accent-color)" weight={4} opacity={0.7} />}
        <MapUpdater coordinates={positions} />
      </MapContainer>
    </div>
  );
}
