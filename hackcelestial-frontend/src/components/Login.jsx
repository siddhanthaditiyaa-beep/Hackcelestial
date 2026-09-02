import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Mail, Sparkles, UserCircle } from "lucide-react";
import { HERO_IMAGE } from "../utils/bookingImages";
import EarlyAccessModal from "./EarlyAccessModal";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: false, password: false });
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  
  // Focus email on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!email) {
        setErrors(prev => ({ ...prev, email: true }));
      } else {
        setErrors(prev => ({ ...prev, email: false }));
        passwordRef.current?.focus();
      }
    }
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!password) {
        setErrors(prev => ({ ...prev, password: true }));
      } else {
        setErrors(prev => ({ ...prev, password: false }));
        handleSubmit(e);
      }
    }
  };

  const handleDemoAutofill = () => {
    setEmail("demo@recoup.travel");
    setPassword("hackcelestial2024");
    setErrors({ email: false, password: false });
    // Simulate auto-submission after a tiny delay for UX
    setTimeout(() => {
      passwordRef.current?.focus();
    }, 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let hasError = false;
    if (!email) {
      setErrors(prev => ({ ...prev, email: true }));
      hasError = true;
    }
    if (!password) {
      setErrors(prev => ({ ...prev, password: true }));
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    // Simulate auth delay for a premium feel
    setTimeout(() => {
      onLogin(rememberMe);
    }, 1200);
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
      
      {/* Dark overlay for contrast */}
      <div
        className="absolute inset-0 bg-page/40 backdrop-blur-[2px]"
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(255,79,94,0.15) 100%)",
        }}
        aria-hidden
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 mx-4 glass-panel rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] border-white/20"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            className="h-16 w-16 rounded-[1.5rem] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg border border-white/30 mb-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal/30 to-coral/30" />
            <span className="text-white font-display font-bold text-3xl drop-shadow-md relative z-10">
              R
            </span>
          </motion.div>
          <h1 className="font-display font-extrabold text-ink text-3xl tracking-tight mb-2 text-center">
            Welcome to Recoup
          </h1>
          <p className="text-ink-dim text-sm text-center max-w-[280px]">
            Intelligent Travel Resilience. Securely sign in to access your autonomous copilot.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${errors.email ? 'text-pink' : 'text-ink-faint group-focus-within:text-coral'}`} />
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({...prev, email: false}));
                }}
                onKeyDown={handleEmailKeyDown}
                placeholder="Email address"
                className={`w-full bg-surface-sunk border rounded-2xl py-3.5 pl-12 pr-4 text-ink placeholder:text-ink-faint outline-none transition-all focus:ring-4 ${
                  errors.email 
                    ? 'border-pink focus:border-pink focus:ring-pink/20 bg-pink/5' 
                    : 'border-border focus:border-coral/50 focus:ring-coral/10'
                }`}
              />
              {errors.email && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-pink animate-pulse">Required</span>
              )}
            </div>
            
            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${errors.password ? 'text-pink' : 'text-ink-faint group-focus-within:text-coral'}`} />
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({...prev, password: false}));
                }}
                onKeyDown={handlePasswordKeyDown}
                placeholder="Password"
                className={`w-full bg-surface-sunk border rounded-2xl py-3.5 pl-12 pr-4 text-ink placeholder:text-ink-faint outline-none transition-all focus:ring-4 ${
                  errors.password 
                    ? 'border-pink focus:border-pink focus:ring-pink/20 bg-pink/5' 
                    : 'border-border focus:border-coral/50 focus:ring-coral/10'
                }`}
              />
              {errors.password && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-pink animate-pulse">Required</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1 py-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border-strong bg-surface-sunk checked:bg-coral checked:border-coral focus:ring-coral/20 cursor-pointer" 
              />
              <span className="text-ink-dim group-hover:text-ink transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-coral hover:text-coral-dim font-medium transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="button"
            onClick={handleDemoAutofill}
            className="w-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 py-2.5 rounded-xl border border-indigo-500/20 transition-colors flex items-center justify-center gap-2 mt-1 mb-2"
          >
            <UserCircle className="w-4 h-4" />
            Fill Demo Credentials
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative overflow-hidden group bg-ink text-page font-semibold text-sm rounded-2xl py-4 px-6 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80 disabled:hover:scale-100 shadow-xl"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-page-soft/20 to-transparent skew-x-12" />
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-strong"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-2 text-ink-dim font-medium">Or continue with</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleSubmit} // Simulation
            className="mt-4 w-full flex items-center justify-center gap-3 bg-surface hover:bg-surface-soft border border-border-strong rounded-2xl py-3 text-ink font-semibold text-sm transition-colors cursor-pointer shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
        </div>

        <p className="text-center text-xs text-ink-dim mt-8">
          Don't have an account?{" "}
          <button onClick={() => setShowEarlyAccess(true)} className="text-ink font-semibold hover:underline cursor-pointer">
            Request early access
          </button>
        </p>
      </motion.div>

      <AnimatePresence>
        {showEarlyAccess && (
          <EarlyAccessModal onClose={() => setShowEarlyAccess(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
