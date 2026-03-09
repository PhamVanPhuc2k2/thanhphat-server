import z from "zod";
import { ZodEmptyObject } from "../../middlewares/validateRequest";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string(),
    parentId: z.string().nullable().optional(),
    image: z.object({
      url: z.url(),
      public_id: z.string(),
    }),
    isActive: z.boolean(),
    sortOrder: z.number().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()),
      })
      .optional(),
  }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    parentId: z.string().nullable().optional(),
    image: z
      .object({
        url: z.url(),
        public_id: z.string(),
      })
      .optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        keywords: z.array(z.string()),
      })
      .optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const deleteCategorySchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const getListSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  }),
});

export const getAllSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    isActive: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
    level: z.coerce.number().optional(),
    hasChildren: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  }),
});

export const getDetailSchema = z.object({
  body: ZodEmptyObject,
  query: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
});

export const SelectCategorySchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    parentId: z
      .string()
      .optional()
      .transform((val) => {
        if (!val || val === "null") return null;
        return val;
      })
      .default(null),
    isActive: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  }),
});
