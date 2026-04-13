"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Star,
  Heart,
  MapPin,
  SlidersHorizontal,
  Search,
  ChevronDown,
  X,
  Play,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { AddToItineraryButton } from "@/components/itinerary/add-to-itinerary-button";

// Categories are now standard
const categories = [
  { id: "all", label: "Toutes les offres" },
  { id: "herbergement", label: "Hébergements" },
  { id: "transport", label: "Transport" },
  { id: "activite", label: "Activités" },
  { id: "circuit", label: "Circuits" },
];

const sortOptions = [
  { id: "recommended", label: "Recommandé" },
  { id: "price-low", label: "Prix ​​: du plus bas au plus élevé" },
  { id: "price-high", label: "Prix ​​: du plus élevé au plus bas" },
  { id: "rating", label: "Les mieux notés" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= Math.floor(rating)
            ? "fill-amber-400 text-amber-400"
            : star <= rating
              ? "fill-amber-400/50 text-amber-400"
              : "fill-muted text-muted"
            }`}
        />
      ))}
    </div>
  );
}

function OffersPageContent() {
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSort, setShowSort] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 12;
  const [favorites, setFavorites] = useState<number[]>([]);
  const [userReservations, setUserReservations] = useState<number[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userPartnerId, setUserPartnerId] = useState<number | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    // Pre-populate from URL params (coming from hero search)
    const urlLocation = searchParams.get("location");
    const urlType = searchParams.get("type");
    if (urlLocation) setSearchQuery(urlLocation);
    if (urlType) setActiveCategory(urlType);
  }, [searchParams]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchFavorites(parsedUser.id);
      fetchUserReservations(parsedUser.id);
      fetchPartnerStatus(parsedUser.id);
    }
    fetchOffers();
  }, []);

  const fetchPartnerStatus = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}partners/check_partner_status.php?user_id=${userId}`);
      const data = await res.json();
      if (res.ok && data.hasPartnerAccount) {
        setUserPartnerId(data.partner_id);
      }
    } catch (err) {
      console.error("Error fetching partner status", err);
    }
  };

  const fetchFavorites = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_user_favorites.php?user_id=${userId}`);
      const data = await res.json();
      if (res.ok) {
        setFavorites(data.map((f: any) => Number(f.id)));
      }
    } catch (err) {
      console.error("Error fetching favorites", err);
    }
  };

  const fetchUserReservations = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_user_reservations.php?user_id=${userId}`);
      const data = await res.json();
      if (res.ok) {
        // Track only offer_ids that are not cancelled
        setUserReservations(data.filter((r: any) => r.status !== 'cancelled').map((r: any) => Number(r.offer_id)));
      }
    } catch (err) {
      console.error("Error fetching reservations", err);
    }
  };

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_offers.php`);
      const data = await res.json();
      if (res.ok) {
        setOffers(data);
      }
    } catch (err) {
      toast.error("Erreur de chargement des offres.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (offerId: number) => {
    if (!user) {
      toast.error("Veuillez vous connecter pour ajouter des favoris.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/toggle_favorite.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, offer_id: offerId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFavorites((prev) =>
          data.is_favorite ? [...prev, offerId] : prev.filter((id) => id !== offerId)
        );
      }
    } catch (err) {
      toast.error("Erreur lors de la mise à jour des favoris.");
    }
  };

  const handleBooking = async (offerId: number) => {
    toast.info("La réservation directe est temporairement désactivée. Veuillez contacter le partenaire par message.");
    return;
  };

  const filtered = offers
    .filter((o) => activeCategory === "all" || o.type === activeCategory)
    .filter(
      (o) =>
        o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.location.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      switch (sortBy) {
        case "price-low":
          return priceA - priceB;
        case "price-high":
          return priceB - priceA;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  const getFileUrl = (path: string) => {
    if (!path) return "";
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / offersPerPage);
  const startIndex = (currentPage - 1) * offersPerPage;
  const currentOffers = filtered.slice(startIndex, startIndex + offersPerPage);

  // Auto-scroll to top when page changes
  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero banner */}
        <section className="relative overflow-hidden bg-[#2563eb]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
            <h1 className="text-center text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
              Offres et promotions exclusives
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base text-white/80 leading-relaxed">
              Faites de grosses économies sur des séjours, des circuits et des
              expériences triés sur le volet. Ces offres à durée limitée sont
              mises à jour chaque semaine.
            </p>
          </div>
        </section>

        {/* Search & filters */}
        <section className="sticky top-[64px] z-30 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher une destination..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background py-2 sm:py-2.5 pl-10 pr-4 text-sm focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide -mx-1 px-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`whitespace-nowrap rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold transition-all ${activeCategory === cat.id
                        ? "bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20 scale-105"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex w-full md:w-48 items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 sm:px-4 sm:py-2.5 text-[11px] sm:text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{sortOptions.find((o) => o.id === sortBy)?.label}</span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform ${showSort ? "rotate-180" : ""}`} />
                </button>

                {showSort && (
                  <div className="absolute right-0 top-full mt-2 w-full md:w-48 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSortBy(option.id);
                          setShowSort(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-[11px] sm:text-xs transition-colors ${sortBy === option.id
                          ? "bg-[#2563eb]/10 text-[#2563eb] font-bold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Results count */}
        <section className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
          <p className="text-sm text-muted-foreground">
            Affichage{" "}
            <span className="font-semibold text-foreground">
              {filtered.length}
            </span>{" "}
            Offres
          </p>
        </section>

        {/* Offers grid */}
        <section className="mx-auto max-w-7xl px-3 py-6 lg:px-8 lg:py-8">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {currentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={offer.images && offer.images.length > 0 ? getFileUrl(offer.images[0]) : "/images/placeholder.jpg"}
                      alt={offer.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <span
                      className="absolute top-2 left-2 rounded-md bg-[#2563eb]/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-xs font-semibold text-white capitalize shadow-sm"
                    >
                      {offer.type}
                    </span>
                    {offer.partner_id !== userPartnerId && (
                      <button
                        onClick={() => toggleFavorite(offer.id)}
                        className={`absolute top-2 right-2 flex h-7 w-7 sm:h-8 sm:w-8 sm:top-3 sm:right-3 items-center justify-center rounded-full backdrop-blur-sm transition-colors z-10 ${favorites.includes(offer.id)
                          ? "bg-red-500 text-white"
                          : "bg-card/60 text-foreground hover:bg-card/80"
                          }`}
                        aria-label={`Save ${offer.title} to favorites`}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${favorites.includes(offer.id) ? "fill-current" : ""}`}
                        />
                      </button>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <StarRating rating={4.5} />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        (New)
                      </span>
                    </div>
                    <h3 className="mt-1.5 sm:mt-2 font-semibold text-foreground text-sm sm:text-base truncate leading-snug">
                      {offer.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {offer.location}
                    </div>

                    <div className="mt-auto pt-3 sm:pt-4">
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-0.5 sm:gap-1">
                            <span className="text-sm sm:text-lg font-bold text-[#2563eb]">
                              {offer.price}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">
                              {offer.currency}
                            </span>
                          </div>
                          <AddToItineraryButton offerId={offer.id} />
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOffer(offer);
                            setShowDetailModal(true);
                          }}
                          className="rounded-lg border border-[#2563eb] px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold text-[#2563eb] hover:bg-[#2563eb] hover:text-white transition-all transform active:scale-95 whitespace-nowrap"
                        >
                          Voir plus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2 border-t border-border pt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  // Show current page, edges, and one page around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === pageNum
                          ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/20"
                          : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return <span key={pageNum} className="px-1 text-muted-foreground">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Aucune offre trouvée
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Essayez de modifier vos critères de recherche ou de filtrage.
              </p>
            </div>
          )}
        </section>

        {/* Newsletter banner */}
        <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
          <div className="rounded-2xl bg-[#2563eb] px-6 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-bold text-white">
              Ne ratez jamais une bonne affaire
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/80 leading-relaxed">
              Abonnez-vous pour recevoir chaque semaine des offres exclusives et
              des idées de voyage directement dans votre boîte mail.
            </p>
            <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 rounded-lg border-0 bg-white/15 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#2563eb] transition-colors hover:bg-white/90">
                S'abonner
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Offer Detail Modal */}
      {showDetailModal && selectedOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-hidden">
          <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-card shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            {/* Header Sticky */}
            <div className="sticky top-0 z-30 flex items-center justify-between p-4 sm:p-6 border-b border-border bg-card/95 backdrop-blur-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden sm:flex h-12 w-12 rounded-xl bg-[#2563eb]/10 items-center justify-center text-[#2563eb]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold truncate max-w-[150px] xs:max-w-[200px] sm:max-w-md">
                    {selectedOffer.title}
                  </h2>
                  <p className="text-[10px] sm:text-sm text-muted-foreground capitalize">
                    {selectedOffer.location} • {selectedOffer.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AddToItineraryButton offerId={selectedOffer.id} />
                {selectedOffer.partner_id !== userPartnerId && (
                  <button
                    onClick={() => toggleFavorite(selectedOffer.id)}
                    className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl transition-colors ${favorites.includes(selectedOffer.id)
                      ? "bg-red-50 text-red-500"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${favorites.includes(selectedOffer.id) ? "fill-current" : ""}`} />
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
              {/* Media Gallery (Preview) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
                <div className="space-y-4">
                  <div className="relative aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-border group">
                    <img
                      src={selectedOffer.images && selectedOffer.images.length > 0 ? getFileUrl(selectedOffer.images[0]) : "/images/placeholder.jpg"}
                      alt={selectedOffer.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black/60 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full uppercase tracking-wider">
                      {selectedOffer.images?.length || 0} Photos
                    </div>
                  </div>

                  {/* Thumbnail row */}
                  {selectedOffer.images && selectedOffer.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {selectedOffer.images.slice(1, 5).map((img: string, idx: number) => (
                        <div key={idx} className="aspect-square rounded-lg sm:rounded-xl overflow-hidden border border-border ring-2 ring-transparent hover:ring-[#2563eb] transition-all cursor-pointer">
                          <img
                            src={getFileUrl(img)}
                            className="w-full h-full object-cover"
                            alt="thumb"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedOffer.video && (
                    <div className="rounded-xl sm:rounded-2xl border border-[#2563eb]/20 bg-[#2563eb]/5 p-4 sm:p-6 flex flex-col items-center gap-3 sm:gap-4 text-center">
                      <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-[#2563eb] text-white flex items-center justify-center shadow-lg shadow-[#2563eb]/30">
                        <Play className="h-4 w-4 sm:h-6 sm:w-6 fill-current" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-bold">Vidéo disponible</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Découvrez l'offre en mouvement</p>
                      </div>
                      <a
                        href={getFileUrl(selectedOffer.video)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#2563eb] text-white text-[11px] sm:text-xs font-bold hover:bg-[#1d4ed8] transition-all"
                      >
                        Regarder la vidéo
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-6 sm:space-y-8">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                      A propos de l'offre
                    </h3>
                    <div className="prose prose-sm text-muted-foreground leading-relaxed text-xs sm:text-sm">
                      {selectedOffer.description || "Aucune description disponible pour le moment."}
                    </div>
                  </div>

                  {selectedOffer.details && typeof selectedOffer.details === 'object' && Object.keys(selectedOffer.details).length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                        Caractéristiques
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedOffer.details).map(([key, val], idx) => (
                          <div key={idx} className="bg-muted/50 border border-border px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground flex items-center gap-2">
                            {key} <span className="text-muted-foreground font-normal">•</span> {String(val)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 border border-border">
                      <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase mb-0.5 sm:mb-1">Prix de base</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base sm:text-xl font-bold text-[#2563eb]">{selectedOffer.price}</span>
                        <span className="text-[10px] sm:text-xs font-bold">{selectedOffer.currency}</span>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-green-500/5 border border-green-500/10">
                      <p className="text-[9px] sm:text-[10px] font-bold text-green-600 uppercase mb-0.5 sm:mb-1">Disponibilité</p>
                      <p className="text-xs sm:text-sm font-bold text-green-700">Immédiate</p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-[#2563eb] text-white space-y-4 shadow-xl shadow-[#2563eb]/20">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-white/70 font-bold uppercase">Réservation</p>
                        <p className="text-xs sm:text-sm font-bold">Planifiez votre visite</p>
                      </div>
                    </div>
                    {selectedOffer.partner_id === userPartnerId ? (
                      <div className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl text-[12px] sm:text-sm font-bold bg-transparent border border-white/40 text-white/80 cursor-not-allowed flex items-center justify-center">
                        Ceci est votre annonce
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleBooking(selectedOffer.id)}
                          className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl text-[12px] sm:text-sm font-bold transition-all flex items-center justify-center gap-2 group bg-gray-100 text-gray-400 cursor-not-allowed"
                        >
                          Réserver
                        </button>

                        {selectedOffer.selected_plan !== "Gratuit" && (
                          <button
                            onClick={() => router.push(`/profile?tab=messagerie&partner_id=${selectedOffer.partner_id}`)}
                            className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl text-[12px] sm:text-sm font-bold transition-all flex items-center justify-center gap-2 border border-white/30 bg-white/10 hover:bg-white/20 text-white"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Discuter avec le partenaire
                          </button>
                        )}

                        <p className="text-[9px] sm:text-[10px] text-center text-white/60">
                          En cliquant sur le bouton, vous enregistrez votre réservation auprès du partenaire.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 p-4 sm:p-6 border-t border-border bg-card/95 backdrop-blur-sm flex items-center justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full sm:w-auto px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-[12px] sm:text-sm font-bold border border-border hover:bg-muted transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OffersPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
      </div>
    }>
      <OffersPageContent />
    </Suspense>
  );
}
