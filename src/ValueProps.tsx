import React from 'react';
import { ShieldCheck, Sparkles, RefreshCw, ArrowUpRight } from 'lucide-react';

interface ValuePropsProps {
  openSanitizationModal: () => void;
  openHowItWorks: () => void;
}

export const ValueProps: React.FC<ValuePropsProps> = ({
  openSanitizationModal,
  openHowItWorks
}) => {
  return (
    <section className="py-20 bg-[#0A0A0A] border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">การรับประกัน & มาตรฐานระดับสากล</p>
          <h2 className="text-3xl sm:text-5xl font-light uppercase tracking-tighter text-white">
            นิยามใหม่ของการเช่า <span className="italic text-white/40 font-normal">รองเท้าหรู.</span>
          </h2>
          <p className="text-xs text-white/50 max-w-lg mx-auto">
            สัมผัสประสบการณ์สวมใส่รองเท้าแบรนด์เนมแท้ 100% สบายใจด้วยมาตรฐานสุขอนามัยระดับการแพทย์ ยืดหยุ่นทุกช่วงเวลาเช่า
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: 100% Authenticity Guaranteed */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 text-white border border-white/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white/80" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40">มาตรฐานการตรวจสอบ</div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">ของแท้ 100% Guaranteed</h3>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                รองเท้าทุกคู่ผ่านการตรวจสภาพ ชั่งน้ำหนัก และยืนยันความแท้โดยผู้เชี่ยวชาญก่อนจัดส่ง ไร้ความเสี่ยงของเลียนแบบ 100%
              </p>
            </div>
            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/60 font-bold">
              <span>ตราประทับยืนยันความแท้</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Card 2: Deep-Cleaned & Sanitized */}
          <div 
            onClick={openSanitizationModal}
            className="bg-[#111111] border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 text-white border border-white/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-white/80" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40">มาตรฐานสุขอนามัย</div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">ฆ่าเชื้อระดับการแพทย์</h3>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                ทำความสะอาดและอบฆ่าเชื้อด้วย UV-C สตีมไอน้ำความร้อนสูง และผลิตภัณฑ์กำจัดกลิ่นอับออร์แกนิก เพื่อความสะอาดสดชื่นเหมือนใหม่ทุกครั้ง
              </p>
            </div>
            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/80 font-bold group-hover:text-white transition-colors">
              <span>ชมกระบวนการ 4 ขั้นตอน</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Flexibility & Freedom */}
          <div 
            onClick={openHowItWorks}
            className="bg-[#111111] border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/10 text-white border border-white/10 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-6 h-6 text-white/80" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40">ระยะเวลาเช่ายืดหยุ่น</div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">เช่าได้ 4 ถึง 30 วัน</h3>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                เลือกเช่าระยะสั้น 4 วัน, 10 วัน หรือสมัคร Slay Pass รายเดือน ส่งคืนง่ายด้วยถุงพัสดุเตรียมพร้อม และสลับคู่ใหม่ตามใจคุณ
              </p>
            </div>
            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/80 font-bold group-hover:text-white transition-colors">
              <span>คู่มือการสลับคู่เช่า</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
