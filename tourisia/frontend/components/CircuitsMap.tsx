"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
// @ts-ignore — no type declarations for leaflet CSS side-effect import
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SHADOW = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
const BASE = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img";

const greenIcon = new L.Icon({
  iconUrl: `${BASE}/marker-icon-green.png`,
  iconRetinaUrl: `${BASE}/marker-icon-2x-green.png`,
  shadowUrl: SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const redIcon = new L.Icon({
  iconUrl: `${BASE}/marker-icon-red.png`,
  iconRetinaUrl: `${BASE}/marker-icon-2x-red.png`,
  shadowUrl: SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const villesBenin: Record<string, { lat: number; lng: number }> = {
  "Cotonou":         { lat: 6.3654,  lng: 2.4183 },
  "Porto-Novo":      { lat: 6.4969,  lng: 2.6289 },
  "Parakou":         { lat: 9.3373,  lng: 2.6289 },
  "Abomey":          { lat: 7.1828,  lng: 1.9913 },
  "Natitingou":      { lat: 10.3076, lng: 1.3800 },
  "Ouidah":          { lat: 6.3536,  lng: 2.0833 },
  "Abomey-Calavi":   { lat: 6.4270,  lng: 2.3456 },
  "AB-Calavi":       { lat: 6.4270,  lng: 2.3456 },
  "Bohicon":         { lat: 7.1727,  lng: 2.0712 },
  "Lokossa":         { lat: 6.6441,  lng: 1.7212 },
  "Djougou":         { lat: 9.7088,  lng: 1.6660 },
  "Kandi":           { lat: 11.1342, lng: 2.9393 },
  "Nikki":           { lat: 9.9404,  lng: 3.2098 },
  "Malanville":      { lat: 11.8687, lng: 3.3893 },
  "Savalou":         { lat: 7.9333,  lng: 1.9833 },
  "Pobè":            { lat: 6.9667,  lng: 2.6667 },
  "Zagnanado":       { lat: 7.2500,  lng: 2.3333 },
  "Aéroport de Cotonou (COO)": { lat: 6.3572, lng: 2.3844 },
  "Gare de Cotonou": { lat: 6.3630,  lng: 2.4260 },
};

function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length === 2) {
      map.fitBounds(coords as any, { padding: [50, 50] });
    }
  }, [coords, map]);
  return null;
}

interface Offre {
  id: number;
  title: string;
  location: string;
  price: string;
  currency: string;
  images?: string[];
}

interface Props {
  offres: Offre[];
  getFileUrl: (p: string) => string;
  coordDepart?: [number, number] | null;
  coordArrivee?: [number, number] | null;
  depart?: string;
  arrivee?: string;
}

export default function CircuitsMap({ offres, getFileUrl, coordDepart, coordArrivee, depart, arrivee }: Props) {
  return (
    <MapContainer
      center={[9.3077, 2.3158]}
      zoom={7}
      style={{ height: "70vh", width: "100%", borderRadius: "1rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Offer markers */}
      {offres.map((o) => {
        const ville = o.location?.split(",")[0]?.trim();
        const pos = villesBenin[ville] ?? { lat: 9.3077, lng: 2.3158 };
        return (
          <Marker key={o.id} position={[pos.lat, pos.lng]}>
            <Popup>
              <div style={{ width: 180, fontFamily: "sans-serif" }}>
                {o.images && o.images.length > 0 && (
                  <img
                    src={getFileUrl(o.images[0])}
                    alt={o.title}
                    style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6, marginBottom: 6 }}
                  />
                )}
                <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 2px" }}>{o.title}</p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 4px" }}>{o.location}</p>
                <p style={{ fontWeight: 700, color: "#2563eb", fontSize: 13, margin: "0 0 6px" }}>
                  {o.price} {o.currency}
                </p>
                <a href={`/offers/${o.id}`} style={{ color: "#2563eb", fontSize: 12, fontWeight: 600 }}>
                  Voir l'offre →
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Route: departure marker */}
      {coordDepart && (
        <Marker position={coordDepart} icon={greenIcon}>
          <Popup>
            <strong>📍 Départ</strong><br />{depart}
          </Popup>
        </Marker>
      )}

      {/* Route: arrival marker */}
      {coordArrivee && (
        <Marker position={coordArrivee} icon={redIcon}>
          <Popup>
            <strong>🏁 Arrivée</strong><br />{arrivee}
          </Popup>
        </Marker>
      )}

      {/* Route: dashed polyline + auto-fit */}
      {coordDepart && coordArrivee && (
        <>
          <Polyline
            positions={[coordDepart, coordArrivee]}
            color="#2563eb"
            weight={3}
            dashArray="8"
          />
          <FitBounds coords={[coordDepart, coordArrivee]} />
        </>
      )}
    </MapContainer>
  );
}
