import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Send notification when new booking is created
export const sendBookingNotification = async (booking, barberTelegramId) => {
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
    }
    
    // Send to barber if they have telegram_id
    if (barberTelegramId) {
      await bot.sendMessage(barberTelegramId, message);
    }
  } catch (error) {
    console.error('Error sending booking notification:', error);
  }
};

// Send notification when booking status changes
export const sendStatusNotification = async (booking, status) => {
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
  } catch (error) {
    console.error('Error sending status notification:', error);
  }
};

// Bot commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  bot.sendMessage(chatId, `Assalomu alaykum, ${firstName}! 👋

🏪 CutSpace - Toshkent shahridagi eng yaxshi sartaroshxona.

📱 Ilova manzili: http://localhost:5173/

Development rejimida ishlamoqda.`);
});

bot.on('polling_error', (error) => {
  console.log('Polling error:', error);
});

console.log('🤖 Telegram bot started');

export default bot;

