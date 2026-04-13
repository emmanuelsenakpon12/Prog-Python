"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export function PersonalizedSection() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRandomOffers();
  }, []);

  const fetchRandomOffers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}offers/get_offers.php`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        // Shuffle and take max 4
        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 4);
        setOffers(shuffled);
      }
    } catch (err) {
      console.error("Failed to fetch personalized offers", err);
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
      <h2 className="text-2xl font-bold text-foreground">
        Personnalisé pour vous
      </h2>

      {isLoading ? (
        <div className="mt-8 flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2563eb]" />
        </div>
      ) : offers.length === 0 ? (
        <p className="mt-8 text-center text-muted-foreground">
          Aucune offre disponible pour le moment.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {offers.map((offer) => (
            <a
              key={offer.id}
              href="/offers"
              className="group relative aspect-[3/4] overflow-hidden rounded-xl block"
            >
              <Image
                src={offer.images && offer.images.length > 0 ? getFileUrl(offer.images[0]) : "/images/placeholder.jpg"}
                alt={offer.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70 capitalize">
                  {offer.type}
                </span>
                <h3 className="mt-0.5 text-sm font-bold text-white md:text-base line-clamp-2">
                  {offer.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
