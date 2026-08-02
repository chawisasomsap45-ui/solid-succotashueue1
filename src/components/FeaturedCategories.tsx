import React from 'react';
import { ShoeCategory } from '../types';
import { Flame, Crown, Gem, Activity, ArrowRight } from 'lucide-react';

interface FeaturedCategoriesProps {
  onSelectCategory: (cat: ShoeCategory) => void;
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ onSelectCategory }) => {
  const categories = [
    {
      id: 'Sneakers' as ShoeCategory,
      title: 'สตรีทแวร์ & สนีกเกอร์ฮิต',
      sub: 'Nike Dunks, Jordans, Yeezys, Off-White',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      icon: Flame,
      badge: '01 / คลังสนีกเกอร์'
    },
    {
      id: 'Heels' as ShoeCategory,
      title: 'ส้นสูง & รองเท้าหรู',
      sub: 'Balenciaga, Gucci, Christian Louboutin, Jimmy Choo',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
      icon: Crown,
      badge: '02 / แฟชั่นระดับไฮเอนด์'
    },
    {
      id: 'Formal' as ShoeCategory,
      title: 'รองเท้าทางการ & งานราตรี',
      sub: 'รองเท้าหนังทักซิโด้, ส้นสูงงานกาล่า, รองเท้าแต่งงาน',
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80',
      icon: Gem,
      badge: '03 / งานกาล่า & ออกงาน'
    },
    {
      id: 'Performance' as ShoeCategory,
      title: 'สายสปอร์ต & กิจกรรมกลางแจ้ง',
      sub: 'รองเท้าวิ่งเทรล, Salomon XT-6, สปอร์ตแวร์',
      image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
      icon: Activity,
      badge: '04 / สปอร์ต & เอาท์ดอร์'
    }
  ];

  return (
    <section className="py-20 bg-[#0A0A0A] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-2">หมวดหมู่รองเท้าคัดสรรพิเศษ</p>
            <h2 className="text-3xl sm:text-5xl font-light uppercase tracking-tighter text-white">
              หมวดหมู่ <span className="italic text-white/40 font-normal">ยอดนิยม.</span>
            </h2>
          </div>
          <button
            onClick={() => onSelectCategory('Sneakers')}
            className="text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all self-start sm:self-auto"
          >
            เลือกดูแคตตาล็อกทั้งหมด →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer border border-white/10 hover:border-white/30 transition-all duration-500 bg-[#111111]"
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-75"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Badge */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-white/70">
                  {cat.badge}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4 text-white/80" />
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-white">{cat.title}</h3>
                  <p className="text-[11px] text-white/50 font-medium line-clamp-2">{cat.sub}</p>

                  <div className="pt-3 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-white group-hover:translate-x-1 transition-transform">
                    <span>เช่าเริ่มต้น ฿{cat.id === 'Sneakers' ? '299' : cat.id === 'Heels' ? '490' : '399'} / 4 วัน</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
