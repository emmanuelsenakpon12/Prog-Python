"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Loader2, MapPin, Star, Heart } from "lucide-react";
import { toast } from "sonner";

const CircuitsMap = dynamic(() => import("@/components/CircuitsMap"), { ssr: false });

const getFileUrl = (path: string) => {
  if (!path) return "";
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
};

export default function CircuitsPage() {
  const [offres, setOffres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"map" | "list">("map");

  useEffect(() => {
    fetchCircuits();
  }, []);

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
        <section className="relative overflow-hidden bg-[#2563eb]">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=2069&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }} />
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
            <span className="font-semibold text-foreground">{offres.length}</span> circuit{offres.length !== 1 ? "s" : ""} disponible{offres.length !== 1 ? "s" : ""}
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
                <CircuitsMap offres={offres} getFileUrl={getFileUrl} />
              </Suspense>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offres.length === 0 ? (
                <div className="col-span-3 py-20 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <h3 className="mt-4 text-lg font-semibold">Aucun circuit disponible</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Revenez bientôt pour découvrir nos circuits.</p>
                </div>
              ) : (
                offres.map((o) => (
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
