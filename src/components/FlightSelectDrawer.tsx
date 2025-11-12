import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";
import { Plane } from "lucide-react";

interface FlightSelectDrawerProps {
  flight: any;
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const FlightSelectDrawer = ({ flight, open, onClose, onContinue }: FlightSelectDrawerProps) => {
  const handleContinue = () => {
    onContinue(); // No seats, no meals, no baggage passed
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[60vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5" />
            {flight?.airline} - Flight Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4 p-4 rounded-lg bg-secondary">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Route</span>
            <span className="font-semibold">{flight?.from} → {flight?.to}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Departure</span>
            <span className="font-semibold">{flight?.departure}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Arrival</span>
            <span className="font-semibold">{flight?.arrival}</span>
          </div>

          <div className="flex justify-between pt-2 border-t">
            <span className="text-lg font-semibold">Ticket Price</span>
            <span className="text-2xl font-bold text-primary">₹{flight?.price}</span>
          </div>
        </div>

        <div className="mt-8 p-4 border-t sticky bottom-0 bg-background">
          <Button onClick={handleContinue} className="w-full" size="lg">
            Continue to Checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FlightSelectDrawer;
