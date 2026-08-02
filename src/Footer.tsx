import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Sparkle, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: 'home' | 'catalog' | 'how-it-works' | 'pricing' | 'faqs' | 'account') => void;
  openSizeGuide: () => void;
  openDamagePolicy: () => void;
  openSanitizationModal: () => void;
  openDepositNotice: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  openSizeGuide,
  openDamagePolicy,
  openSanitizationModal,
  openDepositNotice
}) => {
  return (
    <footer className="bg-[#0A0A0A] text-white/60 border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Banners */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-[#111111] border border-white/10 mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10">
              <ShieldCheck className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">ของแท้ 100% ผ่านการตรวจสอบ</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">ตรวจความแท้หลายขั้นตอน</p>
            </div>
          </div>

          <button 
            onClick={openSanitizationModal}
            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10">
              <Sparkles className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">ฆ่าเชื้อระดับการแพทย์</p>
              <p className="text-[10px] text-white/60 uppercase tracking-widest hover:underline">ขั้นตอนอบ UV-C →</p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10">
              <RefreshCw className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">ส่งด่วนฟรีทั่วไทย</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">พร้อมถุงส่งคืนพัสดุฟรี</p>
            </div>
          </div>

          <button 
            onClick={openDepositNotice}
            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0 border border-white/10">
              <Lock className="w-5 h-5 text-white/80" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">นโยบายเงินมัดจำความปลอดภัย</p>
              <p className="text-[10px] text-white/60 uppercase tracking-widest hover:underline">รายละเอียดมัดจำ →</p>
            </div>
          </button>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="/src/assets/images/rent_and_slay_logo_1785494996219.jpg" 
                alt="Rent & Slay Logo" 
                className="w-10 h-10 rounded-xl object-cover border border-white/20 bg-white p-0.5"
                referrerPolicy="no-referrer"
              />
              <span className="text-lg font-bold tracking-tighter italic text-white">RENT & SLAY</span>
            </div>
            <p className="text-xs leading-relaxed text-white/50 max-w-sm">
              บริการเช่ารองเท้าสนีกเกอร์แบรนด์เนมแท้ ส้นสูงดีไซเนอร์ และรองเท้าหรูระดับไฮเอนด์ สวมใส่ดีไซน์ระดับโลกในราคาสบายกระเป๋า
            </p>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-400 font-bold pt-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ส่งมอบความสไตล์ประทับใจไปแล้วกว่า 25,000+ ครั้ง</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-4">สำรวจคลังรองเท้า</p>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><button onClick={() => setActiveTab('catalog')} className="hover:text-white transition-colors">สนีกเกอร์ยอดฮิต</button></li>
              <li><button onClick={() => setActiveTab('catalog')} className="hover:text-white transition-colors">รองเท้าส้นสูง & คัทชูหรู</button></li>
              <li><button onClick={() => setActiveTab('catalog')} className="hover:text-white transition-colors">รองเท้าออกงาน & ทักซิโด้</button></li>
              <li><button onClick={() => setActiveTab('catalog')} className="hover:text-white transition-colors">รองเท้าสายสปอร์ต & เทรล</button></li>
              <li><button onClick={() => setActiveTab('pricing')} className="hover:text-white font-bold transition-colors">สมาชิก Slay Pass รายเดือน</button></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-4">นโยบาย & การดูแล</p>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><button onClick={openSizeGuide} className="hover:text-white transition-colors">ตารางวัดไซส์รองเท้า</button></li>
              <li><button onClick={openDamagePolicy} className="hover:text-white transition-colors">การรับประกันความเสียหาย</button></li>
              <li><button onClick={openSanitizationModal} className="hover:text-white transition-colors">มาตรฐานการซักอบฆ่าเชื้อ</button></li>
              <li><button onClick={openDepositNotice} className="hover:text-white transition-colors">ข้อมูลมัดจำรองเท้า</button></li>
              <li><button onClick={() => setActiveTab('faqs')} className="hover:text-white transition-colors">ศูนย์ช่วยเหลือ & คำถามที่พบบ่อย</button></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-4">บัญชี & การช่วยเหลือ</p>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><button onClick={() => setActiveTab('account')} className="hover:text-white transition-colors">แดชบอร์ดผู้ใช้งาน</button></li>
              <li><button onClick={() => setActiveTab('account')} className="hover:text-white transition-colors">ยืนยันตัวตน (KYC)</button></li>
              <li><button onClick={() => setActiveTab('account')} className="hover:text-white transition-colors">พิมพ์ใบนำส่งคืนพัสดุ</button></li>
              <li><span className="text-white/30">บริการผู้ช่วย VIP Concierge</span></li>
              <li><span className="text-white/30">support@rentandslay.com</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase tracking-widest text-white/40 gap-4">
          <p>© {new Date().getFullYear()} Rent and Slay Inc. สงวนลิขสิทธิ์ทั้งหมด</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">เงื่อนไขการเช่า</span>
            <span className="hover:text-white cursor-pointer">นโยบายความเป็นส่วนตัว</span>
            <span className="hover:text-white cursor-pointer">มาตรฐานความสะอาด</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
