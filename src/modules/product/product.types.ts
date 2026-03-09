type Specs = {
  attributeId: string;
  value: string;
};
type Image = {
  url: string;
  public_id: string;
};
export interface CreateProductTypes {
  product: {
    name: string;
    slug?: string;
    categoryId: string;
    brandId: string;
    description: string;
    images: Image[];
    video: Image;
    specs: Specs[];
    isActive: boolean;
    seo: {
      title: string;
      description: string;
      keywords: string[];
      ogImage: Image;
    };
  };
  variants: [
    {
      name: string;
      slug?: string;
      sku: string;
      price: number;
      discountPrice: number;
      stock: number;
      images: Image[];
      isActive: boolean;
    },
  ];
}

export interface UpdateProductTypes {
  product: {
    name?: string;
    slug?: string;
    categoryId?: string;
    brandId?: string;
    description?: string;
    images?: Image[];
    video?: Image;
    specs?: Specs[];
    isActive?: boolean;
    seo?: {
      title: string;
      description: string;
      keywords: string[];
      ogImage: Image;
    };
  };
  variants: [
    {
      _id?: string;
      name?: string;
      slug?: string;
      sku?: string;
      price?: number;
      discountPrice?: number;
      stock?: number;
      images?: Image[];
      isActive?: boolean;
    },
  ];
}

export interface GetProductsTypes {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  categoryId?: string;
  brandId?: string;
}
