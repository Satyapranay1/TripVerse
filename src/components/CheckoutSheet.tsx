import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const CheckoutSheet = ({ open, onClose, booking }) => {
  const [step, setStep] = useState("details");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleGuestDetails = () => {
    if (!guestName || !guestEmail || !guestPhone) {
      toast.error("Please fill in all details");
      return;
    }
    setStep("payment");
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error("Select a payment method");
      return;
    }

    setStep("processing");
    await new Promise((r) => setTimeout(r, 2000));
    const success = Math.random() > 0.2;

    if (success) {
      setStep("success");
    } else {
      setStep("error");
    }
  };

  const reset = () => {
    setStep("details");
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    setPaymentMethod("");
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={reset}>
      <SheetContent side="bottom" className="h-[88vh] overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle className="text-center">Complete Your Booking</SheetTitle>
        </SheetHeader>

        <div className="flex justify-center gap-4 mt-6">
          <div className={`h-2 w-20 rounded-full ${step === "details" ? "bg-primary" : "bg-secondary"}`} />
          <div className={`h-2 w-20 rounded-full ${step === "payment" ? "bg-primary" : "bg-secondary"}`} />
          <div className={`h-2 w-20 rounded-full ${step === "processing" || step === "success" || step === "error" ? "bg-primary" : "bg-secondary"}`} />
        </div>

        {step === "details" && (
          <div className="mt-6 space-y-6">
            <div className="bg-secondary p-4 rounded-xl">
              <h3 className="font-semibold text-lg">{booking?.name}</h3>
              <p className="text-sm text-muted-foreground">{booking?.location}</p>
              <p className="text-2xl font-bold text-primary mt-2">${booking?.price}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleGuestDetails}>Continue</Button>
          </div>
        )}

        {step === "payment" && (
          <div className="mt-6 space-y-6">
            <div className="bg-secondary p-4 rounded-xl">
              <h3 className="font-semibold">Guest: {guestName}</h3>
              <p className="text-sm text-muted-foreground">{guestEmail}</p>
              <p className="text-xl font-bold text-primary mt-2">Total: ${booking?.price}</p>
            </div>

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep("details")}>Back</Button>
              <Button className="flex-1" size="lg" onClick={handlePayment}>Pay ${booking?.price}</Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-16 flex flex-col items-center text-center">
            <Loader2 className="w-14 h-14 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold">Processing your payment...</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-16 flex flex-col items-center text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-xl font-semibold">Booking Confirmed!</p>
            <Button className="w-full mt-6" onClick={reset}>Done</Button>
          </div>
        )}

        {step === "error" && (
          <div className="py-16 flex flex-col items-center text-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-xl font-semibold">Payment Failed</p>
            <div className="flex gap-3 w-full mt-6">
              <Button className="flex-1" variant="outline" onClick={reset}>Cancel</Button>
              <Button className="flex-1" onClick={() => setStep("payment")}>Try Again</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CheckoutSheet;