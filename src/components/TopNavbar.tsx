import { Link, useNavigate } from "react-router-dom";
import { Plane, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState, useEffect } from "react";

interface TopNavbarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const TopNavbar = ({ theme, toggleTheme }: TopNavbarProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Plane className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-primary bg-clip-text text-transparent">TripVerse</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/home" className="text-sm font-medium hover:text-primary transition-colors">
            Explore
          </Link>
          <Link to="/wishlist" className="text-sm font-medium hover:text-primary transition-colors">
            Wishlist
          </Link>
          <Link to="/community" className="text-sm font-medium hover:text-primary transition-colors">
            Community
          </Link>
          <Link to="/itinerary" className="text-sm font-medium hover:text-primary transition-colors">
            Itinerary
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <Button onClick={() => navigate("/login")} size="sm">
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
