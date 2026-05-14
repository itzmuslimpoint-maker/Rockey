import { useEffect } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentSuccess({ onDashboard }: { onDashboard: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200 text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Successful!</h1>
        <p className="text-slate-500 mb-10 leading-relaxed">
          Your account has been upgraded. You now have full access to all the features of your new plan.
        </p>
        
        <button 
          onClick={onDashboard}
          className="w-full py-4 brand-gradient text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}
