'use client';
import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export function useTelegram() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tgWebApp = window.Telegram.WebApp;
        
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
          };
          setUser(userData);
          // Временно отключаем синхронизацию с Supabase
          setTimeout(() => setIsLoading(false), 500);
        } else {
          setIsLoading(false);
        }

        // Настройка кнопки "Назад"
        tgWebApp.BackButton.show();
        tgWebApp.BackButton.onClick(() => {
          window.history.back();
        });
      } else {
        setIsLoading(false);
      }
    };

    initTelegram();
  }, []);

  const openLink = (url: string) => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return { 
    user, 
    profile,
    isLoading,
    openLink
  };
}