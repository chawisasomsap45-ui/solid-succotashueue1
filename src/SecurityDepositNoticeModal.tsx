import React from 'react';
import { X, Lock, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface SecurityDepositNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityDepositNoticeModal: React.FC<SecurityDepositNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl relative">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Security Deposit & Card Hold System</h2>
              <p className="text-xs text-zinc-400">How temporary inventory protection holds work</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-950">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
          <p className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-300 font-medium">
            <strong>Important Note:</strong> A temporary pre-authorization security hold (ranging from $80 to $250 depending on retail value) is placed on your card during checkout. <span className="text-white font-bold">This is NOT a charged fee.</span>
          </p>

          <div className="space-y-3 pt-2">
            <p className="font-bold text-white text-sm">Timeline & Release Process:</p>
            
            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400 font-bold shrink-0">1</div>
              <div>
                <p className="font-bold text-white">1. Checkout Hold Pre-Auth</p>
                <p className="text-zinc-400">Your bank authorizes the security amount to ensure inventory security. Your available line is temporarily reserved.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 font-bold shrink-0">2</div>
              <div>
                <p className="font-bold text-white">2. Enjoy Your Slay Period</p>
                <p className="text-zinc-400">Wear your kicks or heels to your event, date, or trip with full confidence.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold shrink-0">3</div>
              <div>
                <p className="font-bold text-white">3. Automatic Hold Release (24–48 Hours)</p>
                <p className="text-zinc-400">Once our warehouse scans your returned pre-paid box, our inspection team verifies the pair and triggers instant automatic release of the hold.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 transition-colors"
          >
            I Understand & Agree
          </button>
        </div>

      </div>
    </div>
  );
};
