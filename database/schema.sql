-- AstroConnect - PostgreSQL Schema
-- Production-ready, indexed, with status fields, timestamps
-- Compatible with low-end SQLite fallback (remove ENUM for SQLite)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','astrologer','admin')),
  wallet_balance INTEGER DEFAULT 500,
  language VARCHAR(5) DEFAULT 'en',
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Astrologers (extends user concept, but separate for marketplace)
CREATE TABLE astrologers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  experience INTEGER NOT NULL,
  languages TEXT[] NOT NULL,
  specializations TEXT[] NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  consultation_count INTEGER DEFAULT 0,
  price_per_minute INTEGER NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  available BOOLEAN DEFAULT TRUE,
  chat_available BOOLEAN DEFAULT TRUE,
  call_available BOOLEAN DEFAULT TRUE,
  video_available BOOLEAN DEFAULT TRUE,
  available_hours VARCHAR(50),
  certifications TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_astrologers_verified ON astrologers(verified);
CREATE INDEX idx_astrologers_online ON astrologers(is_online);
CREATE INDEX idx_astrologers_rating ON astrologers(rating DESC);
CREATE INDEX idx_astrologers_price ON astrologers(price_per_minute);

-- Astrologer Documents (ID, certificates)
CREATE TABLE astrologer_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  astrologer_id UUID REFERENCES astrologers(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Birth Profiles
CREATE TABLE birth_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  tob TIME NOT NULL,
  birthplace VARCHAR(255) NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('male','female','other')),
  lat DECIMAL(10,6),
  lng DECIMAL(10,6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_birth_profiles_user ON birth_profiles(user_id);

-- Birth Charts (calculated)
CREATE TABLE birth_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  birth_profile_id UUID REFERENCES birth_profiles(id) ON DELETE CASCADE,
  sun_sign VARCHAR(20),
  moon_sign VARCHAR(20),
  ascendant VARCHAR(20),
  nakshatra VARCHAR(50),
  planets JSONB,
  houses JSONB,
  dasha JSONB,
  kundli_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zodiac Signs
CREATE TABLE zodiac_signs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL,
  symbol VARCHAR(10),
  element VARCHAR(10),
  lord VARCHAR(20),
  date_range VARCHAR(50),
  description TEXT
);

-- Availability
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  astrologer_id UUID REFERENCES astrologers(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  astrologer_id UUID REFERENCES astrologers(id) ON DELETE CASCADE,
  type VARCHAR(10) CHECK (type IN ('chat','voice','video')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL CHECK (duration IN (10,20,30,45,60)),
  price INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','upcoming','in_progress','completed','cancelled','refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_astrologer ON bookings(astrologer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(date);

-- Chat Rooms
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  astrologer_id UUID REFERENCES astrologers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  balance_seconds INTEGER DEFAULT 600,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text','image','voice','file','system')),
  image_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_room ON messages(chat_room_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Calls
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE SET NULL,
  type VARCHAR(10) CHECK (type IN ('voice','video')),
  status VARCHAR(20) DEFAULT 'initiated',
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  method VARCHAR(20) CHECK (method IN ('upi','card','netbanking','wallet')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','success','failed','refunded')),
  gateway VARCHAR(20) DEFAULT 'razorpay',
  gateway_payment_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets (logical, balance in users table, transactions tracked)
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) CHECK (type IN ('credit','debit')),
  amount INTEGER NOT NULL,
  description TEXT,
  method VARCHAR(20),
  status VARCHAR(20) DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_wallet_user ON wallet_transactions(user_id);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  astrologer_id UUID REFERENCES astrologers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  verified BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reviews_astrologer ON reviews(astrologer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(20) CHECK (category IN ('love','marriage','career','business','education','finance','family','general')),
  question TEXT NOT NULL,
  birth_profile_id UUID REFERENCES birth_profiles(id) ON DELETE SET NULL,
  astrologer_id UUID REFERENCES astrologers(id) ON DELETE SET NULL,
  price INTEGER DEFAULT 99,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','answered','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  astrologer_id UUID REFERENCES astrologers(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('booking','payment','horoscope','chat','system','offer')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category VARCHAR(50),
  author VARCHAR(100),
  image_url TEXT,
  read_time INTEGER,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_articles_category ON articles(category);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  astrologer_id UUID REFERENCES astrologers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, astrologer_id)
);

-- Promotions / Offers
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage','fixed')),
  discount_value INTEGER NOT NULL,
  description TEXT,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawals
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  astrologer_id UUID REFERENCES astrologers(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method VARCHAR(20),
  account_details JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports (aggregated)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) CHECK (type IN ('revenue','users','astrologers','bookings','ratings')),
  data JSONB,
  period VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed zodiac
INSERT INTO zodiac_signs (name, symbol, element, lord, date_range) VALUES
('Aries','♈','Fire','Mars','Mar 21 - Apr 19'),
('Taurus','♉','Earth','Venus','Apr 20 - May 20'),
('Gemini','♊','Air','Mercury','May 21 - Jun 20'),
('Cancer','♋','Water','Moon','Jun 21 - Jul 22'),
('Leo','♌','Fire','Sun','Jul 23 - Aug 22'),
('Virgo','♍','Earth','Mercury','Aug 23 - Sep 22'),
('Libra','♎','Air','Venus','Sep 23 - Oct 22'),
('Scorpio','♏','Water','Mars','Oct 23 - Nov 21'),
('Sagittarius','♐','Fire','Jupiter','Nov 22 - Dec 21'),
('Capricorn','♑','Earth','Saturn','Dec 22 - Jan 19'),
('Aquarius','♒','Air','Saturn','Jan 20 - Feb 18'),
('Pisces','♓','Water','Jupiter','Feb 19 - Mar 20');
