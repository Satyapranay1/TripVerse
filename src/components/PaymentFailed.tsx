import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center min-h-[70vh] space-y-4 text-center px-6">
      <XCircle className="w-16 h-16 text-red-500" />
      <h2 className="text-xl font-semibold">Payment Failed</h2>
      <p className="text-muted-foreground">Something went wrong during payment.</p>
      <Button onClick={() => navigate(-1)} className="mt-4">Try Again</Button>
    </div>
  );
}
