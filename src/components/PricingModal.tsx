import React from 'react';
import { Check, Sparkles, Crown, Zap, ShieldCheck } from 'lucide-react';

interface PricingModalProps {
  onSelectPlan: (planName: 'pay_per_rent' | 'slay_pass' | 'vip_black') => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ onSelectPlan }) => {
  const plans = [
    {
      id: 'pay_per_rent' as const,
      name: 'เช่ารายครั้ง (Flex Pay-Per-Rent)',
      price: '฿0',
      period: 'ไม่มีค่าบริการรายเดือน',
      desc: 'เหมาะสำหรับใส่ออกงานแต่งงาน เดินเรดคาร์เพท และอีเวนต์พิเศษครั้งคราว',
      features: [
        'จ่ายเฉพาะเมื่อต้องการเช่า (เริ่มต้น ฿299 / 4 วัน)',
        'เลือกระยะเวลาเช่า 4 วัน หรือ 10 วัน',
        'รวมบริการซักอบฆ่าเชื้อระดับการแพทย์',
        'จัดส่งด่วนมาตรฐานภายใน 2-3 วัน',
        'เช่าเมื่อไหร่ก็ได้ ไม่มีข้อผูกมัด'
      ],
      badge: 'ยอดฮิตสำหรับออกงาน',
      cta: 'เริ่มเช่ารายครั้ง',
      popular: false
    },
    {
      id: 'slay_pass' as const,
      name: 'สมาชิก Slay Pass รายเดือน',
      price: '฿2,500',
      period: '/ เดือน',
      desc: 'สลับเปลี่ยนรองเท้าได้ไม่จำกัดสำหรับเหล่าสนีกเกอร์เฮดและสายแฟชั่น',
      features: [
        'เช่าหมุนเวียนได้พร้อมกัน 2 คู่ตลอดเวลา',
        'สลับคู่ใหม่ได้ไม่จำกัดจำนวนครั้งทุกเดือน',
        'ฟรี! ประกันคุ้มครองรองเท้า Slay Care คุ้มครองความเสียหาย',
        'ฟรี! จัดส่งด่วนพิเศษ 1 วัน พร้อมถุงพัสดุส่งคืน',
        'รับส่วนลด 10% จากราคาเต็ม หากต้องการซื้อขาด'
      ],
      badge: 'แพ็กเกจสมาชิกคุ้มค่าที่สุด',
      cta: 'สมัคร Slay Pass (฿2,500/เดือน)',
      popular: true
    },
    {
      id: 'vip_black' as const,
      name: 'สมาชิก VIP Black Card Vault',
      price: '฿5,500',
      period: '/ เดือน',
      desc: 'เอกสิทธิ์เช่ารองเท้าแรร์ไอเทม Travis Scott, Louboutin Couture และคู่หายากมูลค่าหลักแสนก่อนใคร',
      features: [
        'เช่าหมุนเวียนได้พร้อมกัน 4 คู่',
        'สิทธิ์เข้าถึงคลังรองเท้า Ultra-Hype & GRAIL หายากระดับโลก',
        'บริการผู้ช่วยสไตล์ลิสต์ส่วนตัว 24/7 VIP Concierge',
        'ไม่ต้องกันวงเงินมัดจำความปลอดภัย',
        'บริการจัดส่งด่วนพิเศษรองรับงานต่างประเทศ'
      ],
      badge: 'ความหรูหราขั้นสุด',
      cta: 'ปลดล็อก VIP Black Card',
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-zinc-950 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-bold">
            <Crown className="w-4 h-4" />
            <span>คลับสมาชิก Slay Pass</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            รองเท้าแบรนด์เนมไม่จำกัด ในราคาเหมาจ่ายรายเดือน
          </h1>
          <p className="text-base text-zinc-400">
            หมวดหมุนสไตล์เสื้อผ้าและรองเท้าแบรนด์เนมแท้เปลี่ยนได้ไม่ซ้ำวัน อัปเกรดหรือยกเลิกได้ตลอดเวลาโดยไม่มีข้อผูกมัด
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 border ${
                plan.popular 
                  ? 'bg-zinc-900 border-amber-400 shadow-2xl ring-2 ring-amber-400/30' 
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-lg">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-xs font-medium text-zinc-400">{plan.period}</span>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 space-y-3">
                  <p className="text-xs font-bold uppercase text-amber-400">สิทธิประโยชน์ที่ได้รับ:</p>
                  <ul className="space-y-2.5 text-xs text-zinc-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  className={`w-full py-3.5 px-4 rounded-full font-bold text-xs transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-zinc-950 hover:scale-105 shadow-xl shadow-rose-500/10'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
