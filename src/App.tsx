import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SocialProof from "./components/SocialProof";
import Features from "./components/Features";
import GrowthLock from "./components/GrowthLock";
import ChatDemo from "./components/ChatDemo";
import Pricing from "./components/Pricing";
import TestimonialsSlider from "./components/TestimonialsSlider";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import { ArrowRight } from "lucide-react";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import AffiliatePage from "./components/AffiliatePage";
import HelpCenter from "./components/HelpCenter";
import PrivacyPage from "./components/PrivacyPage";
import TermsPage from "./components/TermsPage";
import DataDeletionPage from "./components/DataDeletionPage";
import PaymentSuccess from "./components/PaymentSuccess";
import CheckoutSuccess from "./components/CheckoutSuccess";
import PricingPage from "./pages/PricingPage";
import FeaturesPage from "./pages/FeaturesPage";
import BlogList from "./pages/blog/BlogList";
import BlogPost from "./pages/blog/BlogPost";
import SEO from "./components/SEO";
import Onboarding from "./components/Onboarding";
import InstagramQuickConnect from "./components/InstagramQuickConnect";
import AccountTypeDialog from "./components/AccountTypeDialog";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

import InstagramCallback from "./pages/auth/instagram/callback";

export default function App() {
  const [showAffiliate, setShowAffiliate] = useState(window.location.pathname === "/affiliate");
  const [showHelpCenter, setShowHelpCenter] = useState(window.location.pathname === "/help");
  const [showPrivacy, setShowPrivacy] = useState(window.location.pathname === "/privacy");
  const [showTerms, setShowTerms] = useState(window.location.pathname === "/terms");
  const [showAuth, setShowAuth] = useState(window.location.pathname === "/login" || window.location.pathname === "/signup");
  const [showDataDeletion, setShowDataDeletion] = useState(window.location.pathname === "/delete-data");
  const [showInstagramCallback, setShowInstagramCallback] = useState(window.location.pathname === "/auth/instagram/callback");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(window.location.pathname === "/checkout/success");
  const [showPricingPage, setShowPricingPage] = useState(window.location.pathname === "/pricing");
  const [showFeaturesPage, setShowFeaturesPage] = useState(window.location.pathname === "/features");
  const [showBlogList, setShowBlogList] = useState(window.location.pathname === "/blog");
  const [blogPostSlug, setBlogPostSlug] = useState<string | null>(
    window.location.pathname.startsWith("/blog/") ? window.location.pathname.split("/")[2] : null
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingSkipped, setOnboardingSkipped] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [showAccountTypeDialog, setShowAccountTypeDialog] = useState(false);
  /** Drives the "after-login" connect flow:
   *  - 'choose'   → ConnectAccount choice screen (FB / IG)
   *  - 'ig-quick' → 3-step Instagram-direct flow (search → confirm → authorize)
   *  - null       → no override; falls through to Dashboard if connected,
   *                  or to choose screen if not.
   */
  const [connectFlow, setConnectFlow] = useState<null | 'choose' | 'ig-quick'>(null);

  useEffect(() => {
    // 1. URL Parameter Processing (one-time on mount)
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      setIsInstagramConnected(true);
      // If they have a Supabase session OR a cookie session, the auth init
      // logic below will lift them into the Dashboard. We just need to make
      // sure that if they happen to NOT be logged in, they end up on the
      // login page rather than the marketing page.
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (params.get('error')) {
      const errorMsg = params.get('error') || "";
      if (errorMsg.includes('BUSINESS_ACCOUNT_REQUIRED')) {
        setShowAccountTypeDialog(true);
      } else {
        console.error("Connection error:", errorMsg);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (params.get('payment') === 'success') {
      setShowSuccess(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Global Event Listeners
    const handlePopState = () => {
      const path = window.location.pathname;
      setShowCheckoutSuccess(path === "/checkout/success");
      setShowPricingPage(path === "/pricing");
      setShowFeaturesPage(path === "/features");
      setShowBlogList(path === "/blog");
      setShowAuth(path === "/login" || path === "/signup");
      setBlogPostSlug(path.startsWith("/blog/") ? path.split("/")[2] : null);
      setShowDataDeletion(path === "/delete-data");
      setShowInstagramCallback(path === "/auth/instagram/callback");
      setShowAffiliate(path === "/affiliate");
      setShowHelpCenter(path === "/help");
      setShowPrivacy(path === "/privacy");
      setShowTerms(path === "/terms");
    };

    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        "https://dmflow.site",
        "https://www.dmflow.site",
        "http://localhost:3000"
      ];
      if (allowedOrigins.includes(event.origin) || event.origin.endsWith('.run.app')) {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
          setIsInstagramConnected(true);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('message', handleMessage);

    // 3. Auth Initialization Logic
    const initAuth = async () => {
      console.log("App: Initializing Auth...");
      // Safety timeout: Never stay on loading more than 5 seconds
      const timeout = setTimeout(() => {
        console.warn("App: Auth initialization timed out, forcing loading screen off.");
        setIsCheckingAuth(false);
      }, 5000);

      try {
        let currentSession = null;
        
        // Safety check for supabase configuration
        if (isSupabaseConfigured && supabase?.auth) {
          try {
            const { data } = await supabase.auth.getSession();
            currentSession = data.session;
          } catch (sessionErr) {
            console.error("App: Supabase getSession failed:", sessionErr);
          }
        }

        if (currentSession?.user?.email_confirmed_at) {
          console.log("App: Logged in via Supabase");
          setIsLoggedIn(true);
          try {
            const { data: user } = await supabase.from('users').select('instagram_connected').eq('id', currentSession.user.id).maybeSingle();
            setIsInstagramConnected(!!user?.instagram_connected);
          } catch (dbErr) {
            console.error("App: Error fetching user data:", dbErr);
          }
        } else {
          // Check server-side session (cookie-based fallback)
          console.log("App: Checking server-side auth status...");
          try {
            const response = await fetch('/api/auth/status');
            if (response.ok) {
              const data = await response.json();
              if (data.loggedIn) {
                console.log("App: Logged in via Server Session");
                setIsLoggedIn(true);
                const igResponse = await fetch('/api/auth/instagram/profile');
                if (igResponse.ok) {
                  const igData = await igResponse.json();
                  setIsInstagramConnected(!!igData.username);
                }
              }
            }
          } catch (serverErr) {
            console.error("App: Server auth check failed:", serverErr);
          }
        }
      } catch (err) {
        console.error("App: Global auth check failed:", err);
      } finally {
        clearTimeout(timeout);
        setIsCheckingAuth(false);
        console.log("App: Auth initialization complete");
      }
    };

    initAuth();

    // 4. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`App: Auth state change event: ${event}`, { hasSession: !!session });
      if (session && !session.user.email_confirmed_at) {
        setIsLoggedIn(false);
      } else if (session) {
        setIsLoggedIn(true);
        try {
          const { data: user } = await supabase.from('users').select('instagram_connected').eq('id', session.user.id).maybeSingle();
          setIsInstagramConnected(!!user?.instagram_connected);
        } catch (dbErr) {
          console.error("App: Auth change data fetch failed:", dbErr);
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('message', handleMessage);
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setIsLoggedIn(true);
    setShowAuth(false);
    setShowAffiliate(false);
    setShowHelpCenter(false);
    setShowPrivacy(false);
    setShowTerms(false);
    setShowDataDeletion(false);

    // After login, fetch the latest connection status
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: user } = await supabase.from('users').select('instagram_connected').eq('id', session.user.id).single();
        setIsInstagramConnected(!!user?.instagram_connected);
      }
    }
  };

  const handleInstagramConnect = async (type: 'facebook' | 'instagram' = 'facebook') => {
    try {
      setOnboardingLoading(true);
      const apiPath = type === 'instagram' ? '/api/auth/instagram-direct/url' : '/api/auth/instagram/url';
      
      let userId = "";
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id || "";
      }
      
      const response = await fetch(`${apiPath}?userId=${userId}`);
      if (response.ok) {
        const { url } = await response.json();
        // Use a popup for better SaaS feel, or direct redirect
        // User requested redirect correctly to Meta OAuth
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to connect Instagram:", error);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggedIn(false);
    }
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    const p = path.split("?")[0]; // ignore query params for matching
    setShowCheckoutSuccess(p === "/checkout/success");
    setShowPricingPage(p === "/pricing");
    setShowFeaturesPage(p === "/features");
    setShowDataDeletion(p === "/delete-data");
    setShowBlogList(p === "/blog");
    setBlogPostSlug(p.startsWith("/blog/") ? p.split("/")[2] : null);
    setShowAuth(p === "/login" || p === "/signup" || p === "/auth");
    setShowAffiliate(p === "/affiliate");
    setShowHelpCenter(p === "/help");
    setShowPrivacy(p === "/privacy");
    setShowTerms(p === "/terms");
    
    // Reset other views
    if (path === "/") {
      setShowAuth(false);
      setShowAffiliate(false);
      setShowHelpCenter(false);
      setShowPrivacy(false);
      setShowTerms(false);
      setShowPricingPage(false);
      setShowFeaturesPage(false);
      setShowBlogList(false);
      setBlogPostSlug(null);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F7F7FB] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showCheckoutSuccess) {
    return <CheckoutSuccess />;
  }

  if (showPricingPage) {
    return (
      <PricingPage 
        onStart={() => setShowAuth(true)}
        onAffiliate={() => setShowAffiliate(true)}
        onHelp={() => setShowHelpCenter(true)}
        onHome={() => navigateTo("/")}
        onPricing={() => navigateTo("/pricing")}
        onFeatures={() => navigateTo("/features")}
        onPrivacy={() => setShowPrivacy(true)}
        onTerms={() => setShowTerms(true)}
        onDataDeletion={() => navigateTo("/delete-data")}
        onNavigate={navigateTo}
      />
    );
  }

  if (showFeaturesPage) {
    return (
      <FeaturesPage 
        onStart={() => setShowAuth(true)}
        onAffiliate={() => setShowAffiliate(true)}
        onHelp={() => setShowHelpCenter(true)}
        onHome={() => navigateTo("/")}
        onPricing={() => navigateTo("/pricing")}
        onFeatures={() => navigateTo("/features")}
        onPrivacy={() => setShowPrivacy(true)}
        onTerms={() => setShowTerms(true)}
        onDataDeletion={() => navigateTo("/delete-data")}
        onNavigate={navigateTo}
      />
    );
  }

  if (showBlogList) {
    return (
      <BlogList 
        onStart={() => setShowAuth(true)}
        onAffiliate={() => setShowAffiliate(true)}
        onHelp={() => setShowHelpCenter(true)}
        onHome={() => navigateTo("/")}
        onPricing={() => navigateTo("/pricing")}
        onFeatures={() => navigateTo("/features")}
        onPrivacy={() => setShowPrivacy(true)}
        onTerms={() => setShowTerms(true)}
        onDataDeletion={() => navigateTo("/delete-data")}
        onNavigate={navigateTo}
      />
    );
  }

  if (blogPostSlug) {
    return (
      <BlogPost
        slug={blogPostSlug}
        onStart={() => setShowAuth(true)}
        onAffiliate={() => setShowAffiliate(true)}
        onHelp={() => setShowHelpCenter(true)}
        onHome={() => navigateTo("/")}
        onPricing={() => navigateTo("/pricing")}
        onFeatures={() => navigateTo("/features")}
        onPrivacy={() => setShowPrivacy(true)}
        onTerms={() => setShowTerms(true)}
        onDataDeletion={() => navigateTo("/delete-data")}
        onNavigate={navigateTo}
      />
    );
  }

  if (showDataDeletion) {
    return <DataDeletionPage onBack={() => navigateTo("/")} />;
  }

  if (showInstagramCallback) {
    return <InstagramCallback />;
  }

  if (showSuccess) {
    return <PaymentSuccess onDashboard={() => setShowSuccess(false)} />;
  }

  if (isLoggedIn) {
    // After login, if Instagram is not yet connected, walk the user through
    // the connect flow (choice screen → quick-connect → OAuth → dashboard).
    if (!isInstagramConnected && !onboardingSkipped) {
      if (connectFlow === 'ig-quick') {
        return (
          <InstagramQuickConnect
            onBack={() => setConnectFlow('choose')}
            onSwitchToFacebook={() => handleInstagramConnect('facebook')}
            onAuthorize={async () => {
              await handleInstagramConnect('instagram');
            }}
          />
        );
      }
      // Default: choice screen
      return (
        <Onboarding
          onConnect={(type) => {
            if (type === 'instagram') {
              setConnectFlow('ig-quick');
            } else {
              handleInstagramConnect('facebook');
            }
          }}
          onSkip={() => {
            setOnboardingSkipped(true);
            setConnectFlow(null);
          }}
          isLoading={onboardingLoading}
        />
      );
    }

    return <Dashboard onLogout={handleLogout} onInstagramConnect={handleInstagramConnect} />;
  }

  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} onLogin={handleLogin} onInstagramLogin={handleInstagramConnect} />;
  }

  if (showAffiliate) {
    return (
      <AffiliatePage 
        onBack={() => setShowAffiliate(false)} 
        onStart={() => {
          setShowAffiliate(false);
          setShowAuth(true);
        }} 
      />
    );
  }

  if (showHelpCenter) {
    return <HelpCenter onBack={() => setShowHelpCenter(false)} />;
  }

  if (showPrivacy) {
    return (
      <PrivacyPage 
        onBack={() => setShowPrivacy(false)}
        onAuth={() => { setShowPrivacy(false); setShowAuth(true); }}
        onAffiliate={() => { setShowPrivacy(false); setShowAffiliate(true); }}
        onHelp={() => { setShowPrivacy(false); setShowHelpCenter(true); }}
        onTerms={() => { setShowPrivacy(false); setShowTerms(true); }}
      />
    );
  }

  if (showTerms) {
    return (
      <TermsPage 
        onBack={() => setShowTerms(false)}
        onAuth={() => { setShowTerms(false); setShowAuth(true); }}
        onAffiliate={() => { setShowTerms(false); setShowAffiliate(true); }}
        onHelp={() => { setShowTerms(false); setShowHelpCenter(true); }}
        onPrivacy={() => { setShowTerms(false); setShowPrivacy(true); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FB] text-slate-900">
      <SEO 
        title="DMflow – Instagram DM Automation | Auto-Reply to Comments & DMs"
        description="DMflow automates your Instagram DMs. Auto-reply to every comment and DM instantly with Meta-approved technology. Free to start — no credit card needed."
        canonical="https://dmflow.site/"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "DMflow",
          "url": "https://dmflow.site/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://dmflow.site/blog?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <AccountTypeDialog isOpen={showAccountTypeDialog} onClose={() => setShowAccountTypeDialog(false)} />
      <Navbar 
        onStart={() => setShowAuth(true)} 
        onAffiliate={() => setShowAffiliate(true)} 
        onHelp={() => setShowHelpCenter(true)}
        onPricing={() => navigateTo("/pricing")}
        onFeatures={() => navigateTo("/features")}
        onHome={() => {
          setShowAuth(false);
          setShowAffiliate(false);
          setShowHelpCenter(false);
          setShowPrivacy(false);
          setShowTerms(false);
          setShowDataDeletion(false);
          setShowPricingPage(false);
          setShowFeaturesPage(false);
          window.history.pushState({}, "", "/");
        }}
      />
      <main>
        <Hero onStart={() => setShowAuth(true)} />
        <SocialProof />
        <div className="relative">
          <Features onStart={() => setShowAuth(true)} />
          <div className="max-w-7xl mx-auto px-6 pb-24 text-center">
            <button 
              onClick={() => navigateTo("/features")}
              className="px-8 py-3 bg-slate-100 text-slate-700 rounded-full font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 mx-auto"
            >
              Explore All Features <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <GrowthLock />
        <ChatDemo />
        <div className="relative">
          <Pricing />
          <div className="max-w-7xl mx-auto px-6 pb-24 text-center">
            <button 
              onClick={() => navigateTo("/pricing")}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 mx-auto shadow-sm"
            >
              View Full Pricing <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <TestimonialsSlider />
        <FAQ />
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="brand-gradient p-12 md:p-20 rounded-[3rem] text-center relative overflow-hidden shadow-2xl shadow-brand-primary/20">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm -z-10" />
            <h2 className="text-4xl md:text-6xl font-extrabold font-display mb-8 text-white">Ready to Automate Your Growth?</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
              Join 10,000+ creators who are already using DMflow to scale their Instagram presence automatically.
            </p>
            <button 
              onClick={() => setShowAuth(true)}
              className="px-12 py-5 bg-white text-brand-primary rounded-full text-xl font-bold hover:scale-105 transition-transform active:scale-95 shadow-xl"
            >
              Start For Free
            </button>
          </div>
        </section>
      </main>
      <Footer 
        onPrivacy={() => setShowPrivacy(true)}
        onTerms={() => setShowTerms(true)}
        onAffiliate={() => setShowAffiliate(true)}
        onHelp={() => setShowHelpCenter(true)}
        onDataDeletion={() => navigateTo("/delete-data")}
      />
    </div>
  );
}
