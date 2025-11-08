# Database Setup Guide

Bu loyihada real PostgreSQL database bilan ishlash uchun qo'llanma.

## 1. Neon Database Yaratish

1. **Neon Account ochish**: [console.neon.tech](https://console.neon.tech/) ga o'ting
2. **Yangi project yaratish**: "New Project" tugmasini bosing
3. **Database nomini kiriting**: masalan, `toshkent-sartarosh`
4. **Connection String olish**: Dashboard'dan connection string'ni nusxalang

Connection string quyidagi formatda bo'ladi:
```
postgresql://username:password@host/database?sslmode=require
```

## 2. Environment Variables O'rnatish

### Local Development uchun:

1. **`.env` fayl yarating** loyiha root papkasida:
```bash
cp .env.example .env
```

2. **`.env` faylni to'ldiring**:
```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
TELEGRAM_BOT_TOKEN=your_bot_token_here
NODE_ENV=development
```

### Production (Railway/Render) uchun:

Environment variables'ni hosting platformasida o'rnating:
- `DATABASE_URL`: Database connection string
- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `NODE_ENV`: production

## 3. Database Migration va Seeding

### Avtomatik (Server start qilganda):

Server ishga tushganda avtomatik ravishda:
1. ✅ Database tables yaratiladi
2. ✅ Admin user (ID: 5928372261) yaratiladi
3. ✅ Demo barbershops va reviews qo'shiladi (agar database bo'sh bo'lsa)

### Manual (Qo'lda):

```bash
# 1. Database tables yaratish
npm run db:migrate

# 2. Demo data qo'shish
npm run db:seed
```

## 4. Server Ishga Tushirish

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

## 5. Database Tekshirish

Server ishga tushganda konsolda quyidagi xabarlarni ko'rasiz:

```
🚀 Starting server...
📦 Running database migrations...
✅ Database tables created/verified
✅ Admin user created (ID: 5928372261)
📦 Attempting to connect to database...
✅ Connected to PostgreSQL database!
```

Agar bu xabarlar ko'rinmasa, DATABASE_URL to'g'ri o'rnatilganligini tekshiring.

## 6. Admin Panel Access

Admin panel'ga kirish uchun:
1. Telegram ID `5928372261` bilan kirish
2. BottomNav'da "Admin" tab ko'rinadi
3. Profile sahifasida "Admin Panel" tugmasi mavjud
4. Browser'da `/admin` yo'liga o'tish mumkin

## Troubleshooting

### "DATABASE_URL not set" xatosi:
- `.env` faylini yaratganingizni tekshiring
- `DATABASE_URL` to'g'ri formatda ekanligini tekshiring

### "Connection timeout" xatosi:
- Internet aloqangizni tekshiring
- Neon database'ingiz active ekanligini tekshiring
- Firewall/VPN muammolari yo'qligini tekshiring

### Memory Storage ishlatyapti:
- Agar DATABASE_URL o'rnatilmagan bo'lsa, loyiha avtomatik ravishda in-memory storage'ga o'tadi
- Bu faqat development/test uchun, production'da real database kerak

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  barbershop_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Barbershops
CREATE TABLE barbershops (
  id VARCHAR PRIMARY KEY,
  name TEXT NOT NULL,
  rating REAL NOT NULL DEFAULT 0,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  services TEXT[] NOT NULL,
  images TEXT[] NOT NULL,
  review_count INTEGER NOT NULL DEFAULT 0,
  owner_id VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id VARCHAR PRIMARY KEY,
  barbershop_id VARCHAR NOT NULL REFERENCES barbershops(id),
  author TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id VARCHAR PRIMARY KEY,
  barbershop_id VARCHAR NOT NULL REFERENCES barbershops(id),
  customer_name TEXT NOT NULL,
  service TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```
