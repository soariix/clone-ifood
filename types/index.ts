// ─── Auth ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// ─── Restaurant ──────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  category: string;
  categoryIcon: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number; // minutos
  deliveryFee: number;
  minOrder: number;
  distance: number; // km
  isOpen: boolean;
  tags: string[];
}

// ─── Menu ────────────────────────────────────────────────────────────────────

export interface MenuSection {
  title: string;
  data: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
  isAvailable: boolean;
  calories?: number;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantLogo: string;
  items: CartItem[];
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  address: Address;
  createdAt: string;
  estimatedDelivery?: string;
}

// ─── Address ─────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minRating?: number;
  maxDeliveryFee?: number;
  maxDeliveryTime?: number;
  isOpen?: boolean;
}
