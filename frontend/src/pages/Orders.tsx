import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import type { Order } from '@/types';
import {
  ClipboardList,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Leaf,
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Package }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  confirmed: { color: 'text-blue-700', bg: 'bg-blue-50', icon: CheckCircle },
  processing: { color: 'text-purple-700', bg: 'bg-purple-50', icon: Package },
  shipped: { color: 'text-indigo-700', bg: 'bg-indigo-50', icon: Truck },
  delivered: { color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle },
  cancelled: { color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
};

const paymentStatusConfig: Record<string, { color: string; bg: string }> = {
  paid: { color: 'text-green-700', bg: 'bg-green-100' },
  unpaid: { color: 'text-amber-700', bg: 'bg-amber-100' },
};

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.listOrders(1, 20, statusFilter || undefined);
      if (res.status) {
        setOrders(res.data.data);
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await orderService.cancelOrder(id);
      if (res.status) {
        toast.success('Order cancelled');
        fetchOrders();
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
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Please login to view your orders</h2>
          <Link to="/login" className="text-[#3B8524] hover:underline font-medium">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAF5] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-[#111111]">My Orders</h1>

          <div className="flex gap-2">
            {['', 'pending', 'processing', 'shipped', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-[#3B8524] text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#3B8524]'
                }`}
              >
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#3B8524]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Place your first order to see it here.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B8524] text-white rounded-full font-medium hover:bg-[#2d6b1b] transition-colors"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const paymentStatus = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.unpaid;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${status.bg} rounded-xl flex items-center justify-center`}>
                        <StatusIcon className={`w-5 h-5 ${status.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-[#111111]">{order.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentStatus.bg} ${paymentStatus.color}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-5">
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Leaf className="w-5 h-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} {item.unit} x Rs. {item.pricePerUnit.toFixed(2)}
                              </p>
                              </div>
                              <p className="text-sm font-medium">Rs. {item.subtotal.toFixed(2)}</p>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-gray-400 pl-[60px]">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="text-xl font-bold text-[#3B8524]">Rs. {order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <Link
                          to={`/orders/${order.id}`}
                          className="flex items-center gap-1 px-5 py-2.5 text-sm font-medium bg-[#E6F6CA] text-[#3B8524] rounded-lg hover:bg-[#d4e9b3] transition-colors"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
