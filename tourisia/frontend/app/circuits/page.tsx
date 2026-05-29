"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Loader2, MapPin, ArrowLeftRight, Search, X } from "lucide-react";
import { toast } from "sonner";

const CircuitsMap = dynamic(() => import("@/components/CircuitsMap"), { ssr: false });

const getFileUrl = (path: string) => {
  if (!path) return "";
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
};

const VILLES_BENIN = [
  "Cotonou", "Porto-Novo", "Parakou", "Abomey",
  "Natitingou", "Ouidah", "Bohicon", "Lokossa",
  "Abomey-Calavi", "Kandi", "Djougou", "Nikki",
  "Malanville", "Savalou", "Pobè", "Zagnanado",
  "Aéroport de Cotonou (COO)", "Gare de Cotonou",
];

const COORDS_VILLES: Record<string, [number, number]> = {
  "Cotonou":           [6.3654,  2.4183],
  "Porto-Novo":        [6.4969,  2.6289],
  "Parakou":           [9.3373,  2.6289],
  "Abomey":            [7.1828,  1.9913],
  "Natitingou":        [10.3076, 1.3800],
  "Ouidah":            [6.3536,  2.0833],
  "Bohicon":           [7.1667,  2.0667],
  "Lokossa":           [6.6333,  1.7167],
  "Abomey-Calavi":     [6.4270,  2.3456],
  "Kandi":             [11.1340, 2.9370],
  "Djougou":           [9.7085,  1.6660],
  "Nikki":             [9.9404,  3.2098],
  "Malanville":        [11.8687, 3.3893],
  "Savalou":           [7.9333,  1.9833],
  "Pobè":              [6.9667,  2.6667],
  "Zagnanado":         [7.2500,  2.3333],
  "Aéroport de Cotonou (COO)": [6.3572, 2.3844],
  "Gare de Cotonou":   [6.3630,  2.4260],
};

function getDistance(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}

export default function CircuitsPage() {
  const [offres, setOffres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"map" | "list">("map");

  const [depart, setDepart] = useState("");
  const [arrivee, setArrivee] = useState("");
  const [showDepartSug, setShowDepartSug] = useState(false);
  const [showAriveeSug, setShowAriveeSug] = useState(false);

  const coordDepart: [number, number] | null = COORDS_VILLES[depart] ?? null;
  const coordArrivee: [number, number] | null = COORDS_VILLES[arrivee] ?? null;
  const distance = coordDepart && coordArrivee ? getDistance(coordDepart, coordArrivee) : null;

  const departSugs = depart.length > 0
    ? VILLES_BENIN.filter(v => v.toLowerCase().includes(depart.toLowerCase()))
    : [];
  const arriveeSugs = arrivee.length > 0
    ? VILLES_BENIN.filter(v => v.toLowerCase().includes(arrivee.toLowerCase()))
    : [];

  const offresFiltrees = coordDepart && coordArrivee
    ? offres.filter(o => {
        const loc = (o.location ?? "").toLowerCase();
        return loc.includes(depart.toLowerCase()) || loc.includes(arrivee.toLowerCase());
      })
    : offres;

  useEffect(() => { fetchCircuits(); }, []);

  const fetchCircuits = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_offers.php?type=circuit`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setOffres(data.filter((o: any) => o.type === "circuit" || o.type === "circuits"));
      }
    } catch {
      toast.error("Erreur de chargement des circuits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative bg-[#2563eb]" style={{ overflow: "visible" }}>
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=2069&auto=format&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24 text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
              Circuits au Bénin
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 leading-relaxed">
              Découvrez les merveilles du Bénin à travers nos circuits guidés — explorez la carte pour trouver votre prochaine aventure.
            </p>
          </div>
        </section>

        {/* Toggle vue */}
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{offres.length}</span>{" "}
            circuit{offres.length !== 1 ? "s" : ""} disponible{offres.length !== 1 ? "s" : ""}
          </p>
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setView("map")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${view === "map" ? "bg-[#2563eb] text-white" : "bg-card text-muted-foreground hover:bg-muted"}`}
            >
              Carte
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${view === "list" ? "bg-[#2563eb] text-white" : "bg-card text-muted-foreground hover:bg-muted"}`}
            >
              Liste
            </button>
          </div>
        </div>

        {/* ── Barre de recherche itinéraire ── */}
        <div className="mx-auto max-w-7xl px-4 lg:px-8 pb-4">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

              {/* Départ */}
              <div className="relative flex-1">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]/20 transition-all">
                  <MapPin className="h-4 w-4 text-[#2563eb] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Départ</p>
                    <input
                      type="text"
                      value={depart}
                      onChange={e => { setDepart(e.target.value); setShowDepartSug(true); }}
                      onFocus={() => setShowDepartSug(true)}
                      onBlur={() => setTimeout(() => setShowDepartSug(false), 150)}
                      placeholder="Ville de départ..."
                      className="w-full text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                  {depart && (
                    <button onClick={() => setDepart("")} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {showDepartSug && departSugs.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-52 overflow-y-auto">
                    {departSugs.map(s => (
                      <button
                        key={s}
                        onMouseDown={() => { setDepart(s); setShowDepartSug(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#2563eb]/5 flex items-center gap-2 transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5 text-[#2563eb] shrink-0" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Swap */}
              <button
                onClick={() => { const tmp = depart; setDepart(arrivee); setArrivee(tmp); }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card hover:bg-[#2563eb]/5 hover:border-[#2563eb]/30 transition-all shrink-0 self-center mx-auto sm:mx-0"
                title="Inverser départ et arrivée"
              >
                <ArrowLeftRight className="h-4 w-4 text-[#2563eb]" />
              </button>

              {/* Arrivée */}
              <div className="relative flex-1">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/20 transition-all">
                  <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Arrivée</p>
                    <input
                      type="text"
                      value={arrivee}
                      onChange={e => { setArrivee(e.target.value); setShowAriveeSug(true); }}
                      onFocus={() => setShowAriveeSug(true)}
                      onBlur={() => setTimeout(() => setShowAriveeSug(false), 150)}
                      placeholder="Ville d'arrivée..."
                      className="w-full text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                  {arrivee && (
                    <button onClick={() => setArrivee("")} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {showAriveeSug && arriveeSugs.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-52 overflow-y-auto">
                    {arriveeSugs.map(s => (
                      <button
                        key={s}
                        onMouseDown={() => { setArrivee(s); setShowAriveeSug(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chercher / Effacer */}
              {depart || arrivee ? (
                <button
                  onClick={() => { setDepart(""); setArrivee(""); }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-muted-foreground hover:bg-muted transition-colors shrink-0"
                >
                  Effacer
                </button>
              ) : (
                <button className="flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-colors shrink-0">
                  <Search className="h-4 w-4" />
                  Chercher
                </button>
              )}
            </div>

            {/* Résumé du trajet */}
            {coordDepart && coordArrivee && (
              <div className="mt-3 flex flex-wrap items-center gap-3 bg-[#2563eb]/5 border border-[#2563eb]/20 rounded-xl px-4 py-2.5 text-sm">
                <span className="flex items-center gap-1.5">
                  <span>📍</span>
                  <span className="font-medium">{depart}</span>
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="flex items-center gap-1.5">
                  <span>🏁</span>
                  <span className="font-medium">{arrivee}</span>
                </span>
                <span className="ml-auto font-bold text-[#2563eb]">~{distance} km</span>
                <span className="text-muted-foreground text-xs hidden sm:inline">à vol d'oiseau</span>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 lg:px-8 pb-16">
          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
            </div>
          ) : view === "map" ? (
            <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
              <Suspense fallback={
                <div className="flex h-96 items-center justify-center bg-muted">
                  <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
                </div>
              }>
                <CircuitsMap
                  offres={offresFiltrees}
                  getFileUrl={getFileUrl}
                  coordDepart={coordDepart}
                  coordArrivee={coordArrivee}
                  depart={depart}
                  arrivee={arrivee}
                />
              </Suspense>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offresFiltrees.length === 0 ? (
                <div className="col-span-3 py-20 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-semibold">Aucun circuit disponible</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Revenez bientôt pour découvrir nos circuits.</p>
                </div>
              ) : (
                offresFiltrees.map((o) => (
                  <a
                    key={o.id}
                    href={`/offers/${o.id}`}
                    className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {o.images && o.images.length > 0 ? (
                        <img
                          src={getFileUrl(o.images[0])}
                          alt={o.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 rounded-md bg-[#2563eb]/90 px-2.5 py-1 text-xs font-semibold text-white capitalize shadow-sm">
                        Circuit
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground truncate">{o.title}</h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {o.location}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-[#2563eb]">{o.price}</span>
                          <span className="text-xs text-muted-foreground uppercase">{o.currency}</span>
                        </div>
                        <span className="text-xs font-semibold text-[#2563eb] hover:underline">
                          Voir l'offre →
                        </span>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
