import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

// Check if bot token exists
const botToken = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

if (!botToken) {
  console.warn('⚠️  TELEGRAM_BOT_TOKEN environment variable is not set!');
  console.warn('⚠️  Bot will not work. Please set TELEGRAM_BOT_TOKEN in Render Environment Variables.');
  
  // Create a dummy bot object to prevent crashes
  bot = {
    sendMessage: async () => {
      console.warn('⚠️  Bot not initialized - cannot send message');
    },
    onText: () => {},
    on: () => {}
  };
} else {
  try {
    console.log('🔄 Initializing Telegram bot...');
    bot = new TelegramBot(botToken, { 
      polling: {
        interval: 1000,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });
    
    console.log('✅ Telegram bot initialized successfully');
    
    // Bot commands - /start
    bot.onText(/\/start/, async (msg) => {
      try {
        const chatId = msg.chat.id;
        const firstName = msg.from?.first_name || 'Foydalanuvchi';
        
        console.log(`📥 /start command received from chat ${chatId}`);
        
        const welcomeMessage = `Assalomu alaykum, ${firstName}! 👋

🏪 CutSpace - Toshkent shahridagi eng yaxshi sartaroshxona.

📱 Ilova manzili: https://your-app.onrender.com/

Bot ishlamoqda! ✅

Quyidagi buyruqlar mavjud:
/start - Botni qayta ishga tushirish
/help - Yordam`;

        await bot.sendMessage(chatId, welcomeMessage);
        console.log(`✅ Welcome message sent to chat ${chatId}`);
      } catch (error) {
        console.error('❌ Error handling /start command:', error.message);
      }
    });

    // Bot commands - /help
    bot.onText(/\/help/, async (msg) => {
      try {
        const chatId = msg.chat.id;
        const helpMessage = `📖 Yordam

🏪 CutSpace bot orqali siz:
- Sartaroshxonalarni ko'rishingiz mumkin
- Band qilishingiz mumkin
- Bandingiz holatini kuzatishingiz mumkin

📱 Ilova: https://your-app.onrender.com/`;

        await bot.sendMessage(chatId, helpMessage);
        console.log(`✅ Help message sent to chat ${chatId}`);
      } catch (error) {
        console.error('❌ Error handling /help command:', error.message);
      }
    });

    // Handle all messages (for debugging)
    bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;
      console.log(`📨 Message received from chat ${chatId}: ${text}`);
    });

    // Error handlers
    bot.on('polling_error', (error) => {
      console.error('❌ Telegram bot polling error:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Check your TELEGRAM_BOT_TOKEN in Render Environment Variables');
    });

    bot.on('error', (error) => {
      console.error('❌ Telegram bot error:', error.message);
    });

    console.log('🤖 Telegram bot started and listening for commands');
    console.log('📋 Bot is ready to receive /start and /help commands');
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Please check your TELEGRAM_BOT_TOKEN in Render Environment Variables');
    
    // Create a dummy bot object to prevent crashes
    bot = {
      sendMessage: async () => {
        console.warn('⚠️  Bot not initialized - cannot send message');
      },
      onText: () => {},
      on: () => {}
    };
  }
}

// Send notification when new booking is created
export const sendBookingNotification = async (booking, barberTelegramId) => {
  if (!botToken || !bot) {
    console.warn('⚠️  Bot not initialized - skipping notification');
    return;
  }

  const message = `🔔 Yangi band qilish!

👤 Mijoz: ${booking.client_name}
📅 Sana: ${booking.booking_date}
⏰ Vaqt: ${booking.booking_time}
📍 ID: #${booking.id}

Sartarosh paneliga o'ting va javob bering.`;

  try {
    // Send to admin (if set)
    if (process.env.ADMIN_TELEGRAM_ID) {
      await bot.sendMessage(process.env.ADMIN_TELEGRAM_ID, message);
      console.log('✅ Booking notification sent to admin');
    }
    
    // Send to barber if they have telegram_id
    if (barberTelegramId) {
      await bot.sendMessage(barberTelegramId, message);
      console.log('✅ Booking notification sent to barber');
    }
  } catch (error) {
    console.error('❌ Error sending booking notification:', error.message);
  }
};

// Send notification when booking status changes
export const sendStatusNotification = async (booking, status) => {
  if (!botToken || !bot) {
    console.warn('⚠️  Bot not initialized - skipping notification');
    return;
  }

  let message = '';
  
  if (status === 'accepted') {
    message = `✅ Sizning bandingiz tasdiqlandi!

📅 Sana: ${booking.booking_date}
⏰ Vaqt: ${booking.booking_time}
👨‍🦱 Sartarosh: ${booking.barber_name}

Ko'rishguncha!`;
  } else if (status === 'rejected') {
    message = `❌ Afsus, bandingiz qabul qilinmadi

📅 Sana: ${booking.booking_date}
⏰ Vaqt: ${booking.booking_time}
👨‍🦱 Sartarosh: ${booking.barber_name}

Iltimos, boshqa vaqtni tanlang.`;
  }

  try {
    await bot.sendMessage(booking.client_telegram_id, message);
    console.log('✅ Status notification sent to client');
  } catch (error) {
    console.error('❌ Error sending status notification:', error.message);
  }
};

export default bot;
