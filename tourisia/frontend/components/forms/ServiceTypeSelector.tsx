"use client";

import { Home, Car, Ticket, Plane } from "lucide-react";

interface Props {
  selected: string;
  onSelect: (type: string) => void;
}

const types = [
  {
    id: "herbergement",
    icon: Home,
    label: "Hébergement",
    sub: "Hôtel, villa, appartement...",
  },
  {
    id: "transport",
    icon: Car,
    label: "Transport",
    sub: "Location, taxi, bus...",
  },
  {
    id: "activite",
    icon: Ticket,
    label: "Activité",
    sub: "Visite, sport, loisir...",
  },
  {
    id: "vol",
    icon: Plane,
    label: "Vol",
    sub: "Vol intérieur, charter...",
  },
];

export function ServiceTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-foreground border-l-4 border-[#2563eb] pl-3">
        Type de service
      </h4>
      <div className="grid grid-cols-2 gap-4">
        {types.map(({ id, icon: Icon, label, sub }) => {
          const active = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-[#2563eb] bg-[#2563eb]/5 text-[#2563eb]"
                  : "border-border text-foreground hover:border-[#2563eb]/50"
              }`}
            >
              <Icon className={`h-6 w-6 ${active ? "text-[#2563eb]" : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm font-bold">{label}</p>
                <p className={`text-xs ${active ? "text-[#2563eb]/70" : "text-muted-foreground"}`}>
                  {sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
