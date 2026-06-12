import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import type { Order } from '@/types';
import {
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Leaf,
  MapPin,
  CreditCard,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Package }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  confirmed: { color: 'text-blue-700', bg: 'bg-blue-50', icon: CheckCircle },
  processing: { color: 'text-purple-700', bg: 'bg-purple-50', icon: Package },
  shipped: { color: 'text-indigo-700', bg: 'bg-indigo-50', icon: Truck },
  delivered: { color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle },
  cancelled: { color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getOrder(id!);
      if (res.status) {
        setOrder(res.data);
      }
    } catch {
      toast.error('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await orderService.cancelOrder(id!);
      if (res.status) {
        toast.success('Order cancelled');
        fetchOrder();
      }
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Failed to cancel order';
      toast.error(message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Please login to view this order</p>
          <Link to="/login" className="text-[#3B8524] hover:underline font-medium">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B8524]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F9FAF5] flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Order not found</p>
          <Link to="/orders" className="text-[#3B8524] hover:underline font-medium">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-[#F9FAF5] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#3B8524] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to orders
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#111111]">{order.invoiceNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
              <StatusIcon className="w-4 h-4" />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            {order.status === 'pending' && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={step} className="flex flex-col items-center flex-1 relative">
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 w-full h-0.5 ${
                          index < currentStepIndex ? 'bg-[#3B8524]' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold relative z-10 ${
                        isCompleted
                          ? 'bg-[#3B8524] text-white'
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-[#E6F6CA]' : ''}`}
                    >
                      {isCompleted && index < currentStepIndex ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isCompleted ? 'text-[#3B8524]' : 'text-gray-400'}`}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-[#111111] mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit} x ${item.pricePerUnit.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {order.notes && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-[#3B8524]" />
                  <h3 className="font-semibold text-[#111111]">Order Notes</h3>
                </div>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-[#111111] mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tax (5%)</span>
                  <span className="font-medium">${order.taxAmount.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-green-600">-${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-[#3B8524]">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#3B8524]" />
                <h3 className="font-semibold text-[#111111]">Shipping Address</h3>
              </div>
              <p className="text-gray-600 text-sm">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-[#3B8524]" />
                <h3 className="font-semibold text-[#111111]">Payment</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {order.paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
