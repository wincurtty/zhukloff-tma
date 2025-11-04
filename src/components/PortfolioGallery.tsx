'use client';
import { useState } from 'react';
import { PortfolioItem } from '@/lib/supabase';

const categoryConfig = {
  web_design: { name: '🌐 Веб-дизайн', color: 'bg-blue-500/20 text-blue-400' },
  ui_ux: { name: '🎨 UI/UX', color: 'bg-purple-500/20 text-purple-400' },
  branding: { name: '🏢 Брендинг', color: 'bg-green-500/20 text-green-400' },
  motion: { name: '✨ Моушн', color: 'bg-orange-500/20 text-orange-400' },
};

interface PortfolioGalleryProps {
  items: PortfolioItem[];
}

export default function PortfolioGallery({ items }: PortfolioGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const categories = [
    { id: 'all', name: 'Все работы' },
    ...Object.entries(categoryConfig).map(([id, config]) => ({
      id,
      name: config.name,
    })),
  ];

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Категории */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-white text-black'
                : 'bg-card border border-border text-text-secondary hover:bg-hover'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Сетка портфолио */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-xl overflow-hidden hover:border-hover transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryConfig[item.category].color}`}>
                  {categoryConfig[item.category].name}
                </span>
              </div>
              {item.featured && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-medium">
                  ★ Избранное
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-text-primary mb-1 line-clamp-1">
                {item.title}
              </h3>
              <p className="text-text-secondary text-sm mb-3 line-clamp-2">
                {item.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-text-subtle">
                <span>{item.duration}</span>
                {item.budget && (
                  <span className="font-medium text-text-secondary">
                    {item.budget.toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно деталей */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-primary">
                  {selectedItem.title}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-text-subtle hover:text-text-primary text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Слайдер изображений */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <img
                      src={selectedItem.images[0]}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Было/Стало если есть */}
                  {selectedItem.before_images && selectedItem.after_images && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-text-secondary mb-2">Было</div>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <img
                            src={selectedItem.before_images[0]}
                            alt="До"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-text-secondary mb-2">Стало</div>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                          <img
                            src={selectedItem.after_images[0]}
                            alt="После"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Детали проекта */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-text-primary mb-2">О проекте</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {selectedItem.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-text-secondary mb-1">Клиент</div>
                      <div className="text-text-primary font-medium">
                        {selectedItem.client_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-text-secondary mb-1">Срок</div>
                      <div className="text-text-primary font-medium">
                        {selectedItem.duration}
                      </div>
                    </div>
                    <div>
                      <div className="text-text-secondary mb-1">Бюджет</div>
                      <div className="text-text-primary font-medium">
                        {selectedItem.budget?.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    <div>
                      <div className="text-text-secondary mb-1">Категория</div>
                      <div className="text-text-primary font-medium">
                        {categoryConfig[selectedItem.category].name}
                      </div>
                    </div>
                  </div>

                  {selectedItem.technologies && selectedItem.technologies.length > 0 && (
                    <div>
                      <h3 className="font-medium text-text-primary mb-2">Технологии</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-border rounded-full text-text-secondary text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.project_url && (
                    <a
                      href={selectedItem.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      🌐 Посмотреть проект
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}