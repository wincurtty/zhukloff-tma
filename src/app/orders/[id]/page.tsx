'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase, Order, OrderStage } from '@/lib/supabase';
import OrderTracker from '@/components/OrderTracker';
import Link from 'next/link';
import OrderComments from '@/components/OrderComments';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useTelegram();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [stages, setStages] = useState<OrderStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.id && params.id) {
      fetchOrderData();
      
      // Realtime подписка на изменения заказа
      const subscription = supabase
        .channel('order-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${params.id}`,
          },
          (payload) => {
            if (payload.eventType === 'UPDATE') {
              setOrder(payload.new as Order);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'order_stages',
            filter: `order_id=eq.${params.id}`,
          },
          () => {
            fetchStages();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [profile?.id, params.id]);

  const fetchOrderData = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .eq('client_id', profile.id)
        .single();

      if (orderError) throw orderError;
      if (!orderData) {
        router.push('/orders');
        return;
      }

      setOrder(orderData);
      await fetchStages();
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStages = async () => {
    try {
      const { data, error } = await supabase
        .from('order_stages')
        .select('*')
        .eq('order_id', params.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setStages(data || []);
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-border rounded w-1/3"></div>
          <div className="h-4 bg-border rounded w-2/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-border rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Заказ не найден</h1>
        <Link href="/orders" className="text-blue-400 hover:underline">
          Вернуться к заказам
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Хедер */}
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/orders"
          className="text-text-subtle hover:text-text-primary text-2xl"
        >
          ←
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{order.title}</h1>
          <p className="text-text-secondary">
            #{order.id.slice(0, 8)} · Создан {new Date(order.created_at).toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>

      {/* Описание */}
      {order.description && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-medium text-text-primary mb-2">Описание проекта</h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            {order.description}
          </p>
        </div>
      )}

      {/* Детали заказа */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-text-secondary mb-1">Бюджет</div>
          <div className="text-text-primary font-medium">
            {order.budget ? `${order.budget.toLocaleString('ru-RU')} ₽` : 'Не указан'}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-text-secondary mb-1">Дедлайн</div>
          <div className="text-text-primary font-medium">
            {order.deadline ? new Date(order.deadline).toLocaleDateString('ru-RU') : 'Не указан'}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-text-secondary mb-1">Тип услуги</div>
          <div className="text-text-primary font-medium capitalize">
            {order.service_type || 'Не указан'}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-text-secondary mb-1">Обновлен</div>
          <div className="text-text-primary font-medium">
            {new Date(order.updated_at).toLocaleDateString('ru-RU')}
          </div>
        </div>
      </div>

      {/* Визуальный трекер */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6">📊 Прогресс выполнения</h2>
        <OrderTracker order={order} stages={stages} />
      </div>

      {/* Быстрые действия */}
      <div className="flex gap-3">
        <button className="flex-1 bg-white text-black py-3 px-4 rounded-lg font-medium hover:bg-gray-100 text-center">
          💬 Написать сообщение
        </button>
        <button className="flex-1 border border-border py-3 px-4 rounded-lg font-medium hover:bg-hover text-center">
          📎 Прикрепить файл
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl p-6">
        <OrderComments orderId={params.id as string} />
      </div>
    </div>
  );
}