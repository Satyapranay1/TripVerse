import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
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

  const navItems = [
    { path: "/home", label: "Explore" },
    { path: "/wishlist", label: "Wishlist" },
    { path: "/community", label: "Community" },
    { path: "/itinerary", label: "Itinerary" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Plane className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            TripVerse
          </span>
        </Link>

        {/* 🔗 Navigation Links */}
        <div className="hidden md:flex items-center gap-6 relative">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative text-sm font-medium transition-colors after:content-[''] after:absolute after:left-0 after:bottom-[-6px] after:h-[2px] after:rounded-full after:transition-all after:duration-300 ${
                location.pathname === item.path
                  ? "text-primary after:w-full after:bg-gradient-primary"
                  : "text-muted-foreground hover:text-primary after:w-0 hover:after:w-full hover:after:bg-gradient-primary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 🔘 Theme + User Section */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
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
