"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Home, MapPin, Calendar, Users, ChevronDown, Plus, Minus,
  Search, Loader2, Star,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import "react-day-picker/style.css";

const getFileUrl = (path: string) => {
  if (!path) return "";
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
};

export default function HebergementPage() {
  const [lieu, setLieu] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showTravelers, setShowTravelers] = useState(false);

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const travelersRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) { setShowSuggestions(false); setActiveIndex(-1); }
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setShowCalendar(false);
      if (travelersRef.current && !travelersRef.current.contains(e.target as Node)) setShowTravelers(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_offers.php`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setResults(data.filter((o: any) => o.type === "herbergement"));
    } catch { toast.error("Erreur de chargement des hébergements."); }
    finally { setIsLoading(false); }
  };

  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_cities.php?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) { setSuggestions(data); setShowSuggestions(true); setActiveIndex(-1); }
        else { setSuggestions([]); setShowSuggestions(false); }
      } catch { setSuggestions([]); setShowSuggestions(false); }
    }, 300);
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_offers.php`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        let filtered = data.filter((o: any) => o.type === "herbergement");
        if (lieu.trim()) {
          filtered = filtered.filter((o: any) =>
            o.location?.toLowerCase().includes(lieu.toLowerCase()) ||
            o.title?.toLowerCase().includes(lieu.toLowerCase())
          );
        }
        setResults(filtered);
        if (filtered.length === 0) toast.info("Aucun hébergement disponible pour ces critères.");
      }
    } catch { toast.error("Erreur lors de la recherche."); }
    finally { setIsLoading(false); }
  };

  const closeAll = () => { setShowCalendar(false); setShowTravelers(false); setShowSuggestions(false); };

  const formatDates = () => {
    if (!dateRange?.from) return "Dates de séjour";
    const from = format(dateRange.from, "dd MMM", { locale: fr });
    const to = dateRange.to ? format(dateRange.to, "dd MMM", { locale: fr }) : "...";
    return `${from} — ${to}`;
  };

  const formatTravelers = () =>
    `${adults + children} voyageur${adults + children > 1 ? "s" : ""} · ${rooms} chambre${rooms > 1 ? "s" : ""}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <section className="relative bg-[#2563eb]" style={{ overflow: "visible" }}>
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16 text-center" style={{ overflow: "visible" }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 mb-4">
              <Home className="h-4 w-4 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Hébergements</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl text-balance leading-tight">
              Trouvez l'hébergement{" "}
              <span className="text-yellow-300">idéal</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 leading-relaxed">
              Hôtels, villas, maisons d'hôtes — comparez les meilleures offres au Bénin.
            </p>

            {/* Barre de recherche */}
            <div className="mt-8 mx-auto max-w-5xl" style={{ overflow: "visible" }}>
              <div
                className="flex flex-col md:flex-row items-stretch w-full bg-white"
                style={{ border: "3px solid white", borderRadius: 8, overflow: "visible" }}
              >
                {/* 1. Destination */}
                <div
                  className="relative flex items-center gap-3 px-4 py-3 flex-[2] min-w-0"
                  ref={locationRef}
                  style={{ overflow: "visible" }}
                >
                  <Search className="h-5 w-5 shrink-0 text-[#2563eb]" />
                  <div className="flex flex-col w-full min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Destination</span>
                    <input
                      type="text"
                      value={lieu}
                      onChange={(e) => { setLieu(e.target.value); fetchSuggestions(e.target.value); }}
                      onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                      onKeyDown={(e) => {
                        if (!showSuggestions) { if (e.key === "Enter") handleSearch(); return; }
                        if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(p => Math.min(p + 1, suggestions.length - 1)); }
                        else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(p => Math.max(p - 1, -1)); }
                        else if (e.key === "Enter") { e.preventDefault(); if (activeIndex >= 0) { setLieu(suggestions[activeIndex]); setShowSuggestions(false); } else handleSearch(); }
                        else if (e.key === "Escape") setShowSuggestions(false);
                      }}
                      placeholder="Ville, hôtel ou quartier"
                      autoComplete="off"
                      className="w-full bg-transparent text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none"
                    />
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 top-full mt-2 z-[9999] w-72 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
                      {suggestions.map((city, i) => (
                        <button
                          key={city}
                          onMouseDown={() => { setLieu(city); setShowSuggestions(false); }}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                            i === activeIndex ? "bg-[#2563eb]/10 text-[#2563eb] font-semibold" : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#2563eb]" />
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden md:block w-px bg-gray-200 self-stretch" />

                {/* 2. Dates */}
                <div
                  className="relative flex items-center gap-3 px-4 py-3 flex-[2] min-w-0 cursor-pointer"
                  ref={calendarRef}
                  style={{ overflow: "visible" }}
                  onClick={() => { closeAll(); setShowCalendar(v => !v); }}
                >
                  <Calendar className="h-5 w-5 shrink-0 text-[#2563eb]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Dates de séjour</span>
                    <span className={`text-sm font-semibold ${dateRange?.from ? "text-gray-800" : "text-gray-400"}`}>
                      {formatDates()}
                    </span>
                  </div>
                  {showCalendar && (
                    <div
                      className="absolute left-0 top-[calc(100%+8px)] z-[9999] rounded-2xl border border-gray-200 bg-white shadow-2xl p-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DayPicker
                        mode="range"
                        selected={dateRange}
                        onSelect={(val) => { setDateRange(val); if (val?.to) setShowCalendar(false); }}
                        numberOfMonths={2}
                        locale={fr}
                        disabled={{ before: new Date() }}
                      />
                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <button onClick={() => setDateRange(undefined)} className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-800">
                          Effacer
                        </button>
                        <button onClick={() => setShowCalendar(false)} className="px-4 py-2 rounded-lg bg-[#2563eb] text-xs font-bold text-white hover:bg-[#1d4ed8]">
                          Confirmer
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden md:block w-px bg-gray-200 self-stretch" />

                {/* 3. Voyageurs */}
                <div
                  className="relative flex items-center gap-3 px-4 py-3 flex-[1.5] min-w-0 cursor-pointer"
                  ref={travelersRef}
                  style={{ overflow: "visible" }}
                  onClick={() => { closeAll(); setShowTravelers(v => !v); }}
                >
                  <Users className="h-5 w-5 shrink-0 text-[#2563eb]" />
                  <div className="flex flex-col w-full">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Voyageurs</span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800 truncate">{formatTravelers()}</span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ml-1 ${showTravelers ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  {showTravelers && (
                    <div
                      className="absolute right-0 top-[calc(100%+8px)] z-[9999] w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl space-y-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[
                        { label: "Adultes", desc: "18 ans et plus", value: adults, set: setAdults, min: 1 },
                        { label: "Enfants", desc: "2 à 17 ans", value: children, set: setChildren, min: 0 },
                        { label: "Chambres", desc: "", value: rooms, set: setRooms, min: 1 },
                      ].map(({ label, desc, value, set, min }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{label}</p>
                            {desc && <p className="text-xs text-gray-400">{desc}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => set((v) => Math.max(min, v - 1))}
                              disabled={value <= min}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{value}</span>
                            <button
                              type="button"
                              onClick={() => set((v) => v + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowTravelers(false)}
                        className="w-full rounded-lg bg-[#2563eb] py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-colors"
                      >
                        Confirmer
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Bouton rechercher */}
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 px-8 py-4 font-bold text-white text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70 shrink-0"
                  style={{ background: "#2563eb", borderRadius: "0 5px 5px 0" }}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                  <span>Rechercher</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Résultats ── */}
        <section className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
          <div className="mb-6">
            {hasSearched ? (
              <h2 className="text-xl font-bold text-foreground">
                {results.length} hébergement{results.length !== 1 ? "s" : ""} disponible{results.length !== 1 ? "s" : ""}
                {lieu ? ` à ${lieu}` : ""}
              </h2>
            ) : (
              <h2 className="text-xl font-bold text-foreground">
                Tous nos hébergements
                <span className="ml-2 text-base font-normal text-muted-foreground">({results.length})</span>
              </h2>
            )}
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Home className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="mt-5 text-lg font-bold">Aucun hébergement trouvé</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-xs">Modifiez vos critères ou consultez toutes nos offres.</p>
              <button onClick={fetchAll} className="mt-6 rounded-xl bg-[#2563eb] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-colors">
                Voir tous les hébergements
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((o) => (
                <a
                  key={o.id}
                  href={`/offers?type=herbergement`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-xl hover:-translate-y-1"
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
                        <Home className="h-12 w-12 text-muted-foreground/20" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 rounded-md bg-[#2563eb]/90 px-2.5 py-1 text-xs font-semibold text-white shadow">
                      Hébergement
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground truncate">{o.title}</h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 text-[#2563eb]" />
                      {o.location}
                    </div>
                    {o.description && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{o.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-[#2563eb]">{o.price}</span>
                          <span className="text-xs text-muted-foreground uppercase">{o.currency}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">/ nuit</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-foreground">4.5</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
