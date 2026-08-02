import React, { useState, useEffect } from 'react';
import { UserProfile, LenderProfile, ShoeListing, RentalOrder, Dispute, ShoeImage } from '../types';
import { 
  getLenderProfileFromDb, 
  submitLenderKycInDb, 
  getLenderShoesFromDb, 
  createShoeListingInDb, 
  updateShoeAvailabilityInDb, 
  getLenderRentalsFromDb, 
  updateRentalOrderInDb, 
  createDisputeInDb, 
  uploadFileToFirebaseStorage 
} from '../lib/firebase';
import { 
  Building2, 
  CreditCard, 
  Upload, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Package, 
  Truck, 
  DollarSign, 
  Camera, 
  AlertTriangle, 
  Sparkles, 
  Eye, 
  X, 
  RefreshCw,
  FileText
} from 'lucide-react';

interface LenderDashboardProps {
  user?: UserProfile | null;
  userProfile?: UserProfile | null;
  openAuthModal?: (mode: 'login' | 'signup') => void;
  onRefreshUser?: () => void;
}

export const LenderDashboard: React.FC<LenderDashboardProps> = ({ 
  user: userProp, 
  userProfile: userProfileProp, 
  openAuthModal, 
  onRefreshUser 
}) => {
  const currentUser = userProp || userProfileProp || null;

  const [activeTab, setActiveTab] = useState<'shoes' | 'requests' | 'earnings' | 'kyc'>('shoes');
  const [lenderProfile, setLenderProfile] = useState<LenderProfile | null>(null);
  const [shoes, setShoes] = useState<ShoeListing[]>([]);
  const [rentals, setRentals] = useState<RentalOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingKyc, setSubmittingKyc] = useState<boolean>(false);

  // Profit Calculator State for Guest view
  const [calcPairCount, setCalcPairCount] = useState<number>(3);
  const [calcAvgPrice, setCalcAvgPrice] = useState<number>(450);
  const [calcDaysPerMonth, setCalcDaysPerMonth] = useState<number>(10);

  // KYC Form State
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [bankBookFile, setBankBookFile] = useState<File | null>(null);
  const [bankName, setBankName] = useState<string>('Kasikornbank (K PLUS)');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [bankAccountName, setBankAccountName] = useState<string>('');

  // Add Shoe Modal State
  const [isAddShoeOpen, setIsAddShoeOpen] = useState<boolean>(false);
  const [creatingShoe, setCreatingShoe] = useState<boolean>(false);
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [sizeUs, setSizeUs] = useState<number>(9);
  const [sizeEu, setSizeEu] = useState<number>(42);
  const [sizeCm, setSizeCm] = useState<number>(27);
  const [category, setCategory] = useState<ShoeListing['category']>('Sneakers');
  const [conditionRating, setConditionRating] = useState<ShoeListing['conditionRating']>('95% (Like New)');
  const [flawsDescription, setFlawsDescription] = useState<string>('No noticeable flaws, pristine ready-to-wear condition');
  const [rentalPricePerDay, setRentalPricePerDay] = useState<number>(350);
  const [rentalPricePerWeek, setRentalPricePerWeek] = useState<number>(1800);
  const [depositAmount, setDepositAmount] = useState<number>(2000);
  const [shoeImageFiles, setShoeImageFiles] = useState<{ file: File; tag: ShoeImage['tag'] }[]>([]);

  // Calendar Management State
  const [selectedShoeForCalendar, setSelectedShoeForCalendar] = useState<ShoeListing | null>(null);
  const [blockedDateInput, setBlockedDateInput] = useState<string>('');

  // Fulfillment & Pre/Post Rental Proof State
  const [selectedRentalForFulfillment, setSelectedRentalForFulfillment] = useState<RentalOrder | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');
  const [preProofFiles, setPreProofFiles] = useState<File[]>([]);
  const [postProofFiles, setPostProofFiles] = useState<File[]>([]);
  const [uploadingProofs, setUploadingProofs] = useState<boolean>(false);

  // Dispute Modal State
  const [disputeRental, setDisputeRental] = useState<RentalOrder | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>('');
  const [disputeClaimedAmount, setDisputeClaimedAmount] = useState<number>(500);
  const [disputeProofFiles, setDisputeProofFiles] = useState<File[]>([]);
  const [submittingDispute, setSubmittingDispute] = useState<boolean>(false);

  const loadLenderData = async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const profile = await getLenderProfileFromDb(currentUser.uid);
      setLenderProfile(profile);

      const fetchedShoes = await getLenderShoesFromDb(currentUser.uid);
      setShoes(fetchedShoes);

      const fetchedRentals = await getLenderRentalsFromDb(currentUser.uid);
      setRentals(fetchedRentals);

      if (profile) {
        setBankName(profile.bankName || 'Kasikornbank (K PLUS)');
        setBankAccountNumber(profile.bankAccountNumber || '');
        setBankAccountName(profile.bankAccountName || '');
      }
    } catch (err) {
      console.error('Failed to load lender data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLenderData();
  }, [currentUser?.uid]);

  // Handle KYC Submit
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (openAuthModal) openAuthModal('login');
      return;
    }
    if (!bankAccountNumber || !bankAccountName) {
      alert('Please fill out all bank account details.');
      return;
    }

    setSubmittingKyc(true);
    try {
      let idCardUrl = lenderProfile?.idCardImageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80';
      let bankBookUrl = lenderProfile?.bankBookImageUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';

      if (idCardFile) {
        idCardUrl = await uploadFileToFirebaseStorage(idCardFile, currentUser.uid, 'kyc_id');
      }
      if (bankBookFile) {
        bankBookUrl = await uploadFileToFirebaseStorage(bankBookFile, currentUser.uid, 'kyc_bank');
      }

      const newProfile: LenderProfile = {
        userId: currentUser.uid,
        idCardImageUrl: idCardUrl,
        bankBookImageUrl: bankBookUrl,
        bankName,
        bankAccountNumber,
        bankAccountName,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await submitLenderKycInDb(newProfile);
      setLenderProfile(newProfile);
      alert('KYC verification submitted successfully! Awaiting admin review.');
      if (onRefreshUser) onRefreshUser();
    } catch (err) {
      console.error('KYC Submission error:', err);
      alert('Error submitting KYC documents.');
    } finally {
      setSubmittingKyc(false);
    }
  };

  // Handle Add Shoe
  const handleAddShoe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (openAuthModal) openAuthModal('login');
      return;
    }
    if (!brand || !model) {
      alert('Please specify shoe brand and model.');
      return;
    }

    setCreatingShoe(true);
    try {
      const uploadedImages: ShoeImage[] = [];

      for (let i = 0; i < shoeImageFiles.length; i++) {
        const item = shoeImageFiles[i];
        const url = await uploadFileToFirebaseStorage(item.file, currentUser.uid, 'shoe_images');
        uploadedImages.push({
          imageUrl: url,
          tag: item.tag,
          isPrimary: i === 0
        });
      }

      // Default backup image if none uploaded
      if (uploadedImages.length === 0) {
        uploadedImages.push({
          imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          tag: 'side',
          isPrimary: true
        });
      }

      const newShoeData: Omit<ShoeListing, 'id'> = {
        lenderId: currentUser.uid,
        lenderName: currentUser.fullName || currentUser.email,
        brand,
        model,
        sizeUs,
        sizeEu,
        sizeCm,
        category,
        conditionRating,
        flawsDescription,
        rentalPricePerDay,
        rentalPricePerWeek,
        depositAmount,
        unavailableDates: [],
        images: uploadedImages,
        approvalStatus: 'pending',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      await createShoeListingInDb(newShoeData);
      alert('Shoe listing created successfully! Submitted for admin approval.');
      setIsAddShoeOpen(false);
      loadLenderData();
    } catch (err) {
      console.error('Add shoe error:', err);
      alert('Error creating shoe listing.');
    } finally {
      setCreatingShoe(false);
    }
  };

  // Handle Calendar Block/Unblock
  const handleToggleUnavailableDate = async (shoe: ShoeListing, dateStr: string) => {
    const currentDates = shoe.unavailableDates || [];
    let updated: string[];
    if (currentDates.includes(dateStr)) {
      updated = currentDates.filter(d => d !== dateStr);
    } else {
      updated = [...currentDates, dateStr];
    }

    await updateShoeAvailabilityInDb(shoe.id, updated);
    setShoes(prev => prev.map(s => s.id === shoe.id ? { ...s, unavailableDates: updated } : s));
    if (selectedShoeForCalendar?.id === shoe.id) {
      setSelectedShoeForCalendar({ ...selectedShoeForCalendar, unavailableDates: updated });
    }
  };

  // Handle Order Accept / Reject
  const handleOrderAction = async (rentalId: string, action: 'accept' | 'reject') => {
    try {
      const newStatus = action === 'accept' ? 'accepted' : 'rejected';
      await updateRentalOrderInDb(rentalId, { status: newStatus });
      setRentals(prev => prev.map(r => r.id === rentalId ? { ...r, status: newStatus } : r));
      alert(`Rental request ${action}ed.`);
    } catch (err) {
      console.error('Order action error:', err);
    }
  };

  // Handle Shipment Fulfillment with Pre-Rental Proof
  const handleShipmentFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalForFulfillment) return;
    if (!trackingNumberInput) {
      alert('Please provide a courier tracking number.');
      return;
    }

    setUploadingProofs(true);
    try {
      const proofUrls: string[] = [];
      for (const file of preProofFiles) {
        const url = await uploadFileToFirebaseStorage(file, currentUser?.uid || '', 'pre_rental_proofs');
        proofUrls.push(url);
      }

      await updateRentalOrderInDb(selectedRentalForFulfillment.id, {
        status: 'shipped',
        trackingNumber: trackingNumberInput,
        preRentalProofImages: proofUrls
      });

      alert('Shipment fulfilled and Pre-Rental condition proof saved!');
      setSelectedRentalForFulfillment(null);
      setPreProofFiles([]);
      setTrackingNumberInput('');
      loadLenderData();
    } catch (err) {
      console.error('Shipment error:', err);
    } finally {
      setUploadingProofs(false);
    }
  };

  // Handle Post-Rental Confirmation & Escrow Release
  const handleConfirmReturnAndReleaseDeposit = async (rental: RentalOrder) => {
    if (!window.confirm('Confirm shoe returned in good condition? This will release the rental payout to you and refund the deposit to the renter.')) return;
    
    setUploadingProofs(true);
    try {
      const proofUrls: string[] = [];
      for (const file of postProofFiles) {
        const url = await uploadFileToFirebaseStorage(file, currentUser?.uid || '', 'post_rental_proofs');
        proofUrls.push(url);
      }

      await updateRentalOrderInDb(rental.id, {
        status: 'completed',
        escrowStatus: 'released_to_lender',
        postRentalProofImages: proofUrls
      });

      alert('Rental completed successfully! Escrow payout released.');
      setPostProofFiles([]);
      loadLenderData();
    } catch (err) {
      console.error('Confirm return error:', err);
    } finally {
      setUploadingProofs(false);
    }
  };

  // Handle Submit Dispute
  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeRental || !disputeReason) {
      alert('Please provide a reason for the dispute.');
      return;
    }

    setSubmittingDispute(true);
    try {
      const proofUrls: string[] = [];
      for (const file of disputeProofFiles) {
        const url = await uploadFileToFirebaseStorage(file, currentUser?.uid || '', 'dispute_proofs');
        proofUrls.push(url);
      }

      await createDisputeInDb({
        rentalId: disputeRental.id,
        shoeId: disputeRental.shoeId,
        lenderId: currentUser?.uid || '',
        renterId: disputeRental.renterId || disputeRental.userId,
        reason: disputeReason,
        proofImages: proofUrls,
        claimedAmount: disputeClaimedAmount,
        status: 'open',
        createdAt: new Date().toISOString()
      });

      alert('Dispute submitted to Admin. The deposit is held in escrow until dispute resolution.');
      setDisputeRental(null);
      setDisputeReason('');
      setDisputeProofFiles([]);
      loadLenderData();
    } catch (err) {
      console.error('Dispute submit error:', err);
    } finally {
      setSubmittingDispute(false);
    }
  };

  const isKycApproved = lenderProfile?.status === 'approved';

  // Guest Landing View
  if (!currentUser) {
    const monthlyIncome = calcPairCount * calcAvgPrice * calcDaysPerMonth;

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* HERO BANNER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1A1A] via-[#111111] to-[#0D0D0D] border border-amber-500/30 p-8 md:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-3xl space-y-6 relative z-10">
              <span className="px-3.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black uppercase tracking-widest rounded-full inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> SLAY LENDER HUB & CLOSING SERVICE
              </span>

              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                Turn shoes in your closet <br className="hidden sm:inline" />
                into <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">passive monthly income</span>
              </h1>

              <p className="text-sm md:text-base text-white/70 leading-relaxed">
                List trending sneakers, designer heels, or event footwear you don't wear daily. Earn steady monthly rental returns with 100% deposit protection and verified renter ID checks before fulfillment.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => openAuthModal ? openAuthModal('login') : alert('Please log in first')}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>Log In to Start Renting Out</span>
                  <PlusCircle className="w-5 h-5" />
                </button>

                <button
                  onClick={() => openAuthModal ? openAuthModal('signup') : alert('Please sign up first')}
                  className="px-6 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-sm uppercase tracking-wider rounded-2xl transition-all"
                >
                  Register as New Lender
                </button>
              </div>
            </div>
          </div>

          {/* INCOME CALCULATOR */}
          <div className="p-8 bg-[#111111] border border-white/10 rounded-3xl space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-xl font-black text-white flex items-center justify-center gap-2">
                <DollarSign className="w-6 h-6 text-amber-400" />
                Estimate Your Monthly Rental Income
              </h2>
              <p className="text-xs text-white/60">
                Adjust pair count and average daily rate to estimate your earning potential.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-5 bg-[#0A0A0A] border border-white/10 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-white/80">Shoes to Rent Out (Pairs)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={calcPairCount}
                  onChange={(e) => setCalcPairCount(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs font-mono font-bold text-amber-400">
                  <span>1 Pair</span>
                  <span className="text-sm">{calcPairCount} Pairs</span>
                  <span>10 Pairs</span>
                </div>
              </div>

              <div className="p-5 bg-[#0A0A0A] border border-white/10 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-white/80">Avg Daily Rate (฿/day)</label>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="50"
                  value={calcAvgPrice}
                  onChange={(e) => setCalcAvgPrice(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs font-mono font-bold text-amber-400">
                  <span>฿200</span>
                  <span className="text-sm">฿{calcAvgPrice}</span>
                  <span>฿1,500</span>
                </div>
              </div>

              <div className="p-5 bg-[#0A0A0A] border border-white/10 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-white/80">Rented Days per Month (Days/Pair)</label>
                <input
                  type="range"
                  min="2"
                  max="25"
                  value={calcDaysPerMonth}
                  onChange={(e) => setCalcDaysPerMonth(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs font-mono font-bold text-amber-400">
                  <span>2 Days</span>
                  <span className="text-sm">{calcDaysPerMonth} Days</span>
                  <span>25 Days</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">Estimated Net Monthly Income</span>
                <p className="text-3xl md:text-4xl font-black text-white mt-1">
                  ~ ฿{monthlyIncome.toLocaleString()} <span className="text-xs font-normal text-white/60">/ month</span>
                </p>
              </div>

              <button
                onClick={() => openAuthModal ? openAuthModal('login') : alert('Please log in first')}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg"
              >
                List Your Shoes Now
              </button>
            </div>
          </div>

          {/* 4 TRUST PILLARS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-[#111111] border border-white/10 rounded-2xl space-y-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">Deposit Protection</h3>
              <p className="text-xs text-white/60">
                Renters place a security deposit hold. Any damage or late return automatically transfers funds to compensate the owner.
              </p>
            </div>

            <div className="p-6 bg-[#111111] border border-white/10 rounded-2xl space-y-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">Direct Bank Payouts</h3>
              <p className="text-xs text-white/60">
                Once the renter completes the rental and returns the pair, our Escrow system automatically releases funds directly to your bank.
              </p>
            </div>

            <div className="p-6 bg-[#111111] border border-white/10 rounded-2xl space-y-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">Pre-Proof Condition Logs</h3>
              <p className="text-xs text-white/60">
                Upload condition photos before shipment and inspect upon return to prevent disputes and maintain premium standards.
              </p>
            </div>

            <div className="p-6 bg-[#111111] border border-white/10 rounded-2xl space-y-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">Full Calendar Control</h3>
              <p className="text-xs text-white/60">
                Block off any personal wear dates or vacation blackout periods anytime directly in your lender dashboard.
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Earnings calculation
  const totalEarned = rentals
    .filter(r => r.escrowStatus === 'released_to_lender' || r.status === 'completed')
    .reduce((acc, r) => acc + (r.totalRentalFee || r.rentalPrice || 0), 0);

  const pendingEscrow = rentals
    .filter(r => r.escrowStatus === 'held' || r.status === 'shipped' || r.status === 'active' || r.status === 'returned')
    .reduce((acc, r) => acc + (r.totalRentalFee || r.rentalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* LENDER HEADER */}
        <div className="p-6 bg-[#111111] border border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-widest rounded flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> LENDER / OWNER DASHBOARD
              </span>
              {isKycApproved ? (
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> KYC VERIFIED
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> KYC STATUS: {lenderProfile?.status?.toUpperCase() || 'NOT SUBMITTED'}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-white mt-2">
              Shoe Closet & Rental Control Center
            </h1>
            <p className="text-xs text-white/60">
              List designer sneakers and luxury heels, set rental rates, manage blackout dates, and receive automated bank payouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddShoeOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add New Shoe</span>
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('shoes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'shoes' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" /> My Shoe Closet ({shoes.length})
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'requests' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" /> Rental Requests ({rentals.length})
          </button>

          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'earnings' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Earnings & Payouts
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'kyc' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Identity Verification (KYC)
          </button>
        </div>

        {/* TAB 1: KYC IDENTITY VERIFICATION */}
        {activeTab === 'kyc' && (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Identity & Bank Account Verification (Lender KYC)
              </h2>
              <p className="text-xs text-white/60 mt-1">
                For maximum platform security and direct rental payouts, lenders must upload a valid National ID or Passport and bank passbook.
              </p>
            </div>

            {/* STATUS BANNER */}
            {lenderProfile?.status === 'approved' ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">KYC Identity Verified</h3>
                  <p className="text-xs text-emerald-300/80">Your lender account is fully approved. You can list unlimited shoes and receive payouts.</p>
                </div>
              </div>
            ) : lenderProfile?.status === 'pending' ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3 text-amber-300">
                <Clock className="w-6 h-6 shrink-0 animate-pulse" />
                <div>
                  <h3 className="font-bold text-sm">KYC Documents Under Review</h3>
                  <p className="text-xs text-amber-200/80">Our team is reviewing your ID and bank documents. Verification typically takes under 1 hour.</p>
                </div>
              </div>
            ) : lenderProfile?.status === 'rejected' ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm">Please resubmit document</h3>
                  <p className="text-xs text-rose-300/80">Reason: {lenderProfile.rejectionReason || 'Image unclear, please upload a clearer photo.'}</p>
                </div>
              </div>
            ) : null}

            {/* KYC FORM */}
            <form onSubmit={handleKycSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Card Upload */}
                <div className="p-5 bg-[#0A0A0A] border border-white/10 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    1. National ID Card / Passport Photo
                  </label>
                  <p className="text-[11px] text-white/50">Full name, photo, and ID number must be clearly legible.</p>
                  
                  {lenderProfile?.idCardImageUrl && (
                    <div className="h-28 bg-white/5 rounded-lg overflow-hidden border border-white/10 relative">
                      <img src={lenderProfile.idCardImageUrl} alt="ID Document" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/80 text-[9px] text-emerald-400 font-bold rounded">Uploaded</span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs text-white/80 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black"
                  />
                </div>

                {/* Bank Book Upload */}
                <div className="p-5 bg-[#0A0A0A] border border-white/10 rounded-xl space-y-3">
                  <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    2. Bank Passbook / Account Document Photo
                  </label>
                  <p className="text-[11px] text-white/50">Must clearly show bank name, account number, and name matching your ID.</p>

                  {lenderProfile?.bankBookImageUrl && (
                    <div className="h-28 bg-white/5 rounded-lg overflow-hidden border border-white/10 relative">
                      <img src={lenderProfile.bankBookImageUrl} alt="Bank Book" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 px-2 py-0.5 bg-black/80 text-[9px] text-emerald-400 font-bold rounded">Uploaded</span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBankBookFile(e.target.files?.[0] || null)}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs text-white/80 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black"
                  />
                </div>
              </div>

              {/* BANK DETAILS FIELDS */}
              <div className="p-5 bg-[#0A0A0A] border border-white/10 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Bank Payout Account Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1">Bank Name</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Kasikornbank (K PLUS)">Kasikornbank (K PLUS)</option>
                      <option value="Siam Commercial Bank (SCB)">Siam Commercial Bank (SCB)</option>
                      <option value="Bangkok Bank">Bangkok Bank</option>
                      <option value="Krungthai Bank">Krungthai Bank</option>
                      <option value="Krungsri Bank (BAY)">Krungsri Bank</option>
                      <option value="PromptPay Mobile / ID">PromptPay Mobile / ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      placeholder="e.g. 012-3-45678-9"
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/70 mb-1">Account Holder Name (Matching ID)</label>
                    <input
                      type="text"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="e.g. Alex Mercer"
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingKyc}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{submittingKyc ? 'Uploading...' : 'Submit KYC Documents'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: SHOES MANAGEMENT */}
        {activeTab === 'shoes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Your Listed Shoes</h2>
                <p className="text-xs text-white/60">Manage your shoe listings, set daily/weekly rental rates, and block unavailable dates.</p>
              </div>

              <button
                onClick={() => setIsAddShoeOpen(true)}
                className="px-4 py-2 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow"
              >
                <PlusCircle className="w-4 h-4" /> + Add New Shoe
              </button>
            </div>

            {shoes.length === 0 ? (
              <div className="p-12 border border-dashed border-amber-500/30 rounded-2xl text-center space-y-4 bg-[#111111]">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                  <Package className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Your shoe closet is currently empty</h3>
                  <p className="text-xs text-white/60 max-w-md mx-auto">
                    Turn your un-worn designer sneakers or luxury heels into passive monthly rental income.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddShoeOpen(true)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                >
                  + Add Your First Shoe Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shoes.map((shoe) => (
                  <div key={shoe.id} className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Image Preview */}
                      <div className="h-48 bg-white/5 relative overflow-hidden">
                        <img 
                          src={shoe.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'} 
                          alt={`${shoe.brand} ${shoe.model}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          {shoe.approvalStatus === 'approved' ? (
                            <span className="px-2 py-0.5 bg-emerald-500 text-black text-[9px] font-extrabold uppercase rounded shadow">Approved</span>
                          ) : shoe.approvalStatus === 'pending' ? (
                            <span className="px-2 py-0.5 bg-amber-500 text-black text-[9px] font-extrabold uppercase rounded shadow">Pending Review</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-extrabold uppercase rounded shadow">Rejected</span>
                          )}
                        </div>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur text-white text-[10px] font-bold rounded">
                          EU {shoe.sizeEu} / US {shoe.sizeUs}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">{shoe.brand}</span>
                            <h3 className="font-bold text-sm text-white">{shoe.model}</h3>
                          </div>
                          <span className="px-2 py-0.5 bg-white/10 text-white/80 text-[10px] font-mono rounded">
                            {shoe.category}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[#0A0A0A] border border-white/5 rounded-xl">
                          <div>
                            <p className="text-[9px] uppercase text-white/40 font-bold">Daily</p>
                            <p className="text-xs font-bold text-amber-400">฿{shoe.rentalPricePerDay}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase text-white/40 font-bold">Weekly</p>
                            <p className="text-xs font-bold text-amber-400">฿{shoe.rentalPricePerWeek}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase text-white/40 font-bold">Deposit</p>
                            <p className="text-xs font-bold text-emerald-400">฿{shoe.depositAmount}</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-white/60 line-clamp-2">
                          <strong className="text-white">Flaws / Condition:</strong> {shoe.flawsDescription}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-[#0A0A0A] border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedShoeForCalendar(shoe)}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Availability Calendar ({shoe.unavailableDates?.length || 0} Blocked)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RENTAL REQUESTS & FULFILLMENT */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Rental Orders & Fulfillment</h2>
              <p className="text-xs text-white/60">Accept requests, upload Pre-Rental condition photos, enter express tracking numbers, and inspect returned shoes.</p>
            </div>

            {rentals.length === 0 ? (
              <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center space-y-2 bg-[#111111]">
                <Truck className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-xs text-white/50">No incoming rental requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rentals.map((rental) => (
                  <div key={rental.id} className="p-5 bg-[#111111] border border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <img src={rental.imageUrl} alt={rental.shoeName} className="w-full h-full object-cover" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{rental.brand} - {rental.shoeName}</span>
                          <span className="px-2 py-0.5 bg-white/10 text-white/60 text-[10px] font-mono rounded">
                            {rental.startDate} to {rental.endDate}
                          </span>
                        </div>

                        <p className="text-xs text-white/60">
                          Rental Fee: <strong className="text-amber-400">฿{rental.totalRentalFee || rental.rentalPrice}</strong> • Deposit Held: <strong className="text-emerald-400">฿{rental.securityDeposit}</strong>
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Status:</span>
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase rounded">
                            {rental.status}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase rounded">
                            Escrow: {rental.escrowStatus || 'held'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* FULFILLMENT CONTROLS */}
                    <div className="flex flex-wrap items-center gap-2">
                      {rental.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleOrderAction(rental.id, 'accept')}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg"
                          >
                            Accept Order
                          </button>
                          <button
                            onClick={() => handleOrderAction(rental.id, 'reject')}
                            className="px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {rental.status === 'accepted' && (
                        <button
                          onClick={() => setSelectedRentalForFulfillment(rental)}
                          className="px-4 py-2 bg-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" /> Fulfill & Upload Pre-Proof
                        </button>
                      )}

                      {(rental.status === 'shipped' || rental.status === 'active' || rental.status === 'returned') && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleConfirmReturnAndReleaseDeposit(rental)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirm OK & Release Escrow
                          </button>

                          <button
                            onClick={() => setDisputeRental(rental)}
                            className="px-3 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Dispute
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EARNINGS & ESCROW */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-[#111111] border border-emerald-500/30 rounded-2xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Total Realized Payouts</span>
                <p className="text-3xl font-black text-white">฿{totalEarned.toLocaleString()}</p>
                <p className="text-xs text-white/50">Transferred directly to your {lenderProfile?.bankName || 'bank account'}.</p>
              </div>

              <div className="p-6 bg-[#111111] border border-amber-500/30 rounded-2xl space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">Escrow Held (Pending Completion)</span>
                <p className="text-3xl font-black text-white">฿{pendingEscrow.toLocaleString()}</p>
                <p className="text-xs text-white/50">Protected in Rent & Slay Escrow until rental return is confirmed.</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ADD SHOE MODAL */}
      {isAddShoeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-white/20 rounded-2xl max-w-2xl w-full p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                List New Shoe For Rent
              </h3>
              <button onClick={() => setIsAddShoeOpen(false)} className="p-1 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddShoe} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Brand</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Nike, Jordan, Chanel"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Model / Name</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Travis Scott Jordan 1 Low"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Size EU</label>
                  <input
                    type="number"
                    value={sizeEu}
                    onChange={(e) => setSizeEu(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Size US</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sizeUs}
                    onChange={(e) => setSizeUs(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Size CM</label>
                  <input
                    type="number"
                    value={sizeCm}
                    onChange={(e) => setSizeCm(Number(e.target.value))}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ShoeListing['category'])}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white"
                  >
                    <option value="Sneakers">Sneakers</option>
                    <option value="Heels">Heels</option>
                    <option value="Boots">Boots</option>
                    <option value="Formal">Formal</option>
                    <option value="Performance">Performance</option>
                    <option value="Hiking">Hiking</option>
                    <option value="Street">Street</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-[#0A0A0A] border border-white/10 rounded-xl">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Rental Price / Day (฿)</label>
                  <input
                    type="number"
                    value={rentalPricePerDay}
                    onChange={(e) => setRentalPricePerDay(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-white font-bold text-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Rental Price / Week (฿)</label>
                  <input
                    type="number"
                    value={rentalPricePerWeek}
                    onChange={(e) => setRentalPricePerWeek(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-white font-bold text-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Deposit Amount (฿)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-white font-bold text-emerald-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Condition Rating & Flaws Description</label>
                <textarea
                  value={flawsDescription}
                  onChange={(e) => setFlawsDescription(e.target.value)}
                  placeholder="Describe condition and existing scuffs/flaws..."
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white h-20 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Multi-image Uploader */}
              <div className="p-4 bg-[#0A0A0A] border border-white/10 rounded-xl space-y-3">
                <label className="block text-white font-bold flex items-center justify-between">
                  <span>Shoe Multi-Angle Photos</span>
                  <span className="text-[10px] text-white/40">Side, Sole, Size Tag, Flaws</span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const newArr = Array.from(e.target.files).map(file => ({ file, tag: 'side' as ShoeImage['tag'] }));
                      setShoeImageFiles(prev => [...prev, ...newArr]);
                    }
                  }}
                  className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-white/80 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-black"
                />

                {shoeImageFiles.length > 0 && (
                  <p className="text-[10px] text-emerald-400">{shoeImageFiles.length} photos selected for upload.</p>
                )}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={creatingShoe}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg"
                >
                  {creatingShoe ? 'Creating Listing...' : 'Submit Shoe Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AVAILABILITY CALENDAR MODAL */}
      {selectedShoeForCalendar && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-white/20 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-400" />
                Availability Calendar ({selectedShoeForCalendar.brand} {selectedShoeForCalendar.model})
              </h3>
              <button onClick={() => setSelectedShoeForCalendar(null)} className="p-1 text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60">
              Select dates to block or unblock. Blocked dates won't appear in renter searches.
            </p>

            <div className="flex gap-2">
              <input
                type="date"
                value={blockedDateInput}
                onChange={(e) => setBlockedDateInput(e.target.value)}
                className="bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-xs text-white flex-1"
              />
              <button
                onClick={() => {
                  if (blockedDateInput) {
                    handleToggleUnavailableDate(selectedShoeForCalendar, blockedDateInput);
                    setBlockedDateInput('');
                  }
                }}
                className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-lg"
              >
                Toggle Date
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-white">Currently Blocked Dates:</h4>
              {selectedShoeForCalendar.unavailableDates?.length === 0 ? (
                <p className="text-[11px] text-white/40">No dates blocked. Available 365 days.</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {selectedShoeForCalendar.unavailableDates?.map((date) => (
                    <span key={date} className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono rounded-lg flex items-center gap-1">
                      {date}
                      <button onClick={() => handleToggleUnavailableDate(selectedShoeForCalendar, date)} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {disputeRental && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-rose-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-sm text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Open Post-Rental Dispute
              </h3>
              <button onClick={() => setDisputeRental(null)} className="p-1 text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-white mb-1">Dispute Reason / Damaged Details</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Describe damage, severe stains, or unreturned item..."
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white h-24 focus:outline-none focus:border-rose-400"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Claimed Deposit Deduction (฿)</label>
                <input
                  type="number"
                  max={disputeRental.securityDeposit}
                  value={disputeClaimedAmount}
                  onChange={(e) => setDisputeClaimedAmount(Number(e.target.value))}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white font-bold text-rose-400"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Upload Damaged Proof Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setDisputeProofFiles(Array.from(e.target.files || []))}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg"
                >
                  {submittingDispute ? 'Submitting...' : 'Submit Dispute To Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULFILLMENT MODAL */}
      {selectedRentalForFulfillment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-2">
                <Truck className="w-5 h-5" /> Fulfill Shipment & Upload Pre-Rental Condition Proof
              </h3>
              <button onClick={() => setSelectedRentalForFulfillment(null)} className="p-1 text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleShipmentFulfillment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-white mb-1">Courier Express Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. Flash Express / Kerry TH12345678"
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2.5 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-white mb-1">Pre-Rental Condition Proof Photos (Dispatched Condition)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setPreProofFiles(Array.from(e.target.files || []))}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploadingProofs}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg"
                >
                  {uploadingProofs ? 'Fulfilling...' : 'Confirm Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
