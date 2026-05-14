import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Check, X, ShieldCheck, Zap, CreditCard, Loader2 } from "lucide-react";
import axios from "axios";
import { initiatePayment } from "../lib/payment";

const plans = [
  {
    name: "Starter",
    price: { 
      IN: { monthly: 0, annual: 0 },
      GLOBAL: { monthly: 0, annual: 0 }
    },
    features: [
      "500 DMs per month",
      "1 Automation",
      "Basic Comment Reply",
      "DMflow Branding",
    ],
    button: "Start Free — No Card Required",
    popular: false,
  },
  {
    name: "Creator",
    price: { 
      IN: { monthly: 399, annual: 239 },
      GLOBAL: { monthly: 9, annual: 5 }
    },
    features: [
      "5000 DMs",
      "Unlimited Automations",
      "Re-trigger automation",
      "Ask For Follow feature",
      "Lead Capture",
      "Remove Branding",
      "Basic Analytics",
    ],
    button: "Unlock Growth-Lock Technology",
    popular: true,
  },
  {
    name: "Pro",
    price: { 
      IN: { monthly: 799, annual: 479 },
      GLOBAL: { monthly: 19, annual: 11 }
    },
    features: [
      "Unlimited DMs",
      "Unlimited Contacts",
      "Advanced Flow Builder",
      "Email Export",
      "Growth Analytics",
      "Priority Support",
    ],
    button: "Scale Without Limits",
    popular: false,
  },
];


export default function Pricing({ isPage = false }: { isPage?: boolean }) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [country, setCountry] = useState("US");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [igUser, setIgUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const fetchGeo = async () => {
      try {
        const { data } = await axios.get("/api/geo");
        setCountry(data.country);
      } catch (error) {
        console.error("Geo detection failed:", error);
      }
    };

    const fetchIgProfile = async () => {
      try {
        const { data } = await axios.get("/api/auth/instagram/profile");
        setIgUser(data);
      } catch (error) {
        setIgUser(null);
      }
    };

    fetchGeo();
    fetchIgProfile();
  }, []);

  const isIndia = country === "IN";
  const currencySymbol = isIndia ? "₹" : "$";
  const pricingKey = isIndia ? "IN" : "GLOBAL";

  const handlePayment = async (planName: string, amount: number) => {
    if (amount === 0) {
      alert("Starter plan is free!");
      return;
    }

    setLoadingPlan(planName);
    try {
      // Fetch user profile to get email and name for Dodo
      let email, name;
      try {
        const { data: profile } = await axios.get("/api/auth/instagram/profile");
        email = profile.email; // Note: Instagram Graph API might not always return email unless requested/permitted
        name = profile.username || profile.name;
      } catch (e) {
        console.warn("Could not fetch user profile for payment", e);
      }

      await initiatePayment({
        country,
        plan: planName,
        amount,
        email,
        name,
        onSuccess: () => {
          window.location.href = "/dashboard?payment=success";
        }
      });
    } catch (error: any) {
      console.error("Payment failed:", error);
      alert(error.message || "Payment failed. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className={`py-32 ${isPage ? 'bg-white' : 'bg-[#F7F7FB]'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          {isPage ? (
            <h1 className="text-4xl md:text-6xl font-extrabold font-display mb-6 text-slate-900 leading-tight">Simple Pricing. Serious Growth.</h1>
          ) : (
            <h2 className="text-4xl md:text-6xl font-extrabold font-display mb-6 text-slate-900 leading-tight">Simple Pricing. Serious Growth.</h2>
          )}
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
            Turn Instagram comments into automated DMs, followers, and sales — 24/7.
          </p>

          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-bold ${!isAnnual ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-14 h-8 bg-slate-200 rounded-full relative p-1 transition-colors"
            >
              <motion.div 
                animate={{ x: isAnnual ? 24 : 0 }}
                className="w-6 h-6 bg-brand-primary rounded-full shadow-md"
              />
            </button>
            <span className={`text-sm font-bold ${isAnnual ? "text-slate-900" : "text-slate-400"}`}>
              Annual <span className="text-brand-primary">(Save 40%)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {plans.map((plan, i) => {
            const currentPrice = isAnnual ? plan.price[pricingKey].annual : plan.price[pricingKey].monthly;
            return (
              <div 
                key={i}
                className={`relative p-10 rounded-[2.5rem] bg-white border ${
                  plan.popular ? "border-brand-primary shadow-2xl shadow-brand-primary/10" : "border-slate-100 shadow-xl shadow-slate-200/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-primary text-white text-xs font-bold rounded-full uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    {igUser && (plan.name === "Creator" || plan.name === "Pro") && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <Zap className="w-3 h-3 fill-brand-primary" />
                        @{igUser.username}
                      </div>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">{currencySymbol}{currentPrice}</span>
                    <span className="text-slate-400 font-medium">/ month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-slate-600 font-medium">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handlePayment(plan.name, currentPrice)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.popular 
                    ? "brand-gradient text-white shadow-lg shadow-brand-primary/20 hover:scale-[1.02]" 
                    : "bg-slate-50 text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {loadingPlan === plan.name ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    plan.button
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Plan Comparison Section */}
        <div className="max-w-5xl mx-auto mt-32">
          <div className="text-center mb-16">
            <span className="text-brand-primary text-xs font-bold uppercase tracking-widest mb-3 block">Simple Pricing for Every Creator</span>
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4 text-slate-900">Choose the Right Plan for Your Growth</h2>
            <p className="text-slate-500">Start free and upgrade as your Instagram automation grows.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-8 px-8 text-sm font-bold text-slate-400 uppercase tracking-widest w-1/4">Feature</th>
                    <th className="py-8 px-4 text-center w-1/4">
                      <div className="text-lg font-bold text-slate-900">Free</div>
                      <div className="text-xs text-slate-400 font-medium">{currencySymbol}0/mo</div>
                    </th>
                    <th className="py-8 px-4 text-center w-1/4 bg-brand-primary/5 relative">
                      <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-primary text-white text-[10px] font-bold rounded-b-lg uppercase tracking-widest whitespace-nowrap">
                        ⭐ Most Popular
                      </div>
                      <div className="text-lg font-bold text-brand-primary">Creator</div>
                      {igUser && (
                        <div className="text-[10px] font-bold text-brand-primary/80 uppercase tracking-tighter mt-1">
                          @{igUser.username}
                        </div>
                      )}
                      <div className="text-xs text-brand-primary/60 font-medium">{currencySymbol}{isIndia ? 399 : 9}/mo</div>
                    </th>
                    <th className="py-8 px-4 text-center w-1/4">
                      <div className="text-lg font-bold text-slate-900">Pro</div>
                      {igUser && (
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                          @{igUser.username}
                        </div>
                      )}
                      <div className="text-xs text-slate-400 font-medium">{currencySymbol}{isIndia ? 799 : 19}/mo</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Comment → DM Automation", free: true, creator: true, pro: true },
                    { name: "Follow-Lock Growth Feature", free: false, creator: true, pro: true },
                    { name: "Story Automation", free: false, creator: true, pro: true },
                    { name: "Email Capture from DMs", free: false, creator: false, pro: true },
                    { name: "Live Stream Automation", free: false, creator: false, pro: true },
                    { name: "Advanced Analytics", free: false, creator: false, pro: true },
                    { name: "Priority Support", free: false, creator: false, pro: true },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-8 font-semibold text-slate-700 text-sm">{row.name}</td>
                      <td className="py-5 px-4 text-center">
                        {row.free ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-5 px-4 text-center bg-brand-primary/5">
                        {row.creator ? <Check className="w-5 h-5 text-brand-primary mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-5 px-4 text-center">
                        {row.pro ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="py-8 px-8"></td>
                    <td className="py-8 px-4 text-center">
                      <button className="w-full max-w-[160px] py-3 bg-slate-50 text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all mx-auto">
                        Start Free
                      </button>
                    </td>
                    <td className="py-8 px-4 text-center bg-brand-primary/5">
                      <button 
                        onClick={() => handlePayment("Creator", isAnnual ? (isIndia ? 239 : 5) : (isIndia ? 399 : 9))}
                        disabled={loadingPlan !== null}
                        className="w-full max-w-[160px] py-3 brand-gradient text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all mx-auto flex items-center justify-center gap-2"
                      >
                        {loadingPlan === "Creator" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upgrade to Creator"}
                      </button>
                    </td>
                    <td className="py-8 px-4 text-center">
                      <button 
                        onClick={() => handlePayment("Pro", isAnnual ? (isIndia ? 479 : 11) : (isIndia ? 799 : 19))}
                        disabled={loadingPlan !== null}
                        className="w-full max-w-[160px] py-3 bg-slate-50 text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all mx-auto flex items-center justify-center gap-2"
                      >
                        {loadingPlan === "Pro" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go Pro"}
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <p className="text-center mt-8 text-slate-400 text-sm font-medium">
            🔥 Most creators start with the Creator plan.
          </p>
        </div>
      </div>
    </section>
  );
}
