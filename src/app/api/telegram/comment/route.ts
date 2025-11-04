import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

export async function POST(request: Request) {
  try {
    const { order_id, comment, client_name } = await request.json();

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_ADMIN_CHAT_ID) {
      return NextResponse.json({ success: true });
    }

    const message = `💬 *Новый комментарий в заказе*

👤 *От:* ${client_name}
📝 *Сообщение:* ${comment}
🆔 *ID заказа:* ${order_id}

_Ответьте клиенту в приложении_`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending comment notification:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}