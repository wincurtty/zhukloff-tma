'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webApp, setWebApp] = useState<any>(null);

  useEffect(() => {
    let backButtonCallback: (() => void) | null = null;

    const initTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tgWebApp = window.Telegram.WebApp;
        setWebApp(tgWebApp);

        // Инициализируем WebApp
        tgWebApp.ready();
        tgWebApp.expand();

        // Получаем данные пользователя
        const tgUser = tgWebApp.initDataUnsafe?.user;
        if (tgUser && tgUser.id && tgUser.first_name) {
          const userData: TelegramUser = {
            id: tgUser.id,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
            username: tgUser.username,
            language_code: tgUser.language_code,
            is_premium: tgUser.is_premium,
          };
          setUser(userData);
          syncUserWithSupabase(userData);
        } else {
          setIsLoading(false);
        }

        // Настраиваем кнопку "Назад"
        tgWebApp.BackButton.show();
        backButtonCallback = () => {
          window.history.back();
        };
        tgWebApp.BackButton.onClick(backButtonCallback);
      } else {
        // Если не в Telegram, просто завершаем загрузку
        setIsLoading(false);
      }
    };

    initTelegram();

    // Cleanup function
    return () => {
      if (backButtonCallback && window.Telegram?.WebApp) {
        window.Telegram.WebApp.BackButton.offClick(backButtonCallback);
      }
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', tgUser.id)
          .single();
        
        setProfile(profile);
      }
    } catch (error) {
      console.error('Failed to sync user with Supabase:', error);
    } finally {
      setIsLoading(false);
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
    openLink
  };
}