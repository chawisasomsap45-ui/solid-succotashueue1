import React from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface DamagePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DamagePolicyModal: React.FC<DamagePolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Rental Damage & Protection Policy</h2>
              <p className="text-xs text-zinc-400">Clear guidelines on normal wear vs. major damage</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-950">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Column Comparison: Free Normal Wear vs Major Damage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Column 1: 100% Free Normal Wear */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>100% FREE Normal Wear & Tear</span>
            </div>
            <p className="text-xs text-zinc-400">Included automatically with zero penalty fees:</p>
            <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
              <li>Outsole dirt, dust, and minor street smudges</li>
              <li>Natural leather creasing along vamp toe-box</li>
              <li>Minor invisible outsole wear from walking</li>
              <li>Removable water spots or faint dirt scuffs</li>
            </ul>
          </div>

          {/* Column 2: Major Damage Penalties */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Major Damage Penalties</span>
            </div>
            <p className="text-xs text-zinc-400">Avoidable damage that damages structural integrity:</p>
            <ul className="text-xs text-zinc-300 space-y-2 list-disc list-inside">
              <li>Permanent chemical, ink, or wine stains</li>
              <li>Ripped Primeknit, torn leather, or cut laces</li>
              <li>Broken heel stiletto core or missing outsole pads</li>
              <li>Intentional customization or unreturned original box</li>
            </ul>
          </div>

        </div>

        {/* $5 Insurance Protection Plan */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Recommended Peace of Mind</span>
            <span className="text-xs font-extrabold text-white bg-amber-400 text-zinc-950 px-2.5 py-0.5 rounded-full">$5 / Rental</span>
          </div>
          <p className="text-xs font-bold text-white">Slay Care $5 Rental Damage Insurance</p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Adding $5 Slay Care Insurance at checkout waives all repair penalties for accidental heel scrapes, food stains, heel cap replacement, and minor scuffs!
          </p>
        </div>

      </div>
    </div>
  );
};
