"use client";

import { useEffect, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { fr } from "date-fns/locale";
import "react-day-picker/src/style.css";

interface ReservationCalendarProps {
  offerId: number;
  pricePerNight: number;
  currency: string;
  onRangeChange: (range: DateRange | undefined, nights: number, total: number) => void;
}

export function ReservationCalendar({
  offerId,
  pricePerNight,
  currency,
  onRangeChange,
}: ReservationCalendarProps) {
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);

  useEffect(() => {
    const fetchUnavailable = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}offers/get_unavailable_dates.php?offer_id=${offerId}`
        );
        const data = await res.json();
        if (res.ok && data.dates) {
          setUnavailableDates(data.dates.map((d: string) => new Date(d + "T00:00:00")));
        }
      } catch {
        /* silencieux */
      } finally {
        setLoadingDates(false);
      }
    };
    fetchUnavailable();
  }, [offerId]);

  const handleSelect = (selected: DateRange | undefined) => {
    setRange(selected);
    if (selected?.from && selected?.to) {
      const msPerDay = 1000 * 60 * 60 * 24;
      const nights = Math.round((selected.to.getTime() - selected.from.getTime()) / msPerDay);
      const total = nights * pricePerNight;
      onRangeChange(selected, nights, total);
    } else {
      onRangeChange(selected, 0, 0);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nights =
    range?.from && range?.to
      ? Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
  const total = nights * pricePerNight;

  return (
    <div className="flex flex-col items-center gap-4">
      {loadingDates ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          Chargement des disponibilités…
        </div>
      ) : (
        <>
          <div className="rdp-tourisia w-full">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleSelect}
              numberOfMonths={2}
              locale={fr}
              disabled={[{ before: new Date() }, ...unavailableDates]}
              showOutsideDays={false}
              classNames={{
                root: "rdp-root",
                months: "flex flex-col sm:flex-row gap-4 sm:gap-8",
                month: "flex-1",
                month_caption: "flex justify-center mb-3",
                caption_label: "text-sm font-semibold text-foreground",
                nav: "flex items-center justify-between absolute inset-x-0 top-0",
                button_previous: "absolute left-2 h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors",
                button_next: "absolute right-2 h-7 w-7 flex items-center justify-center rounded-md border border-border hover:bg-muted transition-colors",
                month_grid: "w-full border-collapse",
                weekdays: "flex",
                weekday: "flex-1 text-center text-[10px] font-bold text-muted-foreground py-1",
                week: "flex",
                day: "flex-1 flex items-center justify-center",
                day_button: "h-8 w-8 rounded-full text-xs font-medium transition-colors hover:bg-[#2563eb]/10 focus:outline-none",
                selected: "bg-[#2563eb] text-white rounded-full",
                range_start: "bg-[#2563eb] text-white rounded-l-full",
                range_end: "bg-[#2563eb] text-white rounded-r-full",
                range_middle: "bg-[#2563eb]/10 text-[#2563eb] rounded-none",
                today: "font-bold text-[#2563eb]",
                disabled: "text-muted-foreground/30 cursor-not-allowed line-through pointer-events-none",
                outside: "text-muted-foreground/20",
              }}
            />
          </div>

          {nights > 0 && (
            <div className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {nights} nuit{nights > 1 ? "s" : ""}
              </span>
              <span className="text-base font-bold text-[#2563eb]">
                {total.toLocaleString()} {currency}
              </span>
            </div>
          )}

          {!range?.from && (
            <p className="text-xs text-muted-foreground text-center">
              Sélectionnez votre date d'arrivée pour commencer
            </p>
          )}
          {range?.from && !range?.to && (
            <p className="text-xs text-muted-foreground text-center">
              Sélectionnez maintenant votre date de départ
            </p>
          )}
        </>
      )}
    </div>
  );
}
