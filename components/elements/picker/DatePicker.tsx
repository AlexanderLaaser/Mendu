import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "../../ui/calendar";

interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | undefined) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange }) => {
  return (
    // Entferne h-full, damit sich der DatePicker nur so hoch zieht, wie nötig.
    <div className="w-full space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate || undefined}
        onSelect={onChange}
        className="rounded-md border"
      />
    </div>
  );
};

export default DatePicker;
