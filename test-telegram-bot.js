const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = "8555285589:AAEEaVbjFtXCRa54_VSxLIhTx6Pqy5f9bZc";
const WEB_APP_URL = "https://cutspace.onrender.com";

console.log("🤖 Testing Telegram Bot...");
console.log(`🔑 Token: ${BOT_TOKEN.substring(0, 10)}...`);
console.log(`🌐 Web App URL: ${WEB_APP_URL}`);

// Avval webhook-ni o'chirish
const deleteWebhookUrl = `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`;
fetch(deleteWebhookUrl)
  .then(res => res.json())
  .then(data => {
    console.log("✅ Webhook o'chirildi:", data);
  })
  .catch(err => console.error("❌ Webhook o'chirish xatoligi:", err));

// Bot yaratish
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("✅ Bot yaratildi");

// Bot ma'lumotlarini olish
bot.getMe().then(info => {
  console.log("✅ Bot ma'lumotlari:");
  console.log(`   - Username: @${info.username}`);
  console.log(`   - ID: ${info.id}`);
  console.log(`   - Ismi: ${info.first_name}`);
}).catch(err => {
  console.error("❌ Bot ma'lumotlarini olishda xatolik:", err.message);
});

// /start komandasi
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name || "Mehmon";
  
  console.log(`📨 /start komandasi olindi: ${firstName} (${chatId})`);
  
  const welcomeMessage = `Assalomu alaykum, ${firstName}! 👋

Toshkent Sartarosh botiga xush kelibsiz! 💈

🔹 Toshkent shahridagi eng yaxshi sartaroshxonalar
🔹 Online band qilish
🔹 Sharhlar va reytinglar
🔹 Telegram orqali xabarnomalar

Mini Appni ishga tushirish uchun quyidagi tugmani bosing! 👇`;
  
  try {
    await bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: {
        keyboard: [
          [{ text: "🚀 Mini App ni ochish", web_app: { url: WEB_APP_URL } }],
          [{ text: "💈 Sartaroshxonalar" }, { text: "🗓️ Yozilish" }],
          [{ text: "ℹ️ Ma'lumot" }, { text: "📞 Bog'lanish" }]
        ],
        resize_keyboard: true
      }
    });
    console.log(`✅ /start javobi yuborildi: ${firstName} (${chatId})`);
  } catch (err) {
    console.error("❌ Xabar yuborishda xatolik:", err.message);
  }
});

// Barcha xabarlarni kuzatish
bot.on('message', (msg) => {
  console.log(`📩 Xabar olindi: "${msg.text}" (${msg.from.first_name})`);
});

// Error handler
bot.on('polling_error', (error) => {
  console.error('❌ Polling xatolik:', error.message);
});

bot.on('error', (error) => {
  console.error('❌ Bot xatolik:', error.message);
});

console.log("✅ Bot ishga tushdi va komandalarni kutmoqda...");
console.log("🔄 Botga /start yuboring...");
