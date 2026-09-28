# AstroConnect API Documentation

Base URL: `/api` (Next.js API Routes) or `https://api.astroconnect.com`

All endpoints return JSON: `{ success: boolean, data?: any, error?: string }`

## Authentication

### POST /api/auth/register
Body: { name, email, phone, password, dob, tob, birthplace, gender }
Returns: { token, refreshToken, user }

### POST /api/auth/login
Body: { email, password } OR { phone, otp }
Returns: { token, user }

### POST /api/auth/google
Body: { idToken }
Returns: { token, user }

### POST /api/auth/refresh
Body: { refreshToken }
Returns: { token }

## Users

### GET /api/users/me
Headers: Authorization Bearer token
Returns: user profile + birthProfiles

### PUT /api/users/me
Body: { name, avatar, language, lowDataMode }

## Birth Profiles

### GET /api/birth-profiles?userId
Returns: BirthProfile[]

### POST /api/birth-profiles
Body: { label, fullName, dob, tob, birthplace, gender, lat, lng }

### GET /api/birth-chart?profileId
Returns: calculated BirthChart (Sun/Moon/Ascendant/Nakshatra/Planets/Houses/Dasha)

## Astrologers

### GET /api/astrologers
Query: ?search=&price=low|mid|high&rating=4.5&language=Hindi&specialization=Vedic&online=true&type=chat&sort=rating
Returns: Astrologer[]

### GET /api/astrologers/:id
Returns: Astrologer + reviews

### GET /api/astrologers/:id/availability?date=YYYY-MM-DD
Returns: time slots

### POST /api/astrologers (admin only)
Body: astrologer data + documents

### PUT /api/astrologers/:id/verify (admin)
Body: { verified: boolean, reason }

## Bookings

### POST /api/bookings
Body: { astrologerId, type, date, time, duration, notes }
Returns: Booking + payment requirement

### GET /api/bookings?userId=&status=upcoming
Returns: Booking[]

### PUT /api/bookings/:id/status
Body: { status: confirmed|cancelled|completed }

### POST /api/bookings/:id/cancel
Body: { reason }

## Chat

### POST /api/chat/rooms
Body: { astrologerId, bookingId, initialBalanceSec }
Returns: ChatRoom

### GET /api/chat/rooms?userId=
Returns: ChatRoom[] with last message

### GET /api/chat/rooms/:id/messages
Returns: Message[]

### POST /api/chat/rooms/:id/messages
Body: { content, type: text|image|voice|file }
Real-time via Socket.IO: `chat:message`, `chat:typing`, `chat:read`

Socket.IO events:
- Client emits: `join_room`, `leave_room`, `typing`, `message`
- Server emits: `new_message`, `user_typing`, `balance_update`, `session_end`

## Calls

### POST /api/calls/initiate
Body: { bookingId, type: voice|video }
Returns: { callId, token (WebRTC), channel }

### POST /api/calls/:id/end
Body: { durationSeconds }

WebRTC flow: Use token to join channel, handle mute/speaker/camera via client SDK.

## Wallet & Payments

### GET /api/wallet?userId=
Returns: { balance, transactions }

### POST /api/wallet/add
Body: { amount, method: upi|card|netbanking|wallet }
Returns: { orderId (Razorpay), amount }

### POST /api/wallet/verify
Body: { razorpay_payment_id, razorpay_order_id, signature }
Returns: { success, newBalance }

### POST /api/payments/create-order
Body: { bookingId, amount, method }
Returns: Razorpay order

### POST /api/payments/webhook (Razorpay webhook)
Handles payment success/failure, updates booking status, wallet.

## Horoscope

### GET /api/horoscope?sign=Aries&period=daily&date=YYYY-MM-DD&lang=en
Returns: Horoscope

### GET /api/horoscope/all?period=daily
Returns: Record<sign, Horoscope>

## AI Chat

### POST /api/ai-chat
Body: { message, birthProfileId, language }
Returns: { reply, disclaimer }
Uses birth chart context if profileId provided.

### GET /api/ai-chat/history?userId=
Returns: messages

## Questions

### POST /api/questions
Body: { category, question, birthProfileId, astrologerId, price: 99 }
Returns: Question

### GET /api/questions?userId=
Returns: Question[] with answers

### POST /api/questions/:id/answer (astrologer)
Body: { answer }

## Articles

### GET /api/articles?category=&search=&page=&limit=
Returns: { articles, total }

### GET /api/articles/:id
Returns: Article + related

### POST /api/articles/:id/bookmark
### POST /api/articles/:id/share

## Reviews

### POST /api/reviews
Body: { astrologerId, bookingId, rating, comment }

### GET /api/reviews?astrologerId=
Returns: Review[]

### PUT /api/reviews/:id/moderate (admin)
Body: { flagged: boolean, reason }

## Notifications

### GET /api/notifications?userId=
Returns: Notification[]

### PUT /api/notifications/:id/read
### PUT /api/notifications/read-all

### POST /api/notifications/send (admin/system)
Body: { userId, title, message, type, actionUrl }

FCM integration: POST /api/notifications/fcm/send

## Favorites

### POST /api/favorites/toggle
Body: { astrologerId }

### GET /api/favorites?userId=
Returns: astrologerIds

## Admin

### GET /api/admin/stats
Returns: { totalUsers, totalAstrologers, totalBookings, revenue, pendingVerifications }

### GET /api/admin/users?search=&suspended=
### PUT /api/admin/users/:id/suspend

### GET /api/admin/astrologers?verified=
### PUT /api/admin/astrologers/:id/approve

### GET /api/admin/bookings?status=&date=
### PUT /api/admin/bookings/:id/refund

### GET /api/admin/payments?status=
### GET /api/admin/reports?type=revenue&period=monthly

### POST /api/admin/content/horoscope
Body: { sign, period, data }

### POST /api/admin/content/article
### POST /api/admin/promotions

## Search

### GET /api/search?q=love&limit=10
Returns: { astrologers, articles, zodiac, services } with autocomplete

## Security Notes

- All endpoints rate limited: 100 req / 15 min per IP (configurable)
- JWT Bearer auth for protected routes
- Role middleware: user, astrologer, admin
- Input validation via Zod
- No raw card storage, Razorpay tokenization
- HTTPS only in prod, CORS restricted
- Birth data PII: only owner + assigned astrologer can view full details

## Error Codes

- 400 Bad Request - validation
- 401 Unauthorized - missing/invalid token
- 403 Forbidden - role insufficient
- 404 Not Found
- 429 Too Many Requests
- 500 Internal Server Error

## Example cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"arjun@example.com","password":"pass123"}'

# Get astrologers
curl http://localhost:3000/api/astrologers?online=true&rating=4.8

# Create booking
curl -X POST http://localhost:3000/api/bookings -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"astrologerId":"astro-1","type":"chat","date":"2024-04-10","time":"10:00","duration":20}'
```
