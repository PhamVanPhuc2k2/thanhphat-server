export interface CreatePageType {
  title: string;
  content: string;
  images: { url: string; public_id: string }[];
  seo?: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
}

export interface UpdatePageType {
  title?: string;
  content?: string;
  images?: { url: string; public_id: string }[];
  seo?: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
}

export interface QueryPageType {
  page?: number;
  limit?: number;
  search?: string;
}
