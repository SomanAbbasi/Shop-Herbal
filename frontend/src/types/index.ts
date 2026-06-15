export interface ApiResponse<T> {
  status: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  status: boolean;
  error: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  status: boolean;
  data: {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'customer';
  businessName: string;
  status: 'pending' | 'active' | 'suspended';
  emailVerified: boolean;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkPricingTier {
  minQty: number;
  pricePerUnit: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: Category | string;
  images: string[];
  sku: string;
  unit: string;
  pricePerUnit: number;
  minimumOrderQty: number;
  stock: number;
  bulkPricingTiers: BulkPricingTier[];
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  unit: string;
  pricePerUnit: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  unit: string;
  pricePerUnit: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid';
  paymentMethod: string;
  invoiceNumber: string;
  notes: string;
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingApprovals: number;
  lowStockProducts: number;
  recentOrders: Order[];
}

export interface SalesReport {
  _id: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface InventoryReport {
  name: string;
  sku: string;
  unit: string;
  stock: number;
  minimumOrderQty: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AddToCartBody {
  productId: string;
  quantity: number;
}

export interface UpdateCartBody {
  productId: string;
  quantity: number;
}

export interface PlaceOrderBody {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'stripe' | 'bank_transfer' | 'net30' | 'cash_on_delivery';
  notes?: string;
}

export interface CreateReviewBody {
  rating: number;
  comment: string;
}

export interface CreateCategoryBody {
  name: string;
  slug: string;
  parentId?: string;
  image?: File;
}

export interface UpdateProfileBody {
  name?: string;
  phone?: string;
  businessName?: string;
}

export interface AddAddressBody {
  label?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}
