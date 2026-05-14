import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import SEO from "./SEO";
import { 
  Check, 
  ChevronDown, 
  DollarSign, 
  Users, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  MousePointer2 
} from "lucide-react";

const faqs = [
  {
    q: "How much commission do I earn?",
    a: "You earn 30% recurring commission for every paying user who joins through your referral link."
  },
  {
    q: "When do I receive payouts?",
    a: "Payouts are processed on the 25th of every month."
  },
  {
    q: "What is the minimum payout amount?",
    a: "Minimum payout is ₹1000."
  },
  {
    q: "How can I promote my referral link?",
    a: "You can share it on Instagram, YouTube, blogs, or social media."
  },
  {
    q: "How can I track my earnings?",
    a: "After login you can track clicks, signups, and earnings in your referral dashboard."
  }
];

const maskUsername = (username: string) => {
  const parts = username.replace('@', '').split('_');
  const maskedParts = parts.map(p => p.slice(0, 2) + '***');
  return '@' + maskedParts.join('_');
};

const FAQItem = ({ question, answer }: { question: string, answer: string, key?: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-500 leading-relaxed text-sm">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface Creator {
  username: string;
  role: string;
  lastMonth: number;
  pending: number;
  thisMonth: number;
  thisMonthGrowth: number;
  totalEarned: number;
  thisWeek: number;
  thisWeekGrowth: number;
  weeklyData: number[];
  userType: string;
  recentUpdate?: number;
}

const initialCreators: Creator[] = [
  {
    username: "@alex_creations",
    role: "Content Creator",
    lastMonth: 4200,
    pending: 1200,
    thisMonth: 3800,
    thisMonthGrowth: 12,
    totalEarned: 28000,
    thisWeek: 850,
    thisWeekGrowth: 5,
    weeklyData: [40, 60, 45, 80, 55],
    userType: "Power User"
  },
  {
    username: "@sarah_designs",
    role: "Freelancer",
    lastMonth: 8500,
    pending: 2400,
    thisMonth: 9200,
    thisMonthGrowth: 18,
    totalEarned: 65000,
    thisWeek: 2100,
    thisWeekGrowth: 8,
    weeklyData: [30, 50, 70, 60, 90],
    userType: "Top Earner"
  },
  {
    username: "@tech_guru",
    role: "Agency",
    lastMonth: 12000,
    pending: 3500,
    thisMonth: 14500,
    thisMonthGrowth: 22,
    totalEarned: 120000,
    thisWeek: 3200,
    thisWeekGrowth: 15,
    weeklyData: [50, 40, 80, 70, 100],
    userType: "Elite Partner"
  },
  {
    username: "@student_hustle",
    role: "Student",
    lastMonth: 1200,
    pending: 400,
    thisMonth: 1500,
    thisMonthGrowth: 25,
    totalEarned: 5000,
    thisWeek: 350,
    thisWeekGrowth: 10,
    weeklyData: [20, 30, 25, 40, 35],
    userType: "Rising Star"
  },
  {
    username: "@creative_mind",
    role: "Content Creator",
    lastMonth: 5600,
    pending: 1800,
    thisMonth: 6200,
    thisMonthGrowth: 10,
    totalEarned: 42000,
    thisWeek: 1400,
    thisWeekGrowth: 4,
    weeklyData: [60, 50, 70, 65, 80],
    userType: "Verified"
  }
];

export default function AffiliatePage({ onBack, onStart }: { onBack: () => void, onStart: () => void }) {
  const [referrals, setReferrals] = useState(50);
  const [isYearly, setIsYearly] = useState(false);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [yearlyEarnings, setYearlyEarnings] = useState(0);
  
  const [creators, setCreators] = useState(initialCreators);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Carousel auto-slide
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % creators.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, creators.length]);

  // Data Engine: Update numbers randomly
  useEffect(() => {
    const interval = setInterval(() => {
      setCreators(prev => prev.map((creator) => {
        if (Math.random() > 0.4) return creator;
        
        const newCreator = { ...creator };
        const fields = ['thisMonth', 'thisWeek', 'pending'] as const;
        const fieldToUpdate = fields[Math.floor(Math.random() * fields.length)];
        
        const changePercent = (Math.random() * 0.06 + 0.02) * (Math.random() > 0.5 ? 1 : -1);
        const changeAmount = Math.round(newCreator[fieldToUpdate] * changePercent);
        
        newCreator[fieldToUpdate] = Math.max(100, newCreator[fieldToUpdate] + changeAmount);
        
        // Update growth percentages slightly
        if (Math.random() > 0.5) {
          newCreator.thisMonthGrowth = Math.max(1, Math.min(50, newCreator.thisMonthGrowth + (Math.random() > 0.5 ? 1 : -1)));
        }
        if (Math.random() > 0.5) {
          newCreator.thisWeekGrowth = Math.max(1, Math.min(30, newCreator.thisWeekGrowth + (Math.random() > 0.5 ? 1 : -1)));
        }
        
        if (changeAmount > 0 && Math.random() > 0.7) {
          newCreator.recentUpdate = Math.floor(Math.random() * 200 + 50);
          setTimeout(() => {
            setCreators(current => current.map(c => 
              c.username === newCreator.username ? { ...c, recentUpdate: undefined } : c
            ));
          }, 3000);
        }

        newCreator.weeklyData = newCreator.weeklyData.map(val => {
          const barChange = (Math.random() * 10 - 5);
          return Math.max(10, Math.min(100, val + barChange));
        });

        return newCreator;
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const monthly = referrals * 120;
    setMonthlyEarnings(monthly);
    setYearlyEarnings(monthly * 12);
  }, [referrals]);

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <SEO 
        title="Affiliate Program – Earn 30% Recurring Commission | DMflow"
        description="Join the DMflow affiliate program and earn 30% recurring commission for every user you refer. Start building your recurring income today."
        canonical="https://www.dmflow.site/affiliate"
      />
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-[0.03] -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-widest mb-8"
          >
            <DollarSign className="w-4 h-4" />
            Affiliate Program
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold font-display mb-6 text-slate-900 leading-tight"
          >
            Earn <span className="text-brand-primary">30% Recurring</span> Commission with DMflow
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Creators are earning every month with DMflow referrals. You can start earning too.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center gap-8"
          >
            <button 
              onClick={onStart}
              className="px-10 py-5 bg-brand-primary text-white rounded-full text-lg font-bold hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-brand-primary/25 flex items-center gap-2"
            >
              Start Earning Today
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "30% Commission", icon: <TrendingUp className="w-3 h-3" /> },
                { label: "Real-time tracking", icon: <MousePointer2 className="w-3 h-3" /> },
                { label: "Monthly payouts", icon: <DollarSign className="w-3 h-3" /> }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm text-xs font-bold text-slate-600">
                  <span className="text-brand-primary">{badge.icon}</span>
                  {badge.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-slate-900">Calculate Your Potential Earnings</h2>
            <p className="text-slate-500">See how much you can earn by referring creators to DMflow.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Number of Referrals</label>
                  <span className="text-2xl font-bold text-brand-primary">{referrals}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  value={referrals}
                  onChange={(e) => setReferrals(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>0 Referrals</span>
                  <span>500 Referrals</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <span className={`text-sm font-bold transition-colors ${!isYearly ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
                <button 
                  onClick={() => setIsYearly(!isYearly)}
                  className="w-14 h-8 bg-slate-100 rounded-full relative p-1 transition-colors hover:bg-slate-200"
                >
                  <motion.div 
                    animate={{ x: isYearly ? 24 : 0 }}
                    className="w-6 h-6 bg-brand-primary rounded-full shadow-md"
                  />
                </button>
                <span className={`text-sm font-bold transition-colors ${isYearly ? "text-slate-900" : "text-slate-400"}`}>Yearly</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Monthly Earnings</div>
                <div className="text-4xl font-bold text-slate-900 mb-1">₹{monthlyEarnings.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Recurring</div>
              </div>
              <div className="p-8 rounded-[2rem] brand-gradient text-center text-white shadow-xl shadow-brand-primary/20">
                <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Yearly Earnings</div>
                <div className="text-4xl font-bold mb-1">₹{yearlyEarnings.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Estimated</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Real Earning Potential */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display mb-4 text-slate-900">💸 Real Earning Potential</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">See how much you can earn by referring creators to DMflow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {[
              { users: "10", amount: "1,200", highlighted: false },
              { users: "50", amount: "6,000", highlighted: true },
              { users: "100", amount: "12,000", highlighted: false },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-10 rounded-[16px] text-center transition-all duration-300 ${
                  item.highlighted 
                    ? "bg-white border-2 border-brand-primary shadow-[0_20px_40px_rgba(37,99,235,0.1)] md:scale-110 z-10" 
                    : "bg-slate-50 border border-slate-100 shadow-sm"
                }`}
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">If you refer</p>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{item.users} users</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl md:text-5xl font-black text-brand-primary">₹{item.amount}</span>
                  <span className="text-slate-400 font-bold text-sm">/ month</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creators Earning Carousel */}
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-display text-slate-900">Creators Are Earning with DMflow</h2>
          </div>

          <div 
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="flex justify-center items-center gap-4 md:gap-8 min-h-[520px]">
              <AnimatePresence mode="popLayout">
                {[-1, 0, 1].map((offset) => {
                  const index = (activeIndex + offset + creators.length) % creators.length;
                  const creator = creators[index] as any;
                  const isCenter = offset === 0;

                  return (
                    <motion.div
                      key={creator.username}
                      initial={{ opacity: 0, scale: 0.8, x: offset * 100 }}
                      animate={{ 
                        opacity: isCenter ? 1 : 0.65, 
                        scale: isCenter ? 1.05 : 0.95,
                        x: 0,
                        zIndex: isCenter ? 20 : 10,
                        boxShadow: isCenter 
                          ? "0 25px 50px -12px rgba(37, 99, 235, 0.15)" 
                          : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                      exit={{ opacity: 0, scale: 0.8, x: -offset * 100 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 100) setActiveIndex(p => (p - 1 + creators.length) % creators.length);
                        if (info.offset.x < -100) setActiveIndex(p => (p + 1) % creators.length);
                      }}
                      className={`w-full max-w-[380px] bg-white rounded-[20px] p-8 flex-shrink-0 relative cursor-grab active:cursor-grabbing ${!isCenter ? 'hidden md:block' : ''}`}
                    >
                      {/* Top */}
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{maskUsername(creator.username)}</h4>
                          <span className="text-xs font-medium text-slate-400">{creator.role}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active now</span>
                        </div>
                      </div>

                      {/* Middle Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Month</p>
                          <p className="font-bold text-slate-900 text-sm">₹{Math.floor(creator.lastMonth).toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pending</p>
                          <p className="font-bold text-brand-primary text-sm">₹{Math.floor(creator.pending).toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">This Month</p>
                          <div className="flex items-center gap-1">
                            <p className="font-bold text-slate-900 text-sm">₹{Math.floor(creator.thisMonth).toLocaleString()}</p>
                            <span className="text-[10px] font-bold text-emerald-500">+{creator.thisMonthGrowth}%</span>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                          <p className="font-bold text-slate-900 text-sm">₹{Math.floor(creator.totalEarned).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Bottom */}
                      <div className="mb-6">
                        <div className="flex justify-between items-end mb-4">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">This Week</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-black text-brand-primary">₹{Math.floor(creator.thisWeek).toLocaleString()}</p>
                              <span className="text-xs font-bold text-emerald-500">+{creator.thisWeekGrowth}%</span>
                            </div>
                          </div>
                          {/* Mini Bar Chart */}
                          <div className="flex items-end gap-1 h-12">
                            {creator.weeklyData.map((val: number, idx: number) => (
                              <motion.div 
                                key={idx}
                                animate={{ height: `${val}%` }}
                                className="w-1.5 bg-brand-primary/20 rounded-t-full"
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer Tag */}
                      <div className="pt-6 border-t border-slate-100 flex justify-between items-center h-8">
                        <span className="px-3 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {creator.userType}
                        </span>
                        
                        {/* Micro update notification */}
                        <AnimatePresence>
                          {creator.recentUpdate && (
                            <motion.span
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="text-[10px] font-bold text-emerald-500"
                            >
                              +₹{creator.recentUpdate} earned just now
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            
            {/* Carousel Indicators */}
            <div className="flex justify-center items-center gap-3 mt-8">
              {creators.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex 
                      ? "w-3 h-3 bg-brand-primary" 
                      : "w-2 h-2 bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about the DMflow affiliate program.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="brand-gradient p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden shadow-2xl shadow-brand-primary/20">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm -z-10" />
            <h2 className="text-4xl md:text-6xl font-extrabold font-display mb-8 text-white">Ready to Start Earning?</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
              Join our affiliate program today and start building your recurring income stream with DMflow.
            </p>
            <button 
              onClick={onStart}
              className="px-12 py-5 bg-white text-brand-primary rounded-full text-xl font-bold hover:scale-105 transition-transform active:scale-95 shadow-xl"
            >
              Join Program Now
            </button>
          </div>
        </div>
      </section>

      {/* Back Button */}
      <button 
        onClick={onBack}
        className="fixed bottom-8 left-8 p-4 bg-white rounded-full shadow-xl border border-slate-100 text-slate-900 hover:scale-110 transition-transform z-50"
      >
        <ArrowRight className="w-6 h-6 rotate-180" />
      </button>
    </div>
  );
}
