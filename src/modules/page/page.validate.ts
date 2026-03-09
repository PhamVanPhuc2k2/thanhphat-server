import z from "zod";
import { ZodEmptyObject } from "../../middlewares/validateRequest";

export const CreatePageSchema = z.object({
  body: z.object({
    title: z.string(),
    content: z.string(),
    images: z
      .array(
        z.object({
          url: z.string(),
          public_id: z.string(),
        }),
      )
      .optional()
      .default([]),
    seo: z
      .object({
        title: z.string(),
        description: z.string(),
        keywords: z.array(z.string()),
        ogImage: z.string().optional(),
      })
      .optional(),
  }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const UpdatePageSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    images: z
      .array(
        z.object({
          url: z.string(),
          public_id: z.string(),
        }),
      )
      .optional(),
    seo: z
      .object({
        title: z.string(),
        description: z.string(),
        keywords: z.array(z.string()),
        ogImage: z.string().optional(),
      })
      .optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const DeletePageSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const GetListPageSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional(),
  }),
});

export const GetDetailPageSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});
