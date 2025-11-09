# ⚡️ Quick Start Reference Card

## 🚀 5-Minute Setup

### 1. Get Telegram Bot Token
[@BotFather](https://t.me/BotFather) → `/newbot` → Copy token

### 2. Get Your Telegram ID
[@userinfobot](https://t.me/userinfobot) → `/start` → Copy ID

### 3. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
TELEGRAM_BOT_TOKEN=your_token_here
PORT=3000
ADMIN_TELEGRAM_ID=your_id_here
WEBAPP_URL=http://localhost:5173
```

Start:
```bash
npm start
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

Start:
```bash
npm run dev
```

### 5. Open Browser
- **Client:** http://localhost:5173/
- **Barber:** http://localhost:5173/?role=barber

---

## 🎯 Test Flow

### As Client (5 steps)
1. Open http://localhost:5173/
2. Click any barber → "Band qilish"
3. Select date & time → "Tasdiqlash"
4. Go to "Bandlarim" tab
5. See status "⏳ Kutilmoqda"

### As Barber (3 steps)
1. Open http://localhost:5173/?role=barber
2. See the booking you created
3. Click "✔️ Qabul qilish"

### Result
- Client's status changes to "✅ Qabul qilindi"
- Both get Telegram notifications

---

## 📂 Project Structure

```
CutSpace/
├── backend/
│   ├── src/
│   │   ├── server.js    # API
│   │   ├── database.js  # DB
│   │   └── bot.js       # Bot
│   └── .env             # Config
├── frontend/
│   ├── src/
│   │   ├── pages/       # Pages
│   │   ├── components/  # UI
│   │   └── api.js       # API
│   └── .env             # Config
└── README.md            # Docs
```

---

## 🔧 Common Commands

### Backend
```bash
cd backend
npm install          # Install deps
npm start            # Start server
npm run dev          # Dev mode (nodemon)
```

### Frontend
```bash
cd frontend
npm install          # Install deps
npm run dev          # Dev mode
npm run build        # Production build
```

---

## 🌐 URLs

| Page | URL |
|------|-----|
| Home | http://localhost:5173/ |
| Bookings | http://localhost:5173/booking |
| Profile | http://localhost:5173/profile |
| Barber Panel | http://localhost:5173/?role=barber |
| API Health | http://localhost:3000/api/health |

---

## 📊 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/barbers` | List barbers |
| GET | `/api/barbers/:id` | Get barber |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/client/:id` | Client bookings |
| PATCH | `/api/bookings/:id/status` | Update status |
| POST | `/api/reviews` | Add review |

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port 3000 is free
netstat -ano | findstr :3000

# Check .env exists
ls backend/.env

# Check token is correct
```

### Frontend can't connect
```bash
# Check backend is running
curl http://localhost:3000/api/health

# Check .env file
cat frontend/.env

# Restart frontend
```

### No barbers showing
```bash
# Reset database
cd backend
rm database.db
npm start  # Will recreate with seed data
```

---

## 📝 Environment Variables

### Backend (.env)
```env
TELEGRAM_BOT_TOKEN=123456789:ABC...
PORT=3000
ADMIN_TELEGRAM_ID=123456789
WEBAPP_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🎨 Customization

### Change Colors
`frontend/src/index.css`:
```css
:root {
  --tg-theme-button-color: #2481cc;
}
```

### Add Barber
`backend/src/database.js`:
```js
{
  name: 'New Barber',
  description: 'Description',
  rating: 5.0,
  // ...
}
```

### Change Time Slots
`frontend/src/pages/BookingForm.jsx`:
```js
const timeSlots = [
  '09:00', '10:00', // ...
];
```

---

## 📱 Deploy to Telegram

### 1. Deploy Online
- Backend → Railway/Render
- Frontend → Vercel/Netlify

### 2. Configure Bot
1. @BotFather → `/mybots`
2. Your bot → Bot Settings
3. Menu Button → Configure
4. Enter frontend URL

### 3. Test
Open bot → Menu button → App opens!

---

## ✅ Feature Checklist

- [x] View barbers with ratings
- [x] Book appointments
- [x] Track booking status
- [x] Leave reviews
- [x] Barber panel (accept/reject)
- [x] Telegram notifications
- [x] Real-time updates
- [x] Mobile responsive
- [x] Uzbek language
- [x] Bottom navigation

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `backend/src/server.js` | API routes |
| `backend/src/database.js` | Database & seed data |
| `backend/src/bot.js` | Telegram bot |
| `frontend/src/App.jsx` | React router |
| `frontend/src/pages/Home.jsx` | Barbers list |
| `frontend/src/pages/BookingForm.jsx` | Booking form |
| `frontend/src/pages/BarberPanel.jsx` | Barber dashboard |

---

## 💡 Pro Tips

1. **Development**: Keep both terminals open (backend + frontend)
2. **Testing**: Use `?role=barber` to test barber features
3. **Debugging**: Check browser console & backend logs
4. **Database**: SQLite file is in `backend/database.db`
5. **Telegram**: Use ngrok/localtunnel to test with real Telegram

---

## 📚 Documentation

| File | Content |
|------|---------|
| README.md | Complete documentation |
| setup.md | Step-by-step setup |
| FEATURES.md | All features explained |
| PROJECT_SUMMARY.md | Project overview |
| QUICK_START.md | This file |

---

## 🆘 Help

**Backend not working?**
→ Check setup.md "Troubleshooting" section

**Frontend error?**
→ Check browser console for errors

**Bot not sending messages?**
→ Verify token in .env file

**Need more help?**
→ Read README.md or setup.md

---

## 🎯 Success Indicators

✅ Backend logs: "🚀 Server is running on port 3000"
✅ Backend logs: "🤖 Telegram bot started"
✅ Frontend shows 3 barbers
✅ Can create booking
✅ Barber panel shows bookings
✅ Can accept/reject
✅ Status updates in real-time

---

## ⚡️ One-Line Commands

```bash
# Backend
cd backend && npm i && npm start

# Frontend (new terminal)
cd frontend && npm i && npm run dev
```

---

## 🔢 Project Stats

- **Files:** 35+
- **Lines:** 2500+
- **Pages:** 7
- **Components:** 3
- **API Routes:** 11
- **Time:** ~2 hours

---

**Ready in 5 minutes! 🚀**

1. ✅ Get bot token
2. ✅ Create .env files
3. ✅ npm install & start
4. ✅ Open browser
5. ✅ Test booking flow

**That's it! Start building!** 🎉


