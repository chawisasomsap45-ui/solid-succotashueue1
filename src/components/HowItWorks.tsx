import React from 'react';
import { ShoppingBag, PackageCheck, RotateCcw, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface HowItWorksProps {
  onBrowseClick: () => void;
  openSanitizationModal: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onBrowseClick, openSanitizationModal }) => {
  const steps = [
    {
      num: '01',
      title: 'เลือกรองเท้า & ระบุวันเช่า',
      subtitle: 'เลือกเช่า 4 วัน, 10 วัน หรือแพ็กเกจรายเดือน Slay Pass',
      desc: 'เลือกชมรองเท้าแบรนด์เนมแท้ในคลัง ไม่ว่าจะเป็น Nike Dunks, Travis Scott Jordans, ส้นสูง Christian Louboutin หรือรองเท้าหนัง Gucci ระบุวันที่ต้องการรับสินค้า แล้วชำระเงินได้ทันที',
      icon: ShoppingBag,
    },
    {
      num: '02',
      title: 'รับรองเท้าสะอาดพร้อม Slay',
      subtitle: 'ผ่านการซักอบฆ่าเชื้อระดับการแพทย์ พร้อมสวมใส่ทันที',
      desc: 'รองเท้าจัดส่งด่วนถึงหน้าบ้านในถุงกันฝุ่นสูญญากาศปลอดเชื้อ ตรวจเช็กของแท้ 100% สะอาดหอมสดชื่น พร้อมใส่ออกงาน อีเวนต์ ทำคอนเทนต์ หรือถ่ายรูปสุดปัง',
      icon: PackageCheck,
    },
    {
      num: '03',
      title: 'ส่งคืนฟรี สะดวกสบาย',
      subtitle: 'ไม่ต้องซักรองเท้าเองเมื่อใช้งานเสร็จ',
      desc: 'เมื่อครบกำหนดเช่า เพียงนำรองเท้าใส่ถุงพัสดุส่งคืนฟรีที่เราเตรียมไว้ให้ นำไปฝากส่งที่จุดบริการขนส่งใกล้บ้านได้เลย เราดูแลเรื่องการทำความสะอาดล้ำลึกทั้งหมดเอง!',
      icon: RotateCcw,
    }
  ];

  return (
    <section className="py-20 bg-[#0A0A0A] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">3 ขั้นตอนง่ายๆ ในการเช่ารองเท้า</p>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tighter uppercase text-white">
            ขั้นตอนการเช่ารองเท้า
          </h1>
          <p className="text-xs text-white/50">
            ไม่ต้องจ่ายราคาเต็มเพื่อสวมใส่รองเท้าใส่ออกงานเพียงครั้งเดียว สัมผัสความหรูหราแบบไม่ต้องมีข้อผูกมัด ฟรีค่าจัดส่ง พร้อมตัวเลือกประกันภัยคุ้มครอง
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-20">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num}
                className="bg-[#111111] border border-white/10 rounded-2xl p-8 space-y-5 hover:border-white/30 transition-all duration-300 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 border border-white/20 bg-white/5 text-white flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5 text-white/80" />
                  </div>
                  <span className="text-3xl font-light text-white/20 group-hover:text-white/40 transition-colors">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{step.subtitle}</p>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">{step.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sanitization Guarantee Callout Box */}
        <div className="rounded-2xl bg-[#111111] border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>สะอาด ปลอดเชื้อ มาตรฐานระดับการแพทย์</span>
            </div>
            <h3 className="text-xl font-light uppercase tracking-tighter text-white">กังวลเรื่องความสะอาด?</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              รองเท้าทุกคู่ผ่านการอบฆ่าเชื้อด้วยแสง UV-C สตีมไอน้ำแห้งความร้อนสูง 180°C และกำจัดกลิ่นอับด้วยสเปรย์ออร์แกนิกก่อนบรรจุซีลสูญญากาศ ปลอดภัย สดชื่นประทับใจเหมือนรองเท้าใหม่
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <button
              onClick={openSanitizationModal}
              className="px-6 py-3.5 border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest transition-colors"
            >
              ดูรายละเอียดขั้นตอนซักอบฆ่าเชื้อ
            </button>
            <button
              onClick={onBrowseClick}
              className="px-7 py-3.5 bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-transform flex items-center gap-2"
            >
              <span>เลือกดูรองเท้าทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
