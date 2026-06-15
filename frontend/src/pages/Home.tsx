import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import type { Product } from '@/types';
import {
  Search,
  ArrowRight,
  TreePine,
  HeartHandshake,
  Sprout,
  Star,
  ShoppingCart,
  ChevronRight,
  Leaf,
  Truck,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

const FEATURED_PRODUCTS = [
  { id: 'lime', name: 'Lime', slug: 'lime', image: '/images/prod-lime.jpg', pricePerUnit: 3, minQty: 10, unit: 'kg', category: 'Fresh Fruit' },
  { id: 'papaya', name: 'Papaya', slug: 'papaya', image: '/images/prod-papaya.jpg', pricePerUnit: 5, minQty: 5, unit: 'kg', category: 'Fresh Fruit' },
  { id: 'lemon', name: 'Lemon', slug: 'lemon', image: '/images/prod-lemon.jpg', pricePerUnit: 4, minQty: 8, unit: 'kg', category: 'Fresh Fruit' },
  { id: 'avocado', name: 'Avocado', slug: 'avocado', image: '/images/prod-avocado.jpg', pricePerUnit: 6, minQty: 6, unit: 'kg', category: 'Fresh Fruit' },
  { id: 'tomato', name: 'Tomato', slug: 'tomato', image: '/images/prod-tomato.jpg', pricePerUnit: 2.5, minQty: 12, unit: 'kg', category: 'Fresh Vegetables' },
  { id: 'carrot', name: 'Carrot', slug: 'carrot', image: '/images/prod-carrot.jpg', pricePerUnit: 1.8, minQty: 15, unit: 'kg', category: 'Fresh Vegetables' },
];

const BRANDS = ['Whole Foods', 'Fresh Market', 'Natural Grocers', 'Sprouts', 'Trader Joes', 'Kroger'];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes] = await Promise.all([
          productService.listProducts({ limit: 8 }),
          categoryService.listCategories(),
        ]);
        if (productsRes.status) {
          setProducts(productsRes.data.data);
        }
      } catch {
        // Fallback to featured products
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(
        '.hero-title',
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
      );
      gsap.fromTo(
        '.hero-subtitle',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.4 }
      );
      gsap.fromTo(
        '.hero-search',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.6 }
      );

      // Products fade in
      if (productsRef.current) {
        gsap.fromTo(
          '.product-card',
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: productsRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // Banner parallax
      if (bannerRef.current) {
        gsap.fromTo(
          bannerRef.current,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: bannerRef.current,
              start: 'top 85%',
            },
          }
        );
      }

      // Features stagger
      if (featuresRef.current) {
        gsap.fromTo(
          '.feature-card',
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 75%',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [isLoading]);

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
    } catch {
      toast.error('Please login to add items to cart');
    }
  };

  const displayProducts = products.length > 0 ? products : FEATURED_PRODUCTS as any;

  const filteredProducts = activeCategory === 'All'
    ? displayProducts
    : displayProducts.filter((p: any) => {
      const catName = typeof p.categoryId === 'object' ? p.categoryId?.name : p.category;
      return catName === activeCategory;
    });

  return (
    <div className="bg-[#F9FAF5]">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#E6F6CA] rounded-full opacity-60 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#3B8524]/5 rounded-full opacity-60 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E6F6CA] rounded-full mb-8">
            <Leaf className="w-4 h-4 text-[#3B8524]" />
            <span className="text-sm font-medium text-[#3B8524]">
              100% Organic Certified Produce
            </span>
          </div>

          <h1 className="hero-title text-4xl sm:text-5xl md:text-7xl font-bold text-[#111111] tracking-tight leading-tight mb-6">
            Your nearest
            <span className="block text-[#3B8524]">farm shop</span>
          </h1>

          <p className="hero-subtitle text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Premium organic produce sourced directly from local farmers.
            Quality food for your table, delivered wholesale.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
            className="hero-search max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search all products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-full bg-white border border-gray-200 text-base shadow-lg shadow-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 focus:border-[#3B8524] transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-[#3B8524] text-white rounded-full font-medium hover:bg-[#2d6b1b] transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4 text-[#3B8524]" />
              <span>Free shipping over Rs. 500</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShieldCheck className="w-4 h-4 text-[#3B8524]" />
              <span>Certified Organic</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-[#3B8524]" />
              <span>24hr Delivery</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section ref={productsRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-[#111111]">Fresh Arrivals</h2>
              <p className="text-gray-500 mt-1">Handpicked organic produce, ready for wholesale</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-[#3B8524] font-medium hover:underline"
            >
              View all products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['All', 'Fresh Fruit', 'Fresh Vegetables'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                    ? 'bg-[#3B8524] text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#3B8524] hover:text-[#3B8524]'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.slice(0, 6).map((product: any) => (
              <div
                key={product.id || product.id}
                className="product-card group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300"
              >
                <Link to={`/products/${product.id || product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-[#3B8524]">
                      {product.category?.name || 'Organic'}
                    </div>
                  </div>
                </Link>

                <div className="p-5">
                  <Link to={`/products/${product.id || product.id}`}>
                    <h3 className="text-lg font-semibold text-[#111111] group-hover:text-[#3B8524] transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                          }`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">(24)</span>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-2xl font-bold text-[#3B8524]">
                        Rs. {product.pricePerUnit.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        per {product.unit} &middot; Min {product.minimumOrderQty}{product.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id || product.id)}
                      className="p-3 bg-[#3B8524] text-white rounded-xl hover:bg-[#2d6b1b] transition-colors shadow-lg shadow-[#3B8524]/20"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div
          ref={bannerRef}
          className="max-w-6xl mx-auto bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-100/50"
        >
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative aspect-square md:aspect-auto">
              <img
                src="/images/banner-woman.jpg"
                alt="Organic farmer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 md:to-transparent" />
            </div>
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <span className="inline-block px-4 py-1.5 bg-[#E6F6CA] text-[#3B8524] text-sm font-medium rounded-full w-fit mb-6">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#111111] mb-6 leading-tight">
                We work directly with the best organic farmers
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                We want to bring you closer to the origin of your food. That&apos;s why we know all
                our farmers and their families personally, and ensure they receive fair prices for
                their hard work.
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#E6F6CA] rounded-xl flex items-center justify-center">
                    <TreePine className="w-6 h-6 text-[#3B8524]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#111111]">200+</p>
                    <p className="text-sm text-gray-500">Partner Farms</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#E6F6CA] rounded-xl flex items-center justify-center">
                    <HeartHandshake className="w-6 h-6 text-[#3B8524]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#111111]">Fair Trade</p>
                    <p className="text-sm text-gray-500">Guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111111] mb-4">
              Why choose Shop Herbal?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We&apos;re committed to providing the freshest organic produce while supporting sustainable farming practices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-[#E6F6CA] rounded-2xl flex items-center justify-center mb-6">
                <TreePine className="w-7 h-7 text-[#3B8524]" />
              </div>
              <h3 className="text-xl font-semibold text-[#111111] mb-3">Full traceability</h3>
              <p className="text-gray-600 leading-relaxed">
                We know where every single item comes from. Scan any product to see its farm of origin, harvest date, and journey to your door.
              </p>
            </div>

            <div className="feature-card bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-[#E6F6CA] rounded-2xl flex items-center justify-center mb-6">
                <HeartHandshake className="w-7 h-7 text-[#3B8524]" />
              </div>
              <h3 className="text-xl font-semibold text-[#111111] mb-3">We support farmers</h3>
              <p className="text-gray-600 leading-relaxed">
                Fair trade practices ensure thriving communities. We pay our farmers 30% above market rates to support their families and communities.
              </p>
            </div>

            <div className="feature-card bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-[#E6F6CA] rounded-2xl flex items-center justify-center mb-6">
                <Sprout className="w-7 h-7 text-[#3B8524]" />
              </div>
              <h3 className="text-xl font-semibold text-[#111111] mb-3">Respectful of the environment</h3>
              <p className="text-gray-600 leading-relaxed">
                Sustainable methods that protect our planet. Zero-waste packaging and carbon-neutral delivery on all orders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Marquee */}
      <section className="py-16 overflow-hidden bg-white border-y border-gray-100">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Brands that trust us
          </p>
        </div>
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
            {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, i) => (
              <span
                key={i}
                className="text-2xl font-bold text-gray-300 hover:text-[#3B8524] transition-colors cursor-default"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[#111111] mb-6">
            Ready to stock your shelves?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses that trust Shop Herbal for their organic produce supply.
            Create an account today and get 10% off your first order.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-[#3B8524] text-white rounded-full font-medium hover:bg-[#2d6b1b] transition-colors shadow-lg shadow-[#3B8524]/20"
            >
              Create Account
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 text-[#3B8524] font-medium hover:underline"
            >
              Browse Products
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
