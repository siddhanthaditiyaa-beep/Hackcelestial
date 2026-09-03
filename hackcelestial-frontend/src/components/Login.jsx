import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Mail, Sparkles, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { HERO_IMAGE } from "../utils/bookingImages";

export default function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearError = () => setError("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (e) {
      if (e.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.");
      } else if (e.code === "auth/unauthorized-domain") {
        setError("This domain isn't authorized in Firebase. Add it under Authentication → Settings → Authorized domains.");
      } else {
        setError(e.message || "Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(name.trim(), email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (e) {
      const map = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Invalid email address.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/invalid-credential": "Invalid email or password.",
      };
      setError(map[e.code] || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithEmail("demo@recoup.travel", "hackcelestial2024");
    } catch {
      // Demo account might not exist yet — create it
      try {
        await signUpWithEmail("Demo Traveler", "demo@recoup.travel", "hackcelestial2024");
      } catch (e2) {
        setError("Demo login failed. Please use Google or create an account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(255,79,94,0.1) 100%)" }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-coral via-amber to-teal" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-7">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-coral to-pink flex items-center justify-center shadow-lg mb-4">
                <span className="text-white font-display font-black text-2xl">R</span>
              </div>
              <h1 className="font-display font-extrabold text-slate-900 dark:text-white text-2xl tracking-tight">
                {mode === "login" ? "Welcome back" : "Join Recoup"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-1">
                {mode === "login"
                  ? "Your AI travel copilot is waiting."
                  : "Start planning smarter trips today."}
              </p>
            </div>

            {/* Mode tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 mb-6">
              {[["login", "Sign In"], ["signup", "Sign Up"]].map(([m, label]) => (
                <button key={m} type="button"
                  onClick={() => { setMode(m); clearError(); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    mode === m
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Google Sign In */}
            <button type="button" onClick={handleGoogleLogin} disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl py-3 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all shadow-sm disabled:opacity-60 mb-4">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
              <div className="relative flex justify-center"><span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 font-medium">or continue with email</span></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <AnimatePresence>
                {mode === "signup" && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} className="overflow-hidden">
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-coral/60 focus:ring-2 focus:ring-coral/10 transition" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); clearError(); }} placeholder="Email address"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-coral/60 focus:ring-2 focus:ring-coral/10 transition" />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); clearError(); }} placeholder="Password"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-coral/60 focus:ring-2 focus:ring-coral/10 transition" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    className="flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl px-3 py-2.5">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={loading}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60 shadow-lg">
                {loading
                  ? <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}><Sparkles className="h-4 w-4" /></motion.div>
                  : <>{mode === "login" ? "Sign In" : "Create Account"}<ArrowRight className="h-4 w-4" /></>
                }
              </button>
            </form>

            {/* Demo credentials */}
            {mode === "login" && (
              <button type="button" onClick={handleDemoLogin} disabled={loading}
                className="w-full mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-coral dark:hover:text-coral transition py-2 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-coral/40">
                ⚡ Try Demo Account
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
