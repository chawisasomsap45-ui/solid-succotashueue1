import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, UserFile, LenderProfile, ShoeListing, Dispute, SupportTicket, SupportMessage } from '../types';
import { 
  getAllUsersFromDb, 
  getAllUserFilesFromDb, 
  deleteUserFileFromDb, 
  getAllLenderProfilesFromDb, 
  updateLenderKycStatusInDb, 
  getAllShoesFromDb, 
  updateShoeApprovalInDb, 
  getAllDisputesFromDb, 
  resolveDisputeInDb,
  getAllSupportTicketsFromDb,
  getSupportMessagesInDb,
  sendSupportMessageInDb,
  updateTicketStatusInDb
} from '../lib/firebase';
import { 
  ShieldCheck, 
  Users, 
  FolderOpen, 
  Search, 
  RefreshCw, 
  Trash2, 
  X, 
  Eye, 
  Crown, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Check, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Building2, 
  ExternalLink,
  MessageSquare,
  Send,
  Headphones,
  Lock,
  ChevronRight
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: UserProfile;
}

const AUTHORIZED_ADMIN_EMAILS = [
  'nondnoey1749@gmail.com',
  'admin@rentandslay.com'
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser }) => {
  const [activeTab, setActiveTab] = useState<'support' | 'users' | 'kyc' | 'shoes' | 'disputes'>('support');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allFiles, setAllFiles] = useState<UserFile[]>([]);
  const [lenderProfiles, setLenderProfiles] = useState<LenderProfile[]>([]);
  const [shoes, setShoes] = useState<ShoeListing[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  
  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<SupportMessage[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  // Resolution Notes
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const adminChatBottomRef = useRef<HTMLDivElement>(null);

  // Security Check: Specific Admin Email Restriction
  const userEmail = (adminUser.email || '').toLowerCase();
  const isAuthorizedAdmin = AUTHORIZED_ADMIN_EMAILS.includes(userEmail) || adminUser.role === 'admin';

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsersFromDb();
      const fetchedFiles = await getAllUserFilesFromDb();
      const fetchedKyc = await getAllLenderProfilesFromDb();
      const fetchedShoes = await getAllShoesFromDb();
      const fetchedDisputes = await getAllDisputesFromDb();
      const fetchedTickets = await getAllSupportTicketsFromDb();

      let finalUsers = fetchedUsers;
      if (finalUsers.length === 0) {
        finalUsers = [
          {
            uid: adminUser.uid,
            email: adminUser.email || 'nondnoey1749@gmail.com',
            fullName: adminUser.fullName || 'Master Administrator',
            role: 'admin',
            kycStatus: 'approved',
            shoeSizeUs: adminUser.shoeSizeUs || 9,
            shoeSizeEu: adminUser.shoeSizeEu || 42,
            isVerified: true,
            verificationStatus: 'verified',
            subscriptionPlan: 'vip_black',
            subscriptionStatus: 'active',
            createdAt: adminUser.createdAt || new Date().toISOString()
          }
        ];
      }

      setUsers(finalUsers);
      setAllFiles(fetchedFiles);
      setLenderProfiles(fetchedKyc);
      setShoes(fetchedShoes);
      setDisputes(fetchedDisputes);
      setSupportTickets(fetchedTickets);

      if (fetchedTickets.length > 0 && !selectedTicket) {
        setSelectedTicket(fetchedTickets[0]);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorizedAdmin) {
      loadAdminData();
    }
  }, [adminUser.uid, isAuthorizedAdmin]);

  // Load chat messages when selected ticket changes
  const loadTicketMessages = async (ticketId: string) => {
    try {
      const msgs = await getSupportMessagesInDb(ticketId);
      setTicketMessages(msgs);
    } catch (err) {
      console.error('Error loading ticket msgs:', err);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (selectedTicket) {
      loadTicketMessages(selectedTicket.id);
      interval = setInterval(() => {
        loadTicketMessages(selectedTicket.id);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedTicket?.id]);

  useEffect(() => {
    adminChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketMessages]);

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReplyText.trim()) return;

    const reply = adminReplyText.trim();
    setAdminReplyText('');

    try {
      await sendSupportMessageInDb(
        selectedTicket.id,
        adminUser.uid,
        adminUser.fullName || 'System Administrator',
        adminUser.email,
        true,
        reply
      );
      await loadTicketMessages(selectedTicket.id);
      const updatedTickets = await getAllSupportTicketsFromDb();
      setSupportTickets(updatedTickets);
    } catch (err) {
      console.error('Admin reply error:', err);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'resolved') => {
    try {
      await updateTicketStatusInDb(ticketId, status);
      setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error('Ticket status update error:', err);
    }
  };

  // Handle Approve / Reject KYC
  const handleKycStatusChange = async (userId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await updateLenderKycStatusInDb(userId, status, reason);
      setLenderProfiles(prev => prev.map(p => p.userId === userId ? { ...p, status } : p));
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, kycStatus: status, role: 'lender' } : u));
      alert(`Updated Lender KYC status to: ${status === 'approved' ? 'Approved' : 'Rejected'}`);
    } catch (err) {
      console.error('KYC update error:', err);
    }
  };

  // Handle Approve / Reject Shoe
  const handleShoeApproval = async (shoeId: string, status: 'approved' | 'rejected') => {
    try {
      await updateShoeApprovalInDb(shoeId, status);
      setShoes(prev => prev.map(s => s.id === shoeId ? { ...s, approvalStatus: status } : s));
      alert(`Updated shoe listing status to: ${status === 'approved' ? 'Approved' : 'Rejected'}`);
    } catch (err) {
      console.error('Shoe approval error:', err);
    }
  };

  // Handle Resolve Dispute
  const handleResolveDispute = async (dispute: Dispute, decision: 'released_to_lender' | 'refunded_to_renter') => {
    try {
      await resolveDisputeInDb(
        dispute.id,
        dispute.rentalId,
        'resolved',
        resolutionNotes || `Resolved by Master Admin via decision: ${decision}`,
        decision
      );
      setDisputes(prev => prev.map(d => d.id === dispute.id ? { ...d, status: 'resolved', resolutionNotes } : d));
      alert(`Dispute resolved successfully.`);
      setResolutionNotes('');
    } catch (err) {
      console.error('Resolve dispute error:', err);
    }
  };

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-[80vh] bg-[#0A0A0A] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-[#111111] border border-rose-500/40 rounded-3xl p-8 space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/20 border-2 border-rose-500 rounded-full flex items-center justify-center text-rose-500 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Access Restricted to System Administrators</h2>
          <p className="text-xs text-white/60 leading-relaxed">
            This management console is strictly reserved for master admin email <strong className="text-amber-400 font-mono">nondnoey1749@gmail.com</strong>.
          </p>
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] font-mono text-white/40">
            Current account email: {adminUser.email || 'Not specified'}
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.uid?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openTicketsCount = supportTickets.filter(t => t.status === 'open').length;
  const pendingKycCount = lenderProfiles.filter(p => p.status === 'pending').length;
  const pendingShoesCount = shoes.filter(s => s.approvalStatus === 'pending').length;
  const openDisputesCount = disputes.filter(d => d.status === 'open').length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER BADGE */}
        <div className="p-6 bg-[#111111] border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500/20 border-2 border-amber-500/50 rounded-xl flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500 text-black font-extrabold text-[10px] uppercase tracking-widest rounded-md flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Master Admin Control Panel
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">{adminUser.email}</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1">
                Customer Support & Platform Safety Management Center
              </h1>
              <p className="text-xs text-white/60">
                24/7 Live Customer Chat • KYC Identity Checks • Shoe Listing Approvals • Security Deposit Arbitration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              disabled={loading}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* METRICS METERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-[#111111] border border-amber-500/30 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">Open Customer Tickets</p>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">{openTicketsCount} tickets</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400">
              <Headphones className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 bg-[#111111] border border-blue-500/20 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">Lenders Pending KYC</p>
              <p className="text-2xl font-extrabold text-blue-400 mt-1">{pendingKycCount} lenders</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 bg-[#111111] border border-emerald-500/20 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Shoes Pending Approval</p>
              <p className="text-2xl font-extrabold text-emerald-400 mt-1">{pendingShoesCount} pairs</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 bg-[#111111] border border-rose-500/20 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400">Deposit Disputes</p>
              <p className="text-2xl font-extrabold text-rose-400 mt-1">{openDisputesCount} disputes</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'support' ? 'bg-amber-500 text-black shadow-lg' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4" /> Live Support Chat ({supportTickets.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'users' ? 'bg-amber-500 text-black shadow-lg' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> User Directory ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'kyc' ? 'bg-amber-500 text-black shadow-lg' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Lender KYC Reviews ({lenderProfiles.length})
          </button>

          <button
            onClick={() => setActiveTab('shoes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'shoes' ? 'bg-amber-500 text-black shadow-lg' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" /> Shoe Approvals ({shoes.length})
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'disputes' ? 'bg-amber-500 text-black shadow-lg' : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Deposit Disputes ({disputes.length})
          </button>
        </div>

        {/* TAB 1: SUPPORT TICKETS & LIVE CHAT */}
        {activeTab === 'support' && (
          <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
            
            {/* TICKET LIST SIDEBAR */}
            <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-white/10 p-4 space-y-4 flex flex-col bg-[#0A0A0A]">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  Customer Support Inquiries
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">
                  {supportTickets.length} messages
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {supportTickets.length === 0 ? (
                  <div className="py-12 text-center text-xs text-white/40">
                    No support inquiries submitted yet.
                  </div>
                ) : (
                  supportTickets.map((t) => {
                    const isSelected = selectedTicket?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                          isSelected 
                            ? 'bg-amber-500/10 border-amber-500 text-white' 
                            : 'bg-[#111111] border-white/5 hover:border-white/20 text-white/70'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-amber-400">{t.userName}</span>
                          <span className={`px-2 py-0.5 font-bold uppercase rounded ${
                            t.status === 'open' ? 'bg-amber-500 text-black' : t.status === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-black'
                          }`}>
                            {t.status === 'open' ? 'Open' : t.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-white">{t.subject}</h4>
                        <p className="text-[11px] text-white/50 line-clamp-1">{t.lastMessage}</p>

                        <div className="flex items-center justify-between text-[9px] text-white/30 pt-1 border-t border-white/5 font-mono">
                          <span>{t.userEmail}</span>
                          <span>{new Date(t.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* CHAT MESSAGES DISPLAY */}
            <div className="lg:col-span-7 flex flex-col h-full bg-[#111111]">
              {selectedTicket ? (
                <>
                  {/* TICKET TOP BAR */}
                  <div className="p-4 bg-[#0A0A0A] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold text-[10px] rounded">
                          {selectedTicket.category}
                        </span>
                        <h3 className="font-bold text-sm text-white">{selectedTicket.subject}</h3>
                      </div>
                      <p className="text-[11px] text-white/50 mt-0.5">
                        Customer: <strong className="text-white">{selectedTicket.userName}</strong> ({selectedTicket.userEmail})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value as any)}
                        className="bg-[#111111] border border-white/20 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400 font-bold"
                      >
                        <option value="open">Status: Open</option>
                        <option value="in_progress">Status: In Progress</option>
                        <option value="resolved">Status: Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* CHAT THREAD */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0A0A0A]/40 max-h-[420px]">
                    {ticketMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.isAdmin ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[9px] text-white/40 mb-1">
                          {m.isAdmin ? (
                            <span className="px-1.5 py-0.2 bg-amber-500 text-black font-extrabold text-[8px] rounded">
                              ADMIN RESPONSE
                            </span>
                          ) : (
                            <span className="font-bold text-white/70">{m.senderName}</span>
                          )}
                          <span>•</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-sans leading-relaxed ${
                          m.isAdmin 
                            ? 'bg-amber-500 text-black font-medium rounded-tr-none shadow-md' 
                            : 'bg-[#1E1E1E] border border-white/10 text-white rounded-tl-none'
                        }`}>
                          {m.message}
                        </div>
                      </div>
                    ))}
                    <div ref={adminChatBottomRef} />
                  </div>

                  {/* ADMIN REPLY FORM */}
                  <form onSubmit={handleSendAdminReply} className="p-3 bg-[#0A0A0A] border-t border-white/10 flex items-center gap-2">
                    <input
                      type="text"
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="Type admin response to customer..."
                      className="flex-1 bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!adminReplyText.trim()}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-lg"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="my-auto text-center py-16 text-white/30 space-y-2">
                  <Headphones className="w-10 h-10 mx-auto text-white/20" />
                  <p className="text-xs">Select a support ticket from the left panel to begin live customer chat.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: USERS LIST */}
        {activeTab === 'users' && (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  Database Registered Users
                </h2>
                <p className="text-xs text-white/50">Manage accounts, permissions, and verify identity credentials.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email or name..."
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-extrabold uppercase tracking-widest text-white/40 bg-white/5">
                    <th className="py-3 px-4">User Name & Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">UID</th>
                    <th className="py-3 px-4 text-center">KYC Status</th>
                    <th className="py-3 px-4 text-right">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr 
                      key={u.uid}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center text-xs">
                            {u.fullName ? u.fullName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{u.fullName || 'User Account'}</span>
                              {u.email === 'nondnoey1749@gmail.com' && (
                                <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[9px] font-extrabold uppercase tracking-widest rounded">
                                  MASTER ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-white/60 text-[11px] font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold text-amber-400 uppercase text-[10px]">
                        {u.role === 'admin' ? 'ADMIN' : u.role === 'lender' ? 'LENDER' : 'RENTER'}
                      </td>

                      <td className="py-4 px-4 font-mono text-[11px] text-white/50">
                        {u.uid}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.kycStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {u.kycStatus === 'approved' ? 'APPROVED' : 'PENDING'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span className="text-[10px] text-white/40 font-mono">Created: {new Date(u.createdAt).toLocaleDateString('en-US')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LENDER KYC */}
        {activeTab === 'kyc' && (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Lender KYC & Identity Document Verification
              </h2>
              <p className="text-xs text-white/50">Review ID documents and bank account passbooks for payout authorization.</p>
            </div>

            {lenderProfiles.length === 0 ? (
              <div className="py-12 text-center text-white/40 border border-dashed border-white/10 rounded-xl">
                No submitted KYC documents found currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lenderProfiles.map((profile) => (
                  <div key={profile.userId} className="p-5 bg-[#0A0A0A] border border-white/10 rounded-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-white/50">User ID: {profile.userId}</span>
                        <h3 className="font-bold text-sm text-white">{profile.bankAccountName}</h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        profile.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {profile.status === 'approved' ? 'APPROVED' : 'PENDING'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-white/50">National ID Photo:</span>
                        <div className="h-28 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                          <img src={profile.idCardImageUrl} alt="ID Document" className="w-full h-full object-cover" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-white/50">Bank Book Photo:</span>
                        <div className="h-28 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                          <img src={profile.bankBookImageUrl} alt="Bank Book" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#111111] border border-white/5 rounded-lg space-y-1 text-xs">
                      <p><strong className="text-white/60">Bank:</strong> {profile.bankName}</p>
                      <p><strong className="text-white/60">Account No:</strong> <span className="font-mono text-amber-400">{profile.bankAccountNumber}</span></p>
                    </div>

                    {profile.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleKycStatusChange(profile.userId, 'approved')}
                          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Approve KYC
                        </button>
                        <button
                          onClick={() => handleKycStatusChange(profile.userId, 'rejected', 'Unclear documents')}
                          className="py-2 px-4 bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SHOE APPROVALS */}
        {activeTab === 'shoes' && (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                Marketplace Shoe Approvals
              </h2>
              <p className="text-xs text-white/50">Verify condition photos and pricing before approving shoes to public catalog.</p>
            </div>

            {shoes.length === 0 ? (
              <div className="py-12 text-center text-white/40 border border-dashed border-white/10 rounded-xl">
                No shoes pending approval.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shoes.map((shoe) => (
                  <div key={shoe.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="h-44 bg-white/5 relative">
                        <img src={shoe.images[0]?.imageUrl} alt={shoe.model} className="w-full h-full object-cover" />
                        <span className={`absolute top-2 right-2 px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                          shoe.approvalStatus === 'approved' ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'
                        }`}>
                          {shoe.approvalStatus === 'approved' ? 'Approved' : 'Pending'}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-bold text-sm text-white">{shoe.brand} - {shoe.model}</h3>
                        <p className="text-xs text-amber-400 font-bold">฿{shoe.rentalPricePerDay} / day • Deposit: ฿{shoe.depositAmount}</p>
                        <p className="text-[11px] text-white/60">Condition: {shoe.flawsDescription}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-[#111111] border-t border-white/10 flex items-center gap-2">
                      {shoe.approvalStatus === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleShoeApproval(shoe.id, 'approved')}
                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[10px] uppercase rounded-lg"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleShoeApproval(shoe.id, 'rejected')}
                            className="flex-1 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white font-extrabold text-[10px] uppercase rounded-lg"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-white/40 font-mono">Status: {shoe.approvalStatus}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DISPUTES */}
        {activeTab === 'disputes' && (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Security Deposit Arbitration Center
              </h2>
              <p className="text-xs text-white/50">Arbitrate damage claims between lenders and renters.</p>
            </div>

            {disputes.length === 0 ? (
              <div className="py-12 text-center text-white/40 border border-dashed border-white/10 rounded-xl">
                No active disputes currently.
              </div>
            ) : (
              <div className="space-y-6">
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="p-6 bg-[#0A0A0A] border border-rose-500/30 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-white/40">Dispute ID: {dispute.id}</span>
                        <h3 className="font-bold text-sm text-white">Claimed Amount: <strong className="text-rose-400">฿{dispute.claimedAmount}</strong></h3>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded ${
                        dispute.status === 'open' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-black'
                      }`}>
                        {dispute.status === 'open' ? 'Pending Judgment' : 'Resolved'}
                      </span>
                    </div>

                    <p className="text-xs text-white/80"><strong className="text-amber-400">Reason:</strong> {dispute.reason}</p>

                    {dispute.status === 'open' && (
                      <div className="p-4 bg-[#111111] border border-white/10 rounded-xl space-y-3">
                        <label className="block text-xs font-bold text-white">Admin Ruling Notes</label>
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Explain decision rationale..."
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-2 text-xs text-white h-16"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveDispute(dispute, 'released_to_lender')}
                            className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg"
                          >
                            Transfer Compensation to Lender
                          </button>
                          <button
                            onClick={() => handleResolveDispute(dispute, 'refunded_to_renter')}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg"
                          >
                            Full Refund to Renter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
