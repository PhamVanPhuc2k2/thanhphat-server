export interface CreateBrandTypes {
  name: string;
  slug?: string;
  logo: {
    url: string;
    public_id: string;
    status: "temple" | "active";
  };
  isActive: boolean;
}

export interface UpdateBrandTypes {
  name?: string;
  slug?: string;
  logo?: {
    url: string;
    public_id: string;
    status: "temple" | "active";
  };
  isActive?: boolean;
}

export interface ListBrandQuery {
  page?: number;
  limit?: number;
  search?: "";
  isActive?: boolean;
}

export interface AllBrandQuery {
  isActive?: boolean;
}
