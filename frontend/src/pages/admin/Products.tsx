import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import type { Product, Category } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Loader2,
  Leaf,
  ImagePlus,
  Power,
} from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_PRODUCT = {
  name: '',
  slug: '',
  description: '',
  categoryId: '',
  sku: '',
  unit: 'kg',
  pricePerUnit: '',
  minimumOrderQty: '',
  stock: '',
  bulkPricingTiers: [] as { minQty: number; pricePerUnit: number }[],
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [images, setImages] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productService.listProducts({ page, limit: 10, search: search || undefined }),
        categoryService.listCategories(),
      ]);
      if (productsRes.status) {
        setProducts(productsRes.data.data);
        setTotalPages(productsRes.data.pagination.totalPages);
      }
      if (categoriesRes.status) {
        setCategories(categoriesRes.data);
      }
    } catch {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('slug', form.slug);
    formData.append('description', form.description);
    formData.append('categoryId', form.categoryId);
    formData.append('sku', form.sku);
    formData.append('unit', form.unit);
    formData.append('pricePerUnit', form.pricePerUnit);
    formData.append('minimumOrderQty', form.minimumOrderQty);
    formData.append('stock', form.stock);

    if (form.bulkPricingTiers.length > 0) {
      formData.append('bulkPricingTiers', JSON.stringify(form.bulkPricingTiers));
    }

    if (images) {
      Array.from(images).forEach((img) => {
        formData.append('images', img);
      });
    }

    try {
      if (editingProduct) {
        const res = await productService.updateProduct(editingProduct.id, formData);
        if (res.status) {
          toast.success('Product updated');
        }
      } else {
        const res = await productService.createProduct(formData);
        if (res.status) {
          toast.success('Product created');
        }
      }
      setShowForm(false);
      setEditingProduct(null);
      setForm(EMPTY_PRODUCT);
      setImages(null);
      fetchData();
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Operation failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will soft-delete the product.')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await productService.activateProduct(id);
      toast.success('Product activated');
      fetchData();
    } catch {
      toast.error('Failed to activate product');
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: typeof product.categoryId === 'object' ? product.categoryId.id : product.categoryId,
      sku: product.sku,
      unit: product.unit,
      pricePerUnit: product.pricePerUnit.toString(),
      minimumOrderQty: product.minimumOrderQty.toString(),
      stock: product.stock.toString(),
      bulkPricingTiers: product.bulkPricingTiers || [],
    });
    setShowForm(true);
  };

  const addBulkTier = () => {
    setForm({
      ...form,
      bulkPricingTiers: [...form.bulkPricingTiers, { minQty: 0, pricePerUnit: 0 }],
    });
  };

  const updateBulkTier = (index: number, field: 'minQty' | 'pricePerUnit', value: number) => {
    const tiers = [...form.bulkPricingTiers];
    tiers[index][field] = value;
    setForm({ ...form, bulkPricingTiers: tiers });
  };

  const removeBulkTier = (index: number) => {
    const tiers = form.bulkPricingTiers.filter((_, i) => i !== index);
    setForm({ ...form, bulkPricingTiers: tiers });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setForm(EMPTY_PRODUCT);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3B8524] text-white rounded-xl font-medium hover:bg-[#2d6b1b] transition-colors shadow-lg shadow-[#3B8524]/20"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
          />
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditingProduct(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    minLength={10}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id || cat.id} value={cat.id || cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select
                    required
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="liter">Liter</option>
                    <option value="carton">Carton</option>
                    <option value="box">Box</option>
                    <option value="piece">Piece</option>
                    <option value="bunch">Bunch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={form.pricePerUnit}
                    onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Qty *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.minimumOrderQty}
                    onChange={(e) => setForm({ ...form, minimumOrderQty: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl hover:border-[#3B8524] cursor-pointer transition-colors">
                    <ImagePlus className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {images ? `${images.length} files selected` : 'Choose images'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImages(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Bulk Pricing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Bulk Pricing Tiers</label>
                  <button
                    type="button"
                    onClick={addBulkTier}
                    className="text-sm text-[#3B8524] hover:underline"
                  >
                    + Add Tier
                  </button>
                </div>
                {form.bulkPricingTiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <input
                      type="number"
                      placeholder="Min Qty"
                      value={tier.minQty}
                      onChange={(e) => updateBulkTier(i, 'minQty', Number(e.target.value))}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Price/Unit"
                      step="0.01"
                      value={tier.pricePerUnit}
                      onChange={(e) => updateBulkTier(i, 'pricePerUnit', Number(e.target.value))}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B8524]/30 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeBulkTier(i)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingProduct(null); }}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#3B8524] text-white rounded-xl font-medium hover:bg-[#2d6b1b] transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#3B8524]" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Product</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Category</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Stock</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Leaf className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {typeof product.categoryId === 'object' ? product.categoryId.name : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      Rs. {product.pricePerUnit.toFixed(2)} / {product.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${
                        product.stock === 0
                          ? 'text-red-600'
                          : product.stock <= 10
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {!product.isActive && (
                          <button
                            onClick={() => handleActivate(product.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Activate"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-50">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
