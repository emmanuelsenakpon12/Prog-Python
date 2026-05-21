"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import "react-day-picker/style.css";

/* ── Créneaux horaires toutes les 30 min ── */
const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

interface SearchParams {
  lieu: string;
  date_prise: string;
  heure_prise: string;
  date_retour: string;
  heure_retour: string;
}

interface Props {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export function TransportSearchBar({ onSearch, isLoading = false }: Props) {
  /* ── State ── */
  const [lieu, setLieu] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [datePrise, setDatePrise] = useState<Date | undefined>(undefined);
  const [showCalPrise, setShowCalPrise] = useState(false);

  const [heurePrise, setHeurePrise] = useState("10:00");
  const [showTimePrise, setShowTimePrise] = useState(false);

  const [dateRetour, setDateRetour] = useState<Date | undefined>(undefined);
  const [showCalRetour, setShowCalRetour] = useState(false);

  const [heureRetour, setHeureRetour] = useState("10:00");
  const [showTimeRetour, setShowTimeRetour] = useState(false);

  /* ── Refs ── */
  const locationRef   = useRef<HTMLDivElement>(null);
  const calPriseRef   = useRef<HTMLDivElement>(null);
  const timePriseRef  = useRef<HTMLDivElement>(null);
  const calRetourRef  = useRef<HTMLDivElement>(null);
  const timeRetourRef = useRef<HTMLDivElement>(null);
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fermeture au clic extérieur ── */
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (locationRef.current   && !locationRef.current.contains(e.target as Node))   { setShowSuggestions(false); setActiveIndex(-1); }
      if (calPriseRef.current   && !calPriseRef.current.contains(e.target as Node))   setShowCalPrise(false);
      if (timePriseRef.current  && !timePriseRef.current.contains(e.target as Node))  setShowTimePrise(false);
      if (calRetourRef.current  && !calRetourRef.current.contains(e.target as Node))  setShowCalRetour(false);
      if (timeRetourRef.current && !timeRetourRef.current.contains(e.target as Node)) setShowTimeRetour(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  /* ── Autocomplete villes ── */
  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    debounceRef.current = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      try {
        const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_cities.php?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) { setSuggestions(data); setShowSuggestions(true); setActiveIndex(-1); }
        else { setSuggestions([]); setShowSuggestions(false); }
      } catch { setSuggestions([]); setShowSuggestions(false); }
      finally { setIsFetchingSuggestions(false); }
    }, 300);
  }, []);

  /* ── Recherche ── */
  const handleSearch = () => {
    onSearch({
      lieu,
      date_prise:   datePrise  ? format(datePrise,  "yyyy-MM-dd") : "",
      heure_prise:  heurePrise,
      date_retour:  dateRetour ? format(dateRetour, "yyyy-MM-dd") : "",
      heure_retour: heureRetour,
    });
  };

  const closeAll = () => {
    setShowCalPrise(false); setShowCalRetour(false);
    setShowTimePrise(false); setShowTimeRetour(false);
    setShowSuggestions(false);
  };

  const formatDate = (d: Date | undefined) =>
    d ? format(d, "EEE. dd MMM", { locale: fr }) : "";

  /* ════════════════════════════════════════════════════════
     RENDU
  ════════════════════════════════════════════════════════ */
  return (
    <div
      className="w-full"
      style={{ overflow: "visible" }}
    >
      {/* ── Barre principale ── */}
      <div
        className="flex flex-col md:flex-row items-stretch w-full bg-white rounded-lg overflow-visible"
        style={{ border: "3px solid #F5A623", borderRadius: 8 }}
      >

        {/* ── 1. LIEU ── */}
        <div
          className="relative flex items-center gap-3 px-4 py-3 flex-[2] min-w-0"
          ref={locationRef}
          style={{ overflow: "visible" }}
        >
          <Search className="h-5 w-5 shrink-0 text-[#F5A623]" />
          <div className="flex flex-col w-full min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Lieu de prise en charge
            </span>
            <div className="relative flex items-center">
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
                  else if (e.key === "Escape") { setShowSuggestions(false); }
                }}
                placeholder="Aéroport, ville ou gare"
                autoComplete="off"
                className="w-full bg-transparent text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none pr-5"
              />
              {isFetchingSuggestions && <Loader2 className="absolute right-0 h-3 w-3 animate-spin text-gray-400" />}
            </div>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-2 z-[9999] w-72 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
              {suggestions.map((city, i) => (
                <button
                  key={city}
                  onMouseDown={() => { setLieu(city); setShowSuggestions(false); }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                    i === activeIndex ? "bg-[#F5A623]/10 text-[#F5A623] font-semibold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#F5A623]" />
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Séparateur ── */}
        <div className="hidden md:block w-px bg-[#F5A623]/30 self-stretch" />

        {/* ── 2. DATE DE PRISE EN CHARGE ── */}
        <div
          className="relative flex items-center gap-3 px-4 py-3 flex-1 min-w-0 cursor-pointer"
          ref={calPriseRef}
          style={{ overflow: "visible" }}
          onClick={() => { closeAll(); setShowCalPrise(v => !v); }}
        >
          <Calendar className="h-5 w-5 shrink-0 text-[#F5A623]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date de prise en charge</span>
            <span className={`text-sm font-semibold ${datePrise ? "text-gray-800" : "text-gray-400"}`}>
              {datePrise ? formatDate(datePrise) : "Choisir une date"}
            </span>
          </div>

          {showCalPrise && (
            <div
              className="absolute left-0 top-[calc(100%+8px)] z-[9999] rounded-2xl border border-gray-200 bg-white shadow-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <DayPicker
                mode="single"
                selected={datePrise}
                onSelect={(d) => { setDatePrise(d); if (dateRetour && d && d > dateRetour) setDateRetour(undefined); setShowCalPrise(false); }}
                locale={fr}
                disabled={{ before: new Date() }}
              />
            </div>
          )}
        </div>

        {/* ── Séparateur ── */}
        <div className="hidden md:block w-px bg-[#F5A623]/30 self-stretch" />

        {/* ── 3. HEURE DE PRISE EN CHARGE ── */}
        <div
          className="relative flex items-center gap-3 px-4 py-3 cursor-pointer"
          ref={timePriseRef}
          style={{ overflow: "visible" }}
          onClick={() => { closeAll(); setShowTimePrise(v => !v); }}
        >
          <Clock className="h-5 w-5 shrink-0 text-[#F5A623]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Heure</span>
            <span className="text-sm font-semibold text-gray-800">{heurePrise}</span>
          </div>

          {showTimePrise && (
            <div
              className="absolute left-0 top-[calc(100%+8px)] z-[9999] w-36 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-52 overflow-y-auto py-1">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setHeurePrise(t); setShowTimePrise(false); }}
                    className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                      t === heurePrise ? "bg-[#F5A623] text-white font-bold" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Séparateur ── */}
        <div className="hidden md:block w-px bg-[#F5A623]/30 self-stretch" />

        {/* ── 4. DATE DE RESTITUTION ── */}
        <div
          className="relative flex items-center gap-3 px-4 py-3 flex-1 min-w-0 cursor-pointer"
          ref={calRetourRef}
          style={{ overflow: "visible" }}
          onClick={() => { closeAll(); setShowCalRetour(v => !v); }}
        >
          <Calendar className="h-5 w-5 shrink-0 text-[#F5A623]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Date de restitution</span>
            <span className={`text-sm font-semibold ${dateRetour ? "text-gray-800" : "text-gray-400"}`}>
              {dateRetour ? formatDate(dateRetour) : "Choisir une date"}
            </span>
          </div>

          {showCalRetour && (
            <div
              className="absolute left-0 top-[calc(100%+8px)] z-[9999] rounded-2xl border border-gray-200 bg-white shadow-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <DayPicker
                mode="single"
                selected={dateRetour}
                onSelect={(d) => { setDateRetour(d); setShowCalRetour(false); }}
                locale={fr}
                disabled={{ before: datePrise ?? new Date() }}
              />
            </div>
          )}
        </div>

        {/* ── Séparateur ── */}
        <div className="hidden md:block w-px bg-[#F5A623]/30 self-stretch" />

        {/* ── 5. HEURE DE RESTITUTION ── */}
        <div
          className="relative flex items-center gap-3 px-4 py-3 cursor-pointer"
          ref={timeRetourRef}
          style={{ overflow: "visible" }}
          onClick={() => { closeAll(); setShowTimeRetour(v => !v); }}
        >
          <Clock className="h-5 w-5 shrink-0 text-[#F5A623]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Heure</span>
            <span className="text-sm font-semibold text-gray-800">{heureRetour}</span>
          </div>

          {showTimeRetour && (
            <div
              className="absolute left-0 top-[calc(100%+8px)] z-[9999] w-36 rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-h-52 overflow-y-auto py-1">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setHeureRetour(t); setShowTimeRetour(false); }}
                    className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                      t === heureRetour ? "bg-[#F5A623] text-white font-bold" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 6. BOUTON RECHERCHER ── */}
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-8 py-4 font-bold text-white text-sm rounded-r-[5px] rounded-l-none transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70 shrink-0 md:rounded-none md:rounded-r-[5px]"
          style={{ background: "#003580", borderRadius: "0 5px 5px 0" }}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          <span>Rechercher</span>
        </button>
      </div>
    </div>
  );
}
