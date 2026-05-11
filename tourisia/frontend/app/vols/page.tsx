"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FlightSearchBar } from "@/components/FlightSearchBar";
import { FlightCard, Flight } from "@/components/FlightCard";
import { Loader2, Plane, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

const classOptions = ["Toutes", "Économique", "Premium Eco", "Affaires", "Première"];

export default function VolsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filtres
  const [filterEscales, setFilterEscales] = useState<"all" | "direct" | "1" | "2+">("all");
  const [filterClasse, setFilterClasse] = useState("Toutes");
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure">("price");

  const handleSearch = async (params: Record<string, string>) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}flights/get_flights.php?${qs}`);
      const data = await res.json();
      if (res.ok && data.flights) {
        setFlights(data.flights);
      } else {
        setFlights([]);
        toast.info(data.message || "Aucun vol trouvé pour ces critères.");
      }
    } catch {
      toast.error("Erreur de connexion au serveur.");
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = flights
    .filter((f) => {
      if (filterEscales === "direct") return f.escales === 0;
      if (filterEscales === "1") return f.escales === 1;
      if (filterEscales === "2+") return f.escales >= 2;
      return true;
    })
    .filter((f) => filterClasse === "Toutes" || f.classe === filterClasse)
    .sort((a, b) => {
      if (sortBy === "price") return Number(a.prix) - Number(b.prix);
      if (sortBy === "departure") return a.heure_depart.localeCompare(b.heure_depart);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative bg-[#2563eb]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074')] bg-cover bg-center opacity-15" />
          <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Recherche de Vols</h1>
            </div>
            <p className="text-sm text-white/80 max-w-xl mb-8">
              Trouvez les meilleurs vols pour votre destination. Comparez les prix, les horaires et les compagnies aériennes.
            </p>
            <FlightSearchBar onSearch={handleSearch} />
          </div>
        </section>

        {/* Résultats */}
        <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2563eb]/10 text-[#2563eb] mb-4">
                <Plane className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Trouvez votre vol idéal</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                Utilisez la barre de recherche ci-dessus pour trouver des vols selon votre destination et vos dates.
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
                <p className="text-sm text-muted-foreground">Recherche des meilleurs vols…</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar filtres */}
              <div className="lg:w-64 shrink-0">
                <div className="sticky top-20 rounded-2xl border border-border bg-card p-5 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-[#2563eb]" />
                      Filtres
                    </h3>
                    <button onClick={() => { setFilterEscales("all"); setFilterClasse("Toutes"); setSortBy("price"); }} className="text-xs text-[#2563eb] hover:underline">Réinitialiser</button>
                  </div>

                  {/* Escales */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Escales</p>
                    <div className="space-y-2">
                      {[["all", "Tous"], ["direct", "Direct"], ["1", "1 escale"], ["2+", "2+ escales"]].map(([val, label]) => (
                        <button key={val} onClick={() => setFilterEscales(val as any)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterEscales === val ? "bg-[#2563eb] text-white font-bold" : "hover:bg-muted text-foreground"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Classe */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Classe</p>
                    <div className="space-y-2">
                      {classOptions.map((c) => (
                        <button key={c} onClick={() => setFilterClasse(c)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterClasse === c ? "bg-[#2563eb] text-white font-bold" : "hover:bg-muted text-foreground"}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tri */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Trier par</p>
                    <div className="space-y-2">
                      {[["price", "Prix croissant"], ["departure", "Heure de départ"]].map(([val, label]) => (
                        <button key={val} onClick={() => setSortBy(val as any)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === val ? "bg-[#2563eb] text-white font-bold" : "hover:bg-muted text-foreground"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste vols */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold text-foreground">{filtered.length}</span> vol{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-border bg-card">
                    <Plane className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground">Aucun vol trouvé</h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                      Aucun vol ne correspond à vos critères. Essayez de modifier vos filtres.
                    </p>
                  </div>
                ) : (
                  filtered.map((flight) => <FlightCard key={flight.id} flight={flight} />)
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
