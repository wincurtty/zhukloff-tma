'use client';
import { useEffect, useState } from 'react';
import { init, initData, backButton, viewport } from '@telegram-apps/sdk';
import { supabase } from '@/lib/supabase';

export function useTelegram() {
  const [user, setUser] = useState<initData['user'] | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    init({ debug: true });
    viewport.expand();
    viewport.bindCssVars();

    const tgUser = initData?.user;
    if (tgUser) {
      setUser(tgUser);
      syncUserWithSupabase(tgUser);
    }
    
    setIsLoading(false);

    backButton.show();
    backButton.onClick(() => {
      window.history.back();
    });

    return () => {
      backButton.offClick();
    };
  }, []);

  const syncUserWithSupabase = async (tgUser: initData['user']) => {
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

  return { 
    user, 
    profile,
    isLoading,
    initData: initData 
  };
}