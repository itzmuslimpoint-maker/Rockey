import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Eye, EyeOff, Globe,
  Home, MessageSquare, Zap, Brain, TrendingUp, Users, 
  BarChart3, LayoutTemplate, Settings, CreditCard, 
  LogOut, Bell, Search, Plus, Instagram, CheckCircle2,
  ChevronRight, ArrowRight, Lock, Mail, Play, Radio, MoreHorizontal,
  Filter, Download, MoreVertical, Send, User as UserIcon, X, Bookmark,
  Clock, Tag, Trash2, Copy, PlayCircle, MousePointer2, DollarSign,
  Loader2, Heart, Camera, Mic, Image as ImageIcon, PlusCircle, Link, Phone, Video,
  Menu, PanelLeftClose, PanelLeftOpen, ChevronDown, HelpCircle, AlertCircle,
  LayoutDashboard, Layout, Rocket, Activity, Monitor, Upload
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import Cropper from 'react-easy-crop';
import { supabase, isSupabaseConfigured } from "../supabaseClient";
import AIAssistant from "./AIAssistant";

// --- Types ---
type Page = 'home' | 'inbox' | 'automations' | 'ai' | 'growth-lock' | 'contacts' | 'analytics' | 'templates' | 'settings' | 'billing' | 'refer-earn' | 'posts' | 'stories' | 'account-settings';

const PLAN_LIMITS: Record<string, { dms: number; accounts: number }> = {
  'Free': { dms: 500, accounts: 1 },
  'Pro': { dms: 5000, accounts: 2 },
  'Growth': { dms: 10000, accounts: 5 },
};

interface UserProfile {
  id: string;
  email: string;
  name: string;
  instagram_connected: boolean;
  plan: string;
  avatar_url?: string;
}

interface IGProfile {
  id?: string;
  username: string;
  profile_picture_url?: string;
  account_type?: string;
  followers?: number;
  following?: number;
}

interface IGStats {
  posts: number;
  reels: number;
  messages: number;
  followers: number;
}

// --- Mock Data ---
const stats = [
  { label: "Connected Accounts", value: "1", icon: <Instagram className="w-5 h-5" />, color: "text-blue-600" },
  { label: "Followers Gained", value: "1,284", icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-600" },
  { label: "Automations Active", value: "12", icon: <Zap className="w-5 h-5" />, color: "text-amber-600" },
  { label: "Messages Sent", value: "8,432", icon: <MessageSquare className="w-5 h-5" />, color: "text-indigo-600" },
  { label: "Links Unlocked", value: "432", icon: <Lock className="w-5 h-5" />, color: "text-rose-600" },
];

const chartData = [
  { name: 'Mon', followers: 40, leads: 24 },
  { name: 'Tue', followers: 30, leads: 13 },
  { name: 'Wed', followers: 20, leads: 98 },
  { name: 'Thu', followers: 27, leads: 39 },
  { name: 'Fri', followers: 18, leads: 48 },
  { name: 'Sat', followers: 23, leads: 38 },
  { name: 'Sun', followers: 34, leads: 43 },
];

// --- Sub-components ---

const SidebarItem = ({ icon, label, active, onClick, badge, collapsed, isSubItem = false }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-colors duration-150 group relative ${
      active 
        ? "bg-blue-50 text-blue-600" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    } ${collapsed ? "justify-center px-0 mx-auto w-10" : "gap-3"} ${isSubItem && !collapsed ? "pl-10" : ""}`}
  >
    <div className={`shrink-0 flex items-center justify-center w-5 h-5 ${active ? "text-blue-600" : "group-hover:text-blue-600"} transition-colors`}>
      {icon}
    </div>
    <AnimatePresence mode="wait">
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          className="flex-1 flex items-center justify-between min-w-0"
        >
          <span className={`text-[13px] font-bold tracking-tight truncate ${active ? "text-blue-600" : "text-slate-600 font-semibold"}`}>{label}</span>
          {badge && (
            <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-black ${active ? "bg-blue-200 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
              {badge}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
    {collapsed && active && (
      <div className="absolute right-0 w-1 h-5 bg-blue-600 rounded-l-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
    )}
  </button>
);

const SidebarGroup = ({ title, children, collapsed, expanded, onToggle }: any) => {
  return (
    <div className="space-y-0.5">
      <div className={`overflow-hidden transition-all duration-200 ${collapsed ? 'h-0 opacity-0 mb-0' : 'h-6 opacity-100 mb-1'}`}>
        {!collapsed && (
          <button 
            onClick={onToggle}
            className="w-full flex items-center justify-between px-4 py-1 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.1em] transition-colors group"
          >
            <span>{title}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${expanded ? '' : '-rotate-90'}`} />
          </button>
        )}
      </div>
      <div className={`space-y-0.5 flex flex-col ${collapsed ? 'items-center' : ''}`}>
        <AnimatePresence initial={false}>
          {(expanded || collapsed) && (
            <motion.div 
              initial={collapsed ? false : { height: 0, opacity: 0 }}
              animate={collapsed ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="overflow-hidden space-y-0.5 w-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
    {children}
  </div>
);

const PricingModal = ({ isOpen, onClose, currentPlan, onUpgrade }: any) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for starters',
      features: ['1 Instagram account', '500 DMs/month', 'Comment-to-DM', 'Story reply automation', 'Templates'],
      cta: 'Current Plan',
      isCurrent: currentPlan === 'Free',
    },
    {
      name: 'Pro',
      price: '$15',
      description: 'Most popular for creators',
      features: ['2 Instagram accounts', '5,000 DMs/month', 'Email capture', 'Follow unlock', 'Link tracking', 'CSV export'],
      cta: 'Upgrade to Pro',
      isCurrent: currentPlan === 'Pro',
      popular: true,
    },
    {
      name: 'Growth',
      price: '$30',
      description: 'Scale your business',
      features: ['5 Instagram accounts', '10,000 DMs/month', 'Team seats', 'Priority support', 'All Pro features', 'Custom Branding'],
      cta: 'Upgrade to Growth',
      isCurrent: currentPlan === 'Growth',
      bestValue: true,
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upgrade your plan</h2>
            <p className="text-slate-500 text-sm">Choose the plan that's right for your growth.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative p-6 rounded-2xl border transition-all duration-300 flex flex-col ${
                  plan.popular 
                    ? 'border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02] bg-blue-50/30' 
                    : plan.isCurrent 
                      ? 'border-emerald-500 bg-emerald-50/30' 
                      : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}
                {plan.bestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Best Value
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-slate-500 text-xs mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 text-sm font-medium ml-1">/mo</span>
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${plan.isCurrent ? 'text-emerald-500' : 'text-blue-500'}`} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  disabled={plan.isCurrent}
                  onClick={() => onUpgrade(plan.name)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                    plan.isCurrent
                      ? 'bg-emerald-100 text-emerald-600 cursor-default'
                      : plan.popular
                        ? 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02]'
                        : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02]'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Need more DMs?</h4>
                <p className="text-slate-500 text-xs">Custom enterprise packs available for high-volume creators.</p>
              </div>
            </div>
            <button className="px-6 py-2 border-2 border-slate-900 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Helper to create a cropped image from the crop area coordinates
 */
const getCroppedImg = async (imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg");
};

const AccountSettingsPage = ({ profile, igProfile, usage, currentPlanLimits, onInstagramConnect, onDisconnect, onUpgrade, isLoading }: any) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [disconnectReason, setDisconnectReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [toasts, setToasts] = useState<{ id: string, title: string, message: string, type: 'success' | 'error' }[]>([]);

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUpdatingProfile(false);
    showToast("Profile Updated", "Your profile information was updated successfully.");
  };

  const handleUpdateEmail = async () => {
    setIsUpdatingEmail(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUpdatingEmail(false);
    showToast("Email Updated", "Your email was updated successfully.");
  };

  const handleUpdatePassword = async () => {
    setIsUpdatingPassword(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUpdatingPassword(false);
    showToast("Password Updated", "Your password was updated successfully.");
  };

  const handleReauthenticate = async () => {
    setIsReauthenticating(true);
    try {
      if (onInstagramConnect) {
        await onInstagramConnect();
        showToast("Re-authentication", "Re-authentication initiated! Please follow the steps in the popup.");
      }
    } catch (error) {
      showToast("Error", "Failed to start re-authentication. Please try again.", "error");
    } finally {
      setIsReauthenticating(false);
    }
  };
  
  // Password Visibility States
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleDisconnect = () => {
    setShowConfirmModal(true);
  };

  const finalDisconnect = () => {
    onDisconnect();
    setShowConfirmModal(false);
  };

  const fallbackLetter = (profile?.email?.charAt(0) || profile?.name?.charAt(0) || 'U').toUpperCase();
  const avatarUrl = igProfile?.profile_picture_url || profile?.avatar_url;
  const isIGConnected = !!igProfile;
  
  const dmPercentage = (usage.dmsSent / currentPlanLimits.dms) * 100;
  const accountsPercentage = (usage.accountsUsed / currentPlanLimits.accounts) * 100;

  const countries = [
    "United States", "United Kingdom", "India", "Canada", "Australia", 
    "Germany", "France", "United Arab Emirates", "Singapore", "Japan",
    "Brazil", "Mexico", "Spain", "Italy", "Netherlands"
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      {/* Header - Simple & Clean */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 text-sm">Manage your personal profile, email, security and billing.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Profile Information Card */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
              {/* Left Side: Avatar */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-400 font-black text-5xl overflow-hidden border-4 border-white shadow-xl shadow-slate-200/50">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      fallbackLetter
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-slate-900">{profile?.name}</div>
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personal Account</div>
                    {isIGConnected && (
                      <div className="flex items-center gap-1.5 text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full mt-0.5">
                        <Instagram className="w-2.5 h-2.5" />
                        <span className="text-[9px] font-black tracking-tight">@{igProfile?.username}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">First Name</label>
                    <input 
                      type="text" 
                      defaultValue={profile?.name?.split(' ')[0] || ""}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-slate-300"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Last Name</label>
                    <input 
                      type="text" 
                      defaultValue={profile?.name?.split(' ').slice(1).join(' ') || ""}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-slate-300"
                      placeholder="Enter last name"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Country / Region</label>
                    </div>
                    <div className="relative">
                      <select 
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-12 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select your country</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Change Email Section */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Change Email</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Current Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  readOnly
                  value={profile?.email || ""}
                  className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-12 py-3.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
                />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">New Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-12 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-slate-300"
                  placeholder="Enter new email address"
                />
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button 
              onClick={handleUpdateEmail}
              disabled={isUpdatingEmail}
              className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdatingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                "Update Email"
              )}
            </button>
          </div>
        </section>

        {/* 3. Change Password Section */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Current Password</label>
              <div className="relative">
                <input 
                  type={showCurrentPass ? "text" : "password"}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-12 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <button 
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="hidden md:block" /> {/* Grid spacer */}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">New Password</label>
              <div className="relative">
                <input 
                  type={showNewPass ? "text" : "password"}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-12 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <button 
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPass ? "text" : "password"}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-12 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <button 
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button 
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword}
              className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </section>

        {/* 4. Notifications Section */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
              <div className="pr-4">
                <div className="text-sm font-bold text-slate-900">Master Notifications</div>
                <p className="text-xs text-slate-500 mt-1">Receive all platform and automation updates.</p>
              </div>
              <div 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 ${notificationsEnabled ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
              <div className="pr-4">
                <div className="text-sm font-bold text-slate-900">Login Alerts</div>
                <p className="text-xs text-slate-500 mt-1">Get notified of new login attempts on your account.</p>
              </div>
              <div 
                onClick={() => setLoginAlertsEnabled(!loginAlertsEnabled)}
                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 ${loginAlertsEnabled ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${loginAlertsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
        </section>

        {/* 6. Usage & Limits Section */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Usage & Limits</h2>
            </div>
            <div className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
              Current Period: May 1 - May 31
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DMs Sent Card */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 ${dmPercentage > 90 ? 'bg-rose-50/30 border-rose-100' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 group'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${dmPercentage > 90 ? 'bg-rose-100 text-rose-600' : 'bg-white text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900">Direct Messages</h4>
                    <p className="text-[10px] font-medium text-slate-500">Monthly DM quota</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900 tabular-nums">{usage.dmsSent.toLocaleString()} <span className="text-slate-400 font-bold">/</span> {currentPlanLimits.dms.toLocaleString()}</div>
                  <div className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${dmPercentage > 90 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {Math.round(100 - dmPercentage)}% Remaining
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dmPercentage}%` }}
                    className={`h-full rounded-full transition-colors duration-500 ${dmPercentage > 90 ? 'bg-rose-500' : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]'}`}
                  />
                </div>
                {dmPercentage > 90 && (
                  <div className="flex items-center gap-1.5 text-rose-600">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-[10px] font-bold">Almost at limit. Consider upgrading.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Instagram Accounts Card */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-pink-600 flex items-center justify-center shadow-sm group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900">Instagram Profiles</h4>
                    <p className="text-[10px] font-medium text-slate-500">Total connected accounts</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900 tabular-nums">{usage.accountsUsed} <span className="text-slate-400 font-bold">/</span> {currentPlanLimits.accounts}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    {currentPlanLimits.accounts - usage.accountsUsed} Slots Open
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${accountsPercentage}%` }}
                    className="h-full bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.4)]"
                  />
                </div>
              </div>
            </div>

            {/* Automations Card */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900">Active Flows</h4>
                    <p className="text-[10px] font-medium text-slate-500">Running automations</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900 tabular-nums">2 <span className="text-slate-400 font-bold">/</span> 5</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    3 Slots Available
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `40%` }}
                    className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                  />
                </div>
              </div>
            </div>

            {/* Leads Card */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900">Leads Captured</h4>
                    <p className="text-[10px] font-medium text-slate-500">Contact CRM capacity</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900 tabular-nums">12 <span className="text-slate-400 font-bold">/</span> 100</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    88% Capacity Free
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `12%` }}
                    className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <p className="text-xs text-blue-800 font-bold">Need more capacity for your growing business?</p>
            </div>
            <button 
              onClick={() => onUpgrade(true)}
              className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline whitespace-nowrap"
            >
              See all plans →
            </button>
          </div>
        </section>

        {/* 7. Billing & Subscription Section */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Billing & Subscription</h2>
          </div>

          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
            {/* Glossy Overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg shadow-blue-600/20">
                    {profile?.plan || 'Free'} Plan
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight">{profile?.plan === 'Free' ? '$0' : profile?.plan === 'Pro' ? '$15' : '$30'}<span className="text-slate-500 text-sm font-medium">/month</span></h3>
                  <p className="text-slate-400 text-xs mt-1">Your next billing date is June 10, 2026</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => onUpgrade(true)}
                  className="px-8 py-3.5 bg-white text-slate-900 rounded-2xl font-black text-sm hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-white/10"
                >
                  Upgrade Plan
                </button>
                <button className="px-8 py-3.5 bg-slate-800 text-white border border-slate-700 rounded-2xl font-black text-sm hover:bg-slate-700 transition-all active:scale-95">
                  Manage Billing
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 mt-8 border-t border-white/5 relative z-10">
              <div className="space-y-1">
                <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest">DM Limit</div>
                <div className="text-base font-bold tabular-nums">{currentPlanLimits.dms.toLocaleString()} <span className="text-[10px] text-slate-500">/mo</span></div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Accounts</div>
                <div className="text-base font-bold tabular-nums">{currentPlanLimits.accounts} <span className="text-[10px] text-slate-500">Connected</span></div>
              </div>
              <div className="space-y-1 col-span-2 md:col-span-1">
                <div className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Features</div>
                <div className="text-sm font-bold text-blue-400">All {profile?.plan || 'Free'} Features Enabled</div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Instagram Account Management Section */}
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Instagram Account Management</h2>
              <p className="text-slate-500 text-xs">Manage your connected Instagram account and connection status.</p>
            </div>
          </div>

          {isLoading && !igProfile ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-4 bg-slate-50 rounded-[2.5rem] border border-slate-100 italic text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium">Fetching your Instagram profile...</p>
            </div>
          ) : isIGConnected ? (
            <div className="space-y-6">
              {/* 1. Connected Account Card */}
              <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 group flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl transition-transform group-hover:scale-105 duration-500 bg-slate-200 flex items-center justify-center">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          alt="IG Profile"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${igProfile?.username || 'U'}&background=random`;
                          }}
                        />
                      ) : (
                        <Instagram className="w-10 h-10 text-slate-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{igProfile?.username || 'Unknown'}</h3>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                        {isLoading ? 'Syncing...' : 'Connected'}
                      </span>
                    </div>
                    <p className="text-blue-600 text-[13px] font-bold tracking-tight">@{igProfile?.username || 'username'}</p>
                    <div className="flex items-center gap-6 pt-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-slate-900 tabular-nums">{igProfile?.followers?.toLocaleString() || "0"}</span>
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Followers</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-slate-900 tabular-nums">{igProfile?.following?.toLocaleString() || "0"}</span>
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Following</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onInstagramConnect}
                  className={`w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all ${isLoading ? 'animate-pulse' : ''}`}
                  title="Refresh Connection"
                >
                  <Activity className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* 2. Re-authenticate Connection Card */}
              <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-blue-900">Re-authenticate Connection</h4>
                    <p className="text-sm font-semibold text-blue-700/70 leading-relaxed max-w-sm">
                      If your Instagram connection stops working or expires, refresh the connection without losing your automation data.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleReauthenticate}
                  disabled={isReauthenticating}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all whitespace-nowrap flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {isReauthenticating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Radio className="w-4 h-4 group-hover:animate-pulse" />
                  )}
                  {isReauthenticating ? "Connecting..." : "Re-authenticate Instagram"}
                </button>
              </div>

              {/* 3. Connect New Instagram Account Card */}
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-slate-900">Connect New Instagram Account</h4>
                    <p className="text-sm font-semibold text-slate-500 leading-relaxed max-w-sm">
                      Connect another Instagram account to manage automations from a different profile.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (usage.accountsUsed >= currentPlanLimits.accounts) {
                      onUpgrade(true);
                    } else {
                      onInstagramConnect();
                    }
                  }}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all whitespace-nowrap"
                >
                  Connect Instagram
                </button>
              </div>

              {/* 4. Disconnect Instagram Account Card */}
              <div className="p-8 bg-rose-50/50 rounded-[2.5rem] border border-rose-100/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-rose-900">Disconnect Instagram Account</h4>
                    <p className="text-sm font-semibold text-rose-700/70 leading-relaxed max-w-sm">
                      Disconnecting your Instagram account will stop automations and remove synced session access from DMflow.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleDisconnect}
                  className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-600/30 hover:bg-rose-700 transition-all whitespace-nowrap"
                >
                  Disconnect Instagram
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm relative">
                <Instagram className="w-10 h-10" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-100 rounded-full border-4 border-white flex items-center justify-center">
                  <X className="w-3 h-3 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">No Instagram account connected</h3>
                <p className="text-slate-500 text-sm max-w-xs font-medium">Connect Instagram to start automations and grow your business today.</p>
              </div>
              <button 
                onClick={onInstagramConnect}
                className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] transition-all"
              >
                <Instagram className="w-5 h-5" />
                Connect Instagram
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Disconnect Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                  <Trash2 className="w-8 h-8" />
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Disconnect Instagram Account?</h3>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed px-4">
                    Before you disconnect, please tell us why you're leaving. Your feedback helps us improve DMflow.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Primary Reason</div>
                  <div className="space-y-2">
                    {[
                      "Connection issues",
                      "Using another account",
                      "Just testing DMflow",
                      "Privacy concerns",
                      "Taking a break",
                      "Other reason"
                    ].map((reason) => (
                      <label 
                        key={reason}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${disconnectReason === reason ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-md hover:shadow-slate-200/20'}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${disconnectReason === reason ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                          {disconnectReason === reason && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <input 
                          type="radio" 
                          name="disconnectReason" 
                          className="hidden"
                          onChange={() => setDisconnectReason(reason)}
                        />
                        <span className={`text-[13px] font-bold transition-colors ${disconnectReason === reason ? 'text-blue-700' : 'text-slate-600'}`}>{reason}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-2">
                    <textarea 
                      placeholder="Additional feedback (optional)"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[13px] font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all resize-none placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-2">
                  <button 
                    onClick={() => setShowConfirmModal(false)} 
                    className="py-4 bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={finalDisconnect} 
                    className="py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95"
                  >
                    Disconnect Anyway
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification Container */}
      <div className="fixed top-8 right-8 z-[300] flex flex-col gap-3 pointer-events-none items-end">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, x: 50, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto w-80 md:w-96 bg-white rounded-[1.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 flex items-start gap-4`}
            >
              <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${t.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {t.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-900 leading-tight mb-0.5">{t.title}</h4>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{t.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
                className="shrink-0 w-6 h-6 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const HomePage = ({ profile, igProfile, igStats, onInstagramConnect, onDisconnect }: { profile: UserProfile | null, igProfile: IGProfile | null, igStats: IGStats, onInstagramConnect?: () => void, onDisconnect?: () => void }) => {
  const displayStats = [
    { label: "Connected Accounts", value: igProfile ? "1" : "0", icon: <Instagram className="w-5 h-5" />, color: "text-blue-600" },
    { label: "Followers", value: igProfile?.followers?.toLocaleString() || "0", icon: <Users className="w-5 h-5" />, color: "text-pink-600" },
    { label: "Posts", value: igStats.posts.toLocaleString(), icon: <LayoutTemplate className="w-5 h-5" />, color: "text-emerald-600" },
    { label: "Reels", value: igStats.reels.toLocaleString(), icon: <PlayCircle className="w-5 h-5" />, color: "text-amber-600" },
    { label: "Messages", value: igStats.messages.toLocaleString(), icon: <MessageSquare className="w-5 h-5" />, color: "text-indigo-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {igProfile?.username || profile?.name || 'Creator'} 👋</h1>
          <p className="text-slate-500 text-sm">Here's what's happening with your Instagram growth today.</p>
        </div>
        {igProfile ? (
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            {profile?.avatar_url || igProfile.profile_picture_url ? (
              <img 
                src={profile?.avatar_url || igProfile.profile_picture_url} 
                alt={igProfile.username} 
                className="w-10 h-10 rounded-full border-2 border-brand-primary"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-brand-primary">
                <Instagram className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-slate-900">@{igProfile.username}</div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Connected
                </div>
                <button 
                  onClick={onDisconnect}
                  className="text-[10px] text-rose-500 font-bold uppercase tracking-wider hover:underline"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={onInstagramConnect}
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform active:scale-95"
          >
            <Instagram className="w-5 h-5" />
            Connect Instagram
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {displayStats.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
          </Card>
        ))}
      </div>

    <div className="grid lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2 p-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-slate-900">Growth Performance</h3>
          <select className="text-xs font-bold bg-slate-50 border-none rounded-lg px-3 py-2 outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="followers" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorFollowers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-900">Start Automating</h3>
        {[
          { title: "Auto DM from comments", desc: "Send a DM when someone comments 'LINK'.", icon: <MessageSquare className="text-blue-600" /> },
          { title: "Story Reply Automation", desc: "Respond to story replies automatically.", icon: <PlayCircle className="text-emerald-600" /> },
          { title: "Follow Unlock Funnel", desc: "Lock links behind a follow wall.", icon: <Lock className="text-rose-600" /> },
          { title: "AI Conversation Bot", desc: "Let AI reply to common DMs.", icon: <Brain className="text-amber-600" /> },
        ].map((item, i) => (
          <Card key={i} className="p-4 flex items-start gap-4 cursor-pointer hover:border-blue-200 group">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
              {item.icon}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);
};

const InboxPage = () => {
  const [selectedChat, setSelectedChat] = useState(0);
  const chats = [
    { name: "alex_creativ", lastMsg: "How do I get the guide?", time: "2m ago", unread: true, followers: "12.4k" },
    { name: "sarah.designs", lastMsg: "Thanks for the link!", time: "1h ago", unread: false, followers: "2.1k" },
    { name: "mike_fitness", lastMsg: "Is Growth-Lock free?", time: "3h ago", unread: false, followers: "45k" },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-500">
      {/* Chat List */}
      <Card className="w-80 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat, i) => (
            <button 
              key={i}
              onClick={() => setSelectedChat(i)}
              className={`w-full p-4 flex items-start gap-3 border-b border-slate-50 transition-colors ${
                selectedChat === i ? "bg-blue-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900 truncate">{chat.name}</span>
                  <span className="text-[10px] text-slate-400">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{chat.lastMsg}</p>
              </div>
              {chat.unread && <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />}
            </button>
          ))}
        </div>
      </Card>

      {/* Chat Window */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div>
              <div className="text-sm font-bold text-slate-900">{chats[selectedChat].name}</div>
              <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"><Tag className="w-4 h-4" /></button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"><Trash2 className="w-4 h-4" /></button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"><MoreVertical className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-4">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">Today</span>
          </div>
          <div className="flex gap-3 max-w-[70%]">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="p-3 bg-white rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700">
              Hey! I saw your post about the growth guide. How can I get it?
            </div>
          </div>
          <div className="flex gap-3 max-w-[70%] ml-auto flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-blue-600 shrink-0" />
            <div className="p-3 bg-blue-600 rounded-2xl rounded-tr-none shadow-sm text-sm text-white">
              Hey Alex! Just follow this account and I'll send you the link automatically. 🔒
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-transparent border-none outline-none text-sm py-2"
            />
            <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* User Info */}
      <Card className="w-72 p-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-slate-200 mb-4" />
        <h3 className="font-bold text-slate-900 mb-1">{chats[selectedChat].name}</h3>
        <p className="text-xs text-slate-500 mb-6">Instagram Creator</p>
        
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-sm font-bold text-slate-900">{chats[selectedChat].followers}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Followers</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="text-sm font-bold text-slate-900">Active</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Status</div>
          </div>
        </div>

        <div className="w-full space-y-3 text-left">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tags</div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold">Lead</span>
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold">Interested</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const AutomationsPage = ({ userId, setActivePage }: { userId: string, setActivePage?: (page: any) => void }) => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const quickTemplates = [
    {
      id: "link_delivery",
      name: "Comment-to-DM for Link",
      icon: <Zap className="w-5 h-5" />,
      color: "blue",
      description: "Send links automatically when users comment.",
      keywords: "LINK",
      commentReply: "Check your DM 👇",
      dmMessage: "Hey! Glad you're interested 👋 Here is the link you requested ✨",
    },
    {
      id: "story_automation",
      name: "Story Reply Automation",
      icon: <PlayCircle className="w-5 h-5" />,
      color: "purple",
      description: "Reply to story mentions or replies instantly.",
      keywords: "INFO",
      dmMessage: "Thanks for replying to my story! Here's more info for you 😊",
    },
    {
      id: "lead_capture",
      name: "Lead Capture",
      icon: <Users className="w-5 h-5" />,
      color: "emerald",
      description: "Collect emails inside DMs automatically.",
      keywords: "JOIN",
      dmMessage: "Hey! Tap below to join our list and get exclusive updates 🚀",
    }
  ];

  const colorMap: Record<string, { bg: string, text: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    purple: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  };

  const handleUseTemplate = (template: any) => {
    setAutomationName(template.name);
    setTriggerKeyword(template.keywords);
    setDmText(template.dmMessage);
    if (template.commentReply) {
      setCommentReply(template.commentReply);
    }
    setIsBuilderOpen(true);
    setTemplateApplied(true);
    setTimeout(() => setTemplateApplied(false), 3000);
  };
  
  // Prefill states
  const [automationName, setAutomationName] = useState("New Automation");
  const [triggerKeyword, setTriggerKeyword] = useState("LINK");
  const [dmText, setDmText] = useState("Please follow to unlock the link! 🔒");
  const [commentReply, setCommentReply] = useState("Check your DM 📩");
  const [templateApplied, setTemplateApplied] = useState(false);

  useEffect(() => {
    fetchAutomations();
    
    // Check for selected template in localStorage
    const templateStr = localStorage.getItem("selectedTemplate");
    if (templateStr) {
      try {
        const template = JSON.parse(templateStr);
        setAutomationName(template.name || "New Automation");
        
        // Handle both old array format and new string format
        const keywords = Array.isArray(template.keywords) 
          ? template.keywords.join(", ") 
          : (template.keywords || "LINK");
        setTriggerKeyword(keywords);
        
        // Handle nested or flat structure
        const dmTextVal = template.dm_flow?.text || template.dmMessage || "Hey! Thanks for your interest 👋";
        setDmText(dmTextVal);
        
        const replyVal = Array.isArray(template.comment_replies) 
          ? template.comment_replies[0] 
          : (template.commentReply || "Check your DM 📩");
        setCommentReply(replyVal);
        setIsBuilderOpen(true);
        setTemplateApplied(true);
        localStorage.removeItem("selectedTemplate");
        setTimeout(() => setTemplateApplied(false), 3000);
      } catch (e) {
        console.error("Error parsing template:", e);
      }
    }
  }, [userId]);

  const fetchAutomations = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAutomations(data || []);
    } catch (err) {
      console.error("Error fetching automations:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isBuilderOpen) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col animate-in zoom-in-95 duration-300">
        <AnimatePresence>
          {templateApplied && (
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Template Applied Successfully ✅
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsBuilderOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <h2 className="text-xl font-bold text-slate-900">{automationName}</h2>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-md text-[10px] font-bold uppercase tracking-wider">Draft</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 glass rounded-xl text-sm font-bold">Save Draft</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20">Publish Changes</button>
          </div>
        </div>

        <div className="flex-1 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 relative overflow-hidden flex items-center justify-center">
          {/* Mock Flow Builder */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563EB 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <div className="flex flex-col items-center gap-12 relative z-10">
            <Card className="w-64 p-4 border-blue-500 border-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><MessageSquare className="w-4 h-4" /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Trigger</span>
              </div>
              <div className="text-sm font-bold text-slate-900">User comments "{triggerKeyword}"</div>
              <div className="mt-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded inline-block">
                Reply: "{commentReply}"
              </div>
            </Card>

            <div className="w-px h-12 bg-blue-500 relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500" />
            </div>

            <Card className="w-64 p-4 border-rose-500 border-2">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600"><Lock className="w-4 h-4" /></div>
                <span className="text-xs font-bold uppercase tracking-wider">Action</span>
              </div>
              <div className="text-sm font-bold text-slate-900">Send DM</div>
              <p className="mt-2 text-[10px] text-slate-500 italic leading-tight">"{dmText}"</p>
            </Card>

            <div className="flex gap-32 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-300" />
              <div className="absolute top-8 left-0 right-0 h-px bg-slate-300" />
              
              <div className="pt-12 flex flex-col items-center gap-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">If Not Following</div>
                <Card className="w-56 p-4">
                  <div className="text-xs font-bold text-slate-900 mb-2">Send DM</div>
                  <p className="text-[10px] text-slate-500 italic">"Please follow to unlock the link! 🔒"</p>
                </Card>
              </div>

              <div className="pt-12 flex flex-col items-center gap-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">If Following</div>
                <Card className="w-56 p-4">
                  <div className="text-xs font-bold text-slate-900 mb-2">Send Link</div>
                  <p className="text-[10px] text-slate-500 italic">"Here is your link: dmflow.site/guide"</p>
                </Card>
              </div>
            </div>
          </div>

          {/* Builder Sidebar */}
          <div className="absolute right-8 top-8 bottom-8 w-64 glass rounded-3xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900">Blocks</h3>
            {[
              { label: "Send DM", icon: <MessageSquare className="w-4 h-4" /> },
              { label: "Condition", icon: <Filter className="w-4 h-4" /> },
              { label: "Delay", icon: <Clock className="w-4 h-4" /> },
              { label: "Collect Email", icon: <Mail className="w-4 h-4" /> },
              { label: "Tag User", icon: <Tag className="w-4 h-4" /> },
            ].map((block, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-slate-100 flex items-center gap-3 cursor-grab hover:border-blue-200 transition-colors">
                <div className="text-slate-400">{block.icon}</div>
                <span className="text-xs font-medium text-slate-700">{block.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Automations</h1>
          <p className="text-slate-500 text-sm">Manage and monitor your Instagram automation flows.</p>
        </div>
        <button 
          onClick={() => setIsBuilderOpen(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Automation
        </button>
      </div>

      {/* Templates Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Quick Templates</h2>
          </div>
          {setActivePage && (
            <button 
              onClick={() => setActivePage('templates')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              Browse All <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickTemplates.map((template) => (
            <div 
              key={template.id}
              onClick={() => handleUseTemplate(template)}
              className="group p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-2xl ${colorMap[template.color].bg} ${colorMap[template.color].text} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {template.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">{template.name}</h3>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed mb-6">{template.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider">"{template.keywords}"</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">Use Flow →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
           <Zap className="w-5 h-5 text-blue-600" />
           <h2 className="text-lg font-bold text-slate-900">All Automations</h2>
        </div>
        {automations.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Zap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No automations yet</h3>
          <p className="text-slate-500 mb-6">Create your first automation to start growing your Instagram.</p>
          <button 
            onClick={() => setIsBuilderOpen(true)}
            className="text-blue-600 font-bold hover:underline"
          >
            Create Automation →
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {automations.map((a, i) => (
            <Card key={i} className="p-6 cursor-pointer hover:border-blue-200 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  a.is_active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                }`}>
                  {a.is_active ? "Active" : "Paused"}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{a.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                <PlayCircle className="w-4 h-4" />
                Trigger: {a.trigger_type}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <div className="text-sm font-bold text-slate-900">{(a.runs || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Runs</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{a.ctr || '0%'}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">CTR</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  </div>
);
};

const AnalyticsPage = ({ userId }: { userId: string }) => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setStats(data || []);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm">Track your automation performance and growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-slate-500 text-xs font-bold uppercase mb-2">Total DMs Sent</div>
          <div className="text-3xl font-bold text-slate-900">
            {stats.reduce((acc, curr) => acc + (curr.dms_sent || 0), 0).toLocaleString()}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-slate-500 text-xs font-bold uppercase mb-2">Comments Replied</div>
          <div className="text-3xl font-bold text-slate-900">
            {stats.reduce((acc, curr) => acc + (curr.comments_replied || 0), 0).toLocaleString()}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-slate-500 text-xs font-bold uppercase mb-2">Active Days</div>
          <div className="text-3xl font-bold text-slate-900">{stats.length}</div>
        </Card>
      </div>

      <Card className="p-6 h-[400px]">
        <h3 className="font-bold text-slate-900 mb-6">Daily Performance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.slice().reverse()}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="dms_sent" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} />
            <Area type="monotone" dataKey="comments_replied" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

const ContactsPage = ({ userId }: { userId: string }) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, [userId]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId)
        .order('first_dm_date', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500 text-sm">People who have interacted with your automations.</p>
        </div>
        <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">First Interaction</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source</th>
              <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400 italic">No contacts found yet.</td>
              </tr>
            ) : (
              contacts.map((c, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900">@{c.instagram_username}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{new Date(c.first_dm_date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase">{c.source || 'Direct'}</span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const GrowthLockPage = () => (
  <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Growth-Lock Technology™</h1>
      <p className="text-slate-500 text-sm">Force users to follow your account before unlocking links or content.</p>
    </div>

    <Card className="p-8">
      <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 mb-1">Enable Growth Lock</h3>
          <p className="text-xs text-slate-500">When enabled, all automation links will require a follow verification.</p>
        </div>
        <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Follow Message</label>
            <textarea 
              className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
              placeholder="Please follow to unlock the download link 🔒"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Unlock Message</label>
            <textarea 
              className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
              placeholder="Welcome 🎉 Here is your download link."
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Recheck Delay (Seconds)</label>
            <input 
              type="number" 
              className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              defaultValue={10}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Max Retries</label>
            <input 
              type="number" 
              className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              defaultValue={3}
            />
          </div>
        </div>

        <div className="pt-6">
          <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-transform active:scale-95">
            Save Growth-Lock Settings
          </button>
        </div>
      </div>
    </Card>

    <div className="grid md:grid-cols-3 gap-6">
      {[
        { title: "Require Follow", desc: "Users must follow to get links.", icon: <Users className="text-blue-600" /> },
        { title: "Smart Recheck", desc: "Automatically verifies follow status.", icon: <Zap className="text-emerald-600" /> },
        { title: "Anti-Spam", desc: "Prevents bot abuse of links.", icon: <Lock className="text-rose-600" /> },
      ].map((item, i) => (
        <Card key={i} className="p-6">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
            {item.icon}
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
          <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
        </Card>
      ))}
    </div>
  </div>
);

const ReferEarnPage = () => {
  const [copied, setCopied] = useState(false);
  const referralLink = "dmflow.site/ref/imran_m";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralStats = [
    { label: "Total Clicks", value: "1,240", icon: <MousePointer2 className="w-5 h-5" />, color: "text-blue-600" },
    { label: "Signups", value: "84", icon: <Users className="w-5 h-5" />, color: "text-emerald-600" },
    { label: "Purchases", value: "12", icon: <CreditCard className="w-5 h-5" />, color: "text-amber-600" },
    { label: "Active Subs", value: "8", icon: <Zap className="w-5 h-5" />, color: "text-indigo-600" },
    { label: "Total Earnings", value: "₹6,840", icon: <DollarSign className="w-5 h-5" />, color: "text-rose-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Refer & Earn</h1>
          <p className="text-slate-500 text-sm">Invite creators to DMflow and earn 30% recurring commission.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">30% Commission Active</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Referral Link */}
          <Card className="p-8">
            <h3 className="font-bold text-slate-900 mb-6">Your Referral Link</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-sm text-slate-600 flex items-center justify-between">
                {referralLink}
                <AnimatePresence>
                  {copied && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] font-bold text-emerald-500 uppercase"
                    >
                      Copied!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                <button className="p-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </Card>

          {/* Analytics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {referralStats.map((stat, i) => (
              <Card key={i} className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mb-3 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-lg font-bold text-slate-900">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </Card>
            ))}
          </div>

          {/* Leaderboard */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-900">Top Affiliates This Month</h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resets in 12 days</span>
            </div>
            <div className="space-y-4">
              {[
                { name: "Rahul Sharma", earnings: "₹42,840", rank: 1, medal: "🥇" },
                { name: "Ayaan Khan", earnings: "₹38,200", rank: 2, medal: "🥈" },
                { name: "Mohammad Arif", earnings: "₹31,450", rank: 3, medal: "🥉" },
                { name: "Sarah Ahmed", earnings: "₹24,100", rank: 4 },
                { name: "James Carter", earnings: "₹18,900", rank: 5 },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                      {user.medal || user.rank}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Affiliate Partner</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{user.earnings}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Payout Progress */}
          <Card className="p-8">
            <h3 className="font-bold text-slate-900 mb-6">Earnings Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900">₹680 <span className="text-slate-400 font-normal">/ ₹1000</span></span>
                <span className="text-blue-600 font-bold">68%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
              <p className="text-[10px] text-slate-500 text-center">Minimum payout: ₹1000</p>
            </div>
          </Card>

          {/* Payout Details */}
          <Card className="p-8">
            <h3 className="font-bold text-slate-900 mb-6">Payout Details</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Holder Name</label>
                <input type="text" className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Imran Mohammad" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bank Account Number</label>
                <input type="text" className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="XXXX XXXX XXXX 4210" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IFSC Code</label>
                <input type="text" className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="HDFC0001234" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UPI ID (Optional)</label>
                <input type="text" className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="imran@upi" />
              </div>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors mt-4">
                Save Payout Details
              </button>
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Next Payout:</span>
                  <span className="text-slate-900">25th March</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Min Payout:</span>
                  <span className="text-slate-900">₹1000</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Promo Code Info */}
          <Card className="p-6 bg-blue-600 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Tag className="w-5 h-5" /></div>
              <h3 className="font-bold">Promo Code System</h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed mb-4">
              Admin-generated promo codes give your referrals a <span className="font-bold text-white">10% discount</span> and you a <span className="font-bold text-white">20% commission</span>.
            </p>
            <div className="p-3 bg-white/10 rounded-xl border border-white/20 text-center font-bold text-sm">
              Contact Admin for Custom Code
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

export default function Dashboard({ onLogout, onInstagramConnect }: { onLogout: () => void, onInstagramConnect?: () => void }) {
  const [activePage, setActivePage] = useState<Page>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Main', 'Analytics']);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutReason, setLogoutReason] = useState<string | null>(null);
  const [logoutCustomReason, setLogoutCustomReason] = useState("");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [usage, setUsage] = useState({ dmsSent: 0, accountsUsed: 1 });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [igProfile, setIgProfile] = useState<IGProfile | null>(null);
  const [igStats, setIgStats] = useState<IGStats>({ posts: 0, reels: 0, messages: 0, followers: 0 });

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        // Mobile: Hidden by default
        setIsSidebarCollapsed(false);
        setIsMobileSidebarOpen(false);
      } else if (width < 1024) {
        // Tablet: Collapsed by default
        setIsSidebarCollapsed(true);
        setIsMobileSidebarOpen(false);
      } else {
        // Desktop: Expanded by default
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const checkSession = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        onLogout();
        return;
      }
      fetchProfile();
      fetchIGData(session.user.id);
      cleanup = setupRealtime(session.user.id);
    };
    checkSession();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const setupRealtime = (userId: string) => {
    if (!isSupabaseConfigured) return () => {};
    const channels = [
      supabase.channel('ig_accounts_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'instagram_accounts', filter: `user_id=eq.${userId}` }, () => fetchIGData(userId))
        .subscribe(),
      supabase.channel('ig_media_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'instagram_media', filter: `user_id=eq.${userId}` }, () => fetchIGData(userId))
        .subscribe(),
      supabase.channel('ig_messages_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'instagram_messages', filter: `user_id=eq.${userId}` }, () => fetchIGData(userId))
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  };

  const fetchIGData = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      // 1. Fetch Profile
      const { data: account } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (account) {
        setIgProfile({
          id: account.ig_user_id,
          username: account.username,
          profile_picture_url: account.profile_picture,
          account_type: account.account_type,
          followers: account.followers,
          following: account.following
        });
      }

      // 2. Fetch Media Stats
      const { data: media } = await supabase
        .from('instagram_media')
        .select('type')
        .eq('user_id', userId);

      if (media) {
        const posts = media.filter(m => m.type === 'IMAGE' || m.type === 'CAROUSEL_ALBUM').length;
        const reels = media.filter(m => m.type === 'VIDEO').length;
        setIgStats(prev => ({ ...prev, posts, reels }));
      }

      // 3. Fetch Message Stats
      const { count: messageCount } = await supabase
        .from('instagram_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (messageCount !== null) {
        setIgStats(prev => ({ ...prev, messages: messageCount }));
      }

    } catch (err) {
      console.error("Error fetching IG data from Supabase:", err);
    }
  };

  const fetchIGProfile = async () => {
    try {
      let userId = null;
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id;
      }
      
      const url = userId ? `/api/auth/instagram/profile?userId=${userId}` : "/api/auth/instagram/profile";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.username) {
          setIgProfile(prev => prev ? { ...prev, username: data.username } : { username: data.username });
        }
      }
    } catch (err) {
      console.error("Error fetching IG profile:", err);
    }
  };

  const fetchProfile = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // If no Supabase user, we might be logged in via Instagram only
        // We can still show the IG profile
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setIsConnected(data.instagram_connected);
      
      if (data.instagram_connected) {
        fetchIGData(user.id);
      } else {
        setShowConnectModal(true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        updateInstagramConnection(true);
        setTimeout(() => setShowConnectModal(false), 2000);
      }
      
      if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        alert(`Connection failed: ${event.data.error}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [profile]);

  const updateInstagramConnection = async (connected: boolean) => {
    if (!profile) return;
    try {
      // The backend already updated the database on callback.
      // We just need to refresh our local profile state.
      await fetchProfile();
      if (connected) {
        fetchIGData(profile.id);
      }
    } catch (err) {
      console.error("Error updating connection status:", err);
    }
  };

  const handleConnect = async () => {
    try {
      // Fetch the OAuth URL from our server
      let userId = "";
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id || "";
      }
      
      const response = await fetch(`/api/auth/instagram/url?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      const { url } = await response.json();

      // Open the OAuth PROVIDER's URL directly in popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const authWindow = window.open(
        url,
        'instagram_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        alert('Please allow popups for this site to connect your account.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  const handleLogoutAction = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
      onLogout();
    }
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const NavContent = () => (
    <>
      <SidebarGroup 
        title="Main" 
        collapsed={isSidebarCollapsed} 
        expanded={expandedGroups.includes('Main')}
        onToggle={() => toggleGroup('Main')}
      >
        <SidebarItem icon={<Home className="w-4 h-4" />} label="Home" active={activePage === 'home'} onClick={() => { setActivePage('home'); setIsMobileSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={<Zap className="w-4 h-4" />} label="Automations" active={activePage === 'automations'} onClick={() => { setActivePage('automations'); setIsMobileSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={<LayoutTemplate className="w-4 h-4" />} label="Templates" active={activePage === 'templates'} onClick={() => { setActivePage('templates'); setIsMobileSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
      </SidebarGroup>

      <SidebarGroup 
        title="Content" 
        collapsed={isSidebarCollapsed} 
        expanded={expandedGroups.includes('Content')}
        onToggle={() => toggleGroup('Content')}
      >
        <SidebarItem icon={<Layout className="w-4 h-4" />} label="Posts & Reels" active={activePage === 'posts'} onClick={() => { setActivePage('home'); setIsMobileSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={<Heart className="w-4 h-4" />} label="Stories" active={activePage === 'stories'} onClick={() => { setActivePage('home'); setIsMobileSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
      </SidebarGroup>

      <SidebarGroup 
        title="Customers" 
        collapsed={isSidebarCollapsed} 
        expanded={expandedGroups.includes('Customers')}
        onToggle={() => toggleGroup('Customers')}
      >
        <SidebarItem icon={<Users className="w-4 h-4" />} label="Contacts" active={activePage === 'contacts'} onClick={() => { setActivePage('contacts'); setIsMobileSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
      </SidebarGroup>

      <SidebarGroup 
        title="Tools" 
        collapsed={isSidebarCollapsed} 
        expanded={expandedGroups.includes('Tools')}
        onToggle={() => toggleGroup('Tools')}
      >
        <SidebarItem icon={<Brain className="w-4 h-4" />} label="AI Assistant" active={activePage === 'ai'} onClick={() => { setActivePage('ai'); setIsMobileSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={<Lock className="w-4 h-4" />} label="Growth-Lock" active={activePage === 'growth-lock'} onClick={() => { setActivePage('growth-lock'); setIsMobileSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
      </SidebarGroup>

      <SidebarGroup 
        title="Analytics" 
        collapsed={isSidebarCollapsed} 
        expanded={expandedGroups.includes('Analytics')}
        onToggle={() => toggleGroup('Analytics')}
      >
        <SidebarItem icon={<BarChart3 className="w-4 h-4" />} label="Overview" active={activePage === 'analytics'} onClick={() => { setActivePage('analytics'); setIsMobileSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
        <SidebarItem icon={<TrendingUp className="w-4 h-4" />} label="Audience Insights" active={false} onClick={() => { setActivePage('analytics'); setIsMobileSidebarOpen(false); }} collapsed={isSidebarCollapsed} />
      </SidebarGroup>

      <SidebarGroup 
        title="Settings" 
        collapsed={isSidebarCollapsed} 
        expanded={expandedGroups.includes('Settings')}
        onToggle={() => toggleGroup('Settings')}
      >
        <SidebarItem 
          icon={<Settings className="w-4 h-4" />} 
          label="Account & Billing" 
          active={activePage === 'account-settings'} 
          onClick={() => { setActivePage('account-settings'); setIsMobileSidebarOpen(false); }} 
          collapsed={isSidebarCollapsed} 
        />
        <SidebarItem 
          icon={<LogOut className="w-4 h-4" />} 
          label="Sign Out" 
          active={false} 
          onClick={() => setShowLogoutModal(true)} 
          collapsed={isSidebarCollapsed} 
        />
      </SidebarGroup>
    </>
  );

  const handleDisconnect = async () => {
    if (!profile) return;
    
    try {
      const response = await fetch("/api/auth/instagram/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id })
      });
      
      if (response.ok) {
        setIsConnected(false);
        setIgProfile(null);
        setProfile(prev => prev ? { ...prev, instagram_connected: false } : null);
      }
    } catch (err) {
      console.error("Error disconnecting:", err);
    }
  };

  function TemplatesPage({ onUseTemplate }: { onUseTemplate: (template: any) => void }) {
    const [view, setView] = useState<'grid' | 'config'>('grid');
    const [previewTab, setPreviewTab] = useState<'post' | 'comment' | 'dm' | 'story' | 'live'>('post');
    const [showProModal, setShowProModal] = useState(false);
    const [formValues, setFormValues] = useState({
      name: '',
      triggerType: 'any',
      triggerSource: 'comment', // 'comment' or 'dm'
      keywords: 'LINK, PRICE, INFO',
      replyOnComment: true,
      commentReply: 'Check your DM 👇',
      openingDM: true,
      dmMessage: "Hey there! Glad you're here 😊Tap below and I’ll send you the access in just a moment ✨",
      buttonText: 'Send me the access',
      requireFollow: false,
      collectEmail: false,
      finalMessage: "Hi there!Appreciate your support 🙌As promised, here’s the link for you ⬇️",
      addLinkText: '',
      url: '',
      followUp: false
    });
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [tempLinkData, setTempLinkData] = useState({ label: '', url: '' });

    // Messaging Simulation State
    const [messages, setMessages] = useState<any[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      let isCancelled = false;
      const sequence: any[] = [];
      
      const addStep = (msg: any, delay: number, typingDelay = 0) => {
        sequence.push({ msg, delay, typingDelay });
      };

      // Define the sequence based on current form values
      // Step 1: User Action (The Trigger in DM)
      addStep({
        id: 'trigger',
        type: 'user',
        text: formValues.triggerSource === 'story_reply' 
          ? "🔥 Loved your story!" 
          : formValues.triggerSource === 'live_comment'
            ? (formValues.keywords.split(',')[0] || "LINK").trim()
            : "Hey, I'm interested!"
      }, 0);

      // Step 2: Bot Opening Message
      if (formValues.openingDM) {
        addStep({
          id: 'opening-dm',
          type: 'bot',
          text: formValues.dmMessage
        }, 600);

        // Step 3: Initial Button
        addStep({
          id: 'cta-button',
          type: 'button',
          text: formValues.buttonText
        }, 500);
      }

      // Step 4: Email Capture (If enabled)
      if (formValues.collectEmail) {
        addStep({
          id: 'email-ask',
          type: 'bot',
          text: "Enter your email to continue 👇"
        }, 700);

        addStep({
          id: 'email-input',
          type: 'user',
          text: "example@gmail.com"
        }, 500);
      }

      // Step 5: Follow Lock (If enabled)
      if (formValues.requireFollow) {
        addStep({
          id: 'follow-lock',
          type: 'bot',
          text: "Almost there! Please visit my profile and tap follow to continue 😊",
          isFollowLock: true
        }, 700);

        addStep({
          id: 'user-followed',
          type: 'user',
          text: "I'm following ✅"
        }, 500);
      }

      // Step 6: Final Message
      addStep({
        id: 'final-msg',
        type: 'bot',
        text: formValues.finalMessage,
        hasLink: !!formValues.addLinkText,
        linkText: formValues.addLinkText
      }, 700);

      const runSequence = async () => {
        setMessages([]);
        setIsTyping(false);
        
        for (const step of sequence) {
          if (isCancelled) return;
          
          if (step.delay > 0) {
            await new Promise(r => setTimeout(r, step.delay));
          }

          if (isCancelled) return;
          setMessages(prev => [...prev, step.msg]);
        }
      };

      if (previewTab === 'dm') {
        runSequence();
      } else {
        setMessages([]);
      }

      return () => { isCancelled = true; };
    }, [
      previewTab, 
      formValues.keywords, 
      formValues.dmMessage, 
      formValues.buttonText, 
      formValues.triggerSource,
      formValues.requireFollow,
      formValues.collectEmail,
      formValues.finalMessage,
      formValues.addLinkText,
      formValues.replyOnComment,
      formValues.commentReply
    ]);

    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, [messages, isTyping]);

    const templates = [
      {
        id: "dm_auto",
        name: "Manage Your DM",
        icon: <MessageSquare className="w-6 h-6" />,
        color: "indigo",
        description: "Automatically reply when someone sends you a DM with specific keywords.",
        keywords: "PRICE, LINK, INFO",
        dmMessage: "Hey there! Glad you're here 😊Tap below and I’ll send you the access in just a moment ✨",
        buttonText: "Send me the access",
        triggerSource: "dm"
      },
      {
        id: "link_delivery",
        name: "AUTOMATE COMMENT ON REEL/POST",
        icon: <Zap className="w-6 h-6" />,
        color: "blue",
        description: "Automatically send links in DM when users comment specific keywords.",
        keywords: "LINK, SEND, PRICE",
        commentReply: "Check your DM 👇",
        dmMessage: "Hey! Glad you're interested 👋Tap below and I’ll send you the link right away ✨",
        buttonText: "Send me the link",
        isPopular: true
      },
      {
        id: "lead_capture",
        name: "Lead Obtaining Through Reel/Post",
        icon: <Users className="w-6 h-6" />,
        color: "emerald",
        description: "Collect emails directly inside Instagram DMs using automation.",
        keywords: "INFO, JOIN, START",
        commentReply: "Just sent you the details in DM 📩",
        dmMessage: "Hey! Excited to share more details with you.Tap below to get started! 🚀",
        buttonText: "Get Started 🔗",
        collectEmail: true
      },
      {
        id: "follow_unlock",
        name: "Growth Strategy on Reel or Post",
        icon: <Lock className="w-6 h-6" />,
        color: "amber",
        description: "Ask users to follow first before unlocking your content.",
        keywords: "UNLOCK, ACCESS",
        commentReply: "Check your DM to unlock! 🔓",
        dmMessage: "Almost there! 👀Please visit my profile and tap follow to continue 😊",
        buttonText: "Visit Profile",
        requireFollow: true
      },
      {
        id: "story_auto",
        name: "Story Automation",
        icon: <PlayCircle className="w-6 h-6" />,
        color: "pink",
        description: "Automatically send a DM when someone replies to your Instagram Story.",
        triggerSource: "story_reply", 
        dmMessage: "Hey! 👋 Thanks for replying to my story\nTap below and I’ll send you the details ✨",
        buttonText: "Send me the details",
        finalMessage: "Here’s what you were looking for 👇",
        addLinkText: "Click here to see 🔗",
        url: "https://example.com"
      },
      {
        id: "live_auto",
        name: "Automate Comment During Live",
        icon: <Radio className="w-6 h-6" />,
        color: "rose",
        description: "Automatically reply and DM users who comment during your Instagram Live.",
        triggerSource: "live_comment",
        keywords: "ANY",
        replyOnComment: true,
        commentReply: "Check your DM 👀",
        dmMessage: "Hey! 👋 Thanks for joining the live\nTap below and I’ll send you the link 🎯",
        buttonText: "Send me the link",
        finalMessage: "Here’s the link you requested 👇",
        addLinkText: "Access Link here 🔗",
        url: "https://example.com"
      }
    ];

    const handleSelectTemplate = (template: any) => {
      setFormValues({
        name: template.name,
        triggerType: (template.triggerSource === 'dm' || template.triggerSource === 'story_reply') ? 'specific' : 'any',
        triggerSource: template.triggerSource || 'comment',
        keywords: template.keywords || 'LINK, PRICE, INFO',
        replyOnComment: template.replyOnComment !== undefined ? template.replyOnComment : (template.triggerSource === 'comment' || template.triggerSource === 'live_comment'),
        commentReply: template.commentReply || 'Check your DM 👇',
        openingDM: true,
        dmMessage: template.dmMessage,
        buttonText: template.buttonText,
        requireFollow: template.requireFollow || false,
        collectEmail: template.collectEmail || false,
        finalMessage: template.finalMessage || "Hi there!Appreciate your support 🙌As promised, here’s the link for you ⬇️",
        addLinkText: template.addLinkText || '',
        url: template.url || '',
        followUp: false
      });
      if (template.triggerSource === 'dm') setPreviewTab('dm');
      else if (template.triggerSource === 'story_reply') setPreviewTab('story');
      else if (template.triggerSource === 'live_comment') setPreviewTab('live');
      else setPreviewTab('post');
      setView('config');
    };

    const handleChange = (field: string, value: any) => {
      setFormValues(prev => ({ ...prev, [field]: value }));
    };

    const Switch = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
      <div 
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
      >
        <motion.div 
          animate={{ x: checked ? 18 : 2 }}
          initial={false}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
        />
      </div>
    );

    const ProSwitch = () => (
      <div 
        onClick={() => setShowProModal(true)}
        className="w-10 h-6 rounded-full relative cursor-pointer bg-blue-600/40"
      >
        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
      </div>
    );

    if (view === 'grid') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto py-8 px-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Automation Templates</h1>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">Use ready-made automation templates to get started in under 30 seconds. Choose a goal to begin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col group"
              >
                <Card className="p-8 h-full flex flex-col justify-between border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden">
                  {template.isPopular && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20 flex items-center gap-1 uppercase tracking-widest">
                        🔥 Popular
                      </div>
                    </div>
                  )}
                  <div className={`absolute top-0 right-0 w-12 h-12 -mr-6 -mt-6 rounded-full opacity-5 pointer-events-none ${
                    template.color === 'blue' ? 'bg-blue-600' : 
                    template.color === 'emerald' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`} />
                  
                  <div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg ${
                      template.color === 'blue' ? 'bg-blue-50 text-blue-600 shadow-blue-600/10' :
                      template.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-600/10' :
                      'bg-amber-50 text-amber-600 shadow-amber-600/10'
                    }`}>
                      {template.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                      {template.description}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all duration-300 active:scale-95 shadow-lg shadow-slate-900/10"
                  >
                    Use Template
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="pt-12 border-t border-slate-200 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Or start from scratch</p>
            <button 
              onClick={() => setView('config')}
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Custom Workflow
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden animate-in fade-in duration-500 bg-white">
        {/* Top Header Actions */}
        <div className="flex items-center justify-between py-4 px-8 border-b border-slate-100 bg-white z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('grid')}
              className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{formValues.name || 'Custom Automation'}</h1>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Fast Setup System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Save Draft
            </button>
            <button 
              onClick={() => onUseTemplate(formValues)}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform active:scale-95"
            >
              Go Live
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          {/* Left: Interactive Mobile Preview */}
          <div className="flex-1 lg:max-w-[45%] bg-slate-50 flex flex-col items-center justify-center p-8 relative overflow-hidden border-r border-slate-100 h-full">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <div className="absolute top-6 left-8 z-20">
              <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Preview Automation</span>
              </div>
            </div>

            <div className="text-center mb-8 flex flex-col items-center gap-4 z-10">
              {/* Step Selection Tabs */}
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-xl overflow-hidden relative">
                {(formValues.triggerSource === 'story_reply' 
                  ? ['story', 'dm'] 
                  : formValues.triggerSource === 'live_comment'
                    ? ['live', 'dm']
                    : (formValues.triggerSource === 'dm' ? ['dm'] : ['post', 'comment', 'dm'])
                ).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPreviewTab(tab as any)}
                    className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                      previewTab === tab ? "text-white" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab === 'story' && <PlayCircle className="w-3.5 h-3.5" />}
                    {tab === 'live' && <Radio className="w-3.5 h-3.5" />}
                    {tab === 'post' && <LayoutTemplate className="w-3.5 h-3.5" />}
                    {tab === 'comment' && <MessageSquare className="w-3.5 h-3.5" />}
                    {tab === 'dm' && <Send className="w-3.5 h-3.5" />}
                    {tab}
                    {previewTab === tab && (
                      <motion.div 
                        layoutId="active-tab"
                        className="absolute inset-0 bg-blue-600 rounded-xl -z-10 shadow-lg shadow-blue-600/20"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* iPhone Mockup Container - Centered and Sticky on Desktop */}
            <div className="relative sticky top-0 py-4">
              <div className="relative w-[300px] h-[600px] bg-[#000] rounded-[3.5rem] p-3 shadow-2xl ring-1 ring-slate-300/50 scale-90 md:scale-100">
               {/* Phone internal screen */}
               <div className="w-full h-full bg-slate-900 rounded-[2.8rem] overflow-hidden flex flex-col relative border-[2px] border-white/5">
                  {/* Status Bar */}
                  <div className="h-10 px-8 flex items-center justify-between text-white text-[10px] font-bold relative z-20">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-2 bg-white/40 rounded-sm" />
                    </div>
                  </div>

                  {/* View Specific Content */}
                  <div className="flex-1 relative flex flex-col">
                    <AnimatePresence mode="wait">
                      {previewTab === 'live' && (
                        <motion.div 
                          key="live-view"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          className="flex-1 flex flex-col bg-black h-full relative"
                        >
                          {/* Live Media Background */}
                          <div className="absolute inset-0 z-0">
                             <img src="https://picsum.photos/seed/live/400/800?blur=2" alt="Live" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
                          </div>

                          {/* Top Live Bar */}
                          <div className="p-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-full border-2 border-white/20 p-0.5">
                                  <div className="w-full h-full rounded-full bg-slate-800" />
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-white leading-none">dmflow.link</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                     <span className="bg-rose-600 text-[8px] font-black px-1.5 py-0.5 rounded-sm text-white uppercase">Live</span>
                                     <span className="text-[9px] text-white/80 font-bold flex items-center gap-1">
                                        <Users className="w-2.5 h-2.5" /> 1.2K
                                     </span>
                                  </div>
                               </div>
                            </div>
                            <X className="w-5 h-5 text-white/80" />
                          </div>

                          {/* Center Content Placeholder */}
                          <div className="flex-1" />

                          {/* Comments Section */}
                          <div className="px-4 py-2 z-10 space-y-3 max-h-[180px] overflow-hidden flex flex-col justify-end mb-4">
                             <motion.div 
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.5 }}
                               className="flex flex-col gap-1"
                             >
                                <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black text-white shadow-sm">User123</span>
                                   <span className="text-[10px] font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded-full">LINK</span>
                                </div>
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 1.2 }}
                                  className="flex items-center gap-1.5"
                                >
                                   <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                   <span className="text-[9px] font-black text-blue-400 italic">dmflow.link: {formValues.commentReply}</span>
                                </motion.div>
                             </motion.div>

                             <motion.div 
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 2.5 }}
                               className="flex flex-col gap-1"
                             >
                                <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black text-white shadow-sm">Rahul</span>
                                   <span className="text-[10px] font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded-full">price?</span>
                                </div>
                             </motion.div>

                             <motion.div 
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 4.5 }}
                               className="flex flex-col gap-1"
                             >
                                <div className="flex items-center gap-2">
                                   <span className="text-[10px] font-black text-white shadow-sm">Aman</span>
                                   <span className="text-[10px] font-bold text-white/90 bg-white/10 px-2 py-0.5 rounded-full">interested</span>
                                </div>
                             </motion.div>
                          </div>

                          {/* Right Controls */}
                          <div className="absolute right-4 bottom-24 z-10 flex flex-col gap-6">
                             <div className="flex flex-col items-center">
                                <Heart className="w-6 h-6 text-white" />
                                <span className="text-[10px] text-white font-bold">12k</span>
                             </div>
                             <MessageSquare className="w-6 h-6 text-white" />
                             <Send className="w-6 h-6 text-white" />
                          </div>

                          {/* Bottom Input */}
                          <div className="p-4 pb-8 z-10 flex items-center gap-3">
                             <div className="flex-1 h-11 border border-white/20 rounded-full px-5 flex items-center text-white/60 text-[11px] font-bold bg-white/10 backdrop-blur-sm">
                                Add a comment...
                             </div>
                             <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                                <PlusCircle className="w-6 h-6 text-white" />
                             </div>
                          </div>
                        </motion.div>
                      )}

                      {previewTab === 'story' && (
                        <motion.div 
                          key="story-view"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          className="flex-1 flex flex-col bg-black h-full relative"
                        >
                          {/* Top Bar */}
                          <div className="p-4 space-y-3 z-10">
                            <div className="flex gap-1">
                              <div className="h-0.5 flex-1 bg-white/40 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  transition={{ duration: 5, repeat: Infinity }}
                                  className="h-full bg-white"
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/20" />
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-white leading-none">dmflow.link</span>
                                  <span className="text-[9px] text-white/50 font-bold">12h</span>
                                </div>
                              </div>
                              <X className="w-5 h-5 text-white/80" />
                            </div>
                          </div>

                          {/* Center Content */}
                          <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center space-y-4">
                              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto border-2 border-blue-500/30">
                                <PlayCircle className="w-10 h-10 text-blue-500" />
                              </div>
                              <p className="text-white text-base font-black tracking-tight leading-tight px-4 opacity-80">
                                Your automation will work for any story
                              </p>
                            </div>
                          </div>

                          {/* Bottom Bar */}
                          <div className="p-4 pb-8 flex items-center gap-4">
                            <div className="flex-1 h-11 border border-white/30 rounded-full px-5 flex items-center text-white/60 text-xs font-bold bg-white/5">
                              Send message...
                            </div>
                            <Heart className="w-6 h-6 text-white" />
                            <Send className="w-6 h-6 text-white" />
                          </div>
                        </motion.div>
                      )}

                      {previewTab === 'post' && (
                        <motion.div 
                          key="post-view"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          className="flex-1 flex flex-col bg-white h-full"
                        >
                          {/* Top Header */}
                          <div className="p-3 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-100 overflow-hidden">
                                   <img src={`https://picsum.photos/seed/dmflow/100/100`} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-900 leading-none">dmflow.link</span>
                             </div>
                             <MoreHorizontal className="w-4 h-4 text-slate-400" />
                          </div>

                          {/* Post Content */}
                          <div className="w-full aspect-[4/5] bg-slate-100 flex items-center justify-center overflow-hidden">
                             <img src="https://picsum.photos/seed/adventure/600/800" alt="Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>

                          {/* Action Bar */}
                          <div className="p-3 pb-1 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <Heart className="w-5 h-5 text-slate-900" />
                                <MessageSquare className="w-5 h-5 text-slate-900" />
                                <Send className="w-5 h-5 text-slate-900" />
                             </div>
                             <Bookmark className="w-5 h-5 text-slate-900" />
                          </div>

                          {/* Caption Section */}
                          <div className="px-3 py-1 space-y-1">
                             <div className="text-[11px] text-slate-900">
                                <span className="font-bold mr-1.5">dmflow.link</span>
                                {formValues.triggerSource === 'comment' ? `Want the hidden link? Just comment ${formValues.keywords.split(',')[0].trim()} below! 🔗` : "Check out our latest update! 👇"}
                             </div>
                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight py-1">View all 12 comments</div>
                          </div>

                          {/* Realistic Comment Section */}
                          <div className="flex-1 px-3 mt-1 space-y-2.5 overflow-hidden">
                             <div className="flex gap-2">
                                <span className="text-[10px] font-bold text-slate-900">rahul_dev</span>
                                <span className="text-[10px] text-slate-800">{(formValues.keywords.split(',')[0] || "INFO").trim()}</span>
                             </div>
                             <div className="flex gap-2">
                                <span className="text-[10px] font-bold text-slate-900">aman_ux</span>
                                <span className="text-[10px] text-slate-800">price?</span>
                             </div>

                             {/* Automation Trigger Animation */}
                             <motion.div 
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: 1 }}
                               className="flex flex-col gap-1.5"
                             >
                                <div className="flex gap-2 relative">
                                  <span className="text-[10px] font-bold text-slate-900">instagram_user</span>
                                  <span className="text-[10px] text-slate-800 font-bold">{(formValues.keywords.split(',')[0] || "INFO").trim()}</span>
                                  
                                  {/* Subtle Highlight */}
                                  <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0.4, 0] }}
                                    transition={{ delay: 1.5, duration: 0.8 }}
                                    className="absolute inset-x-0 -mx-1 -my-0.5 bg-blue-100/50 rounded pointer-events-none"
                                  />
                                </div>

                                {/* Auto Reply Sub-comment */}
                                {formValues.replyOnComment && (
                                  <motion.div 
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 2.2 }}
                                    className="ml-5 flex items-center gap-1.5"
                                  >
                                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                     <p className="text-[9px] text-blue-600 font-bold italic bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                       dmflow.link: {formValues.commentReply}
                                     </p>
                                  </motion.div>
                                )}
                             </motion.div>
                          </div>
                        </motion.div>
                      )}

                      {previewTab === 'comment' && (
                        <motion.div 
                          key="comment-view"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex-1 bg-white h-full flex flex-col"
                        >
                          <div className="p-4 border-b border-slate-100 flex items-center justify-center relative">
                            <span className="text-[13px] font-bold text-slate-900">Comments</span>
                          </div>
                          
                          <div className="flex-1 p-4 space-y-6">
                            {/* User Comment */}
                            <div className="flex gap-3">
                               <div className="w-8 h-8 rounded-full bg-slate-200" />
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-900">instagram_user</span>
                                    <span className="text-[10px] text-slate-400">1m</span>
                                  </div>
                                  <p className="text-xs text-slate-800 font-bold bg-slate-50 px-3 py-2 rounded-2xl rounded-tl-none border border-slate-100">
                                    {(formValues.keywords.split(',')[0] || "LINK").trim()}
                                  </p>
                                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">Reply</p>
                               </div>
                            </div>

                            {/* Automation Bot Reply */}
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.8 }}
                              className="flex gap-3 ml-8"
                            >
                               <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-blue-600 p-0.5 shadow-lg shadow-blue-600/10">
                                  <img src="https://picsum.photos/seed/bot/100/100" alt="Bot" className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
                               </div>
                               <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-900">dmflow.ink <span className="text-blue-600 ml-1">Author</span></span>
                                  </div>
                                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: formValues.replyOnComment ? 1 : 0.3 }} className="text-xs text-blue-600 bg-blue-600/5 border border-blue-600/10 px-3 py-2 rounded-2xl rounded-tl-none font-bold italic">
                                    {formValues.commentReply}
                                  </motion.p>
                                  <p className="text-[10px] text-slate-400 font-bold">1m</p>
                               </div>
                            </motion.div>
                          </div>

                          <div className="p-4 bg-slate-50 border-t border-slate-100">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200" />
                                <div className="flex-1 h-8 bg-slate-100 rounded-full border border-slate-200 flex items-center px-4 text-[11px] text-slate-400 italic font-medium">
                                   Add a comment...
                                </div>
                             </div>
                          </div>
                        </motion.div>
                      )}

                      {previewTab === 'dm' && (
                        <motion.div 
                          key="dm-view"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex-1 bg-[#1a1a1b] h-full flex flex-col"
                        >
                          {/* DM Header */}
                          <div className="p-4 border-b border-white/5 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <ChevronRight className="w-5 h-5 text-white rotate-180" />
                               <div className="w-8 h-8 rounded-full bg-slate-600 overflow-hidden border border-white/10">
                                  <img src="https://picsum.photos/seed/bot/100/100" alt="Bot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[12px] font-bold text-white">dmflow.ink</span>
                                  <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-bold italic tracking-wide">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Active now
                                  </span>
                               </div>
                             </div>
                             <div className="flex items-center gap-4">
                               <Phone className="w-4 h-4 text-white hover:text-white/80 transition-colors cursor-pointer" />
                               <Video className="w-5 h-5 text-white hover:text-white/80 transition-colors cursor-pointer" />
                             </div>
                          </div>

                          {/* Messages */}
                          <div 
                            ref={chatContainerRef}
                            className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto max-h-[460px] scroll-smooth"
                          >
                             <AnimatePresence mode="popLayout">
                               {messages.map((msg, index) => {
                                 const isBot = msg.type === 'bot' || msg.type === 'button';
                                 const isUser = msg.type === 'user';
                                 
                                 // Lookahead to see if next message is from same sender for grouping
                                 const nextMsg = messages[index + 1];
                                 const isLastInGroup = !nextMsg || (
                                   (isBot && nextMsg.type !== 'bot' && nextMsg.type !== 'button') ||
                                   (isUser && nextMsg.type !== 'user')
                                 );

                                 return (
                                   <motion.div
                                     key={msg.id}
                                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                     animate={{ opacity: 1, y: 0, scale: 1 }}
                                     transition={{ duration: 0.3 }}
                                     className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} ${isLastInGroup ? 'mb-4' : 'mb-1'}`}
                                   >
                                     {isUser && (
                                       <div className="bg-[#3797f0] text-white px-4 py-2.5 rounded-2xl rounded-br-none text-xs leading-relaxed font-bold shadow-lg shadow-blue-500/10 max-w-[80%] border border-white/5">
                                         {msg.text}
                                       </div>
                                     )}

                                     {(isBot) && (
                                       <div className="flex flex-col gap-1 w-full relative">
                                         <div className="flex gap-2 max-w-[90%] items-end">
                                           {/* DP shown only on last message in bot group */}
                                           <div className="w-6 h-6 shrink-0">
                                             {isLastInGroup && (
                                               <div className="w-6 h-6 rounded-full bg-slate-700 overflow-hidden border border-white/10 shadow-sm">
                                                  <img src="https://picsum.photos/seed/bot/100/100" alt="Bot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                               </div>
                                             )}
                                           </div>
                                           
                                           <div className="flex flex-col gap-1 flex-1">
                                             {msg.type === 'bot' && (
                                               <div className="bg-[#262626] text-white p-3.5 rounded-2xl rounded-bl-none text-sm leading-relaxed font-medium whitespace-pre-line shadow-md border border-white/5 tracking-tight group">
                                                 {msg.text}
                                               </div>
                                             )}

                                             {msg.isFollowLock && (
                                               <div className="flex flex-col gap-2 w-full mt-1">
                                                  <button className="w-full py-2 bg-white/5 text-white/90 border border-white/10 text-[10px] font-bold rounded-lg hover:bg-white/10 transition-colors">
                                                     Visit Profile
                                                  </button>
                                                  <button className="w-full py-2 bg-blue-600 text-white text-[10px] font-extrabold rounded-lg shadow-lg active:scale-95 transition-all">
                                                     I'm following ✅
                                                  </button>
                                               </div>
                                             )}

                                             {msg.hasLink && (
                                               <div className="w-full mt-1">
                                                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black rounded-xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all border border-white/10">
                                                     {msg.linkText}
                                                  </button>
                                               </div>
                                             )}

                                             {msg.type === 'button' && (
                                               <div className="w-full mt-1">
                                                 <button className="w-full py-2.5 bg-blue-600 text-white text-[11px] font-extrabold rounded-xl shadow-lg shadow-blue-600/20 text-center border border-white/5 transition-transform active:scale-95">
                                                    {msg.text}
                                                 </button>
                                               </div>
                                             )}
                                           </div>
                                         </div>
                                       </div>
                                     )}
                                   </motion.div>
                                 );
                               })}
                             </AnimatePresence>
                          </div>

                           {/* Instagram DM Input Bar */}
                           <div className="p-3 bg-[#1a1a1b] border-t border-white/5 flex items-center gap-3">
                              <Camera className="w-6 h-6 text-white" />
                              <div className="flex-1 bg-slate-800/50 border border-white/10 rounded-full px-4 py-2.5 flex items-center justify-between">
                                 <div className="flex items-center gap-1.5 overflow-hidden">
                                   <span className="text-white/40 text-sm font-medium">Message...</span>
                                   <motion.div 
                                     animate={{ opacity: [0, 1, 0] }}
                                     transition={{ repeat: Infinity, duration: 0.8 }}
                                     className="w-0.5 h-4 bg-blue-500"
                                   />
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <Mic className="w-5 h-5 text-white" />
                                    <ImageIcon className="w-5 h-5 text-white" />
                                    <PlusCircle className="w-5 h-5 text-white" />
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
               </div>
            </div>
          </div>

          {/* Hint text bottom */}
            <div className="mt-8 flex items-center gap-2 text-slate-400 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-100 z-10">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Values sync instantly with input</span>
            </div>
          </div>

          {/* Right: Configuration Panel */}
          <div className="flex-1 lg:max-w-[55%] overflow-y-auto p-4 lg:p-10 space-y-8 bg-white h-full order-first lg:order-last border-l border-slate-100 shadow-[inset_10px_0_30px_-15px_rgba(0,0,0,0.02)]">
            <div className="mb-4">
              <h2 className="text-lg font-black text-slate-900 mb-1">Workflow Configuration</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Build your automated experience</p>
            </div>

            {/* 🔹 SECTION 1: TRIGGER */}
            <Card className="p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-6 rounded-[2rem]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-none mb-1">Automation Trigger</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Define how the flow starts</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-50">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">
                  {formValues.triggerSource === 'dm' ? 'When someone DMs you' : 
                   formValues.triggerSource === 'story_reply' ? 'When someone replies to your story' :
                   formValues.triggerSource === 'live_comment' ? 'When someone comments on your LIVE' :
                   'When someone comments on'}
                </h4>
                
                {formValues.triggerSource === 'comment' && (
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-2 p-1 bg-slate-50 rounded-[1.25rem] border border-slate-100/50">
                      {['specific', 'any'].map((type) => (
                        <button
                          key={type}
                          onClick={() => type === 'any' ? handleChange('triggerType', 'any') : handleChange('triggerType', 'specific')}
                          className={`flex-1 py-3 text-[10px] font-bold rounded-xl transition-all uppercase tracking-wider ${
                            formValues.triggerType === type 
                              ? "bg-white text-blue-600 shadow-sm border border-blue-50" 
                              : "text-slate-400 hover:text-slate-500"
                          }`}
                        >
                          {type === 'specific' ? "Specific post" : "Any post"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Comment must contain keywords</p>
                  <input 
                    type="text"
                    value={formValues.keywords}
                    onChange={(e) => handleChange('keywords', e.target.value)}
                    placeholder="Enter keywords (e.g. LINK, PRICE, INFO)"
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold"
                  />
                  <p className="text-[9px] text-slate-400 font-bold italic px-1">Separate keywords with commas</p>
                </div>
              </div>
            </Card>

            {/* 🔹 SECTION 2: COMMENT REPLY */}
            {(formValues.triggerSource === 'comment' || formValues.triggerSource === 'live_comment') && (
              <Card className="p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-6 rounded-[2rem]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 leading-none mb-1">Public Reply</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Automatic comment reply</p>
                    </div>
                  </div>
                  <Switch checked={formValues.replyOnComment} onChange={(v) => handleChange('replyOnComment', v)} />
                </div>
                
                <AnimatePresence>
                  {formValues.replyOnComment && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-3 overflow-hidden">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Reply text</label>
                      <input 
                        type="text"
                        value={formValues.commentReply}
                        onChange={(e) => handleChange('commentReply', e.target.value)}
                        placeholder="Check your DM 👇"
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )}

            {/* 🔹 SECTION 3: THEY GET A DM */}
            <Card className="p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-6 rounded-[2rem]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-none mb-1">Direct Message</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initial DM sent to user</p>
                  </div>
                </div>
                <Switch checked={formValues.openingDM} onChange={(v) => handleChange('openingDM', v)} />
              </div>
              
              <AnimatePresence>
                {formValues.openingDM && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-6 overflow-hidden">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Message Body</label>
                       <textarea 
                        value={formValues.dmMessage}
                        onChange={(e) => handleChange('dmMessage', e.target.value)}
                        placeholder="Hey! Thanks for your interest 👋"
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none min-h-[120px] resize-none font-bold leading-relaxed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Interactive Button Text</label>
                      <input 
                        type="text"
                        value={formValues.buttonText}
                        onChange={(e) => handleChange('buttonText', e.target.value)}
                        placeholder="Send me the link"
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* 🔹 SECTION 5: FINAL RECEIVE */}
            <Card className="p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-6 rounded-[2rem]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-none mb-1">Fulfillment</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">What they receive at the end</p>
                </div>
              </div>
              <div className="space-y-6 pt-2 border-t border-slate-50">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Final Delivery Message</label>
                  <textarea 
                    value={formValues.finalMessage}
                    onChange={(e) => handleChange('finalMessage', e.target.value)}
                    placeholder="Write final message"
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl text-sm border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none min-h-[100px] resize-none font-bold leading-relaxed"
                  />
                </div>
                
                <div className="pt-2">
                  <AnimatePresence mode="wait">
                    {!formValues.url && !showLinkModal ? (
                      <motion.button 
                        key="add-link-btn"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => {
                          setTempLinkData({ label: formValues.addLinkText || 'Get Link', url: formValues.url });
                          setShowLinkModal(true);
                        }}
                        className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 font-black text-xs uppercase tracking-widest hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-3 group"
                      >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Add External Link
                      </motion.button>
                    ) : null}

                    {formValues.url && !showLinkModal ? (
                      <motion.div 
                        key="added-link-state"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50/30 border border-emerald-100 rounded-[1.5rem] p-5 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-sm font-black text-slate-900 leading-none">Link Configured</p>
                               <p className="text-[10px] font-bold text-emerald-600/70 mt-1 uppercase tracking-widest">{formValues.addLinkText || 'Custom Link'}</p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <button 
                              onClick={() => {
                                setTempLinkData({ label: formValues.addLinkText, url: formValues.url });
                                setShowLinkModal(true);
                              }}
                              className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:text-blue-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => {
                                handleChange('addLinkText', '');
                                handleChange('url', '');
                              }}
                              className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] hover:text-rose-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}

                    {showLinkModal && (
                      <motion.div 
                        key="inline-link-config"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xl space-y-6">
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4 text-blue-600" />
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Link Configuration</h4>
                          </div>
                          
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Button Label</label>
                              <input 
                                type="text"
                                value={tempLinkData.label}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTempLinkData(prev => ({ ...prev, label: val }));
                                  handleChange('addLinkText', val);
                                }}
                                placeholder="e.g. Get Link, Download Now"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Destination URL</label>
                              <input 
                                type="text"
                                value={tempLinkData.url}
                                onChange={(e) => setTempLinkData(prev => ({ ...prev, url: e.target.value }))}
                                placeholder="https://example.com"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold"
                              />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                              <button 
                                onClick={() => {
                                  if (!formValues.url) handleChange('addLinkText', '');
                                  setShowLinkModal(false);
                                }}
                                className="px-5 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => {
                                  handleChange('addLinkText', tempLinkData.label);
                                  handleChange('url', tempLinkData.url || '#');
                                  setShowLinkModal(false);
                                }}
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 transition-all active:scale-95"
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </Card>

            {/* 🔹 SECTION 6: FOLLOW-UP (PRO) */}
            <Card className="p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-6 rounded-[2rem]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-none mb-1">Follow-up Sequence</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Advanced retention tools</p>
                  </div>
                </div>
                <ProSwitch />
              </div>
              <p className="text-[10px] text-slate-400 px-1 font-bold italic">Automatically follow up if they haven't clicked or converted</p>
            </Card>

            {/* Spacer for bottom */}
            <div className="h-20" />
          </div>
        </div>
      </div>
    );
  }

const renderPage = () => {
    switch (activePage) {
      case 'account-settings': return <AccountSettingsPage profile={profile} igProfile={igProfile} usage={usage} currentPlanLimits={currentPlanLimits} onInstagramConnect={onInstagramConnect || handleConnect} onDisconnect={handleDisconnect} onUpgrade={setShowPricingModal} isLoading={isLoading} />;
      case 'home': return <HomePage profile={profile} igProfile={igProfile} igStats={igStats} onInstagramConnect={onInstagramConnect} onDisconnect={handleDisconnect} />;
      case 'inbox': return <InboxPage />;
      case 'automations': return <AutomationsPage userId={profile?.id || ''} setActivePage={setActivePage} />;
      case 'growth-lock': return <GrowthLockPage />;
      case 'analytics': return <AnalyticsPage userId={profile?.id || ''} />;
      case 'contacts': return <ContactsPage userId={profile?.id || ''} />;
      case 'refer-earn': return <ReferEarnPage />;
      case 'ai': return <AIAssistant igProfile={igProfile} igStats={igStats} usage={usage} stats={stats} chartData={chartData} />;
      case 'templates': return <TemplatesPage onUseTemplate={(template) => {
        localStorage.setItem("selectedTemplate", JSON.stringify(template));
        setActivePage('automations');
      }} />;
      default: return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
          <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
          <h2 className="text-xl font-bold">Page Under Construction</h2>
          <p className="text-sm">We're working hard to bring you the {activePage} features.</p>
        </div>
      );
    }
  };

  const handleUpgradeLimit = (plan: string) => {
    if (profile) {
      setProfile({ ...profile, plan });
      setShowPricingModal(false);
    }
  };

  const currentPlanLimits = PLAN_LIMITS[profile?.plan || 'Free'];
  const dmPercentage = (usage.dmsSent / currentPlanLimits.dms) * 100;
  const accountsPercentage = (usage.accountsUsed / currentPlanLimits.accounts) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Sidebar Overlay - Only for very small screens if needed, but user said remove blur completely */}
      {/* Keeping a simple mobile overlay but ensure it doesn't affect desktop */}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarCollapsed ? 68 : 240,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{ willChange: "width" }}
        className={`sticky top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-[70] shrink-0 ${
          typeof window !== 'undefined' && window.innerWidth < 768 && !isMobileSidebarOpen ? '-ml-[240px]' : 'ml-0'
        } ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'fixed inset-y-0 z-[80]' : ''}`}
      >
        {/* Logo Section */}
        <div className={`h-16 flex items-center px-4 shrink-0 ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold tracking-tight">DMflow</span>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button 
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Workspace Switcher - Simplified Display */}
        <div className="px-3 mb-4">
          <div className="w-full flex items-center p-2 rounded-xl border border-slate-100 bg-white transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} shadow-sm">
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 font-bold text-[10px] overflow-hidden">
                {profile?.avatar_url || igProfile?.profile_picture_url ? (
                  <img src={profile?.avatar_url || igProfile?.profile_picture_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  (profile?.email?.charAt(0) || profile?.name?.charAt(0) || 'D').toUpperCase()
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0 animate-in fade-in slide-in-from-left-1 duration-150 ease-out">
                  <div className="text-[11px] font-bold text-slate-900 truncate">
                    DMFlow Workspace
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium leading-none">{profile?.plan || 'Free'} Plan</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Automation Button */}
        <div className="px-3 mb-6">
          <button 
            onClick={() => { setActivePage('automations'); setIsMobileSidebarOpen(false); }}
            className={`flex items-center justify-center bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:scale-[1.02] hover:shadow-xl transition-all active:scale-95 group ${isSidebarCollapsed ? 'w-10 h-10 mx-auto' : 'w-full py-3 gap-2'}`}
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 shrink-0" />
            {!isSidebarCollapsed && <span className="font-bold text-sm animate-in fade-in slide-in-from-left-1 duration-150 ease-out">New Automation</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-4 px-2 overflow-y-auto custom-scrollbar pb-8">
          <NavContent />
        </nav>

        {/* Bottom Area Support */}
        <div className={`p-3 border-t border-slate-50 shrink-0 bg-white`}>
           {isSidebarCollapsed ? (
             <div className="flex flex-col items-center gap-4 py-2">
               <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer group" title="DMs Usage">
                 <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
               </div>
               <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer group" title="Instagram Accounts">
                 <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
               </div>
               <button 
                 onClick={() => setShowPricingModal(true)}
                 className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 hover:scale-110 transition-all active:scale-95 group"
                 title="Upgrade Plan"
               >
                 <Rocket className="w-4 h-4 group-hover:animate-bounce" />
               </button>
             </div>
           ) : (
             <div className="space-y-4">
               {/* Usage Section */}
               <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                 <div className="space-y-2">
                   <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                     <span>DMs Sent</span>
                     <span>{usage.dmsSent} / {currentPlanLimits.dms}</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${dmPercentage}%` }}
                        className="h-full bg-blue-600 rounded-full"
                     />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                     <span>IG Accounts</span>
                     <span>{usage.accountsUsed} / {currentPlanLimits.accounts}</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${accountsPercentage}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                     />
                   </div>
                 </div>
                 <button 
                  onClick={() => setShowPricingModal(true)}
                  className="w-full mt-2 py-2.5 bg-white border border-blue-100 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
                 >
                   Upgrade Plan
                   <Rocket className="w-3.5 h-3.5 group-hover:animate-bounce transition-transform" />
                 </button>
               </div>
             </div>
           )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-slate-50">
        {/* Mobile Header (only if sidebar hidden on mobile) */}
        {typeof window !== 'undefined' && window.innerWidth < 768 && (
          <div className="h-14 bg-white border-b flex items-center px-4 md:hidden">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <span className="ml-3 font-bold">DMFlow</span>
          </div>
        )}
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 sticky top-0 z-30">
          <button 
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsMobileSidebarOpen(true);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors shrink-0"
          >
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>

      {/* Pricing Modal */}
      <AnimatePresence>
        {showPricingModal && (
          <PricingModal 
            isOpen={showPricingModal} 
            onClose={() => setShowPricingModal(false)}
            currentPlan={profile?.plan || 'Free'}
            onUpgrade={handleUpgradeLimit}
          />
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettingsPanel && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsPanel(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[100]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[420px] bg-white border-l border-slate-200 z-[101] shadow-2xl flex flex-col"
            >
               {/* Settings Header */}
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Settings className="w-5 h-5 text-slate-900" />
                     </div>
                     <h2 className="text-lg font-bold text-slate-900">Settings</h2>
                  </div>
                  <button 
                    onClick={() => setShowSettingsPanel(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
               </div>

               {/* Settings Scrollable Content */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                  {/* Profile Section */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                     <div className="flex items-center gap-2 mb-1">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Profile</h3>
                     </div>
                     <div className="flex items-center gap-4 py-2">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 shadow-sm">
                           {profile?.avatar_url || igProfile?.profile_picture_url ? (
                              <img src={profile?.avatar_url || igProfile?.profile_picture_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           ) : (
                              (profile?.email?.charAt(0) || profile?.name?.charAt(0) || 'U').toUpperCase()
                           )}
                        </div>
                        <div className="min-w-0">
                           <div className="text-sm font-bold text-slate-900 truncate">{igProfile?.username ? `@${igProfile.username}` : (profile?.name || "User")}</div>
                           <div className="text-xs text-slate-500 truncate">{profile?.email}</div>
                        </div>
                     </div>
                     <div className="space-y-5 pt-2 border-t border-slate-50">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                           <input 
                              type="text" 
                              defaultValue={profile?.name || ""}
                              className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 outline-none transition-all font-medium"
                              placeholder="Your Name"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Instagram Section */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                     <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                           <Instagram className="w-4 h-4 text-slate-400" />
                           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Instagram</h3>
                        </div>
                        {isConnected ? (
                           <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                              🟢 Connected
                           </span>
                        ) : (
                           <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-widest">
                              🔴 Not Connected
                           </span>
                        )}
                     </div>
                     
                     {isConnected && igProfile ? (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                           <img src={profile?.avatar_url || igProfile.profile_picture_url} alt="IG" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                           <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-slate-900 truncate">@{igProfile.username}</div>
                              <div className="text-[10px] text-slate-500 uppercase font-bold">{igProfile.account_type || "Creator"} Account</div>
                           </div>
                           <button 
                             onClick={handleDisconnect}
                             className="text-[10px] font-bold text-rose-600 hover:bg-rose-100/50 px-3 py-2 rounded-lg transition-colors uppercase tracking-widest border border-rose-200"
                           >
                             Disconnect
                           </button>
                        </div>
                     ) : (
                        <button 
                          onClick={handleConnect}
                          className="w-full p-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                          <Instagram className="w-4 h-4" /> Connect Instagram
                        </button>
                     )}

                     {/* Pro Locked Feature */}
                     <div className="pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between opacity-60">
                           <div className="flex items-center gap-2">
                              <div className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[9px] font-black rounded border border-amber-200 uppercase">PRO</div>
                              <span className="text-sm font-bold text-slate-700">Add another Instagram account</span>
                           </div>
                           <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-not-allowed">
                              <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full" />
                           </div>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium px-1">Available in Pro plan</p>
                     </div>
                  </div>

                  {/* Notifications Section */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                     <div className="flex items-center gap-2 mb-1">
                        <Bell className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Notifications</h3>
                     </div>
                     <div className="space-y-5">
                        {[
                           { label: "New Lead Alert", active: true },
                           { label: "Link Click Alert", active: true },
                           { label: "Automation Failed Alert", active: true },
                           { label: "Weekly Summary", active: false },
                        ].map((item, idx) => (
                           <div key={idx} className="flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-800">{item.label}</span>
                              <button 
                                className={`w-11 h-6 rounded-full transition-colors relative ${item.active ? 'bg-blue-600' : 'bg-slate-200'}`}
                              >
                                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.active ? 'left-6' : 'left-1'}`} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Usage Section */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                     <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Usage</h3>
                     </div>
                     <div className="space-y-5">
                        <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                           <span className="text-xs font-bold text-slate-600">Current Plan</span>
                           <span className="font-black text-blue-600 uppercase bg-blue-100 px-3 py-1 rounded-full text-[10px] tracking-widest shadow-sm">
                              {profile?.plan || "Free"}
                           </span>
                        </div>
                        <div className="space-y-3">
                           <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                              <span className="text-slate-500">Contacts Used</span>
                              <span className="text-slate-900">120 / 1,000</span>
                           </div>
                           <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full w-[12%] shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all duration-1000" />
                           </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                           <span className="text-slate-500">Messages Sent</span>
                           <span className="text-slate-900">540</span>
                        </div>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                           Upgrade Plan
                        </button>
                     </div>
                  </div>

                  {/* Help Section */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                     <div className="flex items-center gap-2 mb-1">
                        <Plus className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Help</h3>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        {["Getting Started", "Common Issues", "How it Works", "Contact Support"].map(item => (
                           <button 
                             key={item} 
                             className="p-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black text-center hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/5 transition-all border border-slate-100 uppercase tracking-tight leading-none h-16 flex items-center justify-center italic"
                           >
                              {item}
                           </button>
                        ))}
                     </div>
                     <div className="pt-5 border-t border-slate-100 text-center space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Still need help?</p>
                        <p className="text-sm font-black text-blue-600 bg-blue-50 py-3 rounded-xl border border-blue-100">dmflowautomation@gmail.com</p>
                     </div>
                  </div>

                  {/* Logout Action */}
                  <div className="pt-4">
                     <button 
                       onClick={() => setShowLogoutModal(true)}
                       className="w-full py-4 border-2 border-rose-100 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                     >
                        <LogOut className="w-4 h-4" /> Logout Account
                     </button>
                  </div>

                  <div className="pb-10" />
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-200/20 backdrop-blur-[4px] border border-white/10"
              onClick={() => {
                setShowLogoutModal(false);
                setLogoutReason(null);
                setLogoutCustomReason("");
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="relative w-[92vw] max-w-[540px] bg-white border border-slate-100 rounded-[2.8rem] shadow-[0_48px_80px_-16px_rgba(0,0,0,0.12)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-rose-50/30 to-transparent -z-0" />
              
              <div className="relative p-10 sm:p-12 flex flex-col items-center z-10">
                {/* Header Section */}
                <div className="relative mb-8">
                  <div className="w-22 h-22 rounded-[2.2rem] bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-xl shadow-rose-500/25 transform -rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105">
                    <LogOut className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-4 border-white shadow-sm" />
                  <div className="absolute top-8 -left-5 w-4 h-4 bg-pink-300 rounded-full border-2 border-white opacity-40" />
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">Leaving already? 👋</h3>
                <p className="text-[15px] font-semibold text-slate-500 text-center leading-relaxed max-w-[320px]">
                  Your data remains safe and secure. We’ll save your automations and connected accounts.
                </p>

                {/* Reason Selection Grid */}
                <div className="w-full mt-10 space-y-5">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] pl-1">Why are you logging out?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "connection", label: "Connection issues" },
                      { id: "another", label: "Using another account" },
                      { id: "testing", label: "Just testing DMFlow" },
                      { id: "break", label: "Taking a break" },
                      { id: "privacy", label: "Privacy concerns" },
                      { id: "other", label: "Other reason" }
                    ].map((reason) => (
                      <button
                        key={reason.id}
                        onClick={() => setLogoutReason(reason.id)}
                        className={`group relative p-5 rounded-[1.25rem] border text-left transition-all duration-300 ${
                          logoutReason === reason.id 
                          ? 'bg-rose-50/50 border-rose-500/20 ring-4 ring-rose-500/5 shadow-lg shadow-rose-100/30' 
                          : 'bg-slate-50/50 border-slate-100/80 hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/30 hover:-translate-y-0.5'
                        }`}
                      >
                        <span className={`text-[12px] font-black uppercase tracking-tight transition-colors ${
                          logoutReason === reason.id ? 'text-rose-600' : 'text-slate-500 group-hover:text-slate-900'
                        }`}>
                          {reason.label}
                        </span>
                        {logoutReason === reason.id && (
                          <div className="absolute top-3 right-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Animated Textarea for "Other" */}
                  <AnimatePresence>
                    {logoutReason === "other" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, scale: 0.95 }}
                        animate={{ height: "auto", opacity: 1, scale: 1 }}
                        exit={{ height: 0, opacity: 0, scale: 0.95 }}
                        className="overflow-hidden"
                      >
                        <textarea
                          placeholder="Tell us what happened…"
                          value={logoutCustomReason}
                          onChange={(e) => setLogoutCustomReason(e.target.value)}
                          className="w-full h-28 bg-slate-50 border border-slate-100 rounded-[1.25rem] p-5 mt-2 text-[13px] font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 transition-all resize-none placeholder:text-slate-300"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action Buttons */}
                <div className="w-full mt-12 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <button 
                      onClick={() => {
                        setShowLogoutModal(false);
                        setLogoutReason(null);
                        setLogoutCustomReason("");
                      }}
                      className="py-5 bg-slate-50/80 border border-slate-100 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] hover:bg-white hover:text-slate-900 hover:shadow-xl hover:shadow-slate-200/40 transition-all active:scale-[0.97]"
                    >
                      Keep Working
                    </button>
                    <button 
                      onClick={handleLogoutAction}
                      className="py-5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] shadow-2xl shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-[1.02] transition-all active:scale-[0.97]"
                    >
                      Logout Anyway
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between px-3 pt-3 border-t border-slate-50">
                    <p className="text-[11px] font-bold text-slate-400">
                      Your data remains <span className="text-slate-900">safe and secure.</span>
                    </p>
                    {isConnected && igProfile && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                        <Instagram className="w-3 h-3 text-rose-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">@{igProfile.username}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connect Modal */}
      <AnimatePresence>
        {showConnectModal && !isConnected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowConnectModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Instagram className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Connect Your Instagram Account</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-10">
                To start using DMflow automation you must connect your Instagram business account via Meta.
              </p>
              
              <div className="space-y-4">
                <button 
                  onClick={handleConnect}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-transform active:scale-95"
                >
                  <Instagram className="w-5 h-5" />
                  Connect with Instagram
                </button>
                <button 
                  onClick={() => setShowConnectModal(false)}
                  className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl font-bold hover:bg-slate-100 transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-6 opacity-40">
                <div className="text-[10px] font-bold uppercase tracking-widest">Meta Business Partner</div>
                <div className="text-[10px] font-bold uppercase tracking-widest">Secure OAuth 2.0</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {isConnected && showConnectModal && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 font-bold"
          >
            <CheckCircle2 className="w-6 h-6" />
            Instagram Connected Successfully!
            <button 
              onClick={() => setShowConnectModal(false)}
              className="ml-4 px-4 py-1.5 bg-white/20 rounded-lg text-xs hover:bg-white/30 transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
