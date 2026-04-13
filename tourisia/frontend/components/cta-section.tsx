export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-[#2563eb] px-6 py-16 text-center md:px-16">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute right-0 bottom-0 h-60 w-60 rounded-full bg-white/5 blur-2xl" />

        <div className="relative">
          <h2 className="text-balance text-2xl font-bold text-white md:text-3xl">
            Prêt à commencer votre voyage ?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-sm text-white/80 md:text-base">
            Rejoignez plus de 10 millions de voyageurs qui découvrent nos
            merveilles avec Tourisia. Inscrivez-vous aujourd'hui et bénéficiez
            de 15 % de réduction sur votre première réservation.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#2563eb] transition-colors hover:bg-white/90">
              Commencez maintenant
            </button>
            <button className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              Apprendre encore plus
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
