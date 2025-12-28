/**
 * Сторінка каталогу товарів
 */

'use client';

import { useState } from 'react';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Filters } from '@/components/catalog/Filters';
import { SearchBar } from '@/components/catalog/SearchBar';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useSearch } from '@/hooks/useSearch';
import { useCart } from '@/hooks/useCart';
import type { ProductFilters, Product } from '@/types/product';

export default function CatalogPage() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { products, loading, error, pagination } = useProducts({ filters, page, limit: 20 });
  const { results: searchResults, loading: searchLoading } = useSearch(searchQuery);
  const { addItem } = useCart();

  // Використовуємо результати пошуку якщо є query, інакше - звичайні товари
  const displayProducts = searchQuery ? searchResults : products;
  const displayLoading = searchQuery ? searchLoading : loading;

  const handleAddToCart = (product: Product) => {
    addItem({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3 text-foreground tracking-tight">
          Каталог товарів
        </h1>
        <p className="text-gray-400 text-lg">Знайдіть ідеальний пристрій резервного живлення</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Filters filters={filters} onFiltersChange={setFilters} />
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400">Помилка: {error}</p>
              <p className="text-sm text-gray-400 mt-2">Переконайтеся що Backend запущений на http://localhost:8000</p>
            </div>
          )}
          <ProductGrid
            products={displayProducts}
            onAddToCart={handleAddToCart}
            loading={displayLoading}
          />

          {/* Pagination */}
          {!searchQuery && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Попередня
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        page === pageNum
                          ? 'bg-primary text-background font-semibold'
                          : 'bg-white/5 hover:bg-white/10 text-foreground border border-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                variant="outline"
                size="sm"
              >
                Наступна
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              
              <span className="text-sm text-gray-400 ml-4">
                Сторінка {pagination.page} з {pagination.pages}
              </span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

