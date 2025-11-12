import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";

interface FlightSearchFormProps {
  onSearch: (data: any) => void;
}

const cityOptions = [
  "Delhi", "Mumbai", "Hyderabad", "Bangalore", "Chennai"
];

const FlightSearchForm = ({ onSearch }: FlightSearchFormProps) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date>();
  const [flightClass, setFlightClass] = useState("economy");
  const [passengers, setPassengers] = useState("1");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ from, to, date, flightClass, passengers });
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4 p-6 rounded-xl border bg-card shadow-soft">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* From City */}
        <div>
          <Label>From</Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger>
              <SelectValue placeholder="Select Departure City" />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* To City */}
        <div>
          <Label>To</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger>
              <SelectValue placeholder="Select Arrival City" />
            </SelectTrigger>
            <SelectContent>
              {cityOptions
                .filter((city) => city !== from)
                .map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
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
          <Select value={flightClass} onValueChange={setFlightClass}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="premium">Premium Economy</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="first">First Class</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        {/* <div>
          <Label>Passengers</Label>
          <Select value={passengers} onValueChange={setPassengers}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
        Search Flights
      </Button>

    </form>
  );
};

export default FlightSearchForm;
