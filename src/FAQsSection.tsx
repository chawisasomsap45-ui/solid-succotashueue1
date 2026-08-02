import React, { useState } from 'react';
import { FAQS_DATA } from '../data/faqsData';
import { ChevronDown, Search, HelpCircle, ShieldCheck } from 'lucide-react';

export const FAQsSection: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const categories = ['ทั้งหมด', 'ทั่วไป', 'การทำความสะอาด & ฆ่าเชื้อ', 'เงินมัดจำความปลอดภัย', 'การส่งคืน & ไซส์รองเท้า', 'ความเสียหาย & การประกัน'];

  const filteredFaqs = FAQS_DATA.filter(f => {
    if (selectedCat !== 'ทั้งหมด' && f.category !== selectedCat) return false;
    if (search && !f.question.toLowerCase().includes(search.toLowerCase()) && !f.answer.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <section className="py-20 bg-[#0A0A0A] text-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>ศูนย์คำถาม & คำแนะนำการเช่า</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tighter uppercase text-white">
            คำถามที่พบบ่อย (FAQs)
          </h1>
          <p className="text-xs text-white/50 max-w-xl mx-auto">
            ทุกเรื่องน่ารู้เกี่ยวกับการเช่ารองเท้าแบรนด์เนม ขั้นตอนซักอบฆ่าเชื้อ วงเงินมัดจำ และการจัดส่งคืนพัสดุ
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="ค้นหาคำถาม (เช่น มัดจำ, ทำความสะอาด, ไซส์, ส่งคืน)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-none pl-12 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                selectedCat === cat 
                  ? 'bg-white text-black' 
                  : 'bg-[#111111] border border-white/10 text-white/70 hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center p-8 bg-[#111111] border border-white/10 text-white/50 text-xs uppercase tracking-wider">
              No answers matching "{search}". Please try another keyword or search 'General'.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-wider text-white hover:text-white/80 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-white/50 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs leading-relaxed text-white/70 border-t border-white/10 pt-3 bg-[#0A0A0A]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
};
