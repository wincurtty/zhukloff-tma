'use client';
import { useEffect, useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase, Order } from '@/lib/supabase';
import Link from 'next/link';

const statusConfig = {
  draft: { label: 'Черновик', color: 'text-text-subtle' },
  brief_received: { label: 'Бриф получен', color: 'text-blue-400' },
  in_progress: { label: 'В работе', color: 'text-yellow-400' },
  review: { label: 'На проверке', color: 'text-purple-400' },
  completed: { label: 'Завершен', color: 'text-green-400' },
  cancelled: { label: 'Отменен', color: 'text-red-400' },
};

export default function OrdersPage() {
  const { profile } = useTelegram();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchOrders();
      
      // Подписка на realtime обновления
      const subscription = supabase
        .channel('orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `client_id=eq.${profile.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setOrders(prev => [payload.new as Order, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setOrders(prev => 
                prev.map(order => 
                  order.id === payload.new.id ? payload.new as Order : order
                )
              );
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [profile?.id]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">📋 Мои заказы</h1>
        <div className="text-text-secondary text-center py-8">
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📋 Мои заказы</h1>
        <Link 
          href="/order"
          className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 active:scale-95 transition-transform"
        >
          + Новый
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Заказов пока нет
          </h3>
          <p className="text-text-secondary mb-6">
            Создайте ваш первый заказ и начнем работу!
          </p>
          <Link
            href="/order"
            className="inline-block bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100"
          >
            Создать заказ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-hover transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-text-primary flex-1 pr-4">
                  {order.title}
                </h3>
                <span className={`text-sm font-medium ${statusConfig[order.status].color}`}>
                  {statusConfig[order.status].label}
                </span>
              </div>
              
              {order.description && (
                <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                  {order.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-text-subtle">
                <span>Создан: {formatDate(order.created_at)}</span>
                {order.budget && (
                  <span className="font-medium text-text-secondary">
                    {order.budget.toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}