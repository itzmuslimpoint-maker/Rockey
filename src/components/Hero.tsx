import { motion, AnimatePresence } from "motion/react";
import { Zap, Check, DollarSign, Rocket, Bell, ChevronLeft, Video, Phone, Info } from "lucide-react";
import { useState, useEffect } from "react";

const conversation = [
  {
    id: 1,
    type: 'received',
    text: "Hey there! Glad you're here 😊 Tap below and I'll send you the access in just a moment ✨",
    buttons: ["Send me the access"]
  },
  {
    id: 2,
    type: 'sent',
    text: "Send me the access"
  },
  {
    id: 3,
    type: 'sent',
    text: "I'm following ✅"
  },
  {
    id: 4,
    type: 'received',
    text: "Hi there! Appreciate your comment 🙌 As promised, here's the link for you ⬇️",
    buttons: ["Click me"]
  }
];

function InstagramMockup() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const animate = () => {
      if (visibleCount < conversation.length) {
        timeout = setTimeout(() => {
          setVisibleCount(prev => prev + 1);
        }, 1500);
      } else {
        timeout = setTimeout(() => {
          setVisibleCount(0);
        }, 3000);
      }
    };

    animate();
    return () => clearTimeout(timeout);
  }, [visibleCount]);

  return (
    <div className="bg-black w-full h-full rounded-[2.5rem] overflow-hidden flex flex-col">
      {/* IG Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black z-20">
        <div className="flex items-center gap-3">
          <ChevronLeft className="w-6 h-6 text-white" />
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/dmflow/100/100" 
                  alt="DMflow Instagram Profile Picture" 
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-none">dmflow.site</span>
            <span className="text-[10px] text-green-500 font-medium">Active Now</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Phone className="w-5 h-5 text-white" />
          <Video className="w-6 h-6 text-white" />
          <Info className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide flex flex-col">
        <AnimatePresence mode="popLayout">
          {conversation.slice(0, visibleCount).map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex flex-col ${msg.type === 'sent' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] ${msg.type === 'sent' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.type === 'received' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mb-1">
                    <img 
                      src="https://picsum.photos/seed/dmflow/100/100" 
                      alt="DMflow Chat Bot Avatar" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div 
                    className={`px-4 py-2.5 rounded-[20px] text-[13px] leading-tight ${
                      msg.type === 'sent' 
                        ? 'bg-[#833AB4] text-white rounded-tr-none' 
                        : 'bg-[#262626] text-white rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  
                  {msg.buttons && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {msg.buttons.map((btn, i) => (
                        <div 
                          key={i}
                          className="bg-[#2C2C2E] text-white text-[13px] font-semibold px-4 py-2.5 rounded-[12px] text-center border border-white/5"
                        >
                          {btn}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative pt-20 pb-40 overflow-hidden bg-gradient-to-b from-[#2563EB] via-[#1a1a8c] to-[#0f0f6e] text-white">
      {/* Oval Shapes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square border-white/5 border-[1px] rounded-full -z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square border-white/5 border-[1px] rounded-full -z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full mb-12 shadow-lg"
        >
          <Zap className="w-4 h-4 text-brand-primary fill-brand-primary" />
          <span className="text-slate-900 font-bold text-sm">DMflow</span>
          <span className="text-slate-400 text-xs">×</span>
          <span className="text-slate-900 font-extrabold text-sm tracking-tight">Meta</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-extrabold font-display leading-tight mb-8"
        >
          Go Viral On IG <br />
          with DM Automation
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg md:text-xl text-white/80 mb-12 leading-relaxed"
        >
          Keep your audience and the Instagram algorithm happy by auto-responding to every comment in a DM.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center mb-12"
        >
          <button 
            onClick={onStart}
            className="px-12 py-5 bg-[#84FF00] text-black rounded-full text-xl font-bold hover:scale-105 transition-all active:scale-95 shadow-[0_0_30px_rgba(132,255,0,0.3)] hover:shadow-[0_0_50px_rgba(132,255,0,0.5)] cursor-pointer"
          >
            Start For Free
          </button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 mb-24"
        >
          {["Meta Verified", "No Credit Card", "Instant Setup"].map((text) => (
            <div key={text} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-sm font-medium">
              <Check className="w-4 h-4 text-[#84FF00]" />
              {text}
            </div>
          ))}
        </motion.div>

        {/* Phone Mockup Section */}
        <div className="relative max-w-[320px] mx-auto">
          {/* Floating Badges */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-32 top-10 z-20 hidden md:block"
          >
            <div className="bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-slate-900 border border-slate-100">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-500 font-medium">Sales</div>
                <div className="text-lg font-bold">+50% 💸</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-24 bottom-20 z-20 hidden md:block"
          >
            <div className="bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-slate-900 border border-slate-100">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Rocket className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-500 font-medium">Reach</div>
                <div className="text-lg font-bold">Go Viral 🚀</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-36 top-32 z-20 hidden md:block"
          >
            <div className="bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-slate-900 border border-slate-100">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <div className="text-xs text-slate-500 font-medium">Growth</div>
                <div className="text-lg font-bold">👤 1K — 2X Followers</div>
              </div>
            </div>
          </motion.div>

          {/* iPhone Mockup */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-[8px] border-slate-800 aspect-[9/19] w-full"
          >
            <InstagramMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
