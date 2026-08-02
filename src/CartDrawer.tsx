import React, { useState } from 'react';
import { CartItem, UserProfile } from '../types';
import { X, Trash2, ShoppingBag, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createRentalOrderInDb } from '../lib/firebase';
import { PaymentMethodModal } from './PaymentMethodModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  userProfile: UserProfile | null;
  openAuthModal: (mode: 'login' | 'signup') => void;
  onOrderPlaced: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  userProfile,
  openAuthModal,
  onOrderPlaced
}) => {
  if (!isOpen) return null;

  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdOrderIds, setCreatedOrderIds] = useState<string[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.rentalPrice, 0);
  const insuranceTotal = cartItems.reduce((acc, item) => acc + item.insurancePrice, 0);
  const totalDepositHold = cartItems.reduce((acc, item) => acc + item.depositHold, 0);
  const grandTotal = subtotal + insuranceTotal;

  const handleStartCheckout = () => {
    if (!userProfile) {
      openAuthModal('login');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    setIsPaymentModalOpen(false);
    if (!userProfile) return;

    setLoading(true);
    const newIds: string[] = [];

    try {
      for (const item of cartItems) {
        const tracking = 'SLAY-' + Math.floor(100000 + Math.random() * 900000);
        const id = await createRentalOrderInDb({
          userId: userProfile.uid,
          shoeId: item.shoe.id,
          shoeName: item.shoe.name,
          brand: item.shoe.brand,
          imageUrl: item.shoe.images.main,
          sizeUs: item.selectedSizeUs,
          sizeEu: item.selectedSizeEu,
          rentalDuration: item.rentalDuration,
          startDate: item.startDate,
          endDate: item.endDate,
          rentalPrice: item.rentalPrice,
          insuranceFee: item.insurancePrice,
          securityDeposit: item.depositHold,
          totalPaid: item.rentalPrice + item.insurancePrice,
          status: 'active',
          daysRemaining: item.rentalDuration === '4_days' ? 4 : item.rentalDuration === '10_days' ? 10 : 30,
          returnTrackingCode: tracking,
          createdAt: new Date().toISOString()
        });
        newIds.push(id);
      }

      setCreatedOrderIds(newIds);
      setCheckoutSuccess(true);
      onClearCart();
      onOrderPlaced();
    } catch (err) {
      console.error('Checkout error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-[#0A0A0A] border-l border-white/10 h-full p-6 flex flex-col justify-between text-white shadow-2xl relative overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-white/80" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">กระเป๋าเช่าของคุณ ({cartItems.length})</h2>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white rounded-lg bg-[#111111] border border-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {checkoutSuccess ? (
          <div className="py-12 space-y-6 text-center">
            <div className="w-14 h-14 bg-white/10 text-white border border-white/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-light uppercase tracking-tighter text-white">ยืนยันคำสั่งเช่าเรียบร้อยแล้ว</h3>
              <p className="text-xs text-white/50 max-w-xs mx-auto">
                คำสั่งซื้อของคุณถูกส่งไปยังห้องเตรียมทำความสะอาดแล้ว คุณสามารถติดตามสถานะรองเท้าได้ในแดชบอร์ดของคุณ
              </p>
            </div>

            <div className="p-4 bg-[#111111] border border-white/10 text-left text-xs space-y-2">
              <p className="font-bold text-white uppercase tracking-wider text-[10px]">สรุปคำสั่งเช่า:</p>
              <p className="text-white/70">ยอดชำระสุทธิ: <strong>฿{grandTotal.toLocaleString()}</strong></p>
              <p className="text-white/70">วงเงินมัดจำประกันสินค้า: <strong>฿{totalDepositHold.toLocaleString()}</strong> (คืนเงินอัตโนมัติหลังคืนสินค้า)</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">ระบบออกลาเบลสำหรับส่งคืนฟรีให้ในแดชบอร์ดแล้ว</p>
            </div>

            <button
              onClick={() => {
                setCheckoutSuccess(false);
                onClose();
              }}
              className="w-full py-3.5 bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-colors"
            >
              กลับสู่หน้าแคตตาล็อก
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="py-20 text-center space-y-4 my-auto">
            <div className="w-14 h-14 border border-white/10 bg-[#111111] text-white/40 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-white">ยังไม่มีสินค้าในกระเป๋าเช่าของคุณ</p>
            <p className="text-xs text-white/50 max-w-xs mx-auto">
              เลือกชมสนีกเกอร์ ส้นสูง และรองเท้าแบรนด์เนมหรูหราของเราเพื่อเริ่มจองเช่า
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-white/20 bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-colors"
            >
              ดูรองเท้าใน Slay Vault
            </button>
          </div>
        ) : (
          <>
            {/* Item List */}
            <div className="flex-1 py-4 space-y-4 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="p-3.5 bg-[#111111] border border-white/10 flex items-center gap-3">
                  <div className="w-20 h-20 overflow-hidden bg-[#0A0A0A] border border-white/10 shrink-0">
                    <img src={item.shoe.images.main} alt={item.shoe.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-1 text-xs">
                    <p className="font-bold text-white/40 uppercase tracking-widest text-[9px]">{item.shoe.brand}</p>
                    <p className="font-bold text-white uppercase text-xs line-clamp-1">{item.shoe.name}</p>
                    <p className="text-white/60 text-[11px]">
                      ไซส์: US {item.selectedSizeUs} (EU {item.selectedSizeEu}) • {item.rentalDuration === '4_days' ? 'เช่า 4 วัน' : item.rentalDuration === '10_days' ? 'เช่า 10 วัน' : 'เช่า 30 วัน'}
                    </p>
                    <p className="text-[10px] text-white/40">วันที่: {item.startDate} ถึง {item.endDate}</p>
                    <p className="font-bold text-white">฿{item.rentalPrice.toLocaleString()} <span className="text-[9px] text-white/40 uppercase tracking-wider">(+฿{item.insurancePrice.toLocaleString()} ประกัน)</span></p>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-white/40 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="space-y-1.5 text-xs text-white/70">
                <div className="flex justify-between">
                  <span className="uppercase text-[10px] tracking-wider text-white/40">ยอดรวมค่าเช่า</span>
                  <span className="font-bold text-white">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="uppercase text-[10px] tracking-wider text-white/40">ประกันความเสียหาย Slay Care (฿150/ชิ้น)</span>
                  <span className="font-bold text-white">฿{insuranceTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span className="flex items-center gap-1 uppercase text-[10px] tracking-wider text-white/40">
                    <Lock className="w-3 h-3 text-white/60" />
                    วงเงินมัดจำประกันสินค้า (กันวงเงินชั่วคราว)
                  </span>
                  <span className="font-bold">฿{totalDepositHold.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-light uppercase tracking-wider text-white pt-2 border-t border-white/10">
                  <span>ยอดชำระสุทธิวันนี้</span>
                  <span className="font-bold">฿{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 text-[10px] text-white/70 uppercase tracking-wider">
                วงเงินมัดจำจำนวน <strong>฿{totalDepositHold.toLocaleString()}</strong> จะถูกกันไว้ชั่วคราวและคืนเข้าบัญชีให้โดยอัตโนมัติเมื่อตรวจสอบรองเท้าหลังคืน
              </div>

              <button
                onClick={handleStartCheckout}
                disabled={loading}
                className="w-full py-3.5 bg-white text-black font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
              >
                <span>{loading ? 'กำลังยืนยันคำสั่งซื้อ...' : `เลือกช่องทางชำระเงิน (฿${grandTotal.toLocaleString()})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

      </div>

      {/* Payment Method Selection Modal */}
      <PaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={grandTotal}
        depositHold={totalDepositHold}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
