# 💈 CutSpace - Telegram Mini App

**Toshkent shahri uchun sartaroshxona band qilish tizimi**

To'liq ishlaydigan Telegram Mini App demo loyihasi. O'zbek tilida, zamonaviy UI/UX bilan.

---

## 🚀 Xususiyatlar

### 👥 Mijoz (Client)
- ✅ Sartaroshlar ro'yxatini ko'rish
- ⭐️ Reyting va sharhlar
- 📅 Onlayn band qilish (sana + vaqt)
- 📊 Band qilish statusini real vaqtda kuzatish
- ✍️ Sharh va reyting qoldirish
- 🔔 Telegram orqali bildirishnomalar

### 💼 Sartarosh (Barber)
- 📋 Barcha bandlarni ko'rish
- ✔️ Bandni qabul qilish
- ✖️ Bandni rad etish
- 🔔 Yangi band haqida Telegram xabarnoma
- 📊 Real vaqtda yangilanishlar

---

## 🛠 Texnologiyalar

### Backend
- Node.js + Express
- SQLite (better-sqlite3)
- Telegram Bot API (node-telegram-bot-api)

### Frontend
- React 18
- Vite
- React Router
- Axios
- Telegram Web App SDK

---

## 📦 O'rnatish

### 1. Telegram Bot yaratish

1. [@BotFather](https://t.me/BotFather) ga o'ting
2. `/newbot` buyrug'ini yuboring
3. Bot nomini kiriting
4. Bot username kiriting
5. Bot token ni saqlab qo'ying

### 2. Loyihani klonlash

```bash
cd CutSpace
```

### 3. Backend sozlash

```bash
cd backend
npm install
```

`.env` fayl yarating:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
PORT=3000
ADMIN_TELEGRAM_ID=your_telegram_id_here
WEBAPP_URL=https://your-domain.com
```

**Telegram ID ni topish:**
1. [@userinfobot](https://t.me/userinfobot) ga `/start` yuboring
2. O'z ID ingizni oling

Backend ni ishga tushiring:

```bash
npm start
```

### 4. Frontend sozlash

```bash
cd ../frontend
npm install
```

`.env` fayl yarating:

```env
VITE_API_URL=http://localhost:3000/api
```

Development rejimda ishga tushirish:

```bash
npm run dev
```

---

## 🌐 Deploy qilish

### Backend (Heroku / Railway / Render)

1. Backendni deploy qiling
2. Environment variables sozlang:
   - `TELEGRAM_BOT_TOKEN`
   - `ADMIN_TELEGRAM_ID`
   - `WEBAPP_URL`

### Frontend (Vercel / Netlify / GitHub Pages)

1. Frontendni build qiling:
   ```bash
   npm run build
   ```

2. `VITE_API_URL` ni production URL ga o'zgartiring

3. Deploy qiling

### Telegram Mini App sozlash

1. [@BotFather](https://t.me/BotFather) ga o'ting
2. `/mybots` -> O'z botingiz -> `Bot Settings` -> `Menu Button`
3. `Configure menu button` -> Web App URL kiriting
4. Yoki `/setmenubutton` buyrug'i bilan

---

## 📱 Ishlatish

### Mijoz sifatida

1. Botga `/start` yuboring
2. "Mini ilovani ochish" tugmasini bosing
3. Sartaroshni tanlang
4. Band qilish tugmasini bosing
5. Sana va vaqtni tanlang
6. Tasdiqlang

**Statuslar:**
- ⏳ **Kutilmoqda** - Sartarosh javobini kutmoqda
- ✅ **Qabul qilindi** - Bandingiz tasdiqlandi
- ❌ **Rad etildi** - Boshqa vaqt tanlang

### Sartarosh sifatida

1. URL ga `?role=barber` qo'shing:
   ```
   https://your-app.com/?role=barber
   ```

2. Yangi bandlarni ko'ring
3. "Qabul qilish" yoki "Rad etish" tugmalarini bosing
4. Mijoz avtomatik xabarnoma oladi

---

## 🎨 UI/UX Xususiyatlari

- 📱 100% mobile responsive
- 🎨 Telegram Mini App dizayni
- 🌗 Light/Dark mode support
- ⚡️ Smooth animations
- 🔄 Real-time updates
- 💨 Fast & lightweight

---

## 📂 Loyiha Strukturasi

```
CutSpace/
├── backend/
│   ├── src/
│   │   ├── server.js       # Express server
│   │   ├── database.js     # SQLite database
│   │   └── bot.js          # Telegram bot
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── api.js          # API calls
│   │   ├── App.jsx         # Main app
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🔧 Development

### Backend development

```bash
cd backend
npm run dev  # nodemon bilan
```

### Frontend development

```bash
cd frontend
npm run dev
```

### Test qilish

Telegram Web App SDK ni test qilish uchun:
- Desktop: [Telegram Web](https://web.telegram.org)
- Mobile: Telegram mobil ilovasi

---

## 🔔 Bildirishnomalar

### Mijoz uchun:
1. ✅ Band tasdiqlanganda
2. ❌ Band rad etilganda

### Sartarosh uchun:
1. 🔔 Yangi band yaratilganda

---

## 🌟 Kengaytirish imkoniyatlari

- [ ] To'lov tizimi (Click, Payme)
- [ ] Xizmat tanlash
- [ ] Bonus sistema
- [ ] Geolokatsiya
- [ ] Ko'p filial qo'llab-quvvatlash
- [ ] Admin panel
- [ ] Analytics
- [ ] Push notifications
- [ ] Sartarosh jadval boshqaruvi
- [ ] Mijoz tarixi

---

## 🤝 Hissa qo'shish

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/amazing`)
3. Commit qiling (`git commit -m 'Add amazing feature'`)
4. Push qiling (`git push origin feature/amazing`)
5. Pull Request oching

---

## 📄 License

MIT License - xohlagan maqsadda ishlatishingiz mumkin.

---

## 💡 Maslahatlar

### Development da test qilish

Telegram Mini App SDK ni localhost da test qilish uchun:

1. **ngrok** yoki **localtunnel** ishlatish:
   ```bash
   npx localtunnel --port 5173
   ```

2. HTTPS URL ni BotFather ga qo'shish

3. Botni ochib test qilish

### Production

- HTTPS albatta kerak
- Environment variables xavfsizligini ta'minlang
- Database backup oling
- Error monitoring qo'shing (Sentry)
- Rate limiting qo'shing

---

## 🐛 Muammolar

Agar muammo bo'lsa:

1. Node.js versiyasi 16+ ekanligini tekshiring
2. `.env` fayllar to'g'ri sozlanganligini tekshiring
3. Bot token va Telegram ID to'g'riligini tekshiring
4. Port 3000 bo'sh ekanligini tekshiring

---

## 📞 Aloqa

Savollar bo'lsa, issue oching yoki PR yuboring!

---

**Made with ❤️ for Tashkent barbers and clients**

🇺🇿 O'zbekiston | 🏪 CutSpace | 💈 Sartaroshxona

---

## 🎯 Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Edit with your tokens
npm start

# Frontend (yangi terminal)
cd frontend
npm install
cp .env.example .env
npm run dev

# Visit: http://localhost:5173
# For barber panel: http://localhost:5173/?role=barber
```

**Tayyor! 🎉**


