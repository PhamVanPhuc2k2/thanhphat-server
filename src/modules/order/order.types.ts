export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CreateOrderType {
  customer: CustomerInfo;
  items: OrderItem[];
  paymentMethod?: "COD";
}

export interface UpdateOrderStatusType {
  status: "confirmed" | "shipping" | "completed" | "cancelled";
  cancelReason?: string;
}

export interface ListOrderQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}
