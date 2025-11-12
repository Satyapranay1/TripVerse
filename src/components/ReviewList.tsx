import { useState, useEffect } from "react";
import { Star, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface ReviewListProps {
  listingId: string;
}

const ReviewList = ({ listingId }: ReviewListProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const token = localStorage.getItem("token");
  const loggedInUserId = token ? Number(JSON.parse(atob(token.split(".")[1])).sub) : null; // ✅ safest decode
  const backend = "https://travel-app1-p0m8.onrender.com";

  // ✅ Load reviews
  useEffect(() => {
    fetch(`${backend}/api/reviews/${listingId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch(() => toast.error("Failed to load reviews"));
  }, [listingId, token]);

  const userReview = reviews.find((r) => r.user?.id === loggedInUserId);

  const handleSubmit = () => {
    if (!token) return toast.error("Please log in to write a review");
    if (rating === 0) return toast.error("Please select a rating");

    fetch(`${backend}/api/reviews/${listingId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    })
      .then((res) => res.json())
      .then((data) => {
        setReviews([data.review, ...reviews]);
        setShowForm(false);
        setRating(0);
        setComment("");
        toast.success("Review added!");
      })
      .catch(() => toast.error("Failed to submit review"));
  };

  const handleDelete = (reviewId: number) => {
    fetch(`${backend}/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setReviews(reviews.filter((r) => r.id !== reviewId));
        toast.success("Your review was removed");
      })
      .catch(() => toast.error("Failed to delete review"));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reviews</h2>

        {token && !userReview && (
          <Button onClick={() => setShowForm(!showForm)} variant="outline">
            {showForm ? "Cancel" : "Add Review"}
          </Button>
        )}
      </div>

      {/* ✅ If user already reviewed -> show delete button */}
      {userReview && (
        <div className="p-3 bg-secondary rounded-lg flex justify-between items-center">
          <p className="text-sm">You've already reviewed this hotel.</p>
          <Button
            onClick={() => handleDelete(userReview.id)}
            className="text-red-500"
            variant="outline"
          >
            Delete My Review
          </Button>
        </div>
      )}

      {/* ✅ Review Form */}
      {showForm && !userReview && (
        <div className="p-4 rounded-lg border space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Your Rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? "fill-primary text-primary" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
          />

          <Button onClick={handleSubmit} className="w-full">
            Submit Review
          </Button>
        </div>
      )}

      {/* ✅ Review List */}
      <div className="space-y-4">
        {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet.</p>}

        {reviews.map((review) => (
          <div key={review.id} className="p-4 rounded-lg border space-y-3">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback>{review.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold">{review.user?.name || "Anonymous"}</h4>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>

                    {review.user?.id === loggedInUserId && (
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
