import { useState, useEffect } from 'react';
import {
  X,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Leaf,
  MapPin,
  CreditCard,
  FileText,
  User,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import type { Order } from '@/types';
import { orderService } from '@/services/orderService';
import { toast } from 'sonner';

interface AdminOrderDetailProps {
  orderId: string;
  onClose: () => void;
}

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-50', icon: Clock },
  confirmed: { color: 'text-blue-700', bg: 'bg-blue-50', icon: CheckCircle },
  processing: { color: 'text-purple-700', bg: 'bg-purple-50', icon: Package },
  shipped: { color: 'text-indigo-700', bg: 'bg-indigo-50', icon: Truck },
  delivered: { color: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle },
  cancelled: { color: 'text-red-700', bg: 'bg-red-50', icon: X },
  payment_failed: { color: 'text-orange-700', bg: 'bg-orange-50', icon: X },
};

export default function AdminOrderDetail({ orderId, onClose }: AdminOrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getOrder(orderId);
      if (res.status) {
        setOrder(res.data);
      }
    } catch {
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#3B8524]" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#111111]">{order.invoiceNumber}</h2>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Items & Customer Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Customer Info */}
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                <h3 className="font-semibold text-[#111111] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#3B8524]" />
                  Customer Information
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Name</p>
                      <p className="text-sm font-medium">{order.user?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Email</p>
                      <p className="text-sm font-medium">{order.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Phone</p>
                      <p className="text-sm font-medium">{order.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium">Business</p>
                      <p className="text-sm font-medium">{order.user?.businessName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-[#111111] mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-50 shadow-sm">
                      <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Leaf className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} {item.unit} x Rs. {item.pricePerUnit.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-sm">Rs. {item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-900">Order Notes</h3>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Right Column: Address & Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-[#111111] mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">Rs. {order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tax (5%)</span>
                    <span className="font-medium">Rs. {order.taxAmount.toFixed(2)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-medium text-green-600">-Rs. {order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold text-[#3B8524]">Rs. {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[#3B8524]" />
                  <h3 className="font-semibold text-[#111111]">Shipping Address</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.street}</p>
                  <p>{order.city}, {order.state} {order.postalCode}</p>
                  <p>{order.country}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-[#3B8524]" />
                  <h3 className="font-semibold text-[#111111]">Payment</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium uppercase tracking-tight">
                      {order.paymentMethod.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  {order.transactionId && (
                    <div className="pt-2">
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Transaction ID</p>
                      <p className="text-xs font-mono bg-gray-50 p-2 rounded mt-1 break-all">{order.transactionId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
