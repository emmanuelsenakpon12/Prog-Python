"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icône Leaflet manquante (Next.js)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const villesBenin: Record<string, { lat: number; lng: number }> = {
  "Cotonou":       { lat: 6.3654,  lng: 2.4183 },
  "Porto-Novo":    { lat: 6.4969,  lng: 2.6289 },
  "Parakou":       { lat: 9.3373,  lng: 2.6289 },
  "Abomey":        { lat: 7.1828,  lng: 1.9913 },
  "Natitingou":    { lat: 10.3076, lng: 1.3800 },
  "Ouidah":        { lat: 6.3536,  lng: 2.0833 },
  "Abomey-Calavi": { lat: 6.4270,  lng: 2.3456 },
  "AB-Calavi":     { lat: 6.4270,  lng: 2.3456 },
  "Bohicon":       { lat: 7.1727,  lng: 2.0712 },
  "Lokossa":       { lat: 6.6441,  lng: 1.7212 },
  "Djougou":       { lat: 9.7088,  lng: 1.6660 },
  "Kandi":         { lat: 11.1342, lng: 2.9393 },
};

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
}

export default function CircuitsMap({ offres, getFileUrl }: Props) {
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
                <a
                  href={`/offers/${o.id}`}
                  style={{ color: "#2563eb", fontSize: 12, fontWeight: 600 }}
                >
                  Voir l'offre →
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
