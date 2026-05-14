import { motion } from "motion/react";
import { Lock as LockIcon, Unlock as UnlockIcon, CheckCircle2 } from "lucide-react";

export default function GrowthLock() {
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-extrabold font-display mb-8 text-slate-900 leading-tight">
              Stop Giving Your Value <br />
              <span className="text-brand-primary">Away For Free</span>
            </h2>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed">
              Growth-Lock Technology™ ensures that only your true fans get access to your premium content. It automatically verifies if a user follows you before delivering your link.
            </p>

            <div className="space-y-8">
              {[
                { step: "01", title: "The Gate", desc: "User comments keyword like LINK" },
                { step: "02", title: "The Check", desc: "DMflow verifies if user follows" },
                { step: "03", title: "The Reward", desc: "Follower receives link instantly" },
              ].map((s, i) => (
                <div key={i} className="flex gap-6">
                  <div className="text-2xl font-black text-brand-primary/20 font-display">{s.step}</div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{s.title}</h3>
                    <p className="text-slate-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative">
            <div className="grid gap-6">
              {/* Card 1: Not Following */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-red-500/10 border border-red-100 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16" />
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                    <LockIcon className="w-8 h-8" />
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest">
                    Status: Not Following
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h4>
                <p className="text-slate-500">Please follow @creator to unlock this link.</p>
                <div className="mt-6 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-1/2 h-full bg-red-500"
                  />
                </div>
              </motion.div>

              {/* Card 2: Follower Verified */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/10 border border-emerald-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16" />
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <UnlockIcon className="w-8 h-8" />
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest">
                    Follower Verified
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-2">Link Sent!</h4>
                <p className="text-slate-500">Check your DM for the exclusive access link.</p>
                <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  Success
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
