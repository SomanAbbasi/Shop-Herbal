import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '@/services/productService';
import { useCart } from '@/contexts/CartContext';
import type { Product, Review } from '@/types';
import {
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Leaf,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Check,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productRes, reviewsRes] = await Promise.all([
          productService.getProduct(id),
          productService.getReviews(id),
        ]);
        if (productRes.status) {
          setProduct(productRes.data);
          setQuantity(productRes.data.minimumOrderQty);
        }
        if (reviewsRes.status) {
          setReviews(reviewsRes.data.data);
        }
      } catch {
        toast.error('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
    } catch {
      toast.error('Please login to add items to cart');
    }
  };

  const getBulkPrice = () => {
    if (!product) return 0;
    const tier = product.bulkPricingTiers
      ?.slice()
      .reverse()
      .find((t) => quantity >= t.minQty);
    return tier ? tier.pricePerUnit : product.pricePerUnit;
  };

  const totalPrice = getBulkPrice() * quantity;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B8524]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex flex-col items-center justify-center pt-20">
        <Leaf className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Product not found</h2>
        <Link to="/products" className="text-[#3B8524] hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['/images/prod-lime.jpg'];

  return (
    <div className="min-h-screen bg-[#F9FAF5] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-[#3B8524] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#3B8524] transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-[#3B8524]">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-white rounded-3xl border border-gray-100 overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.stock <= 10 && product.stock > 0 && (
                <div className="absolute top-4 left-4 px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                  Low Stock: {product.stock} left
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? 'border-[#3B8524]'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#3B8524] mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to products
            </Link>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#E6F6CA] text-[#3B8524] text-sm font-medium rounded-full">
                {typeof product.categoryId === 'object'
                  ? product.categoryId?.name
                  : 'Organic'}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                SKU: {product.sku}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-[#3B8524]">
                  Rs. {getBulkPrice().toFixed(2)}
                </span>
                <span className="text-gray-500">/ {product.unit}</span>
              </div>

              {product.bulkPricingTiers && product.bulkPricingTiers.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Bulk Pricing</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#E6F6CA]/30 rounded-lg">
                      <span className="text-sm">{product.minimumOrderQty}+ {product.unit}</span>
                      <span className="text-sm font-medium">Rs. {product.pricePerUnit.toFixed(2)}</span>
                    </div>
                    {product.bulkPricingTiers.map((tier, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg ${
                          quantity >= tier.minQty
                            ? 'bg-[#E6F6CA] border border-[#3B8524]/20'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {quantity >= tier.minQty && (
                            <Check className="w-4 h-4 text-[#3B8524]" />
                          )}
                          <span className="text-sm">{tier.minQty}+ {product.unit}</span>
                        </div>
                        <span className="text-sm font-medium">Rs. {tier.pricePerUnit.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-xl">
                  <button
                    onClick={() => setQuantity((q) => Math.max(product.minimumOrderQty, q - 1))}
                    className="p-3 hover:bg-gray-50 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-semibold">
                    {quantity} {product.unit}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        product.stock > 0 ? Math.min(product.stock, q + 1) : q + 1
                      )
                    }
                    className="p-3 hover:bg-gray-50 rounded-r-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total & Add to Cart */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-[#111111]">Rs. {totalPrice.toFixed(2)}</p>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex items-center gap-2 px-8 py-4 bg-[#3B8524] text-white rounded-xl font-medium hover:bg-[#2d6b1b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#3B8524]/20"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100">
                <Truck className="w-6 h-6 text-[#3B8524] mb-2" />
                <span className="text-xs font-medium text-gray-600">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100">
                <ShieldCheck className="w-6 h-6 text-[#3B8524] mb-2" />
                <span className="text-xs font-medium text-gray-600">Certified Organic</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-gray-100">
                <Package className="w-6 h-6 text-[#3B8524] mb-2" />
                <span className="text-xs font-medium text-gray-600">Min {product.minimumOrderQty}{product.unit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-6 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === 'details'
                  ? 'text-[#3B8524]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Product Details
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B8524]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm font-medium transition-colors relative ${
                activeTab === 'reviews'
                  ? 'text-[#3B8524]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews ({reviews.length})
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B8524]" />
              )}
            </button>
          </div>

          {activeTab === 'details' ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              <h3 className="text-lg font-semibold text-[#111111] mb-4">Product Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Product Name</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">SKU</p>
                  <p className="font-medium">{product.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Unit</p>
                  <p className="font-medium">{product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Minimum Order</p>
                  <p className="font-medium">
                    {product.minimumOrderQty} {product.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Stock Available</p>
                  <p className="font-medium">
                    {product.stock} {product.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price per Unit</p>
                  <p className="font-medium text-[#3B8524]">Rs. {product.pricePerUnit.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl border border-gray-100 p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E6F6CA] rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-[#3B8524]">
                            {review.userName?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{review.userName}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                    {review.isVerifiedPurchase && (
                      <div className="flex items-center gap-1 mt-3">
                        <Check className="w-3 h-3 text-[#3B8524]" />
                        <span className="text-xs text-[#3B8524]">Verified Purchase</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
