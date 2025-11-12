import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "@/components/TopNavbar";
import BottomNavBar from "@/components/BottomNavBar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface RecentTripsProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

interface Booking {
  id: string;
  name: string;
  location: string;
  dates: string;
  amount: number;
  paymentMethod: string;
  status: string;
  image: string;
}

const RecentTrips = ({ theme, toggleTheme }: RecentTripsProps) => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userStr);
    const userId = user.id;
    const backend = import.meta.env.VITE_BACKEND_URL || "https://travel-app1-p0m8.onrender.com";

    fetch(`${backend}/api/bookings/user/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookings");
        return res.json();
      })
      .then((data) => {
        setTrips(data);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setTrips([]);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const mockTrips = [
    {
      id: "1",
      name: "Luxury Beach Resort",
      location: "Maldives",
      dates: "Jan 15 - Jan 22, 2024",
      amount: 2093,
      paymentMethod: "Visa •••• 4242",
      status: "Confirmed",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
    },
  ];

  const displayedTrips = trips.length > 0 ? trips : mockTrips;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNavbar theme={theme} toggleTheme={toggleTheme} />

      <div className="container py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Recent Trips
          </h1>
          <p className="text-muted-foreground">Your booking history</p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-4">
            {displayedTrips.map((trip) => (
              <div
                key={trip.id}
                className="flex gap-4 p-4 rounded-xl border bg-card shadow-soft hover:shadow-medium transition-shadow cursor-pointer"
              >
                <img
                  src={trip.image}
                  alt={trip.name}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{trip.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {trip.location}
                  </p>
                  <p className="text-sm mb-2">{trip.dates}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">${trip.amount}</span>
                    <span className="text-muted-foreground">
                      {trip.paymentMethod}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs">
                      {trip.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavBar />
    </div>
  );
};

export default RecentTrips;
