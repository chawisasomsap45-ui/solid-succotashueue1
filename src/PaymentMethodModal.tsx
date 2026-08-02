import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Building2, 
  QrCode, 
  Smartphone, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Monitor,
  KeyRound,
  ExternalLink
} from 'lucide-react';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  depositHold: number;
  onPaymentSuccess: (paymentDetails: {
    method: 'direct_debit' | 'credit_card' | 'kplus' | 'promptpay' | 'bank_transfer';
    details: string;
    orderId?: string;
  }) => void;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  depositHold,
  onPaymentSuccess
}) => {
  if (!isOpen) return null;

  // Calculation in Thai Baht (฿)
  // If totalAmount in USD is e.g. $105, calculate THB ~ ฿3,770 or use exact Baht formula
  const totalBaht = Math.max(3770, Math.round(totalAmount * 36));

  // Modal Steps: 'select_method' | 'redirecting' | 'bank_authorization' | 'success'
  const [modalStep, setModalStep] = useState<'select_method' | 'redirecting' | 'bank_authorization' | 'success'>('select_method');

  // Selected Payment Method: 'direct_debit' | 'card' | 'kbank_app'
  const [paymentOption, setPaymentOption] = useState<'direct_debit' | 'card' | 'kbank_app'>('direct_debit');

  // Direct Debit Bank Selection
  const [selectedBank, setSelectedBank] = useState<'kasikorn' | 'scb' | 'bbl' | 'ktb' | 'bay'>('kasikorn');
  const [bankAccountNumber, setBankAccountNumber] = useState('789-2-8856-78');
  const [bankAccountHolder, setBankAccountHolder] = useState('Nond Slay');
  const [bankMobileNumber, setBankMobileNumber] = useState('081-234-5678');

  // Authorization Experience Device Mode: 'mobile' | 'desktop'
  const [authDeviceView, setAuthDeviceView] = useState<'mobile' | 'desktop'>('mobile');

  // OTP State for Desktop Auth
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(true);

  // KBank Sub-options for alternative tab
  const [kbankSubOption, setKbankSubOption] = useState<'kplus' | 'promptpay' | 'transfer'>('kplus');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardErrors, setCardErrors] = useState<{ [key: string]: string }>({});

  // KBank Slip Upload State
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [verifyingSlip, setVerifyingSlip] = useState(false);
  const [slipVerified, setSlipVerified] = useState(false);

  // Countdown timer for QR / K PLUS
  const [timerSeconds, setTimerSeconds] = useState(900);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Order Details for Success Screen
  const [generatedOrderId] = useState('#RS-88902');

  const getBankName = (key: string) => {
    switch (key) {
      case 'kasikorn': return 'Kasikornbank (K PLUS)';
      case 'scb': return 'Siam Commercial Bank (SCB Easy)';
      case 'bbl': return 'Bangkok Bank (Bualuang MBanking)';
      case 'ktb': return 'Krungthai Bank (Krungthai NEXT)';
      case 'bay': return 'Bank of Ayudhya (Krungsri)';
      default: return 'Kasikornbank';
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (modalStep === 'select_method' && paymentOption === 'kbank_app') {
      interval = setInterval(() => {
        setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [modalStep, paymentOption]);

  // Handle Redirect Trigger
  const handlePayNowDirectDebit = () => {
    setModalStep('redirecting');
    setTimeout(() => {
      setModalStep('bank_authorization');
    }, 2000);
  };

  // Handle Bank Authorization Completion
  const handleAuthorizePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setModalStep('success');
    }, 1800);
  };

  const handleFinalViewDashboard = () => {
    const bankName = getBankName(selectedBank);
    const lastDigits = bankAccountNumber.replace(/\D/g, '').slice(-4) || '5678';
    onPaymentSuccess({
      method: paymentOption === 'direct_debit' ? 'direct_debit' : paymentOption === 'card' ? 'credit_card' : 'kplus',
      details: `Direct Debit - ${bankName.split(' ')[0]} (Acc ending in ****${lastDigits})`,
      orderId: generatedOrderId
    });
    setModalStep('select_method');
  };

  // Format Card Number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(val.replace(/(\d{4})/g, '$1 ').trim());
  };

  // Format Expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('789-2-88123-0');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setVerifyingSlip(true);
      setSlipVerified(false);
      setTimeout(() => {
        setVerifyingSlip(false);
        setSlipVerified(true);
      }, 1800);
    }
  };

  const validateCardForm = () => {
    const errors: { [key: string]: string } = {};
    const rawNum = cardNumber.replace(/\s/g, '');
    if (rawNum.length < 16) errors.number = 'Please enter a valid 16-digit card number';
    if (!cardExpiry.includes('/') || cardExpiry.length < 5) errors.expiry = 'MM/YY required';
    if (cardCvv.length < 3) errors.cvv = '3 digits required';
    if (!cardHolder.trim()) errors.holder = 'Cardholder name required';
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmCardPayment = () => {
    if (!validateCardForm()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setModalStep('success');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-xl w-full max-h-[94vh] overflow-y-auto p-6 space-y-6 text-white shadow-2xl my-auto">
        
        {/* STEP 1: PAYMENT METHOD SELECTION & BANK DETAILS FORM */}
        {modalStep === 'select_method' && (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-white">Checkout Payment</h2>
                <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Secured & encrypted payment gateway
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white rounded-lg bg-[#111111] border border-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Summary Header */}
            <div className="p-4 bg-[#111111] border border-white/10 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total Payable Amount</p>
                <p className="text-xl font-extrabold text-white">฿{totalBaht.toLocaleString()} <span className="text-xs text-white/40 font-normal">(${totalAmount})</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Security Pre-Auth Hold</p>
                <p className="text-xs font-semibold text-emerald-400">฿{(depositHold * 36).toLocaleString()} (Auto-released)</p>
              </div>
            </div>

            {/* PAYMENT METHOD ACCORDIONS */}
            <div className="space-y-4">
              
              {/* FEATURED METHOD 1: DIRECT BANK ACCOUNT AUTO-DEBIT */}
              <div 
                onClick={() => setPaymentOption('direct_debit')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  paymentOption === 'direct_debit'
                    ? 'bg-[#111111] border-white text-white ring-1 ring-white/20'
                    : 'bg-[#0A0A0A] border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === 'direct_debit'}
                      onChange={() => setPaymentOption('direct_debit')}
                      className="accent-white w-4 h-4 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                          Direct Bank Account Auto-Debit
                        </h3>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5">
                        Link your bank account for fast, instant, and secure one-click payments.
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-widest rounded shrink-0">
                    RECOMMENDED
                  </span>
                </div>

                {/* Expanded Form for Direct Bank Account Auto-Debit */}
                {paymentOption === 'direct_debit' && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4 cursor-default" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Bank Selection */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1.5">
                        Select Your Bank
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          { id: 'kasikorn', name: 'Kasikornbank (K PLUS)', icon: '🟢' },
                          { id: 'scb', name: 'Siam Commercial Bank (SCB Easy)', icon: '🟣' },
                          { id: 'bbl', name: 'Bangkok Bank (Bualuang)', icon: '🔵' },
                          { id: 'ktb', name: 'Krungthai Bank (NEXT)', icon: '🔷' },
                          { id: 'bay', name: 'Bank of Ayudhya (Krungsri)', icon: '🟡' }
                        ].map((b) => (
                          <button
                            type="button"
                            key={b.id}
                            onClick={() => setSelectedBank(b.id as any)}
                            className={`p-2.5 rounded-lg border text-left transition-all text-xs flex items-center gap-2 ${
                              selectedBank === b.id
                                ? 'bg-white text-black font-bold border-white'
                                : 'bg-[#0A0A0A] border-white/10 text-white/70 hover:border-white/30'
                            }`}
                          >
                            <span>{b.icon}</span>
                            <span className="truncate">{b.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bank Account Details Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1">
                          Bank Account Number
                        </label>
                        <input
                          type="text"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="e.g. 789-2-8856-78"
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1">
                          Account Holder Full Name
                        </label>
                        <input
                          type="text"
                          value={bankAccountHolder}
                          onChange={(e) => setBankAccountHolder(e.target.value)}
                          placeholder="Name as registered with Bank"
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block mb-1">
                        Mobile Number Linked to Bank Account (for OTP / Deep-Link)
                      </label>
                      <input
                        type="text"
                        value={bankMobileNumber}
                        onChange={(e) => setBankMobileNumber(e.target.value)}
                        placeholder="081-234-5678"
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white"
                      />
                    </div>

                    {/* IMPORTANT SECURITY NOTICE */}
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
                      <p className="font-semibold leading-relaxed">
                        🔒 <strong>Security Notice:</strong> Clicking "Pay Now" will safely redirect you to your bank's secure page or mobile app (e.g., K PLUS) to authorize the automatic deduction of ฿{totalBaht.toLocaleString()}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePayNowDirectDebit}
                      className="w-full py-4 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 transition-all rounded-lg flex items-center justify-center gap-2"
                    >
                      <span>PAY NOW (฿{totalBaht.toLocaleString()})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                  </div>
                )}
              </div>

              {/* METHOD 2: CREDIT / DEBIT CARD */}
              <div 
                onClick={() => setPaymentOption('card')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  paymentOption === 'card'
                    ? 'bg-[#111111] border-white text-white ring-1 ring-white/20'
                    : 'bg-[#0A0A0A] border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === 'card'}
                      onChange={() => setPaymentOption('card')}
                      className="accent-white w-4 h-4"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-white" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Credit / Debit Card
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-white/10 text-[9px] font-extrabold rounded text-white/90">VISA</span>
                    <span className="px-1.5 py-0.5 bg-white/10 text-[9px] font-extrabold rounded text-white/90">MC</span>
                    <span className="px-1.5 py-0.5 bg-white/10 text-[9px] font-extrabold rounded text-white/90">JCB</span>
                  </div>
                </div>

                {paymentOption === 'card' && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4 cursor-default" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 block mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4000 1234 5678 9010"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      />
                      {cardErrors.number && <p className="text-rose-400 text-[10px] mt-1">{cardErrors.number}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 block mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="08/28"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 block mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-white/60 block mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="JANE DOE"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmCardPayment}
                      className="w-full py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 transition-all rounded-lg"
                    >
                      Pay with Card (฿{totalBaht.toLocaleString()})
                    </button>
                  </div>
                )}
              </div>

              {/* METHOD 3: PROMPTPAY / SLIP TRANSFER */}
              <div 
                onClick={() => setPaymentOption('kbank_app')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  paymentOption === 'kbank_app'
                    ? 'bg-[#111111] border-white text-white ring-1 ring-white/20'
                    : 'bg-[#0A0A0A] border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === 'kbank_app'}
                      onChange={() => setPaymentOption('kbank_app')}
                      className="accent-white w-4 h-4"
                    />
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        PromptPay QR & Slip Verification
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/50">QR Code / Transfer</span>
                </div>

                {paymentOption === 'kbank_app' && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-4 cursor-default" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 bg-[#0A0A0A] border border-white/10 rounded-xl text-center space-y-3">
                      <p className="text-xs text-white/70">Scan PromptPay QR or transfer to Kasikornbank Acc: 789-2-88123-0</p>
                      <button
                        type="button"
                        onClick={() => {
                          setModalStep('success');
                        }}
                        className="w-full py-3 bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest rounded-lg"
                      >
                        Confirm PromptPay Payment (฿{totalBaht.toLocaleString()})
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: AUTO-REDIRECT LOADING SCREEN */}
        {modalStep === 'redirecting' && (
          <div className="py-16 text-center space-y-6 my-auto">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              <h2 className="text-xl font-bold uppercase tracking-tight text-white">
                Redirecting to {getBankName(selectedBank).split(' ')[0]}...
              </h2>
              <p className="text-xs text-white/70 leading-relaxed bg-[#111111] p-4 rounded-xl border border-white/10">
                "Please do not close or refresh this window. You are being securely redirected to your bank to approve the transaction."
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit Bank-Grade SSL Handshake</span>
            </div>
          </div>
        )}

        {/* STEP 3: BANK AUTHORIZATION EXPERIENCE (MOBILE DEEP-LINK / DESKTOP WEB OTP) */}
        {modalStep === 'bank_authorization' && (
          <div className="space-y-6">
            
            {/* Header with Device Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {getBankName(selectedBank)} Secure Authorization
                </span>
                <h2 className="text-lg font-bold text-white mt-1">Authorize ฿{totalBaht.toLocaleString()}</h2>
              </div>

              {/* View Selector Toggle (Mobile vs Desktop Simulation) */}
              <div className="flex items-center bg-[#111111] border border-white/10 p-1 rounded-lg shrink-0">
                <button
                  type="button"
                  onClick={() => setAuthDeviceView('mobile')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 ${
                    authDeviceView === 'mobile' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile App</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthDeviceView('desktop')}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-1.5 ${
                    authDeviceView === 'desktop' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop Web OTP</span>
                </button>
              </div>
            </div>

            {/* AUTHORIZATION EXPERIENCE 1: MOBILE APP DEEP-LINK */}
            {authDeviceView === 'mobile' && (
              <div className="space-y-4">
                <div className="bg-[#111111] border-2 border-emerald-500/50 rounded-2xl p-6 text-center space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-extrabold uppercase px-3 py-1 rounded-bl-lg">
                    BANK APP DEEP-LINK
                  </div>

                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto">
                    <Smartphone className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      {getBankName(selectedBank)}
                    </h3>
                    <p className="text-xs text-white/60">Automated Push Prompt Sent to Mobile</p>
                  </div>

                  {/* Deep-link prompt message */}
                  <div className="p-4 bg-[#0A0A0A] border border-white/10 rounded-xl text-left space-y-2">
                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Notification Prompt:</p>
                    <p className="text-xs font-medium text-emerald-300 leading-relaxed font-mono">
                      "Approve payment of ฿{totalBaht.toLocaleString()} to Rent and Slay Co., Ltd."
                    </p>
                    <div className="border-t border-white/10 pt-2 text-[10px] text-white/50 flex justify-between">
                      <span>Account: {bankAccountNumber}</span>
                      <span>Ref: #RS-88902</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAuthorizePayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {isProcessing ? (
                      <span>Processing Bank Approval...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>APPROVE PAYMENT IN APP (฿{totalBaht.toLocaleString()})</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-white/40 uppercase tracking-wider">
                    Auto-redirecting to Rent and Slay upon biometric / PIN authorization
                  </p>
                </div>
              </div>
            )}

            {/* AUTHORIZATION EXPERIENCE 2: DESKTOP WEB OTP PAGE */}
            {authDeviceView === 'desktop' && (
              <div className="space-y-4">
                <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-amber-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Bank OTP Verification Page
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 uppercase font-mono">2FA Verification</span>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed">
                    An OTP (One-Time Password) has been sent via SMS to your mobile number <strong>{bankMobileNumber || '081-XXX-5678'}</strong>. Please enter the 6-digit code below to authorize deduction.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/60 block">
                      Enter 6-Digit OTP Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="flex-1 bg-[#0A0A0A] border border-white/20 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-white focus:border-amber-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(true);
                          alert('New OTP sent to your phone number.');
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl border border-white/10"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAuthorizePayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <span>Verifying OTP & Authorizing...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>AUTHORIZE DEDUCTION (฿{totalBaht.toLocaleString()})</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-center text-white/40 uppercase tracking-widest">
                    Secured by {getBankName(selectedBank).split(' ')[0]} 2-Factor Authentication
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* STEP 4: PAYMENT SUCCESS / RETURN PAGE (/checkout/success) */}
        {modalStep === 'success' && (
          <div className="py-6 space-y-6 text-center animate-in zoom-in-95">
            
            {/* Success Icon */}
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Payment Successful! You're Ready to Slay! 👠✨
              </h2>
              <p className="text-xs text-white/60">
                Your direct debit authorization has been confirmed by your bank.
              </p>
            </div>

            {/* Order Summary Box */}
            <div className="p-5 bg-[#111111] border border-white/10 rounded-2xl text-left text-xs space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40">Order Status:</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider rounded">
                  CONFIRMED & RESERVED
                </span>
              </div>

              <div className="space-y-2 text-white/80">
                <div className="flex justify-between">
                  <span className="text-white/50">Order ID:</span>
                  <span className="font-mono font-bold text-white">{generatedOrderId}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/50">Paid via:</span>
                  <span className="font-semibold text-white">
                    Direct Debit - {getBankName(selectedBank).split(' ')[0]} (Acc ending in ****{bankAccountNumber.replace(/\D/g, '').slice(-4) || '5678'})
                  </span>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="text-white/50">Total Deducted:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    ฿{totalBaht.toLocaleString()} <span className="text-[10px] text-white/40 font-normal">(Rental Fee + Security Deposit)</span>
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/50">Rental Dates:</span>
                  <span className="font-semibold text-white">Aug 6, 2026 – Aug 9, 2026</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white/60 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Shoes passed 100°C UV-C sanitization & ready for express dispatch!</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleFinalViewDashboard}
              className="w-full py-4 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 transition-all rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <span>VIEW MY RENTAL DASHBOARD</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
