import { CartItem, MenuItem, Restaurant } from '@/types';
import { create } from 'zustand';

interface CartState {
  restaurant: Restaurant | null;
  items: CartItem[];
  isOpen: boolean;

  // actions
  addItem: (item: MenuItem, restaurant: Restaurant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // computed
  total: () => number;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  restaurant: null,
  items: [],
  isOpen: false,

  addItem: (item, restaurant) => {
    const { items, restaurant: currentRestaurant } = get();

    // Carrinho de restaurante diferente → limpa e recomeça
    if (currentRestaurant && currentRestaurant.id !== restaurant.id) {
      set({ items: [{ item, quantity: 1 }], restaurant });
      return;
    }

    const existing = items.find((ci) => ci.item.id === item.id);
    if (existing) {
      set({
        items: items.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci,
        ),
        restaurant,
      });
    } else {
      set({ items: [...items, { item, quantity: 1 }], restaurant });
    }
  },

  removeItem: (itemId) => {
    const { items } = get();
    const updated = items.filter((ci) => ci.item.id !== itemId);
    set({ items: updated, restaurant: updated.length === 0 ? null : get().restaurant });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set({
      items: get().items.map((ci) =>
        ci.item.id === itemId ? { ...ci, quantity } : ci,
      ),
    });
  },

  clearCart: () => set({ items: [], restaurant: null }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  total: () => {
    const { items, restaurant } = get();
    const subtotal = items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
    return subtotal + (restaurant?.deliveryFee ?? 0);
  },

  subtotal: () =>
    get().items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0),

  itemCount: () => get().items.reduce((sum, ci) => sum + ci.quantity, 0),
}));
