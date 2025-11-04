import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { telegram_id, username, first_name, last_name } = await request.json();

    // Проверяем, существует ли пользователь
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_id', telegram_id)
      .single();

    if (existingUser) {
      // Обновляем существующего пользователя
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          first_name,
          last_name,
          updated_at: new Date().toISOString(),
        })
        .eq('telegram_id', telegram_id);

      if (error) throw error;
    } else {
      // Создаем нового пользователя
      const { error } = await supabase
        .from('profiles')
        .insert({
          telegram_id,
          username,
          first_name,
          last_name,
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}