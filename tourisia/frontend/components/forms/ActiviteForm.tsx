"use client";

interface Props {
  details: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

const TYPES_ACTIVITE = [
  { id: "visite_guidee", label: "Visite guidée" },
  { id: "sport_nautique", label: "Sport nautique" },
  { id: "randonnee", label: "Randonnée" },
  { id: "safari", label: "Safari" },
  { id: "atelier", label: "Atelier/Cours" },
  { id: "spectacle", label: "Spectacle" },
  { id: "gastronomie", label: "Gastronomie" },
];

const NIVEAUX = [
  { id: "tous_niveaux", label: "Tous niveaux" },
  { id: "intermediaire", label: "Intermédiaire" },
  { id: "expert", label: "Expert" },
];

const JOURS = [
  { id: "lun", label: "Lun" },
  { id: "mar", label: "Mar" },
  { id: "mer", label: "Mer" },
  { id: "jeu", label: "Jeu" },
  { id: "ven", label: "Ven" },
  { id: "sam", label: "Sam" },
  { id: "dim", label: "Dim" },
];

const INCLUS_OPTIONS = [
  { id: "transport", label: "Transport" },
  { id: "repas", label: "Repas" },
  { id: "equipement", label: "Équipement" },
  { id: "guide", label: "Guide" },
  { id: "assurance", label: "Assurance" },
  { id: "photos", label: "Photos souvenir" },
];

const ANNULATION_OPTIONS = [
  { id: "24h", label: "24h" },
  { id: "48h", label: "48h" },
  { id: "non_remboursable", label: "Non remboursable" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h5 className="text-sm font-bold text-foreground border-l-4 border-[#2563eb] pl-3 mt-6 mb-3">
      {children}
    </h5>
  );
}

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        active
          ? "bg-[#2563eb] text-white"
          : "border border-border text-muted-foreground hover:border-[#2563eb]/50"
      }`}
    >
      {children}
    </button>
  );
}

export function ActiviteForm({ details, onChange }: Props) {
  const jours: string[] = details.jours || [];
  const inclus: string[] = details.inclus || [];

  const toggleJour = (id: string) => {
    if (jours.includes(id)) {
      onChange("jours", jours.filter((j) => j !== id));
    } else {
      onChange("jours", [...jours, id]);
    }
  };

  const toggleInclus = (id: string) => {
    if (inclus.includes(id)) {
      onChange("inclus", inclus.filter((i) => i !== id));
    } else {
      onChange("inclus", [...inclus, id]);
    }
  };

  return (
    <div>
      <SectionTitle>Type d'activité</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {TYPES_ACTIVITE.map(({ id, label }) => (
          <PillButton
            key={id}
            active={details.type_activite === id}
            onClick={() => onChange("type_activite", id)}
          >
            {label}
          </PillButton>
        ))}
      </div>

      <SectionTitle>Détails</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Durée (ex: 2h, Demi-journée)
          </label>
          <input
            type="text"
            value={details.duree ?? ""}
            onChange={(e) => onChange("duree", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Capacité max / session
          </label>
          <input
            type="number"
            min={1}
            value={details.capacite_session ?? ""}
            onChange={(e) => onChange("capacite_session", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Âge minimum requis
          </label>
          <input
            type="number"
            min={0}
            value={details.age_minimum ?? ""}
            onChange={(e) => onChange("age_minimum", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Niveau
          </label>
          <div className="flex flex-wrap gap-2">
            {NIVEAUX.map(({ id, label }) => (
              <PillButton
                key={id}
                active={details.niveau === id}
                onClick={() => onChange("niveau", id)}
              >
                {label}
              </PillButton>
            ))}
          </div>
        </div>
      </div>

      <SectionTitle>Horaires</SectionTitle>
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
          Horaires disponibles (ex: 09:00, 14:00)
        </label>
        <input
          type="text"
          value={details.horaires ?? ""}
          onChange={(e) => onChange("horaires", e.target.value)}
          className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
        />
      </div>

      <SectionTitle>Jours disponibles</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {JOURS.map(({ id, label }) => (
          <PillButton
            key={id}
            active={jours.includes(id)}
            onClick={() => toggleJour(id)}
          >
            {label}
          </PillButton>
        ))}
      </div>

      <SectionTitle>Tarification</SectionTitle>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Prix enfant (optionnel)
          </label>
          <input
            type="number"
            min={0}
            value={details.prix_enfant ?? ""}
            onChange={(e) => onChange("prix_enfant", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Réduction groupe
          </label>
          <div className="flex gap-2 mb-2">
            <PillButton
              active={details.reduction_groupe === "oui"}
              onClick={() => onChange("reduction_groupe", "oui")}
            >
              Oui
            </PillButton>
            <PillButton
              active={details.reduction_groupe === "non"}
              onClick={() => onChange("reduction_groupe", "non")}
            >
              Non
            </PillButton>
          </div>
          {details.reduction_groupe === "oui" && (
            <input
              type="text"
              placeholder="Détails de la réduction groupe..."
              value={details.details_groupe ?? ""}
              onChange={(e) => onChange("details_groupe", e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
            />
          )}
        </div>
      </div>

      <SectionTitle>Inclus</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {INCLUS_OPTIONS.map(({ id, label }) => (
          <PillButton
            key={id}
            active={inclus.includes(id)}
            onClick={() => toggleInclus(id)}
          >
            {label}
          </PillButton>
        ))}
      </div>

      <SectionTitle>Politique d'annulation</SectionTitle>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Délai d'annulation
          </label>
          <div className="flex flex-wrap gap-2">
            {ANNULATION_OPTIONS.map(({ id, label }) => (
              <PillButton
                key={id}
                active={details.annulation === id}
                onClick={() => onChange("annulation", id)}
              >
                {label}
              </PillButton>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Annulation si mauvais temps
          </label>
          <div className="flex gap-2">
            <PillButton
              active={details.annulation_meteo === "oui"}
              onClick={() => onChange("annulation_meteo", "oui")}
            >
              Oui
            </PillButton>
            <PillButton
              active={details.annulation_meteo === "non"}
              onClick={() => onChange("annulation_meteo", "non")}
            >
              Non
            </PillButton>
          </div>
        </div>
      </div>
    </div>
  );
}
