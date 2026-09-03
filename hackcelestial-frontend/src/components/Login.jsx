import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Mail, Sparkles, UserCircle, User, Eye, EyeOff } from "lucide-react";
import { HERO_IMAGE } from "../utils/bookingImages";
import EarlyAccessModal from "./EarlyAccessModal";

const DEMO_EMAIL = "demo@recoup.travel";
const DEMO_PASSWORD = "hackcelestial2024";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, [mode]);

  const handleDemoAutofill = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    // Auto-submit after a short delay for UX
    setTimeout(() => {
      setIsSubmitting(true);
      setTimeout(() => onLogin(false), 1000);
    }, 400);
  };

  const handleGoogleLogin = () => {
    // Simulate Google OAuth — in production connect to your backend
    setIsSubmitting(true);
    setTimeout(() => onLogin(rememberMe), 1200);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    const newErrors = {};
    if (mode === "signup" && !name.trim()) newErrors.name = true;
    if (!email.trim()) newErrors.email = true;
    if (!password.trim() || password.length < 6) newErrors.password = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => onLogin(rememberMe), 1200);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-page">
      {/* Dynamic Background */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" aria-hidden />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.12) 0%, rgba(255,79,94,0.12) 100%)" }}
        aria-hidden
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-page/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] border border-white/10 p-8 sm:p-10">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-teal/30 to-coral/30 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/20 mb-6"
            >
              <span className="text-white font-display font-bold text-3xl drop-shadow-md">R</span>
            </motion.div>
            <h1 className="font-display font-extrabold text-white text-3xl tracking-tight mb-2 text-center">
              {mode === "login" ? "Welcome back" : "Create Account"}
            </h1>
            <p className="text-white/60 text-sm text-center max-w-[280px]">
              {mode === "login"
                ? "Sign in to access your intelligent travel copilot."
                : "Join Recoup to start planning disruption-resilient trips."}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-6 border border-white/10">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setErrors({}); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  mode === m
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name field (signup only) */}
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative group overflow-hidden"
                >
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.name ? "text-pink" : "text-white/40 group-focus-within:text-coral"}`} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: false })); }}
                    placeholder="Full name"
                    className={`w-full bg-white/10 border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 outline-none transition-all focus:ring-2 ${errors.name ? "border-pink focus:ring-pink/30" : "border-white/15 focus:border-coral/60 focus:ring-coral/20"}`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.email ? "text-pink" : "text-white/40 group-focus-within:text-coral"}`} />
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: false })); }}
                placeholder="Email address"
                className={`w-full bg-white/10 border rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/40 outline-none transition-all focus:ring-2 ${errors.email ? "border-pink focus:ring-pink/30" : "border-white/15 focus:border-coral/60 focus:ring-coral/20"}`}
              />
              {errors.email && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-pink">Required</span>}
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${errors.password ? "text-pink" : "text-white/40 group-focus-within:text-coral"}`} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: false })); }}
                placeholder={mode === "signup" ? "Password (min 6 chars)" : "Password"}
                className={`w-full bg-white/10 border rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-white/40 outline-none transition-all focus:ring-2 ${errors.password ? "border-pink focus:ring-pink/30" : "border-white/15 focus:border-coral/60 focus:ring-coral/20"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {errors.password && <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs font-semibold text-pink">Too short</span>}
            </div>

            {/* Remember me */}
            {mode === "login" && (
              <div className="flex items-center justify-between text-xs px-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-coral cursor-pointer"
                  />
                  <span className="text-white/60 hover:text-white transition">Remember me</span>
                </label>
                <a href="#" className="text-coral hover:text-white font-medium transition">Forgot password?</a>
              </div>
            )}

            {/* Demo Credentials Button (login only) */}
            {mode === "login" && (
              <button
                type="button"
                onClick={handleDemoAutofill}
                className="w-full text-xs font-semibold bg-teal/10 text-teal hover:bg-teal/20 py-3 rounded-xl border border-teal/20 transition flex items-center justify-center gap-2"
              >
                <UserCircle className="w-4 h-4" />
                Use Demo Credentials &amp; Sign In
              </button>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full relative overflow-hidden group bg-gradient-to-r from-coral to-pink text-white font-bold text-sm rounded-2xl py-4 px-6 flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-80 shadow-[0_8px_24px_-8px_rgba(255,79,94,0.6)]"
            >
              {isSubmitting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="h-5 w-5" />
                </motion.div>
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-5 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-page/90 px-3 text-white/40 font-medium">or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 rounded-2xl py-3 text-slate-800 font-semibold text-sm transition shadow-sm cursor-pointer disabled:opacity-70"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-white/40 mt-6">
            By continuing, you agree to Recoup's{" "}
            <a href="#" className="text-white/60 hover:text-white underline">Terms of Service</a>
            {" & "}
            <a href="#" className="text-white/60 hover:text-white underline">Privacy Policy</a>
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {showEarlyAccess && <EarlyAccessModal onClose={() => setShowEarlyAccess(false)} />}
      </AnimatePresence>
    </div>
  );
}
