"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Plane, Clock, Users, ArrowLeft, Loader2, Calendar,
  MapPin, CheckCircle2, AlertCircle, Luggage,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface FlightDetail {
  id: number;
  compagnie: string;
  logo?: string;
  depart_iata: string;
  depart_ville: string;
  arrivee_iata: string;
  arrivee_ville: string;
  date_depart: string;
  date_arrivee: string;
  heure_depart: string;
  heure_arrivee: string;
  duree: string;
  escales: number;
  classe: string;
  prix: number;
  devise: string;
  places_disponibles: number;
  places_total: number;
}

export default function FlightDetailPage() {
  const params = useParams();
  const router = useRouter();
  const flightId = params?.id;

  const [flight, setFlight] = useState<FlightDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passagers, setPassagers] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (!flightId) return;
    const fetchFlight = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}flights/get_flights.php?id=${flightId}`);
        const data = await res.json();
        if (res.ok && (data.flight || (data.flights && data.flights[0]))) {
          setFlight(data.flight || data.flights[0]);
        }
      } catch {
        toast.error("Erreur lors du chargement du vol.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlight();
  }, [flightId]);

  const prixTotal = flight ? Number(flight.prix) * passagers : 0;

  // Deadline annulation 72h avant départ
  const deadlineAnnulation = flight?.date_depart
    ? new Date(new Date(flight.date_depart).getTime() - 72 * 3600000)
    : null;

  const handleBook = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour réserver.");
      router.push("/login");
      return;
    }
    if (!flight) return;
    setIsBooking(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}flights/book_flight.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flight_id: flight.id,
          user_id: user.id,
          nombre_passagers: passagers,
          classe: flight.classe,
          prix_total: prixTotal,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Vol réservé avec succès !");
        router.push("/profile?tab=reservations");
      } else {
        toast.error(data.message || "Erreur lors de la réservation.");
      }
    } catch {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-semibold">Vol introuvable</p>
          <Link href="/vols" className="text-[#2563eb] hover:underline text-sm">← Retour aux vols</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        {/* Retour */}
        <Link href="/vols" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour aux résultats
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Détails du vol */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {flight.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={flight.logo} alt={flight.compagnie} className="h-12 w-12 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb] text-white font-bold text-lg">
                      {flight.compagnie.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-foreground">{flight.compagnie}</p>
                    <p className="text-xs text-muted-foreground capitalize">{flight.classe}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${flight.escales === 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {flight.escales === 0 ? "Vol direct" : `${flight.escales} escale${flight.escales > 1 ? "s" : ""}`}
                </span>
              </div>

              {/* Itinéraire */}
              <div className="flex items-center justify-between gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold tabular-nums text-foreground">{flight.heure_depart}</p>
                  <p className="text-lg font-bold text-[#2563eb]">{flight.depart_iata}</p>
                  <p className="text-sm text-muted-foreground">{flight.depart_ville}</p>
                  {flight.date_depart && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(flight.date_depart).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center gap-2">
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {flight.duree}
                  </p>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 h-0.5 bg-border" />
                    <Plane className="h-5 w-5 text-[#2563eb] rotate-90" />
                    <div className="flex-1 h-0.5 bg-border" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {flight.escales === 0 ? "Direct" : `${flight.escales} escale${flight.escales > 1 ? "s" : ""}`}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-3xl font-bold tabular-nums text-foreground">{flight.heure_arrivee}</p>
                  <p className="text-lg font-bold text-[#2563eb]">{flight.arrivee_iata}</p>
                  <p className="text-sm text-muted-foreground">{flight.arrivee_ville}</p>
                  {flight.date_arrivee && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(flight.date_arrivee).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Infos bagages */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Luggage className="h-5 w-5 text-[#2563eb]" />
                Informations bagages
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Bagage cabine", desc: "1 sac à main + 1 bagage (max 10 kg)" },
                  { label: "Bagage en soute", desc: flight.classe === "Économique" ? "Payant (15 – 25 kg)" : "Inclus (23 kg)" },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Politique d'annulation */}
            {deadlineAnnulation && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-6 space-y-2">
                <h3 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Politique d'annulation
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-500">
                  Annulation <strong>GRATUITE</strong> jusqu'au :{" "}
                  <strong>
                    {deadlineAnnulation.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </strong>
                </p>
                <p className="text-xs text-amber-600">⚠️ Passé ce délai, l'annulation ne sera plus possible.</p>
              </div>
            )}
          </div>

          {/* Panneau réservation */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 sticky top-20">
              <div className="text-center pb-4 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Prix par passager</p>
                <p className="text-3xl font-bold text-[#2563eb] mt-1">
                  {Number(flight.prix).toLocaleString()}
                </p>
                <p className="text-xs font-bold text-muted-foreground uppercase">{flight.devise}</p>
              </div>

              {/* Passagers */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Passagers</p>
                  <p className="text-xs text-muted-foreground">{flight.places_disponibles} places disponibles</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPassagers((p) => Math.max(1, p - 1))} disabled={passagers <= 1}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30">−</button>
                  <span className="w-5 text-center font-bold tabular-nums">{passagers}</span>
                  <button onClick={() => setPassagers((p) => Math.min(flight.places_disponibles, p + 1))} disabled={passagers >= flight.places_disponibles}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30">+</button>
                </div>
              </div>

              {/* Total */}
              <div className="rounded-xl bg-[#2563eb]/5 border border-[#2563eb]/20 p-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total ({passagers} passager{passagers > 1 ? "s" : ""})</span>
                <span className="text-lg font-bold text-[#2563eb]">
                  {prixTotal.toLocaleString()} <span className="text-xs font-bold">{flight.devise}</span>
                </span>
              </div>

              <button
                onClick={handleBook}
                disabled={isBooking || flight.places_disponibles === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] py-3 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isBooking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plane className="h-4 w-4" />}
                {flight.places_disponibles === 0 ? "Complet" : "Confirmer la réservation"}
              </button>

              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  <Link href="/login" className="text-[#2563eb] hover:underline font-medium">Connectez-vous</Link> pour réserver ce vol.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
