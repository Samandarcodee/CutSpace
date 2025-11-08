# 🚀 Toshkent Sartarosh - Deploy Instructions

## ✅ O'zgarishlar

### 1. Telegram SDK Yuklanishi
- SDK to'liq yuklanishini kutish logic qo'shildi
- 500ms kechikish user ma'lumotlarini olish uchun
- 5 soniya timeout SDK yuklanmasa

### 2. Error Handling
- User'ga tushunarli xabar berish (Telegram Popup)
- Console'da to'liq debug logging
- Backend auth xatolarini handle qilish

### 3. Type Fixes
- `TelegramUser` → `TelegramWebAppUser` (to'g'ri import)
- Barcha type errorlar tuzatildi

### 4. Render.yaml
- `WEB_APP_URL` environment variable qo'shildi

---

## 📋 Render.com Deploy

### 1. GitHub'ga push qiling
```bash
cd C:\Users\Диёрбек\Desktop\ToshkentSartarosh
git add .
git commit -m "Fix: Telegram Mini App initialization and auth"
git push origin main
```

### 2. Render.com Dashboard
1. https://dashboard.render.com ga kiring
2. "Toshkent Sartarosh" servisini toping
3. **Environment** bo'limiga o'ting
4. `WEB_APP_URL` qo'shing:
   - Key: `WEB_APP_URL`
   - Value: `https://toshkent-sartarosh.onrender.com` (yoki sizning domen)
5. **Save Changes** bosing
6. Servis avtomatik qayta deploy bo'ladi

### 3. Telegram BotFather
1. Telegram'da `@BotFather` ga yozing
2. `/mybots` → Botingizni tanlang
3. **Bot Settings** → **Menu Button**
4. **Configure Menu Button** → **Edit Menu Button URL**
5. URL kiriting: `https://toshkent-sartarosh.onrender.com`
6. **Web App** → **Configure Web App**
7. URL kiriting: `https://toshkent-sartarosh.onrender.com`

---

## 🧪 Test Qilish

### Admin ID bilan test:
1. Telegram'da `@Baarbershopp_bot` ga kiring (5928372261 ID bilan)
2. `/start` yuboring
3. "🚀 Mini App ni ochish" tugmasini bosing
4. Console'ni oching (Desktop: F12, Mobile: inspect mode)
5. Quyidagi loglarni ko'ring:
   ```
   ✅ Telegram SDK topildi
   ✅ Telegram WebApp initialized
   ✅ Telegram user topildi: {id: 5928372261, ...}
   ✅ Backend user loaded: {role: "admin", ...}
   👑 Is Admin: true
   ```
6. Profile sahifasiga o'ting - "Admin Panel" tugmasi ko'rinishi kerak

### Customer ID bilan test:
1. Boshqa Telegram akkaunt bilan bot'ga kiring
2. Xuddi shu qadamlarni takrorlang
3. `role: "customer"` ko'rinishi kerak
4. "Admin Panel" tugmasi yo'q

---

## 🐛 Muammolarni hal qilish

### Agar user ma'lumoti topilmasa:
1. **Console'ni tekshiring**:
   ```
   ❌ Telegram user ma'lumoti topilmadi
   Telegram Web App Data: {...}
   ```
2. **Popup paydo bo'ladi**: "Mini App foydalanuvchi ma'lumotlarini ololmadi..."

### Yechim:
1. Mini App'ni yoping
2. Bot chatiga qayting
3. `/start` yuboring
4. Qayta "🚀 Mini App ni ochish" bosing
5. Agar yana ishlamasa:
   - BotFather'da Web App URL to'g'ri ekanini tekshiring
   - Render'da `WEB_APP_URL` to'g'ri sozlanganini tekshiring
   - Render logs tekshiring: https://dashboard.render.com → Logs

---

## 📊 Render Logs Tekshirish

```bash
# Render Dashboard → Service → Logs
# Quyidagilarni qidiring:

✅ Telegram SDK topildi                   # Frontend - SDK yuklandi
✅ Telegram user topildi: {id: ...}       # Frontend - User topildi
🔐 Auth request - Telegram ID: 5928372261 # Backend - Auth request keldi
✅ User created - Role: admin             # Backend - Admin yaratildi
📤 Sending response - User role: admin    # Backend - Response yuborildi
```

---

## 🎯 Admin Panel Ishlash Jarayoni

1. **Telegram → Frontend**:
   - Telegram SDK user ma'lumotini yuboradi
   - Frontend `getTelegramWebAppUser()` orqali oladi

2. **Frontend → Backend**:
   - `/api/auth/telegram` ga POST request
   - Body: `{telegramId, firstName, lastName, username}`

3. **Backend**:
   - `telegramId === 5928372261` tekshiradi
   - Agar to'g'ri bo'lsa → `role: "admin"` o'rnatadi
   - Response: `{user: {role: "admin", ...}}`

4. **Frontend Context**:
   - `backendUser.role` ni saqlaydi
   - `isAdmin = backendUser.role === "admin"` hisoblaydi

5. **Profile Page**:
   - `isAdmin` ni tekshiradi
   - Agar `true` → "Admin Panel" tugmasi ko'rsatadi

---

## ✅ Tayyor!

Deploy tugagandan keyin:
1. Telegram bot ishlaydi: `@Baarbershopp_bot`
2. Mini App ochiladi: https://toshkent-sartarosh.onrender.com
3. Admin ID (5928372261) admin panel ko'radi
4. Boshqa ID'lar customer sifatida kiradi
5. Database real ma'lumotlar bilan ishlaydi (PostgreSQL)

---

## 📞 Yordam

Agar muammo bo'lsa, quyidagi ma'lumotlarni yuboring:
1. Console logs (F12 → Console)
2. Render logs (Dashboard → Logs)
3. Telegram user ID
4. Qaysi sahifada xato bo'ldi


