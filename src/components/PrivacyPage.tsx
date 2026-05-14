import Navbar from "./Navbar";
import Footer from "./Footer";
import SEO from "./SEO";
import { motion } from "motion/react";

interface PrivacyPageProps {
  onBack: () => void;
  onAuth: () => void;
  onAffiliate: () => void;
  onHelp: () => void;
  onTerms: () => void;
}

export default function PrivacyPage({ onBack, onAuth, onAffiliate, onHelp, onTerms }: PrivacyPageProps) {
  return (
    <div className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <SEO 
        title="Privacy Policy – DMflow"
        description="Learn how DMflow collects, uses, and protects your data. We are committed to your privacy and account security."
        canonical="https://dmflow.site/privacy"
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
          <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-8 text-slate-900">Privacy Policy</h1>
          <p className="text-slate-500 mb-8">Last updated: March 11, 2026</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p>
                Welcome to DMflow ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Instagram automation platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
              <p>
                We collect information that you provide directly to us, such as when you create an account, connect your Instagram business account, or contact our support team. This may include:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Contact information (e.g., name, email address)</li>
                <li>Instagram account data (via Meta OAuth)</li>
                <li>Usage data and analytics</li>
                <li>Payment information (processed securely via third-party providers)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Automate your Instagram interactions as requested</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
              <p>
                We implement a variety of security measures to maintain the safety of your personal information. Your Instagram access tokens are stored securely and are only used for the purposes of providing the automation services you have enabled.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Third-Party Services</h2>
              <p>
                Our service integrates with Meta (Instagram/Facebook). Your use of our service is also subject to Meta's Privacy Policy and Terms of Service. We are not responsible for the practices of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at support@dmflow.site.
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
              onClick={onTerms}
              className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-brand-primary/20"
            >
              Read Terms of Service
            </button>
          </div>
        </motion.div>
      </main>

      <Footer 
        onPrivacy={() => {}} 
        onTerms={onTerms} 
        onAffiliate={onAffiliate}
        onHelp={onHelp}
      />
    </div>
  );
}
