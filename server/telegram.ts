import TelegramBot from "node-telegram-bot-api";
import type { Booking, Barbershop } from "@shared/schema";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8555285589:AAEEaVbjFtXCRa54_VSxLIhTx6Pqy5f9bZc";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";
const WEB_APP_URL = process.env.WEB_APP_URL || process.env.RENDER_EXTERNAL_URL || "https://cutspace.onrender.com";

let bot: TelegramBot | null = null;

// Bot ni ishga tushirish
export function initializeTelegramBot() {
  if (bot) {
    console.log("⚠️ Bot allaqachon ishga tushgan");
    return;
  }

  // Production da faqat bitta instance ishlashi uchun
  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER;
  
  try {
    // Polling konfiguratsiyasi
    bot = new TelegramBot(BOT_TOKEN, {
      polling: {
        interval: 300,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });
    
    // Production da polling error ni ignore qilish
    if (isProduction) {
      bot.on('polling_error', (error) => {
        // 409 Conflict - boshqa instance ishlayapti, bu normal
        if (error.message.includes('409')) {
          console.log("ℹ️ Bot polling: boshqa instance ishlayapti (normal)");
          return;
        }
        console.error('❌ Polling xatolik:', error.message);
      });
    }
    
    console.log("🤖 Telegram Bot ishga tushmoqda...");
    
    // Bot tayyor bo'lganda
    bot.on('polling_error', (error) => {
      console.error('❌ Polling xatolik:', error.message);
    });

    bot.on('error', (error) => {
      console.error('❌ Bot xatolik:', error.message);
    });
    
    // /start command
    bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || "Mehmon";
      
      const welcomeMessage = `
Assalomu alaykum, ${firstName}! 👋

Toshkent Sartarosh botiga xush kelibsiz! 💈

🔹 Toshkent shahridagi eng yaxshi sartaroshxonalar
🔹 Online band qilish
🔹 Sharhlar va reytinglar
🔹 Telegram orqali xabarnomalar

Mini Appni ochish uchun quyidagi tugmani bosing! 👇
      `;
      
      // Send message with BOTH inline and keyboard buttons
      bot?.sendMessage(chatId, welcomeMessage, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 Mini App ni ochish", web_app: { url: WEB_APP_URL } }],
            [{ text: "📱 Yozilishlarim", web_app: { url: WEB_APP_URL + "/bookings" } }]
          ]
        }
      }).then(() => {
        // Also send keyboard for easy access
        bot?.sendMessage(chatId, "Tez kirish uchun:", {
          reply_markup: {
            keyboard: [
              [{ text: "🚀 Mini App ni ochish", web_app: { url: WEB_APP_URL } }],
              [{ text: "💈 Sartaroshxonalar" }, { text: "🗓️ Yozilish" }],
              [{ text: "ℹ️ Ma'lumot" }, { text: "📞 Bog'lanish" }]
            ],
            resize_keyboard: true
          }
        });
        console.log(`✅ /start yuborildi: ${firstName} (${chatId})`);
      }).catch(err => {
        console.error("❌ Xabar yuborishda xatolik:", err.message);
      });
    });
    
    // /help command
    bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      
      const helpMessage = `
📖 Yordam

🔸 /start - Botni qayta ishga tushirish
🔸 /help - Yordam olish
🔸 /mybookings - Mening yozilishlarim
🔸 /shops - Sartaroshxonalar ro'yxati

Mini App orqali:
- Sartaroshxonalarni ko'rish
- Online band qilish
- Sharh qoldirish
- Yozilishlarni boshqarish
      `;
      
      bot?.sendMessage(chatId, helpMessage);
    });
    
    // /mybookings command
    bot.onText(/\/mybookings/, async (msg) => {
      const chatId = msg.chat.id;
      
      bot?.sendMessage(chatId, "Sizning yozilishlaringizni ko'rish uchun Mini App ni oching:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📱 Mini App ochish", web_app: { url: WEB_APP_URL + "/bookings" } }]
          ]
        }
      });
    });
    
    // /shops command
    bot.onText(/\/shops/, async (msg) => {
      const chatId = msg.chat.id;
      
      bot?.sendMessage(chatId, "Barcha sartaroshxonalarni ko'rish:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💈 Sartaroshxonalar", web_app: { url: WEB_APP_URL } }]
          ]
        }
      });
    });
    
    // Menu buttons
    bot.on("message", async (msg) => {
      const chatId = msg.chat.id;
      
      if (msg.text === "💈 Sartaroshxonalar") {
        const shopsMessage = `
💈 Bizning Sartaroshxonalar:

1️⃣ **Premium Barber Shop**
📍 Amir Temur ko'chasi 15, Yunusobod
⭐ Reyting: 4.8
💰 Soch olish - 50,000 so'm

2️⃣ **Classic Barber**
📍 Mustaqillik ko'chasi 42, Mirobod
⭐ Reyting: 4.6
💰 Soch olish - 45,000 so'm

3️⃣ **Modern Style Barber**
📍 Buyuk Ipak Yo'li 88, Shayxontohur
⭐ Reyting: 4.9
💰 Soch olish - 60,000 so'm

🌐 To'liq ma'lumot: ${WEB_APP_URL}
        `;
        bot?.sendMessage(chatId, shopsMessage, { parse_mode: "Markdown" });
        
      } else if (msg.text === "🗓️ Yozilish") {
        bot?.sendMessage(chatId, `
🗓️ Yozilish uchun:

1. Web saytimizga kiring: ${WEB_APP_URL}
2. Sartaroshxonani tanlang
3. Qulay vaqtni belgilang
4. Tasdiqlang!

📱 Yoki telefon orqali: +998 90 123 45 67
        `);
        
      } else if (msg.text === "ℹ️ Ma'lumot") {
        bot?.sendMessage(chatId, `
ℹ️ Loyiha haqida

Toshkent Sartarosh - Toshkent shahridagi sartaroshxonalarga online yozilish tizimi.

✨ Funksiyalar:
• 3+ sartaroshxona
• Online band qilish
• Reyting va sharhlar
• Telegram xabarnomalar

🌐 Web: ${WEB_APP_URL}
📱 Bot: @Baarbershopp_bot

Version: 1.0.0
        `);
        
      } else if (msg.text === "📞 Bog'lanish") {
        bot?.sendMessage(chatId, `
📞 Bog'lanish

📧 Email: support@toshkentsartarosh.uz
📱 Telegram: @toshkentsartarosh
🌐 Website: ${WEB_APP_URL}

☎️ Telefon: +998 90 123 45 67

Ish vaqti: 9:00 - 21:00
Har kuni
        `);
      }
    });
    
    // Test connection
    bot.getMe().then((botInfo) => {
      console.log(`✅ Bot tayyor: @${botInfo.username}`);
      console.log(`📱 Bot ID: ${botInfo.id}`);
      console.log(`🔗 Mini App URL: ${WEB_APP_URL}`);
    }).catch(err => {
      console.error("❌ Bot ulanishda xatolik:", err.message);
    });
    
  } catch (error: any) {
    console.error("❌ Telegram bot initialization failed:", error.message);
    bot = null;
  }
}

export async function sendTelegramNotification(
  booking: Booking,
  barbershop: Barbershop
): Promise<void> {
  if (!bot) {
    console.log("Telegram bot not initialized, skipping notification");
    return;
  }

  const message = `
🆕 Yangi Yozilish!

👤 Mijoz: ${booking.customerName}
💈 Sartaroshxona: ${barbershop.name}
✂️ Xizmat: ${booking.service}
📅 Sana: ${booking.date}
🕐 Vaqt: ${booking.time}

Booking ID: ${booking.id}
`;

  try {
    // If CHAT_ID is not set, log the message instead
    if (!CHAT_ID) {
      console.log("📱 Telegram notification (CHAT_ID not configured):");
      console.log(message);
      return;
    }

    await bot.sendMessage(CHAT_ID, message);
    console.log("✅ Telegram notification sent successfully");
  } catch (error) {
    console.error("❌ Failed to send Telegram notification:", error);
  }
}
