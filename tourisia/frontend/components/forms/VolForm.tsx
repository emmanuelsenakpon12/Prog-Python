"use client";

interface Props {
  details: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

type ClasseRow = { classe: string; prix: string; nb_places: string };

const TYPES_VOL = [
  { id: "regulier", label: "Régulier" },
  { id: "charter", label: "Charter" },
  { id: "prive", label: "Privé" },
];

const ESCALES = [
  { id: "direct", label: "Direct" },
  { id: "1_escale", label: "1 escale" },
  { id: "2_escales", label: "2 escales" },
];

const CLASSES_OPTIONS = ["Économique", "Business", "Première"];

const SERVICES_BORD = [
  { id: "repas", label: "Repas" },
  { id: "divertissement", label: "Divertissement" },
  { id: "wifi", label: "WiFi" },
  { id: "prises_usb", label: "Prises USB" },
  { id: "siege_inclinable", label: "Siège inclinable" },
];

const MODIFICATION_OPTIONS = [
  { id: "gratuite", label: "Gratuite" },
  { id: "payante", label: "Payante" },
  { id: "impossible", label: "Impossible" },
];

const REMBOURSEMENT_OPTIONS = [
  { id: "oui", label: "Oui" },
  { id: "partiel", label: "Partiel" },
  { id: "non", label: "Non" },
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

export function VolForm({ details, onChange }: Props) {
  const classes: ClasseRow[] = details.classes || [];
  const servicesBord: string[] = details.services_bord || [];

  const toggleService = (id: string) => {
    if (servicesBord.includes(id)) {
      onChange("services_bord", servicesBord.filter((s) => s !== id));
    } else {
      onChange("services_bord", [...servicesBord, id]);
    }
  };

  const addClasse = () => {
    onChange("classes", [...classes, { classe: "Économique", prix: "", nb_places: "" }]);
  };

  const updateClasse = (index: number, field: keyof ClasseRow, value: string) => {
    const updated = classes.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    onChange("classes", updated);
  };

  const removeClasse = (index: number) => {
    onChange("classes", classes.filter((_, i) => i !== index));
  };

  return (
    <div>
      <SectionTitle>Compagnie / Type</SectionTitle>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Compagnie aérienne / Opérateur
          </label>
          <input
            type="text"
            value={details.compagnie ?? ""}
            onChange={(e) => onChange("compagnie", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Type de vol
          </label>
          <div className="flex flex-wrap gap-2">
            {TYPES_VOL.map(({ id, label }) => (
              <PillButton
                key={id}
                active={details.type_vol === id}
                onClick={() => onChange("type_vol", id)}
              >
                {label}
              </PillButton>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            N° de vol (optionnel)
          </label>
          <input
            type="text"
            value={details.numero_vol ?? ""}
            onChange={(e) => onChange("numero_vol", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
      </div>

      <SectionTitle>Itinéraire</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Aéroport départ (code IATA)
          </label>
          <input
            type="text"
            maxLength={3}
            placeholder="ex: COO"
            value={details.aeroport_depart ?? ""}
            onChange={(e) => onChange("aeroport_depart", e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all font-mono uppercase"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Aéroport arrivée (code IATA)
          </label>
          <input
            type="text"
            maxLength={3}
            placeholder="ex: LOS"
            value={details.aeroport_arrivee ?? ""}
            onChange={(e) => onChange("aeroport_arrivee", e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all font-mono uppercase"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Départ
          </label>
          <input
            type="datetime-local"
            value={details.datetime_depart ?? ""}
            onChange={(e) => onChange("datetime_depart", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Arrivée
          </label>
          <input
            type="datetime-local"
            value={details.datetime_arrivee ?? ""}
            onChange={(e) => onChange("datetime_arrivee", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Escales
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {ESCALES.map(({ id, label }) => (
              <PillButton
                key={id}
                active={details.escales === id}
                onClick={() => onChange("escales", id)}
              >
                {label}
              </PillButton>
            ))}
          </div>
          {details.escales && details.escales !== "direct" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                  Ville d'escale
                </label>
                <input
                  type="text"
                  value={details.ville_escale ?? ""}
                  onChange={(e) => onChange("ville_escale", e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                  Durée escale
                </label>
                <input
                  type="text"
                  placeholder="ex: 2h30"
                  value={details.duree_escale ?? ""}
                  onChange={(e) => onChange("duree_escale", e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <SectionTitle>Classes et tarifs</SectionTitle>
      <div className="space-y-3">
        {classes.map((row, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 items-end">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                Classe
              </label>
              <select
                value={row.classe}
                onChange={(e) => updateClasse(index, "classe", e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
              >
                {CLASSES_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                Prix
              </label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={row.prix}
                onChange={(e) => updateClasse(index, "prix", e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                  Places
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={row.nb_places}
                  onChange={(e) => updateClasse(index, "nb_places", e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => removeClasse(index)}
                className="mt-5 p-2.5 rounded-xl text-red-500 hover:bg-red-50 border border-border transition-all"
              >
                ×
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addClasse}
          className="w-full rounded-xl border border-dashed border-[#2563eb]/50 py-2 text-xs font-bold text-[#2563eb] hover:bg-[#2563eb]/5 transition-all"
        >
          + Ajouter une classe
        </button>
      </div>

      <SectionTitle>Bagages</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Bagage cabine max (kg)
          </label>
          <input
            type="number"
            min={0}
            value={details.cabine_kg ?? ""}
            onChange={(e) => onChange("cabine_kg", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Bagage en soute inclus
          </label>
          <div className="flex gap-2 mb-2">
            <PillButton
              active={details.soute_inclus === "oui"}
              onClick={() => onChange("soute_inclus", "oui")}
            >
              Oui
            </PillButton>
            <PillButton
              active={details.soute_inclus === "non"}
              onClick={() => onChange("soute_inclus", "non")}
            >
              Non
            </PillButton>
          </div>
          {details.soute_inclus === "oui" && (
            <input
              type="number"
              min={0}
              placeholder="Poids max (kg)"
              value={details.soute_kg ?? ""}
              onChange={(e) => onChange("soute_kg", e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
            />
          )}
        </div>
        <div className="col-span-2">
          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
            Prix bagage supplémentaire / kg
          </label>
          <input
            type="number"
            min={0}
            value={details.bagage_supp_prix ?? ""}
            onChange={(e) => onChange("bagage_supp_prix", e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm focus:border-[#2563eb] focus:outline-none transition-all"
          />
        </div>
      </div>

      <SectionTitle>Services à bord</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {SERVICES_BORD.map(({ id, label }) => (
          <PillButton
            key={id}
            active={servicesBord.includes(id)}
            onClick={() => toggleService(id)}
          >
            {label}
          </PillButton>
        ))}
      </div>

      <SectionTitle>Politique</SectionTitle>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Modification
          </label>
          <div className="flex flex-wrap gap-2">
            {MODIFICATION_OPTIONS.map(({ id, label }) => (
              <PillButton
                key={id}
                active={details.modification === id}
                onClick={() => onChange("modification", id)}
              >
                {label}
              </PillButton>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">
            Remboursement
          </label>
          <div className="flex flex-wrap gap-2">
            {REMBOURSEMENT_OPTIONS.map(({ id, label }) => (
              <PillButton
                key={id}
                active={details.remboursement === id}
                onClick={() => onChange("remboursement", id)}
              >
                {label}
              </PillButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
