"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Activity,
  Calendar,
  Building2,
  ExternalLink,
  Loader2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function PartnerActivities() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [id]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}admin/get_partner_activities.php?partner_id=${id}`,
      );
      const result = await res.json();
      if (res.ok) {
        setData(result);
      } else {
        toast.error(result.message || "Erreur lors de la récupération.");
        router.push("/admin/partners");
      }
    } catch (err) {
      toast.error("Erreur serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
      </div>
    );
  }

  if (!data) return null;

  const { partner, activities } = data;
  const { stats, recent_actions, offers = [] } = activities;

  const OfferCarousel = ({ images, title }: { images: string[]; title: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
      return (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <Package className="h-8 w-8 text-muted-foreground/30" />
        </div>
      );
    }

    const next = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prev = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
      <div className="relative w-full h-full group/carousel overflow-hidden">
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL}${images[currentIndex]}`}
          alt={`${title} - image ${currentIndex + 1}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover/carousel:scale-105"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 backdrop-blur-md text-white opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-black/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 backdrop-blur-md text-white opacity-0 group-hover/carousel:opacity-100 transition-all hover:bg-black/50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-3 rounded-full transition-all ${i === currentIndex ? "bg-white w-5" : "bg-white/40"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 ">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux partenaires
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb]">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h1 className="text-3xl font-bold">
                    {partner.business_name}
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  Monitoring des activités et performances en temps réel.
                </p>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Vues totales
                </p>
              </div>
              <p className="text-2xl font-bold">
                {activities.stats.total_views}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs text-green-600 font-medium">
                <TrendingUp className="h-3 w-3" />
                +12% ce mois
              </div>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Réservations
                </p>
              </div>
              <p className="text-2xl font-bold">
                {activities.stats.total_bookings}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Confirmées</p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Chiffre d'affaires
                </p>
              </div>
              <p className="text-2xl font-bold">{activities.stats.revenue}</p>
              <p className="mt-2 text-xs text-muted-foreground">Total généré</p>
            </div>

            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Offres actives
                </p>
              </div>
              <p className="text-2xl font-bold">
                {activities.stats.active_offers}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                En ligne actuellement
              </p>
            </div>
          </div>

          {/* Activity Log & Publications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Activity Log */}
            <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold italic">Journal d'activités</h2>
                <p className="text-sm text-muted-foreground">
                  Dernières actions sur le compte.
                </p>
              </div>
              <div className="divide-y divide-border overflow-y-auto max-h-[500px]">
                {recent_actions.length > 0 ? (
                  recent_actions.map((action: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 flex items-start gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="mt-1 h-2 w-2 rounded-full bg-[#2563eb] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <p className="font-bold text-xs truncate">{action.action}</p>
                          <span className="text-[10px] text-muted-foreground font-medium shrink-0 uppercase">
                            {new Date(action.date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {action.details}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-muted-foreground text-sm italic">
                    Aucune activité récente.
                  </div>
                )}
              </div>
            </section>

            {/* Publications List */}
            <section className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold italic">Publications ({offers.length})</h2>
                <p className="text-sm text-muted-foreground">
                  Offres et services en ligne.
                </p>
              </div>
              <div className="p-4 overflow-y-auto max-h-[500px] space-y-4">
                {offers.length > 0 ? (
                  offers.map((offer: any) => (
                    <div
                      key={offer.id}
                      className="flex gap-4 p-3 rounded-2xl border border-border bg-muted/5 group hover:bg-muted/10 transition-all"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-border bg-muted">
                        <OfferCarousel images={offer.images} title={offer.title} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-sm truncate">{offer.title}</h4>
                            <span className="text-xs font-bold text-[#2563eb] shrink-0">
                              {offer.price} {offer.currency}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-2">
                            <MapPin className="h-3 w-3" /> {offer.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground capitalize">
                            {offer.type}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Publié le {new Date(offer.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-muted-foreground text-sm italic">
                    Aucune publication pour le moment.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Quick Info & Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-sm">
              <h3 className="text-lg font-bold mb-6">Résumé du compte</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
                      Responsable
                    </p>
                    <p className="font-medium">{partner.manager_name}</p>
                    <p className="text-muted-foreground text-xs">
                      {partner.manager_email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
                      Localisation
                    </p>
                    <p className="text-muted-foreground">
                      {partner.city}, {partner.country}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
                      Date d'inscription
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(partner.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
                      Type d'activité
                    </p>
                    <span className="inline-block px-2 py-1 rounded bg-muted text-xs font-medium capitalize">
                      {partner.activity_type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#2563eb] to-[#123e9c] p-8 rounded-2xl text-white shadow-xl shadow-blue-500/20 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase opacity-80 mb-2">
                  Abonnement
                </p>
                <h3 className="text-2xl font-bold mb-4">
                  {partner.selected_plan}
                </h3>
                <div className="space-y-3 opacity-90 text-sm">
                  <p className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    Accès aux statistiques détaillées
                  </p>
                  <p className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    Support prioritaire 24/7
                  </p>
                  <p className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    Visibilité accrue
                  </p>
                </div>
              </div>
              <button className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold border border-white/20 transition-all">
                Ajuster le plan
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
