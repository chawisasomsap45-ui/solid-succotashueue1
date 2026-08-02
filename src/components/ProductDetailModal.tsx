import React, { useState } from 'react';
import { Shoe, RentalDuration, CartItem, UserProfile } from '../types';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Heart, 
  Info, 
  Check, 
  ShoppingBag, 
  Lock, 
  Ruler, 
  AlertCircle 
} from 'lucide-react';
import { InteractiveRentalCalendar } from './InteractiveRentalCalendar';

interface ProductDetailModalProps {
  shoe: Shoe | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onRentNow: (item: CartItem) => void;
  isWishlisted: boolean;
  onToggleWishlist: (shoeId: string) => void;
  openSizeGuide: () => void;
  openDepositNotice: () => void;
  openDamagePolicy: () => void;
  userProfile: UserProfile | null;
  openMemberOnlyModal: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  shoe,
  onClose,
  onAddToCart,
  onRentNow,
  isWishlisted,
  onToggleWishlist,
  openSizeGuide,
  openDepositNotice,
  openDamagePolicy,
  userProfile,
  openMemberOnlyModal
}) => {
  if (!shoe) return null;

  const [activeImageKey, setActiveImageKey] = useState<'main' | 'side' | 'sole' | 'wear'>('main');
  const [selectedSizeUs, setSelectedSizeUs] = useState<number>(shoe.availableSizesUs[0] || 9);
  const [selectedDuration, setSelectedDuration] = useState<RentalDuration>('4_days');
  
  // Default start date = 2 days from now YYYY-MM-DD
  const defaultStart = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(defaultStart);
  
  const [insurance, setInsurance] = useState<boolean>(true);
  const [expressDelivery, setExpressDelivery] = useState<boolean>(false);

  // Calculate rental price based on duration
  const getRentalPrice = () => {
    if (selectedDuration === '4_days') return shoe.rentalPrices.fourDays;
    if (selectedDuration === '10_days') return shoe.rentalPrices.tenDays;
    return shoe.rentalPrices.monthly;
  };

  const getEndDate = () => {
    const start = new Date(startDate);
    const days = selectedDuration === '4_days' ? 4 : selectedDuration === '10_days' ? 10 : 30;
    const end = new Date(start.getTime() + 86400000 * days);
    return end.toISOString().split('T')[0];
  };

  const calculatedPrice = getRentalPrice();
  const insuranceCost = insurance ? 150 : 0;
  const deliveryCost = expressDelivery ? 350 : 0;

  const correspondingSizeEu = shoe.availableSizesEu[shoe.availableSizesUs.indexOf(selectedSizeUs)] || 42;

  const createCartItem = (): CartItem => ({
    id: 'cart_' + Math.random().toString(36).substr(2, 9),
    shoe,
    selectedSizeUs,
    selectedSizeEu: correspondingSizeEu,
    rentalDuration: selectedDuration,
    startDate,
    endDate: getEndDate(),
    insuranceSelected: insurance,
    expressDeliverySelected: expressDelivery,
    rentalPrice: calculatedPrice + deliveryCost,
    insurancePrice: insuranceCost,
    depositHold: shoe.securityDeposit
  });

  const handleAdd = () => {
    if (!userProfile) {
      openMemberOnlyModal();
      return;
    }
    onAddToCart(createCartItem());
  };

  const handleRent = () => {
    if (!userProfile) {
      openMemberOnlyModal();
      return;
    }
    onRentNow(createCartItem());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative text-white my-auto">
        
        {/* Top Header Close & Actions */}
        <div className="sticky top-0 z-20 bg-zinc-900/90 backdrop-blur-md px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">{shoe.brand}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-medium text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {shoe.availabilityStatus === 'Available Now' ? 'พร้อมเช่าทันที' : shoe.availabilityStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(shoe.id)}
              className={`p-2 rounded-full border border-zinc-800 transition-colors ${
                isWishlisted ? 'bg-rose-500 text-white' : 'bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
              title="บันทึกไว้ในรายการโปรด"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            {/* Main Stage Image */}
            <div className="relative h-80 sm:h-96 rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-800 group">
              <img 
                src={shoe.images[activeImageKey]} 
                alt={shoe.name}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-400 border border-amber-400/30">
                มุมมอง: {activeImageKey === 'main' ? 'ภาพหลัก' : activeImageKey === 'side' ? 'มุมข้าง' : activeImageKey === 'sole' ? 'พื้นรองเท้า' : 'รูปสวมใส่'}
              </div>

              <div className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold text-zinc-300">
                ราคาป้าย: <span className="line-through text-zinc-500">฿{shoe.retailPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Thumbnail Selectors */}
            <div className="grid grid-cols-4 gap-2">
              {(['main', 'side', 'sole', 'wear'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveImageKey(key)}
                  className={`h-20 rounded-xl overflow-hidden border transition-all ${
                    activeImageKey === key 
                      ? 'border-amber-400 ring-2 ring-amber-400/30' 
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={shoe.images[key]} alt={key} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Condition & Sanitization Notes */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-400">สภาพสินค้า:</span>
                <span className="font-bold text-amber-400">{shoe.conditionGrade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-400">การทำความสะอาด:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  ฆ่าเชื้อด้วย UV-C & สตีมไอน้ำ ✔
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: PDP Form Controls */}
          <div className="md:col-span-6 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">{shoe.name}</h1>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{shoe.description}</p>
            </div>

            {/* Brand Sizing Advice */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-400">คำแนะนำไซส์: </span>
                <span className="text-zinc-300">{shoe.sizingAdvice}</span>
                <button onClick={openSizeGuide} className="block text-amber-400 underline font-semibold mt-1">
                  ดูตารางไซส์อย่างละเอียด →
                </button>
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-300">เลือกไซส์รองเท้า:</span>
                <button onClick={openSizeGuide} className="text-amber-400 hover:underline flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>คู่มือวัดขนาดไซส์</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {shoe.availableSizesUs.map((sz, idx) => {
                  const eu = shoe.availableSizesEu[idx] || 40;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSizeUs(sz)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedSizeUs === sz 
                          ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md' 
                          : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      US {sz} <span className="text-[10px] font-normal opacity-80">(EU {eu})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rental Duration Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 block">เลือกระยะเวลาการเช่า:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedDuration('4_days')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedDuration === '4_days'
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-[10px] font-extrabold uppercase text-amber-400">เช่าสั้น (4 วัน)</p>
                  <p className="text-sm font-black text-white">฿{shoe.rentalPrices.fourDays.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-400">4 วัน</p>
                </button>

                <button
                  onClick={() => setSelectedDuration('10_days')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedDuration === '10_days'
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-[10px] font-extrabold uppercase text-amber-400">เช่ากลาง (10 วัน)</p>
                  <p className="text-sm font-black text-white">฿{shoe.rentalPrices.tenDays.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-400">10 วัน</p>
                </button>

                <button
                  onClick={() => setSelectedDuration('monthly')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedDuration === 'monthly'
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-[10px] font-extrabold uppercase text-amber-400">เช่ารายเดือน (30 วัน)</p>
                  <p className="text-sm font-black text-white">฿{shoe.rentalPrices.monthly.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-400">30 วัน</p>
                </button>
              </div>
            </div>

            {/* Interactive Rental Calendar */}
            <InteractiveRentalCalendar
              startDate={startDate}
              endDate={getEndDate()}
              selectedDuration={selectedDuration}
              onChangeDates={(newStart, newEnd, newDur) => {
                setStartDate(newStart);
                setSelectedDuration(newDur);
              }}
              fourDaysPrice={shoe.rentalPrices.fourDays}
              tenDaysPrice={shoe.rentalPrices.tenDays}
              monthlyPrice={shoe.rentalPrices.monthly}
            />

            {/* Add-ons */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <p className="text-xs font-bold text-zinc-300">บริการเสริม Slay Care:</p>
              
              <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer hover:border-zinc-700">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={insurance}
                    onChange={(e) => setInsurance(e.target.checked)}
                    className="accent-amber-400 w-4 h-4"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">ประกันคุ้มครองความเสียหาย (+฿150)</p>
                    <p className="text-[10px] text-zinc-400">คุ้มครองรอยเปื้อน คราบน้ำ และรอยขีดข่วนเล็กน้อยจากการใช้งาน</p>
                  </div>
                </div>
                <button type="button" onClick={openDamagePolicy} className="text-[10px] text-amber-400 underline">นโยบาย</button>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer hover:border-zinc-700">
                <input
                  type="checkbox"
                  checked={expressDelivery}
                  onChange={(e) => setExpressDelivery(e.target.checked)}
                  className="accent-amber-400 w-4 h-4"
                />
                <div>
                  <p className="text-xs font-bold text-white">จัดส่งด่วนแมสเซนเจอร์ Grab/Lalamove (+฿350)</p>
                  <p className="text-[10px] text-zinc-400">การันตีส่งถึงมือภายใน 24 ชม. พร้อมติดตามสถานะแบบ VIP</p>
                </div>
              </label>
            </div>

            {/* Security Deposit Hold Disclosure */}
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-400">การกันเงินมัดจำประกันสินค้า</p>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  วงเงินมัดจำจำนวน <strong className="text-white">฿{shoe.securityDeposit.toLocaleString()}</strong> จะถูกกันไว้ชั่วคราว และคืนเข้าบัญชีให้ทันทีหลังการเช่าเสร็จสมบูรณ์
                </p>
                <button onClick={openDepositNotice} className="text-blue-400 underline text-[10px] font-bold mt-1">
                  รายละเอียดเงื่อนไขเงินมัดจำและการคืนเงิน →
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAdd}
                className="py-3.5 px-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>เพิ่มลงตะกร้า</span>
              </button>

              <button
                onClick={handleRent}
                className="py-3.5 px-4 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20 hover:scale-105 transition-all"
              >
                <span>เช่าทันที (฿{(calculatedPrice + insuranceCost + deliveryCost).toLocaleString()})</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
