'use client';
import { Order, OrderStage } from '@/lib/supabase';

interface OrderTrackerProps {
  order: Order;
  stages: OrderStage[];
}

const statusColors = {
  pending: 'bg-border text-text-subtle',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function OrderTracker({ order, stages }: OrderTrackerProps) {
  const sortedStages = stages.sort((a, b) => a.order_index - b.order_index);
  const completedStages = stages.filter(stage => stage.status === 'completed').length;
  const progress = (completedStages / stages.length) * 100;

  const getStageStatus = (stage: OrderStage) => {
    if (stage.status === 'completed') return 'completed';
    if (stage.status === 'in_progress') return 'in_progress';
    if (stage.status === 'blocked') return 'blocked';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Прогресс-бар */}
      <div>
        <div className="flex justify-between text-sm text-text-secondary mb-2">
          <span>Общий прогресс</span>
          <span>{completedStages} из {stages.length} этапов</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div
            className="bg-gradient-to-r from-gray-400 to-gray-200 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Визуальная временная шкала */}
      <div className="relative">
        {/* Вертикальная линия */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border z-0"></div>
        
        <div className="space-y-4 relative z-10">
          {sortedStages.map((stage, index) => (
            <div key={stage.id} className="flex items-start gap-4">
              {/* Индикатор статуса */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                statusColors[getStageStatus(stage)]
              }`}>
                {stage.status === 'completed' && '✓'}
                {stage.status === 'in_progress' && '⋯'}
                {stage.status === 'blocked' && '!'}
                {stage.status === 'pending' && (index + 1)}
              </div>

              {/* Контент этапа */}
              <div className={`flex-1 pb-6 ${
                index !== stages.length - 1 ? 'border-b border-border' : ''
              }`}>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-text-primary">{stage.name}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    statusColors[getStageStatus(stage)]
                  }`}>
                    {getStageStatus(stage) === 'completed' && 'Завершено'}
                    {getStageStatus(stage) === 'in_progress' && 'В работе'}
                    {getStageStatus(stage) === 'blocked' && 'Ожидание'}
                    {getStageStatus(stage) === 'pending' && 'Ожидание'}
                  </span>
                </div>
                
                {stage.description && (
                  <p className="text-text-secondary text-sm mb-2">
                    {stage.description}
                  </p>
                )}

                {/* Действия для текущего этапа */}
                {stage.status === 'in_progress' && (
                  <div className="flex gap-2 mt-3">
                    <button className="text-xs bg-white text-black px-3 py-1 rounded-lg font-medium hover:bg-gray-100">
                      📋 Отчет
                    </button>
                    <button className="text-xs border border-border px-3 py-1 rounded-lg font-medium hover:bg-hover">
                      💬 Обсудить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Статистика по заказу */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-text-secondary mb-1">Статус заказа</div>
          <div className="text-text-primary font-medium capitalize">
            {order.status === 'brief_received' && 'Бриф получен'}
            {order.status === 'in_progress' && 'В работе'}
            {order.status === 'review' && 'На проверке'}
            {order.status === 'completed' && 'Завершен'}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-text-secondary mb-1">Создан</div>
          <div className="text-text-primary font-medium">
            {new Date(order.created_at).toLocaleDateString('ru-RU')}
          </div>
        </div>
      </div>
    </div>
  );
}