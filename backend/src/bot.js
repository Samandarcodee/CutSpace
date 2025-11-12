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
    bot = new TelegramBot(botToken, { polling: true });
    console.log('✅ Telegram bot initialized successfully');
    
    // Bot commands
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from.first_name;
      
      bot.sendMessage(chatId, `Assalomu alaykum, ${firstName}! 👋

🏪 CutSpace - Toshkent shahridagi eng yaxshi sartaroshxona.

📱 Ilova manzili: https://your-app.onrender.com/

Bot ishlamoqda! ✅`);
    });

    bot.on('polling_error', (error) => {
      console.error('❌ Telegram bot polling error:', error.message);
      console.error('❌ Check your TELEGRAM_BOT_TOKEN in Render Environment Variables');
    });

    console.log('🤖 Telegram bot started and listening for commands');
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error.message);
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
