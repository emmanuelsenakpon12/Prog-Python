"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

/* ── Coordonnées des villes du Bénin ── */
const VILLES_BENIN: Record<string, { lat: number; lng: number }> = {
  "Cotonou":        { lat: 6.3654,  lng: 2.4183 },
  "Porto-Novo":     { lat: 6.4969,  lng: 2.6289 },
  "Parakou":        { lat: 9.3373,  lng: 2.6289 },
  "Abomey":         { lat: 7.1828,  lng: 1.9913 },
  "Natitingou":     { lat: 10.3076, lng: 1.3800 },
  "Ouidah":         { lat: 6.3536,  lng: 2.0833 },
  "Bohicon":        { lat: 7.1667,  lng: 2.0667 },
  "Lokossa":        { lat: 6.6333,  lng: 1.7167 },
  "Abomey-Calavi":  { lat: 6.4270,  lng: 2.3456 },
  "Djougou":        { lat: 9.7083,  lng: 1.6667 },
  "Kandi":          { lat: 11.1340, lng: 2.9387 },
  "Nikki":          { lat: 9.9407,  lng: 3.2098 },
  "Savalou":        { lat: 7.9247,  lng: 1.9761 },
  "Dassa-Zoumè":    { lat: 7.7667,  lng: 2.1833 },
  "Pendjari":       { lat: 11.2667, lng: 1.5000 },
  "Bénin":          { lat: 9.3077,  lng: 2.3158 },
};

/* ── Icône pin personnalisée (pas besoin de fichiers PNG) ── */
function makePinIcon(count?: number) {
  const badge = count && count > 1
    ? `<span style="position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;border-radius:9999px;font-size:10px;font-weight:700;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;padding:0 3px">${count}</span>`
    : "";
  return new L.DivIcon({
    html: `<div style="position:relative;display:inline-block">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 24 16 24s16-13.5 16-24C32 7.163 24.837 0 16 0z"
              fill="#2563eb" stroke="white" stroke-width="1.5"/>
        <circle cx="16" cy="15" r="6" fill="white"/>
        <path d="M16 12 L16 18 M13 15 L19 15" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      ${badge}
    </div>`,
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -42],
  });
}

/* ── Composant pour fixer le viewport Leaflet ── */
function MapBounds({ offers }: { offers: CircuitOffer[] }) {
  const map = useMap();
  useEffect(() => {
    if (offers.length > 0) {
      const coords = offers
        .map((o) => getCoords(o.location))
        .filter(Boolean) as [number, number][];
      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords.map(([lat, lng]) => L.latLng(lat, lng)));
        map.fitBounds(bounds.pad(0.2), { maxZoom: 9 });
      }
    }
  }, [offers, map]);
  return null;
}

function getCoords(location: string): [number, number] | null {
  if (!location) return null;
  const normalised = Object.keys(VILLES_BENIN).find(
    (v) => location.toLowerCase().includes(v.toLowerCase()),
  );
  if (normalised) {
    const { lat, lng } = VILLES_BENIN[normalised];
    return [lat, lng];
  }
  return null;
}

/* ── Types ── */
export interface CircuitOffer {
  id: number | string;
  title: string;
  location: string;
  prix: number | string;
  images?: string[];
  type: string;
}

interface CircuitsMapProps {
  offers: CircuitOffer[];
}

/* ── Composant principal ── */
export default function CircuitsMap({ offers }: CircuitsMapProps) {
  /* Regrouper les offres par ville pour éviter les markers superposés */
  const byLocation: Record<string, CircuitOffer[]> = {};
  for (const offer of offers) {
    const key = offer.location?.trim() || "Bénin";
    if (!byLocation[key]) byLocation[key] = [];
    byLocation[key].push(offer);
  }

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/backend/";

  const getImageUrl = (src?: string) => {
    if (!src) return "/images/placeholder-offer.jpg";
    if (src.startsWith("http")) return src;
    return `${API.replace(/\/+$/, "")}/../${src}`.replace(/([^:])\/\//g, "$1/");
  };

  return (
    <MapContainer
      center={[9.3077, 2.3158]}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {offers.length > 0 && <MapBounds offers={offers} />}

      {Object.entries(byLocation).map(([location, group]) => {
        const coords = getCoords(location);
        if (!coords) return null;
        const [lat, lng] = coords;
        const first = group[0];
        const imgSrc = getImageUrl(first.images?.[0]);

        return (
          <Marker
            key={location}
            position={[lat, lng]}
            icon={makePinIcon(group.length)}
          >
            <Popup minWidth={220} maxWidth={260}>
              <div className="text-sm" style={{ fontFamily: "inherit" }}>
                {/* Image */}
                <div style={{ margin: "-12px -16px 10px", overflow: "hidden", borderRadius: "8px 8px 0 0", height: 100 }}>
                  <img
                    src={imgSrc}
                    alt={first.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder-offer.jpg"; }}
                  />
                </div>

                {group.length === 1 ? (
                  /* Affichage unique */
                  <>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, color: "#111827" }}>{first.title}</p>
                    <p style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>📍 {first.location}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", marginBottom: 8 }}>
                      {Number(first.prix).toLocaleString("fr-FR")} CFA
                    </p>
                    <Link
                      href={`/offers?type=circuit&id=${first.id}`}
                      style={{ display: "block", textAlign: "center", background: "#2563eb", color: "white", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                    >
                      Voir le circuit →
                    </Link>
                  </>
                ) : (
                  /* Plusieurs offres à cette ville */
                  <>
                    <p style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 4 }}>
                      {group.length} circuits à {location}
                    </p>
                    <div style={{ maxHeight: 120, overflowY: "auto", marginBottom: 8 }}>
                      {group.map((o) => (
                        <div key={o.id} style={{ padding: "4px 0", borderBottom: "1px solid #f3f4f6" }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: 0 }}>{o.title}</p>
                          <p style={{ fontSize: 11, color: "#2563eb", fontWeight: 700, margin: 0 }}>
                            {Number(o.prix).toLocaleString("fr-FR")} CFA
                          </p>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/offers?type=circuit"
                      style={{ display: "block", textAlign: "center", background: "#2563eb", color: "white", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                    >
                      Voir tous les circuits →
                    </Link>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Marker centre Bénin si aucune offre */}
      {offers.length === 0 && (
        <Marker position={[9.3077, 2.3158]} icon={makePinIcon()}>
          <Popup>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Aucun circuit disponible pour l&apos;instant.</p>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
