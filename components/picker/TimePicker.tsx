import React from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onTimeChange: (time: string) => void;
  timeSlots: string[];
}

const TimePicker: React.FC<TimePickerProps> = ({
  selectedDate,
  selectedTime,
  onTimeChange,
  timeSlots,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-base">Zeit</h2>
      {selectedDate ? (
        <div className="flex flex-col gap-2 max-h-[310px] overflow-y-auto border p-2 rounded">
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => onTimeChange(time)}
              className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-colors text-sm ${
                selectedTime === time
                  ? "bg-primary/40  text-primary font-bold"
                  : " hover:bg-primary/20"
              }`}
            >
              <Clock className="w-4 h-4 mr-2" />
              {time}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 flex items-center justify-center h-[300px] border border-dashed rounded-lg">
          Bitte wähle zuerst ein Datum
        </div>
      )}
    </div>
  );
};

export default TimePicker;
