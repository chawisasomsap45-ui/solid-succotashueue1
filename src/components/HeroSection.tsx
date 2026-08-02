import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  PackageCheck, 
  Sparkle,
  Star, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building2,
  Check,
  Smartphone,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Send
} from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, createUserProfileInDb, getUserProfileFromDb, resetPasswordViaEmail } from '../lib/firebase';
import { UserProfile } from '../types';

interface HeroSectionProps {
  onBrowseClick: () => void;
  onHowItWorksClick: () => void;
  userProfile: UserProfile | null;
  onAuthSuccess: (profile: UserProfile) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBrowseClick,
  onHowItWorksClick,
  userProfile,
  onAuthSuccess
}) => {
  // Login Gate / Access Form state for Hero section
  const [heroAuthMode, setHeroAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [shoeSizeUs, setShoeSizeUs] = useState<number>(9);
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [heroErrorMsg, setHeroErrorMsg] = useState('');

  // Forgot password states
  const [resetEmailInput, setResetEmailInput] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  // Auto-fill saved credentials on mount if available
  useEffect(() => {
    const saved = localStorage.getItem('rentandslay_remembered_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.identifier || parsed.email) {
          const loadedId = parsed.identifier || parsed.email || '';
          setIdentifier(loadedId);
          setEmail(parsed.email || loadedId);
          if (parsed.password) setPassword(parsed.password);
          setRememberMe(true);
        }
      } catch (e) {
        console.warn('Hero section remembered credentials parse error', e);
      }
    }
  }, []);

  const getAuthErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please log in instead.';
      case 'auth/user-not-found':
        return 'No account found with this email address. Please sign up.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please check your credentials.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/too-many-requests':
        return 'Access temporarily blocked due to many failed attempts. Please try again later.';
      default:
        return 'Authentication failed. Please verify your email and password.';
    }
  };

  const handleHeroAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeroErrorMsg('');
    setLoading(true);

    const userEmail = email || (identifier.includes('@') ? identifier : `${identifier}@rentandslay.com`);

    try {
      if (heroAuthMode === 'login') {
        const userCred = await signInWithEmailAndPassword(auth, userEmail, password);
        const uid = userCred.user.uid;

        if (rememberMe) {
          localStorage.setItem('rentandslay_remembered_credentials', JSON.stringify({
            identifier: identifier || userEmail,
            email: userEmail,
            password: password,
            rememberMe: true
          }));
        } else {
          localStorage.removeItem('rentandslay_remembered_credentials');
        }

        let profile = await getUserProfileFromDb(uid);
        if (!profile) {
          profile = {
            uid,
            email: userCred.user.email || userEmail,
            fullName: userCred.user.displayName || userEmail.split('@')[0],
            role: 'renter',
            kycStatus: 'unsubmitted',
            shoeSizeUs: 9,
            shoeSizeEu: 42,
            isVerified: true,
            verificationStatus: 'verified',
            subscriptionPlan: 'pay_per_rent',
            subscriptionStatus: 'active',
            createdAt: new Date().toISOString()
          };
          await createUserProfileInDb(profile);
        }
        onAuthSuccess(profile);
      } else if (heroAuthMode === 'signup') {
        if (!termsAgreed) {
          setHeroErrorMsg('You must agree to the Terms of Service & Rental Agreement.');
          setLoading(false);
          return;
        }

        const userCred = await createUserWithEmailAndPassword(auth, userEmail, password);
        const uid = userCred.user.uid;

        if (rememberMe) {
          localStorage.setItem('rentandslay_remembered_credentials', JSON.stringify({
            identifier: userEmail,
            email: userEmail,
            password: password,
            rememberMe: true
          }));
        }

        const profile: UserProfile = {
          uid,
          email: userCred.user.email || userEmail,
          fullName: fullName || userEmail.split('@')[0],
          role: 'renter',
          kycStatus: 'unsubmitted',
          shoeSizeUs: Number(shoeSizeUs) || 9,
          shoeSizeEu: Number(shoeSizeUs) + 33 || 42,
          isVerified: false,
          verificationStatus: 'unverified',
          subscriptionPlan: 'pay_per_rent',
          subscriptionStatus: 'none',
          createdAt: new Date().toISOString()
        };

        await createUserProfileInDb(profile);
        onAuthSuccess(profile);
      }
    } catch (err: any) {
      console.error('Hero Auth error:', err);
      setHeroErrorMsg(getAuthErrorMessage(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleHeroResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeroErrorMsg('');
    setResetSuccessMsg('');
    setLoading(true);

    const targetEmail = resetEmailInput || email || (identifier.includes('@') ? identifier : '');
    if (!targetEmail) {
      setHeroErrorMsg('กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน (Please enter your email)');
      setLoading(false);
      return;
    }

    try {
      const res = await resetPasswordViaEmail(targetEmail);
      if (res.success) {
        setResetSuccessMsg(res.message);
      } else {
        setHeroErrorMsg(res.message);
      }
    } catch (err) {
      console.error('Hero reset password error', err);
      setHeroErrorMsg('ไม่สามารถส่งคำขอได้ กรุณาตรวจสอบอีเมลของคุณ');
    } finally {
      setLoading(false);
    }
  };

  const handleHeroQuickSocial = (provider: string) => {
    const profile: UserProfile = {
      uid: 'social_user_' + Math.random().toString(36).substr(2, 6),
      email: `${provider.toLowerCase()}user@rentandslay.com`,
      fullName: `${provider} Slay Member`,
      role: 'renter',
      kycStatus: 'unsubmitted',
      shoeSizeUs: 9.5,
      shoeSizeEu: 43,
      isVerified: true,
      verificationStatus: 'verified',
      subscriptionPlan: 'slay_pass',
      subscriptionStatus: 'active',
      createdAt: new Date().toISOString()
    };
    onAuthSuccess(profile);
  };

  return (
    <div className="relative overflow-hidden bg-[#0A0A0A] text-white pt-8 pb-16 border-b border-white/10">
      {/* Subtle Ambient Background Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-white/[0.03] blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT SIDE: Brand Name, Slogan, Mission Statement, Core Value Highlights, Social Proof */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-[10px] font-bold uppercase tracking-[0.25em]">
              <Sparkles className="w-3.5 h-3.5 text-white/90" />
              <span>RENT THE HYPE. SLAY THE LOOK.</span>
            </div>

            {/* Brand Title & Hero Heading */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 justify-center lg:justify-start mb-2">
                <img 
                  src="/src/assets/images/rent_and_slay_logo_1785494996219.jpg" 
                  alt="Rent & Slay Logo" 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-2xl bg-white p-1 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-white/40">BRAND PLATFORM</p>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light leading-[0.95] tracking-tighter uppercase text-white">
                    RENT AND SLAY
                  </h1>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <p className="max-w-xl text-xs sm:text-sm text-white/70 leading-relaxed mx-auto lg:mx-0 border-l-2 border-white/20 pl-4 py-1 italic">
              "จะซื้อทำไม ในเมื่อคุณสามารถ Slay ได้ตลอดเวลา? สัมผัสประสบการณ์เช่าสนีกเกอร์รุ่นหายาก รองเท้าสตรีทแวร์ระดับไอคอน และส้นสูงแบรนด์เนมระดับโลกในราคาเพียงสิวๆ สไตล์โดดเด่นไร้ขีดจำกัด"
            </p>

            {/* Core Value Highlights (3 Key Points) */}
            <div className="space-y-3 pt-2 text-left max-w-xl mx-auto lg:mx-0">
              <div className="p-3 bg-[#111111] border border-white/10 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg shrink-0 text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white">👟 ของแท้ 100% ทุกคู่</p>
                  <p className="text-[11px] text-white/50 leading-tight">ผ่านการตรวจสอบความแท้โดยผู้เชี่ยวชาญสนีกเกอร์และแบรนด์เนมชั้นนำ</p>
                </div>
              </div>

              <div className="p-3 bg-[#111111] border border-white/10 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg shrink-0 text-white">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white">✨ ทำความสะอาด & ฆ่าเชื้อระดับการแพทย์</p>
                  <p className="text-[11px] text-white/50 leading-tight">ซักอบฆ่าเชื้อด้วย UV-C และสตีมไอน้ำความร้อนสูง พร้อมสวมใส่อย่างมั่นใจ</p>
                </div>
              </div>

              <div className="p-3 bg-[#111111] border border-white/10 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-white/5 border border-white/10 rounded-lg shrink-0 text-white">
                  <PackageCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white">📦 ส่งถึงหน้าบ้าน & ส่งคืนฟรีง่ายดาย</p>
                  <p className="text-[11px] text-white/50 leading-tight">จัดส่งด่วนถึงมือพร้อมใบจัดส่งพัสดุสำหรับส่งคืนฟรีแบบลงทะเบียนล่วงหน้า</p>
                </div>
              </div>
            </div>

            {/* Social Proof / Trust Badge */}
            <div className="p-4 bg-[#111111] border border-white/10 rounded-xl max-w-xl mx-auto lg:mx-0 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">รีวิว 4.9/5 คะแนน</span>
              </div>

              <p className="text-[11px] text-white/60 italic text-center sm:text-right">
                "สายแฟชั่นและสตรีทสไตล์กว่า 2,000+ คนเลือกยกระดับการแต่งตัวกับเรา"
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onBrowseClick}
                className="bg-white text-black px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all w-full sm:w-auto text-center rounded-lg shadow-lg"
              >
                เลือกดูแคตตาล็อกรองเท้า
              </button>

              <button
                onClick={onHowItWorksClick}
                className="border border-white/20 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all w-full sm:w-auto text-center rounded-lg"
              >
                ขั้นตอนการเช่า
              </button>
            </div>

          </div>

          {/* RIGHT SIDE: Login Gate / Access Form */}
          <div className="lg:col-span-5">
            {userProfile ? (
              /* Already logged in view */
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6 text-white shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest">Active Member Session</span>
                    <h2 className="text-lg font-bold uppercase tracking-tight text-white">{userProfile.fullName || 'Slay Member'}</h2>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white text-black font-extrabold flex items-center justify-center text-sm">
                    {userProfile.fullName ? userProfile.fullName[0].toUpperCase() : 'S'}
                  </div>
                </div>

                <div className="p-4 bg-[#0A0A0A] border border-white/10 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Closet Access:</span>
                    <span className="font-bold text-emerald-400">UNLOCKED ✔</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Shoe Size:</span>
                    <span className="font-bold text-white">US {userProfile.shoeSizeUs} / EU {userProfile.shoeSizeEu}</span>
                  </div>
                </div>

                <button
                  onClick={onBrowseClick}
                  className="w-full py-4 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 transition-all rounded-lg flex items-center justify-center gap-2"
                >
                  <span>Explore Shoe Closet</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Login Gate / Access Form Card */
              <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-5 text-white shadow-2xl relative">
                
                {/* Form Header */}
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold uppercase tracking-tight text-white">
                    ยินดีต้อนรับสู่ Rent and Slay
                  </h2>
                  <p className="text-[11px] text-white/50">
                    เข้าสู่ระบบหรือสมัครสมาชิกเพื่อเริ่มต้นเช่ารองเท้าแบรนด์เนม
                  </p>
                </div>

                {/* Tab Switcher */}
                {heroAuthMode !== 'forgot' ? (
                  <div className="grid grid-cols-2 bg-[#0A0A0A] p-1 border border-white/10 rounded-xl text-center">
                    <button
                      type="button"
                      onClick={() => { setHeroAuthMode('login'); setHeroErrorMsg(''); setResetSuccessMsg(''); }}
                      className={`py-2 text-[11px] font-bold uppercase tracking-wider transition-all rounded-lg ${
                        heroAuthMode === 'login'
                          ? 'bg-white text-black shadow-md'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Log In / เข้าสู่ระบบ
                    </button>
                    <button
                      type="button"
                      onClick={() => { setHeroAuthMode('signup'); setHeroErrorMsg(''); setResetSuccessMsg(''); }}
                      className={`py-2 text-[11px] font-bold uppercase tracking-wider transition-all rounded-lg ${
                        heroAuthMode === 'signup'
                          ? 'bg-white text-black shadow-md'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Sign Up / สมัครสมาชิก
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-[#0A0A0A] px-3 py-2 border border-white/10 rounded-xl text-white/80 text-xs">
                    <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 text-[10px]">
                      <KeyRound className="w-3.5 h-3.5" />
                      Reset Password / ลืมรหัสผ่าน
                    </span>
                    <button
                      type="button"
                      onClick={() => { setHeroAuthMode('login'); setHeroErrorMsg(''); setResetSuccessMsg(''); }}
                      className="text-[9px] uppercase font-bold text-white hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Back / กลับ
                    </button>
                  </div>
                )}

                {heroErrorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium rounded-lg">
                    {heroErrorMsg}
                  </div>
                )}

                {/* FORGOT PASSWORD FORM */}
                {heroAuthMode === 'forgot' ? (
                  <form onSubmit={handleHeroResetPassword} className="space-y-3.5">
                    {resetSuccessMsg ? (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-emerald-400">ส่งคำขอตั้งรหัสผ่านใหม่แล้ว!</h4>
                          <p className="text-[10px] text-white/80 leading-relaxed">
                            {resetSuccessMsg}
                          </p>
                        </div>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => { setHeroAuthMode('login'); setHeroErrorMsg(''); setResetSuccessMsg(''); }}
                            className="w-full py-2 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-white/90 transition-all"
                          >
                            กลับสู่หน้าเข้าสู่ระบบ (Back to Log In)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-white/70 leading-relaxed">
                            กรอกอีเมลลงทะเบียนเพื่อรับลิงก์สำหรับเปลี่ยนรหัสผ่านทางอีเมล
                          </p>
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                              Email Address / อีเมล
                            </label>
                            <div className="relative">
                              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                              <input
                                type="email"
                                required
                                placeholder="slayuser@rentandslay.com"
                                value={resetEmailInput || email || (identifier.includes('@') ? identifier : '')}
                                onChange={(e) => setResetEmailInput(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 bg-amber-500 text-black font-extrabold text-[11px] uppercase tracking-widest hover:bg-amber-400 transition-all rounded-lg flex items-center justify-center gap-1.5 shadow-lg"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{loading ? 'Sending...' : 'ส่งลิงก์เปลี่ยนรหัสผ่านไปยังอีเมล'}</span>
                        </button>

                        <div className="text-center pt-1">
                          <button
                            type="button"
                            onClick={() => setHeroAuthMode('login')}
                            className="text-[10px] text-white/60 hover:text-white uppercase tracking-wider font-bold"
                          >
                            จำรหัสผ่านได้แล้ว? กลับไปเข้าสู่ระบบ
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                ) : (
                  /* Form Body */
                  <form onSubmit={handleHeroAuthSubmit} className="space-y-3.5">
                    
                    {/* TAB 1: LOG IN */}
                    {heroAuthMode === 'login' && (
                      <>
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                            อีเมล / เบอร์โทรศัพท์
                          </label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                              type="text"
                              required
                              placeholder="อีเมล หรือ เบอร์โทรศัพท์ 08x-xxx-xxxx"
                              value={identifier}
                              onChange={(e) => setIdentifier(e.target.value)}
                              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                            รหัสผ่าน
                          </label>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                              type="password"
                              required
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-white/60 pt-0.5">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="accent-white w-3 h-3"
                            />
                            <span className="text-[9px] uppercase tracking-wider">จำรหัสผ่านผู้ใช้งาน</span>
                          </label>
                          <button 
                            type="button" 
                            onClick={() => { setHeroAuthMode('forgot'); setHeroErrorMsg(''); setResetSuccessMsg(''); }} 
                            className="text-[9px] uppercase tracking-wider text-amber-400 hover:underline font-bold"
                          >
                            ลืมรหัสผ่าน?
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 transition-all rounded-lg"
                        >
                          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ / SLAY NOW'}
                        </button>

                        {/* Social Login Options */}
                        <div className="space-y-2 pt-2 border-t border-white/10 text-center">
                          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">หรือเข้าสู่ระบบด้วย</p>
                          <div className="grid grid-cols-3 gap-1.5">
                            <button 
                              type="button"
                              onClick={() => handleHeroQuickSocial('Google')}
                              className="py-2 bg-[#0A0A0A] border border-white/10 text-[9px] uppercase tracking-widest font-bold text-white/80 hover:bg-white/10 rounded"
                            >
                              Google
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleHeroQuickSocial('Apple')}
                              className="py-2 bg-[#0A0A0A] border border-white/10 text-[9px] uppercase tracking-widest font-bold text-white/80 hover:bg-white/10 rounded"
                            >
                              Apple
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleHeroQuickSocial('KBank')}
                              className="py-2 bg-emerald-500/10 border border-emerald-500/30 text-[8px] uppercase tracking-widest font-bold text-emerald-400 hover:bg-emerald-500/20 rounded flex items-center justify-center gap-1"
                            >
                              <Building2 className="w-2.5 h-2.5" />
                              KBank
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                  {/* TAB 2: SIGN UP */}
                  {heroAuthMode === 'signup' && (
                    <>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">ชื่อ - นามสกุล</label>
                        <input
                          type="text"
                          required
                          placeholder="สมชาย สายเปย์"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">อีเมล</label>
                        <input
                          type="email"
                          required
                          placeholder="slayuser@rentandslay.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                          เบอร์โทรศัพท์ (รองรับ KPlus / พร้อมเพย์)
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="081-234-5678"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                            ไซส์รองเท้า
                          </label>
                          <select
                            value={shoeSizeUs}
                            onChange={(e) => setShoeSizeUs(Number(e.target.value))}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                          >
                            {[6, 7, 8, 9, 10, 11, 12].map(s => (
                              <option key={s} value={s} className="bg-[#0A0A0A]">US {s}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 block mb-1">รหัสผ่าน</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-white/40"
                          />
                        </div>
                      </div>

                      <label className="flex items-start gap-1.5 cursor-pointer text-xs text-white/70 pt-1">
                        <input
                          type="checkbox"
                          checked={termsAgreed}
                          onChange={(e) => setTermsAgreed(e.target.checked)}
                          className="accent-white w-3.5 h-3.5 mt-0.5 shrink-0"
                        />
                        <span className="text-[9px] leading-tight">
                          ฉันยอมรับเงื่อนไขบริการและข้อตกลงการเช่ารองเท้า
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 transition-all rounded-lg"
                      >
                        {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก & เริ่มเช่ารองเท้า'}
                      </button>
                    </>
                  )}

                </form>
                )}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
