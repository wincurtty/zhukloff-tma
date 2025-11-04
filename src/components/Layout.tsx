'use client';
import { useTelegram } from '@/hooks/useTelegram';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Главная', href: '/', icon: '🏠' },
  { name: 'Портфолио', href: '/portfolio', icon: '🎨' },
  { name: 'Заказы', href: '/orders', icon: '📋' },
  { name: 'Профиль', href: '/profile', icon: '👤' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useTelegram();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-secondary">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-text-primary">Zhukloff | Creative Designer</h1>
          {user && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">
                Привет, {user.first_name}!
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 bg-background">{children}</main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card backdrop-blur-sm">
        <div className="flex justify-around">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-3 px-4 text-xs transition-colors ${
                  isActive 
                    ? 'text-text-primary' 
                    : 'text-text-subtle hover:text-text-secondary'
                }`}
              >
                <span className="text-lg mb-1">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}