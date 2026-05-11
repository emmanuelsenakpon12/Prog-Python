"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Search, Loader2, Users, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DayPicker, DateRange } from "react-day-picker";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import "react-day-picker/src/style.css";

export function HeroSection() {
  const router = useRouter();

  // ── Lieu
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const locationRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Dates
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // ── Voyageurs
  const [adultes, setAdultes] = useState(2);
  const [enfants, setEnfants] = useState(0);
  const [chambres, setChambres] = useState(1);
  const [showTravelers, setShowTravelers] = useState(false);
  const travelersRef = useRef<HTMLDivElement>(null);

  // Fermer dropdowns au clic extérieur
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
      if (travelersRef.current && !travelersRef.current.contains(e.target as Node)) {
        setShowTravelers(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Autocomplete villes
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  // Libellé affiché pour les dates
  const datesLabel = (() => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "EEE d MMM", { locale: fr })} — ${format(dateRange.to, "EEE d MMM", { locale: fr })}`;
    }
    if (dateRange?.from) {
      return format(dateRange.from, "EEE d MMM", { locale: fr });
    }
    return null;
  })();

  // Libellé voyageurs
  const travelersLabel = [
    `${adultes} adulte${adultes > 1 ? "s" : ""}`,
    enfants > 0 ? `${enfants} enfant${enfants > 1 ? "s" : ""}` : null,
    `${chambres} chambre${chambres > 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleSearch = () => {
    setShowSuggestions(false);
    setShowCalendar(false);
    setShowTravelers(false);
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (dateRange?.from) params.set("date_arrivee", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange?.to) params.set("date_depart", format(dateRange.to, "yyyy-MM-dd"));
    params.set("adultes", String(adultes));
    if (enfants > 0) params.set("enfants", String(enfants));
    if (chambres > 1) params.set("chambres", String(chambres));
    router.push(`/offers?${params.toString()}`);
  };

  return (
    <section className="relative flex min-h-[480px] items-center justify-center overflow-hidden lg:min-h-[540px]">
      {/* Fond */}
      <Image
        src="/images/hero-mountains.png"
        alt="Paysage montagneux"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-20 text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
          Organisez Votre Séjour Haut de Gamme Sans Stress
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-base text-white/80 md:text-lg">
          Découvrez des expériences uniques et des trésors cachés avec nos services premium
        </p>

        {/* Barre de recherche */}
        <div className="mt-8 w-full max-w-4xl">
          <div className="flex flex-col items-stretch gap-3 rounded-2xl bg-card p-3 shadow-xl md:flex-row md:items-center md:gap-0 md:rounded-full md:p-2">

            {/* ── Lieu ── */}
            <div className="relative flex flex-1 items-center gap-2 px-4 py-2" ref={locationRef}>
              <MapPin className="h-4 w-4 shrink-0 text-[#2563eb]" />
              <div className="flex flex-col w-full">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Destination
                </span>
                <div className="relative flex items-center w-full">
                  <input
                    type="text"
                    value={location}
                    onChange={handleLocationChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    placeholder="Lieu, ville, région..."
                    autoComplete="off"
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none pr-5"
                  />
                  {isFetchingSuggestions && (
                    <Loader2 className="absolute right-0 h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 z-50 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
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
                          {city}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden h-8 w-px bg-border md:block" />

            {/* ── Dates ── */}
            <div className="relative flex flex-1 items-center gap-2 px-4 py-2" ref={calendarRef}>
              <span className="text-base shrink-0">📅</span>
              <div className="flex flex-col w-full">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Arrivée — Départ
                </span>
                <button
                  onClick={() => { setShowCalendar(!showCalendar); setShowTravelers(false); }}
                  className="text-left text-sm text-foreground focus:outline-none flex items-center justify-between"
                >
                  <span className={datesLabel ? "text-foreground" : "text-muted-foreground"}>
                    {datesLabel || "Sélectionner les dates"}
                  </span>
                  {datesLabel && (
                    <X
                      className="h-3 w-3 text-muted-foreground hover:text-foreground ml-1"
                      onClick={(e) => { e.stopPropagation(); setDateRange(undefined); }}
                    />
                  )}
                </button>

                {/* Dropdown calendrier */}
                {showCalendar && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 rounded-2xl border border-border bg-card shadow-2xl p-4">
                    <div className="rdp-hero">
                      <DayPicker
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range);
                          if (range?.from && range?.to) setShowCalendar(false);
                        }}
                        numberOfMonths={2}
                        locale={fr}
                        disabled={[{ before: new Date() }]}
                        showOutsideDays={false}
                        classNames={{
                          root: "rdp-root",
                          months: "flex flex-col sm:flex-row gap-4",
                          month: "flex-1 min-w-[220px]",
                          month_caption: "flex justify-center mb-3",
                          caption_label: "text-sm font-semibold text-foreground",
                          nav: "flex items-center justify-between absolute inset-x-0 top-0",
                          button_previous: "absolute left-2 h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors",
                          button_next: "absolute right-2 h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors",
                          month_grid: "w-full border-collapse",
                          weekdays: "flex",
                          weekday: "flex-1 text-center text-[10px] font-bold text-muted-foreground py-1",
                          week: "flex",
                          day: "flex-1 flex items-center justify-center",
                          day_button: "h-8 w-8 rounded-full text-xs font-medium transition-colors hover:bg-[#2563eb]/10 focus:outline-none",
                          selected: "bg-[#2563eb] text-white rounded-full",
                          range_start: "bg-[#2563eb] text-white rounded-l-full",
                          range_end: "bg-[#2563eb] text-white rounded-r-full",
                          range_middle: "bg-[#2563eb]/10 text-[#2563eb] rounded-none",
                          today: "font-bold text-[#2563eb]",
                          disabled: "text-muted-foreground/30 cursor-not-allowed line-through pointer-events-none",
                          outside: "text-muted-foreground/20",
                        }}
                      />
                    </div>
                    {dateRange?.from && !dateRange?.to && (
                      <p className="mt-2 text-xs text-center text-muted-foreground">
                        Sélectionnez maintenant la date de départ
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden h-8 w-px bg-border md:block" />

            {/* ── Voyageurs ── */}
            <div className="relative flex flex-1 items-center gap-2 px-4 py-2" ref={travelersRef}>
              <Users className="h-4 w-4 shrink-0 text-[#2563eb]" />
              <div className="flex flex-col w-full">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Voyageurs
                </span>
                <button
                  onClick={() => { setShowTravelers(!showTravelers); setShowCalendar(false); }}
                  className="text-left text-sm text-foreground focus:outline-none flex items-center gap-1"
                >
                  <span className="truncate">{travelersLabel}</span>
                  <ChevronDown className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform ${showTravelers ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown voyageurs */}
                {showTravelers && (
                  <div className="absolute left-0 top-full mt-2 z-50 w-72 rounded-2xl border border-border bg-card shadow-2xl p-4 space-y-4">
                    {[
                      { label: "Adultes", sublabel: "18 ans et plus", value: adultes, set: setAdultes, min: 1, max: 16 },
                      { label: "Enfants", sublabel: "2 – 17 ans", value: enfants, set: setEnfants, min: 0, max: 10 },
                      { label: "Chambres", sublabel: "", value: chambres, set: setChambres, min: 1, max: 8 },
                    ].map(({ label, sublabel, value, set, min, max }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{label}</p>
                          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => set((v: number) => Math.max(min, v - 1))}
                            disabled={value <= min}
                            className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-lg font-bold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-bold tabular-nums">{value}</span>
                          <button
                            onClick={() => set((v: number) => Math.min(max, v + 1))}
                            disabled={value >= max}
                            className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-lg font-bold hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowTravelers(false)}
                      className="w-full rounded-xl bg-[#2563eb] py-2 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-colors"
                    >
                      Appliquer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Bouton Recherche ── */}
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 rounded-full bg-[#2563eb] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] active:scale-95 whitespace-nowrap"
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
