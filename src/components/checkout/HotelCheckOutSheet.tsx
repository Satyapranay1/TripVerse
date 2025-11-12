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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Bed } from "lucide-react";
import { toast } from "sonner";
import { addDays, format, differenceInDays } from "date-fns";

export default function HotelCheckoutSheet({ open, onClose, booking }) {
  type Step = "details" | "payment" | "processing";
  const [step, setStep] = useState<Step>("details");

  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(addDays(new Date(), 1));

  const [roomCount, setRoomCount] = useState("1");
  const [guestCount, setGuestCount] = useState("1");

  const [guests, setGuests] = useState([{ fullName: "", age: "", gender: "" }]);

  const [includeBreakfast, setIncludeBreakfast] = useState(false);
  const [includeLateCheckout, setIncludeLateCheckout] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("");

  const BREAKFAST_PRICE = 200;
  const LATE_CHECKOUT_PRICE = 350;
  const CURRENCY = "₹";

  const nights = Math.max(differenceInDays(checkOut, checkIn), 1);
  const basePrice = Number(booking?.price || 0) * nights * Number(roomCount);
  const breakfastCost = includeBreakfast ? BREAKFAST_PRICE * Number(guestCount) : 0;
  const lateCheckoutCost = includeLateCheckout ? LATE_CHECKOUT_PRICE : 0;
  const totalPrice = () => (basePrice + breakfastCost + lateCheckoutCost).toFixed(2);

  const syncGuests = (count: number) => {
    const updated = [...guests];
    if (count > updated.length) {
      while (updated.length < count)
        updated.push({ fullName: "", age: "", gender: "" });
    } else updated.length = count;
    setGuests(updated);
  };

  const updateGuest = (i: number, field: string, value: string) => {
    const updated = [...guests];
    (updated[i] as any)[field] = value;
    setGuests(updated);
  };

  const handleContinue = () => {
    for (const g of guests) {
      if (!g.fullName || !g.age || !g.gender) {
        toast.error("Please fill all guest details.");
        return;
      }
    }
    setStep("payment");
  };

  const handlePay = async () => {
    if (!paymentMethod) {
      toast.error("Select payment method.");
      return;
    }

    setStep("processing");

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token"); // ✅ Correct token fetch

      if (!user || !token) {
        toast.error("Please login again");
        setStep("payment");
        return;
      }

      const BASE_URL = "https://travel-app1-p0m8.onrender.com";

      const initRes = await fetch(`${BASE_URL}/api/bookings/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Now valid
        },
        body: JSON.stringify({
          hotelId: booking?.id,
          checkIn,
          checkOut,
          nights,
          rooms: Number(roomCount),
          guests,
          includeBreakfast,
          includeLateCheckout,
          price: Number(totalPrice()),
          paymentMethod,
          userId: user.id,
        }),
      });

      if (!initRes.ok) throw new Error("Failed booking init");
      const pendingBooking = await initRes.json();

      const payRes = await fetch(`${BASE_URL}/api/payment/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Now valid
        },
        body: JSON.stringify({
          bookingId: pendingBooking.id,
          amount: Number(totalPrice()),
        }),
      });

      if (!payRes.ok) throw new Error("Failed checkout session");
      const { url } = await payRes.json();

      window.location.href = url;
    } catch (err) {
      console.error(err);
      toast.error("Payment could not start");
      setStep("payment");
    }
  };

  const handleClose = () => {
    setStep("details");
    setGuests([{ fullName: "", age: "", gender: "" }]);
    setGuestCount("1");
    setRoomCount("1");
    setIncludeBreakfast(false);
    setIncludeLateCheckout(false);
    setPaymentMethod("");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Hotel Checkout</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {step === "details" && (
            <>
              <div className="p-4 rounded-lg bg-secondary">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bed className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{booking?.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{booking?.location}</p>
                <p className="text-2xl font-bold text-primary mt-3">
                  {CURRENCY}{booking?.price}/night
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dates, Rooms, Guests etc */}
              </div>

              {/* Guests */}
              {guests.map((g, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium">Guest {i + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label>Full Name</Label>
                      <Input value={g.fullName} onChange={(e) => updateGuest(i, "fullName", e.target.value)} />
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input value={g.age} onChange={(e) => updateGuest(i, "age", e.target.value)} />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <Select value={g.gender} onValueChange={(v) => updateGuest(i, "gender", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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

              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue to Payment
              </Button>
            </>
          )}

          {step === "payment" && (
            <>
              <div className="p-4 rounded-lg bg-secondary">
                <h3 className="font-semibold">Review & Pay</h3>
                <p className="text-xl font-bold text-primary mt-2">Total: {CURRENCY}{totalPrice()}</p>
              </div>

              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>
                  Back
                </Button>
                <Button className="flex-1" size="lg" onClick={handlePay}>
                  Pay {CURRENCY}{totalPrice()}
                </Button>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
              Redirecting to secure payment...
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
