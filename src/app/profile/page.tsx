'use client';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserStats {
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  activeOrders: number;
}

export default function ProfilePage() {
  const { user, profile, openLink } = useTelegram();
  const [stats, setStats] = useState<UserStats>({
    totalOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    activeOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchProfileData();
    } else if (!profile && !isLoading) {
      // Если профиль не загружен, но загрузка завершена
      setIsLoading(false);
    }
  }, [profile?.id, isLoading]);

  const fetchProfileData = async () => {
    try {
      // Получаем статистику по заказам
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalOrders = orders?.length || 0;
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
      const activeOrders = orders?.filter(o => 
        ['brief_received', 'in_progress', 'review'].includes(o.status)
      ).length || 0;
      const totalSpent = orders
        ?.filter(o => o.budget && o.status === 'completed')
        .reduce((sum, order) => sum + (order.budget || 0), 0) || 0;

      setStats({
        totalOrders,
        completedOrders,
        activeOrders,
        totalSpent,
      });

      setRecentOrders(orders?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-blue-400';
      case 'review': return 'text-purple-400';
      default: return 'text-text-subtle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик';
      case 'brief_received': return 'Бриф получен';
      case 'in_progress': return 'В работе';
      case 'review': return 'На проверке';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">👤 Профиль</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-border rounded-xl"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-border rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">👤 Профиль</h1>
        <p className="text-text-secondary">
          Ваша статистика и настройки
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-black">
          {user?.first_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-1">
          {user?.first_name || 'Пользователь'} {user?.last_name || ''}
        </h2>
        {user?.username && (
          <p className="text-text-secondary mb-3">@{user.username}</p>
        )}
        <div className="text-xs text-text-subtle">
          ID: {user?.id ? user.id.toString() : 'Неизвестно'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {stats.totalOrders}
          </div>
          <div className="text-text-secondary text-sm">Всего заказов</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {stats.completedOrders}
          </div>
          <div className="text-text-secondary text-sm">Завершено</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {stats.activeOrders}
          </div>
          <div className="text-text-secondary text-sm">Активных</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-text-primary mb-1">
            {Math.round(stats.totalSpent / 1000)}K
          </div>
          <div className="text-text-secondary text-sm">Потрачено</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-bold text-text-primary mb-4">📋 Последние заказы</h3>
        {recentOrders.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-text-secondary mb-3">Заказов пока нет</p>
            <Link
              href="/order"
              className="inline-block bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
            >
              Создать первый заказ
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block p-3 border border-border rounded-lg hover:border-hover transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-text-primary text-sm truncate flex-1 mr-2">
                    {order.title}
                  </h4>
                  <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-text-subtle">
                  <span>
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </span>
                  {order.budget && (
                    <span className="font-medium">
                      {order.budget.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                </div>
              </Link>
            ))}
            <Link
              href="/orders"
              className="block text-center text-text-secondary text-sm py-2 border border-dashed border-border rounded-lg hover:border-hover transition-colors"
            >
              Показать все заказы →
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-bold text-text-primary mb-4">⚡ Быстрые действия</h3>
        <div className="space-y-3">
          <Link
            href="/order"
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-hover transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                📋
              </div>
              <span className="font-medium">Новый заказ</span>
            </div>
            <div className="text-text-subtle group-hover:text-text-primary">→</div>
          </Link>
          
          <Link
            href="/portfolio"
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-hover transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                🎨
              </div>
              <span className="font-medium">Портфолио</span>
            </div>
            <div className="text-text-subtle group-hover:text-text-primary">→</div>
          </Link>

          <button
            onClick={() => openLink('https://t.me/zhukloff')}
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-hover transition-colors group w-full"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                💬
              </div>
              <span className="font-medium">Написать в Telegram</span>
            </div>
            <div className="text-text-subtle group-hover:text-text-primary">→</div>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center text-text-subtle text-xs space-y-1">
        <div>Zhukloff | Creative Designer</div>
        <div>Версия 1.0.0</div>
        <div>Сделано с ❤️ для клиентов</div>
      </div>
    </div>
  );
}