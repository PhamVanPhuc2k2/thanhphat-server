import z from "zod";
import { ZodEmptyObject } from "../../middlewares/validateRequest";

export const CreateArticleSchema = z.object({
  body: z.object({
    title: z.string(),
    content: z.string(),
    excerpt: z.string(),
    thumbnail: z.object({
      url: z.string(),
      public_id: z.string(),
    }),
    isPublished: z.boolean().default(true),
    publishedAt: z.coerce.date().optional(),
    seo: z
      .object({
        title: z.string(),
        description: z.string(),
        keywords: z.array(z.string()),
        ogImage: z.object({
          url: z.string(),
          public_id: z.string(),
        }),
      })
      .optional()
      .optional(),
  }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const UpdateArticleSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    excerpt: z.string().optional(),
    thumbnail: z
      .object({
        url: z.string(),
        public_id: z.string(),
      })
      .optional(),
    isPublished: z.boolean().default(true).optional(),
    publishedAt: z.coerce.date().optional(),
    seo: z
      .object({
        title: z.string(),
        description: z.string(),
        keywords: z.array(z.string()),
        ogImage: z.object({
          url: z.string(),
          public_id: z.string(),
        }),
      })
      .optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const DeleteArticleSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const GetListArticleSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    isPublished: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
    search: z.string().optional(),
  }),
});

export const GetDetailSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});
