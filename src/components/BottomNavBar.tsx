import { Link, useLocation } from "react-router-dom";
import { Search, Heart, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNavBar = () => {
  const location = useLocation();

  const navItems = [
    { icon: Search, label: "Explore", path: "/" },
    { icon: Heart, label: "Wishlist", path: "/wishlist" },
    { icon: MessageCircle, label: "Community", path: "/community" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-strong">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-current")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
