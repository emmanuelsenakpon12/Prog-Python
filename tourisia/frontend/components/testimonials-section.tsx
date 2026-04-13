import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote:
      "La meilleure plateforme de voyage que j'aie jamais utilisée. La réservation s'est faite sans le moindre problème et la vérification des prestataires m'a vraiment rassurée.",
    name: "Sarah Jenkins",
    role: "Backpacker & Photographer",
    avatar: "SJ",
    avatarBg: "bg-[#e0e7ff]",
    avatarText: "text-[#2563eb]",
  },
  {
    id: 2,
    quote:
      "J'ai trouvé une offre incroyable pour nos vacances en famille au Bénin. Le service client était disponible 24h/24 et 7j/7 et nous a aidés pour tout.",
    name: "David Chen",
    role: "Business Consultant",
    avatar: "DC",
    avatarBg: "bg-[#fef3c7]",
    avatarText: "text-[#d97706]",
  },
  {
    id: 3,
    quote:
      "Être présent sur cette plateforme a transformé la vie de mon petit restaurant. La visibilité que nous obtenons est incroyable.",
    name: "Elena Rodriguez",
    role: "Local Tour Operator",
    avatar: "ER",
    avatarBg: "bg-[#d1fae5]",
    avatarText: "text-[#059669]",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-secondary py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Approuvé par les voyageurs du monde entier
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Découvrez ce que notre communauté a à dire sur ses aventures.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="rounded-xl bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${t.avatarBg} text-xs font-bold ${t.avatarText}`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
