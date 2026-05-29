"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Star, Heart, MapPin, Search,
  X, Play, Calendar, Loader2,
  ChevronLeft, ChevronRight, MessageSquare,
  BedDouble, Bath, Maximize2, Home, Car,
  Wind, Waves, Wifi, UtensilsCrossed, Tv, Shield, TreePine, Coffee, Mountain,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { AddToItineraryButton } from "@/components/itinerary/add-to-itinerary-button";
import { subHours, format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";


function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.floor(rating) ? "fill-amber-400 text-amber-400"
            : star <= rating ? "fill-amber-400/50 text-amber-400"
            : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

/* ── Carousel d'images pour chaque carte ── */
function OfferCardImages({
  images,
  title,
  getFileUrl,
}: {
  images: string[];
  title: string;
  getFileUrl: (p: string) => string;
}) {
  const [current, setCurrent] = useState(0);
  const imgs = images && images.length > 0 ? images : [];

  if (imgs.length === 0) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
        <MapPin className="h-10 w-10 text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden group/carousel">
      <Image
        src={getFileUrl(imgs[current])}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {imgs.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((p) => (p === 0 ? imgs.length - 1 : p - 1)); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 hover:bg-black/70"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((p) => (p === imgs.length - 1 ? 0 : p + 1)); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10 hover:bg-black/70"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`h-1.5 rounded-full transition-all ${i === current ? "bg-white w-3" : "bg-white/50 w-1.5"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const EQUIPEMENTS_LIST = [
  { key: "wifi",          label: "WiFi",              icon: Wifi },
  { key: "piscine",       label: "Piscine",           icon: Waves },
  { key: "climatisation", label: "Climatisation",     icon: Wind },
  { key: "parking",       label: "Parking",           icon: Car },
  { key: "cuisine",       label: "Cuisine équipée",   icon: UtensilsCrossed },
  { key: "tv",            label: "TV",                icon: Tv },
  { key: "securite",      label: "Sécurité 24h",      icon: Shield },
  { key: "terrasse",      label: "Terrasse",          icon: TreePine },
  { key: "petit_dejeuner",label: "Petit-déjeuner",    icon: Coffee },
  { key: "vue_mer",       label: "Vue mer/montagne",  icon: Mountain },
];

function OffersPageContent() {
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 12;
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalImg, setModalImg] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [userPartnerId, setUserPartnerId] = useState<number | null>(null);
  const reservationWidgetRef = useRef<HTMLDivElement>(null);
  const [dateArrivee, setDateArrivee] = useState("");
  const [dateDepart, setDateDepart] = useState("");
  const [reservationConfirmee, setReservationConfirmee] = useState(false);
  const [reservationError, setReservationError] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
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
      if (res.ok && data.hasPartnerAccount) setUserPartnerId(data.partner_id);
    } catch (err) { console.error(err); }
  };

  const fetchFavorites = async (userId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_user_favorites.php?user_id=${userId}`);
      const data = await res.json();
      if (res.ok) setFavorites(data.map((f: any) => Number(f.id)));
    } catch (err) { console.error(err); }
  };

  const fetchUserReservations = async (_userId: number) => {
    // réservations chargées dans le profil uniquement
  };

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_offers.php`);
      const data = await res.json();
      if (res.ok) setOffers(data);
    } catch { toast.error("Erreur de chargement des offres."); }
    finally { setIsLoading(false); }
  };

  const toggleFavorite = async (offerId: number) => {
    if (!user) { toast.error("Veuillez vous connecter pour ajouter des favoris."); return; }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/toggle_favorite.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, offer_id: offerId }),
      });
      const data = await res.json();
      if (res.ok) setFavorites((prev) => data.is_favorite ? [...prev, offerId] : prev.filter((id) => id !== offerId));
    } catch { toast.error("Erreur lors de la mise à jour des favoris."); }
  };

  const getFileUrl = (path: string) => {
    if (!path) return "";
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  const filtered = offers
    .filter((o) => activeCategory === "all" || o.type === activeCategory)
    .filter((o) =>
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort(() => 0);

  const totalPages = Math.ceil(filtered.length / offersPerPage);
  const startIndex = (currentPage - 1) * offersPerPage;
  const currentOffers = filtered.slice(startIndex, startIndex + offersPerPage);

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModal = (offer: any) => {
    setSelectedOffer(offer);
    setModalImg(0);
    setDateArrivee("");
    setDateDepart("");
    setReservationConfirmee(false);
    setReservationError("");
    setShowDetailModal(true);
  };

  const today = new Date().toISOString().split("T")[0];

  const cancellationDeadline = (() => {
    if (!dateArrivee) return null;
    try { return subHours(new Date(dateArrivee), 72); } catch { return null; }
  })();

  const peutReserver = dateArrivee !== "" && dateDepart !== "";

  const nombreNuits = peutReserver
    ? Math.max(0, differenceInDays(new Date(dateDepart), new Date(dateArrivee)))
    : 0;

  const prixTotal = nombreNuits * parseFloat(selectedOffer?.price || "0");

  useEffect(() => {
    if (showDetailModal) {
      setTimeout(() => {
        reservationWidgetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    }
  }, [showDetailModal]);

  const handleReserver = async () => {
    if (!peutReserver) return;
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/login"); return; }
    const user = JSON.parse(stored);
    if (!user?.id) { router.push("/login"); return; }

    setReservationError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/add_reservation.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer_id: selectedOffer.id,
          user_id: user.id,
          date_arrivee: dateArrivee,
          date_depart: dateDepart,
          nombre_nuits: nombreNuits,
          nombre_adultes: 1,
          nombre_enfants: 0,
          prix_total: prixTotal,
          devise: selectedOffer.currency || "CFA",
          statut: "en_attente",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReservationConfirmee(true);
        toast.success("Réservation enregistrée !");
      } else {
        setReservationError(data.message || "Erreur lors de la réservation.");
      }
    } catch {
      setReservationError("Erreur réseau, veuillez réessayer.");
    }
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
              Faites de grosses économies sur des séjours, des circuits et des expériences triés sur le volet.
            </p>
          </div>
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
                  {/* Carousel images */}
                  <div className="relative">
                    <OfferCardImages
                      images={offer.images || []}
                      title={offer.title}
                      getFileUrl={getFileUrl}
                    />
                    <span className="absolute top-2 left-2 z-10 rounded-md bg-[#2563eb]/90 backdrop-blur-sm px-1.5 py-0.5 text-[10px] sm:top-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-xs font-semibold text-white capitalize shadow-sm">
                      {offer.type}
                    </span>
                    {offer.partner_id !== userPartnerId && (
                      <button
                        onClick={() => toggleFavorite(offer.id)}
                        className={`absolute top-2 right-2 z-10 flex h-7 w-7 sm:h-8 sm:w-8 sm:top-3 sm:right-3 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
                          favorites.includes(offer.id) ? "bg-red-500 text-white" : "bg-card/60 text-foreground hover:bg-card/80"
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${favorites.includes(offer.id) ? "fill-current" : ""}`} />
                      </button>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <StarRating rating={4.5} />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">(New)</span>
                    </div>
                    <h3 className="mt-1.5 sm:mt-2 font-semibold text-foreground text-sm sm:text-base truncate leading-snug">{offer.title}</h3>
                    <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {offer.location}
                    </div>
                    <div className="mt-auto pt-3 sm:pt-4">
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-0.5 sm:gap-1">
                            <span className="text-sm sm:text-lg font-bold text-[#2563eb]">{offer.price}</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">{offer.currency}</span>
                          </div>
                          <AddToItineraryButton offerId={offer.id} />
                        </div>
                        <button
                          onClick={() => openModal(offer)}
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

          {/* Pagination */}
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
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          currentPage === pageNum ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/20" : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
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
              <h3 className="mt-4 text-lg font-semibold text-foreground">Aucune offre trouvée</h3>
              <p className="mt-1 text-sm text-muted-foreground">Essayez de modifier vos critères de recherche ou de filtrage.</p>
            </div>
          )}
        </section>

        {/* Newsletter banner */}
        <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
          <div className="rounded-2xl bg-[#2563eb] px-6 py-12 text-center sm:px-12">
            <h2 className="text-2xl font-bold text-white">Ne ratez jamais une bonne affaire</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/80 leading-relaxed">
              Abonnez-vous pour recevoir chaque semaine des offres exclusives directement dans votre boîte mail.
            </p>
            <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Entrez votre adresse email"
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

      {/* ── Offer Detail Modal ── */}
      {showDetailModal && selectedOffer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-hidden">
          <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-card shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="sticky top-0 z-30 flex items-center justify-between p-4 sm:p-6 border-b border-border bg-card/95 backdrop-blur-sm">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden sm:flex h-12 w-12 rounded-xl bg-[#2563eb]/10 items-center justify-center text-[#2563eb]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold truncate max-w-[150px] xs:max-w-[200px] sm:max-w-md">{selectedOffer.title}</h2>
                  <p className="text-[10px] sm:text-sm text-muted-foreground capitalize">{selectedOffer.location} • {selectedOffer.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AddToItineraryButton offerId={selectedOffer.id} />
                {selectedOffer.partner_id !== userPartnerId && (
                  <button
                    onClick={() => toggleFavorite(selectedOffer.id)}
                    className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl transition-colors ${
                      favorites.includes(selectedOffer.id) ? "bg-red-50 text-red-500" : "bg-muted text-muted-foreground hover:text-foreground"
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

            {/* ── Modal body: herbergement rich layout vs standard ── */}
            {selectedOffer.type === "herbergement" ? (() => {
              const det: Record<string, any> = (selectedOffer.details && typeof selectedOffer.details === "object") ? selectedOffer.details : {};
              const equip: string[] = Array.isArray(det.equipements)
                ? det.equipements
                : typeof det.equipements === "string"
                ? det.equipements.split(",").map((s: string) => s.trim()).filter(Boolean)
                : [];
              const imgs: string[] = selectedOffer.images || [];
              return (
                <div className="p-4 sm:p-6 space-y-6">

                  {/* Gallery: large photo left + 2 thumbnails right */}
                  {imgs.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 h-60 sm:h-72 rounded-2xl overflow-hidden">
                      <div className="col-span-2 relative group">
                        <img src={getFileUrl(imgs[modalImg] ?? imgs[0])} alt={selectedOffer.title} className="w-full h-full object-cover" />
                        {imgs.length > 1 && (
                          <>
                            <button onClick={() => setModalImg(p => p === 0 ? imgs.length - 1 : p - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-all">
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button onClick={() => setModalImg(p => p === imgs.length - 1 ? 0 : p + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-all">
                              <ChevronRight className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{modalImg + 1} / {imgs.length}</div>
                          </>
                        )}
                      </div>
                      <div className="grid grid-rows-2 gap-2">
                        {[imgs[1], imgs[2]].map((img, i) => img ? (
                          <div key={i} className="relative cursor-pointer overflow-hidden" onClick={() => setModalImg(i + 1)}>
                            <img src={getFileUrl(img)} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="" />
                            {i === 1 && imgs.length > 3 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-xl font-bold">+{imgs.length - 3}</span>
                              </div>
                            )}
                          </div>
                        ) : <div key={i} className="bg-muted" />)}
                      </div>
                    </div>
                  )}

                  {/* Quick info bar */}
                  {(det.nb_chambres || det.nb_salles_bain || det.surface || det.type_etablissement) && (
                    <div className="flex flex-wrap gap-x-6 gap-y-3 py-4 border-y border-border">
                      {det.nb_chambres && <div className="flex items-center gap-2"><BedDouble className="h-5 w-5 text-[#2563eb]" /><div><p className="text-[10px] text-muted-foreground">Chambres</p><p className="text-sm font-semibold">{det.nb_chambres}</p></div></div>}
                      {det.nb_salles_bain && <div className="flex items-center gap-2"><Bath className="h-5 w-5 text-[#2563eb]" /><div><p className="text-[10px] text-muted-foreground">Salles de bain</p><p className="text-sm font-semibold">{det.nb_salles_bain}</p></div></div>}
                      {det.surface && <div className="flex items-center gap-2"><Maximize2 className="h-5 w-5 text-[#2563eb]" /><div><p className="text-[10px] text-muted-foreground">Surface</p><p className="text-sm font-semibold">{det.surface} m²</p></div></div>}
                      {det.type_etablissement && <div className="flex items-center gap-2"><Home className="h-5 w-5 text-[#2563eb]" /><div><p className="text-[10px] text-muted-foreground">Type</p><p className="text-sm font-semibold capitalize">{det.type_etablissement}</p></div></div>}
                      <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-[#2563eb]" /><div><p className="text-[10px] text-muted-foreground">Lieu</p><p className="text-sm font-semibold">{selectedOffer.location}</p></div></div>
                    </div>
                  )}

                  {/* Main 2-col: left content + right reservation */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: description + details + equipment */}
                    <div className="lg:col-span-2 space-y-6">
                      <section>
                        <h2 className="text-base sm:text-lg font-bold mb-3">Description</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedOffer.description || "Aucune description disponible."}</p>
                      </section>

                      <section className="rounded-2xl border border-border p-4 sm:p-5">
                        <h2 className="text-base sm:text-lg font-bold mb-4">Détails du bien</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm">
                          <div className="flex gap-2 items-center"><span className="text-muted-foreground text-xs w-28 shrink-0">Prix / nuit</span><span className="font-semibold text-[#2563eb]">{selectedOffer.price} {selectedOffer.currency}</span></div>
                          {det.type_etablissement && <div className="flex gap-2 items-center"><span className="text-muted-foreground text-xs w-28 shrink-0">Type</span><span className="capitalize">{det.type_etablissement}</span></div>}
                          {det.nb_chambres && <div className="flex gap-2 items-center"><span className="text-muted-foreground text-xs w-28 shrink-0">Chambres</span><span>{det.nb_chambres}</span></div>}
                          {det.nb_salles_bain && <div className="flex gap-2 items-center"><span className="text-muted-foreground text-xs w-28 shrink-0">Salles de bain</span><span>{det.nb_salles_bain}</span></div>}
                          {det.nb_lits && <div className="flex gap-2 items-center"><span className="text-muted-foreground text-xs w-28 shrink-0">Lits</span><span>{det.nb_lits}</span></div>}
                          {det.surface && <div className="flex gap-2 items-center"><span className="text-muted-foreground text-xs w-28 shrink-0">Surface</span><span>{det.surface} m²</span></div>}
                          {(det.capacite_adultes || det.capacite_enfants) && <div className="flex gap-2 items-center"><span className="text-muted-foreground text-xs w-28 shrink-0">Capacité</span><span>{det.capacite_adultes ?? 0} adultes, {det.capacite_enfants ?? 0} enfants</span></div>}
                          {det.checkin && <div className="flex gap-2 items-center"><span className="text-muted-foreground text-xs w-28 shrink-0">Check-in</span><span>{det.checkin}</span></div>}
                          {det.checkout && <div className="flex gap-2 items-center"><span className="text-muted-foreground text-xs w-28 shrink-0">Check-out</span><span>{det.checkout}</span></div>}
                          {det.animaux && <div className="flex gap-2 items-center"><span className="text-muted-foreground text-xs w-28 shrink-0">Animaux</span><span className="capitalize">{det.animaux}</span></div>}
                          {det.fumeurs && <div className="flex gap-2 items-center"><span className="text-muted-foreground text-xs w-28 shrink-0">Fumeurs</span><span className="capitalize">{det.fumeurs}</span></div>}
                        </div>
                      </section>

                      {equip.length > 0 && (
                        <section>
                          <h2 className="text-base sm:text-lg font-bold mb-4">Équipements</h2>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {EQUIPEMENTS_LIST.map(eq => {
                              const included = equip.includes(eq.key);
                              return (
                                <div key={eq.key} className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm ${included ? "bg-[#2563eb]/5 text-foreground" : "text-muted-foreground/40"}`}>
                                  <eq.icon className={`h-4 w-4 shrink-0 ${included ? "text-[#2563eb]" : ""}`} />
                                  <span className={`text-xs ${included ? "font-medium" : "line-through"}`}>{eq.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      )}

                      {selectedOffer.video && (
                        <section className="rounded-2xl border border-[#2563eb]/20 bg-[#2563eb]/5 p-4 flex flex-col items-center gap-3 text-center">
                          <div className="h-12 w-12 rounded-full bg-[#2563eb] text-white flex items-center justify-center"><Play className="h-5 w-5 fill-current" /></div>
                          <a href={getFileUrl(selectedOffer.video)} target="_blank" rel="noreferrer" className="px-6 py-2.5 rounded-xl bg-[#2563eb] text-white text-xs font-bold hover:bg-[#1d4ed8] transition-all">Regarder la vidéo</a>
                        </section>
                      )}
                    </div>

                    {/* Right: sticky reservation widget */}
                    <div className="lg:col-span-1">
                      <div className="lg:sticky lg:top-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-muted/30 border border-border">
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1">Prix / nuit</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-bold text-[#2563eb]">{selectedOffer.price}</span>
                              <span className="text-[10px] font-bold">{selectedOffer.currency}</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                            <p className="text-[9px] font-bold text-green-600 uppercase mb-1">Disponibilité</p>
                            <p className="text-xs font-bold text-green-700">Immédiate</p>
                          </div>
                        </div>
                        <div ref={reservationWidgetRef} className="p-5 rounded-2xl bg-[#2563eb] text-white space-y-4 shadow-xl shadow-[#2563eb]/20">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center"><Calendar className="h-5 w-5" /></div>
                            <div><p className="text-[10px] text-white/70 font-bold uppercase">Réservation</p><p className="text-sm font-bold">Planifiez votre séjour</p></div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-white/70 font-bold uppercase">Date d'arrivée</label>
                            <input type="date" value={dateArrivee} min={today} onChange={(e) => { setDateArrivee(e.target.value); if (dateDepart && e.target.value >= dateDepart) setDateDepart(""); }} className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40 [color-scheme:dark]" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-white/70 font-bold uppercase">Date de départ</label>
                            <input type="date" value={dateDepart} min={dateArrivee || today} onChange={(e) => setDateDepart(e.target.value)} className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40 [color-scheme:dark]" />
                          </div>
                          {peutReserver && nombreNuits > 0 && (
                            <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 text-sm">
                              <span className="text-white/80">{nombreNuits} nuit{nombreNuits > 1 ? "s" : ""}</span>
                              <span className="font-bold">{prixTotal.toLocaleString()} {selectedOffer.currency}</span>
                            </div>
                          )}
                          {cancellationDeadline && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                              <p className="text-amber-800 font-medium text-xs">ℹ️ Politique d'annulation</p>
                              <p className="text-amber-700 text-xs font-bold mt-1">Annulation gratuite jusqu'au {format(cancellationDeadline, "dd MMMM yyyy 'à' HH'h'mm", { locale: fr })}</p>
                            </div>
                          )}
                          {reservationConfirmee && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center"><p className="text-green-700 font-bold text-sm">Réservation confirmée !</p><p className="text-green-600 text-xs mt-1">Suivez votre réservation dans votre profil.</p></div>}
                          {reservationError && <p className="text-red-300 text-xs text-center">{reservationError}</p>}
                          {selectedOffer.partner_id === userPartnerId ? (
                            <div className="w-full py-3 rounded-xl text-sm font-bold bg-transparent border border-white/40 text-white/80 cursor-not-allowed flex items-center justify-center">Ceci est votre annonce</div>
                          ) : (
                            <>
                              <button onClick={handleReserver} disabled={!peutReserver || reservationConfirmee} className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${peutReserver && !reservationConfirmee ? "bg-white text-[#2563eb] hover:bg-blue-50" : "bg-white/30 text-white/50 cursor-not-allowed"}`}>{reservationConfirmee ? "Réservé ✓" : "Réserver"}</button>
                              {selectedOffer.selected_plan !== "Gratuit" && (
                                <button onClick={() => router.push(`/profile?tab=messagerie&partner_id=${selectedOffer.partner_id}`)} className="w-full py-3 rounded-xl text-sm font-bold border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2"><MessageSquare className="h-4 w-4" />Discuter avec le partenaire</button>
                              )}
                              <p className="text-[10px] text-center text-white/60">En cliquant sur Réserver, vous enregistrez votre réservation auprès du partenaire.</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })() : (

              /* ── Standard layout for other offer types ── */
              <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
                  <div className="space-y-4">
                    {selectedOffer.images && selectedOffer.images.length > 0 ? (
                      <>
                        <div className="relative aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-border group">
                          <img src={getFileUrl(selectedOffer.images[modalImg])} alt={selectedOffer.title} className="w-full h-full object-cover" />
                          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full">{modalImg + 1} / {selectedOffer.images.length}</div>
                          {selectedOffer.images.length > 1 && (
                            <>
                              <button onClick={() => setModalImg((p) => (p === 0 ? selectedOffer.images.length - 1 : p - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                              <button onClick={() => setModalImg((p) => (p === selectedOffer.images.length - 1 ? 0 : p + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                            </>
                          )}
                        </div>
                        {selectedOffer.images.length > 1 && (
                          <div className="grid grid-cols-4 gap-2 sm:gap-3">
                            {selectedOffer.images.slice(0, 4).map((img: string, idx: number) => (
                              <div key={idx} onClick={() => setModalImg(idx)} className={`aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${idx === modalImg ? "border-[#2563eb]" : "border-transparent hover:border-[#2563eb]/50"}`}>
                                <img src={getFileUrl(img)} className="w-full h-full object-cover" alt="thumb" />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="aspect-[16/9] rounded-xl bg-muted flex items-center justify-center"><MapPin className="h-12 w-12 text-muted-foreground/30" /></div>
                    )}
                    {selectedOffer.video && (
                      <div className="rounded-xl sm:rounded-2xl border border-[#2563eb]/20 bg-[#2563eb]/5 p-4 sm:p-6 flex flex-col items-center gap-3 text-center">
                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-[#2563eb] text-white flex items-center justify-center"><Play className="h-4 w-4 sm:h-6 sm:w-6 fill-current" /></div>
                        <a href={getFileUrl(selectedOffer.video)} target="_blank" rel="noreferrer" className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#2563eb] text-white text-[11px] sm:text-xs font-bold hover:bg-[#1d4ed8] transition-all">Regarder la vidéo</a>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-bold">A propos de l'offre</h3>
                      <div className="prose prose-sm text-muted-foreground leading-relaxed text-xs sm:text-sm">{selectedOffer.description || "Aucune description disponible pour le moment."}</div>
                    </div>

                    {selectedOffer.details && typeof selectedOffer.details === "object" && Object.keys(selectedOffer.details).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-base sm:text-lg font-bold">Caractéristiques</h3>
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
                        <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase mb-1">Prix de base</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base sm:text-xl font-bold text-[#2563eb]">{selectedOffer.price}</span>
                          <span className="text-[10px] sm:text-xs font-bold">{selectedOffer.currency}</span>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-green-500/5 border border-green-500/10">
                        <p className="text-[9px] sm:text-[10px] font-bold text-green-600 uppercase mb-1">Disponibilité</p>
                        <p className="text-xs sm:text-sm font-bold text-green-700">Immédiate</p>
                      </div>
                    </div>

                    <div ref={reservationWidgetRef} className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-[#2563eb] text-white space-y-4 shadow-xl shadow-[#2563eb]/20">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center"><Calendar className="h-4 w-4 sm:h-5 sm:w-5" /></div>
                        <div><p className="text-[10px] sm:text-xs text-white/70 font-bold uppercase">Réservation</p><p className="text-xs sm:text-sm font-bold">Planifiez votre visite</p></div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/70 font-bold uppercase">Date d'arrivée</label>
                        <input type="date" value={dateArrivee} min={today} onChange={(e) => { setDateArrivee(e.target.value); if (dateDepart && e.target.value >= dateDepart) setDateDepart(""); }} className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40 [color-scheme:dark]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-white/70 font-bold uppercase">Date de départ</label>
                        <input type="date" value={dateDepart} min={dateArrivee || today} onChange={(e) => setDateDepart(e.target.value)} className="w-full rounded-lg bg-white/20 border border-white/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40 [color-scheme:dark]" />
                      </div>
                      {peutReserver && nombreNuits > 0 && (
                        <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 text-sm">
                          <span className="text-white/80">{nombreNuits} nuit{nombreNuits > 1 ? "s" : ""}</span>
                          <span className="font-bold">{prixTotal.toLocaleString()} {selectedOffer.currency}</span>
                        </div>
                      )}
                      {cancellationDeadline && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                          <p className="text-amber-800 font-medium text-xs">ℹ️ Politique d'annulation</p>
                          <p className="text-amber-700 text-xs font-bold mt-1">Annulation gratuite jusqu'au {format(cancellationDeadline, "dd MMMM yyyy 'à' HH'h'mm", { locale: fr })}</p>
                          <p className="text-amber-600 text-[10px] mt-1">⚠️ Passé ce délai, l'annulation ne sera plus possible.</p>
                        </div>
                      )}
                      {reservationConfirmee && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center"><p className="text-green-700 font-bold text-sm">Réservation confirmée !</p><p className="text-green-600 text-xs mt-1">Vous pouvez suivre votre réservation dans votre profil.</p></div>}
                      {reservationError && <p className="text-red-300 text-xs text-center">{reservationError}</p>}
                      {selectedOffer.partner_id === userPartnerId ? (
                        <div className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl text-[12px] sm:text-sm font-bold bg-transparent border border-white/40 text-white/80 cursor-not-allowed flex items-center justify-center">Ceci est votre annonce</div>
                      ) : (
                        <>
                          <button onClick={handleReserver} disabled={!peutReserver || reservationConfirmee} className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl text-[12px] sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${peutReserver && !reservationConfirmee ? "bg-white text-[#2563eb] hover:bg-blue-50 cursor-pointer" : "bg-white/30 text-white/50 cursor-not-allowed"}`}>{reservationConfirmee ? "Réservé ✓" : "Réserver"}</button>
                          {selectedOffer.selected_plan !== "Gratuit" && (
                            <button onClick={() => router.push(`/profile?tab=messagerie&partner_id=${selectedOffer.partner_id}`)} className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl text-[12px] sm:text-sm font-bold transition-all flex items-center justify-center gap-2 border border-white/30 bg-white/10 hover:bg-white/20 text-white"><MessageSquare className="h-4 w-4" />Discuter avec le partenaire</button>
                          )}
                          <p className="text-[9px] sm:text-[10px] text-center text-white/60">En cliquant sur Réserver, vous enregistrez votre réservation auprès du partenaire.</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
