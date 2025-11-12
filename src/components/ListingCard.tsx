import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Hotel {
  id?: number;
  name?: string;
  location?: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  amenities?: string[];
  description?: string;
}

interface ListingCardProps {
  hotel?: Hotel;
  onBook?: (hotel: Hotel) => void;
}

const ListingCard = ({ hotel, onBook }: ListingCardProps) => {
  const navigate = useNavigate();

  if (!hotel) {
    // Fallback skeleton to avoid crash
    return (
      <Card className="p-4 text-center text-muted-foreground">
        Loading hotel details...
      </Card>
    );
  }

  const mainImage =
    hotel.images && hotel.images.length > 0
      ? hotel.images[0]
      : "https://via.placeholder.com/400x300?text=No+Image";

  const topAmenities = hotel.amenities?.slice(0, 3) || [];

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden group shadow-soft hover:shadow-medium transition-shadow bg-card">
        {/* Image */}
        <div
          className="relative aspect-[4/3] overflow-hidden cursor-pointer"
          onClick={() => navigate(`/details/${hotel.id || ""}`)}
        >
          <img
            src={mainImage}
            alt={hotel.name || "Hotel Image"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <CardContent className="p-4 space-y-2">
          {/* Title + Rating */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">
                {hotel.name || "Unnamed Hotel"}
              </h3>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {hotel.location || "Unknown Location"}
              </div>
            </div>

            {hotel.rating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-medium">{hotel.rating.toFixed(1)}</span>
                {hotel.reviewCount && (
                  <span className="text-muted-foreground">
                    ({hotel.reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {hotel.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {hotel.description}
            </p>
          )}

          {/* Amenities Preview */}
          {topAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {topAmenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>
          )}

          {/* Price + Book */}
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">
                ₹{hotel.price || 0}
              </span>
              <span className="text-muted-foreground text-sm">/ night</span>
            </div>

            {onBook && (
              <Button size="sm" onClick={() => onBook(hotel)}>
                Book
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ListingCard;
