import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";
import { HERO_IMAGE } from "../utils/bookingImages";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate auth delay for a premium feel
    setTimeout(() => {
      onLogin();
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
        <div className="flex flex-col items-center mb-10">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-surface-sunk border border-border focus:border-coral/50 rounded-2xl py-3.5 pl-12 pr-4 text-ink placeholder:text-ink-faint outline-none transition-all focus:ring-4 focus:ring-coral/10"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-faint" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-surface-sunk border border-border focus:border-coral/50 rounded-2xl py-3.5 pl-12 pr-4 text-ink placeholder:text-ink-faint outline-none transition-all focus:ring-4 focus:ring-coral/10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-border-strong bg-surface-sunk checked:bg-coral checked:border-coral focus:ring-coral/20 cursor-pointer" />
              <span className="text-ink-dim group-hover:text-ink transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-coral hover:text-coral-dim font-medium transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative overflow-hidden group bg-ink text-page font-semibold text-sm rounded-2xl py-4 px-6 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80 disabled:hover:scale-100 shadow-xl mt-4"
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
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-page-soft/20 to-transparent skew-x-12" />
          </button>
        </form>

        <p className="text-center text-xs text-ink-dim mt-8">
          Don't have an account?{" "}
          <a href="#" className="text-ink font-semibold hover:underline">
            Request early access
          </a>
        </p>
      </motion.div>
    </div>
  );
}
