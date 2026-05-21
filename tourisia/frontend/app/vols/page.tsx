"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Plane, MapPin, Calendar, Users, ChevronDown, Plus, Minus,
  Search, Loader2, ArrowRight,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import "react-day-picker/style.css";

const cabines = ["Économique", "Business", "Première"];

export default function VolsPage() {
  const [origine, setOrigine] = useState("");
  const [destination, setDestination] = useState("");
  const [aller_retour, setAllerRetour] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [cabine, setCabine] = useState("Économique");
  const [showPassengers, setShowPassengers] = useState(false);
  const passengersRef = useRef<HTMLDivElement>(null);
  const [offres, setOffres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setShowCalendar(false);
      if (passengersRef.current && !passengersRef.current.contains(e.target as Node)) setShowPassengers(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    fetchVols();
  }, []);

  const fetchVols = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_offers.php`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setOffres(data.filter((o: any) => o.type === "vol" || o.type === "vols"));
      }
    } catch {
      toast.error("Erreur de chargement des vols.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (origine) params.set("lieu", origine);
      if (dateRange?.from) params.set("date_arrivee", format(dateRange.from, "yyyy-MM-dd"));
      if (dateRange?.to) params.set("date_depart", format(dateRange.to, "yyyy-MM-dd"));
      params.set("adultes", String(adults));
      params.set("enfants", String(children));
      params.set("type", "vol");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_offers.php?${params.toString()}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setOffres(data.filter((o: any) => o.type === "vol" || o.type === "vols"));
      }
    } catch {
      toast.error("Erreur lors de la recherche.");
    } finally {
      setIsSearching(false);
    }
  };

  const formatDatesDisplay = () => {
    if (!dateRange?.from) return "";
    const from = format(dateRange.from, "dd MMM", { locale: fr });
    const to = dateRange.to ? format(dateRange.to, "dd MMM", { locale: fr }) : "...";
    return `${from} — ${to}`;
  };

  const totalPassagers = adults + children;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative bg-[#2563eb]" style={{ overflow: "visible" }}>
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }} />
          <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16 text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
              Trouvez votre vol
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
              Comparez et réservez les meilleurs vols au départ et à destination du Bénin.
            </p>

            {/* Barre de recherche */}
            <div className="mt-8 mx-auto max-w-4xl">
              {/* Toggle A/R */}
              <div className="flex justify-center gap-4 mb-4">
                {["Aller-retour", "Aller simple"].map((label, i) => (
                  <button
                    key={label}
                    onClick={() => setAllerRetour(i === 0)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      (i === 0) === aller_retour
                        ? "bg-white text-[#2563eb]"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div
                className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow-xl md:flex-row md:gap-0 md:rounded-full md:p-2"
                style={{ overflow: "visible" }}
              >
                {/* Origine */}
                <div className="flex flex-1 items-center gap-2 px-4 py-2">
                  <Plane className="h-4 w-4 shrink-0 text-[#2563eb]" />
                  <div className="flex flex-col w-full">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Départ</span>
                    <input
                      type="text"
                      value={origine}
                      onChange={(e) => setOrigine(e.target.value)}
                      placeholder="Ville ou aéroport..."
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="hidden h-8 w-px bg-border md:block self-center" />

                {/* Destination */}
                <div className="flex flex-1 items-center gap-2 px-4 py-2">
                  <MapPin className="h-4 w-4 shrink-0 text-[#2563eb]" />
                  <div className="flex flex-col w-full">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Destination</span>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Ville ou aéroport..."
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="hidden h-8 w-px bg-border md:block self-center" />

                {/* Dates */}
                <div className="relative flex flex-1 items-center gap-2 px-4 py-2" ref={calendarRef}>
                  <Calendar className="h-4 w-4 shrink-0 text-[#2563eb]" />
                  <div className="flex flex-col w-full">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dates</span>
                    <button
                      type="button"
                      onClick={() => { setShowCalendar(!showCalendar); setShowPassengers(false); }}
                      className="text-left bg-transparent text-sm focus:outline-none"
                    >
                      <span className={dateRange?.from ? "text-foreground" : "text-muted-foreground"}>
                        {dateRange?.from ? formatDatesDisplay() : "Départ — Retour"}
                      </span>
                    </button>
                    {showCalendar && (
                      <div
                        className="absolute left-0 top-[calc(100%+8px)] z-[9999] rounded-2xl border border-border bg-card shadow-2xl p-4"
                        style={{ minWidth: 600 }}
                      >
                        {aller_retour ? (
                          <DayPicker
                            mode="range"
                            selected={dateRange}
                            onSelect={(val) => setDateRange(val)}
                            numberOfMonths={2}
                            locale={fr}
                            disabled={{ before: new Date() }}
                          />
                        ) : (
                          <DayPicker
                            mode="single"
                            selected={dateRange?.from}
                            onSelect={(val) => setDateRange(val ? { from: val } : undefined)}
                            numberOfMonths={2}
                            locale={fr}
                            disabled={{ before: new Date() }}
                          />
                        )}
                        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border">
                          <button
                            onClick={() => setDateRange(undefined)}
                            className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                          >
                            Effacer
                          </button>
                          <button
                            onClick={() => setShowCalendar(false)}
                            className="px-4 py-2 rounded-lg bg-[#2563eb] text-xs font-bold text-white hover:bg-[#1d4ed8]"
                          >
                            Confirmer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden h-8 w-px bg-border md:block self-center" />

                {/* Passagers */}
                <div className="relative flex flex-1 items-center gap-2 px-4 py-2" ref={passengersRef}>
                  <Users className="h-4 w-4 shrink-0 text-[#2563eb]" />
                  <div className="flex flex-col w-full">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Passagers</span>
                    <button
                      type="button"
                      onClick={() => { setShowPassengers(!showPassengers); setShowCalendar(false); }}
                      className="text-left bg-transparent text-sm focus:outline-none flex items-center justify-between"
                    >
                      <span className="text-foreground">
                        {totalPassagers} passager{totalPassagers > 1 ? "s" : ""} · {cabine}
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showPassengers ? "rotate-180" : ""}`} />
                    </button>
                    {showPassengers && (
                      <div className="absolute left-0 top-[calc(100%+8px)] z-[9999] w-72 rounded-2xl border border-border bg-card p-4 shadow-2xl space-y-4">
                        {[
                          { label: "Adultes", desc: "12 ans et plus", value: adults, set: setAdults, min: 1 },
                          { label: "Enfants", desc: "2 à 11 ans", value: children, set: setChildren, min: 0 },
                        ].map(({ label, desc, value, set, min }) => (
                          <div key={label} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{label}</p>
                              <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => set((v) => Math.max(min, v - 1))}
                                disabled={value <= min}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors disabled:opacity-40"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold">{value}</span>
                              <button
                                type="button"
                                onClick={() => set((v) => v + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {/* Cabine */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-foreground">Classe</p>
                          <div className="grid grid-cols-3 gap-2">
                            {cabines.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setCabine(c)}
                                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  cabine === c ? "bg-[#2563eb] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPassengers(false)}
                          className="w-full rounded-lg bg-[#2563eb] py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-colors"
                        >
                          Confirmer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton recherche */}
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] active:scale-95 shrink-0 disabled:opacity-70"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span>Rechercher</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Résultats */}
        <section className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
            </div>
          ) : offres.length === 0 ? (
            <div className="py-20 text-center">
              <Plane className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">Aucun vol disponible</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Essayez avec d'autres critères de recherche.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{offres.length}</span> vol{offres.length !== 1 ? "s" : ""} trouvé{offres.length !== 1 ? "s" : ""}
              </p>
              <div className="flex flex-col gap-4">
                {offres.map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/10 text-[#2563eb]">
                      <Plane className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground truncate">{o.title}</h3>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {o.location}
                      </div>
                      {o.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{o.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#2563eb]">{o.price}</span>
                        <span className="text-xs text-muted-foreground uppercase">{o.currency}</span>
                      </div>
                      <a
                        href={`/offers?type=vol`}
                        className="flex items-center gap-1 rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d4ed8] transition-all"
                      >
                        Voir le vol <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
