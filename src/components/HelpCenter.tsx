import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import SEO from "./SEO";
import { 
  Search, 
  BookOpen, 
  Zap, 
  CreditCard, 
  Users, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft, 
  ThumbsUp, 
  ThumbsDown, 
  Mail, 
  Clock,
  ExternalLink,
  CheckCircle2
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: string;
  content: React.ReactNode;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articleCount: number;
}

const CATEGORIES: Category[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics of DMflow and how to connect your account.",
    icon: <BookOpen className="w-6 h-6" />,
    articleCount: 3,
  },
  {
    id: "automation-setup",
    title: "Automation Setup",
    description: "Step-by-step guides on creating powerful Instagram automations.",
    icon: <Zap className="w-6 h-6" />,
    articleCount: 4,
  },
  {
    id: "billing-pricing",
    title: "Billing & Pricing",
    description: "Information about our plans, upgrades, and managing your subscription.",
    icon: <CreditCard className="w-6 h-6" />,
    articleCount: 3,
  },
  {
    id: "affiliate-referral",
    title: "Affiliate & Referral",
    description: "Learn how to earn 30% commission by referring other creators.",
    icon: <Users className="w-6 h-6" />,
    articleCount: 2,
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Common issues and how to fix them quickly.",
    icon: <AlertCircle className="w-6 h-6" />,
    articleCount: 3,
  },
];

const ARTICLES: Article[] = [
  // Getting Started
  {
    id: "connect-instagram",
    category: "getting-started",
    title: "How to connect your Instagram account",
    content: (
      <div className="space-y-6">
        <p>Connecting your Instagram account is the first step to automating your growth. Follow these simple steps:</p>
        <ol className="space-y-4 list-decimal list-inside">
          <li className="font-semibold text-slate-900">
            Login to DMflow
            <p className="font-normal text-slate-600 mt-1 ml-6">Use your email or social login to access your DMflow dashboard.</p>
          </li>
          <li className="font-semibold text-slate-900">
            Click "Connect Account"
            <p className="font-normal text-slate-600 mt-1 ml-6">You'll be redirected to the secure Instagram/Facebook login page.</p>
          </li>
          <li className="font-semibold text-slate-900">
            Allow Permissions
            <p className="font-normal text-slate-600 mt-1 ml-6">Ensure you grant all requested permissions (Manage Comments, Manage DMs) so DMflow can work on your behalf.</p>
          </li>
          <li className="font-semibold text-slate-900">
            Account Connected
            <p className="font-normal text-slate-600 mt-1 ml-6">Once authorized, you'll see your Instagram profile in the DMflow dashboard.</p>
          </li>
        </ol>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-800">Note: Your Instagram account must be a Professional (Creator or Business) account and connected to a Facebook Page.</p>
        </div>
      </div>
    ),
  },
  {
    id: "how-it-works",
    category: "getting-started",
    title: "How DMflow automation works",
    content: (
      <div className="space-y-6">
        <p>DMflow acts as a bridge between your Instagram comments and your direct messages. Here is the simple flow:</p>
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-brand-primary" />
              </div>
              <p className="font-bold text-sm">User Comments</p>
              <p className="text-xs text-slate-500">"LINK"</p>
            </div>
            <ChevronRight className="hidden md:block w-6 h-6 text-slate-300" />
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-brand-primary" />
              </div>
              <p className="font-bold text-sm">DMflow Trigger</p>
              <p className="text-xs text-slate-500">Keyword Match</p>
            </div>
            <ChevronRight className="hidden md:block w-6 h-6 text-slate-300" />
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-8 h-8 text-brand-primary" />
              </div>
              <p className="font-bold text-sm">Auto DM Sent</p>
              <p className="text-xs text-slate-500">Resource Link</p>
            </div>
          </div>
        </div>
        <p>This process happens in real-time, 24/7, ensuring you never miss a lead even while you sleep.</p>
      </div>
    ),
  },
  {
    id: "first-setup",
    category: "getting-started",
    title: "First automation setup (5-minute guide)",
    content: (
      <div className="space-y-6">
        <p>Ready to launch your first automation? Follow this quick guide:</p>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
            <div>
              <p className="font-bold text-slate-900">Set your Keyword</p>
              <p className="text-slate-600">Choose a word like "LINK", "GUIDE", or "INFO" that users will comment.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
            <div>
              <p className="font-bold text-slate-900">Write your DM Message</p>
              <p className="text-slate-600">Craft the message that will be sent. Include your link or call to action.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
            <div>
              <p className="font-bold text-slate-900">Activate Automation</p>
              <p className="text-slate-600">Toggle the "Active" switch. DMflow will now start monitoring your posts for that keyword.</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800">Pro Tip: Use a unique keyword for each post to track which content drives the most leads.</p>
        </div>
      </div>
    ),
  },
  // Automation Setup
  {
    id: "comment-dm-automation",
    category: "automation-setup",
    title: "How to create comment → DM automation",
    content: (
      <div className="space-y-6">
        <p>Comment automation is our most popular feature. It allows you to automatically reply to comments with a direct message.</p>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <p className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-4">Example Scenario</p>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0" />
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                <p className="text-sm font-medium">User: "Hey, can I get the LINK to this guide?"</p>
              </div>
            </div>
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-8 h-8 bg-brand-primary rounded-full shrink-0 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="bg-brand-primary p-3 rounded-2xl rounded-tr-none shadow-sm text-white">
                <p className="text-sm font-medium">DMflow: "Here is your link: dmflow.com/guide 🚀"</p>
              </div>
            </div>
          </div>
        </div>
        <p>To set this up, go to the "Automations" tab in your dashboard, click "New Automation", and select "Comment Trigger".</p>
      </div>
    ),
  },
  {
    id: "follow-lock",
    category: "automation-setup",
    title: "How Follow-Lock Growth feature works",
    content: (
      <div className="space-y-6">
        <p>Follow-Lock is a powerful growth hack that requires users to follow you before they can receive the automated link.</p>
        <div className="space-y-4">
          <p className="font-bold text-slate-900">How it works:</p>
          <ul className="space-y-3 list-disc list-inside text-slate-600">
            <li>User comments your keyword.</li>
            <li>DMflow checks if the user follows your account.</li>
            <li>If they follow: The link is sent immediately.</li>
            <li>If they don't follow: DMflow sends a message asking them to follow first to unlock the link.</li>
          </ul>
        </div>
        <div className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/10">
          <p className="text-brand-primary font-bold mb-2">Why use Follow-Lock?</p>
          <p className="text-sm text-slate-600">Creators using Follow-Lock see a 3x increase in follower growth compared to standard automation.</p>
        </div>
      </div>
    ),
  },
  {
    id: "story-replies",
    category: "automation-setup",
    title: "How to automate Instagram Story replies",
    content: (
      <div className="space-y-6">
        <p>Story automation allows you to send instant replies when someone interacts with your Instagram Stories.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
            <p className="font-bold text-slate-900 mb-2">Story Mentions</p>
            <p className="text-sm text-slate-600">Send a "Thank you" DM automatically whenever someone tags you in their story.</p>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
            <p className="font-bold text-slate-900 mb-2">Story Replies</p>
            <p className="text-sm text-slate-600">Trigger a specific DM when someone replies to your story with a keyword.</p>
          </div>
        </div>
        <p>This is perfect for "Reply with YES to get the details" style stories, increasing your story engagement significantly.</p>
      </div>
    ),
  },
  {
    id: "email-capture",
    category: "automation-setup",
    title: "How to collect emails from Instagram DMs",
    content: (
      <div className="space-y-6">
        <p>Turn your Instagram followers into an email list. DMflow can automatically ask for and save email addresses within the DM conversation.</p>
        <div className="bg-slate-900 text-white p-6 rounded-2xl font-mono text-sm">
          <p className="text-slate-400 mb-2">// Lead Capture Flow</p>
          <p>1. User triggers automation</p>
          <p>2. Bot: "What's your best email to send the guide?"</p>
          <p>3. User: "alex@example.com"</p>
          <p>4. Bot: "Got it! Sending the guide to alex@example.com now."</p>
          <p className="text-emerald-400 mt-2">// Email synced to your CRM</p>
        </div>
        <p>You can export these emails as a CSV or sync them directly with tools like Mailchimp or ConvertKit via our Pro plan.</p>
      </div>
    ),
  },
  // Billing & Pricing
  {
    id: "pricing-explained",
    category: "billing-pricing",
    title: "DMflow pricing plans explained",
    content: (
      <div className="space-y-6">
        <p>We offer three flexible plans designed for creators at every stage of their journey:</p>
        <div className="space-y-4">
          <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
            <p className="font-bold text-slate-900">Free Plan (₹0)</p>
            <p className="text-sm text-slate-600">Perfect for testing. Includes basic comment automation for up to 100 replies per month.</p>
          </div>
          <div className="p-4 border border-brand-primary/20 rounded-xl bg-brand-primary/5 shadow-sm">
            <p className="font-bold text-brand-primary">Creator Plan (₹399/mo)</p>
            <p className="text-sm text-slate-600">Our most popular plan. Includes Follow-Lock, Story Automation, and unlimited replies.</p>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
            <p className="font-bold text-slate-900">Pro Plan (₹799/mo)</p>
            <p className="text-sm text-slate-600">For serious businesses. Includes Email Capture, CRM integrations, and Advanced Analytics.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "upgrade-downgrade",
    category: "billing-pricing",
    title: "How to upgrade or downgrade your plan",
    content: (
      <div className="space-y-6">
        <p>You can change your plan at any time. The changes will be applied immediately.</p>
        <ol className="space-y-4 list-decimal list-inside">
          <li className="font-semibold text-slate-900">
            Go to Dashboard
            <p className="font-normal text-slate-600 mt-1 ml-6">Log in and navigate to your main dashboard.</p>
          </li>
          <li className="font-semibold text-slate-900">
            Open Billing Settings
            <p className="font-normal text-slate-600 mt-1 ml-6">Click on the "Billing" or "Settings" tab in the sidebar.</p>
          </li>
          <li className="font-semibold text-slate-900">
            Change Plan
            <p className="font-normal text-slate-600 mt-1 ml-6">Select your new plan and confirm the payment via Razorpay.</p>
          </li>
        </ol>
        <p>If you downgrade, your current features will remain active until the end of your current billing cycle.</p>
      </div>
    ),
  },
  {
    id: "cancel-subscription",
    category: "billing-pricing",
    title: "How to cancel subscription",
    content: (
      <div className="space-y-6">
        <p>We believe in total freedom. You can cancel your DMflow subscription at any time with just two clicks.</p>
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <p className="font-bold text-red-900 mb-2">Cancellation Policy</p>
          <ul className="space-y-2 text-sm text-red-800 list-disc list-inside">
            <li>No hidden fees or cancellation charges.</li>
            <li>Access remains active until the end of the paid period.</li>
            <li>No refunds for partial months already used.</li>
          </ul>
        </div>
        <p>To cancel, go to <strong>Settings → Billing → Cancel Subscription</strong>. We'll send you a confirmation email immediately.</p>
      </div>
    ),
  },
  // Affiliate
  {
    id: "referral-program",
    category: "affiliate-referral",
    title: "How the referral program works",
    content: (
      <div className="space-y-6">
        <p>Earn passive income by sharing DMflow with your creator friends. Our affiliate program is one of the most rewarding in the industry.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
            <p className="text-2xl font-bold text-brand-primary mb-1">30%</p>
            <p className="text-xs text-slate-500 uppercase font-bold">Commission</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
            <p className="text-2xl font-bold text-brand-primary mb-1">90 Days</p>
            <p className="text-xs text-slate-500 uppercase font-bold">Cookie Life</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
            <p className="text-2xl font-bold text-brand-primary mb-1">Lifetime</p>
            <p className="text-xs text-slate-500 uppercase font-bold">Recurring</p>
          </div>
        </div>
        <p>Simply share your unique referral link. When someone signs up and pays for a plan, you get 30% of their payment every single month they stay subscribed.</p>
      </div>
    ),
  },
  {
    id: "affiliate-payouts",
    category: "affiliate-referral",
    title: "When will I receive affiliate payouts",
    content: (
      <div className="space-y-6">
        <p>We process affiliate payouts regularly to ensure you get your earnings on time.</p>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Minimum Payout</p>
              <p className="text-slate-600">You can request a payout once your balance reaches ₹1000.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Payout Date</p>
              <p className="text-slate-600">Payouts are processed on the 25th of every month.</p>
            </div>
          </div>
        </div>
        <p>Payouts are sent directly to your bank account or UPI ID as specified in your Affiliate Dashboard.</p>
      </div>
    ),
  },
  // Troubleshooting
  {
    id: "instagram-not-connecting",
    category: "troubleshooting",
    title: "Instagram not connecting – how to fix",
    content: (
      <div className="space-y-6">
        <p>If you're having trouble connecting your Instagram account, check these common reasons:</p>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="font-bold text-red-900">1. Permissions not granted</p>
            <p className="text-sm text-red-800">When logging in via Facebook, you must click "Allow All" permissions. If you skip any, DMflow won't be able to access your messages.</p>
          </div>
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="font-bold text-red-900">2. Wrong Account Type</p>
            <p className="text-sm text-red-800">DMflow only works with Instagram Professional (Creator or Business) accounts. Personal accounts do not support automation.</p>
          </div>
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="font-bold text-red-900">3. Session Expired</p>
            <p className="text-sm text-red-800">Sometimes the connection between Facebook and Instagram breaks. Try disconnecting and reconnecting your account in the DMflow dashboard.</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "automation-not-sending",
    category: "troubleshooting",
    title: "Automation not sending DMs",
    content: (
      <div className="space-y-6">
        <p>Is your automation active but not sending messages? Here is a checklist to fix it:</p>
        <ul className="space-y-4">
          <li className="flex gap-3">
            <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center shrink-0 font-bold text-xs">A</div>
            <p className="text-slate-700"><strong>Keyword Mismatch:</strong> Ensure the user is commenting the exact keyword you set (it is case-insensitive, but spelling matters).</p>
          </li>
          <li className="flex gap-3">
            <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center shrink-0 font-bold text-xs">B</div>
            <p className="text-slate-700"><strong>Automation Disabled:</strong> Check if the specific automation toggle is turned ON in your dashboard.</p>
          </li>
          <li className="flex gap-3">
            <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center shrink-0 font-bold text-xs">C</div>
            <p className="text-slate-700"><strong>Permissions Missing:</strong> Go to Instagram Settings → Messages and Story Replies → Message Controls and ensure "Allow Access to Messages" is enabled.</p>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "contact-support",
    category: "troubleshooting",
    title: "Contact DMflow support",
    content: (
      <div className="space-y-6">
        <p>Can't find what you're looking for? Our dedicated support team is here to help you scale.</p>
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm text-center">
          <Mail className="w-12 h-12 text-brand-primary mx-auto mb-4" />
          <p className="text-xl font-bold text-slate-900 mb-2">Email Support</p>
          <p className="text-brand-primary font-bold text-lg mb-4">dmflowautomation@gmail.com</p>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Clock className="w-4 h-4" />
            Typical response time: Under 12 hours
          </div>
        </div>
        <p>When contacting support, please include your registered email address and a screenshot of the issue for faster resolution.</p>
      </div>
    ),
  },
];

export default function HelpCenter({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return ARTICLES.filter(
      (article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const categoryArticles = useMemo(() => {
    if (!selectedCategory) return [];
    return ARTICLES.filter((article) => article.category === selectedCategory);
  }, [selectedCategory]);

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetView = () => {
    setSelectedArticle(null);
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const seoData = useMemo(() => {
    if (selectedArticle) {
      return {
        title: `${selectedArticle.title} – DMflow Help Center`,
        description: `Learn how to ${selectedArticle.title.toLowerCase()} with DMflow. Detailed step-by-step guide for Instagram automation.`,
        canonical: `https://www.dmflow.site/help/${selectedArticle.id}`
      };
    }
    if (selectedCategory) {
      const cat = CATEGORIES.find(c => c.id === selectedCategory);
      return {
        title: `${cat?.title} – DMflow Help Center`,
        description: cat?.description || "Find helpful guides for your Instagram automation needs.",
        canonical: `https://www.dmflow.site/help/${selectedCategory}`
      };
    }
    return {
      title: "Help Center – DMflow Support & Documentation",
      description: "Find the answers you need to manage your DMflow account and set up Instagram automations.",
      canonical: "https://www.dmflow.site/help"
    };
  }, [selectedArticle, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <SEO {...seoData} />
      {/* Help Center Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-brand-primary transition-colors font-bold text-sm uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight font-display text-slate-900">DMflow Help</span>
          </div>
          <div className="hidden md:block">
            <button 
              onClick={() => window.location.href = "mailto:dmflowautomation@gmail.com"}
              className="px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </header>

      <main className="pb-24">
        <AnimatePresence mode="wait">
          {!selectedArticle && !selectedCategory ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Hero Section */}
              <section className="brand-gradient py-20 px-6 text-center text-white">
                <div className="max-w-3xl mx-auto">
                  <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">DMflow Help Center</h1>
                  <p className="text-white/80 text-lg mb-10">Everything you need to know about using DMflow.</p>
                  
                  <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="text"
                      placeholder="Search help articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-5 pl-14 pr-6 bg-white rounded-2xl text-slate-900 shadow-2xl shadow-brand-primary/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-lg"
                    />
                    
                    {/* Search Results Dropdown */}
                    {searchQuery.trim() !== "" && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-left">
                        {filteredArticles.length > 0 ? (
                          <div className="max-h-[400px] overflow-y-auto">
                            {filteredArticles.map((article) => (
                              <button
                                key={article.id}
                                onClick={() => handleArticleClick(article)}
                                className="w-full p-4 hover:bg-slate-50 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
                              >
                                <div>
                                  <p className="font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{article.title}</p>
                                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">
                                    {article.category.replace("-", " ")}
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-primary transition-colors" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center text-slate-500">
                            <p>No articles found for "{searchQuery}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-white/60">
                    <span>Popular:</span>
                    {["connect instagram", "automation", "refund", "billing", "email capture"].map((keyword) => (
                      <button 
                        key={keyword}
                        onClick={() => setSearchQuery(keyword)}
                        className="hover:text-white transition-colors underline underline-offset-4"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Categories Grid */}
              <section className="max-w-7xl mx-auto px-6 -mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6 group-hover:bg-brand-primary group-hover:text-white transition-all">
                        {category.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{category.title}</h3>
                      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{category.description}</p>
                      <div className="flex items-center justify-between text-brand-primary font-bold text-sm uppercase tracking-wider">
                        <span>{category.articleCount} Articles</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : selectedCategory && !selectedArticle ? (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto px-6 mt-12"
            >
              <button 
                onClick={resetView}
                className="flex items-center gap-2 text-slate-500 hover:text-brand-primary transition-colors font-bold text-sm uppercase tracking-wider mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                All Categories
              </button>
              
              <div className="flex items-center gap-4 mb-12">
                <div className="w-16 h-16 bg-brand-primary rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-primary/20">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {CATEGORIES.find(c => c.id === selectedCategory)?.title}
                  </h1>
                  <p className="text-slate-500">
                    {CATEGORIES.find(c => c.id === selectedCategory)?.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {categoryArticles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    className="w-full bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-primary/20 transition-all text-left flex items-center justify-between group"
                  >
                    <span className="font-bold text-slate-700 group-hover:text-brand-primary transition-colors">{article.title}</span>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-primary transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="article"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto px-6 mt-12"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2 text-slate-500 hover:text-brand-primary transition-colors font-bold text-sm uppercase tracking-wider mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {CATEGORIES.find(c => c.id === selectedArticle?.category)?.title}
              </button>

              <article className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 md:p-12">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 leading-tight">
                    {selectedArticle?.title}
                  </h1>
                  
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                    {selectedArticle?.content}
                  </div>

                  <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="font-bold text-slate-900">Was this article helpful?</p>
                    <div className="flex gap-4">
                      <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl font-bold text-sm transition-all border border-transparent hover:border-emerald-100">
                        <ThumbsUp className="w-4 h-4" />
                        Yes
                      </button>
                      <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold text-sm transition-all border border-transparent hover:border-red-100">
                        <ThumbsDown className="w-4 h-4" />
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Support Contact Section */}
        {!selectedArticle && (
          <section className="max-w-4xl mx-auto px-6 mt-32">
            <div className="bg-slate-900 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-slate-900/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
              
              <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
              <p className="text-slate-400 mb-10 max-w-md mx-auto">Our support team is ready to assist you. We typically respond within 12 hours.</p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
                <div className="flex items-center gap-3 text-white font-bold">
                  <Mail className="w-6 h-6 text-brand-primary" />
                  dmflowautomation@gmail.com
                </div>
                <div className="flex items-center gap-3 text-white font-bold">
                  <Clock className="w-6 h-6 text-brand-primary" />
                  Response time: 12h
                </div>
              </div>

              <button 
                onClick={() => window.location.href = "mailto:dmflowautomation@gmail.com"}
                className="px-10 py-4 bg-brand-primary text-white rounded-full font-bold hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-brand-primary/20 flex items-center gap-2 mx-auto"
              >
                Contact Support
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
