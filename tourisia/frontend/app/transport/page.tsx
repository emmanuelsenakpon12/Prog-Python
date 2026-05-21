"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TransportSearchBar } from "@/components/TransportSearchBar";
import {
  Car, MapPin, Users, Wind, Star, Loader2, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const getFileUrl = (path: string) => {
  if (!path) return "";
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
};

function VehicleCard({ offer }: { offer: any }) {
  const images = offer.images ?? [];
  const details = offer.details ?? {};

  return (
    <div className="group flex flex-col sm:flex-row gap-0 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
      {/* Photo */}
      <div className="relative sm:w-64 aspect-[4/3] sm:aspect-auto shrink-0 overflow-hidden bg-gray-100">
        {images.length > 0 ? (
          <img
            src={getFileUrl(images[0])}
            alt={offer.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Car className="h-16 w-16 text-gray-300" />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-md bg-[#F5A623] px-2.5 py-1 text-xs font-bold text-white shadow">
          Transport
        </span>
      </div>

      {/* Infos */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{offer.title}</h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#F5A623]" />
              <span className="truncate">{offer.location}</span>
            </div>
          </div>
          {/* Prix */}
          <div className="text-right shrink-0">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-2xl font-extrabold text-[#003580]">{offer.price}</span>
              <span className="text-xs font-semibold text-gray-500 uppercase">{offer.currency}</span>
            </div>
            <span className="text-xs text-gray-400">/ jour</span>
          </div>
        </div>

        {/* Description */}
        {offer.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">{offer.description}</p>
        )}

        {/* Caractéristiques */}
        {Object.keys(details).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(details).slice(0, 4).map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
              >
                {key === "places" || key === "passagers" ? <Users className="h-3 w-3 text-[#F5A623]" /> : <Wind className="h-3 w-3 text-[#F5A623]" />}
                {key} : {String(val)}
              </span>
            ))}
          </div>
        )}

        {/* Bouton réserver */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-700">4.5</span>
            <span>· Nouveau</span>
          </div>
          <a
            href={`/offers?type=transport`}
            className="flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-colors"
          >
            Réserver
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TransportPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMeta, setSearchMeta] = useState<{
    lieu: string; date_prise: string; date_retour: string;
  } | null>(null);

  /* Chargement initial de tous les véhicules transport */
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}transport/search.php`);
      const data = await res.json();
      if (Array.isArray(data)) setResults(data);
    } catch {
      toast.error("Erreur de chargement des véhicules.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (params: {
    lieu: string; date_prise: string; heure_prise: string;
    date_retour: string; heure_retour: string;
  }) => {
    setIsLoading(true);
    setHasSearched(true);
    setSearchMeta({ lieu: params.lieu, date_prise: params.date_prise, date_retour: params.date_retour });
    try {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}transport/search.php${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      if (Array.isArray(data)) setResults(data);
      else { setResults([]); toast.info("Aucun véhicule disponible pour ces critères."); }
    } catch {
      toast.error("Erreur lors de la recherche.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative" style={{ overflow: "visible" }}>
          {/* Fond + image de bannière */}
          <div className="relative bg-[#2563eb] py-12 lg:py-16" style={{ overflow: "visible" }}>
            {/* Image d'arrière-plan */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1485291571150-772bcfc10da5?q=80&w=2070&auto=format&fit=crop')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.40,
              }}
            />

            <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
              {/* Titre */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 mb-4">
                  <Car className="h-4 w-4 text-[#F5A623]" />
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Location de véhicules</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl text-balance leading-tight">
                  Trouvez le véhicule{" "}
                  <span className="text-[#F5A623]">parfait</span>
                </h1>
                <p className="mt-3 max-w-xl mx-auto text-sm text-white/70 leading-relaxed">
                  Voitures, motos, minibus — comparez et réservez en quelques clics.
                </p>
              </div>

              {/* ── Barre de recherche jaune ── */}
              <div style={{ overflow: "visible", position: "relative", zIndex: 50 }}>
                <TransportSearchBar onSearch={handleSearch} isLoading={isLoading} />
              </div>
            </div>
          </div>

          {/* Vague décorative */}
          <div className="h-8 bg-[#2563eb]" style={{ clipPath: "ellipse(60% 100% at 50% 0%)" }} />
        </section>

        {/* ── Résultats ── */}
        <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
          {/* En-tête résultats */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              {hasSearched && searchMeta ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900">
                    {results.length} véhicule{results.length !== 1 ? "s" : ""} disponible{results.length !== 1 ? "s" : ""}
                    {searchMeta.lieu ? ` à ${searchMeta.lieu}` : ""}
                  </h2>
                  {searchMeta.date_prise && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      Du <strong>{searchMeta.date_prise}</strong>
                      {searchMeta.date_retour ? ` au <strong>${searchMeta.date_retour}</strong>` : ""}
                    </p>
                  )}
                </>
              ) : (
                <h2 className="text-xl font-bold text-gray-900">
                  Tous nos véhicules disponibles
                  <span className="ml-2 text-base font-normal text-gray-500">({results.length})</span>
                </h2>
              )}
            </div>
          </div>

          {/* Cartes */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#003580]" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Car className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-gray-800">Aucun véhicule trouvé</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-xs">
                Modifiez vos critères de recherche ou consultez toutes nos offres.
              </p>
              <button
                onClick={fetchAll}
                className="mt-6 rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-colors"
              >
                Voir tous les véhicules
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {results.map((offer) => (
                <VehicleCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
