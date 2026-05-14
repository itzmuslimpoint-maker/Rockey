import React, { useState } from "react";
import { motion } from "motion/react";
import { Facebook, Instagram, Radio, CheckCircle2, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";

interface OnboardingProps {
  onConnect: (type: 'facebook' | 'instagram') => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export default function Onboarding({ onConnect, onSkip, isLoading }: OnboardingProps) {
  const [selected, setSelected] = useState<'facebook' | 'instagram' | null>(null);

  const handleConnect = (type: 'facebook' | 'instagram') => {
    setSelected(type);
    onConnect(type);
  };

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          {/* Header */}
          <div className="p-8 md:p-12 text-center border-b border-slate-50">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-primary">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Connect Your Account</h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Enable DM automations for posts, reels, stories, and AI workflows by securely connecting your Instagram account.
            </p>
          </div>

          {/* Options */}
          <div className="p-8 md:p-12 space-y-6">
            {/* Facebook Option (Recommended) */}
            <button
              onClick={() => handleConnect('facebook')}
              disabled={isLoading}
              className={`w-full group relative p-6 rounded-3xl border-2 transition-all duration-300 text-left flex items-start gap-5 ${
                selected === 'facebook' 
                  ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/10' 
                  : 'border-slate-100 bg-slate-50/50 hover:border-blue-300 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5'
              }`}
            >
              <div className="absolute top-4 right-6 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/20">
                Recommended
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 text-blue-600">
                <Facebook className="w-7 h-7" />
              </div>
              <div className="flex-1 pr-12">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Connect with Facebook</h3>
                <p className="text-slate-500 text-sm font-medium">Connect via your linked Facebook Page for full Business features.</p>
              </div>
              <div className="self-center">
                <ArrowRight className={`w-5 h-5 transition-transform ${selected === 'facebook' ? 'translate-x-1 text-blue-600' : 'text-slate-300 group-hover:translate-x-1 group-hover:text-blue-400'}`} />
              </div>
            </button>

            {/* Instagram Option */}
            <button
              onClick={() => handleConnect('instagram')}
              disabled={isLoading}
              className={`w-full group p-6 rounded-3xl border-2 transition-all duration-300 text-left flex items-start gap-5 ${
                selected === 'instagram' 
                  ? 'border-pink-600 bg-pink-50/50 ring-4 ring-pink-500/10' 
                  : 'border-slate-100 bg-slate-50/50 hover:border-pink-300 hover:bg-white hover:shadow-xl hover:shadow-pink-500/5'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 text-pink-600">
                <Instagram className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Connect with Instagram</h3>
                <p className="text-slate-500 text-sm font-medium">Direct connection for basic automation and profile sync.</p>
              </div>
              <div className="self-center">
                <ArrowRight className={`w-5 h-5 transition-transform ${selected === 'instagram' ? 'translate-x-1 text-pink-600' : 'text-slate-300 group-hover:translate-x-1 group-hover:text-pink-400'}`} />
              </div>
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Meta Approved</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Instant Setup</span>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-8 md:p-10 bg-slate-50/50 border-t border-slate-100 text-center">
             <button 
                onClick={onSkip}
                className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
             >
               Skip for now, I'll connect later
             </button>
          </div>
        </div>

        {/* Benefits text below card */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-slate-500 shrink-0">
               <Sparkles className="w-4 h-4 text-amber-500" />
               <span className="text-sm font-bold">Auto-Reply to Comments</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 shrink-0">
               <CheckCircle2 className="w-4 h-4 text-emerald-500" />
               <span className="text-sm font-bold">Manage DMs with AI</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mb-6"
          />
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Authenticating...</h2>
          <p className="text-slate-500 font-medium">Starting secure OAuth flow with Meta</p>
        </div>
      )}
    </div>
  );
}
