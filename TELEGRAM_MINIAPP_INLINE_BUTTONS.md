# Telegram Mini App Inline Button Code Examples

## 🎯 Overview
This guide provides complete code examples for implementing Telegram Mini App inline buttons using the node-telegram-bot-api library.

## 📦 Prerequisites

```bash
npm install node-telegram-bot-api
```

## 🔑 Basic Setup

```javascript
import TelegramBot from "node-telegram-bot-api";

const BOT_TOKEN = "YOUR_BOT_TOKEN";
const WEB_APP_URL = "https://your-mini-app.com";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
```

## 🚀 Inline Button Examples

### 1. Single Inline Button (Recommended for Mini App)

```javascript
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || "User";
  
  await bot.sendMessage(chatId, `Salom, ${firstName}! 👋\n\nMini App ni ochish uchun quyidagi tugmani bosing:`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Mini App ni ochish", web_app: { url: WEB_APP_URL } }]
      ]
    }
  });
});
```

### 2. Multiple Inline Buttons (Different Pages)

```javascript
bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(chatId, "Qaysi sahifani ochmoqchisiz?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🏠 Bosh sahifa", web_app: { url: WEB_APP_URL } }],
        [{ text: "📱 Yozilishlarim", web_app: { url: WEB_APP_URL + "/bookings" } }],
        [{ text: "👤 Profil", web_app: { url: WEB_APP_URL + "/profile" } }],
        [{ text: "⚙️ Admin Panel", web_app: { url: WEB_APP_URL + "/admin" } }]
      ]
    }
  });
});
```

### 3. Inline Buttons with URL Parameters

```javascript
bot.onText(/\/book (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const barbershopId = match[1];
  
  await bot.sendMessage(chatId, "Sartaroshxonaga yozilish:", {
    reply_markup: {
      inline_keyboard: [
        [{ 
          text: "📅 Vaqt tanlash", 
          web_app: { url: `${WEB_APP_URL}/booking?shopId=${barbershopId}` } 
        }]
      ]
    }
  });
});
```

### 4. Combined Inline + Keyboard Buttons (Best Practice)

```javascript
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || "User";
  
  const welcomeMessage = `
Assalomu alaykum, ${firstName}! 👋

Toshkent Sartarosh botiga xush kelibsiz! 💈

🔹 Toshkent shahridagi eng yaxshi sartaroshxonalar
🔹 Online band qilish
🔹 Sharhlar va reytinglar
🔹 Telegram orqali xabarnomalar

Mini Appni ochish uchun quyidagi tugmani bosing! 👇
  `;
  
  // Send message with inline buttons
  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Mini App ni ochish", web_app: { url: WEB_APP_URL } }],
        [{ text: "📱 Yozilishlarim", web_app: { url: WEB_APP_URL + "/bookings" } }]
      ]
    }
  });
  
  // Also send keyboard for persistent access
  await bot.sendMessage(chatId, "Tez kirish uchun:", {
    reply_markup: {
      keyboard: [
        [{ text: "🚀 Mini App ni ochish", web_app: { url: WEB_APP_URL } }],
        [{ text: "💈 Sartaroshxonalar" }, { text: "🗓️ Yozilish" }],
        [{ text: "ℹ️ Ma'lumot" }]
      ],
      resize_keyboard: true
    }
  });
});
```

### 5. Context-Based Inline Buttons

```javascript
// When user creates a booking
async function sendBookingConfirmation(chatId, bookingId) {
  await bot.sendMessage(chatId, "✅ Yozilish tasdiqlandi!\n\nMini App orqali ko'ring:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📱 Yozilishni ko'rish", web_app: { url: `${WEB_APP_URL}/bookings/${bookingId}` } }],
        [{ text: "🏠 Bosh sahifa", web_app: { url: WEB_APP_URL } }]
      ]
    }
  });
}

// When sending notification
async function sendNotification(chatId, message) {
  await bot.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Mini App ni ochish", web_app: { url: WEB_APP_URL } }]
      ]
    }
  });
}
```

## 🎨 Button Layout Options

### Horizontal Layout (2 buttons per row)

```javascript
reply_markup: {
  inline_keyboard: [
    [
      { text: "Button 1", web_app: { url: WEB_APP_URL + "/page1" } },
      { text: "Button 2", web_app: { url: WEB_APP_URL + "/page2" } }
    ],
    [
      { text: "Button 3", web_app: { url: WEB_APP_URL + "/page3" } },
      { text: "Button 4", web_app: { url: WEB_APP_URL + "/page4" } }
    ]
  ]
}
```

### Vertical Layout (1 button per row)

```javascript
reply_markup: {
  inline_keyboard: [
    [{ text: "Button 1", web_app: { url: WEB_APP_URL + "/page1" } }],
    [{ text: "Button 2", web_app: { url: WEB_APP_URL + "/page2" } }],
    [{ text: "Button 3", web_app: { url: WEB_APP_URL + "/page3" } }]
  ]
}
```

## 🔒 Security Best Practices

### 1. Always Validate initData on Backend

```javascript
import crypto from "crypto";

function validateTelegramWebAppData(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  
  if (!hash) return false;
  
  urlParams.delete('hash');
  
  const dataCheckArray = [];
  for (const [key, value] of Array.from(urlParams.entries()).sort()) {
    dataCheckArray.push(`${key}=${value}`);
  }
  const dataCheckString = dataCheckArray.join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}
```

### 2. Check Auth Timestamp

```javascript
function checkAuthTimestamp(initData) {
  const urlParams = new URLSearchParams(initData);
  const authDate = urlParams.get('auth_date');
  
  if (!authDate) return false;
  
  const authTimestamp = parseInt(authDate, 10);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const timeDiff = currentTimestamp - authTimestamp;
  
  // Valid for 1 hour (3600 seconds)
  return timeDiff < 3600;
}
```

## 📱 Frontend Implementation

### Check for User Data

```typescript
import { getTelegramWebApp } from "@/lib/telegram";

function initTelegramApp() {
  const tg = getTelegramWebApp();
  
  if (!tg) {
    console.error("Telegram WebApp SDK not found!");
    return;
  }
  
  tg.ready();
  tg.expand();
  
  // Get user data
  const user = tg.initDataUnsafe?.user;
  
  if (!user) {
    // Show error modal
    alert("Please open this app from Telegram bot Mini App button");
    return;
  }
  
  // Send to backend with initData for validation
  fetch("/api/auth/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      telegramId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      initData: tg.initData // For HMAC validation
    })
  });
}
```

## 🧪 Testing

### Test Bot Locally

```javascript
// Add test command
bot.onText(/\/test/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(chatId, "Test Mini App:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🧪 Open Test App", web_app: { url: "http://localhost:5000" } }]
      ]
    }
  });
});
```

### Debug Inline Buttons

```javascript
bot.on("message", (msg) => {
  console.log("Message received:", {
    chatId: msg.chat.id,
    text: msg.text,
    from: msg.from?.username
  });
});

bot.on("web_app_data", (msg) => {
  console.log("Web App Data received:", msg.web_app_data);
});
```

## 🎯 Complete Working Example

```javascript
import TelegramBot from "node-telegram-bot-api";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || "https://your-app.com";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Start command with inline buttons
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || "User";
  
  const welcomeMessage = `
Hello, ${firstName}! 👋

Welcome to Barbershop Bot! 💈

Click the button below to open Mini App:
  `;
  
  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Open Mini App", web_app: { url: WEB_APP_URL } }]
      ]
    }
  });
});

// Menu command
bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;
  
  await bot.sendMessage(chatId, "Choose an option:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🏠 Home", web_app: { url: WEB_APP_URL } }],
        [{ text: "📱 My Bookings", web_app: { url: WEB_APP_URL + "/bookings" } }],
        [{ text: "👤 Profile", web_app: { url: WEB_APP_URL + "/profile" } }]
      ]
    }
  });
});

// Error handling
bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

console.log("✅ Bot is running...");
```

## 🔗 Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Web Apps Documentation](https://core.telegram.org/bots/webapps)
- [node-telegram-bot-api GitHub](https://github.com/yagop/node-telegram-bot-api)

## ⚠️ Common Issues

### Issue 1: User Data Not Available
**Solution:** Ensure users open the Mini App ONLY via inline button or keyboard button with `web_app` parameter.

### Issue 2: initData Validation Fails
**Solution:** Check that bot token is correct and initData is sent exactly as received from Telegram SDK.

### Issue 3: Buttons Not Working
**Solution:** Verify that `web_app` URL is HTTPS (not HTTP) in production, and the domain is registered with @BotFather.

## ✅ Checklist

- [ ] Bot token configured
- [ ] Mini App URL set correctly (HTTPS in production)
- [ ] Domain registered with @BotFather (`/setmenubutton`)
- [ ] Inline buttons implemented
- [ ] Backend validates initData with HMAC SHA-256
- [ ] Frontend checks for user data
- [ ] Error handling implemented
- [ ] Tested in Telegram app

## 📞 Support

If you have issues, check:
1. Bot token is correct
2. Mini App URL is correct and accessible
3. Domain is registered with @BotFather
4. Users are opening from bot inline button
5. Backend validation is working

---

**Happy coding! 🚀**
