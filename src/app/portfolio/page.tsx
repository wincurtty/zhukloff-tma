'use client';
import { useEffect, useState } from 'react';
import { supabase, PortfolioItem } from '@/lib/supabase';
import PortfolioGallery from '@/components/PortfolioGallery';

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  const fetchPortfolioItems = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">🎨 Портфолио</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-border"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-border rounded"></div>
                <div className="h-3 bg-border rounded w-2/3"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-border rounded w-1/4"></div>
                  <div className="h-3 bg-border rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">🎨 Портфолио</h1>
        <p className="text-text-secondary mb-6">
          {items.length} проектов · От лендингов до комплексных брендинг-систем
        </p>
        
        {/* Поиск */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Поиск по проектам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 bg-card border border-border rounded-xl text-text-primary placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent pl-12"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-subtle">
            🔍
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            Проекты не найдены
          </h3>
          <p className="text-text-secondary">
            Попробуйте изменить поисковый запрос
          </p>
        </div>
      ) : (
        <PortfolioGallery items={filteredItems} />
      )}
    </div>
  );
}