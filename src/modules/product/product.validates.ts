import z from "zod";
import { ZodEmptyObject } from "../../middlewares/validateRequest";

export const CreateProductSchema = z.object({
  body: z.object({
    product: z.object({
      name: z.string(),
      categoryId: z.string(),
      brandId: z.string(),
      description: z.string(),
      images: z.array(
        z.object({
          url: z.string(),
          public_id: z.string(),
        }),
      ),
      video: z
        .object({
          url: z.string(),
          public_id: z.string(),
        })
        .optional(),
      specs: z.array(
        z.object({
          key: z.string(),
          value: z.string(),
        }),
      ),
      isActive: z.boolean(),
      seo: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          keywords: z.array(z.string()).optional(),
          ogImage: z.object({
            url: z.string(),
            public_id: z.string(),
          }),
        })
        .optional(),
    }),
    variants: z.array(
      z.object({
        name: z.string(),
        sku: z.string(),
        price: z.number(),
        discountPrice: z.number(),
        stock: z.number(),
        images: z.array(
          z.object({
            url: z.string(),
            public_id: z.string(),
          }),
        ),
        isActive: z.boolean(),
      }),
    ),
  }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const UpdateProductSchema = z.object({
  body: z.object({
    product: z.object({
      name: z.string().optional(),
      categoryId: z.string().optional(),
      brandId: z.string().optional(),
      description: z.string().optional(),
      images: z
        .array(
          z.object({
            url: z.string(),
            public_id: z.string(),
          }),
        )
        .optional(),
      video: z
        .object({
          url: z.string(),
          public_id: z.string(),
        })
        .optional(),
      specs: z
        .array(
          z.object({
            key: z.string(),
            value: z.string(),
          }),
        )
        .optional(),
      isActive: z.boolean().optional(),
      seo: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          keywords: z.array(z.string()).optional(),
          ogImage: z.object({
            url: z.string(),
            public_id: z.string(),
          }),
        })
        .optional(),
    }),
    variants: z.array(
      z.object({
        name: z.string().optional(),
        sku: z.string().optional(),
        price: z.number().optional(),
        discountPrice: z.number().optional(),
        stock: z.number().optional(),
        images: z
          .array(
            z.object({
              url: z.string(),
              public_id: z.string(),
            }),
          )
          .optional(),
        isActive: z.boolean().optional(),
      }),
    ),
  }),
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const DeleteProductSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const GetProductsSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    brandId: z.string().optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
  }),
});

export const GetProductSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});
