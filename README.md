# 💈 Toshkent Sartarosh - Telegram Mini App

Modern sartaroshxonalar uchun onlayn band qilish va boshqaruv tizimi. Telegram Mini App sifatida ishlaydigan to'liq funksional loyiha.

## ✨ Xususiyatlar

### 👤 Mijoz Funksiyalari
- 🏪 Sartaroshxonalar ro'yxatini ko'rish
- ⭐ Reyting va sharhlarni o'qish
- ✍️ Sharh qoldirish (yulduz reytingi + matn)
- 📅 Online yozilish (sana va vaqt tanlash)
- 📱 O'z yozilishlaringizni kuzatish
- 📊 Status tekshirish (Kutilmoqda/Qabul/Rad/Bajarilgan)

### 👑 Admin Panel
- 📋 Barcha sartaroshxonalarni boshqarish
- ➕ Yangi sartaroshxona qo'shish
- ✏️ Sartaroshxona ma'lumotlarini tahrirlash
- 🗑️ Sartaroshxonalarni o'chirish
- 🖼️ Sartaroshxona rasmlarini fayl yoki URL orqali yuklash
- 👥 Foydalanuvchilar rollarini boshqarish

### ✂️ Sartarosh Paneli
- 📋 Yozilgan mijozlarni ko'rish
- ✅ Yozilishlarni qabul qilish
- ❌ Yozilishlarni rad etish
- 📊 Status boshqaruvi

### 🤖 Telegram Integratsiyasi
- 🔔 Yangi yozilishda avtomatik xabar
- 👤 Telegram orqali autentifikatsiya
- 🎨 Telegram tema bilan integratsiya

## 🛠️ Texnologiyalar

### Frontend
- ⚛️ React 18 + TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS
- 🧩 Shadcn UI
- 🔄 TanStack Query
- 🛣️ Wouter (routing)
- 📱 Telegram WebApp SDK

### Backend
- 🟢 Node.js + Express
- 📘 TypeScript
- 🐘 PostgreSQL (Neon Database)
- 🔄 Drizzle ORM
- 🤖 node-telegram-bot-api

## 🚀 Tezkor Ishga Tushirish

### 1️⃣ Loyihani Clone qilish

```bash
git clone <repository-url>
cd toshkent-sartarosh
npm install
```

### 2️⃣ Environment Variables sozlash

`.env` fayl yarating:

```bash
cp .env.example .env
```

`.env` faylni tahrirlang:

```env
# Database (Neon/PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Telegram Bot (@BotFather dan oling)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Environment
NODE_ENV=development
```

### 3️⃣ Database sozlash

#### Neon Database yaratish (Tavsiya etiladi - BEPUL):

1. 🌐 [console.neon.tech](https://console.neon.tech) ga o'ting
2. ➕ "New Project" yarating
3. 📋 Connection string ni `.env` fayliga qo'ying

#### Database setup:

```bash
# Avtomatik setup (tavsiya etiladi)
npm run db:setup

# Yoki qo'lda:
npm run db:migrate    # Jadvallar yaratish
npm run db:seed       # Demo data yuklash
npm run db:check      # Database tekshirish
```

### 4️⃣ Loyihani ishga tushirish

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Server `http://localhost:5000` da ishga tushadi! 🎉

> ℹ️ Admin panel orqali yuklangan rasmlar avtomatik ravishda loyiha ildizidagi `uploads/` papkasida saqlanadi va `https://host/uploads/<file>` ko'rinishida xizmat qiladi.

## 📊 Database Health Check

Database holatini tekshirish:

```bash
npm run db:check
```

Bu buyruq quyidagilarni tekshiradi:
- ✅ DATABASE_URL mavjudligi
- ✅ Database connection
- ✅ Jadvallar mavjudligi
- ✅ Ma'lumotlar soni
- ✅ Admin user mavjudligi

## 👑 Admin Panel

Admin panel'ga kirish:

1. **Telegram ID**: `5928372261` bilan kirish
2. **UI'da**: BottomNav'da "Admin" tab ko'rinadi
3. **URL**: `/admin` yo'lidan kirish mumkin

Admin funksiyalari:
- ➕ Yangi sartaroshxona qo'shish
- ✏️ Mavjud sartaroshxonalarni tahrirlash
- 🗑️ Sartaroshxonalarni o'chirish
- 📊 Barcha yozilishlarni ko'rish

## 🎯 Memory Storage vs Database

Loyiha ikkala rejimda ishlaydi:

### 🔵 Database Mode (Production)
- ✅ DATABASE_URL o'rnatilgan
- ✅ Ma'lumotlar doimiy saqlanadi
- ✅ Production uchun tavsiya etiladi

### 🟡 Memory Storage Mode (Development)
- ⚠️ DATABASE_URL o'rnatilmagan
- ⚠️ Server restart qilganda ma'lumotlar o'chadi
- ⚠️ Faqat development/test uchun

**Ishlatyotgan rejimni bilish:**

Server start qilganda console'da ko'rasiz:
```
✅ Connected to PostgreSQL database!        // Database mode
# yoki
📦 Using in-memory storage (demo mode)      // Memory mode
```

## 📁 Loyiha Tuzilishi

```
toshkent-sartarosh/
├── client/                    # Frontend
│   ├── src/
│   │   ├── components/       # React komponentlar
│   │   │   ├── ui/          # Shadcn UI komponentlar
│   │   │   └── ...          # Custom komponentlar
│   │   ├── pages/           # Sahifalar (Home, Bookings, Admin)
│   │   ├── contexts/        # React Context (Telegram)
│   │   └── lib/            # Utilities
│   └── index.html
│
├── server/                   # Backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── auth.ts             # Authentication middleware
│   ├── storage.ts          # Storage layer (Memory/DB)
│   ├── telegram.ts         # Telegram bot
│   ├── migrations.ts       # Database migrations
│   └── seed.ts             # Database seeding
│
├── shared/                  # Shared code
│   └── schema.ts           # Database schema + types
│
├── scripts/                 # Utility scripts
│   ├── check-database.ts   # Database health check
│   └── setup-database.sh   # Database setup script
│
├── .env.example            # Environment template
├── DATABASE_SETUP.md       # Database setup guide
└── README.md              # Siz bu faylni o'qiyapsiz!
```

## 🔌 API Endpoints

### 🔓 Public Endpoints

```
GET    /api/barbershops              # Barcha sartaroshxonalar
GET    /api/barbershops/:id          # Bitta sartaroshxona
GET    /api/barbershops/:id/reviews  # Sartaroshxona sharhlari
POST   /api/reviews                  # Sharh qo'shish
GET    /api/bookings                 # Barcha yozilishlar
POST   /api/bookings                 # Yangi yozilish
POST   /api/bookings/:id/accept      # Yozilishni qabul qilish
POST   /api/bookings/:id/reject      # Yozilishni rad etish
```

### 🔐 Auth Endpoints

```
POST   /api/auth/telegram            # Telegram login
GET    /api/auth/me                  # Current user
```

### 👑 Admin Endpoints

```
POST   /api/admin/barbershops        # Sartaroshxona qo'shish
PUT    /api/admin/barbershops/:id    # Sartaroshxonani tahrirlash
DELETE /api/admin/barbershops/:id    # Sartaroshxonani o'chirish
POST   /api/admin/uploads/image      # Rasm yuklash (multipart/form-data)
PUT    /api/admin/users/:id/role     # User role o'zgartirish
```

### ✂️ Barber Endpoints

```
GET    /api/barber/bookings          # Barber bookinglar
```

## 📱 Telegram Mini App Sozlash

### 1. Bot yaratish

```
1. Telegram'da @BotFather ga yozing
2. /newbot buyrug'ini yuboring
3. Bot nomini va username'ni kiriting
4. Bot token'ni saqlang
```

### 2. Mini App sozlash

```
1. @BotFather'da /mybots
2. Botingizni tanlang
3. "Menu Button" → "Configure menu button"
4. Web App URL'ni kiriting (masalan, Railway URL)
```

### 3. Production deploy

**Railway:**
```bash
# Environment Variables o'rnating:
DATABASE_URL=<your-database-url>
TELEGRAM_BOT_TOKEN=<your-bot-token>
NODE_ENV=production
```

**Render:**
`render.yaml` faylda allaqachon sozlangan.

## 🗄️ Database Schema

```sql
-- Users (Mijozlar, Sartaroshlar, Adminlar)
users (
  id, telegram_id, first_name, last_name,
  username, role, barbershop_id, created_at
)

-- Sartaroshxonalar
barbershops (
  id, name, rating, address, phone,
  services[], images[], review_count,
  owner_id, created_at
)

-- Sharhlar
reviews (
  id, barbershop_id, author, rating,
  comment, date, created_at
)

-- Yozilishlar
bookings (
  id, barbershop_id, customer_name,
  service, date, time, status, created_at
)
```

To'liq schema: [shared/schema.ts](./shared/schema.ts)

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Dev server'ni ishga tushirish
npm run dev:windows      # Windows uchun

# Build
npm run build            # Production build
npm run start            # Production server

# Database
npm run db:migrate       # Migration ishga tushirish
npm run db:seed          # Demo data yuklash
npm run db:check         # Database tekshirish
npm run db:setup         # To'liq database setup
npm run db:push          # Schema'ni push qilish (Drizzle)

# Other
npm run check            # TypeScript check
```

## 🐛 Troubleshooting

### Memory Storage ishlatyapti?

```bash
# Database URL tekshiring
npm run db:check

# .env faylini tekshiring
cat .env

# DATABASE_URL o'rnatilgan bo'lsa, server restart qiling
```

### Admin panel ko'rinmayapti?

1. ✅ Telegram ID to'g'ri ekanligini tekshiring: `5928372261`
2. ✅ Browser console'ni oching va loglarni ko'ring
3. ✅ `isAdmin: true` ekanligini tasdiqlang
4. ✅ Server loglarida admin role ko'rinishini tekshiring

### Database connection xatosi?

```bash
# Health check ishga tushiring
npm run db:check

# Network, firewall, VPN ni tekshiring
# Neon database active ekanligini tekshiring
```

## 📚 Qo'shimcha Dokumentatsiya

- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - To'liq database setup guide
- [SETUP.md](./SETUP.md) - Loyiha setup guide

## 📄 Litsenziya

MIT

## 👨‍💻 Muallif

Toshkent Sartarosh - Telegram Mini App Demo

---

**⚡ Tezkor yordam:**

```bash
# Hamma narsani noldan sozlash
npm install
cp .env.example .env
# .env ni tahrirlang
npm run db:setup
npm run dev
```

🎉 **Loyiha tayyor!** Endi `http://localhost:5000` da ishga tushdi!
