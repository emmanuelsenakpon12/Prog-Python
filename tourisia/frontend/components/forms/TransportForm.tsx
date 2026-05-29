"use client";

interface Props {
  details: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

const TYPES_SERVICE = [
  { id: "location_voiture", label: "Location voiture" },
  { id: "taxi", label: "Taxi" },
  { id: "bus_minibus", label: "Bus/Minibus" },
  { id: "transfert_aeroport", label: "Transfert aéroport" },
  { id: "moto_taxi", label: "Moto-taxi" },
];

const CARBURANT = [
  { id: "essence", label: "Essence" },
  { id: "diesel", label: "Diesel" },
  { id: "electrique", label: "Électrique" },
];

const TRANSMISSION = [
  { id: "manuelle", label: "Manuelle" },
  { id: "automatique", label: "Automatique" },
];

const EQUIPEMENTS = [
  { id: "clim", label: "Climatisation" },
  { id: "gps", label: "GPS" },
  { id: "bluetooth", label: "Bluetooth" },
  { id: "siege_bebe", label: "Siège bébé" },
  { id: "coffre", label: "Coffre spacieux" },
  { id: "4x4", label: "4×4" },
];

const TARIF_TYPE = [
  { id: "par_jour", label: "Par jour" },
  { id: "par_trajet", label: "Par trajet" },
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

export function TransportForm({ details, onChange }: Props) {
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
      <SectionTitle>Type de service</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {TYPES_SERVICE.map(({ id, label }) => (
          <PillButton
            key={id}
            active={details.type_service === id}
            onClick={() => onChange("type_service", id)}
          >
            {label}
          </PillButton>
        ))}
      </div>

      <SectionTitle>Véhicule</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Marque / Modèle (ex: Toyota Corolla)
          </label>
          <input
            type="text"
            value={details.marque_modele ?? ""}
            onChange={(e) => onChange("marque_modele", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Année
          </label>
          <input
            type="number"
            min={1990}
            max={2030}
            value={details.annee ?? ""}
            onChange={(e) => onChange("annee", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Nb. places
          </label>
          <input
            type="number"
            min={1}
            value={details.nb_places ?? ""}
            onChange={(e) => onChange("nb_places", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Carburant
          </label>
          <div className="flex flex-wrap gap-2">
            {CARBURANT.map(({ id, label }) => (
              <PillButton
                key={id}
                active={details.carburant === id}
                onClick={() => onChange("carburant", id)}
              >
                {label}
              </PillButton>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Transmission
          </label>
          <div className="flex flex-wrap gap-2">
            {TRANSMISSION.map(({ id, label }) => (
              <PillButton
                key={id}
                active={details.transmission === id}
                onClick={() => onChange("transmission", id)}
              >
                {label}
              </PillButton>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Couleur
          </label>
          <input
            type="text"
            value={details.couleur ?? ""}
            onChange={(e) => onChange("couleur", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
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

      <SectionTitle>Tarification</SectionTitle>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Type de tarif
          </label>
          <div className="flex gap-2">
            {TARIF_TYPE.map(({ id, label }) => (
              <PillButton
                key={id}
                active={details.tarif_type === id}
                onClick={() => onChange("tarif_type", id)}
              >
                {label}
              </PillButton>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Caution
          </label>
          <div className="flex gap-2 mb-2">
            <PillButton
              active={details.caution === "oui"}
              onClick={() => onChange("caution", "oui")}
            >
              Oui
            </PillButton>
            <PillButton
              active={details.caution === "non"}
              onClick={() => onChange("caution", "non")}
            >
              Non
            </PillButton>
          </div>
          {details.caution === "oui" && (
            <input
              type="number"
              min={0}
              placeholder="Montant caution"
              value={details.montant_caution ?? ""}
              onChange={(e) => onChange("montant_caution", e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
            />
          )}
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Kilométrage illimité
          </label>
          <div className="flex gap-2">
            <PillButton
              active={details.km_illimite === "oui"}
              onClick={() => onChange("km_illimite", "oui")}
            >
              Oui
            </PillButton>
            <PillButton
              active={details.km_illimite === "non"}
              onClick={() => onChange("km_illimite", "non")}
            >
              Non
            </PillButton>
          </div>
        </div>
      </div>

      <SectionTitle>Disponibilité</SectionTitle>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Disponible maintenant
          </label>
          <div className="flex gap-2">
            <PillButton
              active={details.disponible_maintenant === "oui"}
              onClick={() => onChange("disponible_maintenant", "oui")}
            >
              Oui
            </PillButton>
            <PillButton
              active={details.disponible_maintenant === "non"}
              onClick={() => onChange("disponible_maintenant", "non")}
            >
              Non
            </PillButton>
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Zones desservies
          </label>
          <textarea
            rows={3}
            value={details.zones_desservies ?? ""}
            onChange={(e) => onChange("zones_desservies", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
