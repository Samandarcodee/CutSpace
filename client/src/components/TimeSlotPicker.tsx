import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { uz } from "date-fns/locale";

interface TimeSlotPickerProps {
  onSelect: (date: Date, time: string) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

export default function TimeSlotPicker({
  onSelect,
  selectedDate,
  selectedTime,
}: TimeSlotPickerProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    if (selectedTime) {
      onSelect(date, selectedTime);
    }
  };

  const handleTimeSelect = (time: string) => {
    onSelect(currentDate, time);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-3">Kunni tanlang</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weekDays.map((day) => {
            const isSelected = format(currentDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
            const isPast = day < new Date() && !isSelected;

            return (
              <Button
                key={day.toISOString()}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateSelect(day)}
                disabled={isPast}
                className="flex-col h-auto min-w-[60px] py-2"
                data-testid={`date-${format(day, "yyyy-MM-dd")}`}
              >
                <span className="text-xs">{format(day, "EEE", { locale: uz })}</span>
                <span className="text-lg font-bold">{format(day, "d")}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Vaqtni tanlang</h3>
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map((time) => {
            const isSelected = selectedTime === time;

            return (
              <Button
                key={time}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeSelect(time)}
                data-testid={`time-${time}`}
              >
                {time}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
