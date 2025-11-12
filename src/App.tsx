import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Details from "./pages/Details";
import Wishlist from "./pages/Wishlist";
import Community from "./pages/Community";
import Itinerary from "./pages/Itinerary";
import Profile from "./pages/Profile";
import RecentTrips from "./pages/RecentTrips";
import Payments from "./pages/Payments";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentFailed from "./components/PaymentFailed";

const queryClient = new QueryClient();

const App = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Login should be the first page */}
            <Route path="/" element={<Login />} />

            {/* Home after login */}
            <Route
              path="/home"
              element={<Index theme={theme} toggleTheme={toggleTheme} />}
            />

            {/* Other Routes */}
            <Route
              path="/details/:id"
              element={<Details theme={theme} toggleTheme={toggleTheme} />}
            />
            <Route
              path="/wishlist"
              element={<Wishlist theme={theme} toggleTheme={toggleTheme} />}
            />
            <Route
              path="/community"
              element={<Community theme={theme} toggleTheme={toggleTheme} />}
            />
            <Route
              path="/itinerary"
              element={<Itinerary theme={theme} toggleTheme={toggleTheme} />}
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route
              path="/profile"
              element={<Profile theme={theme} toggleTheme={toggleTheme} />}
            />
            <Route
              path="/profile/recent-trips"
              element={<RecentTrips theme={theme} toggleTheme={toggleTheme} />}
            />
            <Route
              path="/profile/payments"
              element={<Payments theme={theme} toggleTheme={toggleTheme} />}
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
