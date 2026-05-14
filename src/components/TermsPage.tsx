import Navbar from "./Navbar";
import Footer from "./Footer";
import SEO from "./SEO";
import { motion } from "motion/react";

interface TermsPageProps {
  onBack: () => void;
  onAuth: () => void;
  onAffiliate: () => void;
  onHelp: () => void;
  onPrivacy: () => void;
}

export default function TermsPage({ onBack, onAuth, onAffiliate, onHelp, onPrivacy }: TermsPageProps) {
  return (
    <div className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <SEO 
        title="Terms of Service – DMflow"
        description="Read the terms and conditions for using DMflow. Understand your rights and responsibilities when using our Instagram automation tools."
        canonical="https://dmflow.site/terms"
      />
      <Navbar 
        onStart={onAuth} 
        onAffiliate={onAffiliate} 
        onHelp={onHelp}
        onHome={onBack}
      />
      
      <main className="pt-32 pb-24 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-slate-100"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-8 text-slate-900">Terms of Service</h1>
          <p className="text-slate-500 mb-8">Last updated: March 11, 2026</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using DMflow, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Use License</h2>
              <p>
                Permission is granted to temporarily use DMflow for personal or commercial Instagram automation purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Attempt to decompile or reverse engineer any software contained on DMflow</li>
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate Instagram's Platform Policy or Community Guidelines</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Instagram Compliance</h2>
              <p>
                DMflow provides automation tools for Instagram. You are solely responsible for ensuring that your use of these tools complies with Instagram's policies. We are not responsible for any actions taken by Instagram against your account, including but not limited to shadowbans, temporary blocks, or permanent suspension.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Disclaimer</h2>
              <p>
                The materials on DMflow are provided on an 'as is' basis. DMflow makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Limitations</h2>
              <p>
                In no event shall DMflow or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use DMflow, even if DMflow or a DMflow authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-12 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onBack}
              className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
            >
              Back to Home
            </button>
            <button 
              onClick={onPrivacy}
              className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-brand-primary/20"
            >
              Read Privacy Policy
            </button>
          </div>
        </motion.div>
      </main>

      <Footer 
        onPrivacy={onPrivacy} 
        onTerms={() => {}} 
        onAffiliate={onAffiliate}
        onHelp={onHelp}
      />
    </div>
  );
}
