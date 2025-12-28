/**
 * TypeScript типи для кошика
 */

export interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

