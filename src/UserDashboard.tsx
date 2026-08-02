import React, { useState, useEffect } from 'react';
import { UserProfile, RentalOrder, Shoe, UserFile } from '../types';
import { 
  User, 
  Clock, 
  ShieldCheck, 
  Printer, 
  PlusCircle, 
  Heart, 
  Crown, 
  CreditCard, 
  Upload, 
  Check, 
  FileText, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  Barcode, 
  X,
  Trash2,
  FolderOpen,
  File,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Ban
} from 'lucide-react';
import { 
  getUserRentalsFromDb, 
  extendRentalInDb, 
  cancelOrderAndTriggerRefundInDb,
  updateUserVerificationStatus,
  createUserFileInDb,
  getUserFilesFromDb,
  deleteUserFileFromDb,
  uploadFileToFirebaseStorage,
  deleteFileFromFirebaseStorage
} from '../lib/firebase';
import { AdminDashboard } from './AdminDashboard';

const ADMIN_UID = 'FvEu0W176CSy0iDQIJfFIu2u8x23';

interface UserDashboardProps {
  userProfile: UserProfile | null;
  shoes: Shoe[];
  wishlistIds: string[];
  onToggleWishlist: (shoeId: string) => void;
  onSelectShoe: (shoe: Shoe) => void;
  openAuthModal: (mode: 'login' | 'signup') => void;
  openPricingPage: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  userProfile,
  shoes,
  wishlistIds,
  onToggleWishlist,
  onSelectShoe,
  openAuthModal,
  openPricingPage
}) => {
  const [isAdminMode, setIsAdminMode] = useState<boolean>(true);

  if (!userProfile) {
    return (
      <div className="py-20 bg-[#0A0A0A] text-white min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-14 h-14 border border-white/20 bg-white/5 text-white flex items-center justify-center mx-auto">
            <User className="w-7 h-7 text-white/80" />
          </div>
          <h2 className="text-2xl font-light uppercase tracking-tighter text-white">เข้าสู่ระบบเพื่อใช้งานแดชบอร์ด</h2>
          <p className="text-xs text-white/50">
            ดูรายการเช่ารองเท้า ตัวนับเวลาถอยหลัง พิมพ์ใบนำส่งคืนพัสดุ จัดเก็บรองเท้าคู่โปรด และยืนยันตัวตน (KYC)
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="px-8 py-3.5 bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all"
          >
            เข้าสู่ระบบ / สมัครสมาชิก
          </button>
        </div>
      </div>
    );
  }

  // Admin User Routing
  const isAuthorizedAdmin = userProfile.email && (
    ['nondnoey1749@gmail.com', 'admin@rentandslay.com'].includes(userProfile.email.toLowerCase()) ||
    userProfile.role === 'admin' ||
    userProfile.uid === ADMIN_UID
  );

  if (isAuthorizedAdmin && isAdminMode) {
    return (
      <div>
        <div className="bg-[#161616] border-b border-amber-500/40 px-6 py-2.5 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-500 text-black font-extrabold text-[10px] uppercase rounded">ระบบผู้ดูแลระบบทำงาน</span>
            <span className="text-white/70">เข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบสูงสุด ({userProfile.email})</span>
          </div>
          <button
            onClick={() => setIsAdminMode(false)}
            className="px-3 py-1 bg-white/10 hover:bg-white hover:text-black border border-white/20 text-white font-bold text-[10px] uppercase tracking-wider rounded transition-all"
          >
            สลับไปยังมุมมองสมาชิก
          </button>
        </div>
        <AdminDashboard adminUser={userProfile} />
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'rentals' | 'history' | 'wishlist' | 'verification' | 'files' | 'subscription'>('rentals');
  const [rentals, setRentals] = useState<RentalOrder[]>([]);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loading, setLoading] = useState(true);

  // New File Upload Form State
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<'id_verification' | 'rental_proof' | 'outfit_photo' | 'other'>('id_verification');
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  // Modals inside dashboard
  const [returnLabelOrder, setReturnLabelOrder] = useState<RentalOrder | null>(null);
  const [extendModalOrder, setExtendModalOrder] = useState<RentalOrder | null>(null);
  const [buyoutOrder, setBuyoutOrder] = useState<RentalOrder | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<RentalOrder | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('เปลี่ยนใจ / สั่งผิดไซส์');
  const [processingCancel, setProcessingCancel] = useState(false);
  const [cancelSuccessInfo, setCancelSuccessInfo] = useState<{ refundRef: string; amount: number } | null>(null);

  const handleCancelOrderAndRefund = async () => {
    if (!cancelModalOrder) return;
    setProcessingCancel(true);
    try {
      const res = await cancelOrderAndTriggerRefundInDb(cancelModalOrder.id, cancelReason);
      if (res.success) {
        setCancelSuccessInfo({ refundRef: res.refundRef, amount: cancelModalOrder.totalPaid });
        setRentals(prev => prev.map(r => r.id === cancelModalOrder.id ? { ...r, status: 'cancelled' } : r));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingCancel(false);
    }
  };

  // ID Upload state
  const [idPhotoUrl, setIdPhotoUrl] = useState<string>('');
  const [uploadingId, setUploadingId] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (userProfile) {
        const list = await getUserRentalsFromDb(userProfile.uid);
        if (list.length === 0) {
          const mockActive: RentalOrder = {
            id: 'rent_sample_1',
            userId: userProfile.uid,
            shoeId: 'shoe-1',
            shoeName: 'Air Jordan 1 Retro High OG "Travis Scott"',
            brand: 'Jordan x Travis Scott',
            imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
            sizeUs: userProfile.shoeSizeUs || 9.5,
            sizeEu: userProfile.shoeSizeEu || 43,
            rentalDuration: '4_days',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            rentalPrice: 2890,
            insuranceFee: 150,
            securityDeposit: 5000,
            totalPaid: 3040,
            status: 'active',
            daysRemaining: 3,
            returnTrackingCode: 'SLAY-849201',
            createdAt: new Date().toISOString()
          };
          setRentals([mockActive]);
        } else {
          setRentals(list);
        }

        // Fetch User Files
        const filesList = await getUserFilesFromDb(userProfile.uid);
        if (filesList.length === 0) {
          // Provide sample file for first time user
          const mockFile: UserFile = {
            id: 'file_sample_1',
            userId: userProfile.uid,
            fileName: 'Passport_Verification_Doc.pdf',
            fileUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
            fileType: 'application/pdf',
            fileSize: 1024 * 450,
            uploadDate: new Date().toISOString().split('T')[0],
            category: 'id_verification'
          };
          setUserFiles([mockFile]);
        } else {
          setUserFiles(filesList);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [userProfile]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setFileUploading(true);

    try {
      let fileUrl = 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80';
      let fileName = newFileName || selectedFileObj?.name || 'Uploaded_Document.png';
      let fileSize = selectedFileObj?.size || 1024 * 350;
      let fileType = selectedFileObj?.type || 'image/png';

      if (selectedFileObj) {
        // Real upload to Firebase Storage
        fileUrl = await uploadFileToFirebaseStorage(selectedFileObj, userProfile.uid, newFileCategory);
      }

      const newFile: Omit<UserFile, 'id'> = {
        userId: userProfile.uid,
        fileName,
        fileUrl,
        fileType,
        fileSize,
        uploadDate: new Date().toISOString().split('T')[0],
        category: newFileCategory
      };

      const newId = await createUserFileInDb(newFile);
      setUserFiles(prev => [{ id: newId, ...newFile }, ...prev]);

      setNewFileName('');
      setSelectedFileObj(null);
    } catch (err) {
      console.error('File upload error', err);
    } finally {
      setFileUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!userProfile) return;
    const targetFile = userFiles.find(f => f.id === fileId);
    if (targetFile?.fileUrl) {
      await deleteFileFromFirebaseStorage(targetFile.fileUrl);
    }
    await deleteUserFileFromDb(fileId, userProfile.uid);
    setUserFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleExtendRental = async (orderId: string) => {
    await extendRentalInDb(orderId, 4);
    setRentals(prev => prev.map(r => r.id === orderId ? { ...r, daysRemaining: r.daysRemaining + 4, status: 'extended' } : r));
    setExtendModalOrder(null);
  };

  const handleUploadIdSim = async () => {
    setUploadingId(true);
    setTimeout(async () => {
      const mockUrl = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
      await updateUserVerificationStatus(userProfile.uid, mockUrl);
      userProfile.isVerified = true;
      userProfile.verificationStatus = 'verified';
      setUploadingId(false);
      setVerificationDone(true);
    }, 1200);
  };

  const wishlistedShoes = shoes.filter(s => wishlistIds.includes(s.id));

  return (
    <div className="py-12 bg-[#0A0A0A] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Admin Switch Back Banner */}
        {userProfile.uid === ADMIN_UID && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You are currently in <strong>Personal Member View</strong>. Switch back to view all Firestore users & files.</span>
            </div>
            <button
              onClick={() => setIsAdminMode(true)}
              className="px-3.5 py-1.5 bg-amber-500 text-black font-extrabold text-[10px] uppercase tracking-wider rounded-lg hover:bg-amber-400 transition-colors shrink-0"
            >
              Return to Admin Dashboard
            </button>
          </div>
        )}

        {/* Profile Banner Header */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border border-white/20 bg-white/5 text-white font-bold text-2xl flex items-center justify-center">
              {userProfile.fullName ? userProfile.fullName[0].toUpperCase() : 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold uppercase tracking-tight text-white">{userProfile.fullName}</h1>
                <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                  userProfile.isVerified ? 'bg-white/10 text-emerald-400 border-white/20' : 'bg-white/5 text-amber-400 border-white/10'
                }`}>
                  {userProfile.isVerified ? 'VERIFIED ✔' : 'PENDING ⏳'}
                </span>
              </div>
              <p className="text-xs text-white/50">{userProfile.email} • Preferred Size: US {userProfile.shoeSizeUs} (EU {userProfile.shoeSizeEu})</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openPricingPage}
              className="px-4 py-2.5 bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Crown className="w-4 h-4 text-white/80" />
              <span>Slay Plan: {userProfile.subscriptionPlan.toUpperCase().replace('_', ' ')}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('rentals')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'rentals' ? 'bg-white text-black' : 'bg-[#111111] text-white/70 border border-white/10 hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Active Rentals ({rentals.filter(r => r.status !== 'returned').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'history' ? 'bg-white text-black' : 'bg-[#111111] text-white/70 border border-white/10 hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Order History</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'wishlist' ? 'bg-white text-black' : 'bg-[#111111] text-white/70 border border-white/10 hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Saved Closet ({wishlistIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'verification' ? 'bg-white text-black' : 'bg-[#111111] text-white/70 border border-white/10 hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ID Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'files' ? 'bg-white text-black' : 'bg-[#111111] text-white/70 border border-white/10 hover:bg-white/5'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>My Files ({userFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
              activeTab === 'subscription' ? 'bg-white text-black' : 'bg-[#111111] text-white/70 border border-white/10 hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Subscription</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE RENTALS */}
        {activeTab === 'rentals' && (
          <div className="space-y-6">
            <h2 className="text-xl font-light uppercase tracking-tighter text-white">ACTIVE FOOTWEAR ON RENT</h2>

            {rentals.length === 0 ? (
              <div className="p-12 text-center bg-[#111111] rounded-2xl border border-white/10 space-y-3">
                <p className="text-sm font-bold uppercase tracking-wider text-white">No Active Rentals Right Now</p>
                <p className="text-xs text-white/50">Reserve your next pair from the catalog.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rentals.map((rental) => (
                  <div key={rental.id} className="p-6 rounded-2xl bg-[#111111] border border-white/10 space-y-4 relative">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 overflow-hidden bg-[#0A0A0A] border border-white/10 shrink-0">
                        <img src={rental.imageUrl} alt={rental.shoeName} className="w-full h-full object-cover" />
                      </div>

                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{rental.brand}</span>
                        <h3 className="text-sm font-bold uppercase text-white leading-tight">{rental.shoeName}</h3>
                        <p className="text-white/60">Size: US {rental.sizeUs} (EU {rental.sizeEu})</p>
                        <p className="text-white/60">Period: {rental.startDate} to {rental.endDate}</p>
                        <span className="inline-block px-2 py-0.5 bg-white/10 text-white font-bold text-[9px] uppercase tracking-widest">
                          {rental.status === 'extended' ? 'Extended (+4 Days)' : 'Active On Rent'}
                        </span>
                      </div>
                    </div>

                    {/* Live Days Remaining Counter */}
                    <div className="p-4 bg-[#0A0A0A] border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest font-bold text-white/40">Days Remaining</p>
                        <p className="text-xl font-light uppercase tracking-tight text-white">{rental.daysRemaining} Days Left</p>
                      </div>
                      <div className="w-24 bg-white/10 h-1.5 overflow-hidden">
                        <div 
                          className="bg-white h-full" 
                          style={{ width: `${Math.min(100, (rental.daysRemaining / 7) * 100)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setExtendModalOrder(rental)}
                        className="py-2.5 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-white/70" />
                        <span>Extend Rental</span>
                      </button>

                      <button
                        onClick={() => setReturnLabelOrder(rental)}
                        className="py-2.5 px-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-white/90 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Return Label</span>
                      </button>
                    </div>

                    {/* Auto Refund / Cancellation Trigger */}
                    <div className="pt-1">
                      {rental.status === 'cancelled' ? (
                        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><Ban className="w-3.5 h-3.5" /> ยกเลิกคำสั่งซื้อ & คืนเงินแล้ว</span>
                          <span className="text-[9px] text-rose-400/80">{rental.refundRef || 'REFUNDED'}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCancelSuccessInfo(null);
                            setCancelModalOrder(rental);
                          }}
                          className="w-full py-2 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors rounded-lg"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>ยกเลิกคำสั่งซื้อ & คืนเงินอัตโนมัติ (Cancel & Auto-Refund)</span>
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDER HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl font-light uppercase tracking-tighter text-white">ORDER HISTORY & INVOICES</h2>
            <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0A0A0A] text-white/40 font-bold uppercase text-[10px] tracking-widest border-b border-white/10">
                    <tr>
                      <th className="p-4">Shoe & Model</th>
                      <th className="p-4">Rental Duration</th>
                      <th className="p-4">Total Paid</th>
                      <th className="p-4">Security Hold</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Buyout Option</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-white/80">
                    {rentals.map((r) => (
                      <tr key={r.id} className="hover:bg-white/5">
                        <td className="p-4 flex items-center gap-3">
                          <img src={r.imageUrl} alt="" className="w-10 h-10 object-cover border border-white/10" />
                          <div>
                            <p className="font-bold text-white uppercase text-xs">{r.shoeName}</p>
                            <p className="text-[10px] text-white/40 font-mono">{r.returnTrackingCode}</p>
                          </div>
                        </td>
                        <td className="p-4 text-white/70">{r.startDate} to {r.endDate}</td>
                        <td className="p-4 font-bold text-white">${r.totalPaid}</td>
                        <td className="p-4 text-white/50">${r.securityDeposit} (Released)</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-white/10 border border-white/20 text-white font-bold text-[9px] uppercase tracking-widest">
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => setBuyoutOrder(r)}
                            className="px-3 py-1.5 border border-white/20 bg-white/5 hover:bg-white hover:text-black font-bold text-[10px] uppercase tracking-widest transition-colors"
                          >
                            Buyout
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WISHLIST CLOSET */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <h2 className="text-xl font-light uppercase tracking-tighter text-white">SAVED CLOSET ({wishlistedShoes.length})</h2>

            {wishlistedShoes.length === 0 ? (
              <div className="p-12 text-center bg-[#111111] rounded-2xl border border-white/10 space-y-3">
                <Heart className="w-7 h-7 text-white/30 mx-auto" />
                <p className="text-sm font-bold uppercase tracking-wider text-white">Your Closet is empty</p>
                <p className="text-xs text-white/50">Heart any pair in the catalog to save it for your next event.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {wishlistedShoes.map((shoe) => (
                  <div key={shoe.id} className="p-4 rounded-2xl bg-[#111111] border border-white/10 space-y-3 relative">
                    <div className="h-48 overflow-hidden bg-[#0A0A0A] border border-white/10">
                      <img src={shoe.images.main} alt={shoe.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{shoe.brand}</p>
                      <h3 className="text-xs font-bold uppercase text-white truncate">{shoe.name}</h3>
                      <p className="text-xs font-bold text-white mt-1">${shoe.rentalPrices.fourDays} / 4 days</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onSelectShoe(shoe)}
                        className="flex-1 py-2 bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90"
                      >
                        Rent Now
                      </button>
                      <button
                        onClick={() => onToggleWishlist(shoe.id)}
                        className="p-2 text-rose-400 bg-[#0A0A0A] border border-white/10"
                      >
                        <Heart className="w-4 h-4 fill-rose-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: IDENTITY VERIFICATION */}
        {activeTab === 'verification' && (
          <div className="max-w-2xl bg-[#111111] border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-3 border border-white/20 bg-white/5 text-white">
                <ShieldCheck className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h2 className="text-lg font-light uppercase tracking-tighter text-white">IDENTITY VERIFICATION CENTER</h2>
                <p className="text-xs text-white/50">Required once before taking delivery of luxury footwear inventory</p>
              </div>
            </div>

            <div className="p-4 bg-[#0A0A0A] border border-white/10 flex items-center justify-between text-xs">
              <span className="uppercase text-[10px] tracking-widest text-white/40 font-bold">Current Status:</span>
              <span className={`font-bold px-3 py-1 uppercase text-[10px] tracking-widest ${
                userProfile.isVerified 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {userProfile.isVerified ? 'VERIFIED ✔' : 'UNVERIFIED / PENDING ⏳'}
              </span>
            </div>

            {verificationDone || userProfile.isVerified ? (
              <div className="p-6 bg-white/5 border border-white/10 text-white text-xs space-y-2">
                <p className="font-bold text-sm uppercase tracking-wider text-emerald-400">Identity Verified Successfully!</p>
                <p className="text-white/70">Your ID and photo verification are complete. You hold active rental clearance across all luxury pairs.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-white/70">
                  Please upload a photo of your Passport, Driver's License, or National ID card to complete account verification.
                </p>

                <div className="border border-dashed border-white/20 hover:border-white/50 p-8 text-center space-y-3 bg-[#0A0A0A] cursor-pointer">
                  <Upload className="w-7 h-7 text-white/60 mx-auto" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white">Click or drag ID Photo here</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/40">JPG, PNG, PDF up to 10MB</p>
                  </div>
                </div>

                <button
                  onClick={handleUploadIdSim}
                  disabled={uploadingId}
                  className="w-full py-3.5 bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90"
                >
                  {uploadingId ? 'Verifying Document...' : 'Submit ID Document for Instant Verification'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MY FILES & DOCUMENTS */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111111] p-6 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 border border-white/20 bg-white/5 text-white">
                  <FolderOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-light uppercase tracking-tighter text-white">MY FILES & SECURE DOCUMENTS</h2>
                  <p className="text-xs text-white/50">Upload, view, and manage your isolated personal documents & receipts</p>
                </div>
              </div>

              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>Isolated Security Rules Active</span>
              </div>
            </div>

            {/* Upload File Form */}
            <form onSubmit={handleFileUpload} className="p-6 bg-[#111111] border border-white/10 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Upload New File</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                    Document / File Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Driver_License_Front.jpg or Rental_Receipt_July.pdf"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-1">
                    File Category
                  </label>
                  <select
                    value={newFileCategory}
                    onChange={(e: any) => setNewFileCategory(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="id_verification" className="bg-[#0A0A0A]">ID Verification Document</option>
                    <option value="rental_proof" className="bg-[#0A0A0A]">Rental Receipt / Proof</option>
                    <option value="outfit_photo" className="bg-[#0A0A0A]">Outfit Photo / Style Shot</option>
                    <option value="other" className="bg-[#0A0A0A]">Other Document</option>
                  </select>
                </div>
              </div>

              {/* Drag & Drop File Picker */}
              <div className="relative border border-dashed border-white/20 hover:border-white/50 bg-[#0A0A0A] rounded-xl p-6 text-center transition-all">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFileObj(e.target.files[0]);
                      if (!newFileName) setNewFileName(e.target.files[0].name);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-6 h-6 text-white/60 mx-auto mb-2" />
                <p className="text-xs font-bold uppercase tracking-wider text-white">
                  {selectedFileObj ? `Selected: ${selectedFileObj.name} (${Math.round(selectedFileObj.size / 1024)} KB)` : 'Click or Drag file to select'}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                  Supports Images, PDF, JPG, PNG (Protected by User UID Security Rule)
                </p>
              </div>

              <button
                type="submit"
                disabled={fileUploading}
                className="w-full py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 transition-all rounded-lg flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{fileUploading ? 'Storing File Metadata...' : 'UPLOAD FILE & SAVE TO FIREBASE'}</span>
              </button>
            </form>

            {/* List of User Files */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Your Stored Files ({userFiles.length})</h3>

              {userFiles.length === 0 ? (
                <div className="p-8 text-center bg-[#111111] rounded-2xl border border-white/10 space-y-2">
                  <FolderOpen className="w-8 h-8 text-white/30 mx-auto" />
                  <p className="text-xs font-bold uppercase tracking-wider text-white">No Files Uploaded Yet</p>
                  <p className="text-[11px] text-white/50">Upload your ID documents, fit photos, or return receipts above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userFiles.map((f) => (
                    <div key={f.id} className="p-4 bg-[#111111] border border-white/10 rounded-2xl flex items-start justify-between gap-3 relative">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-[#0A0A0A] border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                          {f.fileType.includes('image') ? (
                            <img src={f.fileUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <File className="w-5 h-5 text-white/70" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {f.category.replace('_', ' ').toUpperCase()}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{f.fileName}</h4>
                          <p className="text-[10px] text-white/50">
                            Uploaded {f.uploadDate} • {Math.round(f.fileSize / 1024)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <a
                          href={f.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-white/60 hover:text-white bg-[#0A0A0A] border border-white/10 rounded-lg transition-colors"
                          title="View File"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => handleDeleteFile(f.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 6: SUBSCRIPTION MANAGER */}
        {activeTab === 'subscription' && (
          <div className="max-w-2xl bg-[#111111] border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-3 border border-white/20 bg-white/5 text-white">
                <Crown className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h2 className="text-lg font-light uppercase tracking-tighter text-white">SLAY PASS SUBSCRIPTION</h2>
                <p className="text-xs text-white/50">Manage monthly unlimited swaps and rental tiers</p>
              </div>
            </div>

            <div className="p-4 bg-[#0A0A0A] border border-white/10 space-y-2 text-xs">
              <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Current Active Membership Plan:</p>
              <p className="text-base font-light tracking-tight text-white uppercase">{userProfile.subscriptionPlan.replace('_', ' ')}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-widest">Next Renewal Date: 30 days from now</p>
            </div>

            <div className="flex gap-3">
              <button onClick={openPricingPage} className="flex-1 py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90">
                Upgrade / Swap Plan
              </button>
              <button className="py-3 px-4 bg-[#0A0A0A] border border-white/10 text-white/60 hover:text-white font-bold text-[10px] uppercase tracking-widest">
                Pause Subscription
              </button>
            </div>
          </div>
        )}

      </div>

      {/* RETURN LABEL MODAL */}
      {returnLabelOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-zinc-950 rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl relative">
            <button onClick={() => setReturnLabelOrder(null)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-950">
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-zinc-300 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black tracking-tight">RENT & SLAY RETURN LABEL</h3>
                <p className="text-xs text-zinc-600 font-bold">PRE-PAID PRIORITY RETURN EXPRESS</p>
              </div>
              <Barcode className="w-12 h-12 text-zinc-950" />
            </div>

            <div className="space-y-4 text-xs font-mono border-2 border-zinc-950 p-4 rounded-xl">
              <div>
                <p className="font-bold uppercase text-[10px] text-zinc-500">SHIP FROM:</p>
                <p className="font-bold">{userProfile.fullName}</p>
                <p>{userProfile.email}</p>
              </div>

              <div className="border-t border-zinc-300 pt-3">
                <p className="font-bold uppercase text-[10px] text-zinc-500">DELIVER TO (VAULT WAREHOUSE):</p>
                <p className="font-bold">RENT AND SLAY SANITIZATION LAB</p>
                <p>450 Luxury Kicks Way, Suite 100</p>
                <p>Los Angeles, CA 90015</p>
              </div>

              <div className="border-t border-zinc-300 pt-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">TRACKING #: {returnLabelOrder.returnTrackingCode}</p>
                  <p className="text-[10px] text-zinc-600">Item: {returnLabelOrder.shoeName} (US {returnLabelOrder.sizeUs})</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Return Label Sent to Printer!');
                setReturnLabelOrder(null);
              }}
              className="w-full py-3.5 bg-zinc-950 text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 hover:bg-zinc-800"
            >
              <Printer className="w-4 h-4" />
              <span>Print Return Label Now</span>
            </button>
          </div>
        </div>
      )}

      {/* EXTEND RENTAL MODAL */}
      {extendModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-white/10 max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-sm font-bold uppercase tracking-wider">Extend Rental by +4 Days</h3>
            <p className="text-xs text-white/60">
              Love wearing your {extendModalOrder.shoeName}? Keep them for 4 extra days for only $25.
            </p>
            <div className="p-3 bg-[#0A0A0A] border border-white/10 text-xs text-white/80 font-bold uppercase tracking-widest text-[10px]">
              New Return Date will update automatically.
            </div>
            <div className="flex gap-2">
              <button onClick={() => setExtendModalOrder(null)} className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest">
                Cancel
              </button>
              <button onClick={() => handleExtendRental(extendModalOrder.id)} className="flex-1 py-2.5 bg-white text-black font-bold text-[10px] uppercase tracking-widest">
                Pay $25 & Extend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUYOUT MODAL */}
      {buyoutOrder && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-white/10 max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Buyout Shoes Forever</h3>
            <p className="text-xs text-white/60">
              Keep {buyoutOrder.shoeName}! We subtract your paid rental (${buyoutOrder.rentalPrice}) from retail value.
            </p>
            <div className="p-4 bg-[#0A0A0A] border border-white/10 text-xs space-y-1">
              <p className="flex justify-between text-white/50 uppercase tracking-widest text-[10px]"><span>Retail Price:</span><span>$850</span></p>
              <p className="flex justify-between text-emerald-400 uppercase tracking-widest text-[10px]"><span>Less Rental Credit:</span><span>-${buyoutOrder.rentalPrice}</span></p>
              <p className="flex justify-between font-bold text-white text-xs uppercase tracking-wider border-t border-white/10 pt-2 mt-1">
                <span>Final Buyout Price:</span><span>${850 - buyoutOrder.rentalPrice}</span>
              </p>
            </div>
            <button
              onClick={() => {
                alert('Buyout Confirmed! These shoes are now officially yours forever.');
                setBuyoutOrder(null);
              }}
              className="w-full py-3 bg-white text-black font-bold text-[10px] uppercase tracking-widest"
            >
              Confirm Buyout Purchase
            </button>
          </div>
        </div>
      )}

      {/* AUTOMATED CANCELLATION & REFUND MODAL */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-white/20 max-w-lg w-full p-6 space-y-5 text-white rounded-2xl shadow-2xl relative">
            <button 
              onClick={() => {
                setCancelModalOrder(null);
                setCancelSuccessInfo(null);
              }}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-white">ระบบยกเลิกคำสั่งซื้อ & คืนเงินอัตโนมัติ</h3>
                <p className="text-[11px] text-white/50">Order Cancellation & Payment Gateway Auto-Refund System</p>
              </div>
            </div>

            {cancelSuccessInfo ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-emerald-400 uppercase tracking-tight">ทำรายการคืนเงินสำเร็จ!</h4>
                  <p className="text-xs text-white/70">ยอดเงินได้รับการโอนคืนไปยังช่องทางเดิมของคุณโดยอัตโนมัติ</p>
                </div>

                <div className="p-4 bg-[#0A0A0A] border border-white/10 rounded-xl text-xs space-y-2 text-left">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">หมายเลขอ้างอิงคืนเงิน (Refund Ref):</span>
                    <span className="font-mono text-amber-400 font-bold">{cancelSuccessInfo.refundRef}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">จำนวนเงินที่คืนเต็มจำนวน:</span>
                    <span className="font-bold text-white text-sm">฿{cancelSuccessInfo.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/50">สถานะสต็อกสินค้า:</span>
                    <span className="text-emerald-400 font-bold">คืนสต็อกเข้าคลังแล้ว (Re-stocked)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">การแจ้งเตือน:</span>
                    <span className="text-white/90">ส่ง Email/SMS ยืนยันเรียบร้อย</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCancelModalOrder(null);
                    setCancelSuccessInfo(null);
                  }}
                  className="w-full py-3 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 rounded-xl"
                >
                  ตกลง / ปิดหน้าต่าง
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">เงื่อนไขการคืนเงินอัตโนมัติ (Cut-off Rules):</p>
                    <p className="text-[11px] text-amber-200/80 mt-0.5">
                      สามารถยกเลิกและรับเงินคืนเต็มจำนวนทันที เนื่องจากคำสั่งซื้ออยู่ในสถานะเตรียมจัดส่ง (ก่อนการบรรจุหีบห่อ/แพ็กสินค้า)
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#0A0A0A] border border-white/10 rounded-xl flex items-center gap-3">
                  <img src={cancelModalOrder.imageUrl} alt={cancelModalOrder.shoeName} className="w-14 h-14 object-cover rounded-lg border border-white/10" />
                  <div className="text-xs">
                    <p className="text-white/50 text-[10px] uppercase font-bold">{cancelModalOrder.brand}</p>
                    <p className="font-bold text-white uppercase">{cancelModalOrder.shoeName}</p>
                    <p className="text-emerald-400 font-bold mt-0.5">ยอดชำระ: ฿{cancelModalOrder.totalPaid.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">ระบุสาเหตุการยกเลิก</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="เปลี่ยนใจ / สั่งผิดไซส์">เปลี่ยนใจ / สั่งผิดไซส์</option>
                    <option value="เลือกวันใช้งานผิด">เลือกวันใช้งานผิด</option>
                    <option value="ต้องการเปลี่ยนรุ่นรองเท้า">ต้องการเปลี่ยนรุ่นรองเท้า</option>
                    <option value="เหตุผลอื่นๆ">เหตุผลอื่นๆ</option>
                  </select>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] space-y-1.5 text-white/70">
                  <p className="font-bold text-white uppercase text-[10px] tracking-wider">กระบวนการที่จะเกิดขึ้นอัตโนมัติ (Automated Steps):</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                    <li>ยิง API ไปยัง Payment Gateway เพื่อสั่ง คืนเงินเต็มจำนวน 100%</li>
                    <li>คืนสต็อกรองเท้ากลับเข้าคลังระบบ (Inventory Re-stocking)</li>
                    <li>อัปเดตสถานะเป็น 'Cancelled / Refunded'</li>
                    <li>ส่งอีเมลแจ้งเตือนพร้อมสลิปคืนเงินแบบอัตโนมัติ</li>
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setCancelModalOrder(null)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 rounded-xl"
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    onClick={handleCancelOrderAndRefund}
                    disabled={processingCancel}
                    className="flex-1 py-3 bg-rose-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center gap-2 rounded-xl"
                  >
                    {processingCancel ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>กำลังประมวลผล...</span>
                      </>
                    ) : (
                      <span>ยืนยันยกเลิก & คืนเงิน</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
