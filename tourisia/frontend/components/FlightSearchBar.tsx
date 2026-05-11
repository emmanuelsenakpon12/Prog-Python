"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plane, MapPin, Users, Calendar, ChevronDown, ArrowLeftRight, X, Loader2, Search } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import "react-day-picker/src/style.css";

interface FlightSearchBarProps {
  onSearch: (params: Record<string, string>) => void;
}

type TripType = "aller-retour" | "aller-simple" | "multi";

export function FlightSearchBar({ onSearch }: FlightSearchBarProps) {
  const [tripType, setTripType] = useState<TripType>("aller-retour");

  // Aéroports
  const [depart, setDepart] = useState("");
  const [destination, setDestination] = useState("");
  const [departSuggestions, setDepartSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [showDepartSug, setShowDepartSug] = useState(false);
  const [showDestSug, setShowDestSug] = useState(false);
  const [fetchingDepart, setFetchingDepart] = useState(false);
  const [fetchingDest, setFetchingDest] = useState(false);
  const departRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const debDepart = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debDest = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dates
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Passagers
  const [adultes, setAdultes] = useState(1);
  const [enfants, setEnfants] = useState(0);
  const [classe, setClasse] = useState("Économique");
  const [showPassagers, setShowPassagers] = useState(false);
  const passagersRef = useRef<HTMLDivElement>(null);

  // Fermer tous les dropdowns au clic extérieur
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (departRef.current && !departRef.current.contains(e.target as Node)) setShowDepartSug(false);
      if (destRef.current && !destRef.current.contains(e.target as Node)) setShowDestSug(false);
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setShowCalendar(false);
      if (passagersRef.current && !passagersRef.current.contains(e.target as Node)) setShowPassagers(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchAirports = useCallback(async (
    query: string,
    setter: (d: any[]) => void,
    loading: (v: boolean) => void,
    showSetter: (v: boolean) => void,
  ) => {
    if (query.trim().length < 2) { setter([]); showSetter(false); return; }
    loading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}flights/get_airports.php?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) { setter(data); showSetter(true); }
      else { setter([]); showSetter(false); }
    } catch { setter([]); showSetter(false); }
    finally { loading(false); }
  }, []);

  const handleDepartChange = (v: string) => {
    setDepart(v);
    if (debDepart.current) clearTimeout(debDepart.current);
    debDepart.current = setTimeout(
      () => fetchAirports(v, setDepartSuggestions, setFetchingDepart, setShowDepartSug), 300,
    );
  };

  const handleDestChange = (v: string) => {
    setDestination(v);
    if (debDest.current) clearTimeout(debDest.current);
    debDest.current = setTimeout(
      () => fetchAirports(v, setDestSuggestions, setFetchingDest, setShowDestSug), 300,
    );
  };

  const swapAirports = () => { setDepart(destination); setDestination(depart); };

  const datesLabel = (() => {
    if (dateRange?.from && dateRange?.to)
      return `${format(dateRange.from, "d MMM", { locale: fr })} — ${format(dateRange.to, "d MMM", { locale: fr })}`;
    if (dateRange?.from) return format(dateRange.from, "d MMM", { locale: fr });
    return null;
  })();

  const passagersLabel = [
    `${adultes} adulte${adultes > 1 ? "s" : ""}`,
    enfants > 0 ? `${enfants} enfant${enfants > 1 ? "s" : ""}` : null,
    classe,
  ].filter(Boolean).join(" · ");

  const handleSearch = () => {
    setShowCalendar(false);
    setShowPassagers(false);
    const params: Record<string, string> = {};
    if (depart) params.depart = depart;
    if (destination) params.destination = destination;
    if (dateRange?.from) params.date_aller = format(dateRange.from, "yyyy-MM-dd");
    if (dateRange?.to && tripType === "aller-retour") params.date_retour = format(dateRange.to, "yyyy-MM-dd");
    params.passagers = String(adultes + enfants);
    params.classe = classe;
    onSearch(params);
  };

  /* ── Dropdown aéroports ── */
  const AirportDropdown = ({ suggestions, onSelect }: { suggestions: any[]; onSelect: (a: any) => void }) => (
    <div className="absolute left-0 top-full mt-1 z-50 w-72 rounded-xl border border-border bg-white shadow-2xl overflow-hidden">
      {suggestions.map((a) => (
        <button
          key={a.iata}
          onMouseDown={() => onSelect(a)}
          className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
        >
          <span className="mt-0.5 font-bold text-[#2563eb] text-xs w-8 shrink-0">{a.iata}</span>
          <div>
            <p className="text-xs font-semibold text-gray-800">{a.nom}</p>
            <p className="text-[10px] text-gray-400">{a.ville}, {a.pays}</p>
          </div>
        </button>
      ))}
    </div>
  );

  /* ── Styles DayPicker ── */
  const calendarClassNames = {
    months: "flex gap-6 flex-wrap",
    month: "flex-1 min-w-[220px]",
    month_caption: "flex justify-center items-center mb-3 relative h-8",
    caption_label: "text-sm font-semibold text-gray-800",
    nav: "absolute inset-x-0 top-0 flex items-center justify-between pointer-events-none",
    button_previous: "pointer-events-auto h-7 w-7 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors",
    button_next: "pointer-events-auto h-7 w-7 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors",
    month_grid: "w-full border-collapse",
    weekdays: "flex mb-1",
    weekday: "flex-1 text-center text-[10px] font-bold text-gray-400 py-1",
    week: "flex",
    day: "flex-1 flex items-center justify-center p-0.5",
    day_button: "h-8 w-8 rounded-full text-xs font-medium hover:bg-blue-50 text-gray-700 transition-colors",
    selected: "!bg-[#2563eb] !text-white rounded-full",
    range_start: "!bg-[#2563eb] !text-white rounded-l-full",
    range_end: "!bg-[#2563eb] !text-white rounded-r-full",
    range_middle: "!bg-blue-100 !text-[#2563eb] rounded-none",
    today: "font-bold text-[#2563eb]",
    disabled: "opacity-30 cursor-not-allowed pointer-events-none",
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-visible">

      {/* ── Tabs type de voyage ── */}
      <div className="flex border-b border-border px-4 pt-4 gap-1">
        {(["aller-retour", "aller-simple", "multi"] as TripType[]).map((t) => (
          <button
            key={t}
            onClick={() => setTripType(t)}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
              tripType === t
                ? "bg-[#2563eb] text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t === "aller-retour" ? "Aller-retour" : t === "aller-simple" ? "Aller simple" : "Multi-destinations"}
          </button>
        ))}
      </div>

      {/* ── Grille des champs ── */}
      <div className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-2">

          {/* ── Départ ── */}
          <div className="relative flex flex-col gap-1 md:flex-1 min-w-0" ref={departRef}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Plane className="h-3 w-3" /> Départ
            </span>
            <div className="flex items-center gap-2 h-11 rounded-xl border border-border bg-background px-3 hover:border-[#2563eb]/60 focus-within:border-[#2563eb] transition-colors">
              <input
                type="text"
                value={depart}
                onChange={(e) => handleDepartChange(e.target.value)}
                placeholder="Ville ou aéroport..."
                className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {fetchingDepart && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />}
            </div>
            {showDepartSug && (
              <AirportDropdown
                suggestions={departSuggestions}
                onSelect={(a) => { setDepart(`${a.iata} – ${a.ville}`); setShowDepartSug(false); }}
              />
            )}
          </div>

          {/* ── Swap ── */}
          <button
            onClick={swapAirports}
            title="Inverser"
            className="hidden md:flex self-end h-11 px-2 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors shrink-0"
          >
            <ArrowLeftRight className="h-4 w-4 text-[#2563eb]" />
          </button>

          {/* ── Destination ── */}
          <div className="relative flex flex-col gap-1 md:flex-1 min-w-0" ref={destRef}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Destination
            </span>
            <div className="flex items-center gap-2 h-11 rounded-xl border border-border bg-background px-3 hover:border-[#2563eb]/60 focus-within:border-[#2563eb] transition-colors">
              <input
                type="text"
                value={destination}
                onChange={(e) => handleDestChange(e.target.value)}
                placeholder="Ville ou aéroport..."
                className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {fetchingDest && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />}
            </div>
            {showDestSug && (
              <AirportDropdown
                suggestions={destSuggestions}
                onSelect={(a) => { setDestination(`${a.iata} – ${a.ville}`); setShowDestSug(false); }}
              />
            )}
          </div>

          {/* ── Dates ── */}
          <div className="relative flex flex-col gap-1 md:flex-1 min-w-0" ref={calendarRef}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Dates
            </span>
            <button
              onClick={() => { setShowCalendar(!showCalendar); setShowPassagers(false); }}
              className={`flex items-center justify-between h-11 w-full rounded-xl border bg-background px-3 text-sm transition-colors ${
                showCalendar ? "border-[#2563eb]" : "border-border hover:border-[#2563eb]/60"
              }`}
            >
              <span className={`truncate ${datesLabel ? "text-foreground" : "text-muted-foreground"}`}>
                {datesLabel || (tripType === "aller-simple" ? "Date aller" : "Aller — Retour")}
              </span>
              {datesLabel ? (
                <X
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => { e.stopPropagation(); setDateRange(undefined); }}
                />
              ) : (
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${showCalendar ? "rotate-180" : ""}`} />
              )}
            </button>

            {showCalendar && (
              <div className="absolute right-0 top-full mt-2 rounded-2xl border border-border bg-white shadow-2xl p-5"
                   style={{ zIndex: 9999, minWidth: tripType === "aller-simple" ? "280px" : "560px", maxWidth: "calc(100vw - 2rem)" }}>
                {tripType === "aller-simple" ? (
                  <DayPicker
                    mode="single"
                    selected={dateRange?.from}
                    onSelect={(s) => { setDateRange({ from: s, to: undefined }); setShowCalendar(false); }}
                    numberOfMonths={1}
                    locale={fr}
                    disabled={[{ before: new Date() }]}
                    showOutsideDays={false}
                    classNames={calendarClassNames}
                  />
                ) : (
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={(s) => { setDateRange(s); if (s?.from && s?.to) setShowCalendar(false); }}
                    numberOfMonths={2}
                    locale={fr}
                    disabled={[{ before: new Date() }]}
                    showOutsideDays={false}
                    classNames={calendarClassNames}
                  />
                )}
              </div>
            )}
          </div>

          {/* ── Passagers ── */}
          <div className="relative flex flex-col gap-1 md:flex-1 min-w-0" ref={passagersRef}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Passagers
            </span>
            <button
              onClick={() => { setShowPassagers(!showPassagers); setShowCalendar(false); }}
              className={`flex items-center justify-between h-11 w-full rounded-xl border bg-background px-3 text-sm transition-colors ${
                showPassagers ? "border-[#2563eb]" : "border-border hover:border-[#2563eb]/60"
              }`}
            >
              <span className="truncate text-foreground text-left text-xs">{passagersLabel}</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${showPassagers ? "rotate-180" : ""}`} />
            </button>

            {showPassagers && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-white shadow-2xl p-4 space-y-2"
                   style={{ zIndex: 9999 }}>

                {/* Compteurs */}
                {[
                  { label: "Adultes", sub: "12 ans +", val: adultes, set: setAdultes, min: 1, max: 9 },
                  { label: "Enfants", sub: "2–11 ans", val: enfants, set: setEnfants, min: 0, max: 8 },
                ].map(({ label, sub, val, set, min, max }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => set((v: number) => Math.max(min, v - 1))}
                        disabled={val <= min}
                        className="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center text-base font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      >−</button>
                      <span className="w-5 text-center text-sm font-bold text-gray-800">{val}</span>
                      <button
                        onClick={() => set((v: number) => Math.min(max, v + 1))}
                        disabled={val >= max}
                        className="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center text-base font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      >+</button>
                    </div>
                  </div>
                ))}

                {/* Classe */}
                <div className="pt-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Classe</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Économique", "Affaires", "Première", "Premium Eco"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setClasse(c)}
                        className={`py-2 text-xs font-medium rounded-xl border transition-colors ${
                          classe === c
                            ? "bg-[#2563eb] text-white border-[#2563eb]"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowPassagers(false)}
                  className="w-full rounded-xl bg-[#2563eb] py-2.5 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-colors"
                >
                  Confirmer
                </button>
              </div>
            )}
          </div>

          {/* ── Bouton Rechercher ── */}
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#2563eb] px-6 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-all active:scale-95 whitespace-nowrap shrink-0 md:self-end"
          >
            <Search className="h-4 w-4" />
            Rechercher
          </button>

        </div>
      </div>
    </div>
  );
}
