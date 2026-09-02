import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Building2, User, Mail, Send } from "lucide-react";

export default function EarlyAccessModal({ onClose }) {
  const [formData, setFormData] = useState({ name: "", email: "", company: "" });
  const [errors, setErrors] = useState({ name: false, email: false, company: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const companyRef = useRef(null);

  // Focus name input on mount
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      const value = formData[field];
      if (!value) {
        setErrors(prev => ({ ...prev, [field]: true }));
        return;
      }
      
      setErrors(prev => ({ ...prev, [field]: false }));
      
      if (field === "name") {
        emailRef.current?.focus();
      } else if (field === "email") {
        companyRef.current?.focus();
      } else if (field === "company") {
        handleSubmit(e);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { name: false, email: false, company: false };
    
    if (!formData.name) { newErrors.name = true; hasError = true; }
    if (!formData.email) { newErrors.email = true; hasError = true; }
    if (!formData.company) { newErrors.company = true; hasError = true; }

    setErrors(newErrors);

    if (hasError) return;

    setIsSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-page glass-panel rounded-3xl p-8 relative shadow-2xl border-white/20"
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 h-8 w-8 flex items-center justify-center rounded-full bg-surface-sunk text-ink-dim hover:text-ink hover:bg-surface transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center py-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="h-16 w-16 bg-teal/10 text-teal rounded-full flex items-center justify-center mb-4"
            >
              <Sparkles className="h-8 w-8" />
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-ink mb-2">Request Received</h2>
            <p className="text-ink-dim text-sm max-w-[280px]">
              You're on the list! We'll notify you as soon as early access opens.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-display font-extrabold text-ink mb-2 tracking-tight">
                Request Early Access
              </h2>
              <p className="text-ink-dim text-sm max-w-[320px]">
                Join an exclusive group of travel pioneers. Experience the future of resilient itineraries before anyone else.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${errors.name ? 'text-pink' : 'text-ink-faint group-focus-within:text-coral'}`} />
                <input
                  ref={nameRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: false });
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "name")}
                  placeholder="Full Name"
                  className={`w-full bg-surface-sunk border rounded-2xl py-3.5 pl-12 pr-4 text-ink placeholder:text-ink-faint outline-none transition-all focus:ring-4 ${
                    errors.name 
                      ? 'border-pink focus:border-pink focus:ring-pink/20 bg-pink/5' 
                      : 'border-border focus:border-coral/50 focus:ring-coral/10'
                  }`}
                />
                {errors.name && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-pink animate-pulse">Required</span>}
              </div>

              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${errors.email ? 'text-pink' : 'text-ink-faint group-focus-within:text-coral'}`} />
                <input
                  ref={emailRef}
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: false });
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "email")}
                  placeholder="Work Email"
                  className={`w-full bg-surface-sunk border rounded-2xl py-3.5 pl-12 pr-4 text-ink placeholder:text-ink-faint outline-none transition-all focus:ring-4 ${
                    errors.email 
                      ? 'border-pink focus:border-pink focus:ring-pink/20 bg-pink/5' 
                      : 'border-border focus:border-coral/50 focus:ring-coral/10'
                  }`}
                />
                {errors.email && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-pink animate-pulse">Required</span>}
              </div>

              <div className="relative group">
                <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${errors.company ? 'text-pink' : 'text-ink-faint group-focus-within:text-coral'}`} />
                <input
                  ref={companyRef}
                  type="text"
                  value={formData.company}
                  onChange={(e) => {
                    setFormData({ ...formData, company: e.target.value });
                    if (errors.company) setErrors({ ...errors, company: false });
                  }}
                  onKeyDown={(e) => handleKeyDown(e, "company")}
                  placeholder="Company Name"
                  className={`w-full bg-surface-sunk border rounded-2xl py-3.5 pl-12 pr-4 text-ink placeholder:text-ink-faint outline-none transition-all focus:ring-4 ${
                    errors.company 
                      ? 'border-pink focus:border-pink focus:ring-pink/20 bg-pink/5' 
                      : 'border-border focus:border-coral/50 focus:ring-coral/10'
                  }`}
                />
                {errors.company && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-pink animate-pulse">Required</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative overflow-hidden group bg-ink text-page font-semibold text-sm rounded-2xl py-4 px-6 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80 disabled:hover:scale-100 shadow-xl mt-4"
              >
                {isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <>
                    Submit Request
                    <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
                onClick={handleSubmit}
                className="mt-4 w-full flex items-center justify-center gap-3 bg-surface hover:bg-surface-soft border border-border-strong rounded-2xl py-3 text-ink font-semibold text-sm transition-colors cursor-pointer shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
