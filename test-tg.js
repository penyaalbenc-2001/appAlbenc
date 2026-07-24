// Removed dotenv

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log('Token:', botToken ? 'Exists' : 'Missing');
console.log('ChatId:', chatId ? 'Exists' : 'Missing');

async function test() {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '¡Hola! Este es un mensaje de prueba de la app 🚀',
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending Telegram message:', errorData);
    } else {
      console.log('Message sent successfully!');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
