import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopNavbar from "@/components/TopNavbar";
import BottomNavBar from "@/components/BottomNavBar";
import { Button } from "@/components/ui/button";
import { Heart, Star, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import ImageCarousel from "@/components/ImageCarousel";
import ReviewList from "@/components/ReviewList";
import HotelCheckOutSheet from "@/components/checkout/HotelCheckOutSheet";

interface DetailsProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const Details = ({ theme, toggleTheme }: DetailsProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState<any>(null);
  const [showMore, setShowMore] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const token = localStorage.getItem("token");

  const backend = "https://travel-app1-p0m8.onrender.com";

  useEffect(() => {
    if (!token) navigate("/login");
  }, [navigate, token]);

  // Fetch Hotel Details
  useEffect(() => {
    fetch(`${backend}/api/hotels/${id}`)
      .then((res) => res.json())
      .then((data) => setHotel(data))
      .catch(() => toast.error("Failed to load hotel details"));
  }, [id]);

  // Check Wishlist
  useEffect(() => {
    if (!token) return;
    fetch(`${backend}/api/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const exists = data.some((item: any) => item.hotel.id === Number(id));
        setIsWishlisted(exists);
      });
  }, [id, token]);

  const handleWishlist = () => {
    if (!hotel) return;

    const url = `${backend}/api/wishlist/${hotel.id}`;

    fetch(url, {
      method: isWishlisted ? "DELETE" : "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setIsWishlisted(!isWishlisted);
        toast.success(isWishlisted ? "Removed from wishlist!" : "Added to wishlist!");
      })
      .catch(() => toast.error("Something went wrong"));
  };

  if (!hotel) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNavbar theme={theme} toggleTheme={toggleTheme} />

      <div className="container py-8 max-w-6xl">
        <ImageCarousel images={hotel.images || []} />

        <div className="mt-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
              <p className="text-lg text-muted-foreground">{hotel.location}</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <span className="font-semibold">{hotel.rating || 0}</span>
                </div>
                <span className="text-muted-foreground">({hotel.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary mb-1">₹{hotel.price}</div>
              <div className="text-muted-foreground">per night</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleWishlist} variant="outline" className="gap-2">
              <Heart className={isWishlisted ? "fill-primary text-primary" : ""} />
              {isWishlisted ? "Saved" : "Save"}
            </Button>

            <Button onClick={() => setShowCheckout(true)} className="flex-1">
              Book Trip
            </Button>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">About this place</h2>
            <p className={`text-muted-foreground ${!showMore && "line-clamp-3"}`}>
              {hotel.description}
            </p>
            <Button variant="link" onClick={() => setShowMore(!showMore)} className="px-0 gap-1">
              {showMore ? <>Show less <ChevronUp className="w-4 h-4" /></> : <>Show more <ChevronDown className="w-4 h-4" /></>}
            </Button>
          </div>

          {hotel.highlights?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Highlights</h2>
              <ul className="space-y-2">
                {hotel.highlights.map((h: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hotel.amenities?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {hotel.amenities.map((amenity: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ReviewList listingId={id || ""} />
        </div>
      </div>

      {/* ✅ CheckoutSheet now receives proper booking object */}
      <HotelCheckOutSheet
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        booking={{
          id: hotel.id,
          name: hotel.name,
          price: hotel.price,
          type: "hotel"
        }}
      />

      <BottomNavBar />
    </div>
  );
};

export default Details;
