"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  MapPin,
  ArrowRight,
  Search,
  Thermometer,
  Calendar,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const continents = [
  { id: "all", label: "Tous" },
  { id: "europe", label: "Europe" },
  { id: "asia", label: "Asie" },
  { id: "africa", label: "Afrique" },
  { id: "americas", label: "Amerique" },
  { id: "oceania", label: "Oceanie" },
];

const destinations = [
  {
    id: 1,
    name: "Ganvié",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Ganvi%C3%A9_Benin.jpg/1280px-Ganvi%C3%A9_Benin.jpg?20160810174134",
    description:
      "Village lacustre sur pilotis sur le lac Nokoué — marchés flottants, balades en pirogue et immersion dans la vie locale.",
    temperature: "28C",
    bestTime: "Nov - Mar",
    travelers: "100k+ (approx.)",
    featured: true,
  },
  {
    id: 2,
    name: "Ouidah",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/A_la_porte_de_non_retour_%C3%A0_Ouidah.jpg/1280px-A_la_porte_de_non_retour_%C3%A0_Ouidah.jpg?20190305085335",
    description:
      "Ville historique sur la Route des Esclaves : Porte du Non-Retour, musées, sites vaudou et plages tranquilles.",
    temperature: "27C",
    bestTime: "Nov - Mar",
    travelers: "80k+ (approx.)",
    featured: true,
  },
  {
    id: 3,
    name: "Abomey",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Royal_Palaces_of_Abomey-133471.jpg/1280px-Royal_Palaces_of_Abomey-133471.jpg?20170419114516",
    description:
      "Siège des anciens royaumes dahoméens — palais royaux classés UNESCO et riche patrimoine historique.",
    temperature: "28C",
    bestTime: "Nov - Mar",
    travelers: "50k+ (approx.)",
    featured: true,
  },
  {
    id: 4,
    name: "Cotonou (Fidjrossè)",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Fidjross%C3%A8_Plage_%28Cotonou%29.jpg/1200px-Fidjross%C3%A8_Plage_%28Cotonou%29.jpg?20190215114503",
    description:
      "Centre économique du pays : plages (Fidjrossè), grand marché Dantokpa, lagune et vie urbaine animée.",
    temperature: "29C",
    bestTime: "Nov - Mar",
    travelers: "300k+ (approx.)",
    featured: false,
  },
  {
    id: 5,
    name: "Porto-Novo",
    country: "Benin",
    continent: "africa",
    image:
      "https://commons.wikimedia.orhttps://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Palais_royal_de_Migan_%C3%A0_Porto-Novo.jpg/1280px-Palais_royal_de_Migan_%C3%A0_Porto-Novo.jpg?20240807113055g/wiki/File:Palais_royal_de_Migan_%C3%A0_Porto-Novo.jpg",
    description:
      "Capitale officielle avec musées (Musée Honmè), architecture coloniale et scènes culturelles vivantes.",
    temperature: "28C",
    bestTime: "Nov - Mar",
    travelers: "40k+ (approx.)",
    featured: false,
  },
  {
    id: 6,
    name: "Grand-Popo",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/Beach_seiner_in_Grand-Popo_Benin.jpg?20200129170827",
    description:
      "Plages paisibles, mangroves et traditions vaudou — idéal pour se détendre et observer la pêche locale.",
    temperature: "28C",
    bestTime: "Nov - Mar",
    travelers: "30k+ (approx.)",
    featured: false,
  },
  {
    id: 7,
    name: "Pendjari National Park",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Elephants_Pendjari_National_Park.jpg/1280px-Elephants_Pendjari_National_Park.jpg?20120812005429",
    description:
      "Parc national renommé pour les safaris : éléphants, lions, antilopes et milliers d'oiseaux.",
    temperature: "30C",
    bestTime: "Nov - Feb (saison sèche pour safaris)",
    travelers: "25k+ (approx.)",
    featured: true,
  },
  {
    id: 8,
    name: "Natitingou (Tata Somba)",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Des_tata_somba_Natitingou.jpg/1280px-Des_tata_somba_Natitingou.jpg?20190610180055",
    description:
      "Paysages d'Atacora et villages Tata Somba — architecture fortifiée traditionnelle et randonnées.",
    temperature: "27C",
    bestTime: "Nov - Mar",
    travelers: "20k+ (approx.)",
    featured: false,
  },
  {
    id: 9,
    name: "Dassa-Zoumé",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Vue_de_Dassa_depuis_la_colline_de_Kamat%C3%A9.jpg/1280px-Vue_de_Dassa_depuis_la_colline_de_Kamat%C3%A9.jpg",
    description:
      "Collines et sites religieux, panoramas depuis la colline de Kamaté et milieu rural authentique.",
    temperature: "26C",
    bestTime: "Nov - Mar",
    travelers: "10k+ (approx.)",
    featured: false,
  },
  {
    id: 10,
    name: "Allada",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Une_entr%C3%A9e_du_Palais_royal_d%E2%80%99Allada.jpg/1280px-Une_entr%C3%A9e_du_Palais_royal_d%E2%80%99Allada.jpg?20190924071013",
    description:
      "Ancienne capitale du royaume d'Allada — palais royal, cérémonies traditionnelles et fêtes du vodoun.",
    temperature: "28C",
    bestTime: "Nov - Mar",
    travelers: "15k+ (approx.)",
    featured: false,
  },
  {
    id: 11,
    name: "Bohicon",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/March%C3%A9_noir_de_Bohicon.jpg/1280px-March%C3%A9_noir_de_Bohicon.jpg?20131027213650",
    description:
      "Ville commerçante importante : marché animé, vie locale et proximité d'Abomey.",
    temperature: "28C",
    bestTime: "Nov - Mar",
    travelers: "12k+ (approx.)",
    featured: false,
  },
  {
    id: 12,
    name: "Malanville",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/On_the_edge_from_the_Niger_river%2C_Malanville.jpg/1280px-On_the_edge_from_the_Niger_river%2C_Malanville.jpg",
    description:
      "Ville du nord-est au bord du fleuve Niger, marchés transfrontaliers et paysages fluviaux.",
    temperature: "32C",
    bestTime: "Nov - Feb",
    travelers: "8k+ (approx.)",
    featured: false,
  },
  {
    id: 13,
    name: "Tanguiéta",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Tanguieta-Monument_et_mosqu%C3%A9e.jpg/1280px-Tanguieta-Monument_et_mosqu%C3%A9e.jpg",
    description:
      "Ville-gare vers le Parc de la Pendjari et paysages de l'Atacora — base pour safaris et randos.",
    temperature: "27C",
    bestTime: "Nov - Feb",
    travelers: "7k+ (approx.)",
    featured: false,
  },
  {
    id: 14,
    name: "Lokossa",
    country: "Benin",
    continent: "africa",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Lokossa.jpg/1280px-Lokossa.jpg?20210630071814",
    description:
      "Préfecture du Mono — marchés, vie culturelle et point d'accès aux côtes du sud-ouest.",
    temperature: "28C",
    bestTime: "Nov - Mar",
    travelers: "9k+ (approx.)",
    featured: false,
  },
];

export default function DestinationsPage() {
  const [activeContinent, setActiveContinent] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const featured = destinations.filter((d) => d.featured);

  const filtered = destinations
    .filter((d) => activeContinent === "all" || d.continent === activeContinent)
    .filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/hero-mountains.png"
              alt="Travel destinations"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/70" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
            <h1 className="text-center text-3xl font-bold text-white sm:text-4xl lg:text-5xl text-balance">
              Découvrez votre prochaine destination
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base text-white/80 leading-relaxed">
              Explorez plus de 130 destinations et trouvez l'endroit idéal pour
              votre prochaine aventure. Des plages tropicales aux sommets
              enneigés, nous avons tout.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher des destinations ou des pays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border-0 bg-card py-3.5 pl-12 pr-4 text-sm text-foreground shadow-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured destinations */}
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#2563eb]">
                Tendance actuelle
              </p>
              <h2 className="mt-1 text-2xl font-bold text-foreground">
                Destinations vedettes
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Large featured card */}
            <div className="group relative overflow-hidden rounded-2xl lg:col-span-2 lg:row-span-2">
              <div className="aspect-[16/10] lg:aspect-auto lg:h-full">
                <Image
                  src={featured[0].image}
                  alt={featured[0].name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-white/80" />
                    <span className="text-sm text-white/80">
                      {featured[0].country}
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl font-bold text-white lg:text-3xl">
                    {featured[0].name}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-white/80 leading-relaxed">
                    {featured[0].description}
                  </p>
                  <button className="mt-4 flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-white/90">
                    Explorer
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Smaller featured cards */}
            {featured.slice(1).map((dest) => (
              <div
                key={dest.id}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="aspect-[16/10]">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-white/80" />
                      <span className="text-xs text-white/80">
                        {dest.country}
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-white">
                      {dest.name}
                    </h3>
                    <p className="mt-1 text-xs text-white/70 leading-relaxed line-clamp-2">
                      {dest.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All destinations */}
        <section className="bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground">
              Toutes les destinations
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Parcourez les continents ou recherchez la destination de vos
              rêves.
            </p>

            {/* Continent filter */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {continents.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveContinent(c.id)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${activeContinent === c.id
                    ? "bg-[#2563eb] text-white"
                    : "bg-card text-muted-foreground border border-border hover:border-[#2563eb]/30 hover:text-foreground"
                    }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Destination cards */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((dest) => (
                <div
                  key={dest.id}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        {dest.name}
                      </h3>
                      <span className="rounded-full bg-[#2563eb]/10 px-2.5 py-0.5 text-xs font-medium text-[#2563eb]">
                        {dest.continent.charAt(0).toUpperCase() +
                          dest.continent.slice(1)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {dest.country}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {dest.description}
                    </p>

                    {/* Quick info */}
                    <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
                      <div
                        className="flex items-center gap-1"
                        title="Average Temperature"
                      >
                        <Thermometer className="h-3.5 w-3.5 text-[#2563eb]" />
                        <span className="text-xs text-muted-foreground">
                          {dest.temperature}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1"
                        title="Best Time to Visit"
                      >
                        <Calendar className="h-3.5 w-3.5 text-[#2563eb]" />
                        <span className="text-xs text-muted-foreground">
                          {dest.bestTime}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1"
                        title="Annual Travelers"
                      >
                        <Users className="h-3.5 w-3.5 text-[#2563eb]" />
                        <span className="text-xs text-muted-foreground">
                          {dest.travelers}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/offers"
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8]"
                    >
                      Voir les offres
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <MapPin className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Aucune destination trouvée
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Essayez de rechercher une autre destination ou un autre
                  continent.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-[#2563eb] px-6 py-14 text-center sm:px-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl text-balance">
              {"Vous ne trouvez pas ce que vous cherchez ?"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/80 leading-relaxed">
              Nos experts en voyages peuvent vous aider à planifier le voyage
              parfait vers n'importe quelle destination dans le monde.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-[#2563eb] transition-colors hover:bg-white/90">
                Parlez à un expert
              </button>
              <button className="rounded-lg border border-white/30 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                Parcourir tout
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
