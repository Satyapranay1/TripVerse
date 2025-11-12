import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "@/components/TopNavbar";
import BottomNavBar from "@/components/BottomNavBar";
import { Button } from "@/components/ui/button";
import { Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface WishlistProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const Wishlist = ({ theme, toggleTheme }: WishlistProps) => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const token = localStorage.getItem("token");
  const backend = "https://travel-app1-p0m8.onrender.com";

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${backend}/api/wishlist`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(async (res) => {
        if (res.status === 401) {
          navigate("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => setWishlist(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load wishlist"));
  }, [navigate, token]);

  const removeItem = (hotelId: number) => {
    fetch(`${backend}/api/wishlist/${hotelId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (res) => {
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        if (!res.ok) throw new Error();
        setWishlist((prev) => prev.filter((item) => item.hotel.id !== hotelId));
        toast.success("Removed from wishlist");
      })
      .catch(() => toast.error("Failed to remove item"));
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNavbar theme={theme} toggleTheme={toggleTheme} />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Your Wishlist
          </h1>
          <p className="text-muted-foreground">Places you'd love to visit</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Heart className="w-20 h-20 text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">Start adding places you'd like to visit</p>
            <Button onClick={() => navigate("/")}>Explore Now</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl shadow-soft hover:shadow-medium transition-shadow cursor-pointer"
                onClick={() => navigate(`/details/${item.hotel.id}`)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.hotel.images?.[0]}
                    alt={item.hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 bg-card">
                  <h3 className="font-semibold text-lg mb-1">{item.hotel.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.hotel.location}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">${item.hotel.price}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.hotel.id);
                      }}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Wishlist;
