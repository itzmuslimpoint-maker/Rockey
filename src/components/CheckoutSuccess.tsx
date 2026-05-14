import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";

export default function CheckoutSuccess() {
  const [loading, setLoading] = useState(true);
  
  const searchParams = new URLSearchParams(window.location.search);
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const email = searchParams.get("email");

  useEffect(() => {
    // Simulate a small delay for verification
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Verifying your payment...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200 text-center border border-slate-100"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-4">Payment Successful!</h1>
        <p className="text-slate-600 mb-8">
          Thank you for your purchase. Your account has been upgraded to premium.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 font-medium">Payment ID</span>
            <span className="text-slate-900 font-bold font-mono">{paymentId || "N/A"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400 font-medium">Status</span>
            <span className="text-emerald-600 font-bold uppercase tracking-wider">{status || "Succeeded"}</span>
          </div>
          {email && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Email</span>
              <span className="text-slate-900 font-bold">{email}</span>
            </div>
          )}
        </div>

        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="w-full py-4 brand-gradient text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
