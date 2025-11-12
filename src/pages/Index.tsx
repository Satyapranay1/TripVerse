import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "@/components/TopNavbar";
import BottomNavBar from "@/components/BottomNavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import FlightSearchForm from "@/components/FlightSearchForm";
import TrainSearchForm from "@/components/TrainSearchForm";
import FlightSelectDrawer from "@/components/FlightSelectDrawer";

import FlightCheckoutSheet from "@/components/checkout/FlightCheckOutSheet";
import TrainCheckoutSheet from "@/components/checkout/TrainCheckOutSheet";
import HotelCheckoutSheet from "@/components/checkout/HotelCheckOutSheet";

import { Plane, Clock } from "lucide-react";
import { toast } from "sonner";

interface IndexProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const Index = ({ theme, toggleTheme }: IndexProps) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("price-low");
  const [listings, setListings] = useState<any[]>([]);
  const [flightResults, setFlightResults] = useState<any[]>([]);
  const [trainResults, setTrainResults] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [showFlightDrawer, setShowFlightDrawer] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutBooking, setCheckoutBooking] = useState<any>(null);

  const token = localStorage.getItem("token");

  const backend = "https://travel-app1-p0m8.onrender.com";

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user || !token) {
      navigate("/login");
      return;
    }

    fetch(`${backend}/api/hotels`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setListings(data))
      .catch(() => toast.error("Failed to load hotels"));
  }, [navigate, token]);

  const handleFlightSearch = (data: any) => {
    fetch(
      `${backend}/api/travel/flights/search?from=${data.from}&to=${data.to}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((f: any) => ({
          id: f.id,
          airline: f.airline,
          from: f.departureCity,
          to: f.arrivalCity,
          departure: f.departureTime,
          arrival: f.arrivalTime,
          duration: f.duration,
          price: f.price,
          class: f.seatClass,
        }));
        setFlightResults(mapped);
      })
      .catch(() => toast.error("Failed to load flights"));
  };

  const handleTrainSearch = (data: any) => {
    fetch(
      `${backend}/api/travel/trains/search?from=${data.from}&to=${data.to}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((t: any) => ({
          id: t.id,
          train_name: t.trainName, // ✅ corrected
          from: t.departureCity,
          to: t.arrivalCity,
          departure: t.departureTime,
          arrival: t.arrivalTime,
          duration: t.duration,
          price: t.price,
          class: t.trainClass, // ✅ corrected (was t.classType before)
          passengers: 1,
        }));
        setTrainResults(mapped);
      })
      .catch(() => toast.error("Failed to load trains"));
  };

  const handleSelectFlight = (flight: any) => {
    setSelectedFlight(flight);
    setShowFlightDrawer(true);
  };

  const handleFlightContinue = () => {
    setCheckoutBooking({
      ...selectedFlight,
      type: "flight",
      name: `${selectedFlight.airline} Flight`,
      location: `${selectedFlight.from} → ${selectedFlight.to}`,
    });
    setShowCheckout(true);
  };

  const handleBookTrain = (train: any) => {
    setCheckoutBooking({
      ...train,
      type: "train",
      location: `${train.from} → ${train.to}`,
      passengerCount: train.passengers,
    });
    setShowCheckout(true);
  };

  const handleBookHotel = (hotel: any) => {
    setCheckoutBooking({ ...hotel, type: "hotel" });
    setShowCheckout(true);
  };

  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNavbar theme={theme} toggleTheme={toggleTheme} />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Explore Your Next Adventure
          </h1>
          <p className="text-muted-foreground">
            Find the perfect place for your next trip
          </p>
        </div>

        <Tabs defaultValue="hotels" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList className="w-fit">
              <TabsTrigger value="hotels">Hotels</TabsTrigger>
              <TabsTrigger value="flights">Flights</TabsTrigger>
              <TabsTrigger value="trains">Trains</TabsTrigger>
            </TabsList>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="hotels">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedListings.map((hotel) => (
                <ListingCard
                  key={hotel.id}
                  hotel={hotel} // ✅ renamed from listing → hotel
                  onBook={handleBookHotel}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flights" className="space-y-6">
            <FlightSearchForm onSearch={handleFlightSearch} />
            {flightResults.length > 0 && (
              <div className="space-y-4">
                {flightResults.map((flight) => (
                  <Card
                    key={flight.id}
                    className="cursor-pointer hover:shadow-medium transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Plane className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">
                                {flight.airline}
                              </h4>
                              <p className="text-sm text-muted-foreground capitalize">
                                {flight.class}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <p className="font-semibold text-lg">
                                {flight.departure}
                              </p>
                              <p className="text-muted-foreground">
                                {flight.from}
                              </p>
                            </div>
                            <div className="flex flex-col items-center flex-1">
                              <Clock className="w-4 h-4 text-muted-foreground mb-1" />
                              <p className="text-muted-foreground">
                                {flight.duration}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-lg">
                                {flight.arrival}
                              </p>
                              <p className="text-muted-foreground">
                                {flight.to}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-6">
                          <p className="text-2xl font-bold text-primary mb-2">
                            ₹{flight.price}
                          </p>
                          <Button onClick={() => handleSelectFlight(flight)}>
                            Select
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trains" className="space-y-6">
            <TrainSearchForm onSearch={handleTrainSearch} />
            {trainResults.length > 0 && (
              <div className="space-y-4">
                {trainResults.map((train) => (
                  <Card
                    key={train.id}
                    className="cursor-pointer hover:shadow-medium transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        {/* LEFT SECTION */}
                        <div className="flex-1">
                          <div className="mb-3">
                            <h4 className="font-semibold text-lg">
                              {train.train_name}
                            </h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {train.class}
                            </p>
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <p className="font-semibold text-lg">
                                {train.departure}
                              </p>
                              <p className="text-muted-foreground">
                                {train.from}
                              </p>
                            </div>

                            <div className="flex flex-col items-center flex-1">
                              <Clock className="w-4 h-4 text-muted-foreground mb-1" />
                              <p className="text-muted-foreground">
                                {train.duration}
                              </p>
                            </div>

                            <div>
                              <p className="font-semibold text-lg">
                                {train.arrival}
                              </p>
                              <p className="text-muted-foreground">
                                {train.to}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT SECTION */}
                        <div className="text-right ml-6">
                          <p className="text-2xl font-bold text-primary mb-2">
                            ₹{train.price}
                          </p>
                          <Button onClick={() => handleBookTrain(train)}>
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <FlightSelectDrawer
        flight={selectedFlight}
        open={showFlightDrawer}
        onClose={() => setShowFlightDrawer(false)}
        onContinue={handleFlightContinue}
      />

      {checkoutBooking?.type === "flight" && (
        <FlightCheckoutSheet
          open={showCheckout}
          onClose={() => setShowCheckout(false)}
          booking={checkoutBooking}
        />
      )}
      {checkoutBooking?.type === "train" && (
        <TrainCheckoutSheet
          open={showCheckout}
          onClose={() => setShowCheckout(false)}
          booking={checkoutBooking}
        />
      )}
      {checkoutBooking?.type === "hotel" && (
        <HotelCheckoutSheet
          open={showCheckout}
          onClose={() => setShowCheckout(false)}
          booking={checkoutBooking}
        />
      )}

      <BottomNavBar />
    </div>
  );
};

export default Index;
