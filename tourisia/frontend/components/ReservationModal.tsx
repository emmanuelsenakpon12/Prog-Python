"use client";

import { useState } from "react";
import { X, Users, CalendarCheck, AlertCircle, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { ReservationCalendar } from "@/components/ReservationCalendar";

interface ReservationModalProps {
  offer: {
    id: number;
    title: string;
    price: number;
    currency: string;
    location: string;
  };
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReservationModal({ offer, userId, onClose, onSuccess }: ReservationModalProps) {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [nights, setNights] = useState(0);
  const [total, setTotal] = useState(0);
  const [personnes, setPersonnes] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"calendar" | "recap">("calendar");

  const handleRangeChange = (r: DateRange | undefined, n: number, t: number) => {
    setRange(r);
    setNights(n);
    setTotal(t);
  };

  const handleConfirm = async () => {
    if (!range?.from || !range?.to || nights < 1) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/add_reservation.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          offer_id: offer.id,
          date_arrivee: format(range.from, "yyyy-MM-dd"),
          date_depart: format(range.to, "yyyy-MM-dd"),
          nombre_nuits: nights,
          nombre_personnes: personnes,
          prix_total: total,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Réservation effectuée avec succès !");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Erreur lors de la réservation.");
      }
    } catch {
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-sm">
          <div>
            <h2 className="text-base font-bold text-foreground">Réserver une date</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{offer.title} · {offer.location}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {step === "calendar" ? (
            <>
              <ReservationCalendar
                offerId={offer.id}
                pricePerNight={offer.price}
                currency={offer.currency}
                onRangeChange={handleRangeChange}
              />

              {/* Persons */}
              {nights > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Nombre de personnes
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPersonnes((p) => Math.max(1, p - 1))}
                      className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-sm hover:bg-muted transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{personnes}</span>
                    <button
                      onClick={() => setPersonnes((p) => Math.min(20, p + 1))}
                      className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-sm hover:bg-muted transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Annulation gratuite jusqu'à 48h avant l'arrivée. Au-delà, l'annulation n'est plus possible.
                </p>
              </div>

              <button
                disabled={!range?.from || !range?.to || nights < 1}
                onClick={() => setStep("recap")}
                className="w-full py-3 rounded-xl text-sm font-bold bg-[#2563eb] text-white transition-all hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continuer vers le récapitulatif
              </button>
            </>
          ) : (
            /* Recap step */
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-[#2563eb]" />
                Récapitulatif de votre réservation
              </h3>

              <div className="rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Arrivée</p>
                    <p className="text-sm font-bold text-foreground">
                      {range?.from ? format(range.from, "dd MMM yyyy", { locale: fr }) : "—"}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Départ</p>
                    <p className="text-sm font-bold text-foreground">
                      {range?.to ? format(range.to, "dd MMM yyyy", { locale: fr }) : "—"}
                    </p>
                  </div>
                </div>
                <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Durée</p>
                    <p className="text-sm font-bold text-foreground">{nights} nuit{nights > 1 ? "s" : ""}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Personnes</p>
                    <p className="text-sm font-bold text-foreground">{personnes}</p>
                  </div>
                </div>
                <div className="border-t border-border px-4 py-3 bg-[#2563eb]/5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {offer.price.toLocaleString()} {offer.currency} × {nights} nuit{nights > 1 ? "s" : ""}
                    </p>
                    <p className="text-base font-bold text-[#2563eb]">
                      {total.toLocaleString()} {offer.currency}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Votre réservation sera en attente de confirmation par le partenaire. Vous recevrez une notification dès qu'elle sera validée.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("calendar")}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold border border-border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Modifier
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirmer la réservation"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
