import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X, Zap } from "lucide-react";

export default function Navbar({ onStart, onAffiliate, onHelp, onHome, onPricing, onFeatures }: { 
  onStart: () => void, 
  onAffiliate: () => void, 
  onHelp: () => void, 
  onHome?: () => void,
  onPricing?: () => void,
  onFeatures?: () => void
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[72px] flex items-center ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 w-full flex items-center justify-between">
        <div className="flex items-center gap-10">
          <button onClick={onHome} className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight font-display ${isScrolled ? "text-slate-900" : "text-white"}`}>DMflow</span>
          </button>

          {/* Center Menu */}
          <div className={`hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider ${isScrolled ? "text-slate-600" : "text-white/90"}`}>
            <a 
              href="/features" 
              onClick={(e) => { e.preventDefault(); onFeatures?.(); }}
              className="hover:text-brand-primary transition-colors cursor-pointer uppercase"
            >
              Features
            </a>
            <a 
              href="/pricing" 
              onClick={(e) => { e.preventDefault(); onPricing?.(); }}
              className="hover:text-brand-primary transition-colors cursor-pointer uppercase"
            >
              Pricing
            </a>
            <a 
              href="/affiliate"
              onClick={(e) => { e.preventDefault(); onAffiliate(); }}
              className="hover:text-brand-primary transition-colors cursor-pointer uppercase"
            >
              Affiliate
            </a>
            <a 
              href="/help"
              onClick={(e) => { e.preventDefault(); onHelp(); }}
              className="hover:text-brand-primary transition-colors cursor-pointer uppercase"
            >
              Help Center
            </a>
          </div>
        </div>

        {/* Right Menu */}
        <div className={`hidden md:flex items-center gap-4 text-sm font-bold uppercase tracking-wider ${isScrolled ? "text-slate-600" : "text-white/90"}`}>
          <a 
            href="/login"
            onClick={(e) => { e.preventDefault(); onStart(); }}
            className="hover:text-brand-primary transition-colors cursor-pointer uppercase"
          >
            Login
          </a>
          <a 
            href="/signup"
            onClick={(e) => { e.preventDefault(); onStart(); }}
            className="px-8 py-3 bg-brand-primary text-white rounded-full font-bold hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-brand-primary/20"
          >
            Start For Free
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className={`md:hidden ${isScrolled ? "text-slate-900" : "text-white"}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-white border-t border-slate-100 p-6 flex flex-col gap-6 md:hidden shadow-xl"
        >
          <a 
            href="/features" 
            onClick={(e) => { e.preventDefault(); onFeatures?.(); setIsMobileMenuOpen(false); }}
            className="text-lg font-bold text-left text-slate-900"
          >
            Features
          </a>
          <a 
            href="/pricing" 
            onClick={(e) => { e.preventDefault(); onPricing?.(); setIsMobileMenuOpen(false); }}
            className="text-lg font-bold text-left text-slate-900"
          >
            Pricing
          </a>
          <a 
            href="/affiliate" 
            onClick={(e) => { e.preventDefault(); onAffiliate(); setIsMobileMenuOpen(false); }}
            className="text-lg font-bold text-left text-slate-900"
          >
            Affiliate
          </a>
          <a 
            href="/help" 
            onClick={(e) => { e.preventDefault(); onHelp(); setIsMobileMenuOpen(false); }}
            className="text-lg font-bold text-left text-slate-900"
          >
            Help Center
          </a>
          <a 
            href="/login" 
            onClick={(e) => { e.preventDefault(); onStart(); setIsMobileMenuOpen(false); }}
            className="text-lg font-bold text-left text-slate-900"
          >
            Login
          </a>
          <a 
            href="/signup" 
            onClick={(e) => { e.preventDefault(); onStart(); setIsMobileMenuOpen(false); }}
            className="w-full py-4 bg-brand-primary rounded-xl text-white font-bold inline-block text-center"
          >
            Start For Free
          </a>
        </motion.div>
      )}
    </nav>
  );
}
