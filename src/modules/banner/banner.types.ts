export interface ImageType {
  url: string;
  public_id: string;
}

export interface CreateBannerType {
  title: string;
  image: ImageType;
  orientation: "horizontal" | "vertical";
  link: string | null;
  position: "home_top" | "category";
  isActive: boolean;
  categoryId: string;
}

export interface QueryBannerType {
  page?: number;
  limit?: number;
  isActive?: boolean;
  categoryId?: boolean;
}

export interface UpdateBannerType {
  title?: string;
  image?: ImageType;
  orientation?: "horizontal" | "vertical";
  link?: string | null;
  position?: "home_top" | "category";
  isActive?: boolean;
  categoryId?: string;
}
