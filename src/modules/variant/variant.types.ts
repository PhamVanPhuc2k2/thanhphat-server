export interface CreateVariantType {
  name: string;
  productId: string;
  slug: string;
  percentDiscount?: number;
  sku: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: [
    {
      url: string;
      public_id: string;
    },
  ];
  isActive: boolean;
}

export interface UpdateVariantType {
  name?: string;
  productId?: string;
  slug?: string;
  percentDiscount?: number;
  sku?: string;
  price?: number;
  discountPrice?: number;
  stock?: number;
  images?: [{ url?: string; public_id?: string }];
  isActive?: boolean;
}

export interface ListVariantType {
  productId?: string;
  isActive?: boolean;
}
