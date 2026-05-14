import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, Instagram, CheckCircle2, ChevronRight, X, ExternalLink } from "lucide-react";

interface AccountTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountTypeDialog({ isOpen, onClose }: AccountTypeDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/40 overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="p-8 text-center bg-slate-50 border-b border-slate-100 relative">
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-pink-600">
              <Instagram className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Professional Account Required</h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">To enable automations, Meta requires an Instagram Professional account linked to a Facebook Page.</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-1">Simple 3-Step Setup</h3>
              
              <div className="space-y-3">
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-start group hover:bg-white hover:shadow-lg hover:shadow-slate-200/20 transition-all">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">1</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Switch to Professional</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Open Instagram App → Settings → Account Type → Switch to Professional (Business or Creator).</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-start group hover:bg-white hover:shadow-lg hover:shadow-slate-200/20 transition-all">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">2</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Connect a Facebook Page</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Go to your Instagram Profile → Edit Profile → Page → Create or Connect an existing Page.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-start group hover:bg-white hover:shadow-lg hover:shadow-slate-200/20 transition-all">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">3</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Reconnect on DMflow</h4>
                    <p className="text-xs text-slate-500 mt-1 font-medium">After linking, return here and click Connect again to complete the setup.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a 
                href="https://help.instagram.com/502981923235522" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
              >
                Learn How to Switch Account
                <ExternalLink className="w-4 h-4" />
              </a>
              <button 
                onClick={onClose}
                className="w-full py-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
              >
                Got it, I'll fix this now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
