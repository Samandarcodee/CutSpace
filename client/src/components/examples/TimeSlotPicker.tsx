import TimeSlotPicker from '../TimeSlotPicker';
import { useState } from 'react';

export default function TimeSlotPickerExample() {
  const [selected, setSelected] = useState<{ date: Date; time: string } | null>(null);

  return (
    <div className="p-4 max-w-md">
      <TimeSlotPicker
        onSelect={(date, time) => {
          setSelected({ date, time });
          console.log('Selected:', { date, time });
        }}
        selectedDate={selected?.date}
        selectedTime={selected?.time}
      />
    </div>
  );
}
