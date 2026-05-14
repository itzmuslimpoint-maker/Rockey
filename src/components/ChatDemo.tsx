import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Send, User as UserIcon, Check, Lock as LockIcon } from "lucide-react";

const messages = [
  { type: "bot", text: "Hey 👋 Thanks for requesting the guide." },
  { type: "bot", text: "I noticed you're not following yet 🔒" },
  { type: "bot", text: "Follow the account to unlock the link." },
  { type: "user-action", text: "User follows account", isAction: true },
  { type: "bot", text: "Welcome 🎉 Here is your download link." },
  { type: "bot", text: "👉 dmflow.site/guide-download", isLink: true }
];

export default function ChatDemo() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);

  useEffect(() => {
    if (visibleMessages < messages.length) {
      const timer = setTimeout(() => {
        setVisibleMessages(prev => prev + 1);
      }, visibleMessages === 3 ? 2000 : 1500);
      return () => clearTimeout(timer);
    } else {
      const resetTimer = setTimeout(() => {
        setVisibleMessages(0);
      }, 4000);
      return () => clearTimeout(resetTimer);
    }
  }, [visibleMessages]);

  return (
    <section className="py-24 bg-slate-50 border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <div className="relative mx-auto w-full max-w-[320px] aspect-[9/19] bg-white rounded-[3rem] border-[8px] border-slate-900 overflow-hidden shadow-2xl">
            {/* Phone Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center font-bold text-white">D</div>
              <div>
                <div className="text-sm font-bold text-slate-900">DMflow Bot</div>
                <div className="text-[10px] text-emerald-500 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Now
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="p-4 h-[calc(100%-140px)] overflow-y-auto flex flex-col gap-3 bg-slate-50/50">
              <AnimatePresence mode="popLayout">
                {messages.slice(0, visibleMessages).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.isAction 
                        ? "mx-auto bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider py-1 px-4 border border-emerald-100"
                        : msg.type === "bot" 
                          ? "bg-white text-slate-900 rounded-tl-none shadow-sm border border-slate-100" 
                          : "bg-brand-primary text-white self-end rounded-tr-none"
                    }`}
                  >
                    {msg.isAction && <Check className="w-3 h-3 inline mr-1" />}
                    {msg.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
                <div className="flex-1 text-xs text-slate-400 italic">Type a message...</div>
                <Send className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 text-slate-900">Experience the Magic of Automation</h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            See how DMflow interacts with your audience in real-time. It's like having a 24/7 sales team that never sleeps, never complains, and always follows up.
          </p>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0 border border-slate-100">
                <UserIcon className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-slate-900">Personalized Interactions</h4>
                <p className="text-sm text-slate-500">Every message is tailored to the user's behavior and status.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0 border border-slate-100">
                <LockIcon className="w-6 h-6 text-brand-secondary" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-slate-900">Smart Verification</h4>
                <p className="text-sm text-slate-500">Our system checks follower status instantly before delivering value.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
