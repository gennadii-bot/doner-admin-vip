export type AdminJwtPayload = {
  sub: string;
  role: string;
  exp: number;
};

export type AuthState = {
  token: string | null;
  email: string | null;
  role: string | null;
  loading: boolean;
};

export type DashboardData = {
  orders_today: number;
  active_orders: number;
};

export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'completed' | 'cancelled';

export type OrderItem = {
  id: number;
  product_id?: number;
  product_name?: string;
  quantity: number;
  price?: number;
};

export type Order = {
  id: number;
  customer_name?: string;
  customer_email?: string;
  status: OrderStatus;
  total?: number;
  created_at?: string;
  items?: OrderItem[];
};

export type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  is_active?: boolean;
};

export type Category = {
  id: number;
  name: string;
  description?: string;
};

export type RootStackParamList = {
  Login: undefined;
  AdminTabs: undefined;
  OrderDetails: { orderId: number };
  ProductEdit: { productId?: number };
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Products: undefined;
  Categories: undefined;
  Logout: undefined;
};
