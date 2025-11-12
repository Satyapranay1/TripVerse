import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";

interface TrainSearchFormProps {
  onSearch: (data: any) => void;
}

const stationOptions = [
  "Delhi", "Mumbai", "Hyderabad", "Bangalore", "Chennai"
];

const TrainSearchForm = ({ onSearch }: TrainSearchFormProps) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date>();
  const [trainClass, setTrainClass] = useState("sleeper");
  const [passengers, setPassengers] = useState("1");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ from, to, date, trainClass, passengers });
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4 p-6 rounded-xl border bg-card shadow-soft">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <Label>From Station</Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger>
              <SelectValue placeholder="Select departure station" />
            </SelectTrigger>
            <SelectContent>
              {stationOptions.map((station) => (
                <SelectItem key={station} value={station}>
                  {station}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>To Station</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger>
              <SelectValue placeholder="Select arrival station" />
            </SelectTrigger>
            <SelectContent>
              {stationOptions
                .filter((station) => station !== from)
                .map((station) => (
                  <SelectItem key={station} value={station}>
                    {station}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        {/* <div>
          <Label>Class</Label>
          <Select value={trainClass} onValueChange={setTrainClass}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sleeper">Sleeper</SelectItem>
              <SelectItem value="3ac">3 Tier AC</SelectItem>
              <SelectItem value="2ac">2 Tier AC</SelectItem>
              <SelectItem value="1ac">First AC</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        {/* <div>
          <Label>Passengers</Label>
          <Select value={passengers} onValueChange={setPassengers}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "Passenger" : "Passengers"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

      </div>

      <Button type="submit" className="w-full gap-2">
        <Search className="w-4 h-4" />
        Search Trains
      </Button>

    </form>
  );
};

export default TrainSearchForm;
