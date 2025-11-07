# Real Database bilan Loyihani Ishga Tushirish

## 1-qadam: Neon Database yaratish

### Neon.tech saytida:

1. [https://neon.tech](https://neon.tech) ga o'ting
2. **Sign Up** yoki **Log In** qiling
3. **New Project** tugmasini bosing
4. Project nomini kiriting: `toshkent-sartarosh`
5. Region tanlang: **AWS - Frankfurt (eu-central-1)** (Toshkentga eng yaqin)
6. **Create Project** bosing

### Connection String ni olish:

1. Yangi yaratilgan projectni oching
2. **Dashboard** bo'limida **Connection Details** ni toping
3. **Connection string** ni nusxalang
4. Format: `postgresql://username:password@host/dbname`

## 2-qadam: Environment Variables sozlash

### Windows PowerShell uchun:

```powershell
# Loyiha papkasida .env fayl yarating
New-Item -Path .env -ItemType File

# Quyidagi ma'lumotlarni .env faylga kiriting (Notepad yoki VS Code da):
```

### .env fayl tarkibi:

```env
# Neon database connection string (yuqorida nusxalagan)
DATABASE_URL=postgresql://your_username:your_password@your_host/your_database

# Telegram Bot
TELEGRAM_BOT_TOKEN=8555285589:AAEEaVbjFtXCRa54_VSxLIhTx6Pqy5f9bZc
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Server
PORT=5000
NODE_ENV=development
```

**Eslatma:** `DATABASE_URL` ni o'zingizning Neon connection string bilan almashtiring!

## 3-qadam: Database Schema yaratish

```powershell
# Database jadvallarini yaratish
npm run db:push
```

Bu buyruq:
- `barbershops` jadvalini yaratadi
- `reviews` jadvalini yaratadi
- `bookings` jadvalini yaratadi

## 4-qadam: Boshlang'ich ma'lumotlarni yuklash

```powershell
# 3 ta sartaroshxona va sharhlarni database ga yuklash
npm run db:seed
```

Bu buyruq:
- 3 ta sartaroshxona qo'shadi (Premium Barber Shop, Classic Barber, Modern Style Barber)
- Har bir sartaroshxonaga 3 tadan sharh qo'shadi

## 5-qadam: Loyihani ishga tushirish

```powershell
# Development server ni ishga tushirish
npm run dev
```

Server `http://localhost:5000` da ishga tushadi! 🚀

---

## Muammo yuzaga kelsa:

### 1. "DATABASE_URL is not set" xatosi
- `.env` fayl yaratilganini tekshiring
- `.env` faylda `DATABASE_URL` to'g'ri kiritilganini tekshiring
- Server ni qayta ishga tushiring

### 2. "Cannot connect to database" xatosi
- Neon database projecti faolligini tekshiring
- Connection string to'g'riligini tekshiring
- Internet aloqangizni tekshiring

### 3. "Table already exists" xatosi
- Database tozalab, qaytadan yaratish uchun:
```powershell
# Drizzle Studio ni ochish (browser da database ni ko'rish)
npx drizzle-kit studio
```

---

## Keyingi qadamlar:

- ✅ Database ishlayapti
- ✅ Ma'lumotlar saqlanyapti
- ✅ Server ishga tushdi

### Admin panel uchun:
- Bookings sahifasiga o'ting: `http://localhost:5000`
- "Bookings" tab ni oching
- Bu yerda barcha yozilishlarni ko'rishingiz va boshqarishingiz mumkin

### Telegram xabarnomalar:
- Telegram botingizdan chat ID ni oling: `/getUpdates` API orqali
- `.env` faylda `TELEGRAM_CHAT_ID` ni o'zgartiring
- Server ni qayta ishga tushiring

Omad! 🎉

