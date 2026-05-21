"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Search, Loader2, Calendar, Users, ChevronDown, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import "react-day-picker/style.css";

export function HeroSection() {
  const router = useRouter();
  const [location, setLocation] = useState("");

  // Date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Travelers
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showTravelers, setShowTravelers] = useState(false);
  const travelersRef = useRef<HTMLDivElement>(null);

  // Autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const locationRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
      if (travelersRef.current && !travelersRef.current.contains(e.target as Node)) {
        setShowTravelers(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}offers/get_cities.php?q=${encodeURIComponent(query.trim())}`
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data);
          setShowSuggestions(true);
          setActiveIndex(-1);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 300);
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocation(val);
    fetchSuggestions(val);
  };

  const handleSelectSuggestion = (city: string) => {
    setLocation(city);
    setShowSuggestions(false);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const handleSearch = () => {
    setShowCalendar(false);
    setShowTravelers(false);
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (dateRange?.from) params.set("date_arrivee", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange?.to) params.set("date_depart", format(dateRange.to, "yyyy-MM-dd"));
    params.set("adultes", String(adults));
    params.set("enfants", String(children));
    router.push(`/offers?${params.toString()}`);
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === "Enter") handleSearch();
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((p) => Math.min(p + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((p) => Math.max(p - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelectSuggestion(suggestions[activeIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
    }
  };

  const formatDateDisplay = () => {
    if (!dateRange?.from) return "";
    const from = format(dateRange.from, "dd MMM", { locale: fr });
    const to = dateRange.to ? format(dateRange.to, "dd MMM", { locale: fr }) : "...";
    return `${from} — ${to}`;
  };

  const totalTravelers = adults + children;

  return (
    <section className="relative flex min-h-[480px] items-center justify-center lg:min-h-[540px]">
      {/* Background image */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/hero-mountains.png"
          alt="Beautiful mountain landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-20 text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
          Organisez Votre Séjour Haut de Gamme Sans Stress
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-base text-white/80 md:text-lg">
          Découvrez des expériences uniques et des trésors cachés avec nos services premium
        </p>

        {/* Search bar */}
        <div className="mt-8 w-full max-w-4xl">
          <div
            className="flex flex-col items-stretch gap-3 rounded-2xl bg-card p-3 shadow-xl md:flex-row md:items-center md:gap-0 md:rounded-full md:p-2"
            style={{ overflow: "visible" }}
          >
            {/* ── LIEU ── */}
            <div className="relative flex flex-1 items-center gap-2 px-4 py-2" ref={locationRef}>
              <MapPin className="h-4 w-4 shrink-0 text-[#2563eb]" />
              <div className="flex flex-col w-full">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Emplacement</span>
                <div className="relative flex items-center w-full">
                  <input
                    type="text"
                    value={location}
                    onChange={handleLocationChange}
                    onKeyDown={handleLocationKeyDown}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    placeholder="Lieu, ville, région..."
                    autoComplete="off"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none pr-5"
                  />
                  {isFetchingSuggestions && <Loader2 className="absolute right-0 h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 z-[9999] w-64 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                    <ul className="py-1">
                      {suggestions.map((city, index) => (
                        <li
                          key={city}
                          onMouseDown={() => handleSelectSuggestion(city)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                            index === activeIndex ? "bg-[#2563eb] text-white" : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <MapPin className={`h-3.5 w-3.5 shrink-0 ${index === activeIndex ? "text-white" : "text-[#2563eb]"}`} />
                          <span>{city}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden h-8 w-px bg-border md:block" />

            {/* ── DATES ── */}
            <div className="relative flex flex-1 items-center gap-2 px-4 py-2" ref={calendarRef}>
              <Calendar className="h-4 w-4 shrink-0 text-[#2563eb]" />
              <div className="flex flex-col w-full">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dates</span>
                <button
                  type="button"
                  onClick={() => { setShowCalendar(!showCalendar); setShowTravelers(false); }}
                  className="w-full text-left bg-transparent text-sm focus:outline-none"
                >
                  <span className={dateRange?.from ? "text-foreground" : "text-muted-foreground"}>
                    {dateRange?.from ? formatDateDisplay() : "Arrivée — Départ"}
                  </span>
                </button>
                {showCalendar && (
                  <div
                    className="absolute left-0 top-[calc(100%+8px)] z-[9999] rounded-2xl border border-border bg-card shadow-2xl p-4"
                    style={{ minWidth: "600px" }}
                  >
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={fr}
                      disabled={{ before: new Date() }}
                    />
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

            <div className="hidden h-8 w-px bg-border md:block" />

            {/* ── VOYAGEURS ── */}
            <div className="relative flex flex-1 items-center gap-2 px-4 py-2" ref={travelersRef}>
              <Users className="h-4 w-4 shrink-0 text-[#2563eb]" />
              <div className="flex flex-col w-full">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Voyageurs</span>
                <button
                  type="button"
                  onClick={() => { setShowTravelers(!showTravelers); setShowCalendar(false); }}
                  className="w-full text-left bg-transparent text-sm focus:outline-none flex items-center justify-between"
                >
                  <span className="text-foreground">
                    {totalTravelers} voyageur{totalTravelers > 1 ? "s" : ""}, {rooms} chambre{rooms > 1 ? "s" : ""}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showTravelers ? "rotate-180" : ""}`} />
                </button>
                {showTravelers && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-[9999] w-72 rounded-2xl border border-border bg-card p-4 shadow-2xl space-y-4">
                    {[
                      { label: "Adultes", desc: "18 ans et plus", value: adults, set: setAdults, min: 1 },
                      { label: "Enfants", desc: "2 à 17 ans", value: children, set: setChildren, min: 0 },
                      { label: "Chambres", desc: "", value: rooms, set: setRooms, min: 1 },
                    ].map(({ label, desc, value, set, min }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{label}</p>
                          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => set((v) => Math.max(min, v - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                            disabled={value <= min}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{value}</span>
                          <button
                            type="button"
                            onClick={() => set((v) => v + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted transition-colors"
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
            </div>

            {/* ── RECHERCHE ── */}
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] active:scale-95 shrink-0"
            >
              <Search className="h-4 w-4" />
              <span>Recherche</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
