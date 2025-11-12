import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const backend = "https://travel-app1-p0m8.onrender.com";

  useEffect(() => {
    async function confirm() {
      try {
        await fetch(`${backend}/api/bookings/confirm/${sessionId}`, {
          method: "POST",
        });

        // Redirect to trips after confirmation
        setTimeout(() => {
          navigate("/trips", { replace: true });
        }, 1200);
      } catch (err) {
        console.error(err);
        navigate("/payment-failed", { replace: true });
      }
    }

    if (sessionId) confirm();
  }, [sessionId, navigate]);

  return (
    <div className="flex flex-col justify-center items-center min-h-[70vh] text-center space-y-4 px-6">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-lg font-medium">Confirming your booking...</p>
    </div>
  );
}
