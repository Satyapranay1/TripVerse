import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavbar from "@/components/TopNavbar";
import BottomNavBar from "@/components/BottomNavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface PaymentsProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

interface PaymentMethod {
  id: string;
  type: "card" | "upi";
  last4?: string;
  upiId?: string;
}

interface Booking {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  hotelName?: string;
}

const Payments = ({ theme, toggleTheme }: PaymentsProps) => {
  const navigate = useNavigate();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [upiId, setUpiId] = useState("");
  const [latestBooking, setLatestBooking] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const backend = import.meta.env.VITE_BACKEND_URL || "https://travel-app1-p0m8.onrender.com";

  // ✅ Step 1: Verify user is logged in & fetch profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserAndBookings = async () => {
      try {
        const userRes = await fetch(`${backend}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userRes.ok) throw new Error("Unauthorized");
        const userData = await userRes.json();

        // ✅ Step 2: Fetch user bookings
        const bookingsRes = await fetch(
          `${backend}/api/bookings/user/${userData.id}`
        );
        const bookings: Booking[] = await bookingsRes.json();

        if (bookings.length > 0) {
          setLatestBooking(bookings[0]); // Use latest booking
        } else {
          setLatestBooking(null);
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchUserAndBookings();

    const saved = JSON.parse(localStorage.getItem("paymentMethods") || "[]");
    setMethods(saved);
  }, [navigate]);

  // ✅ Local methods
  const addCard = () => {
    if (cardNumber.length < 16) {
      toast.error("Please enter a valid card number");
      return;
    }

    const method: PaymentMethod = {
      id: Date.now().toString(),
      type: "card",
      last4: cardNumber.slice(-4),
    };

    const updated = [...methods, method];
    setMethods(updated);
    localStorage.setItem("paymentMethods", JSON.stringify(updated));
    setCardNumber("");
    setShowForm(false);
    toast.success("Card added successfully!");
  };

  const addUPI = () => {
    if (!upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    const method: PaymentMethod = {
      id: Date.now().toString(),
      type: "upi",
      upiId,
    };

    const updated = [...methods, method];
    setMethods(updated);
    localStorage.setItem("paymentMethods", JSON.stringify(updated));
    setUpiId("");
    setShowForm(false);
    toast.success("UPI ID added successfully!");
  };

  const removeMethod = (id: string) => {
    const updated = methods.filter((m) => m.id !== id);
    setMethods(updated);
    localStorage.setItem("paymentMethods", JSON.stringify(updated));
    toast.success("Payment method removed");
  };

  // ✅ Step 3: Create Stripe Checkout Session
  const handlePayment = async () => {
    if (!latestBooking) {
      toast.error("No active booking found");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${backend}/api/payment/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: latestBooking.id,
          amount: latestBooking.totalAmount || 2500,
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // ✅ Redirect to Stripe Checkout
      } else {
        toast.error("Payment session URL missing");
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment initiation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <TopNavbar theme={theme} toggleTheme={toggleTheme} />

      <div className="container py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Payment Methods
            </h1>
            <p className="text-muted-foreground">Manage your payment options</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 rounded-xl border bg-card shadow-soft space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Add Card</h3>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                />
              </div>
              <Button onClick={addCard} className="w-full">
                Add Card
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Add UPI ID</h3>
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                />
              </div>
              <Button onClick={addUPI} className="w-full">
                Add UPI ID
              </Button>
            </div>
          </div>
        )}

        {/* ✅ Payment Section */}
        <div className="space-y-3">
          {methods.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No payment methods added yet
            </div>
          ) : (
            methods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    {method.type === "card" ? (
                      <p className="font-medium">Card •••• {method.last4}</p>
                    ) : (
                      <p className="font-medium">{method.upiId}</p>
                    )}
                    <p className="text-sm text-muted-foreground capitalize">
                      {method.type}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? "Processing..."
                      : latestBooking
                      ? `Pay ₹${latestBooking.totalAmount}`
                      : "No Booking"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMethod(method.id)}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default Payments;
