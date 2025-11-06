import TelegramBot from "node-telegram-bot-api";
import type { Booking, Barbershop } from "@shared/schema";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8555285589:AAEEaVbjFtXCRa54_VSxLIhTx6Pqy5f9bZc";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || ""; // User should provide their chat ID

let bot: TelegramBot | null = null;

try {
  bot = new TelegramBot(BOT_TOKEN, { polling: false });
} catch (error) {
  console.warn("Telegram bot initialization failed:", error);
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
