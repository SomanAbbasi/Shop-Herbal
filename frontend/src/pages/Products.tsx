import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import type { Product, Category } from '@/types';
import { useCart } from '@/contexts/CartContext';
import {
  Search,
  ShoppingCart,
  Star,
  SlidersHorizontal,
  X,
  ChevronDown,
  Loader2,
  Leaf,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { addToCart } = useCart();

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest' | ''>(
    (searchParams.get('sortBy') as any) || ''
  );
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.listCategories();
        if (res.status) {
          setCategories(res.data);
        }
      } catch {
        // silent
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await productService.listProducts({
          page,
          limit: 12,
          search: search || undefined,
          categoryId: selectedCategory || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          sortBy: sortBy || undefined,
        });
        if (res.status) {
          setProducts(res.data.data);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch {
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [page, search, selectedCategory, sortBy, minPrice, maxPrice]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (search) params.set('search', search);
    else params.delete('search');
    setSearchParams(params);
  };

  const handleAddToCart = async (productId: string, minQty: number) => {
    try {
      await addToCart(productId, minQty);
    } catch {
      toast.error('Please login to add items to cart');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortBy('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = search || selectedCategory || sortBy || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-[#F9FAF5] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mb-2">All Products</h1>
          <p className="text-gray-500">Browse our full catalog of organic wholesale produce</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 focus:border-[#3B8524] transition-all"
              />
            </div>
          </form>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-[#3B8524] text-white border-[#3B8524]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#3B8524]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-white/20 rounded-full text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
                className="appearance-none px-5 py-3 pr-10 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 cursor-pointer"
              >
                <option value="">Sort by</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                <input
                  type="number"
                  placeholder="Rs. 999"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                />
              </div>

              <div className="flex items-end">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && !showFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E6F6CA] text-[#3B8524] text-sm rounded-full">
                Search: {search}
                <button onClick={() => { setSearch(''); setPage(1); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E6F6CA] text-[#3B8524] text-sm rounded-full">
                {categories.find((c) => c.id === selectedCategory)?.name || 'Category'}
                <button onClick={() => { setSelectedCategory(''); setPage(1); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sortBy && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E6F6CA] text-[#3B8524] text-sm rounded-full">
                {sortBy === 'price_asc' ? 'Price: Low to High' : sortBy === 'price_desc' ? 'Price: High to Low' : 'Newest'}
                <button onClick={() => { setSortBy(''); setPage(1); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#3B8524]" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-[#3B8524] text-white rounded-full font-medium hover:bg-[#2d6b1b] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300"
                >
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#E6F6CA]">
                          <Leaf className="w-12 h-12 text-[#3B8524]" />
                        </div>
                      )}
                      {product.stock <= 10 && product.stock > 0 && (
                        <div className="absolute top-3 left-3 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Low Stock
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute top-3 left-3 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-lg font-semibold text-[#111111] group-hover:text-[#3B8524] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-500 mt-1">
                      {typeof product.categoryId === 'object'
                        ? product.categoryId?.name
                        : 'Organic'}
                    </p>

                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div>
                        <p className="text-2xl font-bold text-[#3B8524]">
                          Rs. {product.pricePerUnit.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          per {product.unit} · Min {product.minimumOrderQty}{product.unit}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product.id, product.minimumOrderQty)}
                        disabled={product.stock === 0}
                        className="p-2.5 bg-[#3B8524] text-white rounded-xl hover:bg-[#2d6b1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 hover:border-[#3B8524] hover:text-[#3B8524] transition-colors"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1
                        ? 'bg-[#3B8524] text-white'
                        : 'border border-gray-200 hover:border-[#3B8524] hover:text-[#3B8524]'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 hover:border-[#3B8524] hover:text-[#3B8524] transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
