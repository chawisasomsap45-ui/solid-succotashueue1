import React, { useState } from 'react';
import { X, Search, Ruler, Info } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [searchBrand, setSearchBrand] = useState('');

  const brandRules = [
    { brand: 'Yeezy (350 V2 / Foam Runner)', fit: 'Runs Small', advice: 'Take 0.5 to 1 full size UP. The Primeknit upper fits tight over the instep.' },
    { brand: 'Christian Louboutin (Pumps & Heels)', fit: 'Runs Narrow & Small', advice: 'Take 0.5 to 1 size UP from standard EU sizing. Italian arch is steep and sleek.' },
    { brand: 'Nike (Dunk Low / Air Jordan 1)', fit: 'True to Size (TTS)', advice: 'Order your exact normal US sneaker size. Wide feet should go up 0.5 size.' },
    { brand: 'Balenciaga (Triple S / Track)', fit: 'Runs Large', advice: 'Take 1 full size DOWN. European oversized mold offers extra width.' },
    { brand: 'Gucci (Ace Sneakers / Oxfords)', fit: 'Runs Large', advice: 'Take 0.5 to 1 size DOWN from standard US sizing.' },
    { brand: 'Jimmy Choo (Heels & Sandals)', fit: 'True to Size (TTS)', advice: 'Order your normal size. Pointed toes fit slim, but strap closures are adjustable.' },
    { brand: 'Salomon (XT-6 / Speedcross)', fit: 'Snug Fit', advice: 'Take 0.5 size UP if wearing thick sports or trail socks.' }
  ];

  const conversionTable = [
    { usM: '7.0', usW: '8.5', eu: '40', uk: '6.0', cm: '25.0 cm' },
    { usM: '8.0', usW: '9.5', eu: '41', uk: '7.0', cm: '26.0 cm' },
    { usM: '9.0', usW: '10.5', eu: '42', uk: '8.0', cm: '27.0 cm' },
    { usM: '10.0', usW: '11.5', eu: '43', uk: '9.0', cm: '28.0 cm' },
    { usM: '11.0', usW: '12.5', eu: '44', uk: '10.0', cm: '29.0 cm' },
    { usM: '12.0', usW: '13.5', eu: '45', uk: '11.0', cm: '30.0 cm' }
  ];

  const filteredBrands = brandRules.filter(b => b.brand.toLowerCase().includes(searchBrand.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Brand Size & Fit Master Guide</h2>
              <p className="text-xs text-zinc-400">Specific sizing fit notes for luxury designer footwear</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-950">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Sizing Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search brand fit (e.g. Yeezy, Louboutin, Gucci)..."
              value={searchBrand}
              onChange={(e) => setSearchBrand(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBrands.map((b) => (
              <div key={b.brand} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400">{b.brand}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200">{b.fit}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{b.advice}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Universal Conversion Table */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <p className="text-xs font-bold uppercase text-zinc-400">Universal Size Conversion Table</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase">
                <tr>
                  <th className="p-2.5 rounded-l-xl">US Men</th>
                  <th className="p-2.5">US Women</th>
                  <th className="p-2.5">EU Size</th>
                  <th className="p-2.5">UK Size</th>
                  <th className="p-2.5 rounded-r-xl">Foot Length (CM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {conversionTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/50">
                    <td className="p-2.5 font-bold text-white">US {row.usM}</td>
                    <td className="p-2.5 text-zinc-300">US {row.usW}</td>
                    <td className="p-2.5 font-bold text-amber-400">EU {row.eu}</td>
                    <td className="p-2.5 text-zinc-300">UK {row.uk}</td>
                    <td className="p-2.5 text-zinc-400">{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
