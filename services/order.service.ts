import { Address, Order } from '@/types';
import api from './api';

export interface CreateOrderPayload {
  restaurantId: string;
  items: { itemId: string; quantity: number; notes?: string }[];
  addressId: string;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post<Order>('/orders', payload);
    return data;
  },

  async getOrders(page = 1, limit = 10): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/orders', {
      params: { page, limit },
    });
    return data;
  },

  async getOrderById(id: string): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  async getAddresses(): Promise<Address[]> {
    const { data } = await api.get<Address[]>('/addresses');
    return data;
  },

  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    const { data } = await api.post<Address>('/addresses', address);
    return data;
  },
};
