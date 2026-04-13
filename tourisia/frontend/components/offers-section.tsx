"use client";

import { useEffect, useState } from "react";
import { Star, Heart, MapPin, Loader2 } from "lucide-react";
import Image from "next/image";

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

export function OffersSection() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLatestOffers();
  }, []);

  const fetchLatestOffers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_offers.php`);
      const data = await res.json();
      if (res.ok) {
        // Sort by ID descending (newest first) and take top 3
        const sorted = data.sort((a: any, b: any) => b.id - a.id).slice(0, 3);
        setOffers(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch latest offers", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileUrl = (path: string) => {
    if (!path) return "/images/placeholder.jpg";
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Offres de la semaine
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Offres exclusives pour une durée limitée seulement.
          </p>
        </div>
        <a
          href="/offers"
          className="hidden text-sm font-medium text-[#2563eb] transition-colors hover:text-[#1d4ed8] sm:inline-flex items-center gap-1"
        >
          Voir toutes les offres &rarr;
        </a>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
          </div>
        ) : offers.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-10">
            Aucune offre disponible pour le moment.
          </div>
        ) : (
          offers.map((offer) => (
            <a
              key={offer.id}
              href="/offers"
              className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg block"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={offer.images && offer.images.length > 0 ? getFileUrl(offer.images[0]) : "/images/placeholder.jpg"}
                  alt={offer.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span
                  className="absolute top-3 left-3 rounded-md bg-[#2563eb] px-2.5 py-1 text-xs font-semibold text-white capitalize shadow-sm"
                >
                  {offer.type}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={4.8} />
                  <span className="text-xs text-muted-foreground">
                    (Nouveau)
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-foreground truncate">
                  {offer.title}
                </h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground line-clamp-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {offer.location}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-[#2563eb]">
                      {offer.price}
                    </span>
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      {offer.currency}
                    </span>
                  </div>
                  <button
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-[#2563eb]"
                    aria-label={`Save ${offer.title} to favorites`}
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      <a
        href="/offers"
        className="mt-6 block text-center text-sm font-medium text-[#2563eb] sm:hidden"
      >
        Voir toutes les offres &rarr;
      </a>
    </section>
  );
}
