import React from 'react';
import { X, Sparkles, ShieldCheck, Flame, Droplets, PackageCheck } from 'lucide-react';

interface SanitizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SanitizationModal: React.FC<SanitizationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      title: 'UV-C Bactericidal Light Irradiation',
      desc: 'High-intensity 254nm UV-C ultraviolet chamber destroys 99.9% of bacteria, viruses, and microbial fungi inside the shoe lining.',
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-400/10'
    },
    {
      num: '02',
      title: '180°C Pressurized Micro-Dry Steam',
      desc: 'Hospital-grade pressurized dry steam cleans deep leather, suede fibers, and insoles without soaking or weakening shoe glue.',
      icon: Flame,
      color: 'text-rose-400 bg-rose-500/10'
    },
    {
      num: '03',
      title: 'Organic Botanical Deodorizing & Conditioning',
      desc: 'Hypoallergenic cedarwood and green-tea extract mist conditions natural leather while leaving a crisp, subtle fresh scent.',
      icon: Droplets,
      color: 'text-emerald-400 bg-emerald-500/10'
    },
    {
      num: '04',
      title: 'Hygienic Vacuum Slay-Sleeve Sealing',
      desc: 'Shoes are placed inside a pristine dust bag and vacuum-sealed in a breathable protective box untouched until you open it.',
      icon: PackageCheck,
      color: 'text-blue-400 bg-blue-500/10'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Hospital-Grade Sanitization Standard</h2>
              <p className="text-xs text-zinc-400">100% Hygienic Guarantee for Every Single Rental</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-950">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${step.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Step {step.num}</span>
                    <h3 className="text-sm font-bold text-white">{step.title}</h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p>
            <strong>Allergy-Safe & Dermatologically Tested:</strong> Our sanitization chemicals are eco-friendly, non-toxic, and safe for sensitive skin.
          </p>
        </div>
      </div>
    </div>
  );
};
