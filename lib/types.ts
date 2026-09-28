export type Language = 'en' | 'hi' | 'kn';
export type UserRole = 'user' | 'astrologer' | 'admin';
export type ConsultationType = 'chat' | 'voice' | 'video';
export type BookingStatus = 'pending' | 'confirmed' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';
export type QuestionCategory = 'love' | 'marriage' | 'career' | 'business' | 'education' | 'finance' | 'family' | 'general';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  walletBalance: number;
  birthProfiles: BirthProfile[];
  createdAt: string;
  language: Language;
}

export interface BirthProfile {
  id: string;
  label: string; // My Chart, Partner, etc
  fullName: string;
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM
  birthPlace: string;
  gender: 'male' | 'female' | 'other';
  lat?: number;
  lng?: number;
}

export interface BirthChart {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  nakshatra: string;
  planets: PlanetPosition[];
  houses: House[];
  dasha: DashaInfo;
  kundliData: any;
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  house: number;
  degree: number;
  nakshatra: string;
  isRetrograde: boolean;
  description: string;
}

export interface House {
  house: number;
  sign: string;
  lord: string;
  description: string;
}

export interface DashaInfo {
  currentDasha: string;
  currentAntardasha: string;
  mahadashaEnd: string;
  nextDasha: string;
}

export interface Astrologer {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  experience: number;
  languages: string[];
  specializations: string[];
  rating: number;
  reviewCount: number;
  consultationCount: number;
  pricePerMinute: number;
  bio: string;
  available: boolean;
  chatAvailable: boolean;
  callAvailable: boolean;
  videoAvailable: boolean;
  availableHours: string;
  certifications: string[];
  isOnline: boolean;
  tags: string[];
}

export interface Booking {
  id: string;
  userId: string;
  astrologerId: string;
  astrologerName: string;
  astrologerAvatar: string;
  type: ConsultationType;
  date: string;
  time: string;
  duration: number; // minutes
  price: number;
  status: BookingStatus;
  createdAt: string;
  notes?: string;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'file' | 'system';
  timestamp: string;
  read: boolean;
  imageUrl?: string;
}

export interface ChatRoom {
  id: string;
  userId: string;
  astrologerId: string;
  bookingId?: string;
  messages: Message[];
  balanceSeconds: number; // remaining seconds
  isActive: boolean;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  method?: PaymentMethod;
  createdAt: string;
  status: 'success' | 'pending' | 'failed';
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  astrologerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

export interface Horoscope {
  sign: string;
  date: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  love: string;
  career: string;
  money: string;
  health: string;
  family: string;
  luckyNumber: number;
  luckyColor: string;
  advice: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  readTime: number;
  createdAt: string;
  views: number;
  bookmarked?: boolean;
}

export interface Question {
  id: string;
  userId: string;
  category: QuestionCategory;
  question: string;
  birthProfileId?: string;
  astrologerId?: string;
  answer?: string;
  status: 'pending' | 'answered' | 'closed';
  price: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'horoscope' | 'chat' | 'system' | 'offer';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
