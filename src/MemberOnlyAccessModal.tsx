import React from 'react';
import { X, Lock, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface MemberOnlyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const MemberOnlyAccessModal: React.FC<MemberOnlyAccessModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl relative text-center">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-lg bg-[#111111] border border-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon Emblem */}
        <div className="w-14 h-14 border border-white/20 bg-white/5 text-white flex items-center justify-center rounded-2xl mx-auto shadow-inner">
          <Lock className="w-6 h-6 text-white" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/80">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Exclusive Closet Gate</span>
          </div>
          <h2 className="text-2xl font-light uppercase tracking-tighter text-white">
            Member-Only Access!
          </h2>
          <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
            To view live calendar availability, select rental dates, and unlock pricing, please log in to your Rent and Slay account.
          </p>
        </div>

        {/* Member Perks Preview */}
        <div className="p-3.5 bg-[#111111] border border-white/10 rounded-xl space-y-2 text-left text-xs">
          <div className="flex items-center gap-2 text-white/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Verified Authentic Jordan, Nike, & Gucci Vault</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Real-time Interactive Booking Calendar & Sanitization Guarantee</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenAuth('login');
            }}
            className="py-3.5 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-all rounded-lg"
          >
            Log In
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAuth('signup');
            }}
            className="py-3.5 border border-white/30 hover:border-white bg-white/5 text-white font-bold text-xs uppercase tracking-widest transition-all rounded-lg"
          >
            Quick Sign Up
          </button>
        </div>

        <p className="text-[10px] text-white/40 uppercase tracking-widest">
          Join 2,000+ Slay Members • Instant Access
        </p>

      </div>
    </div>
  );
};
