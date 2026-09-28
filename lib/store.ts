"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, BirthProfile, Language, Astrologer, Booking, ChatRoom, Message, WalletTransaction, Notification, Question } from './types';
import { astrologers as seedAstrologers, bookings as seedBookings, walletTransactions, notifications as seedNotifications, sampleQuestions } from './seedData';
import { generateId } from './utils';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  lowDataMode: boolean;
  setLowDataMode: (v: boolean) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
  birthProfiles: BirthProfile[];
  addBirthProfile: (p: BirthProfile) => void;
  updateBirthProfile: (id: string, p: Partial<BirthProfile>) => void;
  deleteBirthProfile: (id: string) => void;
  activeBirthProfileId: string | null;
  setActiveBirthProfileId: (id: string) => void;
  astrologers: Astrologer[];
  favorites: string[];
  toggleFavorite: (id: string) => void;
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  chatRooms: ChatRoom[];
  addMessage: (roomId: string, msg: Message) => void;
  createChatRoom: (astrologerId: string, bookingId?: string, initialBalanceSec?: number) => string;
  walletBalance: number;
  transactions: WalletTransaction[];
  addMoney: (amount: number, method: string) => void;
  deductMoney: (amount: number, desc: string) => boolean;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  questions: Question[];
  addQuestion: (q: Question) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const defaultUser: User = {
  id: "user-1",
  name: "Arjun Kumar",
  email: "arjun@example.com",
  phone: "+91 9876543210",
  avatar: "https://i.pravatar.cc/150?img=5",
  role: "user",
  walletBalance: 850,
  birthProfiles: [],
  createdAt: new Date().toISOString(),
  language: "en"
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
      lowDataMode: false,
      setLowDataMode: (lowDataMode) => set({ lowDataMode }),
      user: defaultUser,
      setUser: (user) => set({ user }),
      isAuthenticated: true,
      login: (email, name) => {
        const newUser: User = {
          id: generateId(),
          name,
          email,
          phone: "",
          role: "user",
          walletBalance: 500,
          birthProfiles: [],
          createdAt: new Date().toISOString(),
          language: get().language,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random()*70)}`
        };
        set({ user: newUser, isAuthenticated: true, walletBalance: 500 });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      birthProfiles: [
        { id: "bp-1", label: "My Chart", fullName: "Arjun Kumar", dob: "1995-06-15", tob: "08:30", birthPlace: "Bangalore, Karnataka", gender: "male", lat: 12.9716, lng: 77.5946 }
      ],
      addBirthProfile: (p) => set(state => ({ birthProfiles: [...state.birthProfiles, p] })),
      updateBirthProfile: (id, patch) => set(state => ({ birthProfiles: state.birthProfiles.map(b => b.id === id ? { ...b, ...patch } : b) })),
      deleteBirthProfile: (id) => set(state => ({ birthProfiles: state.birthProfiles.filter(b => b.id !== id) })),
      activeBirthProfileId: "bp-1",
      setActiveBirthProfileId: (id) => set({ activeBirthProfileId: id }),
      astrologers: seedAstrologers,
      favorites: ["astro-1","astro-5"],
      toggleFavorite: (id) => set(state => ({
        favorites: state.favorites.includes(id) ? state.favorites.filter(f => f !== id) : [...state.favorites, id]
      })),
      bookings: seedBookings,
      addBooking: (b) => set(state => ({ bookings: [b, ...state.bookings] })),
      updateBookingStatus: (id, status) => set(state => ({ bookings: state.bookings.map(b => b.id === id ? { ...b, status } : b) })),
      chatRooms: [
        {
          id: "chat-1",
          userId: "user-1",
          astrologerId: "astro-1",
          messages: [
            { id: "m1", chatRoomId: "chat-1", senderId: "user-1", senderName: "Arjun", content: "Hello Guruji, I wanted to ask about my career.", type: "text", timestamp: new Date(Date.now()-1000*60*20).toISOString(), read: true },
            { id: "m2", chatRoomId: "chat-1", senderId: "astro-1", senderName: "Rahul Sharma", content: "Namaste Arjun! I can see Saturn is transiting your 10th house. Good time for hard work. What specifically concerns you?", type: "text", timestamp: new Date(Date.now()-1000*60*18).toISOString(), read: true },
            { id: "m3", chatRoomId: "chat-1", senderId: "user-1", senderName: "Arjun", content: "Will I get promotion this year?", type: "text", timestamp: new Date(Date.now()-1000*60*15).toISOString(), read: true },
            { id: "m4", chatRoomId: "chat-1", senderId: "astro-1", senderName: "Rahul Sharma", content: "Your Jupiter Dasha is favorable until December. Promotion likely between Aug-Oct. Wear yellow sapphire and chant Guru mantra.", type: "text", timestamp: new Date(Date.now()-1000*60*10).toISOString(), read: true }
          ],
          balanceSeconds: 345,
          isActive: true,
          createdAt: new Date(Date.now()-1000*60*30).toISOString()
        }
      ],
      addMessage: (roomId, msg) => set(state => ({
        chatRooms: state.chatRooms.map(r => r.id === roomId ? { ...r, messages: [...r.messages, msg] } : r)
      })),
      createChatRoom: (astrologerId, bookingId, initialBalanceSec = 600) => {
        const id = generateId();
        const room: ChatRoom = {
          id,
          userId: get().user?.id || "user-1",
          astrologerId,
          bookingId,
          messages: [{ id: generateId(), chatRoomId: id, senderId: "system", senderName: "System", content: `Consultation started. Balance: ${Math.floor(initialBalanceSec/60)} mins`, type: "system", timestamp: new Date().toISOString(), read: true }],
          balanceSeconds: initialBalanceSec,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        set(state => ({ chatRooms: [room, ...state.chatRooms] }));
        return id;
      },
      walletBalance: 850,
      transactions: walletTransactions,
      addMoney: (amount, method) => {
        const txn: WalletTransaction = {
          id: generateId(),
          userId: get().user?.id || "user-1",
          type: "credit",
          amount,
          description: `Added via ${method}`,
          method: method as any,
          createdAt: new Date().toISOString(),
          status: "success"
        };
        set(state => ({ walletBalance: state.walletBalance + amount, transactions: [txn, ...state.transactions] }));
      },
      deductMoney: (amount, desc) => {
        const { walletBalance } = get();
        if (walletBalance < amount) return false;
        const txn: WalletTransaction = {
          id: generateId(),
          userId: get().user?.id || "user-1",
          type: "debit",
          amount,
          description: desc,
          createdAt: new Date().toISOString(),
          status: "success"
        };
        set(state => ({ walletBalance: state.walletBalance - amount, transactions: [txn, ...state.transactions] }));
        return true;
      },
      notifications: seedNotifications,
      markNotificationRead: (id) => set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
      markAllNotificationsRead: () => set(state => ({ notifications: state.notifications.map(n => ({ ...n, read: true })) })),
      questions: sampleQuestions,
      addQuestion: (q) => set(state => ({ questions: [q, ...state.questions] })),
      searchQuery: "",
      setSearchQuery: (searchQuery) => set({ searchQuery })
    }),
    {
      name: "astroconnect-storage",
      partialize: (state) => ({
        language: state.language,
        lowDataMode: state.lowDataMode,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        birthProfiles: state.birthProfiles,
        activeBirthProfileId: state.activeBirthProfileId,
        favorites: state.favorites,
        bookings: state.bookings,
        chatRooms: state.chatRooms,
        walletBalance: state.walletBalance,
        transactions: state.transactions,
        notifications: state.notifications,
        questions: state.questions
      })
    }
  )
);
