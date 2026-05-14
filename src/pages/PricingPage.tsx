import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pricing from "../components/Pricing";
import SEO from "../components/SEO";
import React, { useEffect } from "react";

interface PricingPageProps {
  onStart: () => void;
  onAffiliate: () => void;
  onHelp: () => void;
  onHome: () => void;
  onPricing: () => void;
  onFeatures: () => void;
  onPrivacy: () => void;
  onTerms: () => void;
  onDataDeletion: () => void;
  onNavigate: (path: string) => void;
}

export default function PricingPage({
  onStart,
  onAffiliate,
  onHelp,
  onHome,
  onPricing,
  onFeatures,
  onPrivacy,
  onTerms,
  onDataDeletion,
  onNavigate
}: PricingPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <SEO 
        title="DMflow Pricing – Simple Plans for Creators"
        description="Choose the right DMflow plan. Free, Creator ₹399/month, Pro ₹799/month. Start automating your Instagram growth."
        canonical="https://dmflow.site/pricing"
      />
      <Navbar 
        onStart={onStart}
        onAffiliate={onAffiliate}
        onHelp={onHelp}
        onHome={onHome}
        onPricing={onPricing}
        onFeatures={onFeatures}
      />
      <main>
        <Pricing isPage={true} />
      </main>
      <Footer 
        onPrivacy={onPrivacy}
        onTerms={onTerms}
        onAffiliate={onAffiliate}
        onHelp={onHelp}
        onDataDeletion={onDataDeletion}
      />
    </div>
  );
}
