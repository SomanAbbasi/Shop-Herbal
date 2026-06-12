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

const BRANDS = ['Whole Foods', 'Fresh Market', 'Natural Grocers', 'Sprouts', 'Trader Joes', 'Kroger'];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();

  //  FETCH REAL DB DATA ONLY
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setApiError(false);

        const [productsRes] = await Promise.all([
          productService.listProducts({ limit: 8 }),
          categoryService.listCategories(),
        ]);

        console.log('PRODUCT API RESPONSE:', productsRes);

        if (productsRes?.status && productsRes.data?.data) {
          setProducts(productsRes.data.data);
        } else {
          throw new Error('Invalid product response');
        }
      } catch (err) {
        console.error('PRODUCT FETCH ERROR:', err);
        setApiError(true);
        setProducts([]); // NO FAKE FALLBACK
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // GSAP animations
  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-title', { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1 });
      gsap.fromTo('.hero-subtitle', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 });
      gsap.fromTo('.hero-search', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });

      if (productsRef.current) {
        gsap.fromTo(
          '.product-card',
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.6,
            scrollTrigger: {
              trigger: productsRef.current,
              start: 'top 80%',
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

  //  ONLY DB DATA
  const displayProducts = products;

  const filteredProducts =
    activeCategory === 'All'
      ? displayProducts
      : displayProducts.filter((p: any) => {
          const catName =
            typeof p.categoryId === 'object'
              ? p.categoryId?.name
              : p.category;

          return catName === activeCategory;
        });

  return (
    <div className="bg-[#F9FAF5]">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <div className="relative z-10 text-center max-w-4xl">
          <h1 className="hero-title text-5xl font-bold mb-6">
            Your nearest <span className="text-[#3B8524]">farm shop</span>
          </h1>

          <p className="hero-subtitle text-gray-600 mb-10">
            Premium organic produce sourced directly from farmers.
          </p>

          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/products?search=${searchQuery}`;
            }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-full border"
                placeholder="Search products..."
              />
            </div>
          </form>
        </div>
      </section>

      {/* ERROR STATE */}
      {apiError && (
        <div className="max-w-6xl mx-auto p-4 mt-4 bg-red-50 text-red-600 rounded-xl border">
          Failed to load products from server. Please check backend API.
        </div>
      )}

      {/* PRODUCTS */}
      <section ref={productsRef} className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Fresh Products</h2>

          {isLoading ? (
            <p>Loading products...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredProducts || []).slice(0, 6).map((product: any) => (
                <div
                  key={product._id || product.id}
                  className="product-card bg-white rounded-xl p-4 border"
                >
                  <Link to={`/products/${product._id || product.id}`}>
                    <img
                      src={product.images?.[0] || product.image}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <h3 className="mt-3 font-semibold">{product.name}</h3>
                  </Link>

                  <p className="text-[#3B8524] font-bold mt-2">
                    ${product.pricePerUnit?.toFixed?.(2) || product.price}
                  </p>

                  <button
                    onClick={() =>
                      handleAddToCart(product._id || product.id)
                    }
                    className="mt-3 bg-[#3B8524] text-white px-4 py-2 rounded-lg"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to stock your shelves?
        </h2>
        <Link
          to="/products"
          className="text-[#3B8524] font-medium underline"
        >
          Browse Products
        </Link>
      </section>
    </div>
  );
}