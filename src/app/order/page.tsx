'use client';
import { useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const serviceTypes = [
  { id: 'web_design', name: '🌐 Веб-дизайн', description: 'Лендинги, корпоративные сайты' },
  { id: 'ui_ux', name: '🎨 UI/UX Дизайн', description: 'Интерфейсы для приложений и сервисов' },
  { id: 'branding', name: '🏢 Брендинг', description: 'Логотипы, айдентика, гайдлайны' },
  { id: 'other', name: '💼 Другое', description: 'Индивидуальный проект' },
];

export default function OrderPage() {
  const { user, profile } = useTelegram();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service_type: '' as string,
    budget: '',
    deadline: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      alert('Ошибка: профиль не найден');
      return;
    }

    setIsLoading(true);

    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          client_id: profile.id,
          title: formData.title,
          description: formData.description,
          service_type: formData.service_type || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          deadline: formData.deadline || null,
          status: 'brief_received',
        })
        .select()
        .single();

      if (error) throw error;

      // Создаем стандартные этапы для заказа
      const stages = [
        { name: 'Обсуждение брифа', order_index: 0 },
        { name: 'Анализ и исследование', order_index: 1 },
        { name: 'Концепция и скетчи', order_index: 2 },
        { name: 'Дизайн и визуализация', order_index: 3 },
        { name: 'Презентация и правки', order_index: 4 },
        { name: 'Финальная сдача', order_index: 5 },
      ];

      await supabase
        .from('order_stages')
        .insert(
          stages.map(stage => ({
            order_id: order.id,
            name: stage.name,
            order_index: stage.order_index,
          }))
        );

      // Отправляем уведомление в Telegram (создадим позже)
      await sendTelegramNotification(order);

      alert('Заказ успешно создан! Скоро свяжусь с вами.');
      router.push('/orders');
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Ошибка при создании заказа');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTelegramNotification = async (order: any) => {
  try {
    await fetch('/api/telegram/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: order.id,
        title: order.title,
        client_name: user?.first_name,
        client_username: user?.username,
      }),
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">📋 Новый заказ</h1>
      <p className="text-text-secondary mb-6">
        Опишите ваш проект, и я свяжусь с вами в течение 24 часов
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Название проекта */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-2">
            Название проекта *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full p-4 bg-card border border-border rounded-xl text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
            placeholder="Например: Лендинг для стартапа"
            required
          />
        </div>

        {/* Тип услуги */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Тип услуги
          </label>
          <div className="grid grid-cols-2 gap-3">
            {serviceTypes.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleInputChange('service_type', service.id)}
                className={`p-4 border rounded-xl text-left transition-all ${
                  formData.service_type === service.id
                    ? 'border-white bg-white/10'
                    : 'border-border bg-card hover:border-hover'
                }`}
              >
                <div className="font-medium text-text-primary mb-1">
                  {service.name}
                </div>
                <div className="text-xs text-text-subtle">
                  {service.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Описание */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">
            Описание проекта *
          </label>
          <textarea
            id="description"
            rows={5}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full p-4 bg-card border border-border rounded-xl text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent resize-none"
            placeholder="Опишите цели проекта, целевую аудиторию, примеры которые нравятся, особые требования..."
            required
          />
        </div>

        {/* Бюджет и дедлайн */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-text-secondary mb-2">
              Бюджет (₽)
            </label>
            <input
              type="number"
              id="budget"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className="w-full p-4 bg-card border border-border rounded-xl text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
              placeholder="25000"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-text-secondary mb-2">
              Желаемый срок
            </label>
            <input
              type="date"
              id="deadline"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className="w-full p-4 bg-card border border-border rounded-xl text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
            />
          </div>
        </div>

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={isLoading || !formData.title || !formData.description}
          className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? 'Создаем заказ...' : '🎯 Создать заказ'}
        </button>

        <p className="text-center text-xs text-text-subtle">
          После создания заказа я свяжусь с вами для уточнения деталей
        </p>
      </form>
    </div>
  );
}