import { Types } from "mongoose";

export interface Image {
  url: string;
  public_id: string;
  status: "temple" | "active";
}

export interface Seo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface CreateCategoryTypes {
  name: string;
  parentId?: string | null;
  image?: Image;
  isActive?: boolean;
  sortOrder?: number;
  seo?: Seo;
  slug?: string;
  hasChildren?: boolean;
}

export interface UpdateCategoryTypes {
  name?: string;
  parentId?: string | null;
  image?: Image;
  isActive?: boolean;
  sortOrder?: number;
  seo?: Seo;
  slug?: string;
  level?: number;
  fullPath?: string[];
}

export interface ListCategoryTypes {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface AllCategoryTypes {
  isActive?: boolean;
  level?: number;
  hasChildren?: boolean;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  parentId: Types.ObjectId | null;
  hasChildren: boolean;
  level: number;
  fullPath: string[];
  image: Image;
  isActive: boolean;
  sortOrder: number;
  seo?: Seo;
}

export interface SelectCategoryQueryTypes {
  parentId: string | null;
  isActive?: boolean;
}
