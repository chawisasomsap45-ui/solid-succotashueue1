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
