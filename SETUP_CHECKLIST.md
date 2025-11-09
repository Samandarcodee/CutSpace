# ✅ Setup Checklist - CutSpace

Use this checklist to ensure everything is set up correctly.

---

## 📋 Pre-Setup (5 minutes)

### 1. Prerequisites
- [ ] Node.js 16+ installed
- [ ] npm installed (comes with Node.js)
- [ ] Text editor (VS Code, etc.)
- [ ] Telegram app (desktop or mobile)
- [ ] Terminal/Command Prompt access

**Check Node.js:**
```bash
node --version  # Should show v16.0.0 or higher
npm --version   # Should show 8.0.0 or higher
```

---

## 🤖 Telegram Setup (3 minutes)

### 2. Create Telegram Bot
- [ ] Open Telegram
- [ ] Search for @BotFather
- [ ] Send `/newbot` command
- [ ] Enter bot name (e.g., "CutSpace Bot")
- [ ] Enter bot username (e.g., "cutspace_test_bot")
- [ ] ✅ **COPY THE TOKEN** (you'll need this!)

**Token format:** `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

### 3. Get Your Telegram ID
- [ ] Open Telegram
- [ ] Search for @userinfobot
- [ ] Send `/start` command
- [ ] ✅ **COPY YOUR ID** (e.g., 123456789)

---

## ⚙️ Backend Setup (5 minutes)

### 4. Install Backend Dependencies
```bash
cd backend
npm install
```

- [ ] Command completed without errors
- [ ] `node_modules` folder created
- [ ] `package-lock.json` created

### 5. Create Backend .env File

**Option A: Copy template**
```bash
copy env-template.txt .env     # Windows
cp env-template.txt .env       # Mac/Linux
```

**Option B: Create manually**

Create file: `backend/.env`

```env
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
PORT=3000
ADMIN_TELEGRAM_ID=YOUR_TELEGRAM_ID_HERE
WEBAPP_URL=http://localhost:5173
```

- [ ] `.env` file created in `backend/` folder
- [ ] Bot token pasted (from step 2)
- [ ] Telegram ID pasted (from step 3)
- [ ] Port is 3000
- [ ] Web app URL is `http://localhost:5173`

### 6. Start Backend
```bash
npm start
```

**Expected output:**
```
✅ Initial barbers data seeded
🤖 Telegram bot started
🚀 Server is running on port 3000
```

- [ ] No errors shown
- [ ] All 3 messages appeared
- [ ] Server is running (don't close this terminal!)

### 7. Test Backend
Open new terminal/browser:
```bash
curl http://localhost:3000/api/health
# OR visit in browser: http://localhost:3000/api/health
```

**Expected:** `{"status":"ok","message":"CutSpace API is running"}`

- [ ] Backend responds with OK message
- [ ] No errors

---

## 🎨 Frontend Setup (5 minutes)

### 8. Install Frontend Dependencies

**Open NEW terminal** (keep backend running!)

```bash
cd frontend
npm install
```

- [ ] Command completed without errors
- [ ] `node_modules` folder created
- [ ] `package-lock.json` created

### 9. Create Frontend .env File

**Option A: Copy template**
```bash
copy env-template.txt .env     # Windows
cp env-template.txt .env       # Mac/Linux
```

**Option B: Create manually**

Create file: `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

- [ ] `.env` file created in `frontend/` folder
- [ ] API URL is `http://localhost:3000/api`

### 10. Start Frontend
```bash
npm run dev
```

**Expected output:**
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

- [ ] No errors shown
- [ ] Port 5173 is used
- [ ] URL is shown (don't close this terminal!)

### 11. Open in Browser

- [ ] Open browser
- [ ] Navigate to `http://localhost:5173/`
- [ ] App loads successfully
- [ ] See "Sartaroshlar" header
- [ ] See 3 barbers (Bobur, Jasur, Shohruh)

---

## 🧪 Testing (10 minutes)

### 12. Test as Client

#### Home Page
- [ ] See 3 barbers with ratings
- [ ] See service prices
- [ ] "Band qilish" buttons visible

#### Barber Detail
- [ ] Click on any barber
- [ ] See full profile
- [ ] See all services
- [ ] See reviews section
- [ ] "Sharh qoldirish" button works

#### Create Booking
- [ ] Click "Band qilish" button
- [ ] Date picker appears
- [ ] Time slots (09:00 - 19:00) visible
- [ ] Can select time (highlights in blue)
- [ ] Summary shows correct info
- [ ] Click "Tasdiqlash"
- [ ] Success message appears
- [ ] Redirects to "Bandlarim"

#### My Bookings
- [ ] Go to "Bandlarim" tab (bottom nav)
- [ ] See your booking
- [ ] Status shows "⏳ Kutilmoqda"
- [ ] Date and time correct
- [ ] Booking ID shown

### 13. Test as Barber

#### Barber Panel Access
- [ ] Open new tab: `http://localhost:5173/?role=barber`
- [ ] See "Sartarosh Paneli" header
- [ ] See filter buttons
- [ ] See your test booking from step 12

#### Accept Booking
- [ ] Click "✔️ Qabul qilish" button
- [ ] See success alert
- [ ] Status changes to "✅ Qabul qilindi"
- [ ] Booking card updates

#### Check Client Update
- [ ] Go back to client tab
- [ ] Booking status now shows "✅ Qabul qilindi"
- [ ] Status changed automatically (real-time!)

### 14. Test Reviews

- [ ] Go to barber detail page
- [ ] Click "Sharh qoldirish"
- [ ] Form appears
- [ ] Select star rating (click stars)
- [ ] Write comment (optional)
- [ ] Click "Sharh qo'shish"
- [ ] Review appears in list
- [ ] Rating updates

### 15. Test Telegram Bot

#### Bot Commands
- [ ] Open Telegram
- [ ] Search for your bot (username from step 2)
- [ ] Send `/start`
- [ ] Bot responds with welcome message

#### Notifications
- [ ] Check for notification about booking created
- [ ] Check for notification about booking accepted
- [ ] Both notifications received

---

## 🎯 Final Verification

### 16. All Systems Check

**Backend:**
- [ ] Running on port 3000
- [ ] No errors in terminal
- [ ] Database file exists: `backend/database.db`
- [ ] `/api/health` responds

**Frontend:**
- [ ] Running on port 5173
- [ ] No errors in terminal
- [ ] No console errors in browser
- [ ] All pages accessible

**Features:**
- [ ] Can view barbers
- [ ] Can create bookings
- [ ] Can view booking status
- [ ] Can accept bookings (barber)
- [ ] Can leave reviews
- [ ] Bot sends notifications

**Navigation:**
- [ ] Home tab works
- [ ] Bandlarim tab works
- [ ] Profile tab works
- [ ] Back buttons work

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Port 3000 already in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```
- [ ] Port cleared
- [ ] Backend restarts successfully

**Problem:** Database not seeding
- [ ] Delete `backend/database.db`
- [ ] Restart backend with `npm start`
- [ ] Check for "✅ Initial barbers data seeded" message

**Problem:** Bot not starting
- [ ] Check `TELEGRAM_BOT_TOKEN` in `.env`
- [ ] Verify token with @BotFather
- [ ] Check for spaces/typos in token

### Frontend Issues

**Problem:** Can't connect to backend
- [ ] Backend is running (check step 6)
- [ ] `VITE_API_URL` is correct in `.env`
- [ ] Try: `http://localhost:3000/api/health` in browser

**Problem:** Page is blank
- [ ] Check browser console (F12)
- [ ] Check frontend terminal for errors
- [ ] Clear browser cache (Ctrl+Shift+Delete)

**Problem:** No barbers showing
- [ ] Backend database initialized (step 6)
- [ ] API responding: `http://localhost:3000/api/barbers`
- [ ] Check Network tab in browser DevTools

### General Issues

**Problem:** npm install fails
```bash
# Clear cache
npm cache clean --force

# Try again
npm install
```

**Problem:** Permission denied (Mac/Linux)
```bash
# Use sudo for global packages only
sudo npm install -g npm
```

---

## 📊 Success Criteria

All checkboxes should be checked:

**Setup:**
- [x] Backend running ✅
- [x] Frontend running ✅
- [x] Bot responding ✅

**Features:**
- [x] View barbers ✅
- [x] Create booking ✅
- [x] Track status ✅
- [x] Accept booking ✅
- [x] Leave review ✅
- [x] Get notifications ✅

**Quality:**
- [x] No errors ✅
- [x] Fast loading ✅
- [x] Smooth UX ✅

---

## 🚀 Next Steps

Once everything is checked:

1. **Customize:**
   - Add more barbers
   - Change colors
   - Modify time slots

2. **Deploy:**
   - Backend → Railway/Render
   - Frontend → Vercel/Netlify
   - Connect to Telegram

3. **Share:**
   - Give bot username to users
   - Test with real bookings
   - Gather feedback

---

## 📞 Need Help?

If stuck:

1. **Check logs:**
   - Backend terminal
   - Frontend terminal
   - Browser console (F12)

2. **Review docs:**
   - README.md (complete guide)
   - setup.md (detailed setup)
   - FEATURES.md (how features work)

3. **Common fixes:**
   - Restart backend
   - Restart frontend
   - Clear browser cache
   - Check .env files

---

## ✨ Congratulations!

If all items are checked, you have successfully set up CutSpace! 🎉

**Your app is now:**
- ✅ Fully functional
- ✅ Ready for testing
- ✅ Ready for customization
- ✅ Ready for deployment

**Start booking appointments!** 💈

---

**Total Setup Time: ~20 minutes**

🏠 Client: http://localhost:5173/
💼 Barber: http://localhost:5173/?role=barber
🤖 Bot: @your_bot_username


