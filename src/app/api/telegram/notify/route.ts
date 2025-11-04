import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export async function POST(request: Request) {
  try {
    const { order_id, title, client_name, client_username } = await request.json();

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
      console.warn('Telegram bot token or chat ID not configured');
      return NextResponse.json({ success: true }); // Не падаем, если не настроено
    }

    const message = `🎯 *Новый заказ!*

📝 *Проект:* ${title}
👤 *Клиент:* ${client_name}${client_username ? ` (@${client_username})` : ''}
🆔 *ID заказа:* ${order_id}
⏰ *Время:* ${new Date().toLocaleString('ru-RU')}

_Не забудь связаться с клиентом в течение 24 часов_`;

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📋 Открыть заказ в админке',
                url: `https://YOUR_SUPABASE_URL/project/default/table/orders?id=eq.${order_id}`
              }
            ]
          ]
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}