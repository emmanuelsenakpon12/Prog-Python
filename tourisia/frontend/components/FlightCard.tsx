"use client";

import { Plane, Clock, Users } from "lucide-react";
import Link from "next/link";

export interface Flight {
  id: number;
  compagnie: string;
  logo?: string;
  depart_iata: string;
  depart_ville: string;
  arrivee_iata: string;
  arrivee_ville: string;
  heure_depart: string;
  heure_arrivee: string;
  duree: string;
  escales: number;
  classe: string;
  prix: number | string;
  devise: string;
  places_disponibles: number;
}

export function FlightCard({ flight }: { flight: Flight }) {
  const prix = Number(flight.prix).toLocaleString("fr-FR");

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-0 rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      {/* Bande compagnie */}
      <div className="flex sm:flex-col items-center justify-center gap-3 sm:gap-2 bg-[#2563eb]/5 border-b sm:border-b-0 sm:border-r border-border px-5 py-4 sm:px-4 sm:py-6 sm:w-36 shrink-0">
        {flight.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flight.logo} alt={flight.compagnie} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb] text-white font-bold text-sm">
            {flight.compagnie.charAt(0)}
          </div>
        )}
        <p className="text-xs font-bold text-center text-foreground leading-tight">{flight.compagnie}</p>
        <span className="text-[10px] font-medium text-muted-foreground capitalize">{flight.classe}</span>
      </div>

      {/* Infos vol */}
      <div className="flex flex-1 flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4">
        {/* Départ */}
        <div className="text-center sm:text-left">
          <p className="text-2xl font-bold text-foreground tabular-nums">{flight.heure_depart}</p>
          <p className="text-sm font-semibold text-[#2563eb]">{flight.depart_iata}</p>
          <p className="text-xs text-muted-foreground">{flight.depart_ville}</p>
        </div>

        {/* Durée + flèche */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <p className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Clock className="h-3 w-3" />
            {flight.duree}
          </p>
          <div className="flex items-center gap-1 w-full max-w-[140px]">
            <div className="flex-1 h-px bg-border" />
            <Plane className="h-4 w-4 text-[#2563eb] rotate-90" />
            <div className="flex-1 h-px bg-border" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {flight.escales === 0 ? "Direct" : `${flight.escales} escale${flight.escales > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Arrivée */}
        <div className="text-center sm:text-right">
          <p className="text-2xl font-bold text-foreground tabular-nums">{flight.heure_arrivee}</p>
          <p className="text-sm font-semibold text-[#2563eb]">{flight.arrivee_iata}</p>
          <p className="text-xs text-muted-foreground">{flight.arrivee_ville}</p>
        </div>
      </div>

      {/* Prix + CTA */}
      <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 sm:gap-2 border-t sm:border-t-0 sm:border-l border-border px-5 py-4 sm:px-6 sm:py-6 sm:w-44 shrink-0 bg-muted/20">
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-medium">À partir de</p>
          <p className="text-xl font-bold text-[#2563eb] tabular-nums">{prix}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">{flight.devise}</p>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Link
            href={`/vols/${flight.id}`}
            className="rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d4ed8] transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <Plane className="h-3 w-3" />
            Réserver ce vol
          </Link>
          {flight.places_disponibles <= 5 && flight.places_disponibles > 0 && (
            <p className="text-[10px] text-red-500 font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              {flight.places_disponibles} places restantes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
