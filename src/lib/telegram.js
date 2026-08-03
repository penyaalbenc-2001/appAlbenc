export async function sendTelegramMessage(text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('Telegram credentials are not set in environment variables.');
    return false;
  }

  const messageWithHeader = `<b>NOVETATS - PENYA ALBENC</b>\n\n${text}`;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageWithHeader,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending Telegram message:', errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to communicate with Telegram API:', error);
    return false;
  }
}
