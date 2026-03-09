export interface CreateArticleType {
  title: string;
  slug?: string;
  content: string;
  excerpt: string;
  thumbnail: {
    url: string;
    public_id: string;
  };
  images: { url: string; public_id: string }[];
  isPublished: boolean;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: {
      url: string;
      public_id: string;
    };
  };
}

export interface UpdateArticleType {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  thumbnail?: {
    url: string;
    public_id: string;
  };
  images?: { url: string; public_id: string }[];
  isPublished?: boolean;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
    ogImage: {
      url: string;
      public_id: string;
    };
  };
}

export interface QueryArticleType {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  search?: string;
}
