import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const TimePicker = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [hour, setHour] = useState(value.split(":")[0] || "10");
  const [minute, setMinute] = useState(value.split(":")[1] || "00");

  const applyTime = () => {
    onChange(`${hour}:${minute}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value ? value : "Select Time"}
          <Clock className="w-4 h-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-48 p-4 space-y-4">
        <div className="flex gap-2 justify-center">
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="bg-card border rounded-lg p-2 text-sm"
          >
            {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")).map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>

          <span className="text-lg font-semibold">:</span>

          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="bg-card border rounded-lg p-2 text-sm"
          >
            {["00", "10", "20", "30", "40", "50"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        <Button onClick={applyTime} className="w-full">
          Set Time
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default TimePicker;
