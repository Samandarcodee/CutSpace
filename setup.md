# 🚀 Quick Setup Guide

## Prerequisites

- Node.js 16+ installed
- Telegram account
- Text editor

---

## Step-by-Step Setup

### 1️⃣ Create Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot`
3. Enter bot name: `CutSpace Bot`
4. Enter username: `cutspace_test_bot` (must be unique)
5. **Copy the bot token** - you'll need this!

Example token: `6123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2️⃣ Get Your Telegram ID

1. Open [@userinfobot](https://t.me/userinfobot)
2. Send `/start`
3. **Copy your ID** (e.g., `123456789`)

### 3️⃣ Setup Backend

Open terminal in project root:

```bash
cd backend
npm install
```

Create `.env` file in `backend/` folder:

```env
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
PORT=3000
ADMIN_TELEGRAM_ID=YOUR_TELEGRAM_ID_HERE
WEBAPP_URL=http://localhost:5173
```

Replace:
- `YOUR_BOT_TOKEN_HERE` with your bot token from step 1
- `YOUR_TELEGRAM_ID_HERE` with your ID from step 2

Start backend:

```bash
npm start
```

You should see:
```
✅ Initial barbers data seeded
🤖 Telegram bot started
🚀 Server is running on port 3000
```

### 4️⃣ Setup Frontend

Open **NEW terminal** (keep backend running):

```bash
cd frontend
npm install
```

Create `.env` file in `frontend/` folder:

```env
VITE_API_URL=http://localhost:3000/api
```

Start frontend:

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

### 5️⃣ Test in Browser

Open browser:

**For Client (Mijoz):**
```
http://localhost:5173/
```

**For Barber (Sartarosh):**
```
http://localhost:5173/?role=barber
```

---

## 🧪 Testing the App

### Test as Client:

1. Go to `http://localhost:5173/`
2. Click on any barber
3. Click "Band qilish" (Book)
4. Select date and time
5. Click "Tasdiqlash" (Confirm)
6. Check "Bandlarim" tab (Bookings)
7. Status should be "⏳ Kutilmoqda" (Pending)

### Test as Barber:

1. Open new tab: `http://localhost:5173/?role=barber`
2. You should see the booking you just made
3. Click "✔️ Qabul qilish" (Accept)
4. Go back to client tab
5. Status should change to "✅ Qabul qilindi" (Accepted)

---

## 🔧 Troubleshooting

### Backend won't start

**Problem:** Port 3000 already in use

**Solution:**
```bash
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or change PORT in .env to 3001
```

### Frontend can't connect to backend

**Problem:** Network error / CORS

**Check:**
1. Backend is running (`http://localhost:3000/api/health`)
2. `.env` file has correct API URL
3. Restart frontend after changing `.env`

### No barbers showing

**Problem:** Database not initialized

**Solution:**
```bash
cd backend
# Delete database
rm database.db
# Restart backend
npm start
```

### Bot not responding

**Check:**
1. Bot token is correct in `.env`
2. No spaces in token
3. Backend logs show "🤖 Telegram bot started"

---

## 📱 Testing with Real Telegram

To test as actual Telegram Mini App:

### Option 1: Using ngrok (Recommended)

1. Install ngrok: https://ngrok.com/download

2. Start ngrok:
   ```bash
   ngrok http 5173
   ```

3. Copy HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. Open [@BotFather](https://t.me/BotFather)
   - Send `/mybots`
   - Select your bot
   - `Bot Settings` → `Menu Button`
   - `Configure menu button`
   - Paste ngrok URL

5. Open your bot in Telegram
6. Click Menu button (bottom-left)

### Option 2: Using localtunnel

```bash
npx localtunnel --port 5173
```

Follow same steps as ngrok with the URL provided.

---

## ✅ Success Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can see 3 barbers on home page
- [ ] Can create booking
- [ ] Barber panel shows bookings
- [ ] Can accept/reject bookings
- [ ] Status updates in real-time
- [ ] Bot sends notifications (check Telegram)

---

## 🎯 Next Steps

Once working locally:

1. **Deploy backend** (Heroku/Railway/Render)
2. **Deploy frontend** (Vercel/Netlify)
3. **Update bot menu button** with production URL
4. **Share bot** with friends!

---

## 💡 Tips

### Development Tips:

- Keep both terminals open (backend + frontend)
- Use browser DevTools to debug
- Check backend logs for API calls
- Refresh browser if UI doesn't update

### Feature Ideas:

- Add more barbers in `backend/src/database.js`
- Customize colors in `frontend/src/index.css`
- Add more time slots in `BookingForm.jsx`
- Add services/prices

---

## 📚 File Structure Reference

```
CutSpace/
├── backend/
│   ├── src/
│   │   ├── server.js    ← API endpoints
│   │   ├── database.js  ← Database & barbers
│   │   └── bot.js       ← Telegram bot
│   ├── .env             ← YOUR CONFIG HERE
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/       ← Main pages
│   │   ├── components/  ← Reusable parts
│   │   └── App.jsx      ← Router
│   ├── .env             ← YOUR CONFIG HERE
│   └── package.json
└── README.md            ← Full documentation
```

---

## 🆘 Need Help?

Common commands:

```bash
# Check if backend is running
curl http://localhost:3000/api/health

# Check if frontend is running
curl http://localhost:5173

# Restart everything
# Ctrl+C in both terminals, then:
cd backend && npm start
cd frontend && npm run dev

# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

**You're all set! 🎉**

Visit `http://localhost:5173/` and start booking!


