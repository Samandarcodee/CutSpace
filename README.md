# Sartaroshxona - Toshkent Mini App

Toshkent shahridagi sartaroshxonalarga online yozilish tizimi. Telegram Mini App sifatida ishlaydigan to'liq ishlaydigan demo loyiha.

## Xususiyatlar

### Mijoz funksiyalari
- 🏪 3 ta sartaroshxona ro'yxati (demo ma'lumotlar)
- ⭐ Reyting va sharhlar ko'rish
- ✍️ Sharh qoldirish (yulduz reytingi + matn)
- 📅 Online yozilish (sana/vaqt tanlash)
- 📱 Yozilishlar tarixini ko'rish

### Sartarosh paneli
- 📋 Yozilgan mijozlarni ko'rish
- ✅ Yozilishlarni qabul qilish
- ❌ Yozilishlarni rad etish
- 📊 Status boshqaruvi (Kutilmoqda/Qabul/Rad)

### Telegram integratsiyasi
- 🔔 Har bir yangi yozilishda Telegram orqali xabar yuborish
- 🤖 Bot token: `8555285589:AAEEaVbjFtXCRa54_VSxLIhTx6Pqy5f9bZc`

## Texnologiyalar

**Frontend:**
- React 18 (Vite)
- TypeScript
- Tailwind CSS
- Shadcn UI
- TanStack Query
- Wouter (routing)

**Backend:**
- Node.js
- Express
- TypeScript
- In-memory storage (demo)
- node-telegram-bot-api

## Loyihani ishga tushirish

### 1. Replit da avtomatik ishga tushish
Replit da "Run" tugmasini bosing. Loyiha avtomatik ravishda ishga tushadi.

### 2. Mahalliy kompyuterda ishga tushirish

```bash
# Paketlarni o'rnatish
npm install

# Loyihani ishga tushirish (development mode)
npm run dev
```

Server `http://localhost:5000` da ishga tushadi.

### 3. Telegram xabarnomalarini sozlash (ixtiyoriy)

Telegram xabarnomalarini olish uchun:

1. Telegram botingizdan chat ID ni oling
2. Environment variablega qo'shing:

```bash
export TELEGRAM_CHAT_ID="your_chat_id"
```

Agar CHAT_ID o'rnatilmagan bo'lsa, xabarnomalar console ga yoziladi.

## API Endpoints

### Sartaroshxonalar
- `GET /api/barbershops` - Barcha sartaroshxonalar ro'yxati
- `GET /api/barbershops/:id` - Bitta sartaroshxona ma'lumotlari
- `GET /api/barbershops/:id/reviews` - Sartaroshxona sharhlari

### Sharhlar
- `POST /api/reviews` - Yangi sharh qo'shish

### Yozilishlar
- `GET /api/bookings` - Barcha yozilishlar
- `POST /api/bookings` - Yangi yozilish yaratish (Telegram xabar yuboradi)
- `POST /api/bookings/:id/accept` - Yozilishni qabul qilish
- `POST /api/bookings/:id/reject` - Yozilishni rad etish

## Loyiha tuzilishi

```
.
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # UI komponentlar
│   │   ├── pages/        # Sahifalar
│   │   └── lib/          # Yordamchi funksiyalar
│   └── index.html
├── server/                # Backend (Express)
│   ├── routes.ts         # API routes
│   ├── storage.ts        # In-memory storage
│   └── telegram.ts       # Telegram bot
├── shared/               # Umumiy typlar va schema
│   └── schema.ts
└── README.md
```

## Demo ma'lumotlar

Loyihada 3 ta sartaroshxona, har birida:
- 2 ta rasm
- 3 ta sharh
- 2-3 ta xizmat (Soch olish, Soqol qirish, Styling)

## Telegram Mini App sifatida ishlatish

1. Telegram Web App SDK allaqachon `index.html` ga qo'shilgan
2. Botingizni Telegram da yarating (@BotFather orqali)
3. Mini App URL ni sozlang
4. Replit URL ini bot sozlamalariga qo'shing

## Muhim eslatmalar

- Bu **demo loyiha**, real production uchun PostgreSQL yoki boshqa database kerak
- Telegram bot token ochiq ko'rsatilgan, real loyihada environment variable sifatida saqlang
- In-memory storage ishlatilgan, server restart qilinsa ma'lumotlar yo'qoladi

## Muallif

Telegram Mini App demo - Toshkent sartaroshxonalari uchun

## Litsenziya

MIT
