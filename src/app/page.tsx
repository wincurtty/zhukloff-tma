'use client';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { user, profile } = useTelegram();
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
    }
  }, [profile?.id]);

  const fetchStats = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, budget')
        .eq('client_id', profile.id);

      if (error) throw error;

      const activeOrders = orders.filter(o => 
        ['brief_received', 'in_progress', 'review'].includes(o.status)
      ).length;
      
      const completedOrders = orders.filter(o => 
        o.status === 'completed'
      ).length;
      
      const totalBudget = orders
        .filter(o => o.budget)
        .reduce((sum, order) => sum + (order.budget || 0), 0);

      setStats({
        activeOrders,
        completedOrders,
        totalBudget,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const displayStats = [
    { label: 'Активные заказы', value: stats.activeOrders.toString(), change: '+0' },
    { label: 'Выполнено', value: stats.completedOrders.toString(), change: '+0' },
    { label: 'Общий бюджет', value: `${Math.round(stats.totalBudget / 1000)}K ₽`, change: '+0%' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <h1 className="text-2xl font-bold mb-2">
          Добро пожаловать{user?.first_name ? `, ${user.first_name}` : ''}! 👋
        </h1>
        <p className="text-text-secondary">
          Я создаю цифровые продукты, которые решают бизнес-задачи и восхищают пользователей.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        {displayStats.map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div className="text-text-secondary text-sm mb-1">{stat.label}</div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-lg font-bold mb-4">Быстрые действия</h2>
        <div className="space-y-3">
          <Link
            href="/portfolio"
            className="block w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform text-center"
          >
            🎨 Посмотреть портфолио
          </Link>
          <Link
            href="/order"
            className="block w-full border border-border font-medium py-3 px-4 rounded-lg hover:bg-hover active:scale-95 transition-transform text-center"
          >
            📋 Новый заказ
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}

// Компонент последней активности
function RecentActivity() {
  const { profile } = useTelegram();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.id) {
      fetchRecentOrders();
    }
  }, [profile?.id]);

  const fetchRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentOrders(data || []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress': return '🔵';
      case 'review': return '🟣';
      case 'completed': return '🟢';
      default: return '⚪';
    }
  };

  if (recentOrders.length === 0) {
    return null;
  }

  return (
    <section className="bg-card rounded-xl p-6 border border-border">
      <h2 className="text-lg font-bold mb-4">Последняя активность</h2>
      <div className="space-y-3">
        {recentOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="text-sm">{getStatusIcon(order.status)}</div>
              <span className="text-text-secondary text-sm">{order.title}</span>
            </div>
            <span className="text-text-subtle text-xs">
              {new Date(order.created_at).toLocaleDateString('ru-RU')}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}