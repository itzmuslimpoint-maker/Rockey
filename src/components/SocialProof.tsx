const stats = [
  { value: "30M+", label: "DMs Sent" },
  { value: "5M+", label: "Followers Gained" },
  { value: "10M+", label: "Comments Sent" },
  { value: "12+", label: "Countries" },
];

export default function SocialProof() {
  return (
    <section className="py-24 bg-white">
      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="text-4xl md:text-5xl font-extrabold text-[#2563EB]">
                {stat.value}
              </div>
              <div className="text-slate-500 font-medium tracking-wide uppercase text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
