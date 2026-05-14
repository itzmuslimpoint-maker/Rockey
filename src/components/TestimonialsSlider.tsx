import { motion } from "motion/react";

const testimonials = [
  {
    initials: "SR",
    username: "@sarah_creates",
    review: "I gained 500 followers in a single day using Growth-Lock. Best investment for my Instagram ever.",
    color: "from-pink-500 to-rose-500"
  },
  {
    initials: "DG",
    username: "@digitalgrowthlab",
    review: "Collected 300 emails in one hour just by automating comment replies. Absolutely insane results.",
    color: "from-blue-500 to-indigo-500"
  },
  {
    initials: "RK",
    username: "@rahul.k",
    review: "DMflow saved me 4 hours every day. My DMs reply themselves now while I focus on content.",
    color: "from-emerald-500 to-teal-500"
  },
  {
    initials: "FG",
    username: "@fitnessguru_ig",
    review: "My comment section turned into a lead machine overnight. Growth-Lock is pure genius.",
    color: "from-orange-500 to-amber-500"
  },
  {
    initials: "SB",
    username: "@shopbrand.in",
    review: "Follower count went from 2K to 5K in one week. The Follow-Lock feature is unbelievable.",
    color: "from-purple-500 to-violet-500"
  },
  {
    initials: "MK",
    username: "@marketingking",
    review: "Turned my Instagram engagement into real sales. DMflow pays for itself within days.",
    color: "from-cyan-500 to-blue-500"
  },
  {
    initials: "CQ",
    username: "@contentqueen",
    review: "My audience exploded overnight. Story automation keeps my engagement rate sky high.",
    color: "from-fuchsia-500 to-pink-500"
  },
  {
    initials: "AK",
    username: "@ayaan.khan",
    review: "Setup took less than 5 minutes. I had my first automated DM running within the hour.",
    color: "from-slate-700 to-slate-900"
  },
  {
    initials: "IP",
    username: "@influencer.pro",
    review: "Better than ManyChat and half the price. Growth-Lock alone is worth every rupee.",
    color: "from-indigo-600 to-blue-700"
  },
  {
    initials: "JS",
    username: "@jaya.startup",
    review: "As a small business owner DMflow helped me collect leads automatically without any extra effort.",
    color: "from-red-500 to-orange-500"
  }
];

// Double the testimonials for seamless loop
const allTestimonials = [...testimonials, ...testimonials];

export default function TestimonialsSlider() {
  return (
    <section className="py-24 bg-slate-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold font-display mb-4 text-slate-900">
          What Creators Are Saying 👀
        </h2>
        <p className="text-xl text-slate-600">
          Join 10,000+ creators already using DMflow to grow on Instagram.
        </p>
      </div>

      <div className="relative flex">
        <motion.div 
          className="flex gap-6 px-6"
          animate={{
            x: [0, -280 * testimonials.length - 24 * testimonials.length],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          whileHover={{ animationPlayState: "paused" }}
        >
          {allTestimonials.map((t, i) => (
            <div 
              key={i}
              className="flex-none w-[320px] bg-white p-8 rounded-[16px] shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{t.username}</div>
                  <div className="flex text-amber-400 text-xs mt-0.5">
                    {"★".repeat(5)}
                  </div>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {t.review}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
