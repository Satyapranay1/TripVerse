import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, Plane } from "lucide-react";
import { toast } from "sonner";

interface FlightCheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  booking: any;
}

export default function FlightCheckoutSheet({
  open,
  onClose,
  booking,
}: FlightCheckoutSheetProps) {
  type Step = "passengers" | "payment" | "processing" | "success" | "error";
  const [step, setStep] = useState<Step>("passengers");

  const [passengerCount, setPassengerCount] = useState("1");

  const [passengers, setPassengers] = useState([
    { fullName: "", age: "", gender: "" },
  ]);

  const [includeMeal, setIncludeMeal] = useState(false);
  const [includeBaggage, setIncludeBaggage] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  const PRICE = Number(booking?.price || 0);
  const MEAL_PRICE = 150;
  const BAGGAGE_PRICE = 300;
  const CURRENCY = "₹";

  const syncPassengers = (count: number) => {
    const current = [...passengers];
    if (count > current.length) {
      while (current.length < count)
        current.push({ fullName: "", age: "", gender: "" });
    } else {
      current.length = count;
    }
    setPassengers(current);
  };

  const handlePassengerCountChange = (value: string) => {
    setPassengerCount(value);
    syncPassengers(Number(value));
  };

  const updatePassenger = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    (updated[index] as any)[field] = value;
    setPassengers(updated);
  };

  const handleContinue = () => {
    for (const p of passengers) {
      if (!p.fullName || !p.age || !p.gender) {
        toast.error("Please fill all passenger details");
        return;
      }
    }
    setStep("payment");
  };

  const totalPrice = () => {
    const base = PRICE * Number(passengerCount);
    const meal = includeMeal ? MEAL_PRICE * Number(passengerCount) : 0;
    const baggage = includeBaggage ? BAGGAGE_PRICE * Number(passengerCount) : 0;
    return (base + meal + baggage).toFixed(2);
  };

  const reset = () => {
    setStep("passengers");
    setPassengerCount("1");
    setPassengers([{ fullName: "", age: "", gender: "" }]);
    setIncludeMeal(false);
    setIncludeBaggage(false);
    setPaymentMethod("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ✅ Same backend + Stripe flow as hotel
  const handlePay = async () => {
    if (!paymentMethod) {
      toast.error("Please select payment method");
      return;
    }

    setStep("processing");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token"); // ✅ correct token source

      if (!user || !token) {
        toast.error("Please login again");
        setStep("payment");
        return;
      }

      const BASE_URL = "https://travel-app1-p0m8.onrender.com";

      // 1) Create pending booking (FLIGHT)
      const initRes = await fetch(`${BASE_URL}/api/bookings/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ required
        },
        body: JSON.stringify({
          userId: user.id,
          type: "flight",
          name: booking?.airline,
          fromLocation: booking?.from,
          toLocation: booking?.to,
          passengerCount: Number(passengerCount),
          passengers, // ✅ backend expects this list
          includeMeal,
          includeBaggage,
          price: Number(totalPrice()),
          paymentMethod, // ✅ required field
        }),
      });

      if (!initRes.ok) throw new Error("Booking init failed");
      const pendingBooking = await initRes.json();

      // 2) Create Stripe checkout session
      const payRes = await fetch(
        `${BASE_URL}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ same here
          },
          body: JSON.stringify({
            bookingId: pendingBooking.id,
            amount: Number(totalPrice()),
          }),
        }
      );

      if (!payRes.ok) throw new Error("Checkout session failed");
      const { url } = await payRes.json();

      // 3) Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error(error);
      toast.error("Payment could not start");
      setStep("payment");
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Flight Checkout</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Passengers */}
          {step === "passengers" && (
            <>
              <div className="p-4 rounded-lg bg-secondary">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Plane className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{booking?.airline} Flight</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {booking?.from} → {booking?.to}
                </p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {CURRENCY}
                  {PRICE}
                </p>
              </div>

              <div>
                <Label>Number of Passengers</Label>
                <Select
                  value={passengerCount}
                  onValueChange={handlePassengerCountChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {passengers.map((p, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium">Passenger {i + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label>Full Name</Label>
                      <Input
                        value={p.fullName}
                        onChange={(e) =>
                          updatePassenger(i, "fullName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input
                        value={p.age}
                        onChange={(e) =>
                          updatePassenger(i, "age", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select
                        value={p.gender}
                        onValueChange={(v) => updatePassenger(i, "gender", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 border rounded-lg space-y-4">
                <Label className="font-medium">Add-ons</Label>

                <div className="flex items-center justify-between">
                  <span>
                    Meal (+{CURRENCY}
                    {MEAL_PRICE} per passenger)
                  </span>
                  <Button
                    variant={includeMeal ? "default" : "outline"}
                    onClick={() => setIncludeMeal(!includeMeal)}
                  >
                    {includeMeal ? "Remove" : "Add"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>
                    Baggage (+{CURRENCY}
                    {BAGGAGE_PRICE} per passenger)
                  </span>
                  <Button
                    variant={includeBaggage ? "default" : "outline"}
                    onClick={() => setIncludeBaggage(!includeBaggage)}
                  >
                    {includeBaggage ? "Remove" : "Add"}
                  </Button>
                </div>

                <p className="text-right text-lg font-semibold mt-2">
                  Updated Total: {CURRENCY}
                  {totalPrice()}
                </p>
              </div>

              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue to Payment
              </Button>
            </>
          )}

          {/* Payment */}
          {step === "payment" && (
            <>
              <div className="p-4 rounded-lg bg-secondary">
                <h3 className="font-semibold">Review & Pay</h3>
                <p className="text-xl font-bold text-primary mt-2">
                  Total: {CURRENCY}
                  {totalPrice()}
                </p>
              </div>

              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("passengers")}
                >
                  Back
                </Button>
                <Button className="flex-1" size="lg" onClick={handlePay}>
                  Pay {CURRENCY}
                  {totalPrice()}
                </Button>
              </div>
            </>
          )}

          {/* Processing */}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                Redirecting to secure payment...
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
