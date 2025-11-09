# 🚀 Quick Start Guide - Telegram Mini App Fix

## ✅ What Was Fixed

Your Telegram Mini App now:
1. ✅ Properly validates user data from Telegram
2. ✅ Shows error modal if opened outside Telegram bot
3. ✅ Uses HMAC SHA-256 for secure authentication
4. ✅ Has inline buttons for proper Mini App launch

## 🎯 For Users: How to Open Mini App

### ✅ CORRECT Way (Will Work)
1. Open Telegram
2. Go to your bot chat
3. Send `/start` command
4. Click **"🚀 Mini App ni ochish"** button (inline button)
5. Mini App opens ✅

### ❌ WRONG Way (Will Show Error)
- Opening URL directly in browser
- Opening from web Telegram without bot
- Sharing link with friends
- Bookmarking the URL

## 🔧 For Developers: Quick Setup

### 1. Environment Variables

Make sure these are set:

```bash
# .env or deployment platform
TELEGRAM_BOT_TOKEN=your_bot_token_here
WEB_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 2. Register Domain with BotFather

```
1. Open Telegram, find @BotFather
2. Send: /setmenubutton
3. Select your bot
4. Send your Mini App URL
5. Done! ✅
```

### 3. Test Locally

```bash
# Development mode (skips validation)
export NODE_ENV=development
npm run dev

# Update bot to use localhost
# Change WEB_APP_URL to http://localhost:5000 in telegram.ts
```

### 4. Deploy to Production

```bash
# Production mode (requires validation)
export NODE_ENV=production
npm start
```

## 📋 Testing Checklist

After deployment, test these scenarios:

- [ ] Open Mini App from bot → ✅ Should work
- [ ] Open URL in browser → ❌ Should show error modal
- [ ] User data appears in console → ✅ Should see user.id
- [ ] Backend logs "✅ Telegram initData validated successfully"

## 🐛 Quick Troubleshooting

### Problem: Error modal shows even from bot

**Solution:**
1. Check bot uses **inline_keyboard** (not keyboard)
2. Verify Telegram SDK is loaded
3. Check console logs for user data

```javascript
// Check in browser console
console.log(window.Telegram.WebApp.initDataUnsafe.user);
```

### Problem: Backend validation fails

**Solution:**
1. Verify bot token is correct
2. Check `initData` is sent from frontend
3. Ensure timestamp not expired (< 1 hour)

```bash
# Backend logs should show:
✅ Telegram initData validated successfully
```

### Problem: No inline buttons appear

**Solution:**
Check `/start` command in `server/telegram.ts`:

```javascript
reply_markup: {
  inline_keyboard: [  // ← Must be inline_keyboard
    [{ text: "🚀 Mini App ni ochish", web_app: { url: WEB_APP_URL } }]
  ]
}
```

## 📝 Key Code Locations

| What | File | Line |
|------|------|------|
| Error Modal | `client/src/App.tsx` | 36-78 |
| HMAC Validation | `server/auth.ts` | 20-96 |
| Auth Endpoint | `server/routes.ts` | 21-107 |
| Inline Buttons | `server/telegram.ts` | 56-97 |

## 🔍 Debug Commands

### Frontend (Browser Console)
```javascript
// Check Telegram SDK
window.Telegram.WebApp

// Check user data
window.Telegram.WebApp.initDataUnsafe.user

// Check initData string
window.Telegram.WebApp.initData
```

### Backend (Server Logs)
```bash
# Should see these logs:
🔐 Auth request - Telegram ID: 123456789
✅ Telegram initData validated successfully
👤 User found: true
📤 Sending response - User role: customer
```

## 🎨 Inline Button Code Examples

### Basic Inline Button
```javascript
bot.sendMessage(chatId, "Open Mini App:", {
  reply_markup: {
    inline_keyboard: [
      [{ text: "🚀 Open", web_app: { url: WEB_APP_URL } }]
    ]
  }
});
```

### Multiple Pages
```javascript
bot.sendMessage(chatId, "Choose page:", {
  reply_markup: {
    inline_keyboard: [
      [{ text: "🏠 Home", web_app: { url: WEB_APP_URL } }],
      [{ text: "📱 Bookings", web_app: { url: WEB_APP_URL + "/bookings" } }],
      [{ text: "👤 Profile", web_app: { url: WEB_APP_URL + "/profile" } }]
    ]
  }
});
```

## 📞 Need More Help?

Check these files:
- **Full Documentation:** `TELEGRAM_MINIAPP_FIX_SUMMARY.md`
- **Inline Button Examples:** `TELEGRAM_MINIAPP_INLINE_BUTTONS.md`

## ⚡ Quick Commands

```bash
# Start development
npm run dev

# Check logs
npm run dev | grep "✅"

# Test backend validation
curl -X POST http://localhost:5000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"telegramId": "123"}'
```

## ✨ What's Next?

1. ✅ Deploy to production
2. ✅ Test from Telegram app
3. ✅ Register domain with @BotFather
4. ✅ Share bot with users

---

**All done! Your Telegram Mini App is now secure and properly configured. 🎉**

For detailed explanations, see `TELEGRAM_MINIAPP_FIX_SUMMARY.md`
