import z from "zod";
import { ZodEmptyObject } from "../../middlewares/validateRequest";

export const CreateBannerSchema = z.object({
  body: z.object({
    title: z.string(),
    image: z.object({
      url: z.string(),
      public_id: z.string(),
    }),
    orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
    link: z.string().nullable().default(null).optional(),
    position: z.enum(["home_top", "category"]).default("home_top"),
    isActive: z.boolean(),
    categoryId: z.string().nullable().default(null),
  }),
  params: ZodEmptyObject,
  query: ZodEmptyObject,
});

export const GetBannersSchema = z.object({
  body: ZodEmptyObject,
  params: ZodEmptyObject,
  query: z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((val) => val === "true")
      .optional(),
    categoryId: z.string().optional(),
  }),
});

export const DeleteBannerSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const GetBannerSchema = z.object({
  body: ZodEmptyObject,
  params: z.object({
    id: z.string(),
  }),
  query: ZodEmptyObject,
});

export const UpdateBannerSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    image: z
      .object({
        url: z.string(),
        public_id: z.string(),
      })
      .optional(),
    orientation: z
      .enum(["horizontal", "vertical"])
      .default("horizontal")
      .optional(),
    link: z.string().nullable().default(null).optional(),
    position: z.enum(["home_top", "category"]).default("home_top").optional(),
    isActive: z.boolean().optional(),
    categoryId: z.string().nullable().default(null).optional(),
  }),
  params: z.object({ id: z.string() }),
  query: ZodEmptyObject,
});
