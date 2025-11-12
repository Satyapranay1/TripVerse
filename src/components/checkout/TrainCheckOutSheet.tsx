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
import { Loader2, CheckCircle, XCircle, Train } from "lucide-react";
import { toast } from "sonner";

interface TrainCheckoutSheetProps {
  open: boolean;
  onClose: () => void;
  booking: any;
}

export default function TrainCheckoutSheet({
  open,
  onClose,
  booking,
}: TrainCheckoutSheetProps) {
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

  const handlePay = async () => {
    if (!paymentMethod) {
      toast.error("Please select payment method");
      return;
    }

    setStep("processing");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!user || !token) {
        toast.error("Please login again");
        setStep("payment");
        return;
      }

      const BASE_URL = "https://travel-app1-p0m8.onrender.com";

      // 1) Create pending booking (TRAIN)
      const initRes = await fetch(`${BASE_URL}/api/bookings/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          type: "train", // ✅ Booking type
          name: booking?.name, // ✅ Train name
          fromLocation: booking?.from,
          toLocation: booking?.to,
          passengerCount: Number(passengerCount),
          passengers,
          includeMeal,
          includeBaggage,
          price: Number(totalPrice()),
          paymentMethod, // ✅ Required or backend throws 403
        }),
      });

      if (!initRes.ok) throw new Error("Booking init failed");
      const pendingBooking = await initRes.json();

      // 2) Create Stripe Checkout Session
      const payRes = await fetch(
        `${BASE_URL}/api/payment/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
          <SheetTitle>Train Checkout</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {step === "passengers" && (
            <>
              <div className="p-4 rounded-lg bg-secondary">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Train className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{booking?.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {booking?.from} → {booking?.to}
                </p>
                <p className="text-sm mt-1">Class: {booking?.class}</p>
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
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
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
                          <SelectValue placeholder="Select" />
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

              <div className="space-y-4 p-4 border rounded-lg">
                <Label className="font-medium">Add-ons</Label>

                <div className="flex items-center justify-between">
                  <span>
                    Meal (+{CURRENCY}
                    {MEAL_PRICE} / passenger)
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
                    {BAGGAGE_PRICE} / passenger)
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

          {step === "payment" && (
            <>
              <div className="p-4 rounded-lg bg-secondary">
                <h3 className="font-semibold mb-2">Review & Pay</h3>
                <p className="text-xl font-bold text-primary">
                  Total: {CURRENCY}
                  {totalPrice()}
                </p>
              </div>

              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose payment method" />
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

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
              <p>Processing...</p>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold">Booking Confirmed 🎉</h3>
              <Button className="w-full mt-6" size="lg" onClick={handleClose}>
                Done
              </Button>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center justify-center py-12">
              <XCircle className="w-16 h-16 text-destructive mb-4" />
              <p>Payment Failed</p>
              <Button
                className="w-full mt-4"
                onClick={() => setStep("payment")}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
