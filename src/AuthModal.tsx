import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Ruler, 
  ShieldAlert, 
  Check, 
  Sparkles, 
  ArrowRight,
  Smartphone,
  Building2,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Send
} from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, createUserProfileInDb, getUserProfileFromDb, resetPasswordViaEmail } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
  onAuthSuccess: (profile: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  onAuthSuccess
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  
  // Form fields
  const [identifier, setIdentifier] = useState(''); // Email / Phone Number
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [shoeSizeUs, setShoeSizeUs] = useState<number>(9);
  const [shoeSizeEu, setShoeSizeEu] = useState<number>(42);
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Forgot password fields
  const [resetEmailInput, setResetEmailInput] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load saved credentials if 'Remember Me' was enabled previously
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
      } catch (err) {
        console.warn('Error reading saved credentials', err);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const userEmail = email || (identifier.includes('@') ? identifier : `${identifier}@rentandslay.com`);

    try {
      if (mode === 'login') {
        const userCred = await signInWithEmailAndPassword(auth, userEmail, password);
        const uid = userCred.user.uid;

        // Remember Me handler
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
        onClose();
      } else if (mode === 'signup') {
        if (!termsAgreed) {
          setErrorMsg('You must agree to the Terms of Service, Privacy Policy, and Rental Agreement.');
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
          shoeSizeEu: Number(shoeSizeEu) || 42,
          isVerified: false,
          verificationStatus: 'unverified',
          subscriptionPlan: 'pay_per_rent',
          subscriptionStatus: 'none',
          createdAt: new Date().toISOString()
        };

        await createUserProfileInDb(profile);
        onAuthSuccess(profile);
        onClose();
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      setErrorMsg(getAuthErrorMessage(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetSuccessMsg('');
    setLoading(true);

    const targetEmail = resetEmailInput || email || (identifier.includes('@') ? identifier : '');
    if (!targetEmail) {
      setErrorMsg('กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน (Please enter your registered email address)');
      setLoading(false);
      return;
    }

    try {
      const res = await resetPasswordViaEmail(targetEmail);
      if (res.success) {
        setResetSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      console.error('Reset password exception', err);
      setErrorMsg('ไม่สามารถส่งคำขอได้ กรุณาตรวจสอบอีเมลของคุณ');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSocialLogin = (provider: string) => {
    const profile: UserProfile = {
      uid: 'social_user_' + Math.random().toString(36).substr(2, 6),
      email: `${provider.toLowerCase()}user@rentandslay.com`,
      fullName: `${provider} Fashion Lover`,
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-white shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-2 bg-[#111111] text-white/50 hover:text-white border border-white/10 transition-colors rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Form Header */}
        <div className="text-center space-y-2">
          <img 
            src="/src/assets/images/rent_and_slay_logo_1785494996219.jpg" 
            alt="Rent & Slay Logo" 
            className="w-14 h-14 rounded-xl object-cover border border-white/20 bg-white p-0.5 mx-auto shadow-lg"
            referrerPolicy="no-referrer"
          />
          <h2 className="text-2xl font-light uppercase tracking-tighter text-white">
            Welcome to Rent and Slay
          </h2>
          <p className="text-xs text-white/60">
            Please log in or create an account to unlock our full shoe closet.
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' ? (
          <div className="grid grid-cols-2 bg-[#111111] p-1 border border-white/10 rounded-xl text-center">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); setResetSuccessMsg(''); }}
              className={`py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-lg ${
                mode === 'login'
                  ? 'bg-white text-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Log In / เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); setResetSuccessMsg(''); }}
              className={`py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-lg ${
                mode === 'signup'
                  ? 'bg-white text-black shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign Up / สมัครสมาชิก
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-[#111111] px-4 py-2.5 border border-white/10 rounded-xl text-white/80 text-xs">
            <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Reset Password / ลืมรหัสผ่าน
            </span>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); setResetSuccessMsg(''); }}
              className="text-[10px] uppercase font-bold text-white hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Back / กลับ
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {resetSuccessMsg ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-400">ส่งคำขอตั้งรหัสผ่านใหม่เรียบร้อยแล้ว!</h4>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {resetSuccessMsg}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMsg(''); setResetSuccessMsg(''); }}
                    className="w-full py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white/90 transition-all"
                  >
                    กลับสู่หน้าเข้าสู่ระบบ (Back to Log In)
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-xs text-white/70 leading-relaxed">
                    กรอกอีเมลที่คุณใช้ลงทะเบียน ระบบจะส่งลิงก์และคำแนะนำสำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณทันที
                  </p>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                      Email Address / อีเมลลงทะเบียน
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        required
                        placeholder="slayuser@rentandslay.com"
                        value={resetEmailInput || email || (identifier.includes('@') ? identifier : '')}
                        onChange={(e) => setResetEmailInput(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-amber-500 text-black font-extrabold text-xs uppercase tracking-widest hover:bg-amber-400 transition-all rounded-lg flex items-center justify-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending Request...' : 'ส่งลิงก์ตั้งรหัสผ่านไปยังอีเมล'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-white/60 hover:text-white uppercase tracking-wider font-bold"
                  >
                    จำรหัสผ่านได้แล้ว? กลับไปหน้าเข้าสู่ระบบ
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          /* FORM BODY */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* TAB 1: LOG IN */}
            {mode === 'login' && (
              <>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                    Email / Phone Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      required
                      placeholder="Email address or 08x-xxx-xxxx"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/60 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-white w-3.5 h-3.5"
                    />
                    <span className="text-[10px] uppercase tracking-wider">Remember me (จำรหัสผ่าน)</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setErrorMsg(''); setResetSuccessMsg(''); }} 
                    className="text-[10px] uppercase tracking-wider text-amber-400 hover:underline font-bold"
                  >
                    Forgot Password? (ลืมรหัสผ่าน)
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 transition-all rounded-lg"
                >
                  {loading ? 'Authenticating...' : 'SLAY NOW / LOG IN'}
                </button>

                {/* Social Login Options */}
                <div className="space-y-3 pt-3 border-t border-white/10 text-center">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Or continue with</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <button 
                      type="button"
                      onClick={() => handleQuickSocialLogin('Google')}
                      className="py-2.5 bg-[#111111] border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/80 hover:bg-white/10 transition-colors rounded-lg flex items-center justify-center gap-1.5"
                    >
                      Google
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleQuickSocialLogin('Apple')}
                      className="py-2.5 bg-[#111111] border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/80 hover:bg-white/10 transition-colors rounded-lg flex items-center justify-center gap-1.5"
                    >
                      Apple
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleQuickSocialLogin('KBank')}
                      className="py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-[9px] uppercase tracking-widest font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-3 h-3" />
                      KBank / PromptPay
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: SIGN UP */}
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      required
                      placeholder="slayuser@rentandslay.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                    Mobile Number (For KPlus / PromptPay verification)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="tel"
                      required
                      placeholder="081-234-5678"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                      Shoe Size (US / EU)
                    </label>
                    <select
                      value={shoeSizeUs}
                      onChange={(e) => {
                        const us = Number(e.target.value);
                        setShoeSizeUs(us);
                        setShoeSizeEu(us + 33);
                      }}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
                    >
                      {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13].map(s => (
                        <option key={s} value={s} className="bg-[#111111] text-white">US {s} / EU {s + 33}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#111111] border border-white/10 rounded-lg pl-9 pr-2 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="accent-white w-4 h-4 mt-0.5 shrink-0"
                    />
                    <span className="text-[11px] leading-snug">
                      I agree to the <strong>Terms of Service</strong>, <strong>Privacy Policy</strong>, and <strong>Rental Agreement</strong>.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 transition-all rounded-lg"
                >
                  {loading ? 'Creating Account...' : 'CREATE ACCOUNT & START RENTING'}
                </button>
              </>
            )}

          </form>
        )}

        {/* Footer Prompt */}
        <div className="text-center text-xs text-white/50 pt-2 border-t border-white/10">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-white font-bold hover:underline uppercase tracking-wider text-[10px]">
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-white font-bold hover:underline uppercase tracking-wider text-[10px]">
                Log In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
