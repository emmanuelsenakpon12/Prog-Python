"use client";

interface Props {
  details: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

const TYPES_ETABLISSEMENT = [
  { id: "hotel", label: "Hôtel" },
  { id: "villa", label: "Villa" },
  { id: "appartement", label: "Appartement" },
  { id: "maison", label: "Maison" },
  { id: "bungalow", label: "Bungalow" },
];

const EQUIPEMENTS = [
  { id: "wifi", label: "WiFi" },
  { id: "piscine", label: "Piscine" },
  { id: "climatisation", label: "Climatisation" },
  { id: "parking", label: "Parking" },
  { id: "cuisine", label: "Cuisine équipée" },
  { id: "tv", label: "TV" },
  { id: "securite", label: "Sécurité 24h" },
  { id: "terrasse", label: "Terrasse" },
  { id: "petit_dejeuner", label: "Petit-déjeuner inclus" },
  { id: "vue_mer", label: "Vue mer/montagne" },
];

const ANNULATION_OPTIONS = [
  { id: "24h", label: "24h" },
  { id: "48h", label: "48h" },
  { id: "72h", label: "72h" },
  { id: "7jours", label: "7 jours" },
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

export function HebergementForm({ details, onChange }: Props) {
  const equipements: string[] = details.equipements || [];

  const toggleEquipement = (id: string) => {
    if (equipements.includes(id)) {
      onChange("equipements", equipements.filter((e) => e !== id));
    } else {
      onChange("equipements", [...equipements, id]);
    }
  };

  return (
    <div>
      <SectionTitle>Type d'établissement</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {TYPES_ETABLISSEMENT.map(({ id, label }) => (
          <PillButton
            key={id}
            active={details.type_etablissement === id}
            onClick={() => onChange("type_etablissement", id)}
          >
            {label}
          </PillButton>
        ))}
      </div>

      <SectionTitle>Capacité & dimensions</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        {[
          { field: "nb_chambres", label: "Nb. chambres" },
          { field: "nb_lits", label: "Nb. lits" },
          { field: "nb_salles_bain", label: "Salles de bain" },
          { field: "capacite_adultes", label: "Adultes max" },
          { field: "capacite_enfants", label: "Enfants max" },
          { field: "surface", label: "Surface (m²)" },
        ].map(({ field, label }) => (
          <div key={field}>
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
              {label}
            </label>
            <input
              type="number"
              min={0}
              value={details[field] ?? ""}
              onChange={(e) => onChange(field, e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
            />
          </div>
        ))}
      </div>

      <SectionTitle>Équipements</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {EQUIPEMENTS.map(({ id, label }) => (
          <PillButton
            key={id}
            active={equipements.includes(id)}
            onClick={() => toggleEquipement(id)}
          >
            {label}
          </PillButton>
        ))}
      </div>

      <SectionTitle>Politique</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Check-in
          </label>
          <input
            type="time"
            value={details.checkin ?? ""}
            onChange={(e) => onChange("checkin", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Check-out
          </label>
          <input
            type="time"
            value={details.checkout ?? ""}
            onChange={(e) => onChange("checkout", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
          Annulation
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

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Animaux
          </label>
          <div className="flex gap-2">
            <PillButton
              active={details.animaux === "oui"}
              onClick={() => onChange("animaux", "oui")}
            >
              Oui
            </PillButton>
            <PillButton
              active={details.animaux === "non"}
              onClick={() => onChange("animaux", "non")}
            >
              Non
            </PillButton>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Fumeurs
          </label>
          <div className="flex gap-2">
            <PillButton
              active={details.fumeurs === "oui"}
              onClick={() => onChange("fumeurs", "oui")}
            >
              Oui
            </PillButton>
            <PillButton
              active={details.fumeurs === "non"}
              onClick={() => onChange("fumeurs", "non")}
            >
              Non
            </PillButton>
          </div>
        </div>
      </div>
    </div>
  );
}
