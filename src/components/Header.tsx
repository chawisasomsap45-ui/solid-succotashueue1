import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Search, 
  Sparkles, 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck, 
  Clock,
  Crown
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'home' | 'catalog' | 'how-it-works' | 'pricing' | 'faqs' | 'account' | 'lender';
  setActiveTab: (tab: 'home' | 'catalog' | 'how-it-works' | 'pricing' | 'faqs' | 'account' | 'lender') => void;
  cartCount: number;
  wishlistCount: number;
  openCart: () => void;
  openAuthModal: (mode: 'login' | 'signup') => void;
  userProfile: UserProfile | null;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AUTHORIZED_ADMIN_EMAILS = [
  'nondnoey1749@gmail.com',
  'admin@rentandslay.com'
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  wishlistCount,
  openCart,
  openAuthModal,
  userProfile,
  onLogout,
  searchQuery,
  setSearchQuery
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNav = (tab: 'home' | 'catalog' | 'how-it-works' | 'pricing' | 'faqs' | 'account' | 'lender') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const isUserAdmin = userProfile?.email && (
    AUTHORIZED_ADMIN_EMAILS.includes(userProfile.email.toLowerCase()) || 
    userProfile.role === 'admin'
  );

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 text-white/90 border-b border-amber-500/30 text-[11px] font-medium tracking-wide uppercase py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>ใส่โค้ดส่วนลด <strong className="text-amber-400 font-extrabold">SLAY20</strong> รับส่วนลด 20% สำหรับการเช่าครั้งแรก • บริการฆ่าเชื้อลวดลายและซักอบฆ่าเชื้อฟรี</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Logo */}
        <button 
          onClick={() => handleNav('home')}
          className="flex items-center text-left group focus:outline-none shrink-0"
        >
          <img 
            src="/src/assets/images/rent_and_slay_logo_1785494996219.jpg" 
            alt="Rent & Slay Logo" 
            className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover border border-amber-500/40 shadow-lg group-hover:scale-105 transition-all bg-white shrink-0"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-5 text-[11px] xl:text-xs uppercase tracking-wider font-bold text-white/70">
          <button
            onClick={() => handleNav('home')}
            className={`whitespace-nowrap hover:text-amber-400 transition-colors py-1 ${activeTab === 'home' ? 'text-amber-400 font-extrabold relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400 after:rounded-full' : ''}`}
          >
            หน้าแรก
          </button>
          <button
            onClick={() => handleNav('catalog')}
            className={`whitespace-nowrap hover:text-amber-400 transition-colors py-1 ${activeTab === 'catalog' ? 'text-amber-400 font-extrabold relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400 after:rounded-full' : ''}`}
          >
            เลือกดูรองเท้า
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className={`whitespace-nowrap hover:text-amber-400 transition-colors py-1 ${activeTab === 'how-it-works' ? 'text-amber-400 font-extrabold relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400 after:rounded-full' : ''}`}
          >
            ขั้นตอนการเช่า
          </button>
          <button
            onClick={() => handleNav('pricing')}
            className={`whitespace-nowrap hover:text-amber-400 transition-colors py-1 ${activeTab === 'pricing' ? 'text-amber-400 font-extrabold relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400 after:rounded-full' : ''}`}
          >
            แพ็กเกจ & ราคา
          </button>
          <button
            onClick={() => handleNav('faqs')}
            className={`whitespace-nowrap hover:text-amber-400 transition-colors py-1 ${activeTab === 'faqs' ? 'text-amber-400 font-extrabold relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400 after:rounded-full' : ''}`}
          >
            คำถามที่พบบ่อย
          </button>
          <button
            onClick={() => handleNav('lender')}
            className={`whitespace-nowrap px-2.5 py-1.5 border border-amber-500/50 text-amber-300 hover:bg-amber-500 hover:text-black font-extrabold transition-all rounded-xl flex items-center gap-1 text-[11px] ${activeTab === 'lender' ? 'bg-amber-500 text-black' : ''}`}
          >
            <span>ปล่อยเช่ารองเท้า</span>
          </button>

          {isUserAdmin && (
            <button
              onClick={() => handleNav('account')}
              className={`whitespace-nowrap px-2.5 py-1.5 border border-amber-400 bg-amber-500 text-black font-black transition-all rounded-xl flex items-center gap-1 text-[11px] shadow-lg animate-pulse`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>พอร์ตัลผู้ดูแลระบบ</span>
            </button>
          )}
        </nav>

        {/* Search Bar & User Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search */}
          <div className="hidden xl:relative xl:block w-40">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text"
              placeholder="ค้นหารองเท้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNav('catalog');
              }}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 transition-all"
            />
          </div>

          {/* Wishlist Button */}
          <button 
            onClick={() => handleNav('account')}
            className="relative p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
            title="รายการโปรด"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button 
            onClick={openCart}
            className="relative p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
            title="กระเป๋าเช่า"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth Button / Profile Menu */}
          {userProfile ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 border text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                  isUserAdmin
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black'
                    : 'border-white/20 text-white hover:bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] ${
                  isUserAdmin ? 'bg-amber-400 text-black' : 'bg-white text-black'
                }`}>
                  {userProfile.fullName ? userProfile.fullName[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate">
                  {isUserAdmin ? 'Admin' : (userProfile.fullName || 'ผู้ใช้งาน')}
                </span>
                {isUserAdmin && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[8px] font-black rounded">ADMIN</span>
                )}
                {userProfile.isVerified && !isUserAdmin && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#111111] border border-amber-500/30 shadow-2xl rounded-2xl py-2 z-50 text-xs text-white/80">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="font-bold text-white truncate flex items-center gap-1.5">
                      {userProfile.fullName || 'สมาชิก Slay'}
                      {isUserAdmin && (
                        <span className="px-1.5 py-0.2 bg-amber-500 text-black font-black text-[8px] uppercase rounded">
                          ADMIN
                        </span>
                      )}
                    </p>
                    <p className="text-white/40 truncate text-[10px] font-mono">{userProfile.email}</p>
                  </div>

                  <button
                    onClick={() => handleNav('account')}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 flex items-center gap-2 text-white/90 font-bold text-[11px]"
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{isUserAdmin ? 'พอร์ตัลผู้ดูแลระบบ' : 'แดชบอร์ด & รายการเช่า'}</span>
                  </button>

                  <button
                    onClick={() => handleNav('lender')}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/10 flex items-center gap-2 text-amber-300 font-bold text-[11px]"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>ศูนย์ผู้ให้เช่า (Lender Hub)</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2.5 hover:bg-rose-500/10 text-rose-400 flex items-center gap-2 border-t border-white/10 mt-1 font-bold text-[11px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>ออกจากระบบ</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => openAuthModal('login')}
                className="text-[11px] font-bold uppercase tracking-wider px-2 sm:px-3 py-2 text-white/70 hover:text-white transition-colors whitespace-nowrap"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md whitespace-nowrap"
              >
                สมัครสมาชิก
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0A0A] border-b border-white/10 px-6 py-6 space-y-4 text-xs font-bold uppercase tracking-wider text-white/80">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text"
              placeholder="ค้นหารองเท้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none"
            />
          </div>
          
          <button onClick={() => handleNav('home')} className="block w-full text-left py-1 hover:text-amber-400">หน้าแรก</button>
          <button onClick={() => handleNav('catalog')} className="block w-full text-left py-1 hover:text-amber-400">เลือกดูรองเท้า</button>
          <button onClick={() => handleNav('how-it-works')} className="block w-full text-left py-1 hover:text-amber-400">ขั้นตอนการเช่า</button>
          <button onClick={() => handleNav('pricing')} className="block w-full text-left py-1 hover:text-amber-400">แพ็กเกจ & ราคา</button>
          <button onClick={() => handleNav('faqs')} className="block w-full text-left py-1 hover:text-amber-400">คำถามที่พบบ่อย</button>
          <button onClick={() => handleNav('lender')} className="block w-full text-left py-1 text-amber-300">ปล่อยเช่ารองเท้า</button>
          <button onClick={() => handleNav('account')} className="block w-full text-left py-2 text-white font-bold border-t border-white/10 pt-3">แดชบอร์ดผู้ใช้งาน</button>
        </div>
      )}
    </header>
  );
};
