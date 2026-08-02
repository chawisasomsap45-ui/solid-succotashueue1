import React, { useState, useMemo } from 'react';
import { Shoe, FilterState, Gender, ShoeCategory, RentalDuration } from '../types';
import { ProductCard } from './ProductCard';
import { Search, Filter, X, RotateCcw, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface ProductListingProps {
  shoes: Shoe[];
  wishlistIds: string[];
  onToggleWishlist: (shoeId: string) => void;
  onSelectShoe: (shoe: Shoe) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  initialCategory?: ShoeCategory | 'All';
}

export const ProductListing: React.FC<ProductListingProps> = ({
  shoes,
  wishlistIds,
  onToggleWishlist,
  onSelectShoe,
  searchQuery,
  setSearchQuery,
  initialCategory = 'All'
}) => {
  const [filters, setFilters] = useState<FilterState>({
    gender: 'All',
    category: initialCategory,
    sizeUs: null,
    brand: 'All',
    duration: 'All',
    priceRange: 'All',
    searchQuery: searchQuery,
    sortBy: 'popular'
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const brands = useMemo(() => {
    const list = Array.from(new Set(shoes.map(s => s.brand)));
    return ['All', ...list];
  }, [shoes]);

  const sizesUsList = [5, 6, 7, 8, 9, 10, 11, 12, 13];

  const handleReset = () => {
    setFilters({
      gender: 'All',
      category: 'All',
      sizeUs: null,
      brand: 'All',
      duration: 'All',
      priceRange: 'All',
      searchQuery: '',
      sortBy: 'popular'
    });
    setSearchQuery('');
  };

  const filteredShoes = useMemo(() => {
    return shoes.filter(s => {
      // Search filter
      const q = (searchQuery || filters.searchQuery).toLowerCase();
      if (q && !s.name.toLowerCase().includes(q) && !s.brand.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q) && !s.tags.some(t => t.toLowerCase().includes(q))) {
        return false;
      }

      // Gender filter
      if (filters.gender !== 'All' && s.gender !== filters.gender && s.gender !== 'Unisex') {
        return false;
      }

      // Category filter
      if (filters.category !== 'All' && s.category !== filters.category) {
        return false;
      }

      // Size filter
      if (filters.sizeUs !== null && !s.availableSizesUs.includes(filters.sizeUs)) {
        return false;
      }

      // Brand filter
      if (filters.brand !== 'All' && !s.brand.toLowerCase().includes(filters.brand.toLowerCase())) {
        return false;
      }

      // Price Tier filter (in Thai Baht)
      if (filters.priceRange === '$' && s.rentalPrices.fourDays >= 500) return false;
      if (filters.priceRange === '$$' && (s.rentalPrices.fourDays < 500 || s.rentalPrices.fourDays > 1500)) return false;
      if (filters.priceRange === '$$$' && s.rentalPrices.fourDays <= 1500) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_low') return a.rentalPrices.fourDays - b.rentalPrices.fourDays;
      if (filters.sortBy === 'price_high') return b.rentalPrices.fourDays - a.rentalPrices.fourDays;
      if (filters.sortBy === 'newest') return b.retailPrice - a.retailPrice;
      return b.rating - a.rating; // default popular
    });
  }, [shoes, filters, searchQuery]);

  return (
    <div className="py-12 bg-[#0A0A0A] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-1">คลังรองเท้าแบรนด์เนมแท้ 100%</p>
            <h1 className="text-3xl sm:text-5xl font-light uppercase tracking-tighter text-white">
              แคตตาล็อก <span className="italic text-white/40 font-normal">รองเท้าพร้อมเช่า.</span>
            </h1>
            <p className="text-xs text-white/50 mt-1">
              แสดงรองเท้าแบรนด์เนมระดับไฮเอนด์ <span className="font-bold text-white">{filteredShoes.length}</span> คู่พร้อมจัดส่ง
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2 bg-[#111111] border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-white/70" />
              <span>ตัวกรอง ({Object.values(filters).filter(v => v !== 'All' && v !== null && v !== '' && v !== 'popular').length})</span>
            </button>

            <div className="flex items-center gap-2 bg-[#111111] border border-white/10 rounded-lg px-3 py-2 text-xs">
              <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">เรียงตาม:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value as any }))}
                className="bg-transparent text-white font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                <option value="popular" className="bg-[#111111] text-white">ยอดนิยม & เรตติ้งสูงสุด</option>
                <option value="price_low" className="bg-[#111111] text-white">ราคาเช่า: ต่ำไปสูง</option>
                <option value="price_high" className="bg-[#111111] text-white">ราคาเช่า: สูงไปต่ำ</option>
                <option value="newest" className="bg-[#111111] text-white">มูลค่ารองเท้า (ความหรูหรา)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block space-y-6 bg-[#111111] border border-white/10 rounded-2xl p-6 h-fit sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-white/70" />
                กรองรองเท้า
              </span>
              <button
                onClick={handleReset}
                className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest font-bold flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>รีเซ็ต</span>
              </button>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">เพศ/สไตล์</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'All', label: 'ทั้งหมด' },
                  { id: 'Men', label: 'ชาย' },
                  { id: 'Women', label: 'หญิง' },
                  { id: 'Unisex', label: 'ยูนิเซ็กซ์' }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setFilters(f => ({ ...f, gender: g.id as any }))}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-center transition-all ${
                      filters.gender === g.id 
                        ? 'bg-white text-black' 
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">หมวดหมู่</label>
              <div className="space-y-1">
                {[
                  { id: 'All', label: 'หมวดหมู่ทั้งหมด' },
                  { id: 'Sneakers', label: 'สนีกเกอร์ (Sneakers)' },
                  { id: 'Heels', label: 'ส้นสูง & คัทชู (Heels)' },
                  { id: 'Boots', label: 'รองเท้าบูท (Boots)' },
                  { id: 'Formal', label: 'ทางการ/ออกงาน (Formal)' },
                  { id: 'Performance', label: 'สปอร์ต/เอาท์ดอร์ (Sport)' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters(f => ({ ...f, category: cat.id as any }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs uppercase tracking-wider font-medium flex items-center justify-between transition-colors ${
                      filters.category === cat.id
                        ? 'bg-white text-black font-bold'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shoe Size Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">ไซส์ (US)</label>
              <div className="grid grid-cols-5 gap-1.5">
                <button
                  onClick={() => setFilters(f => ({ ...f, sizeUs: null }))}
                  className={`py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                    filters.sizeUs === null 
                      ? 'bg-white text-black' 
                      : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                  }`}
                >
                  ทั้งหมด
                </button>
                {sizesUsList.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setFilters(f => ({ ...f, sizeUs: sz }))}
                    className={`py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                      filters.sizeUs === sz 
                        ? 'bg-white text-black' 
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">แบรนด์</label>
              <select
                value={filters.brand}
                onChange={(e) => setFilters(f => ({ ...f, brand: e.target.value }))}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-white/30"
              >
                {brands.map((b) => (
                  <option key={b} value={b} className="bg-[#111111] text-white">
                    {b === 'All' ? 'แบรนด์ทั้งหมด' : b}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">ระดับราคาเช่า</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'ทั้งหมด', val: 'All' },
                  { label: '<฿500', val: '$' },
                  { label: '฿500-1.5k', val: '$$' },
                  { label: '>฿1.5k', val: '$$$' }
                ].map((p) => (
                  <button
                    key={p.val}
                    onClick={() => setFilters(f => ({ ...f, priceRange: p.val as any }))}
                    className={`py-1.5 rounded-lg text-[10px] font-bold text-center transition-all ${
                      filters.priceRange === p.val 
                        ? 'bg-white text-black' 
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shoe Grid Showcase */}
          <div className="lg:col-span-3">
            {filteredShoes.length === 0 ? (
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-12 text-center space-y-4 my-8">
                <p className="text-base font-bold uppercase tracking-wider text-white">ไม่พบรองเท้าที่ตรงกับตัวกรองที่เลือก</p>
                <p className="text-xs text-white/50 max-w-sm mx-auto">
                  ลองล้างการเลือกแบรนด์ ไซส์ หรือเปลี่ยนหมวดหมู่ เพื่อเลือกดูรองเท้าคู่อื่นในคลังของเรา
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-white/20 bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredShoes.map((shoe) => (
                  <ProductCard
                    key={shoe.id}
                    shoe={shoe}
                    isWishlisted={wishlistIds.includes(shoe.id)}
                    onToggleWishlist={onToggleWishlist}
                    onSelectShoe={onSelectShoe}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-[#111111] border-l border-white/10 h-full p-6 space-y-6 overflow-y-auto text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-sm font-bold uppercase tracking-widest text-white">กรองรองเท้า</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">หมวดหมู่</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'All', label: 'ทั้งหมด' },
                    { id: 'Sneakers', label: 'สนีกเกอร์' },
                    { id: 'Heels', label: 'ส้นสูง' },
                    { id: 'Boots', label: 'บูท' },
                    { id: 'Formal', label: 'ทางการ' },
                    { id: 'Performance', label: 'สปอร์ต' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFilters(f => ({ ...f, category: cat.id as any }))}
                      className={`py-2 px-3 rounded-lg text-[10px] uppercase font-bold text-center ${
                        filters.category === cat.id ? 'bg-white text-black' : 'bg-white/5 text-white/70 border border-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">ไซส์ (US)</label>
                <div className="grid grid-cols-4 gap-2">
                  {sizesUsList.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFilters(f => ({ ...f, sizeUs: sz }))}
                      className={`py-2 rounded-lg text-[10px] font-bold text-center ${
                        filters.sizeUs === sz ? 'bg-white text-black' : 'bg-white/5 text-white/70 border border-white/10'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90"
            >
              แสดงผลลัพธ์ ({filteredShoes.length} คู่)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
