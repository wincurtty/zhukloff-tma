'use client';
import { useEffect, useState } from 'react';
import { init, initData, backButton, viewport } from '@telegram-apps/sdk';
import { supabase } from '@/lib/supabase';

// Типы для Telegram Web App
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webApp, setWebApp] = useState<any>(null);

  useEffect(() => {
    // Инициализируем SDK
    init({ debug: true });
    viewport.expand();
    viewport.bindCssVars();

    // Сохраняем ссылку на WebApp для использования в других компонентах
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setWebApp(window.Telegram.WebApp);
    }

    // Получаем данные пользователя
    const tgUser = initData?.user as TelegramUser;
    if (tgUser) {
      setUser(tgUser);
      syncUserWithSupabase(tgUser);
    }
    
    setIsLoading(false);

    // Настраиваем кнопку "Назад"
    backButton.show();
    backButton.onClick(() => {
      window.history.back();
    });

    return () => {
      backButton.offClick();
    };
  }, []);

  const syncUserWithSupabase = async (tgUser: TelegramUser) => {
    try {
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: tgUser.id,
          username: tgUser.username,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
        }),
      });

      if (response.ok) {
        // Получаем профиль после синхронизации
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', tgUser.id)
          .single();
        
        setProfile(profile);
      }
    } catch (error) {
      console.error('Failed to sync user with Supabase:', error);
    }
  };

  const openLink = (url: string) => {
    if (webApp) {
      webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return { 
    user, 
    profile,
    webApp,
    isLoading,
    openLink,
    initData: initData 
  };
}