import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { userService } from '@/services/userService';
import type { Address } from '@/types';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Leaf,
  Loader2,
  MapPin,
  CreditCard,
  Banknote,
  Calendar,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const { cart, fetchCart, updateCartItem, removeCartItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'bank_transfer' | 'net30' | 'cash_on_delivery'>('cash_on_delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (isCheckingOut) {
      fetchAddresses();
    }
  }, [isCheckingOut]);

  const fetchAddresses = async () => {
    try {
      const res = await userService.getAddresses();
      if (res.status) {
        setAddresses(res.data);
        const defaultAddr = res.data.find((a) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr);
        else if (res.data.length > 0) setSelectedAddress(res.data[0]);
      }
    } catch {
      toast.error('Failed to load addresses');
    }
  };

  const handleQuantityChange = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await updateCartItem(productId, newQty);
    } catch {
      // handled by service
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeCartItem(productId);
    } catch {
      // handled by service
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    setIsLoading(true);
    try {
      const res = await orderService.placeOrder({
        shippingAddress: {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
        },
        paymentMethod,
        notes: orderNotes,
      });
      if (res.status) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate('/orders');
      }
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center pt-20">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Please login to view your cart</h2>
          <Link to="/login" className="text-[#3B8524] hover:underline font-medium">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex flex-col items-center justify-center pt-20 px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#E6F6CA] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-[#3B8524]" />
          </div>
          <h2 className="text-2xl font-bold text-[#111111] mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            Looks like you haven&apos;t added any items yet. Browse our organic produce to get started.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#3B8524] text-white rounded-full font-medium hover:bg-[#2d6b1b] transition-colors"
          >
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.totalAmount;
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-[#F9FAF5] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#111111] mb-8">
          {isCheckingOut ? 'Checkout' : 'Shopping Cart'}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {!isCheckingOut ? (
              <>
                {cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 bg-white rounded-2xl border border-gray-100 p-4"
                  >
                    <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-[#111111] truncate">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            Rs. {item.pricePerUnit.toFixed(2)} / {item.unit}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-semibold text-[#3B8524]">
                          Rs. {item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => clearCart()}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Cart
                </button>
              </>
            ) : (
              /* Checkout Form */
              <div className="space-y-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-[#3B8524]" />
                    <h3 className="font-semibold text-[#111111]">Shipping Address</h3>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">No addresses found</p>
                      <Link
                        to="/profile"
                        className="text-[#3B8524] font-medium hover:underline"
                      >
                        Add an address
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedAddress?.id === addr.id
                              ? 'border-[#3B8524] bg-[#E6F6CA]/20'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{addr.label}</span>
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 bg-[#3B8524] text-white text-[10px] rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {addr.street}, {addr.city}, {addr.state} {addr.postalCode}
                              </p>
                            </div>
                            {selectedAddress?.id === addr.id && (
                              <div className="w-5 h-5 bg-[#3B8524] rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-[#3B8524]" />
                    <h3 className="font-semibold text-[#111111]">Payment Method</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'cash_on_delivery' as const, label: 'Cash on Delivery', icon: Banknote },
                      { value: 'bank_transfer' as const, label: 'Bank Transfer', icon: CreditCard },
                      { value: 'net30' as const, label: 'Net 30', icon: Calendar },
                      { value: 'stripe' as const, label: 'Stripe', icon: CreditCard },
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          paymentMethod === method.value
                            ? 'border-[#3B8524] bg-[#E6F6CA]/20'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <method.icon className="w-5 h-5 text-[#3B8524]" />
                        <span className="text-sm font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-[#3B8524]" />
                    <h3 className="font-semibold text-[#111111]">Order Notes</h3>
                  </div>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Any special instructions for your order..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h3 className="font-semibold text-[#111111] mb-6">Order Summary</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tax (5%)</span>
                  <span className="font-medium">Rs. {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-semibold text-[#111111]">Total</span>
                    <span className="text-2xl font-bold text-[#3B8524]">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {!isCheckingOut ? (
                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full py-3.5 bg-[#3B8524] text-white rounded-xl font-medium hover:bg-[#2d6b1b] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#3B8524]/20"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !selectedAddress}
                    className="w-full py-3.5 bg-[#3B8524] text-white rounded-xl font-medium hover:bg-[#2d6b1b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#3B8524]/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsCheckingOut(false)}
                    className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Back to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
