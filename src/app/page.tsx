'use client';
import { useTelegram } from '@/hooks/useTelegram';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useTelegram();

  const stats = [
    { label: 'Активные заказы', value: '3', change: '+1' },
    { label: 'Средний чек', value: '25K ₽', change: '+5%' },
    { label: 'Выполнено', value: '47', change: '+12' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <h1 className="text-2xl font-bold mb-2 text-text-primary">
          Добро пожаловать{user?.first_name ? `, ${user.first_name}` : ''}! 👋
        </h1>
        <p className="text-text-secondary">
          Я создаю цифровые продукты, которые решают бизнес-задачи и восхищают пользователей.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div className="text-text-secondary text-sm mb-1">{stat.label}</div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-lg font-bold mb-4 text-text-primary">Быстрые действия</h2>
        <div className="space-y-3">
          <Link
            href="/portfolio"
            className="block w-full bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform text-center"
          >
            🎨 Посмотреть портфолио
          </Link>
          <Link
            href="/order"
            className="block w-full border border-border font-medium py-3 px-4 rounded-lg hover:bg-hover active:scale-95 transition-transform text-center text-text-primary"
          >
            📋 Новый заказ
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-lg font-bold mb-4 text-text-primary">Последняя активность</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-text-secondary">Лендинг для CryptoStart</span>
            </div>
            <span className="text-text-subtle text-sm">2 дня назад</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-text-secondary">Брендбук для TechLab</span>
            </div>
            <span className="text-text-subtle text-sm">5 дней назад</span>
          </div>
        </div>
      </section>
    </div>
  );
}