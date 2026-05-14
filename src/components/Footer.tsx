import { Instagram, Twitter, Youtube, ArrowRight, Zap } from "lucide-react";

interface FooterProps {
  onPrivacy?: () => void;
  onTerms?: () => void;
  onAffiliate?: () => void;
  onHelp?: () => void;
  onDataDeletion?: () => void;
}

export default function Footer({ onPrivacy, onTerms, onAffiliate, onHelp, onDataDeletion }: FooterProps) {
  return (
    <footer className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight font-display text-slate-900">DMflow</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              The world's first Instagram automation platform with Growth-Lock Technology™. Automate your growth, collect leads, and scale your brand.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100">
                <Instagram className="w-5 h-5 text-slate-400" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100">
                <Twitter className="w-5 h-5 text-slate-400" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100">
                <Youtube className="w-5 h-5 text-slate-400" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-900">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="/features" className="hover:text-brand-primary transition-colors">Features</a></li>
              <li><a href="/pricing" className="hover:text-brand-primary transition-colors">Pricing</a></li>
              <li><a href="/blog" className="hover:text-brand-primary transition-colors">Blog</a></li>
              <li><a href="/signup" className="hover:text-brand-primary transition-colors font-bold text-brand-primary">Start For Free</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-900">Resources</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="/help" onClick={(e) => { e.preventDefault(); onHelp?.(); }} className="hover:text-brand-primary transition-colors text-left block">FAQs</a></li>
              <li><a href="/privacy" onClick={(e) => { e.preventDefault(); onPrivacy?.(); }} className="hover:text-brand-primary transition-colors text-left block">Privacy Policy</a></li>
              <li><a href="/terms" onClick={(e) => { e.preventDefault(); onTerms?.(); }} className="hover:text-brand-primary transition-colors text-left block">Terms of Service</a></li>
              <li><a href="/delete-data" onClick={(e) => { e.preventDefault(); onDataDeletion?.(); }} className="hover:text-brand-primary transition-colors text-left block">User Data Deletion</a></li>
              <li><a href="/affiliate" onClick={(e) => { e.preventDefault(); onAffiliate?.(); }} className="hover:text-brand-primary transition-colors text-left block">Affiliate Program</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-900">Newsletter</h4>
            <p className="text-sm text-slate-500 mb-6">Get the latest growth hacks and automation tips delivered to your inbox.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full py-4 px-6 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-brand-primary outline-none text-sm text-slate-900"
              />
              <button className="absolute right-2 top-2 bottom-2 px-4 bg-brand-primary text-white rounded-xl flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium uppercase tracking-widest">
          <div>© 2026 DMflow. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-brand-primary transition-colors">Status</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Security</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
