import React, { useState } from 'react';
import { Shoe } from '../types';
import { Heart, Sparkles, ShieldCheck, Calendar, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  shoe: Shoe;
  isWishlisted: boolean;
  onToggleWishlist: (shoeId: string) => void;
  onSelectShoe: (shoe: Shoe) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  shoe,
  isWishlisted,
  onToggleWishlist,
  onSelectShoe
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        {/* Image Container */}
        <div className="relative h-64 sm:h-72 bg-[#0A0A0A] overflow-hidden cursor-pointer" onClick={() => onSelectShoe(shoe)}>
          <img 
            src={hovered && shoe.images.side ? shoe.images.side : shoe.images.main} 
            alt={shoe.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />

          {/* Availability Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border ${
              shoe.availabilityStatus === 'Available Now' 
                ? 'bg-black/80 text-emerald-400 border-emerald-500/30' 
                : 'bg-black/80 text-amber-300 border-amber-500/30'
            }`}>
              {shoe.availabilityStatus === 'Available Now' ? 'พร้อมเช่าทันที' : shoe.availabilityStatus}
            </span>
          </div>

          {/* Wishlist Heart Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(shoe.id);
            }}
            className={`absolute top-3 right-3 p-2 border backdrop-blur-md transition-all z-10 ${
              isWishlisted 
                ? 'bg-white text-black border-white' 
                : 'bg-black/80 border-white/10 text-white/50 hover:text-white hover:border-white/30'
            }`}
            title={isWishlisted ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-black' : ''}`} />
          </button>

          {/* Condition Grade Overlay */}
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white/60 border border-white/10">
            สภาพ: <span className="text-white">{shoe.conditionGrade}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{shoe.brand}</p>
            <h3 
              onClick={() => onSelectShoe(shoe)}
              className="text-sm font-bold uppercase tracking-wider text-white hover:text-white/80 transition-colors line-clamp-1 cursor-pointer"
            >
              {shoe.name}
            </h3>
          </div>

          {/* Price Comparisons */}
          <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
            <div>
              <p className="text-[9px] uppercase font-bold text-white/30 tracking-widest">ราคาป้าย</p>
              <p className="text-xs font-semibold text-white/40 line-through">฿{shoe.retailPrice.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase font-bold text-white/40 tracking-widest">ค่าเช่าเริ่มต้น</p>
              <p className="text-base font-bold text-white uppercase tracking-wider">
                ฿{shoe.rentalPrices.fourDays.toLocaleString()} <span className="text-[10px] font-normal text-white/40">/ 4 วัน</span>
              </p>
            </div>
          </div>

          {/* Sizing Tags */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/40 pt-1">
            <span>US {shoe.availableSizesUs[0]}–{shoe.availableSizesUs[shoe.availableSizesUs.length - 1]}</span>
            <span>EU {shoe.availableSizesEu[0]}–{shoe.availableSizesEu[shoe.availableSizesEu.length - 1]}</span>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-5 pt-0">
        <button
          onClick={() => onSelectShoe(shoe)}
          className="w-full py-2.5 px-4 border border-white/20 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 group/btn"
        >
          <span>เลือกวันที่ & เช่ารองเท้า</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
