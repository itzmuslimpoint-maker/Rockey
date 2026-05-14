import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is DMflow?",
    answer: "DMflow is an Instagram automation platform that helps creators automatically reply to comments, send DMs, collect emails, and grow followers using our proprietary Growth-Lock Technology™."
  },
  {
    question: "Is DMflow approved by Instagram / Meta?",
    answer: "Yes. DMflow is Meta Verified and uses the official Instagram Graph API. Your account is completely safe."
  },
  {
    question: "What is Growth-Lock Technology?",
    answer: "Growth-Lock is our unique feature that requires users to follow your Instagram account before receiving your link or content. This turns every download into a new follower automatically."
  },
  {
    question: "Do I need a credit card to start?",
    answer: "No. You can start completely free with no credit card required. Upgrade anytime when you are ready."
  },
  {
    question: "How long does setup take?",
    answer: "Setup takes less than 5 minutes. Connect your Instagram account, set your keyword trigger, write your DM message, and activate. Done."
  },
  {
    question: "What plans does DMflow offer?",
    answer: "DMflow offers 3 plans — Starter (Free), Creator at ₹399/month, and Pro at ₹799/month. Each plan unlocks more powerful features."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes. You can cancel your subscription at any time from your billing settings. No contracts, no hidden fees."
  },
  {
    question: "How is DMflow different from other tools?",
    answer: "DMflow is the only Instagram automation tool with Growth-Lock Technology™ which forces users to follow before unlocking links. This gives you real followers, not just link clicks."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold font-display mb-4 text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-600">
            Everything you need to know about DMflow.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="border-b border-slate-100 last:border-0"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full py-6 flex items-center justify-between text-left group"
              >
                <span className={`text-lg font-bold transition-colors ${openIndex === i ? 'text-brand-primary' : 'text-slate-900'}`}>
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`p-1 rounded-full ${openIndex === i ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-400 group-hover:text-slate-600'}`}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
