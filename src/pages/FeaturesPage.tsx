import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Features from "../components/Features";
import SEO from "../components/SEO";
import React, { useEffect } from "react";

interface FeaturesPageProps {
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

export default function FeaturesPage({
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
}: FeaturesPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEO 
        title="DMflow Features – Instagram Automation Tools"
        description="Explore DMflow features including DM automation, follow-lock, lead capture, and growth tools."
        canonical="https://dmflow.site/features"
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
        <Features onStart={onStart} isPage={true} />
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
