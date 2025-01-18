// components/picker/BirthDatePicker.tsx
"use client";

import * as React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface BirthDatePickerProps {
  onChange?: (date: Date) => void;
  initialDate?: Date;
}

export function BirthDatePicker({
  onChange,
  initialDate,
}: BirthDatePickerProps) {
  // Arrays für Tage, Monate und Jahre
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: 1, label: "Januar" },
    { value: 2, label: "Februar" },
    { value: 3, label: "März" },
    { value: 4, label: "April" },
    { value: 5, label: "Mai" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Dezember" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const [day, setDay] = React.useState("");
  const [month, setMonth] = React.useState("");
  const [year, setYear] = React.useState("");

  React.useEffect(() => {
    if (initialDate) {
      setDay(String(initialDate.getUTCDate()));
      setMonth(String(initialDate.getUTCMonth() + 1));
      setYear(String(initialDate.getUTCFullYear()));
    }
  }, [initialDate]);

  // Sobald day, month und year gesetzt sind, wird ein neues Date-Objekt
  // erzeugt und nach oben gereicht:
  React.useEffect(() => {
    if (day && month && year) {
      const selectedDate = new Date(
        Date.UTC(Number(year), Number(month) - 1, Number(day))
      );
      onChange?.(selectedDate);
    }
  }, [day, month, year, onChange]);

  return (
    <div className="flex space-x-2">
      {/* Auswahlliste für Tag */}
      <Select value={day} onValueChange={(value) => setDay(value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={String(d)}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Auswahlliste für Monat */}
      <Select value={month} onValueChange={(value) => setMonth(value)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Monat" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={String(m.value)}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Auswahlliste für Jahr */}
      <Select value={year} onValueChange={(value) => setYear(value)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Jahr" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
