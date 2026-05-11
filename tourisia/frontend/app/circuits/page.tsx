"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Loader2, MapPin, Map, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import type { CircuitOffer } from "@/components/CircuitsMap";

/* ── Carte chargée côté client uniquement (Leaflet ≠ SSR) ── */
const CircuitsMap = dynamic(() => import("@/components/CircuitsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-blue-50 rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
        <p className="text-sm text-muted-foreground">Chargement de la carte…</p>
      </div>
    </div>
  ),
});

export default function CircuitsPage() {
  const [offers, setOffers] = useState<CircuitOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_offers.php?type=circuit`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.offers ?? []);
        setOffers(list.filter((o: CircuitOffer) => o.type === "circuit" || !o.type));
      })
      .catch(() => setOffers([]))
      .finally(() => setIsLoading(false));
  }, []);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/backend/";

  const getImageUrl = (src?: string) => {
    if (!src) return "/images/placeholder-offer.jpg";
    if (src.startsWith("http")) return src;
    return `${API.replace(/\/+$/, "")}/../${src}`.replace(/([^:])\/\//g, "$1/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>

        {/* ── Hero ── */}
        <section className="bg-[#2563eb] pb-0">
          <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 lg:px-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Map className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Circuits au Bénin</h1>
            </div>
            <p className="text-sm text-white/80 max-w-xl">
              Explorez nos circuits touristiques par région. Cliquez sur un marker pour découvrir les offres disponibles dans chaque ville.
            </p>
          </div>
        </section>

        {/* ── Carte ── */}
        <section className="mx-auto max-w-7xl px-4 lg:px-8 -mt-0">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-border" style={{ height: "70vh" }}>
            {isLoading ? (
              <div className="flex h-full w-full items-center justify-center bg-blue-50">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
                  <p className="text-sm text-muted-foreground">Chargement des circuits…</p>
                </div>
              </div>
            ) : (
              <CircuitsMap offers={offers} />
            )}
          </div>

          {/* Légende */}
          <div className="mt-3 flex items-center gap-6 text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-[#2563eb]" />
              Marker = ville avec circuits
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">N</span>
              Badge rouge = plusieurs circuits
            </span>
            <span>Cliquez sur un marker pour voir les offres</span>
          </div>
        </section>

        {/* ── Liste des circuits ── */}
        <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isLoading ? "Chargement…" : `${offers.length} circuit${offers.length !== 1 ? "s" : ""} disponible${offers.length !== 1 ? "s" : ""}`}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Toutes les régions du Bénin</p>
            </div>
            <Link
              href="/offers?type=circuit"
              className="flex items-center gap-1.5 text-sm font-medium text-[#2563eb] hover:underline"
            >
              Voir en liste complète <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-1/3 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-border bg-card text-center">
              <Map className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">Aucun circuit disponible</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                Les partenaires n&apos;ont pas encore publié de circuits. Revenez bientôt !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {offers.map((offer) => {
                const imgSrc = getImageUrl(offer.images?.[0]);
                return (
                  <Link
                    key={offer.id}
                    href={`/offers?type=circuit`}
                    className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img
                        src={imgSrc}
                        alt={offer.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder-offer.jpg"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute top-3 left-3 rounded-full bg-[#2563eb] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        Circuit
                      </span>
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1 group-hover:text-[#2563eb] transition-colors">
                        {offer.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <MapPin className="h-3 w-3 shrink-0 text-[#2563eb]" />
                        {offer.location}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-muted-foreground">À partir de</p>
                          <p className="text-base font-bold text-[#2563eb]">
                            {Number(offer.prix).toLocaleString("fr-FR")}
                            <span className="text-xs font-normal text-muted-foreground ml-1">CFA</span>
                          </p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium text-foreground bg-muted rounded-full px-2.5 py-1 group-hover:bg-[#2563eb]/10 group-hover:text-[#2563eb] transition-colors">
                          Voir <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
}
