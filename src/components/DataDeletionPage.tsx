import { motion } from "motion/react";
import { Trash2, Mail, CheckCircle2, ArrowLeft, Zap } from "lucide-react";
import SEO from "./SEO";

interface DataDeletionPageProps {
  onBack: () => void;
}

export default function DataDeletionPage({ onBack }: DataDeletionPageProps) {
  const steps = [
    {
      step: "Step 1",
      title: "Send an email",
      description: "Send an email to dmflowautomation@gmail.com",
      icon: <Mail className="w-6 h-6 text-brand-primary" />,
    },
    {
      step: "Step 2",
      title: "Identify Account",
      description: "Include your registered email or Instagram username",
      icon: <Zap className="w-6 h-6 text-brand-primary" />,
    },
    {
      step: "Step 3",
      title: "Subject Line",
      description: "Use subject line: \"Data Deletion Request\"",
      icon: <CheckCircle2 className="w-6 h-6 text-brand-primary" />,
    },
  ];

  const deletionItems = [
    "Account information",
    "Instagram account connection data",
    "Automation workflows and messages",
    "Stored analytics and usage data",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-6">
      <SEO 
        title="Data Deletion Request – DMflow"
        description="Learn how to request deletion of your DMflow account and associated data. We provide clear instructions for user data management."
        canonical="https://www.dmflow.site/delete-data"
      />
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-primary transition-colors mb-12 font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-[3rem] shadow-2xl shadow-slate-200/50 p-8 md:p-16 text-center"
        >
          {/* Hero Section */}
          <div className="mb-16">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/10">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 font-display tracking-tight">
              Request Data Deletion
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              We respect your privacy and give you full control over your data.
            </p>
            <a 
              href="mailto:dmflowautomation@gmail.com"
              className="inline-flex items-center gap-3 px-10 py-5 brand-gradient text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform active:scale-95"
            >
              <Mail className="w-5 h-5" />
              Email Support
            </a>
          </div>

          {/* How it Works */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-10">How it Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 rounded-3xl bg-slate-50/50 border border-slate-100 text-left"
                >
                  <div className="mb-4">{s.icon}</div>
                  <div className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">{s.step}</div>
                  <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* What will be deleted */}
          <div className="mb-20 text-left bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 blur-[100px] -z-0" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8">What will be deleted</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {deletionItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-slate-300 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Processing Time & Note */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-3xl bg-blue-50/50 border border-blue-100 text-left">
              <h4 className="font-bold text-slate-900 mb-2">Processing Time</h4>
              <p className="text-slate-600">We process all deletion requests within 24–48 hours.</p>
            </div>
            <div className="p-8 rounded-3xl bg-red-50/50 border border-red-100 text-left">
              <h4 className="font-bold text-red-900 mb-2">Important Note</h4>
              <p className="text-red-700">Once deleted, your data cannot be recovered.</p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mb-12">
            <a 
              href="mailto:dmflowautomation@gmail.com"
              className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-colors shadow-xl"
            >
              Request via Email
            </a>
          </div>

          <p className="text-slate-400 text-sm font-medium">
            For any questions, contact <span className="text-slate-600">dmflowautomation@gmail.com</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
