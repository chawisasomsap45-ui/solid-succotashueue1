export type Gender = 'Men' | 'Women' | 'Unisex';

export type ShoeCategory = 'Sneakers' | 'Heels' | 'Boots' | 'Formal' | 'Performance';

export type ConditionGrade = 'Pristine (Like New)' | 'Great (Minor sole wear)' | 'Good (Refreshed)' | string;

export type RentalDuration = '4_days' | '10_days' | 'monthly';

export interface RentalPriceOptions {
  fourDays: number;
  tenDays: number;
  monthly: number;
}

export interface Shoe {
  id: string;
  name: string;
  brand: string;
  retailPrice: number;
  rentalPrices: RentalPriceOptions;
  gender: Gender;
  category: ShoeCategory;
  availableSizesEu: number[]; // e.g. [38, 39, 40, 41, 42]
  availableSizesUs: number[]; // e.g. [6, 7, 8, 9, 10]
  images: {
    main: string;
    side: string;
    sole: string;
    wear: string;
  };
  conditionGrade: ConditionGrade;
  availabilityStatus: 'Available Now' | 'Booked until Oct 12' | 'Booked until Nov 1' | 'Limited Pairs';
  rating: number;
  reviewCount: number;
  description: string;
  sizingAdvice: string; // e.g. "Yeezy Boost 350 runs small; we recommend sizing up by half a size"
  securityDeposit: number;
  tags: string[];
}

export interface CartItem {
  id: string; // unique item id
  shoe: Shoe;
  selectedSizeUs: number;
  selectedSizeEu: number;
  rentalDuration: RentalDuration;
  startDate: string;
  endDate: string;
  insuranceSelected: boolean; // +$5
  expressDeliverySelected: boolean; // +$12
  rentalPrice: number;
  insurancePrice: number;
  depositHold: number;
}

export interface RentalOrder {
  id: string;
  userId: string; // renterId
  renterId?: string;
  lenderId?: string;
  shoeId: string;
  shoeName: string;
  brand: string;
  imageUrl: string;
  sizeUs: number;
  sizeEu: number;
  rentalDuration?: RentalDuration;
  startDate: string;
  endDate: string;
  rentalDays?: number;
  rentalPrice: number;
  totalRentalFee?: number;
  insuranceFee: number;
  shippingFee?: number;
  securityDeposit: number;
  totalPaid: number;
  escrowStatus?: EscrowStatus;
  status: RentalStatus;
  daysRemaining?: number;
  returnTrackingCode?: string;
  trackingNumber?: string;
  preRentalProofImages?: string[];
  postRentalProofImages?: string[];
  createdAt: string;
}

export type UserRole = 'renter' | 'lender' | 'admin';

export type KycStatus = 'unsubmitted' | 'pending' | 'approved' | 'rejected';

export type EscrowStatus = 'held' | 'released_to_lender' | 'refunded_to_renter' | 'disputed';

export type RentalStatus = 'pending' | 'accepted' | 'rejected' | 'shipped' | 'active' | 'returned' | 'completed' | 'disputed';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  kycStatus: KycStatus;
  shoeSizeUs: number;
  shoeSizeEu: number;
  isVerified: boolean;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  idDocumentUrl?: string;
  subscriptionPlan: 'pay_per_rent' | 'slay_pass' | 'vip_black';
  subscriptionStatus: 'active' | 'paused' | 'none';
  createdAt: string;
}

export interface LenderProfile {
  id?: string;
  userId: string;
  idCardImageUrl: string;
  bankBookImageUrl: string;
  bankAccountNumber: string;
  bankName: string;
  bankAccountName: string;
  status: KycStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface ShoeImage {
  id?: string;
  shoeId?: string;
  imageUrl: string;
  tag: 'side' | 'sole' | 'tag' | 'flaw' | 'other';
  isPrimary?: boolean;
}

export interface ShoeListing {
  id: string;
  lenderId: string;
  lenderName?: string;
  brand: string;
  model: string;
  sizeUs: number;
  sizeEu: number;
  sizeCm?: number;
  category: 'Sneakers' | 'Heels' | 'Boots' | 'Formal' | 'Performance' | 'Hiking' | 'Street';
  conditionRating: '95% (Like New)' | '90% (Pristine)' | '85% (Good Wear)' | '80% (Refreshed)';
  flawsDescription: string;
  rentalPricePerDay: number;
  rentalPricePerWeek: number;
  depositAmount: number;
  unavailableDates: string[]; // ISO date strings 'YYYY-MM-DD'
  images: ShoeImage[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  createdAt: string;
}

export interface Dispute {
  id: string;
  rentalId: string;
  shoeId: string;
  lenderId: string;
  renterId: string;
  renterEmail?: string;
  lenderEmail?: string;
  reason: string;
  proofImages: string[];
  claimedAmount: number;
  status: 'open' | 'resolved' | 'rejected';
  resolutionNotes?: string;
  createdAt: string;
}

export interface UserFile {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  category: 'id_verification' | 'rental_proof' | 'outfit_photo' | 'other';
}

export interface FilterState {
  gender: Gender | 'All';
  category: ShoeCategory | 'All';
  sizeUs: number | null;
  brand: string | 'All';
  duration: RentalDuration | 'All';
  priceRange: 'All' | '$' | '$$' | '$$$';
  searchQuery: string;
  sortBy: 'popular' | 'price_low' | 'price_high' | 'newest';
}

export interface FAQItem {
  id: string;
  category: 'General' | 'Sanitization' | 'Security Deposit' | 'Returns & Sizing' | 'Damage & Protection' | 'ทั่วไป' | 'การทำความสะอาด & ฆ่าเชื้อ' | 'เงินมัดจำความปลอดภัย' | 'การส่งคืน & ไซส์รองเท้า' | 'ความเสียหาย & การประกัน';
  question: string;
  answer: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderUid: string;
  senderName: string;
  senderEmail: string;
  isAdmin: boolean;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'rental' | 'payment' | 'deposit' | 'shoe_condition' | 'general';
  status: 'open' | 'in_progress' | 'resolved';
  lastMessage: string;
  updatedAt: string;
  createdAt: string;
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

@import "tailwindcss";

import React, { useState, useEffect } from 'react';
import { Shoe, CartItem, UserProfile, ShoeCategory } from './types';
import { INITIAL_SHOES } from './data/shoesData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { ValueProps } from './components/ValueProps';
import { FeaturedCategories } from './components/FeaturedCategories';
import { ProductListing } from './components/ProductListing';
import { ProductDetailModal } from './components/ProductDetailModal';
import { HowItWorks } from './components/HowItWorks';
import { PricingModal } from './components/PricingModal';
import { FAQsSection } from './components/FAQsSection';
import { SanitizationModal } from './components/SanitizationModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { DamagePolicyModal } from './components/DamagePolicyModal';
import { SecurityDepositNoticeModal } from './components/SecurityDepositNoticeModal';
import { AuthModal } from './components/AuthModal';
import { MemberOnlyAccessModal } from './components/MemberOnlyAccessModal';
import { CartDrawer } from './components/CartDrawer';
import { UserDashboard } from './components/UserDashboard';
import { LenderDashboard } from './components/LenderDashboard';
import { SupportChatWidget } from './components/SupportChatWidget';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, getUserProfileFromDb } from './lib/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'catalog' | 'how-it-works' | 'pricing' | 'faqs' | 'account' | 'lender'>('home');
  const [shoes] = useState<Shoe[]>(INITIAL_SHOES);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['shoe-1', 'shoe-2']);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ShoeCategory | 'All'>('All');

  // Modal Visibility States
  const [selectedShoePDP, setSelectedShoePDP] = useState<Shoe | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isMemberOnlyModalOpen, setIsMemberOnlyModalOpen] = useState(false);

  const [isSanitizationOpen, setIsSanitizationOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDamagePolicyOpen, setIsDamagePolicyOpen] = useState(false);
  const [isDepositNoticeOpen, setIsDepositNoticeOpen] = useState(false);

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfileFromDb(firebaseUser.uid);
        if (profile) {
          setUserProfile(profile);
        } else {
          setUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || 'slaymember@rentandslay.com',
            fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Slay Member',
            shoeSizeUs: 9,
            shoeSizeEu: 42,
            isVerified: true,
            verificationStatus: 'verified',
            subscriptionPlan: 'pay_per_rent',
            subscriptionStatus: 'active',
            createdAt: new Date().toISOString()
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToggleWishlist = (shoeId: string) => {
    setWishlistIds(prev => 
      prev.includes(shoeId) ? prev.filter(id => id !== shoeId) : [...prev, shoeId]
    );
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
    setSelectedShoePDP(null);
    setIsCartOpen(true);
  };

  const handleRentNow = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
    setSelectedShoePDP(null);
    setIsCartOpen(true);
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Sign out warning', err);
    }
    setUserProfile(null);
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleCategorySelectFromHome = (cat: ShoeCategory) => {
    setSelectedCategoryFilter(cat);
    setActiveTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-400 selection:text-zinc-950 flex flex-col justify-between">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.length}
        wishlistCount={wishlistIds.length}
        openCart={() => setIsCartOpen(true)}
        openAuthModal={openAuthModal}
        userProfile={userProfile}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (q.trim()) setActiveTab('catalog');
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            <HeroSection
              onBrowseClick={() => setActiveTab('catalog')}
              onHowItWorksClick={() => setActiveTab('how-it-works')}
              userProfile={userProfile}
              onAuthSuccess={(profile) => setUserProfile(profile)}
            />
            <ValueProps
              openSanitizationModal={() => setIsSanitizationOpen(true)}
              openHowItWorks={() => setActiveTab('how-it-works')}
            />
            <FeaturedCategories
              onSelectCategory={handleCategorySelectFromHome}
            />
            <ProductListing
              shoes={shoes}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onSelectShoe={(shoe) => setSelectedShoePDP(shoe)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              initialCategory={selectedCategoryFilter}
            />
          </div>
        )}

        {activeTab === 'catalog' && (
          <ProductListing
            shoes={shoes}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectShoe={(shoe) => setSelectedShoePDP(shoe)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            initialCategory={selectedCategoryFilter}
          />
        )}

        {activeTab === 'how-it-works' && (
          <HowItWorks
            onBrowseClick={() => setActiveTab('catalog')}
            openSanitizationModal={() => setIsSanitizationOpen(true)}
          />
        )}

        {activeTab === 'pricing' && (
          <PricingModal
            onSelectPlan={(plan) => {
              if (!userProfile) {
                openAuthModal('signup');
              } else {
                userProfile.subscriptionPlan = plan;
                setActiveTab('account');
              }
            }}
          />
        )}

        {activeTab === 'faqs' && (
          <FAQsSection />
        )}

        {activeTab === 'account' && (
          <UserDashboard
            userProfile={userProfile}
            shoes={shoes}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectShoe={(shoe) => setSelectedShoePDP(shoe)}
            openAuthModal={openAuthModal}
            openPricingPage={() => setActiveTab('pricing')}
          />
        )}

        {activeTab === 'lender' && (
          <LenderDashboard
            userProfile={userProfile}
            openAuthModal={openAuthModal}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        openSizeGuide={() => setIsSizeGuideOpen(true)}
        openDamagePolicy={() => setIsDamagePolicyOpen(true)}
        openSanitizationModal={() => setIsSanitizationOpen(true)}
        openDepositNotice={() => setIsDepositNoticeOpen(true)}
      />

      {/* Product Detail Modal (PDP) */}
      <ProductDetailModal
        shoe={selectedShoePDP}
        onClose={() => setSelectedShoePDP(null)}
        onAddToCart={handleAddToCart}
        onRentNow={handleRentNow}
        isWishlisted={selectedShoePDP ? wishlistIds.includes(selectedShoePDP.id) : false}
        onToggleWishlist={handleToggleWishlist}
        openSizeGuide={() => setIsSizeGuideOpen(true)}
        openDepositNotice={() => setIsDepositNoticeOpen(true)}
        openDamagePolicy={() => setIsDamagePolicyOpen(true)}
        userProfile={userProfile}
        openMemberOnlyModal={() => setIsMemberOnlyModalOpen(true)}
      />

      {/* Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={(id) => setCartItems(prev => prev.filter(i => i.id !== id))}
        onClearCart={() => setCartItems([])}
        userProfile={userProfile}
        openAuthModal={openAuthModal}
        onOrderPlaced={() => setActiveTab('account')}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={(profile) => setUserProfile(profile)}
      />

      {/* Member-Only Access Lock Modal */}
      <MemberOnlyAccessModal
        isOpen={isMemberOnlyModalOpen}
        onClose={() => setIsMemberOnlyModalOpen(false)}
        onOpenAuth={(mode) => openAuthModal(mode)}
      />

      {/* Policy & Guide Modals */}
      <SanitizationModal
        isOpen={isSanitizationOpen}
        onClose={() => setIsSanitizationOpen(false)}
      />

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <DamagePolicyModal
        isOpen={isDamagePolicyOpen}
        onClose={() => setIsDamagePolicyOpen(false)}
      />

      <SecurityDepositNoticeModal
        isOpen={isDepositNoticeOpen}
        onClose={() => setIsDepositNoticeOpen(false)}
      />

      {/* Floating Support Chat Widget */}
      <SupportChatWidget
        userProfile={userProfile}
        openAuthModal={(mode) => openAuthModal(mode || 'login')}
      />

    </div>
  );
}
