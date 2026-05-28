import {
    Category,
    MenuSection,
    PaginatedResponse,
    Restaurant,
    SearchFilters,
} from '@/types';
import api from './api';

export const restaurantService = {
  async getRestaurants(
    page = 1,
    limit = 10,
    filters?: SearchFilters,
  ): Promise<PaginatedResponse<Restaurant>> {
    const { data } = await api.get<PaginatedResponse<Restaurant>>('/restaurants', {
      params: { page, limit, ...filters },
    });
    return data;
  },

  async getRestaurantById(id: string): Promise<Restaurant> {
    const { data } = await api.get<Restaurant>(`/restaurants/${id}`);
    return data;
  },

  async getMenu(restaurantId: string): Promise<MenuSection[]> {
    const { data } = await api.get<MenuSection[]>(`/restaurants/${restaurantId}/menu`);
    return data;
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  async search(query: string, filters?: SearchFilters): Promise<Restaurant[]> {
    const { data } = await api.get<Restaurant[]>('/restaurants/search', {
      params: { q: query, ...filters },
    });
    return data;
  },
};
