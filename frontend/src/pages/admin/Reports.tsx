import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import type { SalesReport, InventoryReport } from '@/types';
import {
  Loader2,
  BarChart3,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminReports() {
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory'>('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [salesRes, inventoryRes] = await Promise.all([
        adminService.getSalesReport(startDate || undefined, endDate || undefined),
        adminService.getInventoryReport(),
      ]);
      if (salesRes.status) {
        setSalesData(salesRes.data);
      }
      if (inventoryRes.status) {
        setInventoryData(inventoryRes.data);
      }
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSales = () => {
    fetchData();
  };

  const totalRevenue = salesData.reduce((sum, d) => sum + d.totalRevenue, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.totalOrders, 0);

  const inStock = inventoryData.filter((i) => i.status === 'in_stock').length;
  const lowStock = inventoryData.filter((i) => i.status === 'low_stock').length;
  const outOfStock = inventoryData.filter((i) => i.status === 'out_of_stock').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Reports</h1>
          <p className="text-gray-500 mt-1">Analytics and inventory overview</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'sales' ? 'text-[#3B8524]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Sales Report
          {activeTab === 'sales' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B8524]" />}
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative ${
            activeTab === 'inventory' ? 'text-[#3B8524]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Inventory Report
          {activeTab === 'inventory' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B8524]" />}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#3B8524]" />
        </div>
      ) : activeTab === 'sales' ? (
        <div>
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">Rs. {totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-sm text-gray-500">Total Orders</p>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
              />
            </div>
            <span className="text-gray-400 self-center">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
            />
            <button
              onClick={handleFilterSales}
              className="px-5 py-2 bg-[#3B8524] text-white rounded-lg text-sm font-medium hover:bg-[#2d6b1b] transition-colors"
            >
              Filter
            </button>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Orders</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                      No sales data available
                    </td>
                  </tr>
                ) : (
                  salesData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium">{row.id}</td>
                      <td className="px-6 py-4 text-right">{row.totalOrders}</td>
                      <td className="px-6 py-4 text-right font-medium text-[#3B8524]">
                        Rs. {row.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inStock}</p>
                <p className="text-sm text-gray-500">In Stock</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStock}</p>
                <p className="text-sm text-gray-500">Low Stock</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStock}</p>
                <p className="text-sm text-gray-500">Out of Stock</p>
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">SKU</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Unit</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Stock</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Min Order</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No inventory data available
                    </td>
                  </tr>
                ) : (
                  inventoryData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.unit}</td>
                      <td className="px-6 py-4 text-right font-medium">{row.stock}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">{row.minimumOrderQty}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.status === 'in_stock'
                            ? 'bg-green-100 text-green-700'
                            : row.status === 'low_stock'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {row.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
