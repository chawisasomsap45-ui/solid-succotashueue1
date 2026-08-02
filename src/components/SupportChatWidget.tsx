import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, SupportTicket, SupportMessage } from '../types';
import { 
  createSupportTicketInDb, 
  getUserSupportTicketsFromDb, 
  getSupportMessagesInDb, 
  sendSupportMessageInDb 
} from '../lib/firebase';
import { MessageSquare, Send, X, PlusCircle, AlertCircle, Clock, CheckCircle2, Headphones, ChevronRight, User } from 'lucide-react';

interface SupportChatWidgetProps {
  userProfile: UserProfile | null;
  openAuthModal?: () => void;
}

export const SupportChatWidget: React.FC<SupportChatWidgetProps> = ({ userProfile, openAuthModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'tickets_list' | 'new_ticket' | 'chat'>('tickets_list');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(false);

  // New ticket form
  const [category, setCategory] = useState<'rental' | 'payment' | 'deposit' | 'shoe_condition' | 'general'>('general');
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load user tickets when opened
  const loadTickets = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const userTickets = await getUserSupportTicketsFromDb(userProfile.uid);
      setTickets(userTickets);
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userProfile) {
      loadTickets();
    }
  }, [isOpen, userProfile?.uid]);

  // Load messages for selected ticket
  const loadMessages = async (ticketId: string) => {
    try {
      const msgs = await getSupportMessagesInDb(ticketId);
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  // Auto poll messages when viewing chat
  useEffect(() => {
    let interval: any = null;
    if (activeView === 'chat' && selectedTicket) {
      loadMessages(selectedTicket.id);
      interval = setInterval(() => {
        loadMessages(selectedTicket.id);
      }, 4000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeView, selectedTicket?.id]);

  useEffect(() => {
    if (activeView === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeView]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      if (openAuthModal) openAuthModal();
      return;
    }
    if (!subject.trim() || !initialMessage.trim()) {
      alert('Please fill out both subject and problem details.');
      return;
    }

    setLoading(true);
    try {
      const ticketId = await createSupportTicketInDb({
        userId: userProfile.uid,
        userName: userProfile.fullName || 'Rent & Slay Customer',
        userEmail: userProfile.email || 'customer@rentandslay.com',
        subject: subject.trim(),
        category,
        status: 'open',
        lastMessage: initialMessage.trim(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, initialMessage.trim());

      setSubject('');
      setInitialMessage('');
      await loadTickets();

      const createdTicket: SupportTicket = {
        id: ticketId,
        userId: userProfile.uid,
        userName: userProfile.fullName || 'Rent & Slay Customer',
        userEmail: userProfile.email,
        subject,
        category,
        status: 'open',
        lastMessage: initialMessage,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      setSelectedTicket(createdTicket);
      setActiveView('chat');
    } catch (err) {
      console.error('Create ticket error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !selectedTicket || !newMessageText.trim()) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');

    try {
      await sendSupportMessageInDb(
        selectedTicket.id,
        userProfile.uid,
        userProfile.fullName || 'Customer',
        userProfile.email,
        false,
        textToSend
      );
      await loadMessages(selectedTicket.id);
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'rental': return 'Rental Issue';
      case 'payment': return 'Payment / Billing';
      case 'deposit': return 'Security Deposit';
      case 'shoe_condition': return 'Shoe Condition / Damage';
      default: return 'General Inquiry';
    }
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 border border-amber-300/40"
      >
        <Headphones className="w-5 h-5 animate-pulse" />
        <span>Report Issue / Chat with Admin</span>
        {tickets.filter(t => t.status === 'open').length > 0 && (
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
        )}
      </button>

      {/* CHAT DRAWER / WINDOW */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[550px] max-h-[80vh] bg-[#111111] border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom-5">
          
          {/* HEADER */}
          <div className="p-4 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  24/7 Admin Support Center
                </h3>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Support agent standby to assist you
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!userProfile ? (
            <div className="p-8 text-center space-y-4 my-auto">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Please Log In to Submit a Ticket</h4>
              <p className="text-xs text-white/60">You must be logged in so our admin team can track and respond to your support request.</p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (openAuthModal) openAuthModal();
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg"
              >
                Log In / Register
              </button>
            </div>
          ) : (
            <>
              {/* SUB-HEADER NAVIGATION */}
              <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between text-xs">
                {activeView !== 'tickets_list' ? (
                  <button
                    onClick={() => setActiveView('tickets_list')}
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    ← All Support Tickets
                  </button>
                ) : (
                  <span className="text-white/60 text-[11px] font-bold">Your Support Tickets</span>
                )}

                {activeView === 'tickets_list' && (
                  <button
                    onClick={() => setActiveView('new_ticket')}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] uppercase rounded-lg flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Create New Ticket
                  </button>
                )}
              </div>

              {/* VIEW 1: TICKETS LIST */}
              {activeView === 'tickets_list' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loading ? (
                    <div className="text-center py-12 text-white/40 text-xs">Loading support tickets...</div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center py-12 space-y-3 border border-dashed border-white/10 rounded-xl p-6">
                      <MessageSquare className="w-10 h-10 text-white/20 mx-auto" />
                      <p className="text-xs text-white/60">You have no active support tickets</p>
                      <button
                        onClick={() => setActiveView('new_ticket')}
                        className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black font-bold text-xs rounded-xl"
                      >
                        Message Admin Now
                      </button>
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setActiveView('chat');
                        }}
                        className="p-3.5 bg-[#0A0A0A] border border-white/10 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[9px] font-bold uppercase rounded">
                            {getCategoryLabel(ticket.category)}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                            ticket.status === 'open' 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                              : ticket.status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {ticket.status === 'open' ? 'Awaiting Admin' : ticket.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                          {ticket.subject}
                        </h4>
                        <p className="text-[11px] text-white/50 line-clamp-1">{ticket.lastMessage}</p>

                        <div className="flex items-center justify-between text-[10px] text-white/30 pt-1 border-t border-white/5">
                          <span>{new Date(ticket.updatedAt).toLocaleDateString('en-US')}</span>
                          <span className="flex items-center gap-1 text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                            Open Chat <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* VIEW 2: NEW TICKET FORM */}
              {activeView === 'new_ticket' && (
                <form onSubmit={handleCreateTicket} className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">Issue Category / Topic</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="rental">Rental Issues / Return Dates</option>
                      <option value="payment">Payment & Billing</option>
                      <option value="deposit">Security Deposit Holds</option>
                      <option value="shoe_condition">Shoe Condition / Damage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Deposit release inquiry for Travis Scott AJ1"
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">Problem Details for Admin</label>
                    <textarea
                      value={initialMessage}
                      onChange={(e) => setInitialMessage(e.target.value)}
                      placeholder="Describe your issue or what assistance you need from our team..."
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-2.5 text-xs text-white h-28 focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Submitting to Admin...' : 'Send Message to Admin'}</span>
                  </button>
                </form>
              )}

              {/* VIEW 3: LIVE CHAT WINDOW */}
              {activeView === 'chat' && selectedTicket && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* CHAT SUBJECT BAR */}
                  <div className="p-3 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-amber-400 font-bold uppercase">{getCategoryLabel(selectedTicket.category)}</p>
                      <h4 className="font-bold text-xs text-white truncate max-w-[260px]">{selectedTicket.subject}</h4>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">ID: {selectedTicket.id.slice(0, 8)}</span>
                  </div>

                  {/* MESSAGES LIST */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0A0A0A]/50">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-xs text-white/40">No messages yet...</div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.isAdmin ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-center gap-1.5 text-[9px] text-white/40 mb-1">
                            {msg.isAdmin ? (
                              <span className="px-1.5 py-0.2 bg-amber-500 text-black font-extrabold uppercase rounded text-[8px]">
                                ADMIN SUPPORT
                              </span>
                            ) : (
                              <span>{msg.senderName}</span>
                            )}
                            <span>•</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-sans leading-relaxed ${
                            msg.isAdmin 
                              ? 'bg-[#1E1E1E] border border-amber-500/30 text-white rounded-tl-none' 
                              : 'bg-amber-500 text-black font-medium rounded-tr-none'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* INPUT BAR */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-[#0A0A0A] border-t border-white/10 flex items-center gap-2">
                    <input
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder="Type a message to admin..."
                      className="flex-1 bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newMessageText.trim()}
                      className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold rounded-xl transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

        </div>
      )}
    </>
  );
};
