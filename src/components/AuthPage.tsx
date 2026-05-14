import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  ArrowLeft, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2
} from "lucide-react";
import { supabase } from "../supabaseClient";

export default function AuthPage({ onBack, onLogin, onInstagramLogin }: { onBack: () => void, onLogin: () => void, onInstagramLogin: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [resending, setResending] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccessMessage(null);
    setVerificationRequired(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInstagramConnect = () => {
    const clientId = "1844470952801824";
    const redirectUri = "https://dmflow.site/auth/instagram/callback";
    const scopes = "instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement";
    const responseType = "code";
    
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=${responseType}`;
    
    window.location.href = authUrl;
  };

  const handleResendVerification = async () => {
    setResending(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      setSuccessMessage("Verification email has been resent. Please check your inbox.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        
        // Create user record in our users table
        if (data.user) {
          const { error: dbError } = await supabase
            .from('users')
            .insert([
              { 
                id: data.user.id, 
                email: data.user.email, 
                name: name,
                instagram_connected: false,
                plan: 'free'
              }
            ]);
          if (dbError) console.error("Error creating user record:", dbError);
        }
        
        // Always sign out to ensure they can't access features before verification
        await supabase.auth.signOut();
        
        setVerificationRequired(true);
        setSuccessMessage("Your account has been created. Please check your email and verify your address before logging in.");
        setLoading(false);
        return;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user && !data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          setVerificationRequired(true);
          setError("Please verify your email address before logging in.");
          setLoading(false);
          return;
        }

        if (data.session) {
          onLogin();
        } else {
          setError("Session could not be established. Please try again.");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Right Side (Form) - Appears first on mobile */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-slate-50/50 order-1 md:order-2">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px]"
        >
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="mb-8 text-slate-400 hover:text-brand-primary transition-colors flex items-center gap-2 text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </button>

          {/* Form Card */}
          <div className="bg-white p-8 md:p-10 rounded-[14px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
            {/* Logo for Mobile/Form Top */}
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <Zap className="w-7 h-7 text-white fill-white" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">
                {verificationRequired ? 'Verify your email' : (mode === 'login' ? 'Welcome back' : 'Create your account')}
              </h2>
              <p className="text-slate-500 text-sm">
                {verificationRequired 
                  ? `We've sent a link to ${email}. Please check your inbox and spam folder.` 
                  : (mode === 'login' ? 'Enter your details to access your dashboard' : 'Start automating your Instagram growth today')}
              </p>
            </div>

            {verificationRequired ? (
              <div className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium text-center">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-medium text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {successMessage}
                  </div>
                )}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <Mail className="w-12 h-12 text-brand-primary mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-slate-600 mb-6">
                    Check your inbox and click the verification link to activate your account.
                  </p>
                  <button 
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="w-full py-3.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Resend Verification Email"}
                  </button>
                </div>
                <button 
                  onClick={() => {
                    setVerificationRequired(false);
                    setMode('login');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Back to Log In
                </button>
              </div>
            ) : (
              <>
                {/* Social Logins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button 
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button 
                onClick={handleInstagramConnect}
                className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all group"
              >
                <svg className="w-5 h-5 text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-400 bg-white px-4">
                or continue with email
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium text-center">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-medium text-center">
                  {successMessage}
                </div>
              )}

              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe" 
                        className="w-full py-3.5 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-sm transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="w-full py-3.5 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full py-3.5 pl-11 pr-12 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-sm transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-bold text-base hover:shadow-lg hover:shadow-brand-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all mt-4 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {mode === 'login' ? 'Log In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {mode === 'login' && (
                <div className="text-center">
                  <button type="button" className="text-xs font-semibold text-slate-400 hover:text-brand-primary transition-colors">
                    Forgot Password?
                  </button>
                </div>
              )}
            </form>
          </>
        )}

        {/* Toggle Mode */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button 
                  onClick={toggleMode}
                  className="text-brand-primary font-bold hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </div>

          {/* Security Trust Line */}
          <p className="text-center mt-8 text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <Lock className="w-3 h-3" />
            Secure authentication powered by industry-standard encryption.
          </p>
        </motion.div>
      </div>

      {/* Left Side (Branding) - Appears second on mobile */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-brand-primary to-brand-secondary p-12 md:p-24 flex flex-col justify-between text-white order-2 md:order-1 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-accent/20 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
              <Zap className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight font-display">DMflow</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
              Automate Your Instagram Growth
            </h1>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">
              DMflow helps creators automatically turn Instagram comments and DMs into leads.
            </p>

            <ul className="space-y-5">
              {[
                "Automate Instagram DM replies",
                "Turn followers into leads",
                "Save hours of manual messaging"
              ].map((item, i) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center gap-3 text-white/90 font-medium"
                >
                  <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
          <p className="text-sm font-medium text-white/60 flex items-center gap-2">
            <span className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <img 
                  key={i}
                  src={`https://picsum.photos/seed/user${i}/32/32`} 
                  alt="User" 
                  className="w-6 h-6 rounded-full border-2 border-brand-primary"
                  referrerPolicy="no-referrer"
                />
              ))}
            </span>
            Trusted by creators worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
