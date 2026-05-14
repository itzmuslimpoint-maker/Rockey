import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Instagram,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  BarChart3,
  Eye,
  Send,
  AlertCircle,
  Zap,
} from "lucide-react";

interface IGPreview {
  id?: string;
  username: string;
  full_name?: string;
  profile_pic_url?: string;
  follower_count?: number;
  media_count?: number;
  is_business?: boolean;
  is_private?: boolean;
}

interface Props {
  onBack: () => void;
  onSwitchToFacebook: () => void;
  /**
   * Called once the user clicks "Sign in as @username" on step 2.
   * It should kick off the OAuth redirect (we do it from App.tsx so we
   * already have the supabase userId at hand).
   */
  onAuthorize: (username: string) => Promise<void>;
}

type Step = "search" | "found" | "authorize";

export default function InstagramQuickConnect({
  onBack,
  onSwitchToFacebook,
  onAuthorize,
}: Props) {
  const [step, setStep] = useState<Step>("search");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<IGPreview | null>(null);
  const [authorizing, setAuthorizing] = useState(false);

  // ── Step 1 → Step 2: search username ────────────────────────────────
  const handleFind = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!username.trim()) {
      setError("Please enter your Instagram username.");
      return;
    }
    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const clean = username.trim().replace(/^@/, "");
      const r = await fetch(
        `/api/instagram/lookup?username=${encodeURIComponent(clean)}`
      );
      const data = await r.json();
      if (!r.ok) {
        throw new Error(
          data.error || "Couldn't find that account. Check the username."
        );
      }
      setPreview(data);
      setUsername(clean);
      setStep("found");
    } catch (e: any) {
      setError(e.message || "Lookup failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 → Step 3: kick off OAuth ─────────────────────────────────
  const handleAuthorize = async () => {
    if (!preview) return;
    setAuthorizing(true);
    setStep("authorize");
    try {
      // Show the "preparing permissions" screen for ~800ms so the user
      // sees what's happening, then App.tsx will redirect to Meta.
      await new Promise((res) => setTimeout(res, 800));
      await onAuthorize(preview.username);
    } catch (e: any) {
      setError(e.message || "Authorization failed.");
      setStep("found");
    } finally {
      setAuthorizing(false);
    }
  };

  // ── Step indicator ──────────────────────────────────────────────────
  const StepDots = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {(["search", "found", "authorize"] as Step[]).map((s, i) => {
        const isActive = step === s;
        const isPast =
          (step === "found" && i === 0) ||
          (step === "authorize" && i < 2);
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-2 transition-all rounded-full ${
                isActive
                  ? "w-10 bg-gradient-to-r from-pink-500 to-orange-400"
                  : isPast
                  ? "w-2 bg-pink-500"
                  : "w-2 bg-slate-200"
              }`}
            />
            {i < 2 && <span className="w-2" />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        {/* Back link */}
        <button
          onClick={onBack}
          className="mb-6 text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-2 text-sm font-bold group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 md:p-10 text-center border-b border-slate-50">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-pink-500/30">
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              {step === "search" && "Connect your Instagram"}
              {step === "found" && "Found your account"}
              {step === "authorize" && "Almost there..."}
            </h1>
            <p className="text-slate-500 font-medium text-sm md:text-base">
              {step === "search" &&
                "Enter your Instagram username to get started"}
              {step === "found" && "Confirm this is your account to continue"}
              {step === "authorize" &&
                "Redirecting to Instagram for secure authorization"}
            </p>
          </div>

          {/* Step indicator */}
          <div className="pt-6">
            <StepDots />
          </div>

          {/* Step content */}
          <div className="px-8 md:px-10 pb-10">
            <AnimatePresence mode="wait">
              {step === "search" && (
                <motion.form
                  key="search"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleFind}
                  className="space-y-5"
                >
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                      Your Instagram username
                    </span>
                    <div className="relative mt-2">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        @
                      </span>
                      <input
                        autoFocus
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value.replace(/^@/, ""));
                          setError(null);
                        }}
                        placeholder="your_username"
                        className="w-full py-4 pl-11 pr-4 rounded-2xl bg-white border-2 border-pink-200 focus:border-pink-500 outline-none text-slate-900 font-medium transition-all shadow-sm focus:shadow-pink-500/10"
                      />
                    </div>
                  </label>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !username.trim()}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Find account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onSwitchToFacebook}
                    className="w-full text-center text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    Prefer to connect with Facebook? →
                  </button>
                </motion.form>
              )}

              {step === "found" && preview && (
                <motion.div
                  key="found"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  {/* Account-found card */}
                  <div className="p-5 rounded-3xl border-2 border-emerald-200 bg-emerald-50/40 shadow-lg shadow-emerald-500/5">
                    <div className="flex items-center gap-2 mb-4 text-emerald-600 text-xs font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      Account found
                    </div>
                    <div className="flex items-center gap-4">
                      {preview.profile_pic_url ? (
                        <img
                          src={preview.profile_pic_url}
                          referrerPolicy="no-referrer"
                          alt={preview.username}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white font-black text-xl shadow-md">
                          {preview.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-slate-900 truncate">
                          {preview.full_name || preview.username}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">
                          @{preview.username}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                          {preview.follower_count !== undefined && (
                            <>
                              {Intl.NumberFormat("en", {
                                notation: "compact",
                                maximumFractionDigits: 1,
                              }).format(preview.follower_count)}{" "}
                              followers
                            </>
                          )}
                          {preview.media_count !== undefined && (
                            <>
                              {preview.follower_count !== undefined && " · "}
                              {preview.media_count} posts
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* What we'll do (preview of permissions) */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-3">
                      DMflow will be able to
                    </h4>
                    <PermRow
                      icon={<Eye className="w-4 h-4" />}
                      text="View profile and access media"
                      required
                    />
                    <PermRow
                      icon={<MessageCircle className="w-4 h-4" />}
                      text="Access and manage comments"
                    />
                    <PermRow
                      icon={<Send className="w-4 h-4" />}
                      text="Access and manage messages"
                    />
                    <PermRow
                      icon={<Zap className="w-4 h-4" />}
                      text="Access and publish content"
                    />
                    <PermRow
                      icon={<BarChart3 className="w-4 h-4" />}
                      text="Access and manage insights"
                    />
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleAuthorize}
                    disabled={authorizing}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-orange-400 text-white rounded-2xl font-bold text-base hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-xl shadow-pink-500/20"
                  >
                    <Instagram className="w-5 h-5" />
                    Sign in as @{preview.username}
                  </button>

                  <button
                    onClick={() => {
                      setStep("search");
                      setPreview(null);
                    }}
                    className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    That's not me, search again
                  </button>
                </motion.div>
              )}

              {step === "authorize" && (
                <motion.div
                  key="authorize"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="py-6 flex flex-col items-center text-center"
                >
                  <div className="relative w-20 h-20 mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.4,
                        ease: "linear",
                      }}
                      className="absolute inset-0 border-[3px] border-pink-500 border-t-transparent rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Instagram className="w-8 h-8 text-pink-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Redirecting to Instagram
                  </h3>
                  <p className="text-sm text-slate-500 font-medium max-w-xs">
                    You'll be asked to allow DMflow to access your account. We
                    only request what's needed for automation.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Secure Meta-approved OAuth
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PermRow({
  icon,
  text,
  required,
}: {
  icon: React.ReactNode;
  text: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-pink-500 shrink-0 shadow-sm">
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-700 flex-1">{text}</span>
      {required && (
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
          Required
        </span>
      )}
    </div>
  );
}
